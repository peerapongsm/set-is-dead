export interface Point { ym: string; value: number }
export interface Series {
  id: string; label: string;
  kind: "stock" | "benchmark" | "fund" | "global";
  category?: "RMF" | "SSF" | "ESG";
  points: Point[];
}
