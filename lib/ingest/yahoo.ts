import { Point } from "@/lib/types";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

export function parseYahooChart(json: unknown): Point[] {
  const r = (json as any)?.chart?.result?.[0];
  if (!r?.timestamp) return [];
  const ts: number[] = r.timestamp;
  const adj: (number | null)[] | undefined = r.indicators?.adjclose?.[0]?.adjclose;
  const close: (number | null)[] | undefined = r.indicators?.quote?.[0]?.close;
  const vals = adj ?? close ?? [];
  const out: Point[] = [];
  for (let i = 0; i < ts.length; i++) {
    const v = vals[i];
    if (v == null) continue;
    const d = new Date(ts[i] * 1000);
    const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    out.push({ ym, value: v });
  }
  return out;
}

export async function fetchYahoo(ticker: string): Promise<Point[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=max&interval=1mo`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Yahoo ${ticker} ${res.status}`);
  return parseYahooChart(await res.json());
}
