import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../types';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  HeartHandshake,
  Trash2,
  Package,
  Recycle,
  Sparkles,
  PieChart as PieChartIcon
} from 'lucide-react';

interface StatsBarProps {
  items: InventoryItem[];
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  items,
  selectedStatus,
  onSelectStatus
}) => {
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);

  const total = items.length;
  const organized = items.filter(i => i.status === 'organized').length;
  const clutter = items.filter(i => i.status === 'clutter_pending').length;
  const laterBox = items.filter(i => i.status === 'later_box').length;
  const donate = items.filter(i => i.status === 'to_donate').length;
  const recycle = items.filter(i => i.status === 'to_recycle').length;
  const discard = items.filter(i => i.status === 'to_discard').length;

  // The 3 core declutter groups requested:
  // 1. 已整理 (Organized)
  // 2. 待整理 (Pending: clutter_pending + later_box)
  // 3. 已丟棄 (Discarded / Cleared: to_discard + to_recycle + to_donate)
  const pendingTotal = clutter + laterBox;
  const discardedTotal = discard + recycle + donate;

  const organizedPercent = total > 0 ? Math.round((organized / total) * 100) : 0;
  const pendingPercent = total > 0 ? Math.round((pendingTotal / total) * 100) : 0;
  const discardedPercent = total > 0 ? Math.round((discardedTotal / total) * 100) : 0;

  // Overall declutter progress rate (items organized or cleared vs total)
  const declutterProgressRate = total > 0 ? Math.min(100, Math.round(((organized + discardedTotal) / total) * 100)) : 0;

  // Recharts Pie Chart Data for Declutter Progress
  const declutterRatioData = useMemo(() => [
    {
      id: 'organized',
      name: '已整理',
      value: organized,
      percentage: organizedPercent,
      color: '#10b981', // emerald-500
      statusKey: 'organized',
      detail: `${organized} 件已妥善定位到空間`
    },
    {
      id: 'pending',
      name: '待整理',
      value: pendingTotal,
      percentage: pendingPercent,
      color: '#f59e0b', // amber-500
      statusKey: 'clutter_pending',
      detail: `待整理 ${clutter} 件、猶豫箱 ${laterBox} 件`
    },
    {
      id: 'discarded',
      name: '已丟棄',
      value: discardedTotal,
      percentage: discardedPercent,
      color: '#f43f5e', // rose-500
      statusKey: 'to_discard',
      detail: `垃圾 ${discard} 件、回收 ${recycle} 件、捐贈 ${donate} 件`
    }
  ], [organized, pendingTotal, discardedTotal, organizedPercent, pendingPercent, discardedPercent, clutter, laterBox, discard, recycle, donate]);

  const cards = [
    {
      id: 'all',
      statusKey: '',
      title: '物品總數',
      count: total,
      subtext: '全屋登記物品',
      icon: Package,
      color: 'text-slate-700 bg-slate-100',
      activeBorder: 'border-slate-800 ring-2 ring-slate-400'
    },
    {
      id: 'stat-organized',
      statusKey: 'organized',
      title: '已定位收納',
      count: organized,
      subtext: `${organizedPercent}% 已定位`,
      icon: CheckCircle2,
      color: 'text-emerald-700 bg-emerald-50',
      activeBorder: 'border-emerald-600 ring-2 ring-emerald-300'
    },
    {
      id: 'stat-clutter',
      statusKey: 'clutter_pending',
      title: '待整理雜物',
      count: clutter,
      subtext: '等待斷捨離決策',
      icon: AlertCircle,
      color: 'text-amber-700 bg-amber-50',
      activeBorder: 'border-amber-600 ring-2 ring-amber-300'
    },
    {
      id: 'stat-later',
      statusKey: 'later_box',
      title: '猶豫暫存箱',
      count: laterBox,
      subtext: '設定期限再檢視',
      icon: Clock,
      color: 'text-indigo-700 bg-indigo-50',
      activeBorder: 'border-indigo-600 ring-2 ring-indigo-300'
    },
    {
      id: 'stat-donate',
      statusKey: 'to_donate',
      title: '待捐贈/轉售',
      count: donate,
      subtext: '給物品第二生命',
      icon: HeartHandshake,
      color: 'text-sky-700 bg-sky-50',
      activeBorder: 'border-sky-600 ring-2 ring-sky-300'
    },
    {
      id: 'stat-recycle',
      statusKey: 'to_recycle',
      title: '待資源回收',
      count: recycle,
      subtext: '五金電線塑膠紙',
      icon: Recycle,
      color: 'text-teal-700 bg-teal-50',
      activeBorder: 'border-teal-600 ring-2 ring-teal-300'
    },
    {
      id: 'stat-discard',
      statusKey: 'to_discard',
      title: '待丟棄/垃圾',
      count: discard,
      subtext: '果斷清除空間',
      icon: Trash2,
      color: 'text-rose-700 bg-rose-50',
      activeBorder: 'border-rose-600 ring-2 ring-rose-300'
    },
    {
      id: 'stat-cleared',
      statusKey: 'to_discard',
      title: '斷捨離出清',
      count: discardedTotal,
      subtext: `${discardedPercent}% 已釋出空間`,
      icon: Sparkles,
      color: 'text-purple-700 bg-purple-50',
      activeBorder: 'border-purple-600 ring-2 ring-purple-300'
    }
  ];

  return (
    <div id="stats-overview-bar" className="w-full mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left Column: Progress Bar + Stat Cards Grid (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-3">
          {/* Visual Progress Bar Card */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 mb-2 gap-2">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                整體整理與收納進度
              </span>
              <span className="font-medium text-slate-500">
                {organized} 件已定位 · {discardedTotal} 件出清 · 共 {total} 件 ({declutterProgressRate}% 達成)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${total > 0 ? (organized / total) * 100 : 0}%` }}
                title={`已定位收納: ${organized}件`}
              />
              <div
                className="bg-indigo-400 transition-all duration-500"
                style={{ width: `${total > 0 ? (laterBox / total) * 100 : 0}%` }}
                title={`猶豫暫存箱: ${laterBox}件`}
              />
              <div
                className="bg-amber-400 transition-all duration-500"
                style={{ width: `${total > 0 ? (clutter / total) * 100 : 0}%` }}
                title={`待整理雜物: ${clutter}件`}
              />
              <div
                className="bg-sky-400 transition-all duration-500"
                style={{ width: `${total > 0 ? (donate / total) * 100 : 0}%` }}
                title={`待捐贈轉售: ${donate}件`}
              />
              <div
                className="bg-teal-400 transition-all duration-500"
                style={{ width: `${total > 0 ? (recycle / total) * 100 : 0}%` }}
                title={`待資源回收: ${recycle}件`}
              />
              <div
                className="bg-rose-400 transition-all duration-500"
                style={{ width: `${total > 0 ? (discard / total) * 100 : 0}%` }}
                title={`待丟棄垃圾: ${discard}件`}
              />
            </div>
          </div>

          {/* Filterable Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {cards.map((card) => {
              const Icon = card.icon;
              const isSelected = selectedStatus === card.statusKey && card.statusKey !== '';
              return (
                <button
                  key={card.id}
                  id={`filter-stat-btn-${card.id}`}
                  onClick={() => onSelectStatus(isSelected ? '' : card.statusKey)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer bg-white ${
                    isSelected
                      ? card.activeBorder
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500 font-medium">{card.title}</span>
                    <span className={`p-1 rounded-lg ${card.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-xl font-bold text-slate-800">{card.count}</div>
                  {card.subtext && (
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">{card.subtext}</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Recharts Declutter Progress Ratio Chart (4 cols) */}
        <div
          id="declutter-progress-ratio-card"
          className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between"
        >
          {/* Chart Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">斷捨離進度比例</h4>
                <p className="text-[11px] text-slate-500">待整理 · 已整理 · 已丟棄</p>
              </div>
            </div>

            <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
              全屋 {total} 件
            </span>
          </div>

          {/* Recharts Donut Pie Chart */}
          <div className="h-36 relative flex items-center justify-center my-1">
            {total === 0 ? (
              <div className="text-xs text-slate-400 italic">尚無登記物品</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-800 pointer-events-none z-50">
                            <div className="font-bold flex items-center gap-1.5 mb-1">
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                                style={{ backgroundColor: data.color }}
                              />
                              {data.name}
                            </div>
                            <div className="text-slate-300 space-y-0.5 text-[11px]">
                              <div>數量：<span className="font-semibold text-white">{data.value} 件</span></div>
                              <div>全屋佔比：<span className="font-semibold text-emerald-400">{data.percentage}%</span></div>
                              {data.detail && (
                                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 mt-1">
                                  {data.detail}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={declutterRatioData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={62}
                    paddingAngle={4}
                    cursor="pointer"
                    onClick={(_entry, index) => {
                      const item = declutterRatioData[index];
                      if (item) {
                        onSelectStatus(selectedStatus === item.statusKey ? '' : item.statusKey);
                      }
                    }}
                    onMouseEnter={(_, index) => setHoveredPieIndex(index)}
                    onMouseLeave={() => setHoveredPieIndex(null)}
                  >
                    {declutterRatioData.map((entry, index) => {
                      const isHovered = hoveredPieIndex === index;
                      const isSelected = selectedStatus === entry.statusKey;
                      return (
                        <Cell
                          key={`cell-${entry.id}`}
                          fill={entry.color}
                          stroke={isSelected ? '#1e293b' : '#ffffff'}
                          strokeWidth={isSelected ? 2.5 : 1.5}
                          opacity={isHovered || isSelected ? 1 : 0.88}
                        />
                      );
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}

            {/* Center Donut Dynamic Metric */}
            {total > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {hoveredPieIndex !== null && declutterRatioData[hoveredPieIndex] ? (
                  <>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {declutterRatioData[hoveredPieIndex].name}
                    </span>
                    <span className="text-base font-extrabold text-slate-800 leading-tight">
                      {declutterRatioData[hoveredPieIndex].percentage}%
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {declutterRatioData[hoveredPieIndex].value} 件
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-slate-400 font-medium">斷捨離進度</span>
                    <span className="text-base font-extrabold text-slate-800 leading-tight">
                      {declutterProgressRate}%
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      已處理完成
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Interactive Legend with Clickable Filters */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {declutterRatioData.map((entry, index) => {
              const isSelected = selectedStatus === entry.statusKey;
              const isHovered = hoveredPieIndex === index;

              return (
                <button
                  key={entry.id}
                  id={`declutter-legend-${entry.id}`}
                  onClick={() => onSelectStatus(isSelected ? '' : entry.statusKey)}
                  onMouseEnter={() => setHoveredPieIndex(index)}
                  onMouseLeave={() => setHoveredPieIndex(null)}
                  title={`${entry.name}: ${entry.detail} (點擊篩選)`}
                  className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-50 border-slate-700 shadow-2xs ring-1 ring-slate-300'
                      : isHovered
                      ? 'bg-slate-50/80 border-slate-300'
                      : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-[11px] font-bold text-slate-700">{entry.name}</span>
                  </div>
                  <div className="text-xs font-extrabold text-slate-800">{entry.percentage}%</div>
                  <div className="text-[10px] text-slate-400">{entry.value} 件</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

