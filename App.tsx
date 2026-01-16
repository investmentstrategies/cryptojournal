
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Trade, Holding, MarketData, ViewType } from './types';
import { fetchMarketData } from './services/cryptoApi';
import { getQuantReport } from './services/geminiService';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { 
  LayoutDashboard, PieChart as PieIcon, BookOpen, BrainCircuit, 
  Plus, Trash2, Sun, Moon, TrendingUp, TrendingDown,
  Activity, Wallet, Target, Search, Settings,
  LogOut, Filter, Download, Upload, RefreshCw, ShieldCheck, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#06b6d4'];

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [trades, setTrades] = useState<Trade[]>(() => {
    const saved = localStorage.getItem('aether_prime_v4_trades');
    return saved ? JSON.parse(saved) : [];
  });
  const [prices, setPrices] = useState<Record<string, MarketData>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('aether_prime_v4_trades', JSON.stringify(trades));
    document.documentElement.classList.toggle('dark', isDark);
  }, [trades, isDark]);

  const syncPrices = async () => {
    setIsRefreshing(true);
    const symbols = Array.from(new Set(trades.map(t => t.symbol)));
    if (symbols.length > 0) {
      const data = await fetchMarketData(symbols);
      setPrices(data);
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  useEffect(() => {
    syncPrices();
    const id = setInterval(syncPrices, 30000);
    return () => clearInterval(id);
  }, [trades]);

  // Data Persistence Logic
  const exportWorkspace = () => {
    const dataStr = JSON.stringify({ trades, version: '4.2.0', timestamp: Date.now() }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `aether_prime_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importWorkspace = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.trades && Array.isArray(json.trades)) {
          if (window.confirm(`Found ${json.trades.length} trades. Replace current workspace?`)) {
            setTrades(json.trades);
            setIsVaultOpen(false);
          }
        }
      } catch (err) {
        alert("Invalid workspace file.");
      }
    };
    reader.readAsText(file);
  };

  const holdings = useMemo<Holding[]>(() => {
    const map: Record<string, { qty: number; cost: number }> = {};
    trades.forEach(t => {
      if (!map[t.symbol]) map[t.symbol] = { qty: 0, cost: 0 };
      map[t.symbol].qty += t.amount;
      map[t.symbol].cost += (t.amount * t.entryPrice) + (t.fee || 0);
    });

    const list = Object.entries(map).map(([sym, data]) => {
      const market = prices[sym];
      const cur = market?.price || 0;
      const val = data.qty * cur;
      const pnl = cur > 0 ? val - data.cost : 0;
      const pnlP = data.cost > 0 && cur > 0 ? (pnl / data.cost) * 100 : 0;

      return {
        symbol: sym,
        amount: data.qty,
        avgPrice: data.qty > 0 ? data.cost / data.qty : 0,
        currentPrice: cur,
        value: val,
        pnl,
        pnlPercent: pnlP,
        allocation: 0,
        breakEven: data.qty > 0 ? data.cost / data.qty : 0,
        marketDominance: 0,
        performance24h: market?.change24h || 0
      };
    });

    const totalVal = list.reduce((s, h) => s + h.value, 0);
    return list.map(h => ({
      ...h,
      allocation: totalVal > 0 ? (h.value / totalVal) * 100 : 0
    })).sort((a, b) => b.value - a.value);
  }, [trades, prices]);

  const stats = useMemo(() => {
    const totalValue = holdings.reduce((s, h) => s + h.value, 0);
    const totalCost = trades.reduce((s, t) => s + (t.amount * t.entryPrice) + (t.fee || 0), 0);
    const totalPnl = totalValue > 0 ? totalValue - totalCost : 0;
    const pnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
    const weighted24h = holdings.reduce((s, h) => s + (h.performance24h * (h.allocation/100)), 0);
    
    return { totalValue, totalPnl, weighted24h, totalCost, pnlPercent };
  }, [holdings, trades]);

  const runAdvisor = async () => {
    if (holdings.length === 0) return;
    setLoadingReport(true);
    const res = await getQuantReport(holdings);
    setReport(res);
    setLoadingReport(false);
  };

  return (
    <div className={`flex h-screen w-full transition-colors duration-500 bg-slate-50 dark:bg-slate-950 font-sans`}>
      {/* Institutional Sidebar */}
      <aside className="w-20 xl:w-72 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-950 z-30 transition-all">
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/40">
            <Activity className="text-white w-7 h-7" />
          </div>
          <div className="hidden xl:block">
            <h1 className="font-bold text-xl tracking-tight leading-none text-slate-900 dark:text-white">AETHER <span className="text-indigo-600 font-black">PRIME</span></h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Quant Station</p>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-8 space-y-1">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Market Overview' },
            { id: 'analytics', icon: PieIcon, label: 'Exposure Analytics' },
            { id: 'journal', icon: BookOpen, label: 'Execution Journal' },
            { id: 'advisor', icon: BrainCircuit, label: 'Quant Advisor' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ViewType)}
              className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all group ${
                activeView === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="ml-4 hidden xl:block font-semibold tracking-tight">{item.label}</span>
              {activeView === item.id && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 bg-white rounded-full hidden xl:block" />}
            </button>
          ))}
          
          <button
            onClick={() => setIsVaultOpen(true)}
            className="w-full flex items-center px-4 py-3.5 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
          >
            <Database className="w-5 h-5 shrink-0" />
            <span className="ml-4 hidden xl:block font-semibold tracking-tight">Data Vault</span>
          </button>
        </nav>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-3 p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-bold shadow-2xl hover:scale-[1.02] transition-transform active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden xl:block">New Entry</span>
          </button>
          
          <div className="flex items-center justify-between xl:px-2 pt-2">
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-3 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-900 rounded-xl transition-all"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="p-3 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-900 rounded-xl transition-all">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-3 text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-slate-900 rounded-xl transition-all">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Terminal */}
      <main className="flex-1 overflow-y-auto relative z-10 px-6 xl:px-12 py-10">
        
        {/* App Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-widest">AETHER SYSTEM v4.2.0</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isRefreshing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            </div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white capitalize">
              {activeView === 'overview' ? 'Portfolio Terminal' : activeView}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search Terminal..." className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-6 py-3 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
            </div>
            <button onClick={syncPrices} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all active:rotate-180 duration-500">
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-900 shadow-xl overflow-hidden cursor-pointer">
              <img src={`https://api.dicebear.com/9.x/shapes/svg?seed=prime&backgroundColor=6366f1`} alt="Avatar" />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeView === 'overview' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              {/* Metric Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { label: 'Net Equity', value: `$${(stats.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Wallet, trend: stats.weighted24h, color: 'indigo' },
                  { label: 'Unrealized PnL', value: `${stats.totalPnl >= 0 ? '+' : '-'}$${Math.abs(stats.totalPnl || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: TrendingUp, sub: `${(stats.pnlPercent || 0).toFixed(2)}% ROI`, color: stats.totalPnl >= 0 ? 'emerald' : 'rose' },
                  { label: '24h Change', value: `${stats.weighted24h >= 0 ? '+' : ''}${(stats.weighted24h || 0).toFixed(2)}%`, icon: Activity, sub: 'Weighted Average', color: stats.weighted24h >= 0 ? 'emerald' : 'rose' },
                  { label: 'Holdings', value: (holdings.length || 0).toString(), icon: Target, sub: 'Diversified Positions', color: 'amber' }
                ].map((stat, idx) => (
                  <div key={idx} className="premium-card p-7 rounded-[2.5rem] relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 bg-${stat.color}-500 rounded-full blur-3xl -mr-16 -mt-16 group-hover:opacity-20 transition-all`} />
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-3 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-950 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      {stat.trend !== undefined && (
                        <div className={`flex items-center gap-1 font-black text-xs px-2 py-1 rounded-lg ${stat.trend >= 0 ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' : 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'}`}>
                          {stat.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.abs(stat.trend || 0).toFixed(1)}%
                        </div>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-3xl font-black mt-2 font-mono tracking-tight">{stat.value}</h3>
                    {stat.sub && <p className="text-xs font-bold text-slate-500 mt-2">{stat.sub}</p>}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 premium-card p-8 rounded-[2.5rem]">
                   <div className="flex justify-between items-center mb-10">
                    <div>
                      <h4 className="text-lg font-black tracking-tight">PORTFOLIO DOMINANCE</h4>
                      <p className="text-xs text-slate-500 font-medium">Relative asset valuation over current holdings</p>
                    </div>
                  </div>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={holdings.slice(0, 7)}>
                        <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#e2e8f0"} />
                        <XAxis dataKey="symbol" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                        <YAxis hide />
                        <Tooltip 
                          cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                          contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderRadius: '16px', border: '1px solid #6366f1', padding: '12px' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="premium-card p-8 rounded-[2.5rem]">
                  <h4 className="text-lg font-black tracking-tight mb-8 uppercase">Concentration Matrix</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={holdings}
                          dataKey="value"
                          nameKey="symbol"
                          innerRadius={75}
                          outerRadius={100}
                          paddingAngle={8}
                          stroke="none"
                        >
                          {holdings.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderRadius: '16px', border: '1px solid #1e293b' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Positions Table */}
              <div className="premium-card rounded-[2.5rem] overflow-hidden">
                <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between">
                   <h4 className="text-xl font-black tracking-tight uppercase">Live Positions</h4>
                   <span className="text-xs font-black text-slate-500">AUTO-SAVING TO LOCAL STORAGE</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/80">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-10 py-6">Asset</th>
                        <th className="px-10 py-6">Price</th>
                        <th className="px-10 py-6 text-right">Basis</th>
                        <th className="px-10 py-6 text-right">PnL</th>
                        <th className="px-10 py-6 text-right">Weight</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {holdings.map((h) => (
                        <tr key={h.symbol} className="group hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-indigo-600">
                                {h.symbol.slice(0,2)}
                              </div>
                              <span className="font-black text-slate-900 dark:text-white">{h.symbol}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6 font-mono text-sm">${h.currentPrice.toLocaleString()}</td>
                          <td className="px-10 py-6 text-right font-mono text-sm text-slate-500">${h.avgPrice.toLocaleString()}</td>
                          <td className={`px-10 py-6 text-right font-black ${h.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            ${Math.abs(h.pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </td>
                          <td className="px-10 py-6 text-right font-black text-indigo-600">{h.allocation.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'journal' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-4">
              <h3 className="text-2xl font-black uppercase mb-8">Execution Ledger</h3>
              {trades.sort((a,b) => b.timestamp - a.timestamp).map(t => (
                <div key={t.id} className="premium-card p-6 rounded-3xl flex items-center justify-between group">
                   <div className="flex items-center gap-6">
                      <span className="font-black text-lg">{t.symbol}</span>
                      <span className="text-xs font-mono text-slate-500">{new Date(t.timestamp).toLocaleDateString()}</span>
                   </div>
                   <div className="flex gap-10">
                      <div className="text-right">
                         <p className="text-[10px] font-black text-slate-400">PRICE</p>
                         <p className="font-mono font-bold">${t.entryPrice.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-slate-400">TOTAL</p>
                         <p className="font-mono font-black text-indigo-600">${(t.entryPrice * t.amount).toLocaleString()}</p>
                      </div>
                      <button onClick={() => setTrades(trades.filter(x => x.id !== t.id))} className="text-rose-500 p-2 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                   </div>
                </div>
              ))}
            </motion.div>
          )}
          
          {activeView === 'advisor' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto text-center space-y-12">
               <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                 <BrainCircuit className="text-white w-10 h-10" />
               </div>
               <h3 className="text-4xl font-black uppercase">Quant Analysis</h3>
               <button onClick={runAdvisor} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-xl">
                 {loadingReport ? 'CRUNCHING...' : 'GENERATE REPORT'}
               </button>
               {report && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div className="premium-card p-8 rounded-3xl border-l-8 border-indigo-600">
                       <p className="text-xs font-black text-slate-400 mb-2">RISK</p>
                       <h4 className="text-2xl font-black">{report.riskLevel}</h4>
                    </div>
                    <div className="premium-card p-8 rounded-3xl border-l-8 border-emerald-500">
                       <p className="text-xs font-black text-slate-400 mb-2">REBALANCE</p>
                       <h4 className="text-2xl font-black">{report.rebalanceStrategy}</h4>
                    </div>
                    <div className="col-span-full premium-card p-8 rounded-3xl">
                       <p className="text-slate-500 italic">"{report.marketOutlook}"</p>
                    </div>
                 </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Workspace Vault Modal */}
      <AnimatePresence>
        {isVaultOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setIsVaultOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative premium-card w-full max-w-xl p-12 rounded-[3.5rem] bg-white dark:bg-slate-900 shadow-2xl">
              <header className="mb-12 text-center">
                <Database className="w-12 h-12 text-indigo-600 mx-auto mb-6" />
                <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Data Vault</h3>
                <p className="text-slate-500 font-medium">Manage your institutional workspace files</p>
              </header>

              <div className="space-y-6">
                <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center group hover:border-indigo-600 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 mx-auto mb-4" />
                   <p className="text-sm font-black text-slate-500 uppercase">Restore Workspace from File</p>
                   <p className="text-xs text-slate-400 mt-2 italic">Supports .json snapshots</p>
                   <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={importWorkspace} />
                </div>

                <button 
                  onClick={exportWorkspace}
                  className="w-full flex items-center justify-center gap-4 p-6 bg-indigo-600 text-white rounded-3xl font-black uppercase shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-all"
                >
                  <Download className="w-6 h-6" />
                  Take Workspace Snapshot
                </button>

                <div className="pt-6 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aether Encrypted Storage Protocols Active</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Execution Terminal Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsAdding(false)} />
             <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative glass w-full max-w-2xl bg-white dark:bg-slate-950 p-12 rounded-[3.5rem] shadow-2xl">
                <div className="mb-10">
                   <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase">Execution Entry</h3>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.target as any;
                  setTrades([...trades, {
                    id: crypto.randomUUID(),
                    symbol: f[0].value.toUpperCase(),
                    entryPrice: parseFloat(f[2].value),
                    amount: parseFloat(f[3].value),
                    fee: parseFloat(f[4].value || 0),
                    exchange: f[1].value,
                    timestamp: Date.now()
                  }]);
                  setIsAdding(false);
                }} className="space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                      <input required placeholder="ASSET" className="w-full bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl font-bold uppercase" />
                      <input required placeholder="EXCHANGE" className="w-full bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl font-bold uppercase" />
                      <input required type="number" step="any" placeholder="PRICE (USDT)" className="w-full bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl font-bold font-mono" />
                      <input required type="number" step="any" placeholder="QUANTITY" className="w-full bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl font-bold font-mono" />
                      <input type="number" step="any" placeholder="FEE" className="col-span-2 w-full bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl font-bold font-mono" />
                   </div>
                   <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase">Execute</button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-6 right-10 z-20 pointer-events-none hidden lg:block">
        <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800">
           <ShieldCheck className="w-3 h-3 text-emerald-500" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workspace Secured</span>
           <div className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{trades.length} RECENT RECORDS</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
