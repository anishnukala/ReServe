"use client";

import { Check } from "lucide-react";

const steps = ["ACCEPTED", "PICKED_UP", "DELIVERED"] as const;

export function RescueTimeline({ status }: { status: string }) {
  const currentIndex = steps.indexOf(status as (typeof steps)[number]);
  return (
    <div className="timeline">
      {steps.map((step, index) => {
        const done = index <= currentIndex;
        return (
          <div className={`timeline-step ${done ? "done" : ""}`} key={step}>
            <div className="timeline-dot">{done ? <Check size={16} /> : index + 1}</div>
            <div>
              <strong>{step.replaceAll("_", " ")}</strong>
              <div className="small muted">
                {step === "ACCEPTED" && "Recipient accepted the rescue."}
                {step === "PICKED_UP" && "Food has left the donor location."}
                {step === "DELIVERED" && "Recipient received the donation."}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
