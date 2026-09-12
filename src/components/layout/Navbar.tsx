"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";
type PublicUser = { id: string; name: string; role: "restaurant" | "food_org" | "admin" };

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<PublicUser | null>(null);
  useEffect(() => { fetch("/api/auth/me").then((response) => response.ok ? response.json() : null).then((body) => setUser(body?.user || null)).catch(() => setUser(null)); }, [pathname]);
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); setUser(null); setOpen(false); window.location.href = "/"; }
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
          {user ? <><Link href={user.role === "food_org" ? "/organization" : "/donate"}>{user.name}</Link><button className="nav-auth" type="button" onClick={logout}>Log out</button></> : <Link href="/login">Log in</Link>}
        </nav>
        <button className="nav-toggle" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <nav id="mobile-navigation" className={`mobile-nav${open ? " mobile-nav--open" : ""}`} aria-label="Mobile navigation">
        {links.map((link) => <Link className={pathname.startsWith(link.href) ? "active" : ""} href={link.href} key={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
        <Link className="nav-cta" href="/donate" onClick={() => setOpen(false)}>Get Started</Link>
        {user ? <><Link href={user.role === "food_org" ? "/organization" : "/donate"} onClick={() => setOpen(false)}>{user.name}</Link><button className="nav-auth" type="button" onClick={logout}>Log out</button></> : <Link href="/login" onClick={() => setOpen(false)}>Log in</Link>}
      </nav>
    </header>
  );
}
