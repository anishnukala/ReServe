import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { PageHero } from "@/components/layout/PageHero";

export default function LoginPage() { return <div className="inner-page"><PageHero eyebrow="Welcome back" title={<>Continue your <span>food rescue work.</span></>} description="Log in securely to manage donations, matches, and organization needs." compact tone="sage" /><section className="page-content"><div className="container auth-shell"><Suspense fallback={<div className="loading">Loading…</div>}><AuthForm mode="login" /></Suspense><p>New to ReServe? <Link href="/signup">Create an account</Link></p></div></section></div>; }
