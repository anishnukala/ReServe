"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Donation } from "@/types/donation";
import type { MatchResult } from "@/types/match";
import type { Rescue } from "@/types/rescue";
import { RescueTimeline } from "@/components/rescue/RescueTimeline";

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

  if (!rescue) return <div className="container loading">Loading rescue…</div>;

  return (
    <div className="container">
      <div className="page-head">
        <div className="eyebrow">Rescue #{rescue.id}</div>
        <h1>Track the rescue.</h1>
        <p>{donation ? `${donation.quantityLbs} lbs of ${donation.foodName}` : "Donation"}{match ? ` → ${match.recipient.name}` : ""}</p>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="card"><strong>Quantity</strong><div className="stat">{rescue.quantityRescued} lbs</div></div>
        <div className="card"><strong>Status</strong><div className="stat" style={{ fontSize: "1.35rem" }}>{rescue.status.replaceAll("_", " ")}</div></div>
        <div className="card"><strong>Estimated meals</strong><div className="stat">{Math.round(rescue.quantityRescued / 1.2)}</div><div className="small muted">Prototype estimate</div></div>
      </div>

      <div className="card" style={{ marginBottom: 70 }}>
        <h2>Rescue timeline</h2>
        <RescueTimeline status={rescue.status} />
        {error && <p className="error">{error}</p>}
        <div className="actions">
          {rescue.status === "ACCEPTED" && <button className="btn btn-primary" disabled={busy} onClick={() => update("pickup")}>Mark Picked Up</button>}
          {rescue.status === "PICKED_UP" && <button className="btn btn-primary" disabled={busy} onClick={() => update("deliver")}>Mark Delivered</button>}
          {rescue.status === "DELIVERED" && <div className="success">Rescue completed. The impact dashboard can now count this donation.</div>}
        </div>
      </div>
    </div>
  );
}
