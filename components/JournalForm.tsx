
import React, { useState } from 'react';
import { Trade } from '../types';

interface JournalFormProps {
  // Trade needs exchange, fee, symbol, entryPrice, amount
  onAddTrade: (trade: Omit<Trade, 'id' | 'timestamp'>) => void;
}

export const JournalForm: React.FC<JournalFormProps> = ({ onAddTrade }) => {
  const [symbol, setSymbol] = useState('');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !price || !amount) return;
    
    // Explicitly provide all required properties for Omit<Trade, 'id' | 'timestamp'>
    onAddTrade({
      symbol: symbol.toUpperCase(),
      entryPrice: parseFloat(price),
      amount: parseFloat(amount),
      fee: 0,
      exchange: 'MANUAL',
    });

    setSymbol('');
    setPrice('');
    setAmount('');
  };

  return (
    <div className="glass p-6 rounded-2xl">
      <h3 className="text-lg font-semibold mb-4 text-slate-200">Log New Purchase</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Asset Symbol (e.g., BTC)</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            placeholder="BTC"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Entry Price (USDT)</label>
          <input
            type="number"
            step="any"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            placeholder="50000.00"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Amount Bought</label>
          <input
            type="number"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            placeholder="0.01"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
        >
          Add to Journal
        </button>
      </form>
    </div>
  );
};
