export interface Benchmark { id: string; label: string; ticker: string }
export interface StockDef { id: string; label: string; ticker: string }
export interface FundDef { id: string; label: string; projId: string; category: "RMF"|"SSF"|"ESG" }

export const BENCHMARKS: Benchmark[] = [
  { id: "SET50", label: "SET50 (TDEX)", ticker: "TDEX.BK" },
  { id: "SET", label: "SET Index", ticker: "^SET.BK" },
  { id: "SP500", label: "S&P 500", ticker: "^GSPC" },
  { id: "GOLD", label: "ทองคำ", ticker: "GC=F" },
  { id: "BTC", label: "Bitcoin", ticker: "BTC-USD" },
];

// Starter stock set (big, long-listed SET names). Controller expands toward SET100 during ingest.
export const STOCKS: StockDef[] = [
  { id: "PTT", label: "PTT", ticker: "PTT.BK" },
  { id: "AOT", label: "AOT", ticker: "AOT.BK" },
  { id: "CPALL", label: "CPALL", ticker: "CPALL.BK" },
  { id: "ADVANC", label: "ADVANC", ticker: "ADVANC.BK" },
  { id: "KBANK", label: "KBANK", ticker: "KBANK.BK" },
  { id: "SCB", label: "SCB", ticker: "SCB.BK" },
  { id: "BDMS", label: "BDMS", ticker: "BDMS.BK" },
  { id: "DELTA", label: "DELTA", ticker: "DELTA.BK" },
  { id: "GULF", label: "GULF", ticker: "GULF.BK" },
  { id: "CPN", label: "CPN", ticker: "CPN.BK" },
];

// Curated tax funds. Controller fills real proj_ids from the SEC fund list during ingest
// (query FundFactsheet, pick popular active RMF/SSF/ESG). IDs here are placeholders to replace.
export const TAX_FUNDS: FundDef[] = [
  { id: "K-STARRMF", label: "K-STAR RMF (หุ้นไทย)", projId: "M0405_2549", category: "RMF" },
  { id: "K-SUPSTAR-SSF", label: "K-SUPSTAR SSF (หุ้นไทย)", projId: "M0161_2563", category: "SSF" },
  { id: "K-ESGSI", label: "K-ESG SI (Thai ESG)", projId: "M0095_2567", category: "ESG" },
];
