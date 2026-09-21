import React, { useState } from 'react';
import { RoomDefinition, CategoryDefinition, InventoryItem } from '../types';
import {
  Sofa,
  Bed,
  Utensils,
  BookOpen,
  DoorOpen,
  Archive,
  Box,
  Layers,
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Tag,
  MapPin,
  ChevronRight,
  Info
} from 'lucide-react';

interface SpaceCategoryManagerProps {
  rooms: RoomDefinition[];
  categories: CategoryDefinition[];
  items: InventoryItem[];
  onUpdateRooms: (rooms: RoomDefinition[]) => void;
  onUpdateCategories: (categories: CategoryDefinition[]) => void;
  onRenameRoomCascade?: (oldRoomName: string, newRoomName: string) => void;
  onRenameCategoryCascade?: (oldCategoryName: string, newCategoryName: string) => void;
  onDeleteRoomCascade?: (roomName: string) => void;
}

const AVAILABLE_ICONS = [
  { id: 'Sofa', label: '客廳/沙發', icon: Sofa },
  { id: 'Bed', label: '臥室/床鋪', icon: Bed },
  { id: 'Utensils', label: '廚房/餐廚', icon: Utensils },
  { id: 'BookOpen', label: '書房/閱讀', icon: BookOpen },
  { id: 'DoorOpen', label: '玄關/門口', icon: DoorOpen },
  { id: 'Archive', label: '儲藏室/倉儲', icon: Archive },
  { id: 'Box', label: '箱子/置物盒', icon: Box },
  { id: 'Layers', label: '層架/陽台', icon: Layers }
];

