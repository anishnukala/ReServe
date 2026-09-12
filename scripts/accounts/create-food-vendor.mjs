import { randomUUID } from "node:crypto";
import { stdin, stdout } from "node:process";
import { createInterface, emitKeypressEvents } from "node:readline";
import { hash } from "bcryptjs";
import { z } from "zod";
import { createMongoClient, requireMongoConfig } from "../mongodb/shared.mjs";

const schema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(254).transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(7, "Phone must contain at least 7 characters.").max(30).optional().or(z.literal("")),
  password: z.string().min(8, "Password must contain at least 8 characters.").max(128),
});

function argumentsFrom(commandLine) {
  const values = {};
  for (let index = 0; index < commandLine.length; index += 1) {
    const argument = commandLine[index];
    if (argument === "--help" || argument === "-h" || argument === "--password-stdin") values[argument.slice(2)] = true;
    else if (["--name", "--email", "--phone"].includes(argument)) values[argument.slice(2)] = commandLine[++index] ?? "";
    else throw new Error(`Unknown option: ${argument}`);
  }
  return values;
}

function question(prompt) {
  const terminal = createInterface({ input: stdin, output: stdout });
  return new Promise((resolve) => terminal.question(prompt, (answer) => { terminal.close(); resolve(answer); }));
}

function hiddenQuestion(prompt) {
  if (!stdin.isTTY) throw new Error("Use --password-stdin when input is not an interactive terminal.");
  stdout.write(prompt); emitKeypressEvents(stdin); stdin.setRawMode(true); stdin.resume();
  return new Promise((resolve, reject) => {
    let value = "";
    const finish = () => { stdin.off("keypress", onKeypress); stdin.setRawMode(false); stdin.pause(); stdout.write("\n"); };
    const onKeypress = (character, key) => {
      if (key?.ctrl && key.name === "c") { finish(); reject(new Error("Account creation cancelled.")); return; }
      if (key?.name === "return" || key?.name === "enter") { finish(); resolve(value); return; }
      if (key?.name === "backspace") { if (value) { value = value.slice(0, -1); stdout.write("\b \b"); } return; }
      if (!key?.ctrl && !key?.meta && character) { value += character; stdout.write("*"); }
    };
    stdin.on("keypress", onKeypress);
  });
}

function help() {
  console.log(`Create an active ReServe food-vendor account (role: restaurant).

Interactive:
  npm run account:create-vendor

With account fields:
  npm run account:create-vendor -- --name "Vendor Name" --email vendor@example.com --phone "555-123-4567"

Automation (password is read from standard input):
  printf '%s\\n' 'strong-password' | npm run account:create-vendor -- --name "Vendor Name" --email vendor@example.com --password-stdin

Options:
  --name VALUE
  --email VALUE
  --phone VALUE
  --password-stdin
  --help`);
}

let client;
try {
  const options = argumentsFrom(process.argv.slice(2));
  if (options.help) { help(); process.exit(0); }
  if (!stdin.isTTY && options["password-stdin"] && (!options.name || !options.email)) throw new Error("--name and --email are required with --password-stdin.");
  const name = options.name || await question("Vendor name: ");
  const email = options.email || await question("Email: ");
  const phone = options.phone ?? (stdin.isTTY ? await question("Phone (optional): ") : "");
  let password;
  if (options["password-stdin"]) password = await new Promise((resolve, reject) => { let value = ""; stdin.setEncoding("utf8"); stdin.on("data", (part) => { value += part; }); stdin.on("end", () => resolve(value.replace(/[\r\n]+$/, ""))); stdin.on("error", reject); });
  else {
    password = await hiddenQuestion("Password: ");
    const confirmation = await hiddenQuestion("Confirm password: ");
    if (password !== confirmation) throw new Error("Passwords do not match.");
  }

  const input = schema.parse({ name, email, phone, password });
  const { uri, databaseName } = requireMongoConfig();
  client = createMongoClient(uri);
  await client.connect();
  const users = client.db(databaseName).collection("users");
  if (await users.findOne({ email: input.email }, { projection: { _id: 1 } })) throw new Error(`An account already exists for ${input.email}.`);
  const now = new Date();
  const user = { _id: randomUUID(), name: input.name, email: input.email, phone: input.phone || null, passwordHash: await hash(input.password, 12), role: "restaurant", status: "ACTIVE", organizationId: null, createdAt: now, updatedAt: now };
  await users.insertOne(user);
  console.log(`Food-vendor account created for ${user.email}.`);
  console.log(`Account ID: ${user._id}`);
} catch (error) {
  if (error instanceof z.ZodError) console.error(`Unable to create account: ${error.issues[0]?.message || "Invalid input."}`);
  else if (error?.code === 11000) console.error("Unable to create account: that email address is already registered.");
  else console.error(`Unable to create account: ${error instanceof Error ? error.message : "Unknown error."}`);
  process.exitCode = 1;
} finally {
  await client?.close();
}
