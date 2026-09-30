import React, { useMemo, useState } from 'react';
import {
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  PackageSearch,
  Plus,
  Sparkles
} from 'lucide-react';
import { CategoryDefinition, InventoryItem, RoomDefinition } from '../types';
import { DeclutterWorkbench } from './DeclutterWorkbench';

interface HomeResetViewProps {
  items: InventoryItem[];
  rooms: RoomDefinition[];
  categories: CategoryDefinition[];
  onUpdateItem: (item: InventoryItem) => void;
  onBatchAddClutter: (names: string[], sourceRoom: string, sourceSpot: string) => void;
  onDeleteItem: (id: string) => void;
  onSwitchToInventory: () => void;
  onSwitchToSpaces: () => void;
  onAddImportantItem: () => void;
}

export const HomeResetView: React.FC<HomeResetViewProps> = ({
  items,
  rooms,
  categories,
  onUpdateItem,
  onBatchAddClutter,
  onDeleteItem,
  onSwitchToInventory,
  onSwitchToSpaces,
  onAddImportantItem
}) => {
  const [resetRoom, setResetRoom] = useState(rooms[0]?.name || '客廳');
  const [resetSpot, setResetSpot] = useState('');
  const [resetStarted, setResetStarted] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);

  const pendingCount = useMemo(
    () => items.filter(item => item.status === 'clutter_pending').length,
    [items]
  );

  const startReset = () => {
    setResetStarted(true);
    setResetCompleted(false);
  };

  const finishReset = () => {
    setResetStarted(false);
    setResetCompleted(true);
  };

  const startAnother = () => {
    setResetSpot('');
    setResetStarted(false);
    setResetCompleted(false);
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-emerald-200/70 bg-white shadow-xs">
        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-5 py-6 sm:px-7 sm:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-xl bg-emerald-600 p-2 text-white shadow-xs">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Home Reset
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                今天只整理一個小區域
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                先讓空間恢復好用，不需要先把每件東西登記進系統。一次只做一個抽屜、桌面角落或櫃子小區塊，15 分鐘到就可以停。
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white/80 px-4 py-3 text-xs leading-5 text-slate-600 shadow-xs backdrop-blur-sm lg:max-w-xs">
              <div className="font-bold text-slate-800">今天的成功條件</div>
              <div className="mt-1">不是完成整間房，而是讓一個小區域比開始前更容易使用。</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-[180px_minmax(0,1fr)_auto]">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">房間</span>
              <select
                value={resetRoom}
                onChange={event => setResetRoom(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {rooms.map(room => (
                  <option key={room.id} value={room.name}>
                    {room.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">這次只做哪一小區？</span>
              <input
                value={resetSpot}
                onChange={event => setResetSpot(event.target.value)}
                placeholder="例如：書桌左半邊、衣櫃最上層、玄關鞋櫃第一格"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <div className="flex items-end">
              {!resetStarted ? (
                <button
                  type="button"
                  onClick={startReset}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 md:w-auto"
                >
                  <Clock className="h-4 w-4" />
                  開始 15 分鐘
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finishReset}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 md:w-auto"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  完成這一區
                </button>
              )}
            </div>
          </div>

          {resetStarted && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-white p-4 shadow-xs">
              <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-800">
                <MapPin className="h-4 w-4 text-emerald-600" />
                {resetRoom} › {resetSpot.trim() || '現在眼前的一個小區域'}
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
                {[
                  ['1', '先丟垃圾', '明顯垃圾、過期、壞掉的先離開'],
                  ['2', '移走放錯的', '不屬於這區的先集中到旁邊'],
                  ['3', '同類放一起', '留下的東西只做簡單分群'],
                  ['4', '恢復好拿', '常用放前面，少用放後面即可']
                ].map(([number, title, detail]) => (
                  <div key={number} className="rounded-xl bg-slate-50 p-3">
                    <div className="text-[11px] font-bold text-emerald-700">STEP {number}</div>
                    <div className="mt-1 text-sm font-bold text-slate-800">{title}</div>
                    <div className="mt-1 text-xs leading-5 text-slate-500">{detail}</div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                一般用品不用登記。只有未來真的會搜尋、會過期、很重要或需要知道庫存的東西才值得進 Inventory。
              </p>
            </div>
          )}

          {resetCompleted && (
            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <div className="text-sm font-bold text-emerald-950">這一區完成就算完成。</div>
                  <div className="mt-0.5 text-xs leading-5 text-emerald-800">
                    不需要因為還有其他地方沒整理，就把這次成果算成未完成。
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={startAnother}
                className="shrink-0 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
              >
                之後再選下一區
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center gap-2">
            <PackageSearch className="h-4 w-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">只有這些東西值得逐件登記</h3>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              ['高價 / 重要', '證件、相機、3C、保固品'],
              ['有期限', '藥品、食品、耗材'],
              ['少用但會找', '工具、轉接頭、旅行用品'],
              ['需要知道庫存', '清潔用品、衛生紙、備品']
            ].map(([title, detail]) => (
              <div key={title} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                <div className="text-xs font-bold text-slate-800">{title}</div>
                <div className="mt-0.5 text-xs text-slate-500">{detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">需要時再進系統</h3>
          </div>
          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={onSwitchToSpaces}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              看收納空間
              <MapPin className="h-4 w-4 text-slate-400" />
            </button>
            <button
              type="button"
              onClick={onAddImportantItem}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              登記重要物品
              <Plus className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
        <button
          type="button"
          onClick={() => setShowAdvancedTools(current => !current)}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">進階整理工具</span>
              {pendingCount > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                  {pendingCount} 件舊待整理資料
                </span>
              )}
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              原本的逐件斷捨離、猶豫箱、定位與進度工具全部保留，需要時才展開。
            </p>
          </div>
          {showAdvancedTools ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
          )}
        </button>

        {showAdvancedTools && (
          <div className="border-t border-slate-200 bg-slate-50/50 p-4 sm:p-5">
            <DeclutterWorkbench
              items={items}
              rooms={rooms}
              categories={categories}
              onUpdateItem={onUpdateItem}
              onBatchAddClutter={onBatchAddClutter}
              onDeleteItem={onDeleteItem}
              onSwitchToInventory={onSwitchToInventory}
            />
          </div>
        )}
      </section>
    </div>
  );
};
