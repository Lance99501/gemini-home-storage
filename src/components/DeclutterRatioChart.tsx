import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../types';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowDown,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Flame,
  Award,
  ListFilter
} from 'lucide-react';

interface DeclutterRatioChartProps {
  items: InventoryItem[];
  onScrollToPendingClutter?: () => void;
}

export const DeclutterRatioChart: React.FC<DeclutterRatioChartProps> = ({
  items,
  onScrollToPendingClutter
}) => {
  const [viewMode, setViewMode] = useState<'binary' | 'detailed'>('binary');
  const [chartVisual, setChartVisual] = useState<'donut' | 'bar'>('donut');

  // Core metrics
  const totalCount = items.length;
  const pendingItems = useMemo(() => items.filter(i => i.status === 'clutter_pending'), [items]);
  const classifiedItems = useMemo(() => items.filter(i => i.status !== 'clutter_pending'), [items]);

  const pendingCount = pendingItems.length;
  const classifiedCount = classifiedItems.length;

  const pendingQty = pendingItems.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const classifiedQty = classifiedItems.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const totalQty = pendingQty + classifiedQty;

  // Breakdown of classified items
  const organizedItems = useMemo(() => items.filter(i => i.status === 'organized'), [items]);
  const donateItems = useMemo(() => items.filter(i => i.status === 'to_donate'), [items]);
  const recycleItems = useMemo(() => items.filter(i => i.status === 'to_recycle'), [items]);
  const discardItems = useMemo(() => items.filter(i => i.status === 'to_discard'), [items]);
  const laterBoxItems = useMemo(() => items.filter(i => i.status === 'later_box'), [items]);

  // Completion Percentage
  const progressPct = totalCount > 0 ? Math.round((classifiedCount / totalCount) * 100) : 0;

  // Motivational message based on progress
  const motivationalInfo = useMemo(() => {
    if (totalCount === 0) {
      return {
        badge: '尚未開始',
        color: 'text-slate-600 bg-slate-100 border-slate-200',
        quote: '在上方輸入待整理的雜物項目，開始你的斷捨離之旅！',
        icon: Sparkles
      };
    }
    if (pendingCount === 0) {
      return {
        badge: '100% 全數分類完成！',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
        quote: '太強了！所有雜物都已完成斷捨離決策，空間完全重獲新生！',
        icon: Award
      };
    }
    if (progressPct >= 80) {
      return {
        badge: '進入最後衝刺！',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
        quote: `僅剩 ${pendingCount} 件雜物待決策，堅持到底就能享受極簡清爽的環境！`,
        icon: Flame
      };
    }
    if (progressPct >= 50) {
      return {
        badge: '進度已過半！',
        color: 'text-sky-700 bg-sky-50 border-sky-300',
        quote: `已經成功整理分類了超過一半的物品 (${progressPct}%)，手感正好，繼續推進！`,
        icon: TrendingUp
      };
    }
    if (progressPct >= 20) {
      return {
        badge: '整理步上軌道',
        color: 'text-indigo-700 bg-indigo-50 border-indigo-300',
        quote: '每次勇敢做出去向決定，都在為你的生活騰出更多清爽的心靈空間。',
        icon: TrendingUp
      };
    }
    return {
      badge: '踏出第一步',
      color: 'text-amber-700 bg-amber-50 border-amber-300',
      quote: `好的開始是成功的一半！挑選最容易決定的 ${Math.min(3, pendingCount)} 件雜物先開始吧！`,
      icon: Sparkles
    };
  }, [totalCount, pendingCount, progressPct]);

  // Binary Donut Chart Data: "已分類" vs "待斷捨離"
  const binaryData = useMemo(() => {
    return [
      {
        name: '已分類處理',
        value: classifiedCount,
        qty: classifiedQty,
        fill: '#10b981', // Emerald-500
        desc: '已定位收納、捐贈、回收、丟棄或暫存'
      },
      {
        name: '待斷捨離雜物',
        value: pendingCount,
        qty: pendingQty,
        fill: '#f59e0b', // Amber-500
        desc: '等待四分法決策去向的堆積雜物'
      }
    ].filter(d => d.value > 0);
  }, [classifiedCount, classifiedQty, pendingCount, pendingQty]);

  // Detailed Breakdown Data
  const detailedData = useMemo(() => {
    return [
      {
        name: '已妥善定位收納',
        value: organizedItems.length,
        qty: organizedItems.reduce((s, i) => s + (i.quantity || 1), 0),
        fill: '#10b981',
        desc: '保留在專屬家具與格位中'
      },
      {
        name: '待捐贈/轉售',
        value: donateItems.length,
        qty: donateItems.reduce((s, i) => s + (i.quantity || 1), 0),
        fill: '#0284c7',
        desc: '物品完好送愛心機構或親友'
      },
      {
        name: '待資源回收',
        value: recycleItems.length,
        qty: recycleItems.reduce((s, i) => s + (i.quantity || 1), 0),
        fill: '#0d9488',
        desc: '紙類五金線材環保回收'
      },
      {
        name: '待丟棄垃圾',
        value: discardItems.length,
        qty: discardItems.reduce((s, i) => s + (i.quantity || 1), 0),
        fill: '#e11d48',
        desc: '損壞無用果斷清空'
      },
      {
        name: '猶豫暫存箱',
        value: laterBoxItems.length,
        qty: laterBoxItems.reduce((s, i) => s + (i.quantity || 1), 0),
        fill: '#6366f1',
        desc: '封箱等待 60 天檢驗'
      },
      {
        name: '待斷捨離雜物',
        value: pendingCount,
        qty: pendingQty,
        fill: '#f59e0b',
        desc: '散落角落尚待分類決策'
      }
    ].filter(d => d.value > 0);
  }, [organizedItems, donateItems, recycleItems, discardItems, laterBoxItems, pendingCount, pendingQty]);

  const activeChartData = viewMode === 'binary' ? binaryData : detailedData;

  // Bar Chart Data format
  const barData = useMemo(() => {
    if (viewMode === 'binary') {
      return [
        {
          name: '已分類處理',
          count: classifiedCount,
          qty: classifiedQty,
          fill: '#10b981'
        },
        {
          name: '待斷捨離',
          count: pendingCount,
          qty: pendingQty,
          fill: '#f59e0b'
        }
      ];
    }
    return detailedData.map(d => ({
      name: d.name,
      count: d.value,
      qty: d.qty,
      fill: d.fill
    }));
  }, [viewMode, classifiedCount, classifiedQty, pendingCount, pendingQty, detailedData]);

  if (totalCount === 0) {
    return null;
  }

  const MotivationalIcon = motivationalInfo.icon;

  return (
    <div
      id="declutter-ratio-chart-section"
      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs transition-all space-y-5"
    >
      {/* Header: Title & Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-800">
                整理進度與比例圖表
              </h3>
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${motivationalInfo.color}`}>
                <MotivationalIcon className="w-3 h-3" />
                {motivationalInfo.badge}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              視覺化掌握「已分類處理」與「待斷捨離雜物」的即時比例，激勵持續清理
            </p>
          </div>
        </div>

        {/* View & Chart Type Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* View Mode: Binary (已分類 vs 待斷捨離) vs Detailed (全流向細分) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium text-slate-600">
            <button
              id="ratio-view-binary-btn"
              type="button"
              onClick={() => setViewMode('binary')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'binary'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              二元對比
            </button>
            <button
              id="ratio-view-detailed-btn"
              type="button"
              onClick={() => setViewMode('detailed')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'detailed'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              細項流向
            </button>
          </div>

          {/* Chart Display: Donut vs Bar */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs text-slate-600">
            <button
              id="ratio-chart-donut-btn"
              type="button"
              onClick={() => setChartVisual('donut')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                chartVisual === 'donut'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
              title="圓餅比例圖"
            >
              <PieIcon className="w-3.5 h-3.5" />
            </button>
            <button
              id="ratio-chart-bar-btn"
              type="button"
              onClick={() => setChartVisual('bar')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                chartVisual === 'bar'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
              title="長條對比圖"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Motivational Banner & Overall Progress Bar */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-slate-200">
              {motivationalInfo.quote}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0">
            <span className="text-slate-300">整理完成度：</span>
            <span className="text-lg font-black text-emerald-400">
              {progressPct}%
            </span>
          </div>
        </div>

        {/* Dual Stacked Progress Track */}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex border border-slate-700/80 p-0.5">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out shadow-xs"
              style={{ width: `${progressPct}%` }}
              title={`已分類處理：${progressPct}%`}
            />
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${100 - progressPct}%` }}
              title={`待斷捨離雜物：${100 - progressPct}%`}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-300 px-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>已分類處理：<strong>{classifiedCount}</strong> 項 ({classifiedQty} 件)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              <span>待斷捨離雜物：<strong>{pendingCount}</strong> 項 ({pendingQty} 件)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Visual Section: Recharts Chart + Metric Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left / Center: Recharts Visual Container */}
        <div className="lg:col-span-5 bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col items-center justify-center min-h-[260px]">
          <div className="text-xs font-semibold text-slate-600 mb-1 self-start">
            {viewMode === 'binary' ? '『已分類』vs『待斷捨離』佔比' : '全體物品去向流向分佈'}
          </div>

          {chartVisual === 'donut' ? (
            <div className="relative w-full h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={84}
                    paddingAngle={3}
                  >
                    {activeChartData.map((entry, index) => (
                      <Cell key={`ratio-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const pct = totalCount > 0 ? Math.round((data.value / totalCount) * 100) : 0;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-lg text-xs space-y-1 z-50">
                            <div className="font-bold flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block"
                                style={{ backgroundColor: data.fill }}
                              />
                              {data.name}
                            </div>
                            <div className="text-slate-200">
                              項目數量：<span className="font-semibold text-emerald-300">{data.value}</span> 項
                            </div>
                            <div className="text-slate-300">
                              物品件數：<span className="font-semibold text-amber-300">{data.qty}</span> 件
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              佔總數比例：<span className="font-semibold text-white">{pct}%</span>
                            </div>
                            {data.desc && (
                              <div className="text-[10px] text-slate-400 border-t border-slate-700 pt-1 mt-1">
                                {data.desc}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Ring Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                  {progressPct}%
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  已完成分類
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const pct = totalCount > 0 ? Math.round((data.count / totalCount) * 100) : 0;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-lg text-xs space-y-1">
                            <div className="font-bold">{data.name}</div>
                            <div className="text-slate-200">
                              項目數：<span className="font-semibold text-emerald-300">{data.count}</span> 項 ({pct}%)
                            </div>
                            <div className="text-slate-300">
                              實體數量：<span className="font-semibold text-amber-300">{data.qty}</span> 件
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`bar-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right: Key Breakdown Metric Cards */}
        <div className="lg:col-span-7 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card 1: 已分類處理 */}
            <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-800">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  已分類處理
                </span>
                <span className="text-[11px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {progressPct}%
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-emerald-950">
                  {classifiedCount}
                </span>
                <span className="text-xs text-emerald-700">
                  項 ({classifiedQty} 件物品)
                </span>
              </div>
              <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                包含已妥善定位收納 ({organizedItems.length})、待捐贈 ({donateItems.length})、待回收 ({recycleItems.length})、丟棄 ({discardItems.length}) 與暫存 ({laterBoxItems.length})。
              </p>
            </div>

            {/* Card 2: 待斷捨離雜物 */}
            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-800">
                <span className="font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  待斷捨離雜物
                </span>
                <span className="text-[11px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  {100 - progressPct}%
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-amber-950">
                  {pendingCount}
                </span>
                <span className="text-xs text-amber-700">
                  項 ({pendingQty} 件待決策)
                </span>
              </div>
              <p className="text-[11px] text-amber-800/80 leading-relaxed">
                散落在各角落，尚未透過四分法決定保留收納、捐贈、回收或丟棄的物品。
              </p>
            </div>
          </div>

          {/* Quick Action Footer: Jump to Triage Workbench */}
          {pendingCount > 0 ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs gap-2">
              <div className="flex items-center gap-2 text-slate-700">
                <ListFilter className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  還有 <strong>{pendingCount}</strong> 件雜物等著你做出去向決定
                </span>
              </div>
              {onScrollToPendingClutter && (
                <button
                  id="jump-to-triage-workbench-btn"
                  type="button"
                  onClick={onScrollToPendingClutter}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                >
                  <span>立即整理</span>
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>雜物堆零待辦！</strong> 所有散落物品都已妥善分配定位或送往適當渠道。
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
