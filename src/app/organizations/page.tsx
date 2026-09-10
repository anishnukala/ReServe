"use client";

import { useState } from "react";
import { LocateFixed, Search } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";

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
    <div className="inner-page">
      <PageHero eyebrow="Find local support" title={<>Help is closer than <span>you think.</span></>} description="Discover food banks, pantries, shelters, and community organizations nearby. Search by need and location to find the right connection." image="/impact-assets/get-help-action.png" imageAlt="Hands joining around a heart and a community center" highlights={["Nearby results", "Trusted map links", "Community focused"]} tone="orange" />
      <section className="page-content"><div className="container">
        <div className="section-title"><p>Organization finder</p><h2>Search your community</h2><span>Enter an organization type and location to begin.</span></div>
      <form className="form-card organization-search" onSubmit={search}>
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

      {source === "demo" && <div className="notice notice--compact">Google API key is not configured, so this page is showing demo organizations.</div>}
      <div className="organization-results">
        {places.map((place) => (
          <article className="google-result" key={place.id}>
            <span className="result-marker"><LocateFixed aria-hidden="true" /></span>
            <h3>{place.displayName?.text || "Organization"}</h3>
            <div className="muted">{place.formattedAddress || "Address unavailable"}</div>
            {place.googleMapsUri && <a className="btn btn-secondary" href={place.googleMapsUri} target="_blank" rel="noreferrer">View in Google Maps</a>}
            <div className="small muted">Place ID: {place.id}</div>
          </article>
        ))}
      </div>
      {source === "google" && <div className="powered">Places information provided by Google. Display and storage of Google Maps Platform content must follow Google's current terms.</div>}
      </div></section>
    </div>
  );
}
