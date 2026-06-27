import { describe, expect, test } from "vitest";
import { parseFundList, parseNav, monthEndDates } from "@/lib/ingest/sec";

describe("sec parsers", () => {
  test("parseFundList maps fields", () => {
    const rows = parseFundList([{ proj_id:"M1_2563", proj_abbr_name:"K-EQ", proj_name_en:"K Equity", regis_date:"2020-01-15", fund_status:"RG" }]);
    expect(rows[0]).toEqual({ projId:"M1_2563", abbr:"K-EQ", nameEn:"K Equity", regisDate:"2020-01-15", status:"RG" });
  });
  test("parseNav picks main class last_val", () => {
    const j = [{ class_abbr_name:"X", last_val:9 }, { class_abbr_name:"main", last_val:13.1094 }];
    expect(parseNav(j)).toBe(13.1094);
  });
  test("parseNav: empty/204-shaped → null", () => {
    expect(parseNav([])).toBeNull();
    expect(parseNav(null)).toBeNull();
  });
  test("monthEndDates", () => {
    expect(monthEndDates("2024-01","2024-02")).toEqual(["2024-01-31","2024-02-29"]);
  });
});
