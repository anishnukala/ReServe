"use client";

import { useEffect, useState } from "react";
import { ImpactStats, type ImpactData } from "@/components/dashboard/ImpactStats";

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
    <div className="container">
      <div className="page-head">
        <div className="eyebrow">Impact</div>
        <h1>Every rescue counts.</h1>
        <p>Delivered rescues roll into food recovered, estimated meals, and rescue counts. Demo mode uses clearly labeled prototype numbers.</p>
      </div>
      {error && <p className="error">{error}</p>}
      {!data ? <div className="loading">Loading impact…</div> : <>
        {data.demo && <div className="notice" style={{ marginBottom: 18 }}>Prototype simulation: these values are demo data, not real operating metrics.</div>}
        <ImpactStats data={data} />
      </>}
      <div style={{ height: 70 }} />
    </div>
  );
}
