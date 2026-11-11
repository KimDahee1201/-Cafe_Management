/**
 * Pixel Cafe Tycoon - Mobile Virtual Joystick & Touch Controls
 */

import React, { useRef, useState } from 'react';
import { GameEngine } from '../game/engine';

interface VirtualJoystickProps {
  engine: GameEngine;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ engine }) => {
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const touchIdRef = useRef<number | null>(null);
  const baseCenterRef = useRef<{ x: number; y: number } | null>(null);

  const radius = 40;

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    baseCenterRef.current = { x: centerX, y: centerY };

    handleTouchMove(e);
    setIsActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchIdRef.current === null || !baseCenterRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        const dx = touch.clientX - baseCenterRef.current.x;
        const dy = touch.clientY - baseCenterRef.current.y;
        const dist = Math.hypot(dx, dy);

        let clampedX = dx;
        let clampedY = dy;
        if (dist > radius) {
          clampedX = (dx / dist) * radius;
          clampedY = (dy / dist) * radius;
        }

        setKnobPos({ x: clampedX, y: clampedY });
        engine.joystickVector = {
          x: clampedX / radius,
          y: clampedY / radius,
        };
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        baseCenterRef.current = null;
        setKnobPos({ x: 0, y: 0 });
        setIsActive(false);
        engine.joystickVector = { x: 0, y: 0 };
        break;
      }
    }
  };

  const handleActionClick = () => {
    for (const st of engine.stations) {
      const dist = Math.hypot(
        engine.player.x - st.interactionZone.x,
        engine.player.y - st.interactionZone.y
      );
      if (dist <= st.interactionZone.radius + 15) {
        engine.interactWithStation(st, 'player');
        break;
      }
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none flex justify-between items-end p-6 md:hidden">
      {/* Joystick Base */}
      <div
        className="w-24 h-24 rounded-full bg-stone-900/60 backdrop-blur-xs border-2 border-amber-500/30 flex items-center justify-center pointer-events-auto touch-none relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div
          className={`w-10 h-10 rounded-full bg-amber-500/80 border-2 border-amber-300 shadow-md transition-transform ${
            isActive ? 'scale-110' : ''
          }`}
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        />
      </div>

      {/* Action Button */}
      <button
        onClick={handleActionClick}
        className="w-16 h-16 rounded-full bg-amber-500/90 hover:bg-amber-400 active:scale-95 border-2 border-amber-300 shadow-xl pointer-events-auto flex flex-col items-center justify-center font-pixel text-stone-950 font-bold text-xs"
      >
        <span>작업</span>
        <span className="text-[9px] text-stone-800">SPACE</span>
      </button>
    </div>
  );
};
