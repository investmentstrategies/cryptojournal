
import { MarketData } from '../types';

export const fetchMarketData = async (symbols: string[]): Promise<Record<string, MarketData>> => {
  if (symbols.length === 0) return {};
  
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
    const allTickers = await response.json();
    
    const results: Record<string, MarketData> = {};
    
    symbols.forEach(sym => {
      const upperSym = sym.toUpperCase();
      const pair = `${upperSym}USDT`;
      const ticker = allTickers.find((t: any) => t.symbol === pair);
      
      if (ticker) {
        results[upperSym] = {
          symbol: upperSym,
          price: parseFloat(ticker.lastPrice),
          change24h: parseFloat(ticker.priceChangePercent),
          high24h: parseFloat(ticker.highPrice),
          low24h: parseFloat(ticker.lowPrice),
          volume: parseFloat(ticker.quoteVolume)
        };
      } else if (upperSym === 'USDT' || upperSym === 'USDC') {
        results[upperSym] = { 
          symbol: upperSym, 
          price: 1, 
          change24h: 0, 
          high24h: 1, 
          low24h: 1, 
          volume: 0 
        };
      }
    });
    
    return results;
  } catch (err) {
    console.error("Critical: Price fetch failed", err);
    return {};
  }
};
