
import React from 'react';
import { Holding } from '../types';

interface HoldingsTableProps {
  holdings: Holding[];
  onDelete: (symbol: string) => void;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings, onDelete }) => {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-200">Current Holdings</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Asset</th>
              <th className="px-6 py-4 font-medium">Balance</th>
              <th className="px-6 py-4 font-medium text-right">Avg Price</th>
              <th className="px-6 py-4 font-medium text-right">Current Price</th>
              <th className="px-6 py-4 font-medium text-right">Value (USDT)</th>
              <th className="px-6 py-4 font-medium text-right">Profit / Loss</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {holdings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No assets tracked yet. Log your first trade to see analytics.
                </td>
              </tr>
            ) : (
              holdings.map((holding) => (
                <tr key={holding.symbol} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center mr-3 font-bold text-indigo-400 text-xs">
                        {holding.symbol.substring(0, 2)}
                      </div>
                      <span className="font-semibold text-slate-200">{holding.symbol}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-300">
                    {holding.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400">
                    {/* Fix: Changed averagePrice to avgPrice to match Holding interface */}
                    ${holding.avgPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-200 font-medium">
                    ${holding.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-200">
                    ${holding.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={`flex flex-col items-end ${holding.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <span className="font-bold">
                        {holding.pnl >= 0 ? '+' : ''}${Math.abs(holding.pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs opacity-80">
                        {holding.pnl >= 0 ? '▲' : '▼'} {Math.abs(holding.pnlPercent).toFixed(2)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
