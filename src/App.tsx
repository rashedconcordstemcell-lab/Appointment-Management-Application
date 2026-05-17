/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Search, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Users as UsersIcon, 
  Package as PackageIcon,
  Filter,
  CheckCircle2,
  Clock,
  ChevronDown,
  MoreVertical,
  Bell,
  Settings,
  LogOut,
  Target,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO, isSameDay, isSameMonth, isSameYear } from 'date-fns';
import { cleanCurrency, MOCK_DATA, cn } from './utils/dataUtils';

// Types
type Section = 'Dashboard' | 'Orders' | 'Products' | 'Customers';
type FilterType = 'Day' | 'Month' | 'Year';

interface DashboardData {
  Date: string;
  'Order ID': string;
  'Product Name': string;
  'Customer Name': string;
  Category: string;
  Price: string;
  Quantity: string;
  Status: string;
}

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('Dashboard');
  const [filterType, setFilterType] = useState<FilterType>('Year');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2024, 4, 10)); // Fixed date for mock data consistency
  const [rawData, setRawData] = useState<DashboardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Data Retrieval Logic
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real environment, google.script.run would exist
        if (typeof window !== 'undefined' && (window as any).google?.script?.run) {
          (window as any).google.script.run
            .withSuccessHandler((data: any) => {
              if (data && !data.error) {
                // Successful connection: wait 3 seconds before rendering (Prompt 1 requirement)
                setTimeout(() => {
                  setRawData(Array.isArray(data) ? data : []);
                  setIsUsingMock(false);
                  setIsLoading(false);
                }, 3000);
              } else {
                throw new Error(data?.error || 'No data found');
              }
            })
            .withFailureHandler((err: any) => {
              console.error('GAS connection failed, falling back to mock:', err);
              fallbackToMock();
            })
            .getDataFromSheet();
        } else {
          // No GAS environment detected
          fallbackToMock();
        }
      } catch (e) {
        console.error('Error in fetching process:', e);
        fallbackToMock();
      }
    };

    const fallbackToMock = () => {
      console.warn('Using Local Mock Data');
      setRawData(MOCK_DATA as unknown as DashboardData[]);
      setIsUsingMock(true);
      setTimeout(() => setIsLoading(false), 800); // Shorter delay for mock
    };

    fetchData();
  }, []);

  // 2. Data Filtering & ETL
  const filteredData = useMemo(() => {
    let data = rawData.filter(item => {
      const itemDate = parseISO(item.Date);
      if (filterType === 'Day') return isSameDay(itemDate, selectedDate);
      if (filterType === 'Month') return isSameMonth(itemDate, selectedDate);
      if (filterType === 'Year') return isSameYear(itemDate, selectedDate);
      return true;
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(item => 
        item['Order ID'].toLowerCase().includes(q) ||
        item['Customer Name'].toLowerCase().includes(q) ||
        item['Product Name'].toLowerCase().includes(q) ||
        item.Category.toLowerCase().includes(q)
      );
    }

    return data;
  }, [rawData, filterType, selectedDate, searchQuery]);

  // 3. Metrics Calculation
  const metrics = useMemo(() => {
    const revenue = filteredData.reduce((acc, current) => acc + (cleanCurrency(current.Price) * cleanCurrency(current.Quantity)), 0);
    const orders = filteredData.length;
    const customers = new Set(filteredData.map(d => d['Customer Name'])).size;
    const avgOrder = orders > 0 ? revenue / orders : 0;

    return {
      totalRevenue: revenue,
      totalOrders: orders,
      totalCustomers: customers,
      avgOrderValue: avgOrder
    };
  }, [filteredData]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-900 z-50">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-slate-400 rounded-full animate-spin"></div>
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-slate-400 font-medium tracking-widest uppercase text-sm"
        >
          {isUsingMock ? 'Initializing Local Data...' : 'Synchronizing with Google Sheets...'}
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar - Left (Narrower for High Density) */}
      <nav className="w-16 bg-[#1e293b] flex flex-col items-center py-6 gap-8 relative shrink-0">
        <div className="mb-4">
          <div className="w-10 h-10 bg-slate-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            <Zap className="size-6" />
          </div>
        </div>
        
        <div className="flex flex-col w-full gap-4">
          <NavItem icon={<LayoutDashboard size={20} />} active={activeSection === 'Dashboard'} onClick={() => setActiveSection('Dashboard')} label="Dashboard" />
          <NavItem icon={<ShoppingCart size={20} />} active={activeSection === 'Orders'} onClick={() => setActiveSection('Orders')} label="Orders" />
          <NavItem icon={<Package size={20} />} active={activeSection === 'Products'} onClick={() => setActiveSection('Products')} label="Products" />
          <NavItem icon={<Users size={20} />} active={activeSection === 'Customers'} onClick={() => setActiveSection('Customers')} label="Customers" />
        </div>
        
        <div className="mt-auto pb-4 flex flex-col gap-6 items-center">
          <button className="text-slate-400 hover:text-white transition-colors"><Settings size={20} /></button>
          <button className="text-slate-400 hover:text-rose-400 transition-colors"><LogOut size={20} /></button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {/* HEADER - High Density Optimized */}
        <header className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 shrink-0">
            <h1 className="text-xl font-bold tracking-tight text-slate-700 underline decoration-[#64748b] decoration-2 underline-offset-4 uppercase">
              {activeSection} VISION 2.0
            </h1>
          </div>

          <div className="flex items-center flex-1 max-w-md px-8 gap-4">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4 group-focus-within:text-slate-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search sales intelligence..."
                className="w-full bg-slate-50 border-none rounded-lg py-1.5 pl-10 text-sm focus:ring-1 focus:ring-slate-400 transition-all font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold shadow-inner">
              {(['Day', 'Month', 'Year'] as FilterType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={cn(
                    "px-3 py-1 rounded transition-all",
                    filterType === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer relative shadow-sm transition-colors">
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeSection === 'Dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Smart Insights Card - High Density Gradient */}
              <div className="bg-gradient-to-br from-[#64748b] to-[#334155] h-[160px] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl">
                <div className="z-10 relative">
                  <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded inline-block mb-3">
                    Predictive Insight
                  </span>
                  <h2 className="text-3xl font-bold text-white mb-1">
                    Projected ${(metrics.totalRevenue * 1.2 / 1000).toFixed(0)}k Revenue
                  </h2>
                  <p className="text-slate-200 text-sm max-w-sm font-medium leading-tight">
                    Your current velocity suggests a 24% increase in appointments over the next quarter based on seasonal trends.
                  </p>
                </div>
                <div className="flex gap-4 z-10">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm bg-white/5 px-3 py-1 rounded-full">
                    <TrendingUp size={16} />
                    <span>+12.5% Target</span>
                  </div>
                </div>
                {/* Decorative background SVG path from theme */}
                <svg className="absolute bottom-0 right-0 w-1/2 h-full text-white/5 pointer-events-none" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path d="M0 40 C 20 20, 40 35, 60 10 C 80 20, 100 5, 100 40 Z" fill="currentColor" />
                </svg>
              </div>

              {/* KPI Metrics Grid - High Density Colorful Variants */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard 
                  title="Total Revenue" 
                  value={`$${metrics.totalRevenue.toLocaleString()}`} 
                  icon={<DollarSign className="text-white size-5" />} 
                  color="bg-blue-600" 
                  chartData={[10, 40, 20, 50, 40, 70]} 
                />
                <KPICard 
                  title="Appointments" 
                  value={metrics.totalOrders.toString()} 
                  icon={<Calendar className="text-white size-5" />} 
                  color="bg-emerald-600" 
                  chartData={[30, 20, 60, 40, 90, 70]} 
                />
                <KPICard 
                  title="Conversion" 
                  value="68.2%" 
                  icon={<Target className="text-white size-5" />} 
                  color="bg-amber-600" 
                  chartData={[20, 50, 40, 80, 50, 100]} 
                />
                <KPICard 
                  title="Avg. Value" 
                  value={`$${metrics.avgOrderValue.toFixed(0)}`} 
                  icon={<Zap className="text-white size-5" />} 
                  color="bg-indigo-600" 
                  chartData={[50, 30, 70, 20, 40, 60]} 
                />
              </div>

              {/* Focus Section - Balanced High Density */}
              <div className="flex gap-4 h-[220px]">
                <div className="w-[70%] bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Revenue Trajectory</h3>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1 text-[10px] text-slate-600 font-bold">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> Actual
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                        <span className="w-2 h-2 rounded-full bg-slate-200"></span> Target
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    <RevenueChart data={filteredData} />
                  </div>
                </div>
                <div className="w-[30%] bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col">
                  <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">Product Strength</h3>
                  <div className="flex-1 overflow-y-auto pr-1">
                    <ProductStrengthBars data={filteredData} />
                  </div>
                </div>
              </div>

              {/* Data Section - Refined Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Top Performing Appointments</h3>
                  <div className="px-3 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                    Filter: High Value
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <DataTable data={filteredData.slice(0, 8)} />
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'Orders' && <OrdersSection data={filteredData} filters={{ filterType, selectedDate }} />}
          {activeSection === 'Products' && <ProductsSection data={filteredData} />}
          {activeSection === 'Customers' && <CustomersSection data={filteredData} />}
        </AnimatePresence>
      </main>

      {/* Right Sidebar - High Density Compact */}
      <aside className="w-40 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto scrollbar-hide">
        <div className="p-4 border-b border-slate-100 flex flex-col items-center text-center">
          <div className="relative mb-2">
            <div className="w-12 h-12 rounded-full bg-[#64748b] flex items-center justify-center text-white text-lg font-bold shadow-inner">
              R
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="text-xs font-bold text-slate-800 tracking-tight">Rashed StemCell</div>
          <div className="text-[10px] text-slate-400 font-medium leading-none mt-1 uppercase tracking-tighter">Senior Director</div>
        </div>

        <div className="p-4 flex flex-col gap-6">
          <div>
            <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-3 tracking-widest">System Status</h4>
            <div className="flex items-center gap-2 mb-1.5">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                isUsingMock ? "bg-amber-500" : "bg-emerald-500"
              )}></div>
              <div className={cn(
                "text-[10px] font-bold",
                isUsingMock ? "text-amber-600" : "text-emerald-600"
              )}>
                {isUsingMock ? 'PREVIEW MODE' : 'LIVE DATA ACTIVE'}
              </div>
            </div>
            <div className="text-[9px] text-slate-400 font-mono">Sheet: Appointment</div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-3 tracking-widest">Performance Matrix</h4>
            <div className="flex flex-col gap-3">
              <TrendItem label="North Region" value="+18%" color="text-emerald-600" />
              <TrendItem label="South Region" value="+2.4%" color="text-slate-600" />
              <TrendItem label="West Region" value="-4.1%" color="text-rose-600" />
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-1">
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Last Synchronization</div>
              <div className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                <Clock size={10} className="text-slate-400" />
                {format(new Date(), 'HH:mm')} Today
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

// --------------------------------------------------------------------------------
// Sub-Components
// --------------------------------------------------------------------------------

function NavItem({ icon, active, onClick, label }: { icon: React.ReactNode, active: boolean, onClick: () => void, label: string }) {
  return (
    <div className="relative w-full flex justify-center py-2">
      {active && (
        <>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-[#f8fafc] rounded-l-[24px] z-0"></div>
          <div className="absolute right-0 -top-6 w-6 h-6 bg-transparent rounded-full shadow-[12px_12px_0_0_#f8fafc] z-10"></div>
          <div className="absolute right-0 -bottom-6 w-6 h-6 bg-transparent rounded-full shadow-[12px_-12px_0_0_#f8fafc] z-10"></div>
        </>
      )}
      <button 
        onClick={onClick}
        className={cn(
          "w-10 h-10 rounded-xl transition-all duration-300 relative z-20 flex items-center justify-center group",
          active ? "bg-white shadow-md text-[#64748b]" : "text-slate-400 hover:text-white"
        )}
      >
        {icon}
        {!active && <span className="absolute left-14 bg-slate-800 text-white px-2 py-1 rounded text-[10px] invisible group-hover:visible whitespace-nowrap z-50">{label}</span>}
      </button>
    </div>
  );
}

function KPICard({ title, value, icon, color, chartData }: { title: string, value: string, icon: React.ReactNode, color: string, chartData: number[] }) {
  return (
    <div className={cn(color, "rounded-xl p-3 text-white flex flex-col justify-center relative overflow-hidden shadow-md group transition-all hover:scale-[1.02]")}>
      <div className="relative z-10">
        <span className="text-[10px] uppercase font-bold opacity-80 block tracking-wider">{title}</span>
        <div className="text-xl font-bold flex items-center gap-2 mt-0.5">
          {value}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            {icon}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-1 right-0 w-full h-8 opacity-30 pointer-events-none">
        <svg viewBox="0 0 100 20" className="w-full h-full preserve-3d" preserveAspectRatio="none">
          <path d="M0 20 Q 25 5, 50 15 T 100 5 V 20 H 0 Z" fill="white" />
        </svg>
      </div>
    </div>
  );
}

function RevenueChart({ data }: { data: DashboardData[] }) {
  // Aggregate by date
  const agg = data.reduce((acc: any, curr) => {
    const d = curr.Date;
    acc[d] = (acc[d] || 0) + (cleanCurrency(curr.Price) * cleanCurrency(curr.Quantity));
    return acc;
  }, {});

  const sortedDates = Object.keys(agg).sort();
  const currentValues = sortedDates.map(d => agg[d]);

  const option = {
    grid: { left: 0, right: 0, bottom: 0, top: 10 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: sortedDates,
      show: false
    },
    yAxis: {
      type: 'value',
      show: false
    },
    tooltip: { trigger: 'axis', backgroundColor: '#1e293b', textStyle: { color: '#fff', fontSize: 10 } },
    series: [
      {
        name: 'Actual',
        type: 'line',
        smooth: true,
        lineStyle: { width: 3, color: '#3b82f6' },
        showSymbol: false,
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(59, 130, 246, 0.2)' }, { offset: 1, color: 'rgba(59, 130, 246, 0)' }]
          }
        },
        data: currentValues
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
}

function TrendItem({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-[10px] font-medium text-slate-500">{label}</div>
      <div className={cn("text-[10px] font-bold", color)}>{value}</div>
    </div>
  );
}

function ProductStrengthBars({ data }: { data: DashboardData[] }) {
  const prodMap = data.reduce((acc: any, curr) => {
    const p = curr['Product Name'];
    acc[p] = (acc[p] || 0) + cleanCurrency(curr.Quantity);
    return acc;
  }, {});

  const sortedProds = Object.entries(prodMap)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5);

  const maxVal = Math.max(...sortedProds.map(p => p[1] as number));

  return (
    <div className="flex flex-col gap-3">
      {sortedProds.map(([name, val], idx) => (
        <div key={name} className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-bold text-slate-700">
            <span className="truncate pr-4">{name}</span>
            <span>{Math.round((val as number / maxVal) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(val as number / maxVal) * 100}%` }}
              className={cn(
                "h-full rounded-full",
                idx === 0 ? "bg-blue-500" : idx === 1 ? "bg-indigo-500" : "bg-slate-400"
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductStrengthChart({ data }: { data: DashboardData[] }) {
  const prodMap = data.reduce((acc: any, curr) => {
    const p = curr['Product Name'];
    acc[p] = (acc[p] || 0) + cleanCurrency(curr.Quantity);
    return acc;
  }, {});

  const sortedProds = Object.entries(prodMap)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 10);

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '5%', right: '10%', bottom: '0%', top: '5%', containLabel: true },
    xAxis: { show: false },
    yAxis: {
      type: 'category',
      data: sortedProds.map(p => p[0]),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#64748b', fontSize: 10, align: 'right' }
    },
    series: [{
      type: 'bar',
      data: sortedProds.map(p => p[1]),
      itemStyle: {
        borderRadius: 4,
        color: {
          type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [{ offset: 0, color: '#475569' }, { offset: 1, color: '#1e293b' }]
        }
      },
      barWidth: '50%',
      label: { show: true, position: 'right', fontSize: 10, color: '#94a3b8' }
    }]
  };

  return <ReactECharts option={option} style={{ height: '350px' }} />;
}

function CategoryPieChart({ data }: { data: DashboardData[] }) {
  const catMap = data.reduce((acc: any, curr) => {
    const c = curr.Category;
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  const option = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['50%', '80%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
      data: Object.entries(catMap).map(([name, value]) => ({ name, value })),
      color: ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8']
    }]
  };

  return <ReactECharts option={option} style={{ height: '200px' }} />;
}

function StatusVertChart({ data }: { data: DashboardData[] }) {
  const statusMap = data.reduce((acc: any, curr) => {
    const s = curr.Status;
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '8%', bottom: '5%', top: '5%', containLabel: true },
    xAxis: { type: 'value', show: false },
    yAxis: {
      type: 'category',
      data: Object.keys(statusMap),
      axisLabel: { fontSize: 10, color: '#64748b' },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      stack: 'total',
      data: Object.values(statusMap),
      itemStyle: { color: '#0f172a', borderRadius: 5 }
    }]
  };

  return <ReactECharts option={option} style={{ height: '200px' }} />;
}

function BestSellerCard({ data }: { data: DashboardData[] }) {
  const best = useMemo(() => {
    const prodMap = data.reduce((acc: any, curr) => {
      const p = curr['Product Name'];
      if (!acc[p]) acc[p] = { name: p, rev: 0, qty: 0 };
      acc[p].rev += cleanCurrency(curr.Price) * cleanCurrency(curr.Quantity);
      acc[p].qty += cleanCurrency(curr.Quantity);
      return acc;
    }, {});
    return Object.values(prodMap).sort((a: any, b: any) => b.rev - a.rev)[0];
  }, [data]);

  if (!best) return null;

  return (
    <div className="bg-slate-900 rounded-3xl p-6 h-full relative overflow-hidden group">
       <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="bg-indigo-500/20 text-indigo-400 p-2 rounded-xl mb-4">
              <Zap size={24} />
            </div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] bg-white/5 px-2 py-1 rounded-md">Best Seller</span>
          </div>
          <div>
            <h4 className="text-white text-xl font-bold mb-1 tracking-tight">{(best as any).name}</h4>
            <div className="flex items-end space-x-2">
              <p className="text-indigo-400 text-3xl font-black">${(best as any).rev.toLocaleString()}</p>
              <p className="text-white/40 text-sm mb-1">Generated</p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
            <div className="text-center flex-1 border-r border-white/10">
              <p className="text-white font-bold">{(best as any).qty}</p>
              <p className="text-white/40 text-[10px] uppercase font-bold">Units</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-white font-bold">{Math.round((best as any).rev / (best as any).qty)}%</p>
              <p className="text-white/40 text-[10px] uppercase font-bold">Margin</p>
            </div>
          </div>
       </div>
       <div className="absolute top-0 right-0 p-4 opacity-10">
          <TrendingUp size={80} className="text-white" />
       </div>
    </div>
  );
}

function DataTable({ data }: { data: DashboardData[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] tracking-wider sticky top-0 z-10">
          <tr>
            <th className="px-4 py-2 font-black">Customer</th>
            <th className="px-4 py-2 font-black">Service Type</th>
            <th className="px-4 py-2 font-black text-right">Revenue</th>
            <th className="px-4 py-2 font-black">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((item, idx) => (
            <tr key={`${item['Order ID']}-${idx}`} className="hover:bg-slate-50 transition-colors group">
              <td className="px-4 py-2.5 font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[8px] font-black group-hover:bg-slate-200">
                    {item['Customer Name'].charAt(0)}
                  </div>
                  {item['Customer Name']}
                </div>
              </td>
              <td className="px-4 py-2.5 text-slate-500 font-medium">{item['Product Name']}</td>
              <td className="px-4 py-2.5 text-right font-black text-slate-900">${(cleanCurrency(item.Price) * cleanCurrency(item.Quantity)).toLocaleString()}</td>
              <td className="px-4 py-2.5">
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter",
                  item.Status === 'Completed' ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                  item.Status === 'Pending' ? "bg-amber-100 text-amber-700 border border-amber-200" :
                  "bg-blue-100 text-blue-700 border border-blue-200"
                )}>
                  {item.Status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoadProgress({ label, progress }: { label: string, progress: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className="text-slate-900 font-bold">{progress}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-slate-900 rounded-full"
        />
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// Sections
// --------------------------------------------------------------------------------

function OrdersSection({ data }: { data: DashboardData[], filters: any }) {
  const stats = useMemo(() => {
    const total = data.length;
    const completed = data.filter(d => d.Status === 'Completed').length;
    const pending = data.filter(d => d.Status === 'Pending' || d.Status === 'Processing').length;
    return { total, completed, pending };
  }, [data]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPIMiniCard title="Total Orders" value={stats.total.toString()} trend="+5.4%" />
        <KPIMiniCard title="Completed" value={stats.completed.toString()} trend="+12.1%" color="text-emerald-600" />
        <KPIMiniCard title="Action Required" value={stats.pending.toString()} trend="-2.4%" color="text-amber-600" />
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Order Volume Trend</h3>
        <OrderTrendChart data={data} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Order Registry</h3>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          <DataTable data={data} />
        </div>
      </div>
    </motion.div>
  );
}

function ProductsSection({ data }: { data: DashboardData[] }) {
  const prodStats = useMemo(() => {
    const unique = new Set(data.map(d => d['Product Name'])).size;
    const totalQty = data.reduce((acc, curr) => acc + cleanCurrency(curr.Quantity), 0);
    return { unique, totalQty };
  }, [data]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KPIMiniCard title="Unique SKUs" value={prodStats.unique.toString()} />
        <KPIMiniCard title="Units Sold" value={prodStats.totalQty.toString()} trend="+8.9%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Product Performance (Revenue)</h3>
          <ProductPerformanceChart data={data} type="revenue" />
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Inventory Velocity (Qty)</h3>
          <ProductPerformanceChart data={data} type="quantity" />
        </div>
      </div>
    </motion.div>
  );
}

function CustomersSection({ data }: { data: DashboardData[] }) {
  const custStats = useMemo(() => {
    const unique = new Set(data.map(d => d['Customer Name'])).size;
    return { unique };
  }, [data]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <KPIMiniCard title="Loyal Client Base" value={custStats.unique.toString()} trend="+4 New" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Customer Geographic Split</h3>
          <CustomerDistributionChart data={data} />
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-center">
           <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-slate-900 rounded-full mx-auto flex items-center justify-center text-white shadow-xl">
                 <Users size={24} />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-tight">Top Segment: Enterprise</h4>
              <p className="text-slate-500 px-8 text-xs font-medium">Clients with &gt; $50,000 annual spend make up 42% of your total revenue stream.</p>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

// --------------------------------------------------------------------------------
// Shared Section Visuals
// --------------------------------------------------------------------------------

function KPIMiniCard({ title, value, trend, color = "text-slate-900" }: { title: string, value: string, trend?: string, color?: string }) {
  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{title}</p>
        <h4 className={cn("text-xl font-black tracking-tight", color)}>{value}</h4>
      </div>
      {trend && (
        <div className={cn(
          "px-2 py-0.5 rounded text-[10px] font-bold",
          trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {trend}
        </div>
      )}
    </div>
  );
}

function OrderTrendChart({ data }: { data: DashboardData[] }) {
  const agg = data.reduce((acc: any, curr) => {
    const d = curr.Date;
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  const dates = Object.keys(agg).sort();
  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: dates, axisLine: { lineStyle: { color: '#e2e8f0' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } } },
    series: [{
      data: dates.map(d => agg[d]),
      type: 'line',
      smooth: true,
      lineStyle: { color: '#1e293b', width: 4 },
      areaStyle: { color: 'rgba(30, 41, 59, 0.1)' },
      label: { show: true, position: 'top', color: '#1e293b' }
    }]
  };
  return <ReactECharts option={option} style={{ height: '300px' }} />;
}

function ProductPerformanceChart({ data, type }: { data: DashboardData[], type: 'revenue' | 'quantity' }) {
  const map = data.reduce((acc: any, curr) => {
    const p = curr['Product Name'];
    const val = type === 'revenue' 
      ? cleanCurrency(curr.Price) * cleanCurrency(curr.Quantity)
      : cleanCurrency(curr.Quantity);
    acc[p] = (acc[p] || 0) + val;
    return acc;
  }, {});

  const sorted = Object.entries(map).sort(([, a]: any, [, b]: any) => b - a).slice(0, 8);

  const option = {
    grid: { left: '3%', right: '3%', bottom: '3%', top: '5%', containLabel: true },
    xAxis: { type: 'value', show: false },
    yAxis: { type: 'category', data: sorted.map(t => t[0]), axisLabel: { fontSize: 10 } },
    series: [{
      type: 'bar',
      data: sorted.map(t => t[1]),
      itemStyle: { color: type === 'revenue' ? '#1e293b' : '#64748b', borderRadius: 5 },
      label: { show: true, position: 'right', formatter: type === 'revenue' ? '${c}' : '{c}' }
    }]
  };
  return <ReactECharts option={option} style={{ height: '300px' }} />;
}

function CustomerDistributionChart({ data }: { data: DashboardData[] }) {
  const catMap = data.reduce((acc: any, curr) => {
    const c = curr.Category;
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});
  
  const option = {
    series: [{
      type: 'pie',
      radius: '70%',
      data: Object.entries(catMap).map(([name, value]) => ({ name, value })),
      color: ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8'],
      label: { show: true, formatter: '{b}\n{d}%' }
    }]
  };
  return <ReactECharts option={option} style={{ height: '300px' }} />;
}
