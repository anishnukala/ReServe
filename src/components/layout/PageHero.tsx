import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt = "",
  highlights = [],
  tone = "green",
  compact = false,
}: {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  image?: string;
  imageAlt?: string;
  highlights?: string[];
  tone?: "green" | "orange" | "sage";
  compact?: boolean;
}) {
  return (
    <section className={`page-hero page-hero--${tone}${compact ? " page-hero--compact" : ""}`}>
      <div className={`container page-hero__grid${image ? "" : " page-hero__grid--text"}`}>
        <div className="page-hero__copy">
          <p className="page-hero__eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="page-hero__description">{description}</p>
          {highlights.length > 0 && (
            <div className="page-hero__highlights">
              {highlights.map((highlight) => (
                <span key={highlight}><CheckCircle2 aria-hidden="true" />{highlight}</span>
              ))}
            </div>
          )}
        </div>
        {image && (
          <div className="page-hero__visual">
            <div className="page-hero__halo" />
            <Image src={image} alt={imageAlt} width={1254} height={1254} priority className="page-hero__image" />
          </div>
        )}
      </div>
    </section>
  );
}
