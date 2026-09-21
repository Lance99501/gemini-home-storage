import React, { useState } from 'react';
import { InventoryItem, RoomDefinition, CategoryDefinition } from '../types';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../data/defaultData';
import { DeclutterProgressDashboard } from './DeclutterProgressDashboard';
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HeartHandshake,
  Recycle,
  Trash2,
  Clock,
  Plus,
  ArrowRight,
  Info,
  MapPin,
  Tag
} from 'lucide-react';

interface DeclutterWorkbenchProps {
  items: InventoryItem[];
  rooms: RoomDefinition[];
  categories?: CategoryDefinition[];
  onUpdateItem: (item: InventoryItem) => void;
  onBatchAddClutter: (names: string[], sourceRoom: string, sourceSpot: string) => void;
  onDeleteItem: (id: string) => void;
  onSwitchToInventory: () => void;
}

export const DeclutterWorkbench: React.FC<DeclutterWorkbenchProps> = ({
  items,
  rooms,
  categories = DEFAULT_CATEGORIES,
  onUpdateItem,
  onBatchAddClutter,
  onDeleteItem,
  onSwitchToInventory
}) => {
  // Batch intake inputs
  const [clutterText, setClutterText] = useState('');
  const [sourceRoom, setSourceRoom] = useState(rooms[0]?.name || '客廳');
  const [sourceSpot, setSourceSpot] = useState('桌面或角落雜物堆');
  const [showGuide, setShowGuide] = useState(false);

  // Active item in triage mode
  const pendingClutterItems = items.filter(i => i.status === 'clutter_pending');
  const laterBoxItems = items.filter(i => i.status === 'later_box');

  // Fast store configuration for a specific pending item
  const [allocatingItemId, setAllocatingItemId] = useState<string | null>(null);
  const [targetRoom, setTargetRoom] = useState(rooms[0]?.name || '客廳');
  const [targetFurniture, setTargetFurniture] = useState('');
  const [targetSpot, setTargetSpot] = useState('');
  const [targetCategory, setTargetCategory] = useState(categories[0]?.name || '日常備品');
  const [targetFrequency, setTargetFrequency] = useState<'daily' | 'weekly' | 'seasonal' | 'rarely'>('weekly');
  const [tagInput, setTagInput] = useState('');

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clutterText.trim()) return;

    // Split by newlines or commas
    const lines = clutterText
      .split(/[\n,，]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (lines.length > 0) {
      onBatchAddClutter(lines, sourceRoom, sourceSpot);
      setClutterText('');
    }
  };

  const startOrganizeItem = (item: InventoryItem) => {
    setAllocatingItemId(item.id);
    setTargetRoom(item.location.room || rooms[0]?.name || '客廳');
    setTargetFurniture(item.location.furniture || '');
    setTargetSpot(item.location.spot || '');
    setTargetCategory(item.category || categories[0]?.name || '日常備品');
  };

  const saveOrganizedItem = (item: InventoryItem) => {
    const updated: InventoryItem = {
      ...item,
      category: targetCategory,
      frequency: targetFrequency,
      location: {
        room: targetRoom,
        furniture: targetFurniture.trim() || '收納置物櫃',
        spot: targetSpot.trim() || '主要儲存格'
      },
      status: 'organized',
      tags: tagInput.trim()
        ? Array.from(new Set([...item.tags, ...tagInput.split(/[,\s]+/).filter(Boolean)]))
        : item.tags,
      updatedAt: Date.now()
    };
    onUpdateItem(updated);
    setAllocatingItemId(null);
    setTagInput('');
  };

  const quickAction = (
    item: InventoryItem,
    status: 'to_donate' | 'to_recycle' | 'to_discard' | 'later_box'
  ) => {
    let reviewDate: string | undefined = undefined;
    if (status === 'later_box') {
      // 60 days from now
      const d = new Date();
      d.setDate(d.getDate() + 60);
      reviewDate = d.toISOString().slice(0, 10);
    }

    const updated: InventoryItem = {
      ...item,
      status,
      reviewDate,
      updatedAt: Date.now()
    };
    onUpdateItem(updated);
  };

  // Find furniture options for selected target room
  const currentRoomObj = rooms.find(r => r.name === targetRoom);
  const furnitureOptions = currentRoomObj ? currentRoomObj.defaultFurnitures : [];

  return (
    <div id="declutter-workbench" className="space-y-6">
      {/* Introduction & 5-Step Methodology Guide */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/70 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-emerald-600 text-white rounded-lg">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-800">
                先從雜物整理開始：斷捨離與集中清點
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              整理的第一步不是買收納盒，而是「清空區域、集中雜物、果斷四分法決策」。先把散落的物品登記進來，再一件件決定去向並精準標記位置！
            </p>
          </div>
          <button
            id="toggle-declutter-guide-btn"
            onClick={() => setShowGuide(!showGuide)}
            className="self-start sm:self-center px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
          >
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            {showGuide ? '收合整理心法' : '查看 5 步整理心法'}
          </button>
        </div>

        {showGuide && (
          <div className="mt-4 pt-4 border-t border-emerald-200/60 grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="font-bold text-emerald-800 block mb-1">1. 劃定微小區域</span>
              <p className="text-slate-600">每次只鎖定一個抽屜或一個桌面，避免攤開過大而半途而廢。</p>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="font-bold text-emerald-800 block mb-1">2. 全部拿出來</span>
              <p className="text-slate-600">徹底清空該區域，在乾淨地面或桌上集中審視所有物品數量。</p>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="font-bold text-emerald-800 block mb-1">3. 斷捨離決策</span>
              <p className="text-slate-600">果斷分成：保留定位、捐贈轉售、資源回收、丟棄垃圾、猶豫暫存箱。</p>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="font-bold text-emerald-800 block mb-1">4. 定位標記</span>
              <p className="text-slate-600">保留物必須標明「房間 › 櫃子 › 格位」，同類集中放。</p>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="font-bold text-emerald-800 block mb-1">5. 維持一進一出</span>
              <p className="text-slate-600">每買新物品就要送走舊的，猶豫箱期限一到果斷放手。</p>
            </div>
          </div>
        )}
      </div>

      {/* 斷捨離進度儀表板 */}
      <DeclutterProgressDashboard
        items={items}
        onUpdateItem={onUpdateItem}
        onDeleteItem={onDeleteItem}
        onOrganizeItem={startOrganizeItem}
      />

      {/* Step 1: Batch Clutter Input Area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
              1
            </span>
            <h3 className="text-base font-bold text-slate-800">
              集中清點待整理雜物（批次輸入）
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            支援換行或逗號分隔多筆項目
          </span>
        </div>

        <form onSubmit={handleBatchSubmit} className="space-y-3">
          <div>
            <textarea
              id="batch-clutter-textarea"
              rows={3}
              value={clutterText}
              onChange={(e) => setClutterText(e.target.value)}
              placeholder="例如：
舊筆電充電線
散落發票與收據
2023年過期感冒藥
未拆封路跑T恤
螺絲起子與小板手"
              className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-medium">雜物出處空間：</span>
                <select
                  id="source-room-select"
                  value={sourceRoom}
                  onChange={(e) => setSourceRoom(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-medium">堆積角落說明：</span>
                <input
                  id="source-spot-input"
                  type="text"
                  value={sourceSpot}
                  onChange={(e) => setSourceSpot(e.target.value)}
                  placeholder="如：電視櫃後方、書桌抽屜、地板箱子"
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 w-44 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              id="submit-batch-clutter-btn"
              type="submit"
              disabled={!clutterText.trim()}
              className="px-4 py-2 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              登記進待整理清單
            </button>
          </div>
        </form>
      </div>

      {/* Step 2: Triage Workbench - Pending Items */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
              2
            </span>
            <h3 className="text-base font-bold text-slate-800">
              雜物斷捨離決策工作台
            </h3>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
              {pendingClutterItems.length} 件待決策
            </span>
          </div>
          {pendingClutterItems.length === 0 && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              目前沒有待整理的雜物堆，太棒了！
            </span>
          )}
        </div>

        {pendingClutterItems.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-semibold text-slate-700">當前區域雜物已全部斷捨離完畢</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              可以在上方批次輸入新翻找出的雜物，或切換至「物品清單總覽」查看所有已定位收納的物品。
            </p>
            <button
              id="go-inventory-btn"
              onClick={onSwitchToInventory}
              className="mt-3 px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              檢視完整物品清單 <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingClutterItems.map((item) => {
              const isAllocating = allocatingItemId === item.id;
              return (
                <div
                  key={item.id}
                  id={`clutter-card-${item.id}`}
                  className={`border rounded-xl transition-all ${
                    isAllocating
                      ? 'border-emerald-500 bg-emerald-50/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/30 hover:border-slate-300'
                  }`}
                >
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">
                          {item.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          × {item.quantity} {item.unit}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        出處：{item.location.room} › {item.location.spot || '角落堆積'}
                      </div>
                    </div>

                    {/* 5 Decision Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        id={`btn-keep-${item.id}`}
                        onClick={() => startOrganizeItem(item)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${
                          isAllocating
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                        }`}
                        title="保留並歸納到精準空間與收納位置"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isAllocating ? '正在設定位置...' : '保留並定位'}
                      </button>

                      <button
                        id={`btn-donate-${item.id}`}
                        onClick={() => quickAction(item, 'to_donate')}
                        className="px-3 py-1.5 text-xs font-medium bg-sky-50 text-sky-700 border border-sky-300 rounded-lg hover:bg-sky-100 transition-colors flex items-center gap-1 cursor-pointer"
                        title="物品完好但自己不用，留給需要的人或二手轉售"
                      >
                        <HeartHandshake className="w-3.5 h-3.5" />
                        待捐贈
                      </button>

                      <button
                        id={`btn-recycle-${item.id}`}
                        onClick={() => quickAction(item, 'to_recycle')}
                        className="px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-700 border border-teal-300 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-1 cursor-pointer"
                        title="電子線材、金屬五金、紙塑瓶罐，集中送資源回收"
                      >
                        <Recycle className="w-3.5 h-3.5" />
                        待回收
                      </button>

                      <button
                        id={`btn-discard-${item.id}`}
                        onClick={() => quickAction(item, 'to_discard')}
                        className="px-2.5 py-1.5 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
                        title="過期損壞無用，丟棄垃圾桶"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        待丟棄
                      </button>

                      <button
                        id={`btn-later-${item.id}`}
                        onClick={() => quickAction(item, 'later_box')}
                        className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-300 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1 cursor-pointer"
                        title="捨不得丟但目前用不到，放入猶豫箱設定 60 天後檢驗"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        猶豫箱
                      </button>
                    </div>
                  </div>

                  {/* Inline Positioning Form when "Keep & Organize" is clicked */}
                  {isAllocating && (
                    <div className="border-t border-emerald-200 bg-white p-4 rounded-b-xl space-y-3 text-xs animate-fadeIn">
                      <div className="font-semibold text-emerald-800 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        為「{item.name}」標記收納位置與分類歸納：
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">
                            1. 存放空間 / 房間
                          </label>
                          <select
                            id={`alloc-room-${item.id}`}
                            value={targetRoom}
                            onChange={(e) => setTargetRoom(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                          >
                            {rooms.map((r) => (
                              <option key={r.id} value={r.name}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-600 font-medium mb-1">
                            2. 收納家具 / 載體
                          </label>
                          <input
                            id={`alloc-furniture-${item.id}`}
                            type="text"
                            list={`furniture-presets-${item.id}`}
                            value={targetFurniture}
                            onChange={(e) => setTargetFurniture(e.target.value)}
                            placeholder="如：電視櫃、衣櫃、書架"
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                          />
                          <datalist id={`furniture-presets-${item.id}`}>
                            {furnitureOptions.map((f, idx) => (
                              <option key={idx} value={f} />
                            ))}
                          </datalist>
                        </div>

                        <div>
                          <label className="block text-slate-600 font-medium mb-1">
                            3. 具體層抽 / 收納盒
                          </label>
                          <input
                            id={`alloc-spot-${item.id}`}
                            type="text"
                            value={targetSpot}
                            onChange={(e) => setTargetSpot(e.target.value)}
                            placeholder="如：右側第2抽屜、透明盒A"
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">
                            分類歸納
                          </label>
                          <select
                            id={`alloc-category-${item.id}`}
                            value={targetCategory}
                            onChange={(e) => setTargetCategory(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-600 font-medium mb-1">
                            使用頻率
                          </label>
                          <select
                            id={`alloc-frequency-${item.id}`}
                            value={targetFrequency}
                            onChange={(e) => setTargetFrequency(e.target.value as any)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="daily">每天日常使用（放在黃金易拿區）</option>
                            <option value="weekly">每週定期使用</option>
                            <option value="seasonal">季節性/換季用品</option>
                            <option value="rarely">極少使用/備用封存</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-600 font-medium mb-1">
                            自訂標籤 (選填)
                          </label>
                          <input
                            id={`alloc-tags-${item.id}`}
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="如：重要備份, 保固中"
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          id={`cancel-alloc-${item.id}`}
                          onClick={() => setAllocatingItemId(null)}
                          className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          取消
                        </button>
                        <button
                          id={`confirm-alloc-${item.id}`}
                          onClick={() => saveOrganizedItem(item)}
                          className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          確認收納並標記位置
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Later Box Section: 猶豫暫存箱管理 */}
      {laterBoxItems.length > 0 && (
        <div className="bg-indigo-50/40 border border-indigo-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-indigo-950">
                  猶豫暫存箱（共 {laterBoxItems.length} 件）
                </h3>
                <p className="text-xs text-indigo-700">
                  捨不得丟的物品先在此封箱一段時間。如果在複檢日前一次都沒有拿出來用，表示生活真的不需要它！
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {laterBoxItems.map((item) => (
              <div
                key={item.id}
                id={`later-box-item-${item.id}`}
                className="bg-white border border-indigo-100 p-3 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800">{item.name}</div>
                  <div className="text-[11px] text-indigo-600 mt-0.5">
                    預計複檢日期：{item.reviewDate || '未設定'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    暫存位置：{item.location.room} › {item.location.spot || '猶豫箱'}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    id={`later-promote-${item.id}`}
                    onClick={() => startOrganizeItem(item)}
                    className="px-2 py-1 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 cursor-pointer"
                    title="重新決定保留並定位收納"
                  >
                    保留定位
                  </button>
                  <button
                    id={`later-recycle-${item.id}`}
                    onClick={() => quickAction(item, 'to_recycle')}
                    className="px-2 py-1 text-[11px] bg-teal-50 text-teal-700 border border-teal-200 rounded hover:bg-teal-100 cursor-pointer"
                    title="送資源回收"
                  >
                    送回收
                  </button>
                  <button
                    id={`later-discard-${item.id}`}
                    onClick={() => quickAction(item, 'to_discard')}
                    className="px-2 py-1 text-[11px] bg-rose-50 text-rose-700 border border-rose-200 rounded hover:bg-rose-100 cursor-pointer"
                    title="期限已到，果斷丟棄"
                  >
                    果斷放手
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
