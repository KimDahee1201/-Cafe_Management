/**
 * Pixel Cafe Tycoon - Main Canvas Component
 * Renders 3rd-person isometric/top-down pixel world with smooth camera follow & crisp pixel scaling.
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/engine';
import {
  drawCafeBackground,
  drawCustomer,
  drawPlayer,
  drawStaff,
  drawStation,
} from '../game/sprites';

interface GameCanvasProps {
  engine: GameEngine;
  onSelectStation?: (stationId: string) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine, onSelectStation }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Camera state
  const cameraRef = useRef({ x: 180, y: 200 });
  const [zoom, setZoom] = useState<number>(2.0);

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on arrow keys or space
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      engine.keys[e.code] = true;

      // Space or KeyE triggers manual interaction
      if (e.code === 'Space' || e.code === 'KeyE') {
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
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [engine]);

  // Main Render Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) {
        animId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Handle high-DPI crisp pixel canvas resizing
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Disable anti-aliasing for crisp 16-bit pixel art
      ctx.imageSmoothingEnabled = false;

      const viewportW = rect.width;
      const viewportH = rect.height;

      // Clear screen
      ctx.fillStyle = '#18120c';
      ctx.fillRect(0, 0, viewportW, viewportH);

      // Smooth Camera Follow Player (Lerp)
      const targetCamX = engine.player.x;
      const targetCamY = engine.player.y;
      cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.12;
      cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.12;

      // Apply Camera Transform
      ctx.save();
      ctx.translate(viewportW / 2, viewportH / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-Math.floor(cameraRef.current.x), -Math.floor(cameraRef.current.y));

      // 1. Draw Background (Floors, Walls, Windows, Lamps)
      drawCafeBackground(ctx, engine.roomWidth, engine.roomHeight, engine.stats.cafeLevel);

      // 2. Draw Interaction Zone Highlights
      for (const st of engine.stations) {
        const dist = Math.hypot(
          engine.player.x - st.interactionZone.x,
          engine.player.y - st.interactionZone.y
        );
        const isNearby = dist <= st.interactionZone.radius;

        if (isNearby) {
          // Soft golden interaction ring
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(st.interactionZone.x, st.interactionZone.y, st.interactionZone.radius * 0.8, 0, Math.PI * 2);
          ctx.stroke();

          // Action bubble tag
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(st.interactionZone.x - 22, st.interactionZone.y - 32, 44, 14);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1;
          ctx.strokeRect(st.interactionZone.x - 22, st.interactionZone.y - 32, 44, 14);
          ctx.fillStyle = '#fef08a';
          ctx.font = '8px NeoDunggeunmo, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('SPACE / 탭', st.interactionZone.x, st.interactionZone.y - 22);
        }
      }

      // 3. Y-Sorting for Depth Ordering (Objects further up y are drawn first)
      const renderList: Array<{
        type: 'station' | 'customer' | 'staff' | 'player';
        y: number;
        data: unknown;
      }> = [];

      for (const st of engine.stations) {
        renderList.push({ type: 'station', y: st.y + st.height, data: st });
      }
      for (const cust of engine.customers) {
        renderList.push({ type: 'customer', y: cust.y, data: cust });
      }
      for (const stf of engine.staff) {
        if (stf.hired) {
          renderList.push({ type: 'staff', y: stf.y, data: stf });
        }
      }
      renderList.push({ type: 'player', y: engine.player.y, data: engine.player });

      // Sort by Y coordinate
      renderList.sort((a, b) => a.y - b.y);

      // Draw sorted entities
      for (const item of renderList) {
        if (item.type === 'station') {
          drawStation(ctx, item.data as Parameters<typeof drawStation>[1]);
        } else if (item.type === 'customer') {
          drawCustomer(ctx, item.data as Parameters<typeof drawCustomer>[1]);
        } else if (item.type === 'staff') {
          drawStaff(ctx, item.data as Parameters<typeof drawStaff>[1]);
        } else if (item.type === 'player') {
          drawPlayer(ctx, item.data as Parameters<typeof drawPlayer>[1]);
        }
      }

      // 4. Draw Particles (Hearts, Steam, Sparkles, Coins)
      for (const p of engine.particles) {
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      }

      // 5. Draw Floating Texts (+150G, Tips, Speech)
      for (const ft of engine.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, ft.life));
        ctx.font = '10px NeoDunggeunmo, monospace';
        ctx.textAlign = 'center';
        // Dark outline for high readability
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore(); // Restore camera transform
      ctx.restore(); // Restore dpr scale

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [engine, zoom]);

  // Click or Tap to Move & Interact
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert screen coordinates to world coordinates
    const worldX = (clickX - rect.width / 2) / zoom + cameraRef.current.x;
    const worldY = (clickY - rect.height / 2) / zoom + cameraRef.current.y;

    // Set player navigation destination
    engine.targetMovePosition = { x: worldX, y: worldY };

    // Check if clicked directly on an interactive station
    for (const st of engine.stations) {
      if (
        worldX >= st.x &&
        worldX <= st.x + st.width &&
        worldY >= st.y - 10 &&
        worldY <= st.y + st.height + 10
      ) {
        if (onSelectStation) {
          onSelectStation(st.id);
        }
        break;
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-stone-950 cursor-crosshair select-none"
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full block pixel-art"
      />

      {/* Camera Zoom & View Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 p-1 bg-stone-900/85 backdrop-blur-sm border border-stone-700/60 rounded-lg shadow-lg z-10">
        <button
          onClick={() => setZoom((z) => Math.min(3.0, Number((z + 0.3).toFixed(1))))}
          className="w-7 h-7 flex items-center justify-center text-xs font-bold text-amber-100 hover:text-white bg-stone-800 hover:bg-stone-700 rounded transition-colors"
          title="화면 확대"
        >
          +
        </button>
        <span className="text-[10px] text-stone-400 font-pixel w-8 text-center">
          {zoom}x
        </span>
        <button
          onClick={() => setZoom((z) => Math.max(1.2, Number((z - 0.3).toFixed(1))))}
          className="w-7 h-7 flex items-center justify-center text-xs font-bold text-amber-100 hover:text-white bg-stone-800 hover:bg-stone-700 rounded transition-colors"
          title="화면 축소"
        >
          -
        </button>
      </div>

      {/* WASD / Touch hint */}
      <div className="absolute bottom-4 left-4 pointer-events-none hidden sm:flex items-center gap-2 text-[11px] text-stone-300/80 bg-stone-900/70 px-2.5 py-1 rounded border border-stone-800">
        <span className="font-pixel text-amber-300">WASD / 방향키</span> 이동
        <span>·</span>
        <span className="font-pixel text-amber-300">스페이스</span> 상호작용
        <span>·</span>
        <span>마우스 클릭 이동 가능</span>
      </div>
    </div>
  );
};
