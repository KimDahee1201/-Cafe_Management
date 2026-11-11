/**
 * Pixel Cafe Tycoon - Day Settlement Summary Report Modal
 */

import React from 'react';
import { ArrowRight, Award, Coins, Flame, Star, Users } from 'lucide-react';
import { CafeStats } from '../game/types';
import { sound } from '../game/audio';

interface DaySummaryModalProps {
  stats: CafeStats;
  onNextDay: () => void;
}

export const DaySummaryModal: React.FC<DaySummaryModalProps> = ({ stats, onNextDay }) => {
  const totalDayEarning = stats.dayRevenue + stats.dayTips;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-stone-900 border-2 border-amber-500 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-950 border-b border-amber-900/60 text-center">
          <span className="text-3xl">🌙</span>
          <h2 className="font-pixel text-base font-bold text-amber-200 mt-1">
            Day {stats.day - 1} 영업 결산 리포트
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">오늘 하루도 고생 많으셨습니다!</p>
        </div>

        {/* Content Breakdown */}
        <div className="p-6 space-y-4">
          <div className="bg-stone-950/70 p-4 rounded-lg border border-stone-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-pixel">
              <span className="text-stone-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" /> 맞이한 손님
              </span>
              <span className="text-stone-200 font-bold tabular-nums">
                {stats.dayCustomersServed} 명
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-pixel">
              <span className="text-stone-400 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" /> 메뉴 판매 수입
              </span>
              <span className="text-stone-200 tabular-nums">
                +{stats.dayRevenue.toLocaleString()} G
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-pixel">
              <span className="text-stone-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" /> 팁 수입
              </span>
              <span className="text-amber-300 font-bold tabular-nums">
                +{stats.dayTips.toLocaleString()} G
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-pixel">
              <span className="text-stone-400 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-yellow-400" /> 카페 평점
              </span>
              <span className="text-yellow-300 font-bold tabular-nums">
                ⭐ {stats.reputation.toFixed(1)} / 5.0
              </span>
            </div>

            <div className="pt-3 border-t border-stone-800 flex items-center justify-between font-pixel">
              <span className="text-xs text-amber-200 font-bold">오늘 순수익</span>
              <span className="text-sm text-amber-400 font-bold tabular-nums">
                +{totalDayEarning.toLocaleString()} G
              </span>
            </div>
          </div>

          <div className="bg-amber-950/20 border border-amber-900/40 p-3 rounded-lg text-center">
            <p className="text-xs text-amber-300/90">
              💡 내일은 더 많은 손님이 방문할 예정입니다. 커피 원두와 반죽을 넉넉히 준비하세요!
            </p>
          </div>

          <button
            onClick={() => {
              sound.playRegister();
              onNextDay();
            }}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-pixel font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <span>Day {stats.day} 영업 시작하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
