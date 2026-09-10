"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MatchCard } from "@/components/matching/MatchCard";
import type { Donation } from "@/types/donation";
import type { MatchResult } from "@/types/match";

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

  if (loading) return <div className="container loading">Evaluating compatible organizations…</div>;

  return (
    <div className="container">
      <div className="page-head">
        <div className="eyebrow">Explainable ranking</div>
        <h1>Best matches.</h1>
        <p>ReServe first removes infeasible recipients, then ranks the remaining organizations by need, pickup feasibility, distance, capacity, and food preference.</p>
      </div>
      {error && <p className="error">{error}</p>}
      {!matches.length && !error ? <div className="notice">No compatible organizations were found for this donation.</div> : null}
      <div className="match-list">
        {donation && matches.map((match, index) => (
          <MatchCard key={match.id} match={match} donation={donation} best={index === 0} onAccept={accept} accepting={accepting} />
        ))}
      </div>
    </div>
  );
}
