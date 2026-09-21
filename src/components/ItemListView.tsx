import React, { useState, useMemo } from 'react';
import { InventoryItem, RoomDefinition, CategoryDefinition, FilterState, StorageLocation, ItemStatus } from '../types';
import { CATEGORIES as DEFAULT_CATEGORIES, STATUS_CONFIG } from '../data/defaultData';
import { getItemExpirationInfo, scanItemsExpiration } from '../utils/expiration';
import { BatchMoveModal, BatchStatusModal } from './BatchEditModals';
import {
  Search,
  Filter,
  MapPin,
  Tag,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  Plus,
  PackageX,
  CalendarX,
  Calendar,
  FolderInput,
  Sparkles,
  CheckSquare,
  Square,
  X
} from 'lucide-react';

interface ItemListViewProps {
  items: InventoryItem[];
  rooms: RoomDefinition[];
  categories?: CategoryDefinition[];
  filterState: FilterState;
  onFilterChange: (newFilter: Partial<FilterState>) => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
  onBatchUpdateItems?: (
    itemIds: string[],
    updates: {
      location?: StorageLocation;
      status?: ItemStatus;
      category?: string;
      reviewDate?: string;
    }
  ) => void;
  onBatchDeleteItems?: (itemIds: string[]) => void;
  onQuickStatusChange: (item: InventoryItem, newStatus: any) => void;
  onAddNewItem: () => void;
}

