"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/donate", label: "Donate" },
    { href: "/organizations", label: "Find Help" },
    { href: "/dashboard", label: "Impact" },
    { href: "/recipient", label: "Recipients" },
  ];

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link className="brand" href="/" onClick={() => setOpen(false)}>
          <Image className="brand-logo" src="/logo/reserve-navbar-logo.png" width={2172} height={724} alt="ReServe — Good food. Brighter tomorrows." priority />
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          {links.map((link) => <Link className={pathname.startsWith(link.href) ? "active" : ""} href={link.href} key={link.href}>{link.label}</Link>)}
          <Link className="nav-cta" href="/donate">Get Started</Link>
        </nav>
        <button className="nav-toggle" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <nav id="mobile-navigation" className={`mobile-nav${open ? " mobile-nav--open" : ""}`} aria-label="Mobile navigation">
        {links.map((link) => <Link className={pathname.startsWith(link.href) ? "active" : ""} href={link.href} key={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
        <Link className="nav-cta" href="/donate" onClick={() => setOpen(false)}>Get Started</Link>
      </nav>
    </header>
  );
}
