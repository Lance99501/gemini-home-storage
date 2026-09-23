import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ActiveTab, InventoryItem, ItemStatus } from '../types';
import { scanItemsExpiration } from '../utils/expiration';
import {
  Boxes,
  Sparkles,
  ListOrdered,
  MapPin,
  Plus,
  Printer,
  Download,
  Upload,
  RotateCcw,
  MoreHorizontal,
  Settings2,
  AlertTriangle,
  Clock,
  Calendar,
  ChevronRight,
  MapPin as MapPinIcon,
  Trash2,
  X
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onAddNewItem: () => void;
  onOpenPrintModal: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  clutterCount: number;
  items: InventoryItem[];
  onFilterExpiringItems?: (filterType: 'expired' | 'expiring_soon' | 'all') => void;
  onQuickStatusChange?: (item: InventoryItem, newStatus: ItemStatus) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onAddNewItem,
  onOpenPrintModal,
  onExport,
  onImport,
  onReset,
  clutterCount,
  items,
  onFilterExpiringItems,
  onQuickStatusChange
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showExpiryMenu, setShowExpiryMenu] = useState(false);
  const expiryMenuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // Scan items list for expiration status
  const expirySummary = useMemo(() => scanItemsExpiration(items), [items]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expiryMenuRef.current && !expiryMenuRef.current.contains(event.target as Node)) {
        setShowExpiryMenu(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigateToExpiryFilter = (filterType: 'expired' | 'expiring_soon' | 'all') => {
    setShowExpiryMenu(false);
    onTabChange('inventory');
    if (onFilterExpiringItems) {
      onFilterExpiringItems(filterType);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3.5 gap-3">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  居家物品收納整理清單
                </h1>
                <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  斷捨離與位置標記
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                從散落雜物整理開始，分類歸納並標記每件物品的空間與收納位置
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 self-stretch md:self-center overflow-x-auto max-w-full scrollbar-none">
            <button
              id="nav-tab-declutter"
              onClick={() => onTabChange('declutter')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'declutter'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'declutter' ? 'text-amber-500' : 'text-slate-400'}`} />
              雜物整理工作台
              {clutterCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                  {clutterCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-inventory"
              onClick={() => onTabChange('inventory')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'inventory'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered className={`w-3.5 h-3.5 ${activeTab === 'inventory' ? 'text-emerald-600' : 'text-slate-400'}`} />
              物品清單總覽
              {expirySummary.totalAlertCount > 0 && (
                <span
                  title={`${expirySummary.expiredCount} 件已過期，${expirySummary.expiringSoonCount} 件即將到期`}
                  className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    expirySummary.expiredCount > 0
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {expirySummary.totalAlertCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-spaces"
              onClick={() => onTabChange('spaces')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'spaces'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 ${activeTab === 'spaces' ? 'text-blue-600' : 'text-slate-400'}`} />
              空間收納地圖
            </button>

            <button
              id="nav-tab-management"
              onClick={() => onTabChange('management')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'management'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings2 className={`w-3.5 h-3.5 ${activeTab === 'management' ? 'text-indigo-600' : 'text-slate-400'}`} />
              空間與分類管理
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-stretch sm:self-end md:self-center justify-between sm:justify-end flex-wrap sm:flex-nowrap">
            {/* Expiration Alert Notification Widget */}
            <div className="relative" ref={expiryMenuRef}>
              <button
                id="header-expiry-alert-btn"
                onClick={() => setShowExpiryMenu(!showExpiryMenu)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  expirySummary.expiredCount > 0
                    ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 ring-1 ring-rose-200'
                    : expirySummary.expiringSoonCount > 0
                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title={
                  expirySummary.totalAlertCount > 0
                    ? `效期提醒：${expirySummary.expiredCount} 件已過期，${expirySummary.expiringSoonCount} 件即將到期`
                    : '效期檢視：目前無過期物品'
                }
              >
                {expirySummary.expiredCount > 0 ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
                ) : expirySummary.expiringSoonCount > 0 ? (
                  <Clock className="w-4 h-4 text-amber-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
                <span className="hidden sm:inline">效期提醒</span>

                {expirySummary.totalAlertCount > 0 ? (
                  <div className="flex items-center gap-1">
                    {expirySummary.expiredCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                        {expirySummary.expiredCount} 過期
                      </span>
                    )}
                    {expirySummary.expiringSoonCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                        {expirySummary.expiringSoonCount} 臨期
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 hidden sm:inline">0</span>
                )}
              </button>

              {/* Expiration Alerts Popover Dropdown (Responsive for Mobile & Desktop) */}
              {showExpiryMenu && (
                <>
                  {/* Backdrop for Mobile */}
                  <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-40 sm:hidden animate-fadeIn"
                    onClick={() => setShowExpiryMenu(false)}
                  />

                  <div
                    id="header-expiry-alerts-panel"
                    className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-18 sm:top-full mt-2 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl sm:shadow-xl border border-slate-200 p-4 z-50 text-xs animate-fadeIn max-h-[85vh] flex flex-col"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs sm:text-sm">物品效期與過期提醒</h4>
                          <p className="text-[11px] text-slate-500">
                            全屋已掃描 {items.length} 件物品，共 {expirySummary.totalAlertCount} 件需要留意
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowExpiryMenu(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="關閉提醒視窗"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Summary Metric Pills */}
                    <div className="grid grid-cols-2 gap-2 my-3 shrink-0">
                      <button
                        id="expiry-panel-filter-expired"
                        onClick={() => handleNavigateToExpiryFilter('expired')}
                        className="p-2 rounded-xl bg-rose-50/70 border border-rose-200 text-left hover:bg-rose-100/70 transition-colors cursor-pointer"
                      >
                        <div className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          已過期物品
                        </div>
                        <div className="text-lg font-bold text-rose-800 mt-0.5">
                          {expirySummary.expiredCount} <span className="text-[11px] font-normal text-rose-600">件</span>
                        </div>
                      </button>

                      <button
                        id="expiry-panel-filter-soon"
                        onClick={() => handleNavigateToExpiryFilter('expiring_soon')}
                        className="p-2 rounded-xl bg-amber-50/70 border border-amber-200 text-left hover:bg-amber-100/70 transition-colors cursor-pointer"
                      >
                        <div className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          30天內即將到期
                        </div>
                        <div className="text-lg font-bold text-amber-800 mt-0.5">
                          {expirySummary.expiringSoonCount} <span className="text-[11px] font-normal text-amber-600">件</span>
                        </div>
                      </button>
                    </div>

                    {/* Items List inside popover */}
                    <div className="overflow-y-auto space-y-2 pr-1 my-2 flex-1 max-h-56 sm:max-h-60">
                      {expirySummary.allAlertItems.length === 0 ? (
                        <div className="py-6 text-center text-slate-400">
                          <Clock className="w-8 h-8 mx-auto mb-1.5 text-slate-300" />
                          <p className="text-xs font-semibold text-slate-600">全屋效期皆在安全範圍內！</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            目前沒有已過期或 30 天內即將到期的物品
                          </p>
                        </div>
                      ) : (
                        expirySummary.allAlertItems.map(({ item, info }) => (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-xl border transition-all ${
                              info.isExpired
                                ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                                : 'bg-amber-50/30 border-amber-200 hover:border-amber-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate text-xs">
                                  {item.name}
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                                  <MapPinIcon className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">
                                    {item.location.room} › {item.location.furniture} {item.location.spot ? `› ${item.location.spot}` : ''}
                                  </span>
                                </div>
                              </div>

                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                                  info.isExpired
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-amber-500 text-white'
                                }`}
                              >
                                {info.label}
                              </span>
                            </div>

                            {/* Quick action buttons per item */}
                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                              <span className="text-[10px] text-slate-400">
                                {info.type === 'review' ? '猶豫檢驗日' : '保存期限'}: {info.targetDate}
                              </span>

                              <div className="flex items-center gap-1.5">
                                {info.isExpired && onQuickStatusChange && item.status !== 'to_discard' && (
                                  <button
                                    onClick={() => {
                                      onQuickStatusChange(item, 'to_discard');
                                    }}
                                    className="px-2 py-0.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                                    title="一鍵標記為丟棄垃圾"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                    標記丟棄
                                  </button>
                                )}

                                <button
                                  onClick={() => handleNavigateToExpiryFilter(info.isExpired ? 'expired' : 'expiring_soon')}
                                  className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded text-[10px] font-medium flex items-center gap-0.5 cursor-pointer"
                                >
                                  查看清單
                                  <ChevronRight className="w-3 h-3 text-slate-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Bottom View All Link */}
                    {expirySummary.totalAlertCount > 0 && (
                      <button
                        id="view-all-expiring-items-btn"
                        onClick={() => handleNavigateToExpiryFilter('all')}
                        className="w-full mt-2 py-2 bg-slate-900 text-white rounded-xl text-center text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
                      >
                        在物品清單中檢視與整理所有提醒項目
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            <button
              id="header-add-item-btn"
              onClick={onAddNewItem}
              className="px-3 sm:px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              登記物品
            </button>

            <button
              id="header-print-btn"
              onClick={onOpenPrintModal}
              className="p-2 text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="列印收納標籤與索引"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Overflow / Backup Dropdown */}
            <div className="relative" ref={settingsMenuRef}>
              <button
                id="header-more-btn"
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-2 text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                title="資料備份與設定"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showSettingsMenu && (
                <>
                  {/* Backdrop for Mobile */}
                  <div
                    className="fixed inset-0 z-40 sm:hidden"
                    onClick={() => setShowSettingsMenu(false)}
                  />

                  <div
                    id="settings-dropdown-menu"
                    className="absolute right-0 mt-2 w-48 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-fadeIn"
                  >
                    <button
                      id="export-data-btn"
                      onClick={() => {
                        onExport();
                        setShowSettingsMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      匯出資料備份 (JSON)
                    </button>

                    <label className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>匯入備份檔案</span>
                      <input
                        id="import-data-file-input"
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          onImport(e);
                          setShowSettingsMenu(false);
                        }}
                        className="hidden"
                      />
                    </label>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      id="reset-data-btn"
                      onClick={() => {
                        if (confirm('確定要將清單恢復為系統預設範例資料嗎？當前自訂內容將被重設。')) {
                          onReset();
                        }
                        setShowSettingsMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                      重設為範例資料
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

