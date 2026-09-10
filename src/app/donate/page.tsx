import { DonationForm } from "@/components/donation/DonationForm";

export default function DonatePage() {
  return (
    <>
      <div className="container page-head">
        <div className="eyebrow">Donor workflow</div>
        <h1>Donate surplus food.</h1>
        <p>Enter the donation details ReServe needs to evaluate compatible organizations. This prototype uses explainable operational matching; it does not certify food safety.</p>
      </div>
      <DonationForm />
    </>
  );
}
