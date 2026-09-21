import { InventoryItem, RoomDefinition, CategoryDefinition } from '../types';
import { DEFAULT_ROOMS, INITIAL_ITEMS, CATEGORIES } from '../data/defaultData';

const STORAGE_KEY_ITEMS = 'declutter_organizer_items_v1';
const STORAGE_KEY_ROOMS = 'declutter_organizer_rooms_v1';
const STORAGE_KEY_CATEGORIES = 'declutter_organizer_categories_v1';

export function loadStoredItems(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ITEMS;
  } catch (err) {
    console.error('Failed to load items from localStorage', err);
    return INITIAL_ITEMS;
  }
}

export function saveStoredItems(items: InventoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save items to localStorage', err);
  }
}

export function loadStoredRooms(): RoomDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROOMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(DEFAULT_ROOMS));
      return DEFAULT_ROOMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ROOMS;
  } catch (err) {
    console.error('Failed to load rooms from localStorage', err);
    return DEFAULT_ROOMS;
  }
}

export function saveStoredRooms(rooms: RoomDefinition[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(rooms));
  } catch (err) {
    console.error('Failed to save rooms to localStorage', err);
  }
}

export function loadStoredCategories(): CategoryDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(CATEGORIES));
      return CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : CATEGORIES;
  } catch (err) {
    console.error('Failed to load categories from localStorage', err);
    return CATEGORIES;
  }
}

export function saveStoredCategories(categories: CategoryDefinition[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories to localStorage', err);
  }
}

export function exportDataAsJson(items: InventoryItem[], rooms: RoomDefinition[], categories?: CategoryDefinition[]): void {
  const exportPayload = {
    version: '1.1',
    exportDate: new Date().toISOString(),
    items,
    rooms,
    categories: categories || CATEGORIES
  };
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `home_inventory_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function resetToDefaults(): { items: InventoryItem[]; rooms: RoomDefinition[]; categories: CategoryDefinition[] } {
  localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(INITIAL_ITEMS));
  localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(DEFAULT_ROOMS));
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(CATEGORIES));
  return { items: INITIAL_ITEMS, rooms: DEFAULT_ROOMS, categories: CATEGORIES };
}
