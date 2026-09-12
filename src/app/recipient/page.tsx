"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import type { Donation } from "@/types/donation";

export default function RecipientPage() {
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function respond(donation: Donation, action: "accept" | "decline") {
    if (!donation.selectedMatchId) return;
    setBusy(donation.id); setError("");
    try { const response = await fetch(`/api/matches/${donation.selectedMatchId}/respond`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error || "Unable to respond"); if (action === "accept") { localStorage.setItem("reserve:lastDonation", JSON.stringify(body.donation)); localStorage.setItem("reserve:lastRescue", JSON.stringify(body.rescue)); router.push(`/rescue/${body.rescue.id}`); } else setDonations((current) => current.filter((item) => item.id !== donation.id)); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to respond"); } finally { setBusy(""); }
  }

  useEffect(() => {
    fetch("/api/donations")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to load donations");
        return body.donations as Donation[];
      })
      .then(setDonations)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load donations"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="inner-page">
      <PageHero eyebrow="Recipient workspace" title={<>A clearer <span>donation inbox.</span></>} description="Review compatible donations, confirm your capacity, and coordinate food pickups your organization can safely handle." image="/impact-assets/get-help-action.png" imageAlt="A community support illustration" highlights={["Capacity first", "Pickup deadlines", "Clear food details"]} tone="orange" />
      <section className="page-content"><div className="container">
      <div className="section-title section-title--row"><div><p>Available now</p><h2>Compatible donations</h2></div><span>Food matched to the needs and storage capacity of your organization.</span></div>
      {error && <p className="error">{error}</p>}
      <div className="recipient-table-card table-wrap">
        <table>
          <thead><tr><th>Food</th><th>Quantity</th><th>Storage</th><th>Deadline</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {donations.map((donation) => (
              <tr key={donation.id}>
                <td><strong>{donation.foodName}</strong></td>
                <td>{donation.quantityLbs.toLocaleString()} lbs</td>
                <td>{donation.storageType.replaceAll("_", " ")}</td>
                <td>{new Date(donation.pickupDeadline).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</td>
                <td><span className={`status-badge status-badge--${donation.status.toLowerCase()}`}>{donation.status.replaceAll("_", " ")}</span></td><td>{donation.status === "MATCHED" && donation.selectedMatchId ? <div className="table-actions"><button className="btn btn-primary" disabled={busy === donation.id} onClick={() => respond(donation, "accept")}>Accept</button><button className="btn btn-outline" disabled={busy === donation.id} onClick={() => respond(donation, "decline")}>Decline</button></div> : "—"}</td>
              </tr>
            ))}
            {!loading && !error && donations.length === 0 && <tr><td colSpan={6}>No active donations are available.</td></tr>}
            {loading && <tr><td colSpan={6}>Loading donations…</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="content-actions"><Link className="btn btn-primary" href="/organizations">Explore local organizations <ArrowRight /></Link></div>
      </div></section>
    </div>
  );
}