const COLOR_PALETTES = [
  { id: 'blue', label: '科技藍', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'rose', label: '警戒紅', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'amber', label: '警示橘黃', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'emerald', label: '清新綠', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'purple', label: '典雅紫', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'cyan', label: '天水青', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { id: 'orange', label: '溫暖橘', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'pink', label: '柔粉紅', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { id: 'slate', label: '質樸灰', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  { id: 'teal', label: '翡翠墨綠', color: 'bg-teal-50 text-teal-700 border-teal-200' }
];

export const SpaceCategoryManager: React.FC<SpaceCategoryManagerProps> = ({
  rooms,
  categories,
  items,
  onUpdateRooms,
  onUpdateCategories,
  onRenameRoomCascade,
  onRenameCategoryCascade,
  onDeleteRoomCascade
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'spaces' | 'categories'>('spaces');

  // Room editing / adding state
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomNameInput, setRoomNameInput] = useState('');
  const [roomIconInput, setRoomIconInput] = useState('Sofa');
  const [furnituresList, setFurnituresList] = useState<string[]>([]);
  const [newFurnitureInput, setNewFurnitureInput] = useState('');
  const [isAddingRoom, setIsAddingRoom] = useState(false);

  // Category editing / adding state
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState('');
  const [categoryColorInput, setCategoryColorInput] = useState(COLOR_PALETTES[0].color);
  const [categoryDescInput, setCategoryDescInput] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Feedback message
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // ROOM LOGIC
  const startEditRoom = (room: RoomDefinition) => {
    setEditingRoomId(room.id);
    setIsAddingRoom(false);
    setRoomNameInput(room.name);
    setRoomIconInput(room.icon || 'Sofa');
    setFurnituresList([...(room.defaultFurnitures || [])]);
    setNewFurnitureInput('');
  };

  const startAddRoom = () => {
    setIsAddingRoom(true);
    setEditingRoomId(null);
    setRoomNameInput('');
    setRoomIconInput('Sofa');
    setFurnituresList(['主要置物櫃', '活動收納箱']);
    setNewFurnitureInput('');
  };

  const cancelRoomEdit = () => {
    setEditingRoomId(null);
    setIsAddingRoom(false);
    setRoomNameInput('');
    setFurnituresList([]);
  };

  const handleAddFurnitureToDraft = () => {
    const val = newFurnitureInput.trim();
    if (!val) return;
    if (furnituresList.includes(val)) {
      showToast('該收納家具/層架名稱已在清單中');
      return;
    }
    setFurnituresList([...furnituresList, val]);
    setNewFurnitureInput('');
  };

  const handleRemoveFurnitureFromDraft = (furnitureName: string) => {
    setFurnituresList(furnituresList.filter(f => f !== furnitureName));
  };

  const handleSaveRoom = () => {
    const trimmedName = roomNameInput.trim();
    if (!trimmedName) {
      showToast('請輸入空間區域名稱');
      return;
    }

    if (isAddingRoom) {
      // Check duplicate name
      if (rooms.some(r => r.name.toLowerCase() === trimmedName.toLowerCase())) {
        showToast('已有同名的空間區域，請使用不同名稱');
        return;
      }
      const newRoom: RoomDefinition = {
        id: `room_${Date.now()}`,
        name: trimmedName,
        icon: roomIconInput,
        defaultFurnitures: furnituresList.length > 0 ? furnituresList : ['預設收納櫃']
      };
      onUpdateRooms([...rooms, newRoom]);
      showToast(`已成功新增空間「${trimmedName}」！`);
      cancelRoomEdit();
    } else if (editingRoomId) {
      const originalRoom = rooms.find(r => r.id === editingRoomId);
      if (!originalRoom) return;

      // Check if renamed
      if (
        originalRoom.name !== trimmedName &&
        rooms.some(r => r.id !== editingRoomId && r.name.toLowerCase() === trimmedName.toLowerCase())
      ) {
        showToast('已有同名的空間區域，請使用不同名稱');
        return;
      }

      const updatedRooms = rooms.map(r => {
        if (r.id === editingRoomId) {
          return {
            ...r,
            name: trimmedName,
            icon: roomIconInput,
            defaultFurnitures: furnituresList
          };
        }
        return r;
      });

      onUpdateRooms(updatedRooms);

      // Cascade rename items if room name changed
      if (originalRoom.name !== trimmedName && onRenameRoomCascade) {
        onRenameRoomCascade(originalRoom.name, trimmedName);
      }

      showToast(`空間「${trimmedName}」已更新！`);
      cancelRoomEdit();
    }
  };

  const handleDeleteRoom = (room: RoomDefinition) => {
    const itemCount = items.filter(i => i.location.room === room.name).length;
    let confirmPrompt = `確定要刪除空間「${room.name}」嗎？`;
    if (itemCount > 0) {
      confirmPrompt = `空間「${room.name}」內目前有 ${itemCount} 件物品！刪除後，這些物品將會自動轉移為「待整理 / 空間待定位」。是否確定刪除？`;
    }

    if (confirm(confirmPrompt)) {
      const remainingRooms = rooms.filter(r => r.id !== room.id);
      onUpdateRooms(remainingRooms);
      if (onDeleteRoomCascade) {
        onDeleteRoomCascade(room.name);
      }
      showToast(`已刪除空間「${room.name}」`);
      if (editingRoomId === room.id) {
        cancelRoomEdit();
      }
    }
  };

  // CATEGORY LOGIC
  const startEditCategory = (cat: CategoryDefinition) => {
    setEditingCategoryId(cat.id);
    setIsAddingCategory(false);
    setCategoryNameInput(cat.name);
    setCategoryColorInput(cat.color || COLOR_PALETTES[0].color);
    setCategoryDescInput(cat.description || '');
  };

  const startAddCategory = () => {
    setIsAddingCategory(true);
    setEditingCategoryId(null);
    setCategoryNameInput('');
    setCategoryColorInput(COLOR_PALETTES[0].color);
    setCategoryDescInput('');
  };

  const cancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setIsAddingCategory(false);
    setCategoryNameInput('');
    setCategoryDescInput('');
  };

  const handleSaveCategory = () => {
    const trimmedName = categoryNameInput.trim();
    if (!trimmedName) {
      showToast('請輸入分類歸納名稱');
      return;
    }

    if (isAddingCategory) {
      if (categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
        showToast('已有同名的分類，請使用不同名稱');
        return;
      }
      const newCat: CategoryDefinition = {
        id: `cat_${Date.now()}`,
        name: trimmedName,
        color: categoryColorInput,
        description: categoryDescInput.trim()
      };
      onUpdateCategories([...categories, newCat]);
      showToast(`已成功新增分類「${trimmedName}」！`);
      cancelCategoryEdit();
    } else if (editingCategoryId) {
      const originalCat = categories.find(c => c.id === editingCategoryId);
      if (!originalCat) return;

      if (
        originalCat.name !== trimmedName &&
        categories.some(c => c.id !== editingCategoryId && c.name.toLowerCase() === trimmedName.toLowerCase())
      ) {
        showToast('已有同名的分類，請使用不同名稱');
        return;
      }

      const updatedCats = categories.map(c => {
        if (c.id === editingCategoryId) {
          return {
            ...c,
            name: trimmedName,
            color: categoryColorInput,
            description: categoryDescInput.trim()
          };
        }
        return c;
      });

      onUpdateCategories(updatedCats);

      // Cascade rename items if category name changed
      if (originalCat.name !== trimmedName && onRenameCategoryCascade) {
        onRenameCategoryCascade(originalCat.name, trimmedName);
      }

      showToast(`分類「${trimmedName}」已更新！`);
      cancelCategoryEdit();
    }
  };

  const handleDeleteCategory = (cat: CategoryDefinition) => {
    const itemCount = items.filter(i => i.category === cat.name).length;
    let confirmPrompt = `確定要刪除分類「${cat.name}」嗎？`;
    if (itemCount > 0) {
      confirmPrompt = `有 ${itemCount} 件物品屬於「${cat.name}」分類！刪除後這些物品將自動歸類至「其他雜物」。是否確定刪除？`;
    }

    if (confirm(confirmPrompt)) {
      const remainingCats = categories.filter(c => c.id !== cat.id);
      onUpdateCategories(remainingCats);
      if (onRenameCategoryCascade) {
        onRenameCategoryCascade(cat.name, '其他雜物');
      }
      showToast(`已刪除分類「${cat.name}」`);
      if (editingCategoryId === cat.id) {
        cancelCategoryEdit();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Guidance */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
              <FolderTree className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              空間與分類選單管理
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            自由自訂您家中的房間空間、主要家具層架，以及物品分類標籤，所有新增、修改或刪除均會即時同步至選單與物品。
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
          <button
            id="subtab-spaces-btn"
            onClick={() => {
              setActiveSubTab('spaces');
              cancelCategoryEdit();
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'spaces'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            空間區域設定 ({rooms.length})
          </button>

          <button
            id="subtab-categories-btn"
            onClick={() => {
              setActiveSubTab('categories');
              cancelRoomEdit();
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'categories'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            分類歸納選單 ({categories.length})
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {toastMsg}
        </div>
      )}

      {/* TAB 1: SPACES MANAGEMENT */}
      {activeSubTab === 'spaces' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Room Cards List */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                現有空間區域清單
              </h3>
              {!isAddingRoom && !editingRoomId && (
                <button
                  id="add-room-trigger-btn"
                  onClick={startAddRoom}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新增空間
                </button>
              )}
            </div>

            <div className="space-y-3">
              {rooms.map(room => {
                const roomItems = items.filter(i => i.location.room === room.name);
                const IconComponent = AVAILABLE_ICONS.find(ic => ic.id === room.icon)?.icon || Sofa;
                const isSelected = editingRoomId === room.id;

                return (
                  <div
                    key={room.id}
                    id={`room-card-${room.id}`}
                    className={`bg-white rounded-xl p-4 border transition-all ${
                      isSelected
                        ? 'border-indigo-400 ring-2 ring-indigo-50 shadow-sm'
                        : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{room.name}</h4>
                            <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              {roomItems.length} 件物品
                            </span>
                          </div>
                          {/* Furnitures chips */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {room.defaultFurnitures.map((f, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200/80"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          id={`edit-room-btn-${room.id}`}
                          onClick={() => startEditRoom(room)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="修改空間或家具"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-room-btn-${room.id}`}
                          onClick={() => handleDeleteRoom(room)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="刪除空間"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Room Add/Edit Form */}
          <div className="lg:col-span-5">
            {isAddingRoom || editingRoomId ? (
              <div className="bg-white rounded-2xl p-5 border border-indigo-200 shadow-sm sticky top-20 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {isAddingRoom ? <Plus className="w-4 h-4 text-indigo-600" /> : <Edit2 className="w-4 h-4 text-indigo-600" />}
                    {isAddingRoom ? '新增空間區域' : '修改空間與預設家具'}
                  </h3>
                  <button
                    onClick={cancelRoomEdit}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form fields */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      空間名稱 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="room-name-input"
                      type="text"
                      value={roomNameInput}
                      onChange={e => setRoomNameInput(e.target.value)}
                      placeholder="例如：客廳、主臥室、儲藏室、陽台..."
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                  </div>

                  {/* Icon selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      空間代表圖示
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {AVAILABLE_ICONS.map(item => {
                        const IconComp = item.icon;
                        const isChosen = roomIconInput === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setRoomIconInput(item.id)}
                            className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                              isChosen
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-200'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <IconComp className="w-4 h-4" />
                            <span className="text-[10px] truncate max-w-full">{item.label.split('/')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Furnitures list editor */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      此空間的收納家具 / 層架 / 箱群
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">
                      在新增物品時可直接點選快速定位（如電視櫃、床頭櫃、置物架）。
                    </p>

                    <div className="flex gap-2 mb-2.5">
                      <input
                        id="new-furniture-input"
                        type="text"
                        value={newFurnitureInput}
                        onChange={e => setNewFurnitureInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddFurnitureToDraft();
                          }
                        }}
                        placeholder="輸入家具名稱（如：大書架第3層）"
                        className="flex-1 text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        id="add-furniture-to-draft-btn"
                        onClick={handleAddFurnitureToDraft}
                        className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors cursor-pointer"
                      >
                        加入
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border border-slate-100 rounded-lg bg-slate-50/50">
                      {furnituresList.length === 0 ? (
                        <span className="text-xs text-slate-400 italic py-1 px-2">尚未新增任何收納家具</span>
                      ) : (
                        furnituresList.map((f, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 text-xs bg-white text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs"
                          >
                            {f}
                            <button
                              type="button"
                              onClick={() => handleRemoveFurnitureFromDraft(f)}
                              className="text-slate-400 hover:text-rose-600 rounded"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      id="save-room-btn"
                      onClick={handleSaveRoom}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isAddingRoom ? '儲存新空間' : '儲存空間變更'}
                    </button>
                    <button
                      onClick={cancelRoomEdit}
                      className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center text-slate-500 space-y-2">
                <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">空間操作小提示</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  點選左側任意空間的「修改」按鈕，即可編輯名稱、圖示或所屬家具；點選「新增空間」即可擴充新的房間區域。
                </p>
                <button
                  onClick={startAddRoom}
                  className="mt-2 px-3 py-1.5 bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新增空間區域
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES MANAGEMENT */}
      {activeSubTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Category Cards List */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                現有物品分類清單
              </h3>
              {!isAddingCategory && !editingCategoryId && (
                <button
                  id="add-category-trigger-btn"
                  onClick={startAddCategory}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新增分類
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map(cat => {
                const catItems = items.filter(i => i.category === cat.name);
                const isSelected = editingCategoryId === cat.id;

                return (
                  <div
                    key={cat.id}
                    id={`cat-card-${cat.id}`}
                    className={`bg-white rounded-xl p-3.5 border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-400 ring-2 ring-indigo-50 shadow-sm'
                        : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${cat.color}`}>
                          {cat.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            id={`edit-cat-btn-${cat.id}`}
                            onClick={() => startEditCategory(cat)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                            title="修改分類名稱或顏色"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-cat-btn-${cat.id}`}
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="刪除此分類"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {cat.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 mb-2">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>包含物品</span>
                      <span className="font-semibold text-slate-800">{catItems.length} 件</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Category Add/Edit Form */}
          <div className="lg:col-span-5">
            {isAddingCategory || editingCategoryId ? (
              <div className="bg-white rounded-2xl p-5 border border-indigo-200 shadow-sm sticky top-20 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {isAddingCategory ? <Plus className="w-4 h-4 text-indigo-600" /> : <Edit2 className="w-4 h-4 text-indigo-600" />}
                    {isAddingCategory ? '新增物品分類' : '修改分類歸納資訊'}
                  </h3>
                  <button
                    onClick={cancelCategoryEdit}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      分類名稱 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="category-name-input"
                      type="text"
                      value={categoryNameInput}
                      onChange={e => setCategoryNameInput(e.target.value)}
                      placeholder="例如：露營裝備、母嬰用品、保養美妝..."
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                  </div>

                  {/* Color Palette Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      分類識別色彩標籤
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {COLOR_PALETTES.map(p => {
                        const isChosen = categoryColorInput === p.color;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setCategoryColorInput(p.color)}
                            className={`px-2.5 py-1.5 rounded-lg border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                              isChosen
                                ? `${p.color} ring-2 ring-indigo-300 font-bold`
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span className="truncate">{p.label}</span>
                            {isChosen && <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      分類說明備註 (選填)
                    </label>
                    <textarea
                      id="category-desc-input"
                      value={categoryDescInput}
                      onChange={e => setCategoryDescInput(e.target.value)}
                      placeholder="備註這類物品適合歸納的類型或整理原則..."
                      rows={2}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                    />
                  </div>

                  {/* Preview Badge */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 block mb-1">標籤預覽效果：</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border inline-block ${categoryColorInput}`}>
                      {categoryNameInput.trim() || '分類預覽標籤'}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      id="save-category-btn"
                      onClick={handleSaveCategory}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isAddingCategory ? '儲存新分類' : '儲存分類變更'}
                    </button>
                    <button
                      onClick={cancelCategoryEdit}
                      className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center text-slate-500 space-y-2">
                <Tag className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">分類操作小提示</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  點選任意分類的「修改」可更換名稱與標籤色彩；點選「新增分類」可依您的個人生活習慣自訂新歸類標籤。
                </p>
                <button
                  onClick={startAddCategory}
                  className="mt-2 px-3 py-1.5 bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新增物品分類
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
