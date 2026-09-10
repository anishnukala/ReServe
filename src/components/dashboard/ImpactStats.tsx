export interface ImpactData {
  foodRescuedLbs: number;
  estimatedMeals: number;
  completedRescues: number;
  averageMatchMinutes: number;
  demo?: boolean;
}

export function ImpactStats({ data }: { data: ImpactData }) {
  return (
    <div className="grid-4">
      <div className="card"><div className="small muted">Food rescued</div><div className="stat">{data.foodRescuedLbs} lbs</div></div>
      <div className="card"><div className="small muted">Estimated meals</div><div className="stat">{data.estimatedMeals}</div></div>
      <div className="card"><div className="small muted">Completed rescues</div><div className="stat">{data.completedRescues}</div></div>
      <div className="card"><div className="small muted">Average match time</div><div className="stat">{data.averageMatchMinutes} min</div></div>
    </div>
  );
}
