import React, { useState } from 'react';
import { InventoryItem, RoomDefinition } from '../types';
import { X, Printer, Check, Copy } from 'lucide-react';

interface PrintLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  rooms: RoomDefinition[];
  defaultRoomFilter?: string;
}

export const PrintLabelModal: React.FC<PrintLabelModalProps> = ({
  isOpen,
  onClose,
  items,
  rooms,
  defaultRoomFilter
}) => {
  const [selectedRoom, setSelectedRoom] = useState<string>(defaultRoomFilter || '');
  const [selectedFurniture, setSelectedFurniture] = useState<string>('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Filter items by room and optional furniture
  const filtered = items.filter((item) => {
    if (selectedRoom && item.location.room !== selectedRoom) return false;
    if (selectedFurniture && item.location.furniture !== selectedFurniture) return false;
    return item.status === 'organized';
  });

  // Group by Room -> Furniture -> Spot for distinct label cards
  const groups: Record<string, InventoryItem[]> = {};
  filtered.forEach((item) => {
    const key = `${item.location.room} — ${item.location.furniture} — ${item.location.spot || '通用格'}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    let text = '=== 居家收納與物品位置索引清單 ===\n\n';
    Object.entries(groups).forEach(([loc, list]) => {
      text += `【${loc}】\n`;
      list.forEach((i) => {
        text += `  • ${i.name} (數量: ${i.quantity} ${i.unit}) [${i.category}]\n`;
      });
      text += '\n';
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="print-label-modal-dialog"
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 print:hidden">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Printer className="w-5 h-5 text-emerald-600" />
              收納盒與抽屜索引標籤列印
            </h3>
            <p className="text-xs text-slate-500">
              產生實體收納標籤，可直接列印剪下張貼於收納盒、防潮箱或抽屜外側
            </p>
          </div>
          <button
            id="close-print-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls (Hidden in print) */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-medium">篩選空間：</span>
              <select
                id="print-room-filter"
                value={selectedRoom}
                onChange={(e) => {
                  setSelectedRoom(e.target.value);
                  setSelectedFurniture('');
                }}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
              >
                <option value="">全部空間區域</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-slate-500">
              共產生 {Object.keys(groups).length} 張位置標籤卡
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-label-text-btn"
              onClick={handleCopyText}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '已複製純文字' : '複製文字清單'}
            </button>
            <button
              id="do-print-btn"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1 font-medium cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              列印標籤
            </button>
          </div>
        </div>

        {/* Printable Label Cards Canvas */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50 print:bg-white print:p-0">
          {Object.keys(groups).length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              此篩選條件下沒有已定位的物品
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
              {Object.entries(groups).map(([locHeader, groupItems], idx) => {
                const parts = locHeader.split(' — ');
                const roomPart = parts[0];
                const furnPart = parts[1];
                const spotPart = parts[2];

                return (
                  <div
                    key={idx}
                    className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-4 shadow-2xs print:border-black print:shadow-none print:break-inside-avoid text-xs"
                  >
                    {/* Label Header */}
                    <div className="border-b border-slate-200 pb-2 mb-2">
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 print:text-black">
                        居家收納位置標籤
                      </div>
                      <div className="font-bold text-sm text-slate-900 mt-0.5">
                        {furnPart}
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        📍 {roomPart} › {spotPart}
                      </div>
                    </div>

                    {/* Contained Items */}
                    <div className="space-y-1 my-2">
                      {groupItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-slate-800 text-[11px] py-0.5"
                        >
                          <span className="font-medium">• {item.name}</span>
                          <span className="text-slate-500 shrink-0 ml-2">
                            × {item.quantity} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Label Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 print:text-black">
                      <span>標記總計: {groupItems.length} 項物品</span>
                      <span>收納系統整理存檔</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
