import React from 'react';
import { InventoryItem } from '../types';
import { CheckCircle2, AlertCircle, Clock, HeartHandshake, Trash2, Package, Recycle } from 'lucide-react';

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
  const total = items.length;
  const organized = items.filter(i => i.status === 'organized').length;
  const clutter = items.filter(i => i.status === 'clutter_pending').length;
  const laterBox = items.filter(i => i.status === 'later_box').length;
  const donate = items.filter(i => i.status === 'to_donate').length;
  const recycle = items.filter(i => i.status === 'to_recycle').length;
  const discard = items.filter(i => i.status === 'to_discard').length;

  const organizedPercent = total > 0 ? Math.round((organized / total) * 100) : 0;

  const cards = [
    {
      id: 'all',
      statusKey: '',
      title: '物品總數',
      count: total,
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
    }
  ];

  return (
    <div id="stats-overview-bar" className="w-full mb-6">
      {/* Visual Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs mb-3">
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 mb-2 gap-2">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            整體整理與收納進度
          </span>
          <span className="font-medium text-slate-500">
            {organized} 件已妥善定位 / 共 {total} 件 ({organizedPercent}%)
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
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {cards.map((card) => {
          const Icon = card.icon;
          const isSelected = selectedStatus === card.statusKey;
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
  );
};
