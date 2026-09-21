import { InventoryItem, RoomDefinition, CategoryDefinition } from '../types';

export const DEFAULT_ROOMS: RoomDefinition[] = [
  {
    id: 'living_room',
    name: '客廳',
    icon: 'Sofa',
    defaultFurnitures: ['電視櫃', '茶几收納盒', '邊櫃展示架', '玄關鞋櫃旁穿鞋凳']
  },
  {
    id: 'bedroom',
    name: '主臥室',
    icon: 'Bed',
    defaultFurnitures: ['主大衣櫃', '床頭櫃抽屜', '梳妝台收納格', '床底收納抽屜']
  },
  {
    id: 'kitchen',
    name: '廚房',
    icon: 'Utensils',
    defaultFurnitures: ['料理台水槽下', '吊櫃上層', '電器架', '冰箱側邊掛架', '乾貨零食櫃']
  },
  {
    id: 'study',
    name: '書房/工作區',
    icon: 'BookOpen',
    defaultFurnitures: ['大書架第2層', '電腦桌三層抽屜', '洞洞板掛置區', '文件防潮箱']
  },
  {
    id: 'entrance',
    name: '玄關',
    icon: 'DoorOpen',
    defaultFurnitures: ['多層鞋櫃', '玄關鑰匙置物盤', '雨傘掛架', '雜物高櫃']
  },
  {
    id: 'storage_room',
    name: '儲藏室/陽台',
    icon: 'Archive',
    defaultFurnitures: ['五層鍍鉻置物架', '透明大收納箱群', '工具推車', '洗衣機上方層架']
  }
];

