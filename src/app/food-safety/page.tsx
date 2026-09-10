export default function FoodSafetyPage() {
  return (
    <div className="container">
      <div className="page-head"><div className="eyebrow">Safety boundary</div><h1>Food safety and traceability.</h1><p>ReServe coordinates and ranks donations. It does not certify that food is safe or replace donor, recipient, regulator, or food-safety responsibilities.</p></div>
      <div className="grid-3" style={{ marginBottom: 70 }}>
        <div className="card"><h3>Donor confirms</h3><p className="muted">Accurate description, allergens, preparation/packaging time, storage conditions, pickup deadline, and other applicable safety information.</p></div>
        <div className="card"><h3>ReServe matches</h3><p className="muted">Food type, storage capability, capacity, distance, operational availability, and pickup feasibility.</p></div>
        <div className="card"><h3>Recipient inspects</h3><p className="muted">The receiving organization decides whether to accept the donation and remains responsible for its own inspection and handling requirements.</p></div>
      </div>
    </div>
  );
}
