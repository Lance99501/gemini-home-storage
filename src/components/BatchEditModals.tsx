import React, { useState, useEffect } from 'react';
import { InventoryItem, RoomDefinition, StorageLocation, ItemStatus } from '../types';
import { STATUS_CONFIG } from '../data/defaultData';
import {
  FolderInput,
  MapPin,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Boxes,
  Calendar,
  Layers,
  HelpCircle,
  Archive,
  Gift,
  Recycle,
  Trash2,
  CheckCircle2
} from 'lucide-react';

interface BatchMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: InventoryItem[];
  rooms: RoomDefinition[];
  onConfirmMove: (location: StorageLocation, setStatusToOrganized: boolean) => void;
}

export const BatchMoveModal: React.FC<BatchMoveModalProps> = ({
  isOpen,
  onClose,
  selectedItems,
  rooms,
  onConfirmMove
}) => {
  const [targetRoom, setTargetRoom] = useState('');
  const [customRoom, setCustomRoom] = useState('');
  const [targetFurniture, setTargetFurniture] = useState('');
  const [customFurniture, setCustomFurniture] = useState('');
  const [targetSpot, setTargetSpot] = useState('主要收納層');
  const [markOrganized, setMarkOrganized] = useState(true);

  // Initialize room and furniture defaults
  useEffect(() => {
    if (isOpen) {
      if (rooms.length > 0) {
        const initialRoom = rooms[0];
        setTargetRoom(initialRoom.name);
        setCustomRoom('');
        if (initialRoom.defaultFurnitures && initialRoom.defaultFurnitures.length > 0) {
          setTargetFurniture(initialRoom.defaultFurnitures[0]);
        } else {
          setTargetFurniture('主要收納櫃');
        }
        setCustomFurniture('');
        setTargetSpot('主要收納層');
        setMarkOrganized(true);
      }
    }
  }, [isOpen, rooms]);

  if (!isOpen) return null;

  const currentRoomDef = rooms.find(r => r.name === targetRoom);
  const furnitures = currentRoomDef?.defaultFurnitures || [];

  const handleRoomChange = (roomName: string) => {
    setTargetRoom(roomName);
    if (roomName !== 'CUSTOM') {
      const found = rooms.find(r => r.name === roomName);
      if (found && found.defaultFurnitures.length > 0) {
        setTargetFurniture(found.defaultFurnitures[0]);
      } else {
        setTargetFurniture('主要收納櫃');
      }
    } else {
      setTargetFurniture('CUSTOM');
    }
  };

  const finalRoom = targetRoom === 'CUSTOM' ? customRoom.trim() : targetRoom;
  const finalFurniture = targetFurniture === 'CUSTOM' ? customFurniture.trim() : targetFurniture;
  const finalSpot = targetSpot.trim() || '主要收納層';

  const isValid = finalRoom.length > 0 && finalFurniture.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    onConfirmMove(
      {
        room: finalRoom,
        furniture: finalFurniture,
        spot: finalSpot
      },
      markOrganized
    );
  };

  return (
    <div
      id="batch-move-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="batch-move-modal"
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <FolderInput className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">批次移動空間位置</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                一鍵將選取的 <span className="font-bold text-emerald-600">{selectedItems.length}</span> 件物品移至指定空間
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Selected items preview */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span>即將移動的物品清單：</span>
              <span className="text-[11px] text-slate-400">共 {selectedItems.length} 件</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {selectedItems.map((item) => (
                <span
                  key={item.id}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[11px] text-slate-700 shadow-2xs truncate max-w-[180px]"
                  title={`${item.name} (${item.location.room} › ${item.location.furniture})`}
                >
                  {item.name}
                </span>
              ))}
            </div>
          </div>

          {/* Room Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              目標房間 (Room) <span className="text-rose-500">*</span>
            </label>
            <select
              id="batch-move-room-select"
              value={targetRoom}
              onChange={(e) => handleRoomChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.name}>
                  {room.name}
                </option>
              ))}
              <option value="CUSTOM">+ 自訂新房間名稱...</option>
            </select>

            {targetRoom === 'CUSTOM' && (
              <input
                id="batch-move-custom-room-input"
                type="text"
                placeholder="輸入自訂房間名稱，例如：儲藏室、兒童房、地下室"
                value={customRoom}
                onChange={(e) => setCustomRoom(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-emerald-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                autoFocus
              />
            )}
          </div>

          {/* Furniture Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              目標家具 / 收納櫃 (Furniture) <span className="text-rose-500">*</span>
            </label>
            {targetRoom !== 'CUSTOM' && furnitures.length > 0 ? (
              <select
                id="batch-move-furniture-select"
                value={targetFurniture}
                onChange={(e) => setTargetFurniture(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                {furnitures.map((f, i) => (
                  <option key={i} value={f}>
                    {f}
                  </option>
                ))}
                <option value="CUSTOM">+ 自訂新家具/櫃位名稱...</option>
              </select>
            ) : null}

            {(targetFurniture === 'CUSTOM' || furnitures.length === 0 || targetRoom === 'CUSTOM') && (
              <input
                id="batch-move-custom-furniture-input"
                type="text"
                placeholder="輸入家具或櫃位名稱，例如：白色三層抽屜櫃、大書架、電器櫃"
                value={customFurniture}
                onChange={(e) => setCustomFurniture(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            )}
          </div>

          {/* Spot Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              收納格位 / 抽屜 / 層板 (Spot)
            </label>
            <input
              id="batch-move-spot-input"
              type="text"
              placeholder="例如：第 2 層抽屜、收納盒 A、左格"
              value={targetSpot}
              onChange={(e) => setTargetSpot(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            {/* Quick spot suggestion pills */}
            <div className="flex flex-wrap gap-1 pt-1">
              {['主要收納層', '第 1 層抽屜', '第 2 層抽屜', '上層收納箱', '左側隔板'].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setTargetSpot(s)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                    targetSpot === s
                      ? 'bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Mark as organized option */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
              <input
                id="batch-move-mark-organized-checkbox"
                type="checkbox"
                checked={markOrganized}
                onChange={(e) => setMarkOrganized(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="font-medium">
                移動後同時將狀態標記為「已定位收納」（推薦）
              </span>
            </label>
          </div>

          {/* Destination Preview Breadcrumb */}
          {isValid && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="truncate">
                <span className="font-medium text-emerald-700">新位置：</span>
                <span className="font-bold"> {finalRoom}</span> › 
                <span className="font-bold"> {finalFurniture}</span>
                {finalSpot ? <span> › {finalSpot}</span> : ''}
              </div>
            </div>
          )}

          {/* Modal Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 pt-3 sm:pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-center"
            >
              取消
            </button>
            <button
              id="confirm-batch-move-btn"
              type="submit"
              disabled={!isValid}
              className={`w-full sm:w-auto px-5 py-2.5 sm:py-2 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                isValid
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              確認一鍵移動 ({selectedItems.length} 件)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface BatchStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: InventoryItem[];
  onConfirmStatus: (status: ItemStatus, reviewDate?: string) => void;
}

export const BatchStatusModal: React.FC<BatchStatusModalProps> = ({
  isOpen,
  onClose,
  selectedItems,
  onConfirmStatus
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ItemStatus>('organized');
  const [reviewDate, setReviewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmStatus(selectedStatus, selectedStatus === 'later_box' ? reviewDate : undefined);
  };

  const statusOptions: {
    status: ItemStatus;
    title: string;
    desc: string;
    colorClass: string;
    icon: React.ReactNode;
  }[] = [
    {
      status: 'organized',
      title: '已定位收納',
      desc: '物品已放入確定收納櫃與空間，井然有序',
      colorClass: 'border-emerald-300 bg-emerald-50/50 text-emerald-800 hover:bg-emerald-50',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />
    },
    {
      status: 'clutter_pending',
      title: '待整理雜物',
      desc: '待斷捨離決策或暫放分類中',
      colorClass: 'border-amber-300 bg-amber-50/50 text-amber-800 hover:bg-amber-50',
      icon: <Layers className="w-4 h-4 text-amber-600" />
    },
    {
      status: 'later_box',
      title: '猶豫暫存箱',
      desc: '捨不得丟先封箱，設定期限複檢',
      colorClass: 'border-indigo-300 bg-indigo-50/50 text-indigo-800 hover:bg-indigo-50',
      icon: <Archive className="w-4 h-4 text-indigo-600" />
    },
    {
      status: 'to_donate',
      title: '待捐贈 / 轉售',
      desc: '功能正常完好，準備送人或二手出清',
      colorClass: 'border-sky-300 bg-sky-50/50 text-sky-800 hover:bg-sky-50',
      icon: <Gift className="w-4 h-4 text-sky-600" />
    },
    {
      status: 'to_recycle',
      title: '待資源回收',
      desc: '電子零件、線材、紙箱塑膠分類回收',
      colorClass: 'border-teal-300 bg-teal-50/50 text-teal-800 hover:bg-teal-50',
      icon: <Recycle className="w-4 h-4 text-teal-600" />
    },
    {
      status: 'to_discard',
      title: '待丟棄 / 垃圾',
      desc: '破損、故障或過期，集中丟棄垃圾桶',
      colorClass: 'border-rose-300 bg-rose-50/50 text-rose-800 hover:bg-rose-50',
      icon: <Trash2 className="w-4 h-4 text-rose-600" />
    }
  ];

  return (
    <div
      id="batch-status-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="batch-status-modal"
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">批次變更收納狀態</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                一鍵將選取的 <span className="font-bold text-indigo-600">{selectedItems.length}</span> 件物品設定為相同狀態
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Selected items preview */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span>選取的物品清單：</span>
              <span className="text-[11px] text-slate-400">共 {selectedItems.length} 件</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {selectedItems.map((item) => (
                <span
                  key={item.id}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[11px] text-slate-700 shadow-2xs truncate max-w-[180px]"
                >
                  {item.name}
                </span>
              ))}
            </div>
          </div>

          {/* Status Selection Cards */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              選擇目標收納狀態 <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {statusOptions.map((opt) => {
                const isCurrent = selectedStatus === opt.status;
                return (
                  <button
                    key={opt.status}
                    type="button"
                    onClick={() => setSelectedStatus(opt.status)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isCurrent
                        ? `${opt.colorClass} ring-2 ring-indigo-500 shadow-xs`
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        {opt.icon}
                        <span>{opt.title}</span>
                      </div>
                      {isCurrent && (
                        <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                          ✓
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* If later_box is selected, show review date input */}
          {selectedStatus === 'later_box' && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                <Calendar className="w-4 h-4 text-indigo-600" />
                猶豫箱複檢日期設定
              </div>
              <p className="text-[11px] text-indigo-700">
                設定預計開封複檢的日子。若到期仍未使用，系統會自動在效期警示中提醒出清。
              </p>
              <input
                id="batch-status-review-date-input"
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          )}

          {/* Modal Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 pt-3 sm:pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-center"
            >
              取消
            </button>
            <button
              id="confirm-batch-status-btn"
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 sm:py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              確認變更為「{statusOptions.find(o => o.status === selectedStatus)?.title}」
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
