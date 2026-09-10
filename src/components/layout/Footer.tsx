import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-main">
        <div className="footer-brand-block">
          <Link href="/" className="footer-brand">
            <Image className="brand-logo" src="/logo/reserve-navbar-logo.png" width={2172} height={724} alt="ReServe — Good food. Brighter tomorrows." />
          </Link>
          <p>Moving good food to nearby communities through smarter, faster local matching.</p>
          <Link href="/donate" className="footer-action">Donate surplus food <ArrowRight aria-hidden="true" /></Link>
        </div>

        <nav className="footer-column" aria-label="Give food">
          <h2>Give food</h2>
          <Link href="/donate">Start a donation</Link>
          <Link href="/dashboard">View impact</Link>
          <Link href="/food-safety">Food safety</Link>
        </nav>

        <nav className="footer-column" aria-label="Find support">
          <h2>Find support</h2>
          <Link href="/organizations">Nearby organizations</Link>
          <Link href="/recipient">Recipient portal</Link>
          <Link href="/#national-impact">National impact</Link>
        </nav>

        <nav className="footer-column" aria-label="ReServe information">
          <h2>ReServe</h2>
          <Link href="/">Home</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </div>

      <div className="container footer-bottom">
        <p>© {year} ReServe. Good food. Brighter tomorrows.</p>
        <p>Built for local food rescue.</p>
      </div>
    </footer>
  );
}
