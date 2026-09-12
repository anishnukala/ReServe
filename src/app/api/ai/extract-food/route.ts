import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";

const schema = z.object({ description: z.string().min(3).max(1000) });

function fallback(description: string) {
  const qty = description.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|pounds?)/i);
  const lower = description.toLowerCase();
  return {
    foodName: description.trim().slice(0, 80),
    foodCategory: lower.includes("produce") || lower.includes("vegetable") || lower.includes("fruit") ? "produce" : "prepared_food",
    quantityLbs: qty ? Number(qty[1]) : null,
    storageType: lower.includes("refrigerat") ? "refrigerated" : lower.includes("frozen") ? "frozen" : null,
    dietaryTags: ["vegetarian", "vegan", "halal", "kosher"].filter((tag) => lower.includes(tag)),
  };
}

export async function POST(request: Request) {
  try {
    const { description } = schema.parse(await request.json());
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ result: fallback(description), source: "fallback" });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: `Extract only facts explicitly present in this donor description. Never infer expiration, allergens, temperature, food safety, or whether the food is safe. Return ONLY JSON with keys foodName, foodCategory, quantityLbs, storageType, dietaryTags. Description: ${description}`,
    });

    let result;
    try {
      result = JSON.parse(response.output_text);
    } catch {
      result = fallback(description);
    }
    return NextResponse.json({ result, source: "openai" });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid description." }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "Unable to extract food details." }, { status: 500 });
  }
}
