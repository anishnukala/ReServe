import { Clock3, Refrigerator, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";

export default function FoodSafetyPage() {
  const responsibilities = [
    { icon: Clock3, step: "01", title: "Donor confirms", text: "Provide accurate allergens, preparation time, storage conditions, packaging details, and a realistic pickup deadline." },
    { icon: Refrigerator, step: "02", title: "ReServe matches", text: "We compare food type, cold storage, capacity, distance, availability, and pickup feasibility." },
    { icon: ShieldCheck, step: "03", title: "Recipient inspects", text: "The receiving organization decides whether to accept the food and follows its own inspection and handling requirements." },
  ];
  return (
    <div className="inner-page">
      <PageHero eyebrow="Safety & traceability" title={<>Safe food, <span>shared responsibly.</span></>} description="Every rescue depends on accurate information, appropriate storage, and careful handling from donor to recipient." image="/impact-assets/pantry-staples-3d.png" imageAlt="A box filled with pantry staples" highlights={["Clear responsibilities", "Storage aware", "Traceable handoff"]} tone="sage" />
      <section className="page-content"><div className="container">
        <div className="section-title"><p>Shared responsibility</p><h2>Three checks in every rescue</h2><span>ReServe coordinates and ranks donations. Each participant remains responsible for safe handling and compliance.</span></div>
        <div className="responsibility-grid">{responsibilities.map(({ icon: Icon, step, title, text }) => <article className="responsibility-card" key={title}><div className="responsibility-card__top"><span>{step}</span><Icon aria-hidden="true" /></div><h3>{title}</h3><p>{text}</p></article>)}</div>
      </div></section>
    </div>
  );
}
