import React, { useState, useEffect } from 'react';
import { InventoryItem, RoomDefinition, FilterState, ActiveTab, ItemStatus } from './types';
import {
  loadStoredItems,
  saveStoredItems,
  loadStoredRooms,
  saveStoredRooms,
  exportDataAsJson,
  resetToDefaults
} from './utils/storage';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { DeclutterWorkbench } from './components/DeclutterWorkbench';
import { ItemListView } from './components/ItemListView';
import { SpaceExplorerView } from './components/SpaceExplorerView';
import { ItemFormModal } from './components/ItemFormModal';
import { PrintLabelModal } from './components/PrintLabelModal';

export default function App() {
  const [items, setItems] = useState<InventoryItem[]>(() => loadStoredItems());
  const [rooms, setRooms] = useState<RoomDefinition[]>(() => loadStoredRooms());
  const [activeTab, setActiveTab] = useState<ActiveTab>('declutter');

  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    room: '',
    category: '',
    status: '',
    tag: ''
  });

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [initialLocation, setInitialLocation] = useState<{ room: string; furniture: string; spot: string } | undefined>();
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printRoomFilter, setPrintRoomFilter] = useState<string | undefined>();

  // Persist items whenever changed
  useEffect(() => {
    saveStoredItems(items);
  }, [items]);

  // Persist rooms whenever changed
  useEffect(() => {
    saveStoredRooms(rooms);
  }, [rooms]);

  // Handler: Add or Edit Item
  const handleSaveItem = (itemData: Partial<InventoryItem>) => {
    if (itemData.id) {
      // Edit existing
      setItems(prev =>
        prev.map(item =>
          item.id === itemData.id
            ? ({ ...item, ...itemData, updatedAt: Date.now() } as InventoryItem)
            : item
        )
      );
    } else {
      // Create new
      const newItem: InventoryItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: itemData.name || '未命名物品',
        category: itemData.category || '日常備品',
        quantity: itemData.quantity || 1,
        unit: itemData.unit || '個',
        location: itemData.location || {
          room: '客廳',
          furniture: '電視櫃',
          spot: '主要收納層'
        },
        status: itemData.status || 'organized',
        frequency: itemData.frequency || 'weekly',
        tags: itemData.tags || [],
        notes: itemData.notes,
        expiresAt: itemData.expiresAt,
        reviewDate: itemData.reviewDate,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setItems(prev => [newItem, ...prev]);
    }
  };

  // Handler: Update Item
  const handleUpdateItem = (updatedItem: InventoryItem) => {
    setItems(prev =>
      prev.map(item => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  // Handler: Delete Item
  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Handler: Quick Status Change
  const handleQuickStatusChange = (item: InventoryItem, newStatus: ItemStatus) => {
    handleUpdateItem({
      ...item,
      status: newStatus,
      updatedAt: Date.now()
    });
  };

  // Handler: Batch Intake from Declutter Workbench
  const handleBatchAddClutter = (names: string[], sourceRoom: string, sourceSpot: string) => {
    const newItems: InventoryItem[] = names.map((name, idx) => ({
      id: `clutter-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      category: '其他雜物',
      quantity: 1,
      unit: '件',
      location: {
        room: sourceRoom,
        furniture: '待整理區',
        spot: sourceSpot
      },
      status: 'clutter_pending',
      frequency: 'rarely',
      tags: ['待斷捨離', '雜物集中'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));

    setItems(prev => [...newItems, ...prev]);
  };

  // Handler: Open Add Modal from specific Location in Space Explorer
  const handleAddNewItemInLocation = (room: string, furniture: string, spot: string) => {
    setItemToEdit(null);
    setInitialLocation({ room, furniture, spot });
    setIsItemModalOpen(true);
  };

  // Handler: Open Edit Modal
  const handleEditItem = (item: InventoryItem) => {
    setItemToEdit(item);
    setInitialLocation(undefined);
    setIsItemModalOpen(true);
  };

  // Handler: Filter selection from StatsBar
  const handleSelectStatusFromStats = (status: string) => {
    setFilterState(prev => ({ ...prev, status }));
    // If user clicks a stat card, jump to inventory tab so they can see matching items
    setActiveTab('inventory');
  };

  // Handler: Export Backup
  const handleExport = () => {
    exportDataAsJson(items, rooms);
  };

  // Handler: Import Backup
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.items)) {
          setItems(parsed.items);
          if (Array.isArray(parsed.rooms)) {
            setRooms(parsed.rooms);
          }
          alert('資料備份已成功還原！');
        } else {
          alert('匯入格式不正確，找不到 items 清單');
        }
      } catch (err) {
        alert('匯入檔案解析失敗，請確認檔案格式是否為有效 JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handler: Reset to Defaults
  const handleReset = () => {
    const data = resetToDefaults();
    setItems(data.items);
    setRooms(data.rooms);
    setFilterState({
      searchQuery: '',
      room: '',
      category: '',
      status: '',
      tag: ''
    });
  };

  const clutterCount = items.filter(i => i.status === 'clutter_pending').length;

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 font-sans flex flex-col">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddNewItem={() => {
          setItemToEdit(null);
          setInitialLocation(undefined);
          setIsItemModalOpen(true);
        }}
        onOpenPrintModal={() => {
          setPrintRoomFilter(undefined);
          setIsPrintModalOpen(true);
        }}
        onExport={handleExport}
        onImport={handleImport}
        onReset={handleReset}
        clutterCount={clutterCount}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {/* High-level Stats Overview Bar */}
        <StatsBar
          items={items}
          selectedStatus={filterState.status}
          onSelectStatus={handleSelectStatusFromStats}
        />

        {/* View Switcher based on Active Tab */}
        {activeTab === 'declutter' && (
          <DeclutterWorkbench
            items={items}
            rooms={rooms}
            onUpdateItem={handleUpdateItem}
            onBatchAddClutter={handleBatchAddClutter}
            onDeleteItem={handleDeleteItem}
            onSwitchToInventory={() => setActiveTab('inventory')}
          />
        )}

        {activeTab === 'inventory' && (
          <ItemListView
            items={items}
            rooms={rooms}
            filterState={filterState}
            onFilterChange={(patch) => setFilterState(prev => ({ ...prev, ...patch }))}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onQuickStatusChange={handleQuickStatusChange}
            onAddNewItem={() => {
              setItemToEdit(null);
              setInitialLocation(undefined);
              setIsItemModalOpen(true);
            }}
          />
        )}

        {activeTab === 'spaces' && (
          <SpaceExplorerView
            rooms={rooms}
            items={items}
            onAddNewItemInLocation={handleAddNewItemInLocation}
            onEditItem={handleEditItem}
            onOpenPrintLabels={(room) => {
              setPrintRoomFilter(room);
              setIsPrintModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Modals */}
      <ItemFormModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
        rooms={rooms}
        initialLocation={initialLocation}
      />

      <PrintLabelModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        items={items}
        rooms={rooms}
        defaultRoomFilter={printRoomFilter}
      />
    </div>
  );
}
