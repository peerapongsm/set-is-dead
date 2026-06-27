import { Point } from "@/lib/types";

export function growthSeries(points: Point[], amount: number): Point[] {
  if (points.length === 0) return [];
  const base = points[0].value;
  return points.map((p) => ({ ym: p.ym, value: (p.value / base) * amount }));
}

export function finalValue(points: Point[]): number {
  return points.length ? points[points.length - 1].value : 0;
}

export function cagr(points: Point[]): number {
  if (points.length < 2) return 0;
  const first = points[0], last = points[points.length - 1];
  const months = ymDiff(first.ym, last.ym);
  const years = months / 12;
  if (years <= 0 || first.value <= 0) return 0;
  return Math.pow(last.value / first.value, 1 / years) - 1;
}

export function maxDrawdown(points: Point[]): number {
  let peak = -Infinity, mdd = 0;
  for (const p of points) {
    if (p.value > peak) peak = p.value;
    if (peak > 0) mdd = Math.min(mdd, p.value / peak - 1);
  }
  return mdd;
}

export function taxRefund(amount: number, bracket: number): number {
  return amount * bracket;
}

function ymDiff(a: string, b: string): number {
  const [ay, am] = a.split("-").map(Number);
  const [by, bm] = b.split("-").map(Number);
  return (by - ay) * 12 + (bm - am);
}
