import React, { useState, useMemo } from 'react';
import { InventoryItem, RoomDefinition } from '../types';
import { CATEGORIES } from '../data/defaultData';
import {
  StorageStressGauge,
  calculateStorageStress
} from './StorageStressIndicator';
import {
  Sofa,
  Bed,
  Utensils,
  BookOpen,
  DoorOpen,
  Archive,
  MapPin,
  Package,
  Plus,
  ChevronDown,
  ChevronRight,
  Boxes,
  Tag,
  Printer,
  Gauge,
  Flame,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';

interface SpaceExplorerViewProps {
  rooms: RoomDefinition[];
  items: InventoryItem[];
  onAddNewItemInLocation: (room: string, furniture: string, spot: string) => void;
  onEditItem: (item: InventoryItem) => void;
  onOpenPrintLabels: (roomFilter?: string) => void;
}

const ROOM_ICON_MAP: Record<string, React.ElementType> = {
  Sofa,
  Bed,
  Utensils,
  BookOpen,
  DoorOpen,
  Archive
};

export const SpaceExplorerView: React.FC<SpaceExplorerViewProps> = ({
  rooms,
  items,
  onAddNewItemInLocation,
  onEditItem,
  onOpenPrintLabels
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');
  const [expandedFurnitures, setExpandedFurnitures] = useState<Record<string, boolean>>({});
  const [stressFilter, setStressFilter] = useState<'all' | 'warning_only'>('all');
  const [showStressMap, setShowStressMap] = useState<boolean>(true);

  const currentRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];

  // Group items by Room -> Furniture -> Spot
  const roomItems = useMemo(
    () => items.filter(i => i.location.room === currentRoom?.name),
    [items, currentRoom]
  );

  const currentRoomTotalQty = useMemo(
    () => roomItems.reduce((acc, i) => acc + (i.quantity || 1), 0),
    [roomItems]
  );

  const currentRoomClutterCount = useMemo(
    () => roomItems.filter(i => i.status === 'clutter_pending' || i.status === 'to_discard' || i.status === 'to_recycle').length,
    [roomItems]
  );

  // Storage Stress for the currently selected room
  const currentRoomStress = useMemo(
    () => calculateStorageStress(roomItems.length, currentRoomTotalQty, currentRoomClutterCount, 18),
    [roomItems.length, currentRoomTotalQty, currentRoomClutterCount]
  );

  // Whole House Storage Stress Overview for all rooms
  const allRoomsStressOverview = useMemo(() => {
    return rooms.map(room => {
      const rItems = items.filter(i => i.location.room === room.name);
      const totalQty = rItems.reduce((acc, i) => acc + (i.quantity || 1), 0);
      const clutters = rItems.filter(i => i.status === 'clutter_pending' || i.status === 'to_discard' || i.status === 'to_recycle').length;
      const stress = calculateStorageStress(rItems.length, totalQty, clutters, 16);
      return {
        room,
        itemCount: rItems.length,
        totalQuantity: totalQty,
        clutterCount: clutters,
        stress
      };
    });
  }, [rooms, items]);

  // Count rooms under stress
  const stressedRoomsCount = useMemo(
    () => allRoomsStressOverview.filter(r => r.stress.level === 'warning' || r.stress.level === 'overloaded').length,
    [allRoomsStressOverview]
  );

  // Get unique furnitures in this room from defaultFurnitures AND actual items
  const furnituresInRoom = useMemo(() => {
    return Array.from(
      new Set([
        ...(currentRoom?.defaultFurnitures || []),
        ...roomItems.map(i => i.location.furniture).filter(Boolean)
      ])
    );
  }, [currentRoom, roomItems]);

  // Compute stress metrics for each furniture
  const furnitureStressMap = useMemo(() => {
    const map: Record<string, ReturnType<typeof calculateStorageStress> & { itemCount: number; totalQty: number; clutterCount: number }> = {};
    furnituresInRoom.forEach(furnitureName => {
      const fItems = roomItems.filter(i => i.location.furniture === furnitureName);
      const fQty = fItems.reduce((acc, i) => acc + (i.quantity || 1), 0);
      const fClutter = fItems.filter(i => i.status === 'clutter_pending' || i.status === 'to_discard' || i.status === 'to_recycle').length;
      const stress = calculateStorageStress(fItems.length, fQty, fClutter, 6);
      map[furnitureName] = {
        ...stress,
        itemCount: fItems.length,
        totalQty: fQty,
        clutterCount: fClutter
      };
    });
    return map;
  }, [furnituresInRoom, roomItems]);

  // Filter furnitures if warning_only is on
  const displayedFurnitures = useMemo(() => {
    if (stressFilter === 'warning_only') {
      return furnituresInRoom.filter(f => {
        const s = furnitureStressMap[f];
        return s && (s.level === 'warning' || s.level === 'overloaded');
      });
    }
    return furnituresInRoom;
  }, [furnituresInRoom, stressFilter, furnitureStressMap]);

  const toggleFurniture = (furnitureName: string) => {
    setExpandedFurnitures(prev => ({
      ...prev,
      [furnitureName]: !prev[furnitureName]
    }));
  };

  const getCategoryColor = (catName: string) => {
    const cat = CATEGORIES.find(c => c.name === catName);
    return cat ? cat.color : 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div id="space-explorer-container" className="space-y-5">
      {/* Whole House Storage Stress Overview Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-sky-600 text-white rounded-xl shadow-xs">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">
                  全屋空間收納壓力感導航
                </h3>
                {stressedRoomsCount > 0 ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    <Flame className="w-3 h-3 text-rose-500 animate-pulse" />
                    {stressedRoomsCount} 個區域壓力偏高
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    全屋收納狀態健康
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                根據存放數量、體積件數與待清出雜物，自動計算各區域填充度，快速鎖定需斷捨離或整頓之處
              </p>
            </div>
          </div>

          <button
            id="toggle-stress-map-btn"
            onClick={() => setShowStressMap(!showStressMap)}
            className="text-xs text-slate-500 hover:text-slate-800 self-end sm:self-auto flex items-center gap-1 cursor-pointer"
          >
            <span>{showStressMap ? '收合全景壓力條' : '展開全景壓力條'}</span>
            {showStressMap ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Multi-Room Stress Visual Strip */}
        {showStressMap && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
            {allRoomsStressOverview.map(({ room, itemCount, totalQuantity, clutterCount, stress }) => {
              const isSelected = room.id === currentRoom?.id;
              const isOverloaded = stress.level === 'overloaded' || stress.level === 'warning';

              return (
                <button
                  key={room.id}
                  id={`room-stress-card-${room.id}`}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'border-slate-800 ring-2 ring-slate-400 bg-slate-50 shadow-xs'
                      : isOverloaded
                      ? `${stress.bgColor} ${stress.borderColor} hover:border-slate-400`
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-800 truncate">{room.name}</span>
                    <span
                      className={`text-[10px] font-semibold px-1 py-0.2 rounded border ${stress.bgColor} ${stress.textColor} ${stress.borderColor}`}
                    >
                      {stress.badgeLabel}
                    </span>
                  </div>

                  {/* Visual Stress Meter */}
                  <div className="w-full bg-slate-200/90 rounded-full h-1.5 overflow-hidden mb-1.5">
                    <div
                      className={`h-full ${stress.barColor} transition-all duration-500`}
                      style={{ width: `${stress.fillPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{itemCount} 項 ({totalQuantity} 件)</span>
                    <span className={`font-semibold ${stress.textColor}`}>{stress.fillPercentage}%</span>
                  </div>

                  {clutterCount > 0 && (
                    <div className="mt-1 pt-1 border-t border-slate-100 text-[10px] text-rose-600 font-medium flex items-center gap-1 truncate">
                      <Flame className="w-3 h-3 shrink-0" />
                      <span>含 {clutterCount} 件待處理雜物</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Room Selector Pills */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {rooms.map((room) => {
            const Icon = ROOM_ICON_MAP[room.icon] || Archive;
            const isSelected = room.id === currentRoom?.id;
            const rItems = items.filter(i => i.location.room === room.name);
            const count = rItems.length;
            const totalQty = rItems.reduce((acc, i) => acc + (i.quantity || 1), 0);
            const clutters = rItems.filter(i => i.status === 'clutter_pending' || i.status === 'to_discard' || i.status === 'to_recycle').length;
            const rStress = calculateStorageStress(count, totalQty, clutters, 16);

            return (
              <button
                key={room.id}
                id={`room-tab-${room.id}`}
                onClick={() => setSelectedRoomId(room.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{room.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
                {/* Visual Stress dot */}
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    rStress.level === 'overloaded'
                      ? 'bg-rose-500 ring-2 ring-rose-300 animate-pulse'
                      : rStress.level === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-emerald-400'
                  }`}
                  title={`填充度: 約 ${rStress.fillPercentage}% (${rStress.label})`}
                />
              </button>
            );
          })}
        </div>

        <button
          id="print-room-label-btn"
          onClick={() => onOpenPrintLabels(currentRoom?.name)}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          title="產生並列印此空間的收納箱索引標籤"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          列印空間收納標籤
        </button>
      </div>

      {/* Room Details & Storage Hierarchy */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <MapPin className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-800">
                    {currentRoom?.name} 收納地圖與位置索引
                  </h3>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded border ${currentRoomStress.bgColor} ${currentRoomStress.textColor} ${currentRoomStress.borderColor}`}
                  >
                    空間壓力：{currentRoomStress.label} ({currentRoomStress.fillPercentage}%)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  共收納 {roomItems.length} 項 ({currentRoomTotalQty} 件) 物品，分佈於 {furnituresInRoom.length} 個家具載體中
                  {currentRoomClutterCount > 0 && (
                    <span className="text-rose-600 font-medium ml-1">
                      (含 {currentRoomClutterCount} 件待處理雜物需斷捨離)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Stress filter toggle */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
              <button
                id="filter-all-furnitures"
                onClick={() => setStressFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  stressFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全部櫃體 ({furnituresInRoom.length})
              </button>
              <button
                id="filter-stressed-furnitures"
                onClick={() => setStressFilter('warning_only')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  stressFilter === 'warning_only'
                    ? 'bg-white text-rose-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="僅顯示收納壓力偏高或超載的家具"
              >
                <Flame className="w-3 h-3 text-rose-500" />
                僅顯示擁擠區
              </button>
            </div>

            <button
              id="add-item-to-current-room-btn"
              onClick={() => onAddNewItemInLocation(currentRoom?.name, '', '')}
              className="px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              在此空間登記物品
            </button>
          </div>
        </div>

        {/* Current Room Detailed Stress Gauge Banner */}
        <StorageStressGauge
          itemCount={roomItems.length}
          totalQuantity={currentRoomTotalQty}
          clutterCount={currentRoomClutterCount}
          threshold={18}
          showDetails={true}
        />

        {displayedFurnitures.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            {stressFilter === 'warning_only'
              ? '🎉 太棒了！此空間的所有收納載體目前都處於健康充裕狀態，無過度擁擠壓力。'
              : '此空間尚未建立任何收納櫃或物品'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedFurnitures.map((furnitureName) => {
              const furnitureItems = roomItems.filter(
                i => i.location.furniture === furnitureName
              );
              const isExpanded = expandedFurnitures[furnitureName] !== false; // default expanded
              const fStress = furnitureStressMap[furnitureName];

              // Group by specific spot
              const spotMap: Record<string, InventoryItem[]> = {};
              furnitureItems.forEach((it) => {
                const s = it.location.spot || '未指定具體層格';
                if (!spotMap[s]) spotMap[s] = [];
                spotMap[s].push(it);
              });

              return (
                <div
                  key={furnitureName}
                  id={`furniture-card-${furnitureName}`}
                  className={`border rounded-xl bg-slate-50/40 overflow-hidden shadow-2xs hover:border-slate-300 transition-all ${
                    fStress?.level === 'overloaded'
                      ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/20'
                      : fStress?.level === 'warning'
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200/90'
                  }`}
                >
                  {/* Furniture Header */}
                  <div
                    onClick={() => toggleFurniture(furnitureName)}
                    className="p-3.5 bg-white border-b border-slate-100 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/70"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                      <Boxes className="w-4 h-4 text-slate-600" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-bold text-slate-800">
                            {furnitureName}
                          </span>
                          {fStress?.level === 'overloaded' && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200">
                              急需整理
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Compact Storage Stress Indicator */}
                      {fStress && (
                        <StorageStressGauge
                          itemCount={fStress.itemCount}
                          totalQuantity={fStress.totalQty}
                          clutterCount={fStress.clutterCount}
                          threshold={6}
                          compact={true}
                        />
                      )}

                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {furnitureItems.length} 件物品
                      </span>
                      <button
                        id={`add-in-${furnitureName}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddNewItemInLocation(currentRoom?.name, furnitureName, '');
                        }}
                        className="p-1 rounded-md text-slate-500 hover:bg-slate-100 hover:text-emerald-700 cursor-pointer"
                        title="在此櫃體新增物品"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Spot & Furniture Stress Prompt Banner */}
                  {isExpanded && fStress && fStress.level !== 'spacious' && (
                    <div className={`px-3 py-1.5 text-[11px] border-b flex items-center justify-between ${fStress.bgColor} ${fStress.borderColor}`}>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        {fStress.level === 'overloaded' ? (
                          <Flame className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                        <span>{fStress.description}</span>
                      </div>
                      <span className={`font-semibold shrink-0 ${fStress.textColor}`}>
                        {fStress.suggestion}
                      </span>
                    </div>
                  )}

                  {/* Spots and Items list */}
                  {isExpanded && (
                    <div className="p-3 space-y-3">
                      {furnitureItems.length === 0 ? (
                        <div className="text-center py-4 text-slate-400 text-xs italic">
                          目前無存放物品
                        </div>
                      ) : (
                        Object.entries(spotMap).map(([spotName, sItems]) => {
                          const spotQty = sItems.reduce((acc, i) => acc + (i.quantity || 1), 0);
                          const spotClutter = sItems.filter(i => i.status === 'clutter_pending' || i.status === 'to_discard' || i.status === 'to_recycle').length;
                          const spotStress = calculateStorageStress(sItems.length, spotQty, spotClutter, 4);

                          return (
                            <div
                              key={spotName}
                              className={`bg-white rounded-lg p-2.5 border shadow-3xs space-y-2 ${
                                spotStress.level === 'overloaded'
                                  ? 'border-rose-200'
                                  : 'border-slate-200/80'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 border-b border-slate-100 pb-1.5">
                                <span className="flex items-center gap-1 text-slate-800">
                                  <span
                                    className={`w-2 h-2 rounded-full ${spotStress.barColor}`}
                                  />
                                  {spotName}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`text-[9px] px-1 py-0.2 rounded border ${spotStress.bgColor} ${spotStress.textColor} ${spotStress.borderColor}`}
                                  >
                                    {spotStress.badgeLabel}
                                  </span>
                                  <span className="text-slate-400 text-[10px]">
                                    {sItems.length} 項 ({spotQty} 件)
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                {sItems.map((item) => (
                                  <div
                                    key={item.id}
                                    id={`space-item-${item.id}`}
                                    onClick={() => onEditItem(item)}
                                    className="p-2 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between text-xs"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <span className="font-medium text-slate-800 truncate">
                                        {item.name}
                                      </span>
                                      <span className="text-slate-400 text-[11px] shrink-0">
                                        × {item.quantity} {item.unit}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {item.status === 'clutter_pending' && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                                          待整理
                                        </span>
                                      )}
                                      <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded border ${getCategoryColor(
                                          item.category
                                        )}`}
                                      >
                                        {item.category}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
