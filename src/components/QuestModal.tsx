/**
 * Pixel Cafe Tycoon - Quests & Milestones Modal
 */

import React from 'react';
import { Award, CheckCircle2, Gift, X } from 'lucide-react';
import { GameEngine } from '../game/engine';

interface QuestModalProps {
  engine: GameEngine;
  onClose: () => void;
  onStateChange: () => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({ engine, onClose, onStateChange }) => {
  const handleClaim = (questId: string) => {
    if (engine.claimQuestReward(questId)) {
      onStateChange();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-stone-900 border-2 border-amber-800/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-stone-950/80 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h2 className="font-pixel text-sm font-bold text-amber-200">
              카페 퀘스트 & 업적
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-100 rounded hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quests List */}
        <div className="p-5 overflow-y-auto space-y-3">
          {engine.quests.map((quest) => {
            const pct = Math.min(100, Math.floor((quest.progress / quest.target) * 100));

            return (
              <div
                key={quest.id}
                className={`p-3.5 rounded-lg border transition-all ${
                  quest.claimed
                    ? 'bg-stone-950/30 border-stone-800 opacity-60'
                    : quest.completed
                    ? 'bg-amber-950/30 border-amber-600/80'
                    : 'bg-stone-950/60 border-stone-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-pixel text-xs font-bold text-stone-200">
                        {quest.title}
                      </h4>
                      {quest.claimed && (
                        <span className="text-[10px] font-pixel text-stone-500">완료됨</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">{quest.description}</p>

                    {/* Progress Bar */}
                    <div className="mt-2.5">
                      <div className="flex justify-between text-[10px] font-pixel text-stone-400 mb-1">
                        <span>진행도</span>
                        <span className="tabular-nums">
                          {quest.progress} / {quest.target} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            quest.completed ? 'bg-amber-400' : 'bg-sky-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reward & Claim button */}
                  <div className="shrink-0 flex flex-col items-end gap-1.5 pt-1">
                    <div className="text-right">
                      <div className="text-[11px] font-pixel text-amber-300">
                        +{quest.rewardGold} G
                      </div>
                      <div className="text-[10px] font-pixel text-yellow-400">
                        +⭐ {quest.rewardReputation}
                      </div>
                    </div>

                    {quest.completed && !quest.claimed && (
                      <button
                        onClick={() => handleClaim(quest.id)}
                        className="px-3 py-1 text-xs font-pixel font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded transition-colors shadow-md animate-pulse"
                      >
                        보상 받기
                      </button>
                    )}
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
