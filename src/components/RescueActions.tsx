import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const ACTIONS = [
  {
    eyebrow: "I have surplus food",
    title: "Donate Food",
    copy: "Share safe, usable food and let ReServe match it with a nearby community organization.",
    href: "/donate",
    image: "/impact-assets/donate-food-action.png",
    className: "rescue-choice--donate",
  },
  {
    eyebrow: "I need food support",
    title: "Get Help",
    copy: "Find food banks, pantries, shelters, and community organizations serving your area.",
    href: "/organizations",
    image: "/impact-assets/get-help-action.png",
    className: "rescue-choice--help",
  },
];

export default function RescueActions() {
  return (
    <section id="rescue-actions" className="rescue-actions">
      <div className="rescue-actions__inner">
        <header className="rescue-actions__header">
          <p>Take the next step</p>
          <h2>Food rescue starts with a connection.</h2>
        </header>

        <div className="rescue-choices">
          {ACTIONS.map((action) => (
            <Link href={action.href} className={`rescue-choice ${action.className}`} key={action.title}>
              <div className="rescue-choice__copy">
                <p>{action.eyebrow}</p>
                <h3>{action.title}</h3>
                <span>{action.copy}</span>
                <strong>Continue <ArrowUpRight aria-hidden="true" /></strong>
              </div>
              <Image src={action.image} alt="" width={1254} height={1254} className="rescue-choice__image" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
