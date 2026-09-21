export type ItemStatus = 'organized' | 'clutter_pending' | 'to_donate' | 'to_discard' | 'to_recycle' | 'later_box';

export type ItemFrequency = 'daily' | 'weekly' | 'seasonal' | 'rarely';

export interface StorageLocation {
  room: string;          // e.g. 客廳, 臥室, 廚房, 書房, 玄關, 儲藏室
  furniture: string;     // e.g. 電視櫃, 主衣櫃, 料理台水槽下, 書架, 鞋櫃
  spot: string;          // e.g. 右側第1抽屜, 上層收納箱A, 第2層隔板, 掛勾
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;      // e.g. 電子線材, 藥品急救, 衣物服飾, 重要文件, 日常備品, 工具五金, 廚房餐具, 紀念收藏, 季節用品, 其他
  quantity: number;
  unit: string;          // e.g. 個, 條, 盒, 本, 件, 包, 罐
  location: StorageLocation;
  status: ItemStatus;
  frequency: ItemFrequency;
  tags: string[];
  notes?: string;
  expiresAt?: string;    // YYYY-MM-DD for medicines, food, warranty
  reviewDate?: string;   // For 'later_box' items (猶豫箱複檢日)
  createdAt: number;
  updatedAt: number;
}

export interface RoomDefinition {
  id: string;
  name: string;
  icon: string;
  defaultFurnitures: string[];
}

export interface CategoryDefinition {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface FilterState {
  searchQuery: string;
  room: string;
  category: string;
  status: string;
  tag: string;
}

export type ActiveTab = 'inventory' | 'declutter' | 'spaces' | 'management';
