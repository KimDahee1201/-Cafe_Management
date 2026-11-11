/**
 * Pixel Cafe Tycoon - 1,000,000 Gold Victory Ending Celebration Modal
 */

import React from 'react';
import { Award, Check, Sparkles, Trophy, X } from 'lucide-react';
import { CafeStats } from '../game/types';
import { sound } from '../game/audio';

interface VictoryModalProps {
  stats: CafeStats;
  onClose: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ stats, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-stone-900 border-4 border-amber-400 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-90 duration-300">
        {/* Glow header banner */}
        <div className="px-6 py-6 bg-gradient-to-b from-amber-950 via-stone-950 to-stone-900 text-center border-b border-amber-500/50 relative">
          <div className="text-5xl animate-bounce mb-2">👑</div>
          <span className="font-pixel text-xs text-amber-400 uppercase tracking-widest">
            TYCOON VICTORY
          </span>
          <h2 className="font-pixel text-lg sm:text-xl font-black text-amber-200 mt-1">
            100만 골드 달성!
          </h2>
          <p className="text-xs text-stone-300 font-pixel mt-1">
            축하합니다! 전설의 카페 타이쿤 재벌로 등극하셨습니다!
          </p>
        </div>

        {/* Victory Stats */}
        <div className="p-6 space-y-4">
          <div className="bg-stone-950/80 p-4 rounded-xl border border-amber-900/50 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-pixel">
              <span className="text-stone-400">보유 골드</span>
              <span className="text-amber-400 font-bold text-sm tabular-nums">
                {stats.gold.toLocaleString()} G
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-pixel">
              <span className="text-stone-400">총 맞이한 손님</span>
              <span className="text-stone-200 font-bold tabular-nums">
                {stats.totalCustomersServed.toLocaleString()} 명
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-pixel">
              <span className="text-stone-400">도달 영업 일수</span>
              <span className="text-stone-200 font-bold tabular-nums">
                Day {stats.day}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-pixel">
              <span className="text-stone-400">최종 카페 평점</span>
              <span className="text-yellow-400 font-bold tabular-nums">
                ⭐ {stats.reputation.toFixed(1)} / 5.0
              </span>
            </div>
            <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs font-pixel">
              <span className="text-amber-300">획득 칭호</span>
              <span className="text-amber-400 font-bold">✨ 황금 원두의 제왕</span>
            </div>
          </div>

          <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-lg text-center text-xs text-amber-300/90 font-pixel">
            골목의 작은 커피 가판대에서 시작해 100만 골드 규모의 세계적인 카페 왕국을 건설했습니다!
          </div>

          <button
            onClick={() => {
              sound.playRegister();
              onClose();
            }}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-pixel font-bold text-xs rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            <span>자유 영업 계속하기 (무한 샌드박스)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
