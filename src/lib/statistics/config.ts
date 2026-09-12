export const POUNDS_PER_MEAL = 1.2;
export type StatisticsRange = "7" | "30" | "90" | "all";
export function rangeStart(range: string | null) { if (!range || range === "all") return null; const days = [7, 30, 90].includes(Number(range)) ? Number(range) : 30; return new Date(Date.now() - days * 86_400_000); }
