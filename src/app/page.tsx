import Image from "next/image";
import ImpactShelf from "@/components/ImpactShelf";
import NationalImpact from "@/components/NationalImpact";
import RescueActions from "@/components/RescueActions";
import Link from "next/link";
import { ArrowRight, Leaf, MapPin } from "lucide-react";

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow hero-eyebrow"><Leaf aria-hidden="true" /> Smart local food rescue</div>
            <h1>Good food. Greater impact.</h1>
            <p>
              ReServe helps donors move surplus food to compatible nearby community organizations using explainable matching based on need, storage, capacity, distance, and pickup feasibility.
            </p>
            <div className="actions">
              <Link className="btn btn-primary" href="/donate">
                Donate Surplus Food
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link className="btn btn-secondary" href="/organizations">
                <MapPin aria-hidden="true" />
                Find Organizations
              </Link>
            </div>
          </div>
          <div className="hero-card">
            <Image src="/logo/reserve-logo-transparent.png" alt="ReServe brand logo" width={687} height={573} priority />
          </div>
        </div>
      </section>

      <ImpactShelf />
      <NationalImpact />
      <RescueActions />
    </div>
  );
}
