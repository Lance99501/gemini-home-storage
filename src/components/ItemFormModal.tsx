import React, { useState, useEffect } from 'react';
import { InventoryItem, RoomDefinition, ItemStatus, ItemFrequency } from '../types';
import { CATEGORIES, STATUS_CONFIG } from '../data/defaultData';
import { X, MapPin, Check, Plus, Tag } from 'lucide-react';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<InventoryItem>) => void;
  itemToEdit: InventoryItem | null;
  rooms: RoomDefinition[];
  initialLocation?: { room: string; furniture: string; spot: string };
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
  rooms,
  initialLocation
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('個');
  const [room, setRoom] = useState(rooms[0]?.name || '客廳');
  const [furniture, setFurniture] = useState('');
  const [spot, setSpot] = useState('');
  const [status, setStatus] = useState<ItemStatus>('organized');
  const [frequency, setFrequency] = useState<ItemFrequency>('weekly');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [reviewDate, setReviewDate] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setCategory(itemToEdit.category);
      setQuantity(itemToEdit.quantity);
      setUnit(itemToEdit.unit || '個');
      setRoom(itemToEdit.location.room);
      setFurniture(itemToEdit.location.furniture);
      setSpot(itemToEdit.location.spot || '');
      setStatus(itemToEdit.status);
      setFrequency(itemToEdit.frequency || 'weekly');
      setTags(itemToEdit.tags || []);
      setNotes(itemToEdit.notes || '');
      setExpiresAt(itemToEdit.expiresAt || '');
      setReviewDate(itemToEdit.reviewDate || '');
    } else {
      setName('');
      setCategory(CATEGORIES[0].name);
      setQuantity(1);
      setUnit('個');
      setRoom(initialLocation?.room || rooms[0]?.name || '客廳');
      setFurniture(initialLocation?.furniture || '');
      setSpot(initialLocation?.spot || '');
      setStatus('organized');
      setFrequency('weekly');
      setTags([]);
      setNotes('');
      setExpiresAt('');
      setReviewDate('');
    }
  }, [itemToEdit, initialLocation, rooms, isOpen]);

  if (!isOpen) return null;

  const currentRoomObj = rooms.find((r) => r.name === room);
  const furniturePresets = currentRoomObj?.defaultFurnitures || [];

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...(itemToEdit ? { id: itemToEdit.id } : {}),
      name: name.trim(),
      category,
      quantity: Number(quantity) || 1,
      unit: unit.trim() || '個',
      location: {
        room,
        furniture: furniture.trim() || '主要收納櫃',
        spot: spot.trim() || '標準收納位'
      },
      status,
      frequency,
      tags,
      notes: notes.trim() || undefined,
      expiresAt: expiresAt || undefined,
      reviewDate: reviewDate || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="item-form-modal-dialog"
        className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {itemToEdit ? '編輯收納物品' : '登記新收納物品'}
            </h3>
            <p className="text-xs text-slate-500">
              明確標註物品名稱、所屬空間與收納位置
            </p>
          </div>
          <button
            id="close-item-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Item Name & Quantity */}
          <div className="space-y-1">
            <label className="block text-slate-700 font-semibold">
              物品名稱 <span className="text-rose-500">*</span>
            </label>
            <input
              id="item-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：HDMI 延長線、吸頂燈備用燈泡、降血壓常備藥"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                分類歸納
              </label>
              <select
                id="item-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                數量
              </label>
              <input
                id="item-quantity-input"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
              </input>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                單位
              </label>
              <input
                id="item-unit-input"
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="個 / 條 / 盒 / 本"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Location Hierarchy */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-emerald-600" />
              收納位置標記（階層式定位）
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  1. 空間 / 房間
                </label>
                <select
                  id="item-room-select"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
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
                  2. 家具 / 收納櫃
                </label>
                <input
                  id="item-furniture-input"
                  type="text"
                  list="furniture-options"
                  value={furniture}
                  onChange={(e) => setFurniture(e.target.value)}
                  placeholder="如：電視櫃、主大衣櫃"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
                <datalist id="furniture-options">
                  {furniturePresets.map((f, i) => (
                    <option key={i} value={f} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  3. 具體層抽 / 收納盒
                </label>
                <input
                  id="item-spot-input"
                  type="text"
                  value={spot}
                  onChange={(e) => setSpot(e.target.value)}
                  placeholder="如：第2抽屜、透明盒A"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Status & Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                物品整理狀態
              </label>
              <select
                id="item-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as ItemStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                {Object.entries(STATUS_CONFIG).map(([k, val]) => (
                  <option key={k} value={k}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                使用頻率
              </label>
              <select
                id="item-frequency-select"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as ItemFrequency)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="daily">日常天天使用（黃金視線拿取位）</option>
                <option value="weekly">每週定期使用</option>
                <option value="seasonal">季節換季/特定節日用品</option>
                <option value="rarely">極少使用/常態備份備品</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="block text-slate-700 font-semibold">
              自訂標籤 (Tags)
            </label>
            <div className="flex gap-2">
              <input
                id="item-tag-input"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="輸入標籤後按 Enter 或點新增，如：保固內、易碎、急救"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                id="add-tag-btn"
                onClick={handleAddTag}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium cursor-pointer"
              >
                新增標籤
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px]"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-slate-400 hover:text-rose-500 ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Expiration or Review Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                到期日 / 保固到期日 (選填)
              </label>
              <input
                id="item-expires-input"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {status === 'later_box' && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  猶豫箱複檢期限 (選填)
                </label>
                <input
                  id="item-review-input"
                  type="date"
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              備註說明 (選填)
            </label>
            <textarea
              id="item-notes-textarea"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="如：規格說明、購買日期、注意事項、附屬配件存放說明"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              id="cancel-item-modal-btn"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              id="save-item-modal-btn"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Check className="w-4 h-4" />
              儲存並標記位置
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