export const ItemListView: React.FC<ItemListViewProps> = ({
  items,
  rooms,
  categories = DEFAULT_CATEGORIES,
  filterState,
  onFilterChange,
  onEditItem,
  onDeleteItem,
  onBatchUpdateItems,
  onBatchDeleteItems,
  onQuickStatusChange,
  onAddNewItem
}) => {
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'location' | 'quantity'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [isBatchMoveOpen, setIsBatchMoveOpen] = useState<boolean>(false);
  const [isBatchStatusOpen, setIsBatchStatusOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Expiry scan summary
  const expirySummary = useMemo(() => scanItemsExpiration(items), [items]);

  // Collect all unique tags for tag filter
  const allTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach(item => item.tags?.forEach(t => set.add(t)));
    return Array.from(set);
  }, [items]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Expiration filter
      if (filterState.expiryFilter === 'expired') {
        const expInfo = getItemExpirationInfo(item);
        if (!expInfo.isExpired) return false;
      } else if (filterState.expiryFilter === 'expiring_soon') {
        const expInfo = getItemExpirationInfo(item);
        if (!expInfo.isExpiringSoon) return false;
      }

      // Search query
      if (filterState.searchQuery) {
        const q = filterState.searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesRoom = item.location.room.toLowerCase().includes(q);
        const matchesFurniture = item.location.furniture.toLowerCase().includes(q);
        const matchesSpot = item.location.spot.toLowerCase().includes(q);
        const matchesNotes = item.notes?.toLowerCase().includes(q);
        const matchesTags = item.tags.some(t => t.toLowerCase().includes(q));

        if (!matchesName && !matchesCategory && !matchesRoom && !matchesFurniture && !matchesSpot && !matchesNotes && !matchesTags) {
          return false;
        }
      }

      // Room filter
      if (filterState.room && item.location.room !== filterState.room) {
        return false;
      }

      // Category filter
      if (filterState.category && item.category !== filterState.category) {
        return false;
      }

      // Status filter
      if (filterState.status && item.status !== filterState.status) {
        return false;
      }

      // Tag filter
      if (filterState.tag && !item.tags.includes(filterState.tag)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'updated') {
        comparison = (b.updatedAt || 0) - (a.updatedAt || 0);
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name, 'zh-Hant');
      } else if (sortBy === 'location') {
        const locA = `${a.location.room} ${a.location.furniture} ${a.location.spot}`;
        const locB = `${b.location.room} ${b.location.furniture} ${b.location.spot}`;
        comparison = locA.localeCompare(locB, 'zh-Hant');
      } else if (sortBy === 'quantity') {
        comparison = a.quantity - b.quantity;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });
  }, [items, filterState, sortBy, sortOrder]);

  const toggleSort = (field: 'updated' | 'name' | 'location' | 'quantity') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getCategoryBadgeClass = (categoryName: string) => {
    const c = categories.find((cat: CategoryDefinition) => cat.name === categoryName);
    return c ? c.color : 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const selectedItems = useMemo(
    () => items.filter((i) => selectedItemIds.includes(i.id)),
    [items, selectedItemIds]
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const toggleSelectAll = () => {
    if (selectedItemIds.length === filteredItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredItems.map((i) => i.id));
      setIsBatchMode(true);
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (next.length > 0) setIsBatchMode(true);
      return next;
    });
  };

  const handleBatchDelete = () => {
    if (selectedItemIds.length === 0) return;
    if (confirm(`確定要刪除選取的 ${selectedItemIds.length} 個項目嗎？此操作無法復原。`)) {
      if (onBatchDeleteItems) {
        onBatchDeleteItems(selectedItemIds);
      } else {
        selectedItemIds.forEach((id) => onDeleteItem(id));
      }
      showToast(`已成功刪除 ${selectedItemIds.length} 件物品！`);
      setSelectedItemIds([]);
    }
  };

  const handleBatchMarkOrganized = () => {
    if (selectedItemIds.length === 0) return;
    if (onBatchUpdateItems) {
      onBatchUpdateItems(selectedItemIds, { status: 'organized' });
    } else {
      selectedItemIds.forEach((id) => {
        const item = items.find((i) => i.id === id);
        if (item) onQuickStatusChange(item, 'organized');
      });
    }
    showToast(`已成功將 ${selectedItemIds.length} 件物品標記為「已定位收納」！`);
    setSelectedItemIds([]);
  };

  const handleBatchMoveConfirm = (newLoc: StorageLocation, markOrganized: boolean) => {
    if (selectedItemIds.length === 0) return;
    if (onBatchUpdateItems) {
      onBatchUpdateItems(selectedItemIds, {
        location: newLoc,
        ...(markOrganized ? { status: 'organized' } : {})
      });
    } else {
      selectedItemIds.forEach((id) => {
        const item = items.find((i) => i.id === id);
        if (item) {
          onEditItem({
            ...item,
            location: newLoc,
            ...(markOrganized ? { status: 'organized' } : {}),
            updatedAt: Date.now()
          });
        }
      });
    }
    showToast(`已成功將 ${selectedItemIds.length} 件物品一鍵移至「${newLoc.room} › ${newLoc.furniture}」！`);
    setIsBatchMoveOpen(false);
    setSelectedItemIds([]);
  };

  const handleBatchStatusConfirm = (newStatus: ItemStatus, reviewDate?: string) => {
    if (selectedItemIds.length === 0) return;
    if (onBatchUpdateItems) {
      onBatchUpdateItems(selectedItemIds, {
        status: newStatus,
        reviewDate
      });
    } else {
      selectedItemIds.forEach((id) => {
        const item = items.find((i) => i.id === id);
        if (item) onQuickStatusChange(item, newStatus);
      });
    }
    const label = STATUS_CONFIG[newStatus]?.label || newStatus;
    showToast(`已成功將 ${selectedItemIds.length} 件物品狀態變更為「${label}」！`);
    setIsBatchStatusOpen(false);
    setSelectedItemIds([]);
  };

  return (
    <div id="item-list-view-container" className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="inventory-search-input"
              type="text"
              value={filterState.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder="搜尋物品名稱、空間 (如客廳)、收納櫃、抽屜標籤、備註..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            {filterState.searchQuery && (
              <button
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                清除
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Room Filter */}
            <select
              id="filter-room-select"
              value={filterState.room}
              onChange={(e) => onFilterChange({ room: e.target.value })}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">所有空間區域</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              id="filter-category-select"
              value={filterState.category}
              onChange={(e) => onFilterChange({ category: e.target.value })}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">所有分類</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              id="filter-status-select"
              value={filterState.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">所有整理狀態</option>
              {Object.entries(STATUS_CONFIG).map(([k, val]) => (
                <option key={k} value={k}>
                  {val.label}
                </option>
              ))}
            </select>

            {/* Reset All Filters Button */}
            {(filterState.searchQuery || filterState.room || filterState.category || filterState.status || filterState.tag || filterState.expiryFilter) && (
              <button
                id="reset-filter-btn"
                onClick={() =>
                  onFilterChange({
                    searchQuery: '',
                    room: '',
                    category: '',
                    status: '',
                    tag: '',
                    expiryFilter: undefined
                  })
                }
                className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                重設篩選
              </button>
            )}
          </div>
        </div>

        {/* Expiry Filter Quick Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-slate-400 text-[11px] shrink-0 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            效期篩選：
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              id="filter-expiry-all-btn"
              onClick={() => onFilterChange({ expiryFilter: undefined })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                !filterState.expiryFilter || filterState.expiryFilter === 'all'
                  ? 'bg-slate-800 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              全部效期 ({items.length})
            </button>

            <button
              id="filter-expiry-expired-btn"
              onClick={() =>
                onFilterChange({
                  expiryFilter: filterState.expiryFilter === 'expired' ? undefined : 'expired'
                })
              }
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                filterState.expiryFilter === 'expired'
                  ? 'bg-rose-600 text-white font-bold ring-1 ring-rose-300 shadow-2xs'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className={`w-3 h-3 ${filterState.expiryFilter === 'expired' ? 'text-white' : 'text-rose-600'}`} />
              已過期
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  filterState.expiryFilter === 'expired'
                    ? 'bg-rose-700 text-white'
                    : 'bg-rose-200 text-rose-800'
                }`}
              >
                {expirySummary.expiredCount}
              </span>
            </button>

            <button
              id="filter-expiry-soon-btn"
              onClick={() =>
                onFilterChange({
                  expiryFilter: filterState.expiryFilter === 'expiring_soon' ? undefined : 'expiring_soon'
                })
              }
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                filterState.expiryFilter === 'expiring_soon'
                  ? 'bg-amber-600 text-white font-bold ring-1 ring-amber-300 shadow-2xs'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Clock className={`w-3 h-3 ${filterState.expiryFilter === 'expiring_soon' ? 'text-white' : 'text-amber-600'}`} />
              30天內即將到期
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  filterState.expiryFilter === 'expiring_soon'
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-200 text-amber-900'
                }`}
              >
                {expirySummary.expiringSoonCount}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Tag Pills */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none text-xs">
            <span className="text-slate-400 text-[11px] shrink-0 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              熱門標籤：
            </span>
            {allTags.map((tag) => {
              const isSelected = filterState.tag === tag;
              return (
                <button
                  key={tag}
                  id={`tag-pill-${tag}`}
                  onClick={() => onFilterChange({ tag: isSelected ? '' : tag })}
                  className={`px-2 py-0.5 rounded-md text-[11px] transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-slate-800 text-white font-medium'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Header & Batch Operations */}
      <div className="space-y-2.5 px-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Batch Edit Mode Switch */}
            <button
              id="toggle-batch-mode-btn"
              type="button"
              onClick={() => {
                setIsBatchMode((prev) => {
                  if (prev) setSelectedItemIds([]);
                  return !prev;
                });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-2xs ${
                isBatchMode
                  ? 'bg-emerald-700 text-white border-emerald-700 ring-2 ring-emerald-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{isBatchMode ? '退出批次模式' : '批次編輯模式'}</span>
              {selectedItemIds.length > 0 && (
                <span className="px-1.5 py-0.2 bg-white text-emerald-800 rounded-full text-[10px] font-black">
                  {selectedItemIds.length}
                </span>
              )}
            </button>

            {/* Select All Checkbox */}
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
              <input
                id="select-all-checkbox"
                type="checkbox"
                checked={filteredItems.length > 0 && selectedItemIds.length === filteredItems.length}
                onChange={toggleSelectAll}
                className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="font-medium">
                選取全部 ({selectedItemIds.length}/{filteredItems.length})
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">排序：</span>
            <button
              id="sort-updated-btn"
              onClick={() => toggleSort('updated')}
              className={`px-2 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                sortBy === 'updated'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              最近更新
              {sortBy === 'updated' && (
                <span className="text-[10px]">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
            <button
              id="sort-location-btn"
              onClick={() => toggleSort('location')}
              className={`px-2 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                sortBy === 'location'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              空間位置
              {sortBy === 'location' && (
                <span className="text-[10px]">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
            <button
              id="sort-name-btn"
              onClick={() => toggleSort('name')}
              className={`px-2 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                sortBy === 'name'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              名稱
              {sortBy === 'name' && (
                <span className="text-[10px]">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          </div>
        </div>

        {/* Batch Operations Active Toolbar Banner */}
        {(isBatchMode || selectedItemIds.length > 0) && (
          <div
            id="batch-mode-active-bar"
            className="bg-emerald-900 text-white p-3 sm:p-4 rounded-2xl shadow-sm border border-emerald-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-fadeIn"
          >
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-800 text-emerald-100 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-700">
                  批次編輯模式中
                </span>
                <span className="text-xs sm:text-sm font-bold text-white">
                  已選取 <span className="text-emerald-300 font-black">{selectedItemIds.length}</span> 件物品
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="batch-select-all-btn"
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs text-emerald-200 hover:text-white underline cursor-pointer font-medium"
                >
                  {selectedItemIds.length === filteredItems.length ? '取消全選' : '選取全部篩選項目'}
                </button>
                {selectedItemIds.length > 0 && (
                  <button
                    id="batch-clear-selection-btn"
                    type="button"
                    onClick={() => setSelectedItemIds([])}
                    className="text-xs text-emerald-300 hover:text-emerald-100 cursor-pointer"
                  >
                    清空勾選
                  </button>
                )}
              </div>
            </div>

            {/* Quick Batch Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
              <button
                id="batch-action-move-btn"
                type="button"
                disabled={selectedItemIds.length === 0}
                onClick={() => setIsBatchMoveOpen(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                  selectedItemIds.length > 0
                    ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold'
                    : 'bg-emerald-950/60 text-emerald-700 cursor-not-allowed border border-emerald-900'
                }`}
                title="一鍵將選取的物品移動到同一個空間與家具"
              >
                <FolderInput className="w-4 h-4" />
                <span>一鍵移動空間</span>
              </button>

              <button
                id="batch-action-status-btn"
                type="button"
                disabled={selectedItemIds.length === 0}
                onClick={() => setIsBatchStatusOpen(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                  selectedItemIds.length > 0
                    ? 'bg-white text-emerald-950 hover:bg-emerald-50'
                    : 'bg-emerald-950/60 text-emerald-700 cursor-not-allowed border border-emerald-900'
                }`}
                title="一鍵將選取的物品變更為相同整理狀態"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>一鍵變更狀態</span>
              </button>

              <button
                id="batch-action-organized-btn"
                type="button"
                disabled={selectedItemIds.length === 0}
                onClick={handleBatchMarkOrganized}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  selectedItemIds.length > 0
                    ? 'bg-emerald-800 text-emerald-100 hover:bg-emerald-700 border border-emerald-700'
                    : 'bg-emerald-950/40 text-emerald-800 cursor-not-allowed'
                }`}
                title="直接標記為已妥善定位收納"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">標記已定位</span>
              </button>

              <button
                id="batch-action-delete-btn"
                type="button"
                disabled={selectedItemIds.length === 0}
                onClick={handleBatchDelete}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  selectedItemIds.length > 0
                    ? 'bg-rose-950/80 text-rose-200 hover:bg-rose-900 border border-rose-800'
                    : 'bg-emerald-950/40 text-emerald-800 cursor-not-allowed'
                }`}
                title="批次刪除選取的物品"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>刪除</span>
              </button>

              <button
                id="batch-exit-btn"
                type="button"
                onClick={() => {
                  setIsBatchMode(false);
                  setSelectedItemIds([]);
                }}
                className="p-1.5 text-emerald-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="關閉批次模式"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <PackageX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">找不到符合條件的物品</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            嘗試變更或重設篩選條件，或直接新增一件物品到此清單系統中。
          </p>
          <button
            id="empty-add-item-btn"
            onClick={onAddNewItem}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            新增第一件收納物品
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            const isSelected = selectedItemIds.includes(item.id);
            const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.organized;
            const expInfo = getItemExpirationInfo(item);

            return (
              <div
                key={item.id}
                id={`inventory-item-card-${item.id}`}
                onClick={() => {
                  if (isBatchMode) {
                    toggleSelectItem(item.id);
                  }
                }}
                className={`bg-white border rounded-2xl p-4 transition-all hover:shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/25 ring-2 ring-emerald-400 shadow-xs'
                    : isBatchMode
                    ? 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50/60 cursor-pointer'
                    : expInfo.isExpired
                    ? 'border-rose-400 bg-rose-50/30 ring-1 ring-rose-300 shadow-xs'
                    : expInfo.isExpiringSoon
                    ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-200'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Left: Checkbox + Name + Details */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className="mt-0.5 p-1 -m-1 cursor-pointer shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectItem(item.id);
                    }}
                  >
                    <input
                      id={`check-item-${item.id}`}
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 break-words">
                        {item.name}
                      </span>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                        {item.quantity} {item.unit}
                      </span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-md border font-medium shrink-0 ${getCategoryBadgeClass(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-md border font-medium shrink-0 ${statusConfig.badge}`}
                      >
                        {statusConfig.label}
                      </span>

                      {/* Prominent Expiration Badges */}
                      {expInfo.isExpired && (
                        <span
                          id={`expired-badge-${item.id}`}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold shrink-0 flex items-center gap-1 shadow-2xs animate-pulse"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {expInfo.label}
                        </span>
                      )}

                      {expInfo.isExpiringSoon && (
                        <span
                          id={`expiring-soon-badge-${item.id}`}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500 text-white font-bold shrink-0 flex items-center gap-1 shadow-2xs"
                        >
                          <Clock className="w-3 h-3" />
                          {expInfo.label}
                        </span>
                      )}
                    </div>

                    {/* Precise Location Path */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 w-fit max-w-full">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-slate-800">{item.location.room}</span>
                      <span className="text-slate-400">›</span>
                      <span className="text-slate-700">{item.location.furniture}</span>
                      {item.location.spot && (
                        <>
                          <span className="text-slate-400">›</span>
                          <span className="text-emerald-700 font-medium">{item.location.spot}</span>
                        </>
                      )}
                    </div>

                    {/* Tags, Notes & Dates */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                      {item.tags.map((t) => (
                        <span key={t} className="text-slate-600 bg-slate-100/80 px-1.5 py-0.2 rounded">
                          #{t}
                        </span>
                      ))}

                      {item.expiresAt && (
                        <span
                          className={`px-2 py-0.5 rounded-md border flex items-center gap-1 font-semibold ${
                            expInfo.isExpired
                              ? 'text-rose-800 bg-rose-100 border-rose-300 font-bold'
                              : expInfo.isExpiringSoon
                              ? 'text-amber-800 bg-amber-100 border-amber-300'
                              : 'text-slate-600 bg-slate-100 border-slate-200'
                          }`}
                        >
                          {expInfo.isExpired ? (
                            <CalendarX className="w-3 h-3 text-rose-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-slate-500" />
                          )}
                          保存期限: {item.expiresAt}
                          {expInfo.isExpired && ` (已過期 ${Math.abs(expInfo.daysLeft || 0)} 天)`}
                          {expInfo.isExpiringSoon && ` (剩餘 ${expInfo.daysLeft} 天)`}
                        </span>
                      )}

                      {item.reviewDate && (
                        <span
                          className={`px-2 py-0.5 rounded-md border flex items-center gap-1 font-semibold ${
                            expInfo.type === 'review' && expInfo.isExpired
                              ? 'text-rose-800 bg-rose-100 border-rose-300 font-bold'
                              : expInfo.type === 'review' && expInfo.isExpiringSoon
                              ? 'text-amber-800 bg-amber-100 border-amber-300'
                              : 'text-indigo-700 bg-indigo-50 border-indigo-200'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          猶豫檢驗日: {item.reviewDate}
                          {expInfo.type === 'review' && ` (${expInfo.label})`}
                        </span>
                      )}

                      {item.notes && (
                        <span className="text-slate-400 italic truncate max-w-md">
                          備註: {item.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quick Action Buttons */}
                <div
                  className="flex items-center gap-1.5 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-end"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Quick Discard for Expired Items */}
                  {expInfo.isExpired && item.status !== 'to_discard' && (
                    <button
                      id={`quick-discard-${item.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickStatusChange(item, 'to_discard');
                      }}
                      className="p-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-300 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                      title="物品已過期，一鍵標記為待丟棄"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span className="hidden sm:inline">標記待丟棄</span>
                    </button>
                  )}

                  {/* Status Toggle Quick Buttons */}
                  {item.status !== 'organized' && (
                    <button
                      id={`mark-done-${item.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickStatusChange(item, 'organized');
                      }}
                      className="p-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                      title="標記為已妥善收納"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">妥善定位</span>
                    </button>
                  )}

                  <button
                    id={`edit-item-${item.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditItem(item);
                    }}
                    className="p-1.5 text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="編輯物品或更改收納位置"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id={`delete-item-${item.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`確定要刪除「${item.name}」嗎？`)) {
                        onDeleteItem(item.id);
                      }
                    }}
                    className="p-1.5 text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                    title="刪除物品"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Batch Action Dock at Bottom */}
      {selectedItemIds.length > 0 && (
        <div
          id="floating-batch-dock"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-950/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-2.5 animate-slideUp max-w-[95vw] overflow-x-auto"
        >
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
              {selectedItemIds.length}
            </span>
            <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
              件已選取
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 shrink-0" />

          <button
            id="floating-batch-move-btn"
            type="button"
            onClick={() => setIsBatchMoveOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
          >
            <FolderInput className="w-3.5 h-3.5" />
            <span>一鍵移動空間</span>
          </button>

          <button
            id="floating-batch-status-btn"
            type="button"
            onClick={() => setIsBatchStatusOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>一鍵變更狀態</span>
          </button>

          <button
            id="floating-batch-organized-btn"
            type="button"
            onClick={handleBatchMarkOrganized}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold border border-slate-700 flex items-center gap-1 transition-all cursor-pointer shrink-0 hidden md:flex"
            title="標記為已妥善收納"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>已收納</span>
          </button>

          <button
            id="floating-batch-delete-btn"
            type="button"
            onClick={handleBatchDelete}
            className="p-1.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
            title="批次刪除選取的物品"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            id="floating-batch-clear-btn"
            type="button"
            onClick={() => setSelectedItemIds([])}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="清空選取"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Batch Move Modal */}
      <BatchMoveModal
        isOpen={isBatchMoveOpen}
        onClose={() => setIsBatchMoveOpen(false)}
        selectedItems={selectedItems}
        rooms={rooms}
        onConfirmMove={handleBatchMoveConfirm}
      />

      {/* Batch Status Modal */}
      <BatchStatusModal
        isOpen={isBatchStatusOpen}
        onClose={() => setIsBatchStatusOpen(false)}
        selectedItems={selectedItems}
        onConfirmStatus={handleBatchStatusConfirm}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="batch-operation-toast"
          className="fixed top-20 right-4 sm:right-8 z-50 bg-slate-950/95 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-2.5 text-xs font-semibold animate-slideDown max-w-sm backdrop-blur-md"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
