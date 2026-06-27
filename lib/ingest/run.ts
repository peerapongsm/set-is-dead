import { writeFileSync, mkdirSync } from "node:fs";
import { fetchYahoo } from "@/lib/ingest/yahoo";
import { parseNav, monthEndDates } from "@/lib/ingest/sec";
import { BENCHMARKS, STOCKS, GLOBAL_STOCKS, TAX_FUNDS } from "@/config/universe";
import { Point, Series } from "@/lib/types";

const SEC_KEY = process.env.SEC_Fund_Daily_Info_API_PRIMARY_KEY!;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fundSeries(projId: string, startYm: string, endYm: string): Promise<Point[]> {
  const out: Point[] = [];
  for (const date of monthEndDates(startYm, endYm)) {
    // step back up to 5 days to find the last posted NAV of the month
    let nav: number | null = null, d = date;
    for (let k = 0; k < 6 && nav == null; k++) {
      const res = await fetch(`https://api.sec.or.th/FundDailyInfo/${projId}/dailynav/${d}`, {
        headers: { "Ocp-Apim-Subscription-Key": SEC_KEY },
      });
      if (res.status === 200) nav = parseNav(await res.json());
      else if (res.status === 429) { await sleep(2000); k--; continue; }
      if (nav == null) { const dt = new Date(d); dt.setUTCDate(dt.getUTCDate() - 1); d = dt.toISOString().slice(0,10); }
      await sleep(120); // ~ stay under 3000/300s
    }
    if (nav != null) out.push({ ym: date.slice(0, 7), value: nav });
  }
  return out;
}

async function main() {
  mkdirSync("public/data/series", { recursive: true });
  const index: any[] = [];
  const all: Series[] = [];

  for (const b of [...BENCHMARKS]) all.push({ id: b.id, label: b.label, kind: "benchmark", points: await fetchYahoo(b.ticker) });
  for (const s of STOCKS) all.push({ id: s.id, label: s.label, kind: "stock", points: await fetchYahoo(s.ticker) });
  for (const s of GLOBAL_STOCKS) all.push({ id: s.id, label: s.label, kind: "global", points: await fetchYahoo(s.ticker) });

  // funds need a date range; use the widest stock/benchmark window available
  const startYm = "2014-01", endYm = new Date().toISOString().slice(0, 7);
  for (const f of TAX_FUNDS) {
    if (f.projId === "FILL_FROM_SEC") continue; // skip until real proj_id set
    all.push({ id: f.id, label: f.label, kind: "fund", category: f.category, points: await fundSeries(f.projId, startYm, endYm) });
  }

  for (const s of all) {
    if (s.points.length === 0) { console.warn("empty:", s.id); continue; }
    writeFileSync(`public/data/series/${s.id}.json`, JSON.stringify(s.points));
    index.push({ id: s.id, label: s.label, kind: s.kind, category: s.category, start: s.points[0].ym, end: s.points.at(-1)!.ym });
  }
  writeFileSync("public/data/index.json", JSON.stringify(index, null, 2));
  console.log("baked", index.length, "series");
}
main().catch((e) => { console.error(e); process.exit(1); });
