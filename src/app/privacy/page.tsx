import { PageHero } from "@/components/layout/PageHero";

export default function PrivacyPage() {
  return (
    <div className="inner-page">
      <PageHero eyebrow="Your information" title={<>Privacy with <span>purpose.</span></>} description="A clear overview of the information ReServe uses to coordinate local food rescue." compact tone="sage" />
      <section className="page-content"><div className="container legal-shell"><aside><p>Privacy notice</p><strong>Last updated</strong><span>September 10, 2026</span></aside><article className="legal-card">
        <section><span>01</span><div><h2>Information we use</h2><p>ReServe may process donation details, contact information, organization information, and approximate or precise location when you choose to provide it. Location is requested only when needed for discovery or matching.</p></div></section>
        <section><span>02</span><div><h2>Map services</h2><p>Map tiles are provided by OpenStreetMap. Your browser shares location coordinates with ReServe only when you choose to use location features.</p></div></section>
        <section><span>03</span><div><h2>Prototype notice</h2><p>This notice describes the current prototype. Before public production use, it should be replaced with a reviewed policy reflecting the exact data collected, retained, shared, and deleted.</p></div></section>
      </article></div></section>
    </div>
  );
}
