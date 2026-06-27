import { describe, expect, test } from "vitest";
import { growthSeries, finalValue, cagr, maxDrawdown, taxRefund } from "@/lib/returns";

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
});
