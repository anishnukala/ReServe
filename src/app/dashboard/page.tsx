"use client";

import { useEffect, useState } from "react";
import { ImpactStats, type ImpactData } from "@/components/dashboard/ImpactStats";
import { PageHero } from "@/components/layout/PageHero";

export default function DashboardPage() {
  const [data, setData] = useState<ImpactData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/impact")
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) throw new Error(body.error || "Unable to load impact");
        return body;
      })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load impact"));
  }, []);

  return (
    <div className="inner-page">
      <PageHero eyebrow="Impact dashboard" title={<>Every rescue <span>adds up.</span></>} description="Follow the food recovered, meals created, and local connections made through the ReServe network." image="/impact-assets/fresh-produce-3d.png" imageAlt="A wooden crate filled with fresh produce" highlights={["Live network totals", "Completed rescues", "Transparent estimates"]} tone="sage" />
      <section className="page-content"><div className="container">
        <div className="section-title section-title--row"><div><p>Network performance</p><h2>Impact in motion</h2></div><span>Delivered rescues roll into every total below.</span></div>
        {error && <p className="error">{error}</p>}
        {!data ? <div className="loading">Loading impact…</div> : <ImpactStats data={data} />}
      </div></section>
    </div>
  );
}
