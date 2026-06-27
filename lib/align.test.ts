import { describe, expect, test } from "vitest";
import { commonWindow, alignAll } from "@/lib/align";
import { Series } from "@/lib/types";

const s = (id: string, yms: string[]): Series => ({ id, label: id, kind: "stock", points: yms.map((ym,i)=>({ym,value:100+i})) });

describe("align", () => {
  test("commonWindow = latest start, earliest end", () => {
    const w = commonWindow([s("a",["2020-01","2020-02","2020-03"]), s("b",["2020-02","2020-03","2020-04"])]);
    expect(w).toEqual({ start: "2020-02", end: "2020-03" });
  });
  test("alignAll slices each series to the window", () => {
    const out = alignAll([s("a",["2020-01","2020-02","2020-03"]), s("b",["2020-02","2020-03","2020-04"])]);
    expect(out[0].points.map(p=>p.ym)).toEqual(["2020-02","2020-03"]);
    expect(out[1].points.map(p=>p.ym)).toEqual(["2020-02","2020-03"]);
  });
  test("no overlap → null window", () => {
    expect(commonWindow([s("a",["2019-01"]), s("b",["2020-01"])])).toBeNull();
  });
});
