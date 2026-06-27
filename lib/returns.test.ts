import { describe, expect, test } from "vitest";
import {
  growthSeries,
  finalValue,
  cagr,
  maxDrawdown,
  taxRefund,
  sliceYears,
  dcaSeries,
  dcaInvested,
} from "@/lib/returns";

const P = (vals: number[]) => vals.map((v, i) => ({ ym: `20${20 + Math.floor(i/12)}-${String((i%12)+1).padStart(2,"0")}`, value: v }));

describe("returns", () => {
  test("growthSeries rescales first to amount", () => {
    const g = growthSeries(P([10, 20]), 1000);
    expect(g[0].value).toBe(1000);
    expect(g[1].value).toBe(2000);
  });
  test("finalValue is last", () => {
    expect(finalValue(P([10, 20, 15]))).toBe(15);
  });
  test("cagr: doubling over 1 year ~ 100%", () => {
    const pts = [{ ym: "2020-01", value: 100 }, { ym: "2021-01", value: 200 }];
    expect(cagr(pts)).toBeCloseTo(1.0, 2);
  });
  test("maxDrawdown: 100->50 is -0.5", () => {
    expect(maxDrawdown(P([100, 120, 60, 90]))).toBeCloseTo(-0.5, 5); // peak 120 -> trough 60
  });
  test("taxRefund", () => { expect(taxRefund(10000, 0.2)).toBe(2000); });

  test("sliceYears keeps the last X years (ym >= lastYm minus X*12 months)", () => {
    const pts = P(Array.from({ length: 60 }, (_, i) => i + 1)); // 2020-01 .. 2024-12
    const s = sliceYears(pts, 2);
    // last ym is 2024-12; minus 24 months = 2022-12 (inclusive anchor)
    expect(s[0].ym).toBe("2022-12");
    expect(s.at(-1)!.ym).toBe("2024-12");
    expect(s.length).toBe(25); // spans the last 2 years = 24 monthly steps
  });

  test("sliceYears returns all when X exceeds available data", () => {
    const pts = P([10, 20, 30]);
    expect(sliceYears(pts, 30)).toHaveLength(3);
  });

  test("dcaSeries: flat price buys constant units", () => {
    const v = dcaSeries(P([10, 10, 10]), 10).map((p) => p.value);
    expect(v).toEqual([10, 20, 30]);
  });

  test("dcaSeries: rising price accumulates units (1 then 1.5)", () => {
    const v = dcaSeries(P([10, 20]), 10).map((p) => p.value);
    expect(v).toEqual([10, 30]);
  });

  test("dcaInvested is monthly * months", () => {
    expect(dcaInvested(10, 3)).toBe(30);
  });
});
