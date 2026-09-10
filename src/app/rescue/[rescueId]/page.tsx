"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Donation } from "@/types/donation";
import type { MatchResult } from "@/types/match";
import type { Rescue } from "@/types/rescue";
import { RescueTimeline } from "@/components/rescue/RescueTimeline";
import { PageHero } from "@/components/layout/PageHero";
import { Clock3, PackageCheck, Utensils } from "lucide-react";

export default function RescuePage() {
  const params = useParams<{ rescueId: string }>();
  const [rescue, setRescue] = useState<Rescue | null>(null);
  const [donation, setDonation] = useState<Donation | null>(null);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedRescue = localStorage.getItem("reserve:lastRescue");
    const storedDonation = localStorage.getItem("reserve:lastDonation");
    const storedMatch = localStorage.getItem("reserve:lastMatch");
    if (storedRescue) setRescue(JSON.parse(storedRescue));
    if (storedDonation) setDonation(JSON.parse(storedDonation));
    if (storedMatch) setMatch(JSON.parse(storedMatch));
  }, []);

  async function update(action: "pickup" | "deliver") {
    if (!rescue) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/rescues/${params.rescueId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rescue, donation }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Unable to mark ${action}`);
      setRescue(data.rescue);
      localStorage.setItem("reserve:lastRescue", JSON.stringify(data.rescue));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update rescue");
    } finally {
      setBusy(false);
    }
  }

  if (!rescue) return <div className="route-loading"><div className="route-loading__mark" /><p>Loading rescue…</p></div>;

  return (
    <div className="inner-page">
      <PageHero eyebrow={`Rescue #${rescue.id}`} title={<>Track every <span>handoff.</span></>} description={<>{donation ? `${donation.quantityLbs} lbs of ${donation.foodName}` : "Donation"}{match ? ` is headed to ${match.recipient.name}.` : " is ready to move."}</>} image="/impact-assets/artisan-bread-3d.png" imageAlt="A basket of artisan bread" highlights={["Live status", "Shared accountability", "Impact recorded"]} tone="orange" />
      <section className="page-content"><div className="container">
      <div className="rescue-stats">
        <article><PackageCheck /><span>Quantity</span><strong>{rescue.quantityRescued} lbs</strong></article>
        <article><Clock3 /><span>Current status</span><strong>{rescue.status.replaceAll("_", " ")}</strong></article>
        <article><Utensils /><span>Estimated meals</span><strong>{Math.round(rescue.quantityRescued / 1.2)}</strong></article>
      </div>

      <div className="timeline-card">
        <div className="section-title"><p>Live progress</p><h2>Rescue timeline</h2></div>
        <RescueTimeline status={rescue.status} />
        {error && <p className="error">{error}</p>}
        <div className="actions">
          {rescue.status === "ACCEPTED" && <button className="btn btn-primary" disabled={busy} onClick={() => update("pickup")}>Mark Picked Up</button>}
          {rescue.status === "PICKED_UP" && <button className="btn btn-primary" disabled={busy} onClick={() => update("deliver")}>Mark Delivered</button>}
          {rescue.status === "DELIVERED" && <div className="success">Rescue completed. The impact dashboard can now count this donation.</div>}
        </div>
      </div>
      </div></section>
    </div>
  );
}
