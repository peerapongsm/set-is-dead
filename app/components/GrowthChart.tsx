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
  // merge aligned series into wide rows keyed by ym
  const yms = series[0]?.points.map((p) => p.ym) ?? [];
  const rows = yms.map((ym, i) => {
    const row: Record<string, number | string> = { ym };
    for (const s of series) row[s.id] = Math.round(s.points[i]?.value ?? 0);
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
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
