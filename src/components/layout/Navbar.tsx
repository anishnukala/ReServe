import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link className="brand" href="/">
          <Image src="/logo/reserve-logo.png" width={48} height={48} alt="ReServe logo" priority />
          <span className="brand-name">ReServe</span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          <Link href="/donate">Donate</Link>
          <Link href="/organizations">Organizations</Link>
          <Link href="/recipient">Recipient</Link>
          <Link href="/dashboard">Impact</Link>
          <Link className="btn btn-primary" href="/donate">Get Started</Link>
        </nav>
      </div>
    </header>
  );
}
