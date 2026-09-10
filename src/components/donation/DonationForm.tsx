"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LocateFixed, Sparkles } from "lucide-react";

const defaultDeadline = () => {
  const now = new Date();
  const d = new Date(now);
  d.setHours(19, 30, 0, 0);
  if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 1);
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function DonationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");
  const [form, setForm] = useState({
    foodName: "Vegetarian pasta",
    foodCategory: "prepared_food",
    quantityLbs: "35",
    storageType: "refrigerated",
    allergens: "wheat, dairy",
    dietaryTags: "vegetarian",
    preparedAt: "",
    pickupDeadline: defaultDeadline(),
    latitude: "42.0266",
    longitude: "-93.6465",
    donorSafetyConfirmed: false,
  });

  const setField = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function useMyLocation() {
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setField("latitude", String(position.coords.latitude));
        setField("longitude", String(position.coords.longitude));
      },
      () => setError("Location permission was denied. You can enter coordinates manually."),
    );
  }

  async function extractWithAI() {
    if (!description.trim()) return;
    setAiLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/extract-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI extraction failed");

      if (typeof data.result === "object" && data.result) {
        const result = data.result as Record<string, unknown>;
        if (typeof result.foodName === "string") setField("foodName", result.foodName);
        if (typeof result.foodCategory === "string") setField("foodCategory", result.foodCategory);
        if (typeof result.quantityLbs === "number") setField("quantityLbs", String(result.quantityLbs));
        if (typeof result.storageType === "string" && ["ambient", "refrigerated", "frozen"].includes(result.storageType)) {
          setField("storageType", result.storageType);
        }
        if (Array.isArray(result.dietaryTags)) setField("dietaryTags", result.dietaryTags.join(", "));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI extraction failed");
    } finally {
      setAiLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.donorSafetyConfirmed) {
      setError("Confirm the donor safety statement before continuing.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        foodName: form.foodName,
        foodCategory: form.foodCategory,
        quantityLbs: Number(form.quantityLbs),
        storageType: form.storageType,
        allergens: form.allergens.split(",").map((v) => v.trim()).filter(Boolean),
        dietaryTags: form.dietaryTags.split(",").map((v) => v.trim()).filter(Boolean),
        preparedAt: form.preparedAt ? new Date(form.preparedAt).toISOString() : null,
        pickupDeadline: new Date(form.pickupDeadline).toISOString(),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        donorSafetyConfirmed: form.donorSafetyConfirmed,
      };

      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to create donation");

      localStorage.setItem("reserve:lastDonation", JSON.stringify(data.donation));
      router.push(`/matches/${data.donation.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create donation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-card donation-form" onSubmit={submit}>
      <div className="notice form-notice">
        AI may help structure a description, but it must not determine whether food is safe. Verify allergens, handling, storage, and pickup details yourself.
      </div>

      <div className="field field-full ai-assist">
        <label htmlFor="description">Optional AI-assisted description</label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Example: We have about 6 trays of vegetarian pasta, refrigerated, roughly 35 pounds." />
        <button className="btn btn-secondary" type="button" onClick={extractWithAI} disabled={aiLoading}>
          {aiLoading ? <Loader2 className="spin" size={17} /> : <Sparkles size={17} />} Structure description
        </button>
      </div>

      <div className="form-grid">
        <div className="field field-full">
          <label htmlFor="foodName">Food name</label>
          <input id="foodName" required value={form.foodName} onChange={(e) => setField("foodName", e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="category">Food category</label>
          <select id="category" value={form.foodCategory} onChange={(e) => setField("foodCategory", e.target.value)}>
            <option value="prepared_food">Prepared food</option>
            <option value="produce">Produce</option>
            <option value="bakery">Bakery</option>
            <option value="packaged_food">Packaged food</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="quantity">Quantity (lbs)</label>
          <input id="quantity" required min="0.1" step="0.1" type="number" value={form.quantityLbs} onChange={(e) => setField("quantityLbs", e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="storage">Storage type</label>
          <select id="storage" value={form.storageType} onChange={(e) => setField("storageType", e.target.value)}>
            <option value="ambient">Ambient</option>
            <option value="refrigerated">Refrigerated</option>
            <option value="frozen">Frozen</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="preparedAt">Prepared / packaged time</label>
          <input id="preparedAt" type="datetime-local" value={form.preparedAt} onChange={(e) => setField("preparedAt", e.target.value)} />
        </div>

        <div className="field field-full">
          <label htmlFor="deadline">Pickup deadline</label>
          <input id="deadline" required type="datetime-local" value={form.pickupDeadline} onChange={(e) => setField("pickupDeadline", e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="allergens">Allergens</label>
          <input id="allergens" value={form.allergens} onChange={(e) => setField("allergens", e.target.value)} placeholder="wheat, dairy, peanuts" />
        </div>

        <div className="field">
          <label htmlFor="tags">Dietary tags</label>
          <input id="tags" value={form.dietaryTags} onChange={(e) => setField("dietaryTags", e.target.value)} placeholder="vegetarian, vegan, halal" />
        </div>

        <div className="field">
          <label htmlFor="lat">Latitude</label>
          <input id="lat" required type="number" step="any" value={form.latitude} onChange={(e) => setField("latitude", e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="lng">Longitude</label>
          <input id="lng" required type="number" step="any" value={form.longitude} onChange={(e) => setField("longitude", e.target.value)} />
        </div>

        <div className="field field-full">
          <button className="btn btn-outline" type="button" onClick={useMyLocation}><LocateFixed size={17} /> Use my location</button>
        </div>

        <div className="field field-full">
          <label className="checkbox">
            <input type="checkbox" checked={form.donorSafetyConfirmed} onChange={(e) => setField("donorSafetyConfirmed", e.target.checked)} />
            <span>I confirm that the information I entered is accurate and that safety-critical details are not being delegated to the matching or AI system.</span>
          </label>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="actions">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? <Loader2 className="spin" size={18} /> : null} Find Best Match
        </button>
      </div>
    </form>
  );
}
