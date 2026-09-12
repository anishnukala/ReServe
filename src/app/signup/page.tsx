import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { PageHero } from "@/components/layout/PageHero";

export default function SignupPage() { return <div className="inner-page"><PageHero eyebrow="Join ReServe" title={<>Create your <span>rescue account.</span></>} description="Choose whether you donate food or receive and coordinate food support." compact tone="orange" /><section className="page-content"><div className="container auth-shell"><Suspense fallback={<div className="loading">Loading…</div>}><AuthForm mode="signup" /></Suspense><p>Already registered? <Link href="/login">Log in</Link></p></div></section></div>; }
