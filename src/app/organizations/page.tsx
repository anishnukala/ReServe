"use client";

import { useState } from "react";
import { LocateFixed, Search } from "lucide-react";

type Place = {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  googleMapsUri?: string;
  location?: { latitude: number; longitude: number };
};

export default function OrganizationsPage() {
  const [query, setQuery] = useState("food bank");
  const [lat, setLat] = useState("42.0266");
  const [lng, setLng] = useState("-93.6465");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState<"google" | "demo" | "">("");

  function locate() {
    setError("");
    navigator.geolocation?.getCurrentPosition(
      (p) => { setLat(String(p.coords.latitude)); setLng(String(p.coords.longitude)); },
      () => setError("Could not access your location."),
    );
  }

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/places/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, latitude: Number(lat), longitude: Number(lng), radiusMeters: 16093 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setPlaces(data.places || []);
      setSource(data.source || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="page-head">
        <div className="eyebrow">Location discovery</div>
        <h1>Find nearby organizations.</h1>
        <p>Use the official Places API to discover nearby organizations. ReServe-specific fields such as capacity, accepted foods, storage, and current need should be maintained separately.</p>
      </div>

      <form className="form-card" onSubmit={search} style={{ marginBottom: 24 }}>
        <div className="form-grid">
          <div className="field field-full"><label>Search</label><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="food bank, food pantry, shelter" /></div>
          <div className="field"><label>Latitude</label><input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} /></div>
          <div className="field"><label>Longitude</label><input type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} /></div>
        </div>
        <div className="actions">
          <button className="btn btn-outline" type="button" onClick={locate}><LocateFixed size={17} /> Use my location</button>
          <button className="btn btn-primary" type="submit" disabled={loading}><Search size={17} /> {loading ? "Searching…" : "Search"}</button>
        </div>
        {error && <p className="error">{error}</p>}
      </form>

      {source === "demo" && <div className="notice" style={{ marginBottom: 18 }}>Google API key is not configured, so this page is showing demo organizations.</div>}
      <div className="grid-3" style={{ marginBottom: 15 }}>
        {places.map((place) => (
          <div className="card google-result" key={place.id}>
            <h3>{place.displayName?.text || "Organization"}</h3>
            <div className="muted">{place.formattedAddress || "Address unavailable"}</div>
            {place.googleMapsUri && <a className="btn btn-secondary" href={place.googleMapsUri} target="_blank" rel="noreferrer">View in Google Maps</a>}
            <div className="small muted">Place ID: {place.id}</div>
          </div>
        ))}
      </div>
      {source === "google" && <div className="powered">Places information provided by Google. Display and storage of Google Maps Platform content must follow Google's current terms.</div>}
      <div style={{ height: 70 }} />
    </div>
  );
}
