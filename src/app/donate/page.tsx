import { DonationForm } from "@/components/donation/DonationForm";
import { PageHero } from "@/components/layout/PageHero";

export default function DonatePage() {
  return (
    <div className="inner-page">
      <PageHero eyebrow="Donor workflow" title={<>Turn surplus into <span>support.</span></>} description="Tell us what food you have and when it needs to move. ReServe evaluates nearby organizations and explains every recommended match." image="/impact-assets/donate-food-action.png" imageAlt="Hands offering a crate of fresh food for donation" highlights={["Explainable matching", "Local organizations", "Fast pickup coordination"]} />
      <section className="page-content page-content--form"><div className="container">
        <div className="section-title"><p>Donation details</p><h2>What food is available?</h2><span>Accurate details help organizations respond quickly and safely.</span></div>
        <DonationForm />
      </div></section>
    </div>
  );
}
