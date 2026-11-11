/**
 * Pixel Cafe Tycoon - 3rd Person Pixel Art Tycoon
 * Main Application Component
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Coffee,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
  Wrench,
} from 'lucide-react';
import { GameEngine } from './game/engine';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { UpgradeModal } from './components/UpgradeModal';
import { StaffModal } from './components/StaffModal';
import { QuestModal } from './components/QuestModal';
import { MenuBookModal } from './components/MenuBookModal';
import { DaySummaryModal } from './components/DaySummaryModal';
import { VictoryModal } from './components/VictoryModal';
import { VirtualJoystick } from './components/VirtualJoystick';
import { sound } from './game/audio';

type GameState = 'TITLE_MENU' | 'PLAYING';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const engineRef = useRef<GameEngine | null>(null);

  // Tick state triggers re-renders for UI updates
  const [, setTick] = useState(0);

  // Modal states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showDaySummary, setShowDaySummary] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize Game Engine
  if (!engineRef.current) {
    engineRef.current = new GameEngine();
  }

  const engine = engineRef.current;

  useEffect(() => {
    // Engine update callback
    engine.onStateUpdate = () => {
      setTick((t) => (t + 1) % 1000);
    };

    // Day End callback
    engine.onDayEnd = () => {
      setShowDaySummary(true);
    };

    // 1 Million Gold Goal callback
    engine.onGoalReached = () => {
      setShowVictoryModal(true);
    };

    engine.start();

    return () => {
      engine.stop();
    };
  }, [engine]);

  // Handle Game Start
  const handleStartGame = () => {
    sound.playRegister();
    sound.startBGM();
    setGameState('PLAYING');
  };

  // Toggle Sound
  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Next Day Start
  const handleNextDay = () => {
    setShowDaySummary(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-stone-950 flex flex-col font-sans select-none text-stone-100">
      {gameState === 'TITLE_MENU' ? (
        // Title Menu Screen
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-radial from-amber-950/40 via-stone-950 to-black">
          {/* Decorative Pixel Grid Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Title Box */}
          <div className="relative z-10 flex flex-col items-center max-w-lg text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/10 animate-bounce">
              ☕
            </div>

            <div className="space-y-2">
              <h1 className="font-pixel text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-300 drop-shadow-md">
                PIXEL CAFE TYCOON
              </h1>
              <p className="text-sm text-stone-300 font-pixel">
                3인칭 감성 도트 카페 & 베이커리 타이쿤
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs font-pixel text-amber-300">
                <span>🏆 최종 목표: 1,000,000 골드 달성!</span>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-2.5 w-full text-left text-xs bg-stone-900/80 p-4 rounded-xl border border-stone-800">
              <div className="flex items-center gap-2 text-stone-300">
                <span className="text-amber-400">☕</span>
                <span>직접 내리는 신선한 커피</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <span className="text-amber-400">🥐</span>
                <span>매장 확장 시 크루아상 해금</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <span className="text-amber-400">👥</span>
                <span>바리스타 & 냥이 알바 고용</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <span className="text-amber-400">🏬</span>
                <span>3단계 프리미엄 매장 확장</span>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartGame}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-pixel font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer pixel-btn"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>카페 오픈하기 (START)</span>
            </button>

            {/* Controls Guide */}
            <div className="text-[11px] text-stone-400 space-y-1">
              <p>조작: WASD / 방향키 / 마우스 클릭 또는 화면 터치로 이동</p>
              <p>스페이스 바 / 가까이 다가가서 상호작용</p>
            </div>
          </div>
        </div>
      ) : (
        // Active Game Screen
        <>
          {/* Top HUD */}
          <HUD
            stats={engine.stats}
            player={engine.player}
            quests={engine.quests}
            onOpenUpgrade={() => setShowUpgradeModal(true)}
            onOpenStaff={() => setShowStaffModal(true)}
            onOpenQuests={() => setShowQuestModal(true)}
            onOpenMenu={() => setShowMenuModal(true)}
            isMuted={isMuted}
            onToggleSound={handleToggleSound}
          />

          {/* Quick Guide Toggle button */}
          <div className="absolute top-16 right-4 z-20 flex items-center gap-2">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="p-1.5 bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white rounded-md border border-stone-700/60 shadow transition-colors"
              title="게임 가이드"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Tutorial Guide Drawer */}
          {showGuide && (
            <div className="absolute top-24 right-4 z-20 w-80 p-4 bg-stone-900/95 backdrop-blur-md border border-amber-800/80 rounded-xl shadow-2xl text-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <span className="font-pixel text-amber-300 font-bold">📖 영업 가이드</span>
                <button
                  onClick={() => setShowGuide(false)}
                  className="text-stone-400 hover:text-stone-100"
                >
                  ✕
                </button>
              </div>
              <ul className="space-y-1.5 text-stone-300 leading-relaxed">
                <li>
                  1. <strong className="text-amber-200">원두 창고</strong>(왼쪽 위)로 이동해 원두를 챙깁니다.
                </li>
                <li>
                  2. <strong className="text-amber-200">에스프레소 머신</strong>에 다가가 커피를 추출합니다.
                </li>
                <li>
                  3. 완성된 커피를 들고 <strong className="text-amber-200">주문 카운터</strong>나 테이블 손님에게 건네 골드를 법니다!
                </li>
                <li>
                  4. 손님이 떠난 후 <strong className="text-amber-200">빈 그릇</strong>을 개수대에 넣어 위생 평점을 올리세요.
                </li>
                <li>
                  5. 번 골드로 <strong className="text-amber-200">직원(알바생)</strong>을 고용하면 작업이 자동화됩니다!
                </li>
              </ul>
            </div>
          )}

          {/* Interactive 3rd Person Canvas */}
          <main className="relative flex-1 w-full h-full overflow-hidden">
            <GameCanvas
              engine={engine}
              onSelectStation={(stId) => {
                if (stId === 'station_register') {
                  // Register clicked
                }
              }}
            />

            {/* Mobile Virtual Controls */}
            <VirtualJoystick engine={engine} />
          </main>

          {/* Modals */}
          {showUpgradeModal && (
            <UpgradeModal
              engine={engine}
              onClose={() => setShowUpgradeModal(false)}
              onStateChange={() => setTick((t) => t + 1)}
            />
          )}

          {showStaffModal && (
            <StaffModal
              engine={engine}
              onClose={() => setShowStaffModal(false)}
              onStateChange={() => setTick((t) => t + 1)}
            />
          )}

          {showQuestModal && (
            <QuestModal
              engine={engine}
              onClose={() => setShowQuestModal(false)}
              onStateChange={() => setTick((t) => t + 1)}
            />
          )}

          {showMenuModal && (
            <MenuBookModal
              cafeLevel={engine.stats.cafeLevel}
              croissantUnlocked={engine.stats.croissantUnlocked}
              onClose={() => setShowMenuModal(false)}
            />
          )}

          {showDaySummary && (
            <DaySummaryModal
              stats={engine.stats}
              onNextDay={handleNextDay}
            />
          )}

          {showVictoryModal && (
            <VictoryModal
              stats={engine.stats}
              onClose={() => setShowVictoryModal(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
