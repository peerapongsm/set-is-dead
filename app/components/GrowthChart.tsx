"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Series } from "@/lib/types";

interface TipPayload {
  dataKey?: string | number;
  name?: string;
  value?: number;
  color?: string;
}
interface TipProps {
  active?: boolean;
  payload?: TipPayload[];
  label?: string | number;
}

export const COLORS = [
  "#e5484d", // accent red (SET / first pick)
  "#1a7f4b", // green
  "#1565c0", // blue
  "#b07400", // amber
  "#6a1b9a", // purple
  "#00838f", // teal
  "#5d4037", // brown
];

function CustomTooltip({ active, payload, label }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tip">
      <p className="tip-ym">{label}</p>
      {payload.map((p) => (
        <div className="tip-row" key={String(p.dataKey)}>
          <span className="tip-label">
            <span className="tip-dot" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="tip-val">
            ฿{Number(p.value).toLocaleString("th-TH")}
          </span>
        </div>
      ))}
    </div>
  );
}

export function GrowthChart({ series }: { series: Series[] }) {
  // merge series into wide rows keyed by ym (union of all months)
  const ymSet = new Set<string>();
  for (const s of series) for (const p of s.points) ymSet.add(p.ym);
  const yms = [...ymSet].sort();
  const maps = new Map(series.map((s) => [s.id, new Map(s.points.map((p) => [p.ym, p.value]))]));
  const rows = yms.map((ym) => {
    const row: Record<string, number | string> = { ym };
    for (const s of series) { const v = maps.get(s.id)!.get(ym); if (v != null) row[s.id] = Math.round(v); }
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={380}>
      <LineChart data={rows} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid stroke="#eef0f4" vertical={false} />
        <XAxis
          dataKey="ym"
          minTickGap={44}
          tickLine={false}
          axisLine={{ stroke: "#e7e9ee" }}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          width={56}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#c2c7d0", strokeDasharray: "3 3" }} />
        <Legend iconType="plainline" wrapperStyle={{ paddingTop: 12 }} />
        {series.map((s, i) => (
          <Line
            key={s.id}
            type="monotone"
            dataKey={s.id}
            name={s.label}
            stroke={COLORS[i % COLORS.length]}
            dot={false}
            strokeWidth={2.25}
            activeDot={{ r: 4, strokeWidth: 0 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
