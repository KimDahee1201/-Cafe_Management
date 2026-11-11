/**
 * Pixel Cafe Tycoon - Upgrade & Expansion Shop Modal
 */

import React from 'react';
import { Check, ChevronRight, Sparkles, X, Zap } from 'lucide-react';
import { GameEngine } from '../game/engine';
import { CAFE_EXPANSIONS } from '../game/constants';
import { sound } from '../game/audio';

interface UpgradeModalProps {
  engine: GameEngine;
  onClose: () => void;
  onStateChange: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ engine, onClose, onStateChange }) => {
  const currentLevel = engine.stats.cafeLevel;
  const nextExpansion = CAFE_EXPANSIONS.find((e) => e.level === currentLevel + 1);

  // Upgrade lists
  const upgradesList = [
    {
      id: 'tray',
      name: '대용량 서빙 트레이',
      desc: '플레이어가 한 번에 들고 이동할 수 있는 최대 아이템 수 (+1 슬롯)',
      currentVal: `${engine.player.maxInventory}개 슬롯`,
      level: engine.upgrades.trayCapacityLevel,
      maxLevel: 4,
      cost: engine.upgrades.trayCapacityLevel * 450,
      icon: '盆',
      onBuy: () => {
        engine.upgrades.trayCapacityLevel += 1;
        engine.player.maxInventory += 1;
      },
    },
    {
      id: 'shoes',
      name: '폭신폭신 작업화',
      desc: '플레이어 이동 속도 +20% 증가',
      currentVal: `+${(engine.upgrades.playerSpeedLevel - 1) * 20}% 속도`,
      level: engine.upgrades.playerSpeedLevel,
      maxLevel: 5,
      cost: engine.upgrades.playerSpeedLevel * 350,
      icon: '👟',
      onBuy: () => {
        engine.upgrades.playerSpeedLevel += 1;
      },
    },
    {
      id: 'coffee_speed',
      name: '하이엔드 포타필터',
      desc: '에스프레소 머신 커피 추출 속도 +30% 가속',
      currentVal: `Lv.${engine.upgrades.machineSpeedLevel}`,
      level: engine.upgrades.machineSpeedLevel,
      maxLevel: 4,
      cost: engine.upgrades.machineSpeedLevel * 500,
      icon: '⚙️',
      onBuy: () => {
        engine.upgrades.machineSpeedLevel += 1;
        for (const s of engine.stations) {
          if (s.type === 'coffee_machine') s.level = engine.upgrades.machineSpeedLevel;
        }
      },
    },
    {
      id: 'oven_speed',
      name: '고화력 컨벡션 오븐',
      desc: '베이커리 오븐 굽기 속도 +35% 가속',
      currentVal: `Lv.${engine.upgrades.ovenSpeedLevel}`,
      level: engine.upgrades.ovenSpeedLevel,
      maxLevel: 4,
      cost: engine.upgrades.ovenSpeedLevel * 600,
      icon: '🔥',
      onBuy: () => {
        engine.upgrades.ovenSpeedLevel += 1;
        for (const s of engine.stations) {
          if (s.type === 'oven') s.level = engine.upgrades.ovenSpeedLevel;
        }
      },
    },
    {
      id: 'beans',
      name: '스페셜티 아라비카 원두',
      desc: '모든 커피 메뉴의 판매 가격 +25% 증가',
      currentVal: `판매가 +${(engine.upgrades.beanQualityLevel - 1) * 25}%`,
      level: engine.upgrades.beanQualityLevel,
      maxLevel: 4,
      cost: engine.upgrades.beanQualityLevel * 750,
      icon: '🫘',
      onBuy: () => {
        engine.upgrades.beanQualityLevel += 1;
      },
    },
    {
      id: 'butter',
      name: '프랑스 고메 발효버터',
      desc: '크루아상 및 케이크 판매 가격 +30% 증가',
      currentVal: `판매가 +${(engine.upgrades.butterQualityLevel - 1) * 30}%`,
      level: engine.upgrades.butterQualityLevel,
      maxLevel: 4,
      cost: engine.upgrades.butterQualityLevel * 850,
      icon: '🧈',
      onBuy: () => {
        engine.upgrades.butterQualityLevel += 1;
      },
    },
  ];

  const handleBuyUpgrade = (item: (typeof upgradesList)[0]) => {
    if (engine.stats.gold < item.cost) {
      sound.playFootstep();
      return;
    }
    engine.stats.gold -= item.cost;
    item.onBuy();
    sound.playRegister();
    engine.addFloatingText(`${item.name} 강화 완료!`, engine.player.x, engine.player.y - 20, '#fbbf24');
    onStateChange();
  };

  const handleBuyExpansion = () => {
    if (!nextExpansion) return;
    if (engine.stats.gold < nextExpansion.cost || engine.stats.reputation < nextExpansion.requiredRep) {
      return;
    }
    engine.stats.gold -= nextExpansion.cost;
    engine.initStations(nextExpansion.level);
    sound.playFanfare();
    engine.addFloatingText(`매장 확장 완료: ${nextExpansion.name}!`, engine.player.x, engine.player.y - 30, '#ec4899');
    if (nextExpansion.level === 2) {
      engine.addFloatingText('🥐 크루아상 레시피 해금!', engine.player.x, engine.player.y - 45, '#fbbf24');
    }
    engine.trackQuestProgress('expand_cafe', nextExpansion.level);
    onStateChange();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-stone-900 border-2 border-amber-800/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-stone-950/80 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛠️</span>
            <h2 className="font-pixel text-sm font-bold text-amber-200">
              시설 업그레이드 & 매장 확장
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-100 rounded hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Cafe Expansion Banner */}
          {nextExpansion ? (
            <div className="p-4 bg-gradient-to-r from-amber-950/40 to-stone-900 border border-amber-700/50 rounded-lg">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-pixel text-xs text-amber-400">NEXT STAGE</span>
                  </div>
                  <h3 className="font-pixel text-sm font-bold text-stone-100 mt-1">
                    {nextExpansion.name}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">{nextExpansion.description}</p>
                  <div className="flex items-center gap-2 text-xs text-stone-300 mt-2">
                    {nextExpansion.features.map((feat, i) => (
                      <span key={i} className="text-[11px] text-amber-300">
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-xs text-stone-400 font-pixel">
                    필요 평점: ⭐ {nextExpansion.requiredRep.toFixed(1)}
                  </span>
                  <button
                    onClick={handleBuyExpansion}
                    disabled={
                      engine.stats.gold < nextExpansion.cost ||
                      engine.stats.reputation < nextExpansion.requiredRep
                    }
                    className={`px-4 py-2 text-xs font-pixel rounded-md transition-all ${
                      engine.stats.gold >= nextExpansion.cost &&
                      engine.stats.reputation >= nextExpansion.requiredRep
                        ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-md'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                    }`}
                  >
                    확장하기 ({nextExpansion.cost.toLocaleString()}G)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-center">
              <span className="font-pixel text-xs text-amber-300">
                👑 최고 레벨 매장(Lv.3 프리미엄 로스터리)에 도달했습니다!
              </span>
            </div>
          )}

          {/* Upgrades Grid */}
          <div className="space-y-3">
            <h4 className="font-pixel text-xs text-stone-400 uppercase tracking-wider">
              장비 및 재료 강화
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {upgradesList.map((item) => {
                const isMax = item.level >= item.maxLevel;
                const canAfford = engine.stats.gold >= item.cost;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 bg-stone-950/60 border border-stone-800 rounded-lg flex flex-col justify-between gap-3 hover:border-amber-900/60 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-md bg-stone-800 border border-stone-700 flex items-center justify-center text-xl shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="font-pixel text-xs font-semibold text-stone-200 truncate">
                            {item.name}
                          </h5>
                          <span className="text-[10px] font-pixel text-amber-400 shrink-0">
                            Lv.{item.level}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-2">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-900">
                      <span className="text-[10px] text-stone-500 font-pixel">
                        현재: {item.currentVal}
                      </span>
                      {isMax ? (
                        <span className="px-2.5 py-1 text-[10px] font-pixel text-emerald-400 bg-emerald-950/60 rounded border border-emerald-800">
                          MAX
                        </span>
                      ) : (
                        <button
                          onClick={() => handleBuyUpgrade(item)}
                          disabled={!canAfford}
                          className={`px-3 py-1.5 text-xs font-pixel rounded transition-colors ${
                            canAfford
                              ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold'
                              : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          {item.cost.toLocaleString()} G
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
