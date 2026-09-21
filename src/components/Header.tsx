import React, { useState } from 'react';
import { ActiveTab, InventoryItem, RoomDefinition } from '../types';
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
  Settings2
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
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onAddNewItem,
  onOpenPrintModal,
  onExport,
  onImport,
  onReset,
  clutterCount
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

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
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 self-start md:self-center overflow-x-auto max-w-full">
            <button
              id="nav-tab-declutter"
              onClick={() => onTabChange('declutter')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'inventory'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered className={`w-3.5 h-3.5 ${activeTab === 'inventory' ? 'text-emerald-600' : 'text-slate-400'}`} />
              物品清單總覽
            </button>

            <button
              id="nav-tab-spaces"
              onClick={() => onTabChange('spaces')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
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
          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              id="header-add-item-btn"
              onClick={onAddNewItem}
              className="px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              登記物品
            </button>

            <button
              id="header-print-btn"
              onClick={onOpenPrintModal}
              className="p-2 text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="列印收納標籤與索引"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Overflow / Backup Dropdown */}
            <div className="relative">
              <button
                id="header-more-btn"
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-2 text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                title="資料備份與設定"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showSettingsMenu && (
                <div
                  id="settings-dropdown-menu"
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs animate-fadeIn"
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
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
