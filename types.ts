
export interface Trade {
  id: string;
  symbol: string;
  entryPrice: number;
  amount: number;
  fee: number;
  timestamp: number;
  exchange: string;
  notes?: string;
}

export interface Holding {
  symbol: string;
  amount: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
  breakEven: number;
  marketDominance: number;
  performance24h: number;
  // Index signature to support charting libraries that require record-like access
  [key: string]: string | number;
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: number;
}

export type ViewType = 'overview' | 'analytics' | 'journal' | 'advisor';
