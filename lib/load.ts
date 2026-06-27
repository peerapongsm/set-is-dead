import { Point } from "@/lib/types";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export interface IndexEntry {
  id: string;
  label: string;
  kind: "stock" | "benchmark" | "fund";
  category?: "RMF" | "SSF" | "ESG";
  start: string;
  end: string;
}

export async function loadIndex(): Promise<IndexEntry[]> {
  const r = await fetch(`${BASE}/data/index.json`);
  return r.ok ? r.json() : [];
}

export async function loadSeries(id: string): Promise<Point[]> {
  const r = await fetch(`${BASE}/data/series/${id}.json`);
  return r.ok ? r.json() : [];
}
