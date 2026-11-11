/**
 * Pixel Cafe Tycoon - HUD Component
 * Displays gold, reputation stars, time clock, active tray inventory, and navigation modals.
 */

import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Coins,
  Flame,
  Star,
  Users,
  Volume2,
  VolumeX,
  Wrench,
} from 'lucide-react';
import { CafeStats, ItemType, Player, Quest } from '../game/types';
import { ITEMS } from '../game/constants';
import { sound } from '../game/audio';

interface HUDProps {
  stats: CafeStats;
  player: Player;
  quests: Quest[];
  onOpenUpgrade: () => void;
  onOpenStaff: () => void;
  onOpenQuests: () => void;
  onOpenMenu: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  player,
  quests,
  onOpenUpgrade,
  onOpenStaff,
  onOpenQuests,
  onOpenMenu,
  isMuted,
  onToggleSound,
}) => {
  // Format game clock
  const hours = Math.floor(stats.timeOfDay);
  const minutes = Math.floor((stats.timeOfDay - hours) * 60);
  const timeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  // Unclaimed quest reward count
  const readyQuestCount = quests.filter((q) => q.completed && !q.claimed).length;

  return (
    <header className="relative w-full z-20 flex flex-col pointer-events-none">
      {/* Top Bar Strip */}
      <div className="w-full bg-stone-900/90 backdrop-blur-md border-b border-amber-950/60 px-4 py-2.5 flex items-center justify-between gap-4 pointer-events-auto">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xl">☕</span>
          <span className="font-pixel text-sm md:text-base font-bold tracking-tight text-amber-200">
            PIXEL CAFE
          </span>
          <span className="text-[10px] text-amber-500/80 font-pixel hidden sm:inline">
            Lv.{stats.cafeLevel}
          </span>
        </div>

        {/* Zone 2: Status Meters */}
        <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm font-medium">
          {/* Gold Balance */}
          <div className="flex items-center gap-1.5 bg-stone-950/70 px-3 py-1.5 rounded-md border border-amber-500/30">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-pixel text-amber-300 font-bold tabular-nums">
              {stats.gold.toLocaleString()} G
            </span>
          </div>

          {/* Reputation Stars */}
          <div className="flex items-center gap-1.5 bg-stone-950/70 px-3 py-1.5 rounded-md border border-amber-500/30">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-pixel text-yellow-200 tabular-nums">
              {stats.reputation.toFixed(1)} / 5.0
            </span>
          </div>

          {/* Time & Day Clock */}
          <div className="flex items-center gap-2 bg-stone-950/70 px-3 py-1.5 rounded-md border border-stone-700/60">
            <span className="font-pixel text-amber-100">Day {stats.day}</span>
            <span className="text-stone-400">·</span>
            <span className="font-pixel text-stone-200 tabular-nums">{timeFormatted}</span>
            {stats.isRushHour && (
              <span className="flex items-center gap-1 text-[11px] font-pixel text-rose-400 animate-pulse bg-rose-950/60 px-1.5 py-0.5 rounded">
                <Flame className="w-3 h-3 text-rose-400" />
                러시!
              </span>
            )}
          </div>
        </div>

        {/* Zone 3: Functional Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quest Modal Trigger */}
          <button
            onClick={onOpenQuests}
            className="relative px-3 py-1.5 text-xs font-medium text-amber-100 bg-stone-800 hover:bg-stone-700 rounded-md border border-stone-700 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            title="퀘스트"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">퀘스트</span>
            {readyQuestCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold animate-bounce">
                {readyQuestCount}
              </span>
            )}
          </button>

          {/* Staff Manager */}
          <button
            onClick={onOpenStaff}
            className="px-3 py-1.5 text-xs font-medium text-amber-100 bg-stone-800 hover:bg-stone-700 rounded-md border border-stone-700 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            title="직원 고용"
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">직원</span>
          </button>

          {/* Upgrade Shop */}
          <button
            onClick={onOpenUpgrade}
            className="px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-400 hover:bg-amber-300 rounded-md font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap"
            title="상점 & 확장"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-950" />
            <span>업그레이드</span>
          </button>

          {/* Recipe Book */}
          <button
            onClick={onOpenMenu}
            className="px-2.5 py-1.5 text-xs text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-md border border-stone-700 transition-colors"
            title="메뉴북"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={onToggleSound}
            className="px-2.5 py-1.5 text-xs text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-md border border-stone-700 transition-colors"
            title={isMuted ? '음소거 해제' : '음소거'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-stone-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>
        </div>
      </div>

      {/* 1,000,000 Gold Tycoon Ultimate Goal Strip */}
      <div className="w-full bg-stone-950/80 backdrop-blur-xs border-b border-stone-800 px-4 py-1.5 flex items-center justify-between gap-4 text-xs pointer-events-auto">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-sm">🏆</span>
          <span className="font-pixel text-[11px] font-bold text-amber-300 shrink-0">
            목표: 1,000,000 G
          </span>

          {/* Progress bar */}
          <div className="flex-1 max-w-xs h-2 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
              style={{
                width: `${Math.min(100, (stats.gold / stats.targetGold) * 100)}%`,
              }}
            />
          </div>

          <span className="font-pixel text-[10px] text-stone-300 tabular-nums shrink-0 hidden sm:inline">
            {stats.gold.toLocaleString()} / {stats.targetGold.toLocaleString()} G (
            {((stats.gold / stats.targetGold) * 100).toFixed(1)}%)
          </span>
        </div>

        {/* Croissant Status Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          {stats.croissantUnlocked ? (
            <span className="text-[11px] font-pixel text-emerald-400 flex items-center gap-1 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800">
              <span>🥐 크루아상 해금됨</span>
            </span>
          ) : (
            <span className="text-[11px] font-pixel text-stone-400 flex items-center gap-1 bg-stone-900 px-2 py-0.5 rounded border border-stone-800" title="매장 Lv.2 확장 시 크루아상 구매 및 조리가 해금됩니다.">
              <span>🔒 크루아상 (Lv.2 해금)</span>
            </span>
          )}
        </div>
      </div>

      {/* Floating Bottom Tray Inventory Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto z-20">
        <div className="flex items-center gap-2 p-1.5 bg-stone-900/90 backdrop-blur-md border border-amber-900/50 rounded-xl shadow-xl">
          <div className="px-2.5 py-1 text-[11px] font-pixel text-stone-400 border-r border-stone-800 flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-amber-400">내 쟁반</span>
            <span className="tabular-nums font-bold text-stone-200">
              {player.inventory.length} / {player.maxInventory}
            </span>
          </div>

          {/* Inventory Slots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: player.maxInventory }).map((_, idx) => {
              const itemType: ItemType | undefined = player.inventory[idx];
              const itemInfo = itemType ? ITEMS[itemType] : null;

              return (
                <div
                  key={idx}
                  className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center border transition-all ${
                    itemInfo
                      ? 'bg-amber-950/40 border-amber-600/70 shadow-sm'
                      : 'bg-stone-950/60 border-stone-800 border-dashed'
                  }`}
                  title={itemInfo ? `${itemInfo.name}: ${itemInfo.description}` : '빈 슬롯'}
                >
                  {itemInfo ? (
                    <>
                      <span className="text-lg leading-none">{itemInfo.icon}</span>
                      <span className="text-[9px] font-pixel text-amber-200 truncate max-w-[42px] mt-0.5">
                        {itemInfo.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] text-stone-600 font-pixel">빈칸</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
