export default function PrivacyPage() {
  return (
    <div className="container">
      <div className="page-head"><h1>Privacy</h1><p>Prototype privacy notice for ReServe.</p></div>
      <div className="card" style={{ marginBottom: 70 }}>
        <p>ReServe may process donation details, contact information, organization information, and approximate or precise location when a user chooses to provide it. Location should only be requested when needed for discovery or matching.</p>
        <p>If Google Maps Platform services are enabled, search requests and resulting Places content are also subject to Google's applicable terms and privacy documentation. Do not use the API as a bulk business-directory scraper.</p>
        <p>Before production use, replace this prototype notice with a reviewed privacy policy that reflects the exact data you collect, retain, share, and delete.</p>
      </div>
    </div>
  );
}
