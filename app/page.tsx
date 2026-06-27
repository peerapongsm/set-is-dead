"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import { loadIndex, loadSeries, IndexEntry } from "@/lib/load";
import { Series } from "@/lib/types";
import { growthSeries, finalValue, cagr, maxDrawdown, taxRefund } from "@/lib/returns";
import { alignAll } from "@/lib/align";
import { GrowthChart, COLORS } from "@/app/components/GrowthChart";

const AMOUNT = 10000;
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

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
  const [bracket, setBracket] = useState(0.2);
  const [taxOn, setTaxOn] = useState(true);
  const [aligned, setAligned] = useState<Series[]>([]);
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
    setAligned(alignAll(raw).map((s) => ({ ...s, points: growthSeries(s.points, AMOUNT) })));
    setBusy(false);
  }

  const hasResult = aligned.length > 0 && aligned[0].points.length > 0;
  const fundInPick = aligned.some((s) => s.kind === "fund");

  // per-asset computed rows (raw + tax-adjusted)
  const rows = aligned.map((s, i) => {
    const fv = finalValue(s.points);
    const adj = s.kind === "fund" && taxOn ? fv + taxRefund(AMOUNT, bracket) : fv;
    return { s, color: COLORS[i % COLORS.length], fv, adj, cg: cagr(s.points), dd: maxDrawdown(s.points) };
  });

  // hero: best performer vs SET50 benchmark
  const bench =
    rows.find((r) => r.s.id === "SET50") ?? rows.find((r) => r.s.kind === "benchmark");
  const winner = hasResult
    ? rows.reduce((a, b) => (b.adj > a.adj ? b : a), rows[0])
    : null;
  const beatsBench = bench && winner && winner.s.id !== bench.s.id;
  const mult = bench && winner && bench.adj > 0 ? winner.adj / bench.adj : 0;

  return (
    <main>
      <header className="masthead">
        <div>
          <p className="eyebrow">Backtest · ฿{AMOUNT.toLocaleString()} growth</p>
          <h1>
            SET <span className="dead">is dead?</span>
          </h1>
          <p className="sub">
            ถ้าวันนั้นซื้ออย่างอื่นแทน SET50 หรือกองทุนลดหย่อนภาษี จะเป็นยังไง —
            เทียบเงินตั้งต้นเท่ากันที่ ฿{AMOUNT.toLocaleString()}
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
              <p>กราฟการเติบโตของเงิน ฿{AMOUNT.toLocaleString()} และตัวเลขสรุปจะแสดงตรงนี้</p>
            </div>
          )}

          {hasResult && winner && (
            <>
              <div className="hero">
                <p className="kicker">
                  {beatsBench ? "ผู้ชนะในช่วงที่เทียบ" : "ผลตอบแทนสูงสุด"}
                </p>
                <p className="winner-name">{winner.s.label}</p>
                <p className={`figure ${winner.adj >= AMOUNT ? "win" : "lose"}`}>
                  {baht(winner.adj)}
                </p>
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
                  <h2>การเติบโตของ ฿{AMOUNT.toLocaleString()}</h2>
                  <span className="window">
                    {aligned[0].points[0].ym} – {aligned[0].points.at(-1)!.ym}
                  </span>
                </div>
                <GrowthChart series={aligned} />
              </div>

              <div className="panel table-card">
                <h2>สรุปตัวเลข</h2>
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
                {fundInPick && taxOn && (
                  <p className="note legend-note">
                    “+ลดหย่อน” = มูลค่ากองทุน + เงินภาษีที่ประหยัดได้ (ฐาน{" "}
                    {bracket * 100}%) คิดเป็นเงินสด ณ วันซื้อ
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
