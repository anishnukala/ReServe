import { Clock3, HandHeart, PackageCheck, Utensils } from "lucide-react";

export interface ImpactData {
  foodRescuedLbs: number;
  estimatedMeals: number;
  completedRescues: number;
  averageMatchMinutes: number;
  activeDonations: number;
  successfulMatchRate: number;
  averageMatchScore: number;
  averagePickupMinutes: number;
  averageDonationSize: number;
  activeFoodOrganizations: number;
  activeDonorOrganizations: number;
}

export function ImpactStats({ data }: { data: ImpactData }) {
  const stats = [
    { label: "Food rescued", value: `${data.foodRescuedLbs.toLocaleString()} lbs`, icon: PackageCheck, tone: "green" },
    { label: "Estimated meals", value: data.estimatedMeals.toLocaleString(), icon: Utensils, tone: "orange" },
    { label: "Completed rescues", value: data.completedRescues.toLocaleString(), icon: HandHeart, tone: "leaf" },
    { label: "Successful match rate", value: `${data.successfulMatchRate}%`, icon: Clock3, tone: "sage" },
  ];

  return (
    <div className="impact-stats">
      {stats.map(({ label, value, icon: Icon, tone }) => (
        <article className={`impact-stat impact-stat--${tone}`} key={label}>
          <div className="impact-stat__icon"><Icon aria-hidden="true" /></div>
          <p>{label}</p>
          <strong>{value}</strong>
          <span>ReServe network total</span>
        </article>
      ))}
    </div>
  );
}
