import React from 'react';
import { AlertTriangle, CheckCircle, Flame, Layers } from 'lucide-react';

export type StressLevel = 'spacious' | 'comfortable' | 'warning' | 'overloaded';

export interface StressConfig {
  level: StressLevel;
  label: string;
  badgeLabel: string;
  fillPercentage: number;
  textColor: string;
  bgColor: string;
  borderColor: string;
  barColor: string;
  pulseClass?: string;
  description: string;
  suggestion: string;
}

export function calculateStorageStress(
  itemCount: number,
  totalQuantity: number,
  clutterCount: number = 0,
  maxCapacityThreshold: number = 10
): StressConfig {
  // Effective burden score: count + extra weight for pending clutter
  const burdenScore = itemCount + (clutterCount * 1.5);
  const ratio = Math.min(Math.round((burdenScore / maxCapacityThreshold) * 100), 100);

  if (itemCount === 0) {
    return {
      level: 'spacious',
      label: '極為寬鬆',
      badgeLabel: '空置留白',
      fillPercentage: 5,
      textColor: 'text-slate-500',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      barColor: 'bg-slate-300',
      description: '空間充裕，具備高度留白餘裕',
      suggestion: '可作為後續整理搬移的暫存緩衝區'
    };
  }

  if (burdenScore <= 3) {
    return {
      level: 'spacious',
      label: '空間舒適',
      badgeLabel: '餘裕 80%+',
      fillPercentage: Math.max(ratio, 20),
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      barColor: 'bg-emerald-500',
      description: '收納井然有序，留白充足易取易放',
      suggestion: '維持現狀即可，遵守「拿一出一」原則'
    };
  }

  if (burdenScore <= 6) {
    return {
      level: 'comfortable',
      label: '收納適中',
      badgeLabel: '黃金七分滿',
      fillPercentage: Math.max(ratio, 55),
      textColor: 'text-sky-700',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      barColor: 'bg-sky-500',
      description: '處於健康收納量（符合空間七分飽原則）',
      suggestion: '注意物品固定歸位，定期清點零散備品'
    };
  }

  if (burdenScore <= 9) {
    return {
      level: 'warning',
      label: '收納緊繃',
      badgeLabel: '瀕臨擁擠',
      fillPercentage: Math.max(ratio, 82),
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300',
      barColor: 'bg-amber-500',
      pulseClass: 'ring-1 ring-amber-300',
      description: '物品較多，翻找物品時容易翻亂相鄰物件',
      suggestion: '建議進行小規模斷捨離，挑出不再使用的過期品'
    };
  }

  return {
    level: 'overloaded',
    label: '高度超載',
    badgeLabel: '急需整頓！',
    fillPercentage: Math.max(ratio, 96),
    textColor: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-300',
    barColor: 'bg-rose-500',
    pulseClass: 'ring-2 ring-rose-400 shadow-xs',
    description: '收納壓力爆表，堆疊過多導致找不到與難以歸位',
    suggestion: '強烈建議啟動集中斷捨離，將待回收或待丟棄雜物立即移出！'
  };
}

export const StorageStressGauge: React.FC<{
  itemCount: number;
  totalQuantity: number;
  clutterCount?: number;
  compact?: boolean;
  showDetails?: boolean;
  threshold?: number;
}> = ({
  itemCount,
  totalQuantity,
  clutterCount = 0,
  compact = false,
  showDetails = true,
  threshold = 8
}) => {
  const stress = calculateStorageStress(itemCount, totalQuantity, clutterCount, threshold);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 sm:w-20 bg-slate-200/80 rounded-full h-2 overflow-hidden shrink-0">
          <div
            className={`h-full ${stress.barColor} transition-all duration-500`}
            style={{ width: `${stress.fillPercentage}%` }}
          />
        </div>
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${stress.bgColor} ${stress.textColor} ${stress.borderColor}`}
        >
          {stress.badgeLabel}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-2.5 rounded-xl border ${stress.bgColor} ${stress.borderColor} space-y-1.5`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
          {stress.level === 'overloaded' ? (
            <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
          ) : stress.level === 'warning' ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span>填充度 / 收納壓力：</span>
          <span className={`font-bold ${stress.textColor}`}>{stress.label}</span>
        </div>
        <span className="text-[11px] font-bold text-slate-600">
          約 {stress.fillPercentage}% 滿
        </span>
      </div>

      <div className="w-full bg-slate-200/90 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${stress.barColor} transition-all duration-500 rounded-full`}
          style={{ width: `${stress.fillPercentage}%` }}
        />
      </div>

      {showDetails && (
        <div className="flex items-center justify-between text-[11px] pt-0.5">
          <span className="text-slate-600">{stress.description}</span>
          <span className={`font-medium ${stress.textColor} shrink-0 text-[10px]`}>
            {stress.suggestion}
          </span>
        </div>
      )}
    </div>
  );
};
