"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const search = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "restaurant" });
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(mode === "login" ? { email: form.email, password: form.password } : form) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Authentication failed");
      const destination = search.get("next") || (body.user.role === "food_org" ? "/organization" : "/donate");
      router.push(destination); router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Authentication failed"); }
    finally { setBusy(false); }
  }
  return <form className="auth-card" onSubmit={submit}>
    {mode === "signup" && <><div className="field"><label>Name</label><input required value={form.name} onChange={(e) => set("name", e.target.value)} /></div><div className="field"><label>Phone <em>Optional</em></label><input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div></>}
    <div className="field"><label>Email</label><input required type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
    <div className="field"><label>Password</label><input required minLength={mode === "signup" ? 8 : 1} type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={form.password} onChange={(e) => set("password", e.target.value)} /></div>
    {mode === "signup" && <div className="field"><label>Account type</label><select value={form.role} onChange={(e) => set("role", e.target.value)}><option value="restaurant">Food donor / restaurant</option><option value="food_org">Food organization</option></select></div>}
    {error && <p className="error">{error}</p>}
    <button className="btn btn-primary" disabled={busy}>{busy && <Loader2 className="spin" />}{mode === "login" ? "Log in" : "Create account"}</button>
  </form>;
}
