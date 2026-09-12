"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowRight, CalendarClock, Loader2, LocateFixed, MapPin, PackageOpen, ShieldCheck } from "lucide-react";

const LocationPickerMap = dynamic(() => import("@/components/maps/LocationPickerMap"), { ssr: false, loading: () => <div className="map-loading">Loading map…</div> });

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
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");
  const [form, setForm] = useState({
    foodName: "",
    foodCategory: "prepared_food",
    quantityLbs: "",
    storageType: "refrigerated",
    allergens: "",
    dietaryTags: "",
    preparedAt: "",
    pickupDeadline: defaultDeadline(),
    latitude: "",
    longitude: "",
    address: "",
    searchRadiusMiles: "10",
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
      (locationError) => setError(locationError.code === 1 ? "Location permission was denied. You can enter coordinates manually." : locationError.code === 2 ? "Your location is unavailable. Enter coordinates or try again." : "Location request timed out. Enter coordinates or try again."),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
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
        description,
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
        address: form.address || null,
        searchRadiusMiles: Number(form.searchRadiusMiles),
        donorSafetyConfirmed: form.donorSafetyConfirmed,
      };

      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.status === 401) { router.push("/login?next=/donate"); return; }
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
    <form className="donation-form" onSubmit={submit}>
      <div className="donation-form__topbar">
        <div><span>New donation</span><strong>Food rescue details</strong></div>
        <ol aria-label="Donation form progress"><li className="active">Food</li><li>Pickup</li><li>Confirm</li></ol>
      </div>

      <div className="donation-form__notice"><ShieldCheck aria-hidden="true" /><p><strong>You stay in control of safety.</strong> AI can organize your description, while allergens, storage, handling, and pickup details must be verified by you.</p></div>

      <section className="donation-form__section">
        <div className="form-section-intro"><span><PackageOpen /></span><div><p>Summary</p><h3>Describe the donation</h3><small>This description helps the local semantic model compare your food with current organization needs.</small></div></div>
        <div className="form-section-fields">
          <div className="field field-full"><label htmlFor="description">Food description <b>*</b></label><textarea id="description" required minLength={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the food, packaging, and relevant dietary details without making safety claims." /></div>
        </div>
      </section>

      <section className="donation-form__section">
        <div className="form-section-intro"><span><PackageOpen /></span><div><p>Step 01</p><h3>Food details</h3><small>Help recipients quickly understand what is available.</small></div></div>
        <div className="form-section-fields form-grid">
          <div className="field field-full"><label htmlFor="foodName">Food name <b>*</b></label><input id="foodName" required value={form.foodName} onChange={(e) => setField("foodName", e.target.value)} /></div>
          <div className="field"><label htmlFor="category">Category</label><select id="category" value={form.foodCategory} onChange={(e) => setField("foodCategory", e.target.value)}><option value="prepared_food">Prepared food</option><option value="produce">Produce</option><option value="bakery">Bakery</option><option value="packaged_food">Packaged food</option></select></div>
          <div className="field"><label htmlFor="quantity">Quantity <span>lbs</span></label><input id="quantity" required min="0.1" step="0.1" type="number" value={form.quantityLbs} onChange={(e) => setField("quantityLbs", e.target.value)} /></div>
          <div className="field"><label htmlFor="storage">Storage</label><select id="storage" value={form.storageType} onChange={(e) => setField("storageType", e.target.value)}><option value="ambient">Ambient</option><option value="refrigerated">Refrigerated</option><option value="frozen">Frozen</option></select></div>
          <div className="field"><label htmlFor="allergens">Allergens</label><input id="allergens" value={form.allergens} onChange={(e) => setField("allergens", e.target.value)} placeholder="wheat, dairy, peanuts" /></div>
          <div className="field field-full"><label htmlFor="tags">Dietary tags <em>Comma separated</em></label><input id="tags" value={form.dietaryTags} onChange={(e) => setField("dietaryTags", e.target.value)} placeholder="vegetarian, vegan, halal" /></div>
        </div>
      </section>

      <section className="donation-form__section">
        <div className="form-section-intro"><span><CalendarClock /></span><div><p>Step 02</p><h3>Pickup window</h3><small>Timing and location help us find a practical nearby match.</small></div></div>
        <div className="form-section-fields form-grid">
          <div className="field"><label htmlFor="preparedAt">Prepared or packaged</label><input id="preparedAt" type="datetime-local" value={form.preparedAt} onChange={(e) => setField("preparedAt", e.target.value)} /></div>
          <div className="field"><label htmlFor="deadline">Pickup deadline <b>*</b></label><input id="deadline" required type="datetime-local" value={form.pickupDeadline} onChange={(e) => setField("pickupDeadline", e.target.value)} /></div>
          <div className="field"><label htmlFor="lat">Latitude</label><input id="lat" required type="number" step="any" value={form.latitude} onChange={(e) => setField("latitude", e.target.value)} /></div>
          <div className="field"><label htmlFor="lng">Longitude</label><input id="lng" required type="number" step="any" value={form.longitude} onChange={(e) => setField("longitude", e.target.value)} /></div>
          <div className="field"><label htmlFor="address">Pickup address <em>Optional</em></label><input id="address" value={form.address} onChange={(e) => setField("address", e.target.value)} /></div>
          <div className="field"><label htmlFor="radius">Search radius</label><select id="radius" value={form.searchRadiusMiles} onChange={(e) => setField("searchRadiusMiles", e.target.value)}>{[5,10,15,25].map((miles) => <option key={miles} value={miles}>{miles} miles</option>)}</select></div>
          <div className="location-action field-full"><MapPin /><span>Use your precise pickup point for better nearby matches.</span><button className="btn btn-outline" type="button" onClick={useMyLocation}><LocateFixed /> Use my location</button></div>
          {form.latitude && form.longitude && <div className="field-full"><LocationPickerMap latitude={Number(form.latitude)} longitude={Number(form.longitude)} radiusMiles={Number(form.searchRadiusMiles)} onChange={(latitude, longitude) => setForm((current) => ({ ...current, latitude: latitude.toFixed(6), longitude: longitude.toFixed(6) }))} /><small className="map-help">Drag the pin or click the map to adjust the pickup point.</small></div>}
        </div>
      </section>

      <section className="donation-form__section donation-form__section--confirm">
        <div className="form-section-intro"><span><ShieldCheck /></span><div><p>Step 03</p><h3>Confirm details</h3><small>Review the information before ReServe evaluates matches.</small></div></div>
        <div className="form-section-fields"><label className="checkbox confirmation"><input type="checkbox" checked={form.donorSafetyConfirmed} onChange={(e) => setField("donorSafetyConfirmed", e.target.checked)} /><span><strong>I confirm these details are accurate.</strong> Safety-critical decisions remain with the donor and receiving organization.</span></label></div>
      </section>

      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="donation-form__footer"><p><strong>Ready to find a partner?</strong><span>We will rank compatible organizations and explain why they fit.</span></p><button className="btn btn-primary" type="submit" disabled={loading}>{loading ? <Loader2 className="spin" /> : null} Find Best Match <ArrowRight /></button></div>
    </form>
  );
}
