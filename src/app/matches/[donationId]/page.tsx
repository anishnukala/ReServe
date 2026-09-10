"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MatchCard } from "@/components/matching/MatchCard";
import type { Donation } from "@/types/donation";
import type { MatchResult } from "@/types/match";
import { PageHero } from "@/components/layout/PageHero";

export default function MatchesPage() {
  const params = useParams<{ donationId: string }>();
  const router = useRouter();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const stored = localStorage.getItem("reserve:lastDonation");
        const localDonation = stored ? (JSON.parse(stored) as Donation) : null;
        if (localDonation) setDonation(localDonation);

        const res = await fetch(`/api/donations/${params.donationId}/match`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ donation: localDonation }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to find matches");
        setDonation(data.donation || localDonation);
        setMatches(data.matches || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to find matches");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [params.donationId]);

  async function accept(match: MatchResult) {
    if (!donation) return;
    setAccepting(true);
    setError("");
    try {
      const res = await fetch(`/api/matches/${match.id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match, donation }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to accept match");
      localStorage.setItem("reserve:lastMatch", JSON.stringify(match));
      localStorage.setItem("reserve:lastRescue", JSON.stringify(data.rescue));
      router.push(`/rescue/${data.rescue.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to accept match");
    } finally {
      setAccepting(false);
    }
  }

  if (loading) return <div className="route-loading"><div className="route-loading__mark" /><p>Evaluating compatible organizations…</p></div>;

  return (
    <div className="inner-page">
      <PageHero eyebrow="Explainable ranking" title={<>The best fit, <span>clearly explained.</span></>} description="We filter for practical feasibility, then compare need, distance, capacity, pickup timing, and food preference." image="/impact-assets/prepared-meals-3d.png" imageAlt="Prepared meals ready for rescue" highlights={["Practical fit first", "Transparent scores", "You make the choice"]} tone="sage" />
      <section className="page-content"><div className="container">
      <div className="section-title section-title--row"><div><p>Recommended partners</p><h2>Compatible organizations</h2></div><span>Review why each organization fits before choosing where this donation goes.</span></div>
      {error && <p className="error">{error}</p>}
      {!matches.length && !error ? <div className="notice">No compatible organizations were found for this donation.</div> : null}
      <div className="match-list">
        {donation && matches.map((match, index) => (
          <MatchCard key={match.id} match={match} donation={donation} best={index === 0} onAccept={accept} accepting={accepting} />
        ))}
      </div>
      </div></section>
    </div>
  );
}
