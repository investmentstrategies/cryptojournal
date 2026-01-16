
import React from 'react';

export const DashboardHeader: React.FC = () => {
  return (
    <header className="flex justify-between items-center py-6 border-b border-slate-800">
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Aether</h1>
        <p className="text-slate-400 text-sm">Crypto Asset Management & Journal</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs text-slate-500 uppercase font-semibold">Active Session</span>
          <span className="text-emerald-400 text-sm font-medium flex items-center">
            <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
            Live Market Feed
          </span>
        </div>
      </div>
    </header>
  );
};
