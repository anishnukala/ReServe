import Link from "next/link";

export default function RecipientPage() {
  const demoRows = [
    { food: "Vegetarian pasta", qty: "35 lbs", storage: "Refrigerated", deadline: "7:30 PM", status: "Available" },
    { food: "Bakery assortment", qty: "18 lbs", storage: "Ambient", deadline: "8:15 PM", status: "Available" },
    { food: "Packaged produce", qty: "42 lbs", storage: "Refrigerated", deadline: "Tomorrow 10 AM", status: "Matched" },
  ];

  return (
    <div className="container">
      <div className="page-head">
        <div className="eyebrow">Recipient prototype</div>
        <h1>Donation inbox.</h1>
        <p>Recipient organizations can review compatible donations, confirm their real capacity and storage ability, and accept only what they can safely handle.</p>
      </div>
      <div className="notice" style={{ marginBottom: 18 }}>Prototype simulation. Replace these rows with recipient-specific Supabase queries after authentication is added.</div>
      <div className="card table-wrap" style={{ marginBottom: 24 }}>
        <table>
          <thead><tr><th>Food</th><th>Quantity</th><th>Storage</th><th>Deadline</th><th>Status</th></tr></thead>
          <tbody>{demoRows.map((row) => <tr key={row.food}><td>{row.food}</td><td>{row.qty}</td><td>{row.storage}</td><td>{row.deadline}</td><td>{row.status}</td></tr>)}</tbody>
        </table>
      </div>
      <Link className="btn btn-primary" href="/organizations">Manage organization discovery</Link>
      <div style={{ height: 70 }} />
    </div>
  );
}
