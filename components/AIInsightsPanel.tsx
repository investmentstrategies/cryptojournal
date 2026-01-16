
import React, { useState } from 'react';
// Corrected the import name to match getQuantReport in geminiService
import { getQuantReport } from '../services/geminiService';
import { Holding } from '../types';

interface AIInsightsPanelProps {
  holdings: Holding[];
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ holdings }) => {
  // State to hold analyzed insights for rendering
  const [insights, setInsights] = useState<{title: string, body: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFetchInsights = async () => {
    if (holdings.length === 0) return;
    setLoading(true);
    // Use getQuantReport and map the specific fields returned by the Gemini AI service
    const result = await getQuantReport(holdings);
    if (result) {
      setInsights([
        { title: 'Risk Factor', body: result.riskLevel || 'Unknown' },
        { title: 'Rebalance Move', body: result.rebalanceStrategy || 'No suggestions' },
        { title: 'Macro Outlook', body: result.marketOutlook || 'Data unavailable' }
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="glass p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/20 border-indigo-500/20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center text-slate-200">
          <span className="mr-2">✨</span> AI Strategist Insights
        </h3>
        <button 
          onClick={handleFetchInsights}
          disabled={loading || holdings.length === 0}
          className="text-xs bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-bold py-1 px-3 rounded-full transition-all"
        >
          {loading ? 'Analyzing...' : 'Refresh Insights'}
        </button>
      </div>

      <div className="space-y-3">
        {insights.length > 0 ? (
          insights.map((insight, idx) => (
            // Render mapped insight objects correctly
            <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 leading-relaxed">
              <div className="font-bold text-indigo-300 mb-1">{insight.title}</div>
              <div>{insight.body}</div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-slate-500 italic text-sm">
            {holdings.length === 0 ? "Add assets to get custom AI insights." : "Click refresh for portfolio analysis."}
          </div>
        )}
      </div>
    </div>
  );
};
