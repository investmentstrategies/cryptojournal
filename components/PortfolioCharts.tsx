
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Holding } from '../types';

interface PortfolioChartsProps {
  holdings: Holding[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

export const PortfolioCharts: React.FC<PortfolioChartsProps> = ({ holdings }) => {
  const data = holdings.map(h => ({
    name: h.symbol,
    value: h.value
  }));

  if (holdings.length === 0) return null;

  return (
    <div className="glass p-6 rounded-2xl h-[400px]">
      <h3 className="text-lg font-semibold mb-4 text-slate-200">Asset Allocation</h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
