export interface FundRow { projId: string; abbr: string; nameEn: string; regisDate: string; status: string }

export function parseFundList(json: unknown): FundRow[] {
  if (!Array.isArray(json)) return [];
  return json.map((f: any) => ({
    projId: f.proj_id, abbr: f.proj_abbr_name, nameEn: f.proj_name_en,
    regisDate: f.regis_date, status: f.fund_status,
  }));
}

export function parseNav(json: unknown): number | null {
  if (!Array.isArray(json) || json.length === 0) return null;
  const main = json.find((x: any) => x.class_abbr_name === "main") ?? json[0];
  const v = (main as any)?.last_val;
  return typeof v === "number" && v > 0 ? v : null;
}

export function monthEndDates(startYm: string, endYm: string): string[] {
  const out: string[] = [];
  let [y, m] = startYm.split("-").map(Number);
  const [ey, em] = endYm.split("-").map(Number);
  while (y < ey || (y === ey && m <= em)) {
    const last = new Date(Date.UTC(y, m, 0)).getUTCDate(); // day 0 of next month = last day
    out.push(`${y}-${String(m).padStart(2,"0")}-${String(last).padStart(2,"0")}`);
    m++; if (m > 12) { m = 1; y++; }
  }
  return out;
}
