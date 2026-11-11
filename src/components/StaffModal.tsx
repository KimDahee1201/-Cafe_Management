/**
 * Pixel Cafe Tycoon - Staff Management Modal
 */

import React from 'react';
import { ArrowUpRight, Check, Sparkles, UserPlus, X } from 'lucide-react';
import { GameEngine } from '../game/engine';
import { Staff } from '../game/types';
import { sound } from '../game/audio';

interface StaffModalProps {
  engine: GameEngine;
  onClose: () => void;
  onStateChange: () => void;
}

export const StaffModal: React.FC<StaffModalProps> = ({ engine, onClose, onStateChange }) => {
  const handleHire = (staff: Staff) => {
    if (engine.stats.gold < staff.cost) {
      sound.playFootstep();
      return;
    }
    engine.stats.gold -= staff.cost;
    staff.hired = true;
    sound.playFanfare();
    engine.addFloatingText(`${staff.name} 고용 완료!`, engine.player.x, engine.player.y - 20, '#38bdf8');
    engine.trackQuestProgress('hire_staff', 1);
    onStateChange();
  };

  const handleUpgradeStaff = (staff: Staff) => {
    const cost = staff.level * 600;
    if (engine.stats.gold < cost) {
      sound.playFootstep();
      return;
    }
    engine.stats.gold -= cost;
    staff.level += 1;
    staff.speed = Math.floor(staff.speed * 1.2);
    sound.playRegister();
    engine.addFloatingText(`${staff.name} 레벨 업! (+이동속도)`, engine.player.x, engine.player.y - 20, '#fbbf24');
    onStateChange();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-stone-900 border-2 border-amber-800/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-stone-950/80 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">👥</span>
            <h2 className="font-pixel text-sm font-bold text-amber-200">
              직원 고용 & 자동화 관리
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-100 rounded hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Staff List */}
        <div className="p-5 overflow-y-auto space-y-4">
          <p className="text-xs text-stone-400">
            직원을 고용하면 커피 추출, 빵 굽기, 서빙 및 테이블 정리가 자동으로 처리됩니다!
          </p>

          <div className="space-y-3">
            {engine.staff.map((staff) => {
              const upgradeCost = staff.level * 600;
              const canAffordHire = engine.stats.gold >= staff.cost;
              const canAffordUpgrade = engine.stats.gold >= upgradeCost;

              return (
                <div
                  key={staff.id}
                  className={`p-4 rounded-lg border transition-all ${
                    staff.hired
                      ? 'bg-stone-950/70 border-emerald-800/60'
                      : 'bg-stone-950/40 border-stone-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center text-xl shrink-0 border"
                        style={{
                          backgroundColor: `${staff.avatarColor}20`,
                          borderColor: `${staff.avatarColor}60`,
                        }}
                      >
                        {staff.role === 'barista' && '☕'}
                        {staff.role === 'baker' && '🥐'}
                        {staff.role === 'waiter' && '🤵'}
                        {staff.role === 'cleaner_cat' && '🐾'}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-pixel text-xs font-bold text-stone-200">
                            {staff.name}
                          </h4>
                          {staff.hired && (
                            <span className="text-[10px] font-pixel text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                              근무 중 (Lv.{staff.level})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-400 mt-1">{staff.description}</p>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {staff.hired ? (
                        <button
                          onClick={() => handleUpgradeStaff(staff)}
                          disabled={!canAffordUpgrade}
                          className={`px-3 py-1.5 text-xs font-pixel rounded transition-colors ${
                            canAffordUpgrade
                              ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold'
                              : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          강화 ({upgradeCost.toLocaleString()}G)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleHire(staff)}
                          disabled={!canAffordHire}
                          className={`px-3.5 py-1.5 text-xs font-pixel rounded transition-colors flex items-center gap-1 ${
                            canAffordHire
                              ? 'bg-sky-500 hover:bg-sky-400 text-stone-950 font-bold'
                              : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>고용 ({staff.cost.toLocaleString()}G)</span>
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
    </div>
  );
};
