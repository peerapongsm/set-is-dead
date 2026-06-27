import { Series } from "@/lib/types";

export function commonWindow(list: Series[]): { start: string; end: string } | null {
  const withPts = list.filter((s) => s.points.length > 0);
  if (withPts.length === 0) return null;
  const start = withPts.map((s) => s.points[0].ym).sort().at(-1)!;
  const end = withPts.map((s) => s.points[s.points.length - 1].ym).sort()[0];
  return start <= end ? { start, end } : null;
}

export function alignAll(list: Series[]): Series[] {
  const w = commonWindow(list);
  if (!w) return list.map((s) => ({ ...s, points: [] }));
  return list.map((s) => ({
    ...s,
    points: s.points.filter((p) => p.ym >= w.start && p.ym <= w.end),
  }));
}