export const CATEGORIES = [
  { id: 'electronics', name: '電子線材', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'medicine', name: '藥品急救', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'documents', name: '重要文件', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'supplies', name: '日常備品', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'tools', name: '工具五金', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  { id: 'clothing', name: '衣物服飾', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'kitchenware', name: '廚房餐廚', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'seasonal', name: '季節用品', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { id: 'memorabilia', name: '紀念收藏', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { id: 'others', name: '其他雜物', color: 'bg-gray-50 text-gray-700 border-gray-200' }
];

export const STATUS_CONFIG: Record<string, { label: string; badge: string; color: string; desc: string }> = {
  organized: {
    label: '已定位收納',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    color: 'text-emerald-600',
    desc: '已歸納至明確空間與收納點'
  },
  clutter_pending: {
    label: '待整理雜物',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    color: 'text-amber-600',
    desc: '剛從角落翻出的雜物，待斷捨離決策'
  },
  later_box: {
    label: '猶豫暫存箱',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    color: 'text-indigo-600',
    desc: '暫時捨不得丟，封箱一段時間若未用則處理'
  },
  to_donate: {
    label: '待捐贈/轉售',
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
    color: 'text-sky-600',
    desc: '功能完好但不再使用，準備贈予他人或二手轉售'
  },
  to_recycle: {
    label: '待資源回收',
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
    color: 'text-teal-600',
    desc: '電子線材、五金金屬、紙箱塑膠，集中資源回收'
  },
  to_discard: {
    label: '待丟棄/垃圾',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    color: 'text-rose-600',
    desc: '損壞或過期無用，打包丟入一般垃圾'
  }
};

export const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: 'item-1',
    name: '備用充電線 (Type-C / Lightning)',
    category: '電子線材',
    quantity: 4,
    unit: '條',
    location: {
      room: '客廳',
      furniture: '電視櫃',
      spot: '中間抽屜透明分隔盒'
    },
    status: 'organized',
    frequency: 'weekly',
    tags: ['3C配件', '充電', '有標籤束帶'],
    notes: '每一條皆用魔鬼氈綁帶捲好，支援 65W 快充',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3
  },
  {
    id: 'item-2',
    name: '急救家用常備藥盒 (普拿疼/止痛/OK繃)',
    category: '藥品急救',
    quantity: 1,
    unit: '盒',
    location: {
      room: '客廳',
      furniture: '電視櫃',
      spot: '最上方右側隔層（兒童拿不到處）'
    },
    status: 'organized',
    frequency: 'monthly' as any,
    tags: ['常備藥', '急救', '定期檢查'],
    notes: '內含小剪刀、優碘棉片與綜合感冒藥。注意期限',
    expiresAt: '2026-11-30',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 1
  },
  {
    id: 'item-3',
    name: '房子權狀與戶口名簿/保單資料夾',
    category: '重要文件',
    quantity: 1,
    unit: '本',
    location: {
      room: '書房/工作區',
      furniture: '文件防潮箱',
      spot: '第二層黑色風琴夾 B 槽'
    },
    status: 'organized',
    frequency: 'rarely',
    tags: ['極重要', '證件', '不可受潮'],
    notes: '若需外出辦理，用畢需當日放回原位',
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 10
  },
  {
    id: 'item-4',
    name: '小型多功能螺絲起子組',
    category: '工具五金',
    quantity: 1,
    unit: '組',
    location: {
      room: '玄關',
      furniture: '多層鞋櫃',
      spot: '最上層五金小抽屜'
    },
    status: 'organized',
    frequency: 'monthly' as any,
    tags: ['修繕', '精密螺絲', '居家工具'],
    notes: '拆換玩具電池或眼鏡維修時使用',
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4
  },
  {
    id: 'item-5',
    name: '厚羽絨冬被 (真空壓縮袋包裝)',
    category: '季節用品',
    quantity: 2,
    unit: '床',
    location: {
      room: '主臥室',
      furniture: '主大衣櫃',
      spot: '最頂層深色大收納箱 01 號'
    },
    status: 'organized',
    frequency: 'seasonal',
    tags: ['換季', '防塵', '冬季寢具'],
    notes: '已放入樟腦防潮袋，每年11月換季時取出',
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 86400000 * 20
  },
  // Items in "clutter_pending" to immediately give users things to declutter
  {
    id: 'item-6',
    name: '不知名舊變壓器與纏繞黑色線材',
    category: '電子線材',
    quantity: 3,
    unit: '捆',
    location: {
      room: '客廳',
      furniture: '電視櫃',
      spot: '後方堆積角落 (待斷捨離清空)'
    },
    status: 'clutter_pending',
    frequency: 'rarely',
    tags: ['雜亂堆積', '待確認規格', '可能是舊螢幕線'],
    notes: '先插電測試是否仍有設備對應，若無則送電子回收',
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1
  },
  {
    id: 'item-7',
    name: '2023 年過期保健食品與未吃完魚油',
    category: '藥品急救',
    quantity: 2,
    unit: '罐',
    location: {
      room: '廚房',
      furniture: '乾貨零食櫃',
      spot: '底層死角'
    },
    status: 'to_discard',
    frequency: 'rarely',
    tags: ['已過期', '需丟棄', '清理空間'],
    notes: '已過有效期限半年，不可再服用，待倒掉清瓶回收',
    expiresAt: '2023-08-15',
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1
  },
  {
    id: 'item-8',
    name: '去年路跑活動紀念T恤 (全新未拆)',
    category: '衣物服飾',
    quantity: 3,
    unit: '件',
    location: {
      room: '主臥室',
      furniture: '主大衣櫃',
      spot: '角落雜物袋'
    },
    status: 'to_donate',
    frequency: 'rarely',
    tags: ['二手贈送', '尺寸不合', '全新'],
    notes: '尺寸過大穿不到，整理送給親友或舊衣捐贈箱',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2
  },
  {
    id: 'item-9',
    name: '高中同學會拍立得與紀念徽章盒',
    category: '紀念收藏',
    quantity: 1,
    unit: '盒',
    location: {
      room: '書房/工作區',
      furniture: '大書架第2層',
      spot: '猶豫暫存箱 01'
    },
    status: 'later_box',
    frequency: 'rarely',
    tags: ['情感回憶', '猶豫保留', '定期回顧'],
    notes: '目前捨不得丟，暫存在猶豫箱。若 3 個月後無翻閱再考慮數位拍照後精簡',
    reviewDate: '2026-10-31',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2
  },
  {
    id: 'item-10',
    name: '損壞老舊延長線與廢乾電池',
    category: '電子線材',
    quantity: 4,
    unit: '件',
    location: {
      room: '客廳',
      furniture: '電視櫃',
      spot: '資源回收待處理袋'
    },
    status: 'to_recycle',
    frequency: 'rarely',
    tags: ['電子廢棄物', '資源回收', '環保'],
    notes: '線路接觸不良已老舊，不可再通電，集中至資源回收站',
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1
  }
];
