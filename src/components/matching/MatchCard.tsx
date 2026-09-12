"use client";

import type { Donation } from "@/types/donation";
import type { AiSearchMatch } from "@/types/match";
import { CheckCircle2, MapPin } from "lucide-react";

export function MatchCard({ match, best, donation, onAccept, accepting }: { match: AiSearchMatch; best?: boolean; donation: Donation; onAccept: (match: AiSearchMatch) => void; accepting?: boolean }) {
  return (
    <article className={`match-card ${best ? "best" : ""}`}>
      <div className="match-card__body">
        {best && <div className="eyebrow">Best match</div>}
        <h2>{match.recipient.name}</h2>
        <div className="match-location"><MapPin size={15} /> {match.distanceMiles} miles · {match.recipient.address}</div>
        {match.urgency !== undefined && <div className="match-facts"><span>Current need <strong>{match.urgency}/100</strong></span><span>Available capacity <strong>{match.availableCapacity} lbs</strong></span><span>AI similarity <strong>{Math.round((match.aiSimilarity || 0) * 100)}%</strong></span></div>}
        <div className="reason-list">
          {match.reasons.map((reason) => <span className="pill" key={reason}><CheckCircle2 size={13} style={{ verticalAlign: "text-bottom" }} /> {reason}</span>)}
        </div>
        <p className="muted">{match.explanation}</p>
        <details>
          <summary>Score breakdown</summary>
          <div className="table-wrap score-table">
            <table>
              <tbody>
                <tr><td>AI similarity</td><td>{match.breakdown.aiScore ?? 0}</td><td>20%</td></tr>
                <tr><td>Need / urgency</td><td>{match.breakdown.needScore}</td><td>25%</td></tr>
                <tr><td>Food preference</td><td>{match.breakdown.foodScore}</td><td>15%</td></tr>
                <tr><td>Pickup feasibility</td><td>{match.breakdown.pickupScore}</td><td>15%</td></tr>
                <tr><td>Distance</td><td>{match.breakdown.distanceScore}</td><td>10%</td></tr>
                <tr><td>Capacity</td><td>{match.breakdown.capacityScore}</td><td>10%</td></tr>
                <tr><td>Rating / verification</td><td>{match.breakdown.organizationScore ?? 0}</td><td>5%</td></tr>
              </tbody>
            </table>
          </div>
        </details>
        <div className="actions">
          <button className="btn btn-primary" onClick={() => onAccept(match)} disabled={accepting}>Request this organization</button>
        </div>
        <p className="small muted">Donation: {donation.quantityLbs} lbs of {donation.foodName}</p>
      </div>
      <div className="match-score-wrap"><span>Match score</span><div className="match-score" style={{ "--score": `${Math.round(match.finalScore) * 3.6}deg` } as React.CSSProperties} aria-label={`${match.finalScore} percent match`}><i>{Math.round(match.finalScore)}%</i></div></div>
    </article>
  );
}
