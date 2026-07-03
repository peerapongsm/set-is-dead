import { Point } from "@/lib/types";

export interface IndexEntry {
  id: string;
  label: string;
  kind: "stock" | "benchmark" | "fund" | "global";
  category?: "RMF" | "SSF" | "ESG";
  start: string;
  end: string;
}

export async function loadIndex(): Promise<IndexEntry[]> {
  const r = await fetch(`/data/index.json`);
  return r.ok ? r.json() : [];
}

export async function loadSeries(id: string): Promise<Point[]> {
  const r = await fetch(`/data/series/${id}.json`);
  return r.ok ? r.json() : [];
}
