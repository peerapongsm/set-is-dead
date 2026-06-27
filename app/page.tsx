"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import { loadIndex, loadSeries, IndexEntry } from "@/lib/load";
import { Series } from "@/lib/types";
import {
  growthSeries,
  dcaSeries,
  dcaInvested,
  sliceYears,
  finalValue,
  cagr,
  maxDrawdown,
  taxRefund,
} from "@/lib/returns";
import { alignAll } from "@/lib/align";
import { GrowthChart, COLORS } from "@/app/components/GrowthChart";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const YEAR_OPTS = Array.from({ length: 30 }, (_, i) => i + 1);

type Mode = "lump" | "dca";

const KIND_LABEL: Record<string, string> = {
  benchmark: "ดัชนี / เกณฑ์",
  fund: "กองทุนลดหย่อนภาษี",
  stock: "หุ้น",
  global: "หุ้นต่างประเทศ",
};

const baht = (n: number) => "฿" + Math.round(n).toLocaleString("th-TH");

export default function Home() {
  const [index, setIndex] = useState<IndexEntry[]>([]);
  const [picked, setPicked] = useState<string[]>(["SET50"]);
  const [mode, setMode] = useState<Mode>("lump");
  const [amount, setAmount] = useState(10000);
  const [monthly, setMonthly] = useState(1000);
  const [years, setYears] = useState(10);
  const [bracket, setBracket] = useState(0.2);
  const [taxOn, setTaxOn] = useState(true);
  const [alignedRaw, setAlignedRaw] = useState<Series[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadIndex().then(setIndex);
  }, []);

  function toggle(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  async function compare() {
    setBusy(true);
    const raw: Series[] = [];
    for (const id of picked) {
      const e = index.find((x) => x.id === id);
      if (!e) continue;
      raw.push({ id, label: e.label, kind: e.kind, category: e.category, points: await loadSeries(id) });
    }
    // store the common-window aligned series (un-sliced, un-rescaled);
    // slicing + per-mode transforms happen reactively in render.
    setAlignedRaw(alignAll(raw));
    setBusy(false);
  }

  // slice each aligned series to the last `years` years of the common window
  const sliced = alignedRaw.map((s) => ({ ...s, points: sliceYears(s.points, years) }));
  const hasResult = sliced.length > 0 && sliced[0].points.length > 0;
  const fundInPick = sliced.some((s) => s.kind === "fund");
  const months = hasResult ? sliced[0].points.length : 0;

  // invested base drives the tax refund + DCA totals
  const investedBase = mode === "lump" ? amount : dcaInvested(monthly, months);

  // value series shown per asset (growth for lump, DCA portfolio value for DCA)
  const display = sliced.map((s) => ({
    ...s,
    points: mode === "lump" ? growthSeries(s.points, amount) : dcaSeries(s.points, monthly),
  }));

  // per-asset computed rows (raw + tax-adjusted)
  const rows = display.map((s, i) => {
    const fv = finalValue(s.points);
    const refund = s.kind === "fund" && taxOn ? taxRefund(investedBase, bracket) : 0;
    const adj = fv + refund;
    const gainPct = investedBase > 0 ? (fv - investedBase) / investedBase : 0;
    return { s, color: COLORS[i % COLORS.length], fv, adj, gainPct, cg: cagr(s.points), dd: maxDrawdown(s.points) };
  });

  // hero: best performer vs SET50 benchmark
  const bench = rows.find((r) => r.s.id === "SET50") ?? rows.find((r) => r.s.kind === "benchmark");
  const winner = hasResult ? rows.reduce((a, b) => (b.adj > a.adj ? b : a), rows[0]) : null;
  const beatsBench = bench && winner && winner.s.id !== bench.s.id;
  const mult = bench && winner && bench.adj > 0 ? winner.adj / bench.adj : 0;

  const chartTitle =
    mode === "lump" ? `การเติบโตของ ${baht(amount)}` : "มูลค่าพอร์ต DCA";

  return (
    <main>
      <header className="masthead">
        <div>
          <p className="eyebrow">Backtest · {years} ปีย้อนหลัง</p>
          <h1>
            SET <span className="dead">is dead?</span>
          </h1>
          <p className="sub">
            ถ้าวันนั้นลงเงินกับอย่างอื่นแทน SET50 หรือกองทุนลดหย่อนภาษี จะเป็นยังไง —
            เทียบเงินตั้งต้นเท่ากันทั้งแบบก้อนเดียวและ DCA รายเดือน
          </p>
        </div>
        <div className="stamp">
          <div>เทียบผลตอบแทน</div>
          <div>ย้อนหลังจริง</div>
          <div>
            <b>raw + หลังหักภาษี</b>
          </div>
        </div>
      </header>

      <div className="grid">
        {/* ---- controls ---- */}
        <aside className="controls panel">
          {/* mode switch */}
          <div className="group">
            <p className="label">รูปแบบการลงทุน</p>
            <div className="mode-switch">
              <button
                className={mode === "lump" ? "mode-btn on" : "mode-btn"}
                onClick={() => setMode("lump")}
              >
                ลงเงินก้อน
              </button>
              <button
                className={mode === "dca" ? "mode-btn on" : "mode-btn"}
                onClick={() => setMode("dca")}
              >
                DCA รายเดือน
              </button>
            </div>
          </div>

          {/* mode-specific inputs */}
          <div className="group field-stack">
            {mode === "lump" ? (
              <label className="field">
                <span className="field-name">จำนวนเงิน (บาท)</span>
                <input
                  type="number"
                  className="num-input"
                  min={0}
                  step={1000}
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, +e.target.value || 0))}
                />
              </label>
            ) : (
              <label className="field">
                <span className="field-name">เงินต่อเดือน (บาท)</span>
                <input
                  type="number"
                  className="num-input"
                  min={0}
                  step={500}
                  value={monthly}
                  onChange={(e) => setMonthly(Math.max(0, +e.target.value || 0))}
                />
              </label>
            )}
            <label className="field">
              <span className="field-name">
                {mode === "lump" ? "ย้อนหลัง (ปี)" : "ระยะเวลา (ปี)"}
              </span>
              <select value={years} onChange={(e) => setYears(+e.target.value)}>
                {YEAR_OPTS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="divider" />

          {(["benchmark", "fund", "stock", "global"] as const).map((k) => {
            const items = index.filter((e) => e.kind === k);
            if (items.length === 0) return null;
            return (
              <div className="group" key={k}>
                <p className="label">{KIND_LABEL[k]}</p>
                <div className="chips">
                  {items.map((e) => (
                    <button
                      key={e.id}
                      className={picked.includes(e.id) ? "btn on" : "btn"}
                      onClick={() => toggle(e.id)}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {index.length === 0 && (
            <p className="note">กำลังโหลดรายการสินทรัพย์…</p>
          )}

          <div className="divider" />

          <div className="toggle-row group">
            <span className="field-name">นับสิทธิลดหย่อนภาษี</span>
            <button
              className={taxOn ? "btn on" : "btn"}
              onClick={() => setTaxOn(!taxOn)}
            >
              {taxOn ? "เปิด" : "ปิด"}
            </button>
          </div>
          <div className="toggle-row group">
            <span className="field-name">ฐานภาษี</span>
            <select
              value={bracket}
              disabled={!taxOn}
              onChange={(e) => setBracket(+e.target.value)}
            >
              {[0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35].map((b) => (
                <option key={b} value={b}>
                  {b * 100}%
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn-primary"
            onClick={compare}
            disabled={picked.length === 0 || busy}
          >
            {busy ? "กำลังคำนวณ…" : "เทียบเลย"}
          </button>
        </aside>

        {/* ---- results ---- */}
        <section className="results">
          {!hasResult && (
            <div className="empty">
              <svg className="spark" viewBox="0 0 120 56" fill="none" aria-hidden>
                <path d="M2 50 L26 38 L46 44 L70 18 L96 24 L118 4" stroke="#cbd0d9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3>เลือกสินทรัพย์แล้วกด “เทียบเลย”</h3>
              <p>
                {mode === "lump"
                  ? `กราฟการเติบโตของเงิน ${baht(amount)} และตัวเลขสรุปจะแสดงตรงนี้`
                  : `กราฟมูลค่าพอร์ต DCA ${baht(monthly)}/เดือน และตัวเลขสรุปจะแสดงตรงนี้`}
              </p>
            </div>
          )}

          {hasResult && winner && (
            <>
              <div className="hero">
                <p className="kicker">
                  {beatsBench ? "ผู้ชนะในช่วงที่เทียบ" : "ผลตอบแทนสูงสุด"}
                </p>
                <p className="winner-name">{winner.s.label}</p>
                <p className={`figure ${winner.adj >= investedBase ? "win" : "lose"}`}>
                  {baht(winner.adj)}
                </p>
                {mode === "dca" && (
                  <p className="hero-sub">
                    ใส่ทั้งหมด {baht(investedBase)} → {baht(winner.fv)}
                  </p>
                )}
                {bench && (
                  <span className="verdict">
                    เทียบ {bench.s.label} ที่ {baht(bench.adj)}
                    {beatsBench && mult > 0 && (
                      <span className={mult >= 1 ? "delta up" : "delta down"}>
                        {mult >= 1 ? "▲" : "▼"} {mult.toFixed(2)}×
                      </span>
                    )}
                  </span>
                )}
              </div>

              <div className="panel chart-card">
                <div className="chart-head">
                  <h2>{chartTitle}</h2>
                  <span className="window">
                    {sliced[0].points[0].ym} – {sliced[0].points.at(-1)!.ym}
                  </span>
                </div>
                <GrowthChart series={display} />
              </div>

              <div className="panel table-card">
                <h2>สรุปตัวเลข</h2>
                {mode === "lump" ? (
                  <table>
                    <thead>
                      <tr>
                        <th>สินทรัพย์</th>
                        <th>มูลค่าสุดท้าย</th>
                        <th>CAGR</th>
                        <th>ขาดทุนหนักสุด</th>
                        {taxOn && <th>+ลดหย่อน</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.s.id}>
                          <td>
                            <span className="swatch" style={{ background: r.color }} />
                            {r.s.label}
                          </td>
                          <td className="num">{baht(r.fv)}</td>
                          <td className={`num ${r.cg >= 0 ? "pos" : "neg"}`}>
                            {(r.cg * 100).toFixed(1)}%
                          </td>
                          <td className="num neg">{(r.dd * 100).toFixed(0)}%</td>
                          {taxOn && (
                            <td className="num">
                              {r.s.kind === "fund" ? (
                                <span className="pos">{baht(r.adj)}</span>
                              ) : (
                                <span className="muted-cell">–</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>สินทรัพย์</th>
                        <th>เงินที่ใส่</th>
                        <th>มูลค่าสุดท้าย</th>
                        <th>กำไร%</th>
                        <th>ขาดทุนหนักสุด</th>
                        {taxOn && <th>+ลดหย่อน</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.s.id}>
                          <td>
                            <span className="swatch" style={{ background: r.color }} />
                            {r.s.label}
                          </td>
                          <td className="num">{baht(investedBase)}</td>
                          <td className="num">{baht(r.fv)}</td>
                          <td className={`num ${r.gainPct >= 0 ? "pos" : "neg"}`}>
                            {(r.gainPct * 100).toFixed(1)}%
                          </td>
                          <td className="num neg">{(r.dd * 100).toFixed(0)}%</td>
                          {taxOn && (
                            <td className="num">
                              {r.s.kind === "fund" ? (
                                <span className="pos">{baht(r.adj)}</span>
                              ) : (
                                <span className="muted-cell">–</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {fundInPick && taxOn && (
                  <p className="note legend-note">
                    “+ลดหย่อน” = มูลค่ากองทุน + เงินภาษีที่ประหยัดได้ (ฐาน{" "}
                    {bracket * 100}% ของเงินที่ลงทุน {baht(investedBase)})
                  </p>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <footer>
        <button
          className="btn"
          onClick={() => location.assign(`${BASE}/method/`)}
        >
          วิธีคิด + ที่มาข้อมูล + ข้อจำกัด →
        </button>
        <p className="disclaimer">
          ข้อมูลเพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน · ผลตอบแทนในอดีตไม่การันตีอนาคต ·
          มี survivorship bias · อ้างอิงข้อมูลย้อนหลังตามช่วงที่มีจริงของแต่ละสินทรัพย์
        </p>
      </footer>

      <Script
        src="https://umami-host-peerapongsms-projects.vercel.app/script.js"
        data-website-id="3f09453d-0b39-443e-8845-5e65611cc58a"
        strategy="afterInteractive"
      />
    </main>
  );
}
