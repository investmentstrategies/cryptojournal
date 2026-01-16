
import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  isPositive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, isPositive }) => {
  return (
    <div className="glass p-6 rounded-2xl flex flex-col justify-between">
      <span className="text-slate-400 text-sm font-medium">{label}</span>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        {subValue && (
          <div className={`text-sm mt-1 ${isPositive === true ? 'text-emerald-400' : isPositive === false ? 'text-rose-400' : 'text-slate-500'}`}>
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
};
