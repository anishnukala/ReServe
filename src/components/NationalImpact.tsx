import { ExternalLink } from "lucide-react";

const FACTS = [
  {
    label: "Food insecurity",
    value: "13.7%",
    copy: "of U.S. households were food insecure in 2024—18.3 million households nationwide.",
    source: "USDA Economic Research Service",
    url: "https://www.ers.usda.gov/topics/food-nutrition-assistance/food-security-in-the-us/media-resources",
    position: "0% 0%",
  },
  {
    label: "Neighbors facing hunger",
    value: "48 million",
    copy: "people face hunger across the United States, including 14 million children.",
    source: "Feeding America",
    url: "https://www.feedingamerica.org/",
    position: "50% 0%",
  },
  {
    label: "Food left uneaten",
    value: "30–40%",
    copy: "of the available U.S. food supply goes uneaten through food loss or waste.",
    source: "USDA, EPA & FDA",
    url: "https://www.usda.gov/sites/default/files/documents/interagency-strategy-on-reducing-food-waste.pdf",
    position: "100% 0%",
  },
  {
    label: "Giving power",
    value: "$1 → 10 meals",
    copy: "A $1 gift to Feeding America helps provide at least 10 meals through partner food banks.",
    source: "Feeding America",
    url: "https://www.feedingamerica.org/campaigns/fight-hunger-spark-change",
    position: "0% 100%",
  },
  {
    label: "Nationwide network",
    value: "200+ / 60,000+",
    copy: "food banks and local programs make up Feeding America’s nationwide distribution network.",
    source: "Feeding America",
    url: "https://www.feedingamerica.org/",
    position: "50% 100%",
  },
  {
    label: "Landfill methane",
    value: "58%",
    copy: "of methane emissions escaping U.S. municipal solid waste landfills comes from landfilled food waste.",
    source: "U.S. Environmental Protection Agency",
    url: "https://www.epa.gov/land-research/quantifying-methane-emissions-landfilled-food-waste",
    position: "100% 100%",
  },
];

export default function NationalImpact() {
  return (
    <section id="national-impact" className="national-impact">
      <div className="national-impact__inner">
        <header className="national-impact__header">
          <div>
            <p className="national-impact__eyebrow">Across America</p>
            <h2>Food rescue is a<br /><span>national opportunity.</span></h2>
          </div>
          <p className="national-impact__intro">
            Surplus food and hunger exist side by side. These national figures show why moving good food to people matters in every community.
          </p>
        </header>

        <div className="national-facts">
          {FACTS.map((fact) => (
            <article className="national-fact" key={fact.label}>
              <div
                className="national-fact__art"
                style={{ backgroundPosition: fact.position }}
                role="img"
                aria-label={`Illustration for ${fact.label}`}
              />
              <div className="national-fact__content">
                <p className="national-fact__label">{fact.label}</p>
                <p className="national-fact__value">{fact.value}</p>
                <p className="national-fact__copy">{fact.copy}</p>
                <a href={fact.url} target="_blank" rel="noreferrer" className="national-fact__source">
                  {fact.source}<ExternalLink aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
