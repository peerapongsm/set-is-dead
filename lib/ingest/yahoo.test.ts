import { describe, expect, test } from "vitest";
import { parseYahooChart } from "@/lib/ingest/yahoo";

const fixture = {
  chart: { result: [{
    timestamp: [1577836800, 1580515200], // 2020-01-01, 2020-02-01 (UTC)
    indicators: { quote: [{ close: [10, 11] }], adjclose: [{ adjclose: [9.5, 10.5] }] }
  }], error: null }
};

describe("parseYahooChart", () => {
  test("uses adjclose, maps to ym", () => {
    const pts = parseYahooChart(fixture);
    expect(pts).toEqual([{ ym: "2020-01", value: 9.5 }, { ym: "2020-02", value: 10.5 }]);
  });
  test("skips null adjclose entries", () => {
    const f = JSON.parse(JSON.stringify(fixture));
    f.chart.result[0].indicators.adjclose[0].adjclose = [9.5, null];
    expect(parseYahooChart(f)).toEqual([{ ym: "2020-01", value: 9.5 }]);
  });
  test("empty/error result → []", () => {
    expect(parseYahooChart({ chart: { result: null, error: "x" } })).toEqual([]);
  });
});
