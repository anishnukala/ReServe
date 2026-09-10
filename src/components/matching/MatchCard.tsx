"use client";

import type { Donation } from "@/types/donation";
import type { MatchResult } from "@/types/match";
import { CheckCircle2, MapPin } from "lucide-react";

export function MatchCard({ match, best, donation, onAccept, accepting }: { match: MatchResult; best?: boolean; donation: Donation; onAccept: (match: MatchResult) => void; accepting?: boolean }) {
  return (
    <article className={`match-card ${best ? "best" : ""}`}>
      <div>
        {best && <div className="eyebrow">Best match</div>}
        <h2 style={{ marginBottom: 5 }}>{match.recipient.name}</h2>
        <div className="muted"><MapPin size={15} style={{ verticalAlign: "text-bottom" }} /> {match.distanceMiles} miles · {match.recipient.address}</div>
        <div className="reason-list">
          {match.reasons.map((reason) => <span className="pill" key={reason}><CheckCircle2 size={13} style={{ verticalAlign: "text-bottom" }} /> {reason}</span>)}
        </div>
        <p className="muted">{match.explanation}</p>
        <details>
          <summary style={{ cursor: "pointer", fontWeight: 800, color: "var(--forest)" }}>Score breakdown</summary>
          <div className="table-wrap" style={{ marginTop: 10 }}>
            <table>
              <tbody>
                <tr><td>Need</td><td>{match.breakdown.needScore}</td><td>30%</td></tr>
                <tr><td>Pickup feasibility</td><td>{match.breakdown.pickupScore}</td><td>25%</td></tr>
                <tr><td>Distance</td><td>{match.breakdown.distanceScore}</td><td>20%</td></tr>
                <tr><td>Capacity</td><td>{match.breakdown.capacityScore}</td><td>15%</td></tr>
                <tr><td>Food preference</td><td>{match.breakdown.foodScore}</td><td>10%</td></tr>
              </tbody>
            </table>
          </div>
        </details>
        <div className="actions">
          <button className="btn btn-primary" onClick={() => onAccept(match)} disabled={accepting}>Select Organization</button>
        </div>
        <p className="small muted">Donation: {donation.quantityLbs} lbs of {donation.foodName}</p>
      </div>
      <div className="match-score" aria-label={`${match.finalScore} percent match`}>{Math.round(match.finalScore)}%</div>
    </article>
  );
}
