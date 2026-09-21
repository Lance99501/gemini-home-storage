import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  HeartHandshake,
  Recycle,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Award,
  ArrowRight,
  RotateCcw,
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Package
} from 'lucide-react';

interface DeclutterProgressDashboardProps {
  items: InventoryItem[];
  onUpdateItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
  onOrganizeItem: (item: InventoryItem) => void;
}

export const DeclutterProgressDashboard: React.FC<DeclutterProgressDashboardProps> = ({
  items,
  onUpdateItem,
  onDeleteItem,
  onOrganizeItem
}) => {
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'to_donate' | 'to_recycle' | 'to_discard'>('all');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [copiedToast, setCopiedToast] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter items in declutter categories
  const donateItems = useMemo(() => items.filter(i => i.status === 'to_donate'), [items]);
  const recycleItems = useMemo(() => items.filter(i => i.status === 'to_recycle'), [items]);
  const discardItems = useMemo(() => items.filter(i => i.status === 'to_discard'), [items]);

  // Quantities
  const donateCount = donateItems.length;
  const donateTotalQty = donateItems.reduce((sum, i) => sum + (i.quantity || 1), 0);

  const recycleCount = recycleItems.length;
  const recycleTotalQty = recycleItems.reduce((sum, i) => sum + (i.quantity || 1), 0);

  const discardCount = discardItems.length;
  const discardTotalQty = discardItems.reduce((sum, i) => sum + (i.quantity || 1), 0);

  const totalClearedCount = donateCount + recycleCount + discardCount;
  const totalClearedQty = donateTotalQty + recycleTotalQty + discardTotalQty;

  // Chart Data: Channel Comparison
  const channelData = useMemo(() => [
    {
      name: '待捐贈/轉售',
      key: 'to_donate',
      count: donateCount,
      qty: donateTotalQty,
      fill: '#0284c7', // Sky-600
      lightBg: 'bg-sky-50',
      textColor: 'text-sky-700',
      borderColor: 'border-sky-200',
      icon: HeartHandshake,
      description: '功能良好，送愛心機構或親友二手再利用'
    },
    {
      name: '待資源回收',
      key: 'to_recycle',
      count: recycleCount,
      qty: recycleTotalQty,
      fill: '#0d9488', // Teal-600
      lightBg: 'bg-teal-50',
      textColor: 'text-teal-700',
      borderColor: 'border-teal-200',
      icon: Recycle,
      description: '電器廢線、紙類五金塑膠，清潔隊資源車回收'
    },
    {
      name: '待丟棄垃圾',
      key: 'to_discard',
      count: discardCount,
      qty: discardTotalQty,
      fill: '#e11d48', // Rose-600
      lightBg: 'bg-rose-50',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-200',
      icon: Trash2,
      description: '過期損壞無用，果斷裝袋丟一般垃圾'
    }
  ], [donateCount, donateTotalQty, recycleCount, recycleTotalQty, discardCount, discardTotalQty]);

  // Donut chart pie data
  const pieData = useMemo(() => {
    return channelData
      .filter(c => c.count > 0)
      .map(c => ({
        name: c.name,
        value: c.count,
        qty: c.qty,
        fill: c.fill
      }));
  }, [channelData]);

  // Items to display based on active category
  const displayedItems = useMemo(() => {
    if (activeCategoryTab === 'to_donate') return donateItems;
    if (activeCategoryTab === 'to_recycle') return recycleItems;
    if (activeCategoryTab === 'to_discard') return discardItems;
    return [...donateItems, ...recycleItems, ...discardItems];
  }, [activeCategoryTab, donateItems, recycleItems, discardItems]);

  // Achievement level calculation
  const achievement = useMemo(() => {
    if (totalClearedCount === 0) {
      return { title: '準備起跑', level: 0, desc: '剛開始整理，請將待處理雜物標記去向！' };
    }
    if (totalClearedCount < 5) {
      return { title: '斷捨離新手', level: 1, desc: '邁出美好第一步，空間已經開始呼吸！' };
    }
    if (totalClearedCount < 12) {
      return { title: '整理行動家', level: 2, desc: '成效斐然！顯著減少雜物負擔。' };
    }
    return { title: '斷捨離大師', level: 3, desc: '清爽俐落！居家空間大幅解放。' };
  }, [totalClearedCount]);

  // Copy checklist to clipboard
  const handleCopyList = () => {
    const lines = [
      `【斷捨離清出成果清單】`,
      `總計清出：${totalClearedCount} 項目 (共 ${totalClearedQty} 件)`,
      `──────────────────────`,
      `📦 待捐贈/轉售 (${donateCount} 項 / ${donateTotalQty} 件):`,
      ...donateItems.map(i => `  • ${i.name} × ${i.quantity}${i.unit} (${i.location.room})`),
      ``,
      `♻️ 待資源回收 (${recycleCount} 項 / ${recycleTotalQty} 件):`,
      ...recycleItems.map(i => `  • ${i.name} × ${i.quantity}${i.unit} (${i.location.room})`),
      ``,
      `🗑️ 待丟棄垃圾 (${discardCount} 項 / ${discardTotalQty} 件):`,
      ...discardItems.map(i => `  • ${i.name} × ${i.quantity}${i.unit} (${i.location.room})`),
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // Quick action: Move to later box
  const moveToLaterBox = (item: InventoryItem) => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    onUpdateItem({
      ...item,
      status: 'later_box',
      reviewDate: d.toISOString().slice(0, 10),
      updatedAt: Date.now()
    });
  };

  return (
    <div
      id="declutter-progress-dashboard"
      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs transition-all space-y-5"
    >
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 text-white shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800">
                斷捨離進度儀表板
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Award className="w-3 h-3" />
                {achievement.title}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              量化統計待捐贈、待資源回收與待丟棄物品，隨時掌握清出成果與空間解放進度
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {totalClearedCount > 0 && (
            <button
              id="copy-declutter-list-btn"
              onClick={handleCopyList}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="複製所有待捐贈、回收與丟棄物品清單文字"
            >
              {copiedToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">已複製清單！</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>匯出清單文字</span>
                </>
              )}
            </button>
          )}

          <button
            id="toggle-dashboard-expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title={isExpanded ? '收合儀表板' : '展開儀表板'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Key Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Total Cleared Summary Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>累計清出總成果</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight">
                  {totalClearedCount}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  項目 ({totalClearedQty} 件物品)
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-2 leading-tight">
                {achievement.desc}
              </p>
            </div>

            {/* To Donate Card */}
            <button
              id="kpi-card-donate"
              onClick={() => setActiveCategoryTab('to_donate')}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                activeCategoryTab === 'to_donate'
                  ? 'border-sky-500 ring-2 ring-sky-200 bg-sky-50/60 shadow-xs'
                  : 'border-slate-200 bg-sky-50/20 hover:border-sky-300 hover:bg-sky-50/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-sky-800 font-medium mb-1">
                <span className="flex items-center gap-1.5 font-bold">
                  <HeartHandshake className="w-4 h-4 text-sky-600" />
                  待捐贈 / 轉售
                </span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">
                  第二生命
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-sky-900">
                  {donateCount}
                </span>
                <span className="text-xs text-sky-700">
                  項 ({donateTotalQty} 件)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">
                物品完好，預備送親友或二手轉售
              </p>
            </button>

            {/* To Recycle Card */}
            <button
              id="kpi-card-recycle"
              onClick={() => setActiveCategoryTab('to_recycle')}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                activeCategoryTab === 'to_recycle'
                  ? 'border-teal-500 ring-2 ring-teal-200 bg-teal-50/60 shadow-xs'
                  : 'border-slate-200 bg-teal-50/20 hover:border-teal-300 hover:bg-teal-50/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-teal-800 font-medium mb-1">
                <span className="flex items-center gap-1.5 font-bold">
                  <Recycle className="w-4 h-4 text-teal-600" />
                  待資源回收
                </span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold">
                  環境友善
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-teal-900">
                  {recycleCount}
                </span>
                <span className="text-xs text-teal-700">
                  項 ({recycleTotalQty} 件)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">
                廢電子線材、金屬紙箱資源回收
              </p>
            </button>

            {/* To Discard Card */}
            <button
              id="kpi-card-discard"
              onClick={() => setActiveCategoryTab('to_discard')}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                activeCategoryTab === 'to_discard'
                  ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/60 shadow-xs'
                  : 'border-slate-200 bg-rose-50/20 hover:border-rose-300 hover:bg-rose-50/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-rose-800 font-medium mb-1">
                <span className="flex items-center gap-1.5 font-bold">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  待丟棄垃圾
                </span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold">
                  空間清空
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-rose-900">
                  {discardCount}
                </span>
                <span className="text-xs text-rose-700">
                  項 ({discardTotalQty} 件)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">
                過期或損壞不堪使用，果斷清理
              </p>
            </button>
          </div>

          {/* Visual Statistics Charts Section */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">
                  數量統計圖表分析
                </span>
                <span className="text-[11px] text-slate-400">
                  (已標記待捐贈、回收與丟棄的量化對比)
                </span>
              </div>

              {/* Chart Mode Toggle */}
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs shadow-2xs self-start sm:self-auto">
                <button
                  id="chart-toggle-bar"
                  onClick={() => setChartType('bar')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    chartType === 'bar'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  長條對比圖
                </button>
                <button
                  id="chart-toggle-pie"
                  onClick={() => setChartType('pie')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    chartType === 'pie'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  圓餅比例圖
                </button>
              </div>
            </div>

            {totalClearedCount === 0 ? (
              <div className="py-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-600">
                  尚無標記待捐贈、待回收或待丟棄的物品
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  請在下方的雜物決策工作台，為翻找出的物品點選「待捐贈」、「待回收」或「丟棄」即可生成圖表！
                </p>
              </div>
            ) : chartType === 'bar' ? (
              <div className="bg-white rounded-xl p-3 border border-slate-200/80">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={channelData}
                      margin={{ top: 15, right: 20, left: -15, bottom: 5 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: '#475569' }}
                        tickLine={false}
                        axisLine={{ stroke: '#cbd5e1' }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickLine={false}
                        axisLine={{ stroke: '#cbd5e1' }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-lg text-xs space-y-1">
                                <div className="font-bold">{data.name}</div>
                                <div className="text-slate-200">
                                  登錄項目數：<span className="font-semibold text-amber-300">{data.count}</span> 項
                                </div>
                                <div className="text-slate-300">
                                  實體總數量：<span className="font-semibold text-emerald-300">{data.qty}</span> 件
                                </div>
                                <div className="text-[10px] text-slate-400 border-t border-slate-700 pt-1 mt-1">
                                  {data.description}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {channelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                  <div className="text-sky-700">
                    <span className="font-bold">{donateCount}</span> 項 待捐贈/轉售
                  </div>
                  <div className="text-teal-700">
                    <span className="font-bold">{recycleCount}</span> 項 待資源回收
                  </div>
                  <div className="text-rose-700">
                    <span className="font-bold">{discardCount}</span> 項 待丟棄垃圾
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-4 border border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="h-52 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`pie-cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any, item: any) => [
                          `${val} 項 (${item.payload.qty} 件)`,
                          name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie legend breakdown */}
                <div className="space-y-2 text-xs">
                  <div className="font-semibold text-slate-700 mb-1">
                    斷捨離清出管道佔比分佈：
                  </div>
                  {channelData.map((c) => {
                    const pct = totalClearedCount > 0
                      ? Math.round((c.count / totalClearedCount) * 100)
                      : 0;
                    return (
                      <div
                        key={c.key}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: c.fill }}
                          />
                          <span className="font-medium text-slate-800">{c.name}</span>
                        </div>
                        <div className="text-slate-600 font-semibold">
                          {c.count} 項 ({pct}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Drilldown Category List */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  分類清單檢視 ({displayedItems.length} 項)
                </span>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  id="filter-declutter-all"
                  onClick={() => setActiveCategoryTab('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeCategoryTab === 'all'
                      ? 'bg-slate-900 text-white font-medium shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  全部 ({totalClearedCount})
                </button>
                <button
                  id="filter-declutter-donate"
                  onClick={() => setActiveCategoryTab('to_donate')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeCategoryTab === 'to_donate'
                      ? 'bg-sky-600 text-white font-medium shadow-2xs'
                      : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                  }`}
                >
                  待捐贈 ({donateCount})
                </button>
                <button
                  id="filter-declutter-recycle"
                  onClick={() => setActiveCategoryTab('to_recycle')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeCategoryTab === 'to_recycle'
                      ? 'bg-teal-600 text-white font-medium shadow-2xs'
                      : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                  }`}
                >
                  待回收 ({recycleCount})
                </button>
                <button
                  id="filter-declutter-discard"
                  onClick={() => setActiveCategoryTab('to_discard')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeCategoryTab === 'to_discard'
                      ? 'bg-rose-600 text-white font-medium shadow-2xs'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  待丟棄 ({discardCount})
                </button>
              </div>
            </div>

            {displayedItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                此分類目前沒有標記的項目
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {displayedItems.map((item) => {
                  const isDonate = item.status === 'to_donate';
                  const isRecycle = item.status === 'to_recycle';
                  const isDiscard = item.status === 'to_discard';

                  const badgeStyle = isDonate
                    ? 'bg-sky-100 text-sky-800 border-sky-200'
                    : isRecycle
                    ? 'bg-teal-100 text-teal-800 border-teal-200'
                    : 'bg-rose-100 text-rose-800 border-rose-200';

                  const badgeText = isDonate
                    ? '待捐贈/轉售'
                    : isRecycle
                    ? '待資源回收'
                    : '待丟棄垃圾';

                  return (
                    <div
                      key={item.id}
                      id={`declutter-item-card-${item.id}`}
                      className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs flex flex-col justify-between gap-2 hover:border-slate-300 transition-all text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="font-bold text-slate-800 line-clamp-1">
                            {item.name}
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 font-medium ${badgeStyle}`}>
                            {badgeText}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500">
                          數量：{item.quantity} {item.unit} · {item.category}
                        </div>

                        <div className="text-[11px] text-slate-400 truncate">
                          來源位置：{item.location.room} › {item.location.spot || item.location.furniture}
                        </div>

                        {item.notes && (
                          <div className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 line-clamp-2 mt-1">
                            {item.notes}
                          </div>
                        )}
                      </div>

                      {/* Quick action bar */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                        <button
                          id={`complete-cleared-${item.id}`}
                          onClick={() => onDeleteItem(item.id)}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors font-medium text-[11px] flex items-center gap-1 cursor-pointer"
                          title="已送出、已回收或已丟棄，從待辦中移除"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          已清出完成
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            id={`reorganize-${item.id}`}
                            onClick={() => onOrganizeItem(item)}
                            className="px-2 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded hover:bg-slate-100 transition-colors text-[11px] cursor-pointer"
                            title="改為保留，並定位收納到家具抽屜"
                          >
                            改為收納
                          </button>
                          <button
                            id={`move-later-${item.id}`}
                            onClick={() => moveToLaterBox(item)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                            title="改為移入猶豫暫存箱"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
