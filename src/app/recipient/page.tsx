import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";

export default function RecipientPage() {
  const demoRows = [
    { food: "Vegetarian pasta", qty: "35 lbs", storage: "Refrigerated", deadline: "7:30 PM", status: "Available" },
    { food: "Bakery assortment", qty: "18 lbs", storage: "Ambient", deadline: "8:15 PM", status: "Available" },
    { food: "Packaged produce", qty: "42 lbs", storage: "Refrigerated", deadline: "Tomorrow 10 AM", status: "Matched" },
  ];

  return (
    <div className="inner-page">
      <PageHero eyebrow="Recipient workspace" title={<>A clearer <span>donation inbox.</span></>} description="Review compatible donations, confirm your capacity, and coordinate food pickups your organization can safely handle." image="/impact-assets/get-help-action.png" imageAlt="A community support illustration" highlights={["Capacity first", "Pickup deadlines", "Clear food details"]} tone="orange" />
      <section className="page-content"><div className="container">
      <div className="section-title section-title--row"><div><p>Available now</p><h2>Compatible donations</h2></div><span>Food matched to the needs and storage capacity of your organization.</span></div>
      <div className="notice notice--compact">This recipient workspace currently uses illustrative donation data.</div>
      <div className="recipient-table-card table-wrap">
        <table>
          <thead><tr><th>Food</th><th>Quantity</th><th>Storage</th><th>Deadline</th><th>Status</th></tr></thead>
          <tbody>{demoRows.map((row) => <tr key={row.food}><td><strong>{row.food}</strong></td><td>{row.qty}</td><td>{row.storage}</td><td>{row.deadline}</td><td><span className={`status-badge status-badge--${row.status.toLowerCase()}`}>{row.status}</span></td></tr>)}</tbody>
        </table>
      </div>
      <div className="content-actions"><Link className="btn btn-primary" href="/organizations">Explore local organizations <ArrowRight /></Link></div>
      </div></section>
    </div>
  );
}
