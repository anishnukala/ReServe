import { PageHero } from "@/components/layout/PageHero";

export default function TermsPage() {
  return (
    <div className="inner-page">
      <PageHero eyebrow="Using ReServe" title={<>Simple terms, <span>clear roles.</span></>} description="The responsibilities that help donors and organizations coordinate each rescue with confidence." compact tone="orange" />
      <section className="page-content"><div className="container legal-shell"><aside><p>Terms of use</p><strong>Last updated</strong><span>September 10, 2026</span></aside><article className="legal-card">
        <section><span>01</span><div><h2>Coordination platform</h2><p>ReServe is a coordination and matching platform. Users are responsible for the accuracy of submitted information and for their decision to donate, accept, transport, or receive food.</p></div></section>
        <section><span>02</span><div><h2>Operational recommendations</h2><p>Match scores help compare practical fit. They do not guarantee availability, safety, legal compliance, or successful delivery.</p></div></section>
        <section><span>03</span><div><h2>Production review</h2><p>These terms apply to the current prototype. Before public launch, the production terms should be reviewed for the jurisdictions and organizations ReServe serves.</p></div></section>
      </article></div></section>
    </div>
  );
}
