/**
 * Pixel Cafe Tycoon - Recipe & Menu Book Modal
 */

import React from 'react';
import { BookOpen, Coffee, X } from 'lucide-react';
import { ITEMS } from '../game/constants';
import { ItemType } from '../game/types';

interface MenuBookModalProps {
  onClose: () => void;
  cafeLevel: number;
  croissantUnlocked: boolean;
}

export const MenuBookModal: React.FC<MenuBookModalProps> = ({ onClose, cafeLevel, croissantUnlocked }) => {
  const menuItems: ItemType[] = ['americano', 'latte', 'croissant', 'strawberry_cake'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-stone-900 border-2 border-amber-800/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-stone-950/80 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <h2 className="font-pixel text-sm font-bold text-amber-200">
              시그니처 메뉴북
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-100 rounded hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recipe Grid */}
        <div className="p-5 overflow-y-auto space-y-3">
          {menuItems.map((itemId) => {
            const item = ITEMS[itemId];
            const isUnlocked =
              itemId === 'americano'
                ? true
                : itemId === 'croissant'
                ? croissantUnlocked
                : itemId === 'latte'
                ? cafeLevel >= 2
                : itemId === 'strawberry_cake'
                ? cafeLevel >= 3
                : true;

            const unlockHint =
              itemId === 'croissant'
                ? '🔒 매장 Lv.2 베이커리 확장 시 해금'
                : itemId === 'latte'
                ? '🔒 매장 Lv.2 베이커리 확장 시 해금'
                : itemId === 'strawberry_cake'
                ? '🔒 매장 Lv.3 프리미엄 라운지 확장 시 해금'
                : '';

            return (
              <div
                key={itemId}
                className={`p-3.5 rounded-lg border transition-all ${
                  isUnlocked
                    ? 'bg-stone-950/60 border-amber-900/50'
                    : 'bg-stone-950/30 border-stone-800 opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-2xl shrink-0">
                    {item.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-pixel text-xs font-bold text-stone-200">
                        {item.name}
                      </h4>
                      {isUnlocked ? (
                        <span className="font-pixel text-xs font-bold text-amber-400">
                          {item.basePrice.toLocaleString()} G
                        </span>
                      ) : (
                        <span className="font-pixel text-[10px] text-amber-400/90 bg-stone-900 px-2 py-0.5 rounded border border-stone-700">
                          {unlockHint}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-400 mt-1">{item.description}</p>

                    <div className="flex items-center gap-3 text-[11px] text-stone-500 font-pixel mt-2">
                      <span>조리시간: ~{item.prepTime}초</span>
                      <span>·</span>
                      <span>분류: {item.category === 'drink' ? '커피 & 음료' : '디저트 & 베이커리'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
