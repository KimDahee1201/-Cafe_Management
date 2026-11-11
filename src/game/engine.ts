/**
 * Pixel Cafe Tycoon - Core Game Simulation Engine
 * Handles player movement, station interactions, customer AI, staff automation, particles & economy.
 */

import { sound } from './audio';
import { CAFE_EXPANSIONS, INITIAL_QUESTS, INITIAL_STAFF, ITEMS, TARGET_GOLD, TILE_SIZE } from './constants';
import {
  CafeStats,
  Customer,
  CustomerType,
  Direction,
  FloatingText,
  ItemType,
  Particle,
  Player,
  Quest,
  Staff,
  Station,
} from './types';

export class GameEngine {
  public player: Player;
  public stations: Station[] = [];
  public customers: Customer[] = [];
  public staff: Staff[] = [];
  public floatingTexts: FloatingText[] = [];
  public particles: Particle[] = [];
  public quests: Quest[] = [];
  public stats: CafeStats;

  public roomWidth = 14 * TILE_SIZE;
  public roomHeight = 12 * TILE_SIZE;

  // Input states
  public keys: Record<string, boolean> = {};
  public joystickVector = { x: 0, y: 0 };
  public targetMovePosition: { x: number; y: number } | null = null;

  // Timers
  private customerSpawnTimer = 0;
  private lastTime = 0;
  private animFrameId: number | null = null;
  public onStateUpdate?: () => void;
  public onDayEnd?: (stats: CafeStats) => void;
  public onGoalReached?: () => void;

  // Upgrades
  public upgrades = {
    playerSpeedLevel: 1,
    trayCapacityLevel: 1,
    machineSpeedLevel: 1,
    ovenSpeedLevel: 1,
    beanQualityLevel: 1,
    butterQualityLevel: 1,
  };

  constructor() {
    this.player = {
      x: 180,
      y: 200,
      speed: 120,
      direction: 'down',
      isMoving: false,
      frame: 0,
      inventory: [],
      maxInventory: 1,
      walkTimer: 0,
    };

    this.stats = {
      gold: 400,
      reputation: 3.0,
      totalCustomersServed: 0,
      totalRevenue: 0,
      cafeLevel: 1,
      day: 1,
      timeOfDay: 8.0, // starts at 08:00 AM
      isRushHour: false,
      isPaused: false,
      dayRevenue: 0,
      dayTips: 0,
      dayCustomersServed: 0,
      targetGold: TARGET_GOLD,
      goalReached: false,
      croissantUnlocked: false,
    };

    this.quests = JSON.parse(JSON.stringify(INITIAL_QUESTS));
    this.staff = JSON.parse(JSON.stringify(INITIAL_STAFF));

    this.initStations(1);
  }

  /**
   * Setup stations based on cafe expansion level
   */
  public initStations(level: number) {
    this.stats.cafeLevel = level;
    this.stats.croissantUnlocked = level >= 2;
    const expansion = CAFE_EXPANSIONS.find((e) => e.level === level) || CAFE_EXPANSIONS[0];
    this.roomWidth = expansion.width * TILE_SIZE;
    this.roomHeight = expansion.height * TILE_SIZE;

    const newStations: Station[] = [
      // Main Order Register
      {
        id: 'station_register',
        type: 'register',
        name: '주문 카운터 & 계산대',
        x: 48,
        y: 110,
        width: 64,
        height: 28,
        interactionZone: { x: 80, y: 150, radius: 40 },
        state: 'idle',
        progress: 0,
        level: 1,
      },
      // Espresso Machine
      {
        id: 'station_coffee_1',
        type: 'coffee_machine',
        name: '에스프레소 머신 #1',
        x: 130,
        y: 60,
        width: 48,
        height: 32,
        interactionZone: { x: 154, y: 104, radius: 36 },
        state: 'idle',
        progress: 0,
        level: this.upgrades.machineSpeedLevel,
      },
      // Coffee Bean Storage
      {
        id: 'station_beans',
        type: 'bean_storage',
        name: '아라비카 원두 창고',
        x: 48,
        y: 60,
        width: 36,
        height: 32,
        interactionZone: { x: 66, y: 102, radius: 36 },
        state: 'idle',
        progress: 0,
        level: 1,
        stock: 99,
      },
      // Dish Sink
      {
        id: 'station_sink',
        type: 'dish_sink',
        name: '세척 개수대',
        x: 200,
        y: 60,
        width: 44,
        height: 32,
        interactionZone: { x: 222, y: 104, radius: 36 },
        state: 'idle',
        progress: 0,
        level: 1,
      },
      // Trash Bin
      {
        id: 'station_trash',
        type: 'trash_bin',
        name: '퇴식구 / 쓰레기통',
        x: 260,
        y: 60,
        width: 28,
        height: 32,
        interactionZone: { x: 274, y: 104, radius: 32 },
        state: 'idle',
        progress: 0,
        level: 1,
      },
      // Seating Table 1
      {
        id: 'station_table_1',
        type: 'serving_table',
        name: '테이블 #1',
        x: 120,
        y: 190,
        width: 40,
        height: 36,
        interactionZone: { x: 140, y: 210, radius: 36 },
        state: 'idle',
        progress: 0,
        level: 1,
        tableId: 1,
      },
      // Seating Table 2
      {
        id: 'station_table_2',
        type: 'serving_table',
        name: '테이블 #2',
        x: 240,
        y: 190,
        width: 40,
        height: 36,
        interactionZone: { x: 260, y: 210, radius: 36 },
        state: 'idle',
        progress: 0,
        level: 1,
        tableId: 2,
      },
    ];

    // Level 2+ additions (Bakery Oven, Dough storage, Table 3 & 4)
    if (level >= 2) {
      newStations.push(
        {
          id: 'station_oven_1',
          type: 'oven',
          name: '베이커리 컨벡션 오븐',
          x: 320,
          y: 60,
          width: 52,
          height: 34,
          interactionZone: { x: 346, y: 104, radius: 36 },
          state: 'idle',
          progress: 0,
          level: this.upgrades.ovenSpeedLevel,
        },
        {
          id: 'station_dough',
          type: 'dough_storage',
          name: '생지 & 버터 저장고',
          x: 390,
          y: 60,
          width: 36,
          height: 32,
          interactionZone: { x: 408, y: 102, radius: 36 },
          state: 'idle',
          progress: 0,
          level: 1,
          stock: 99,
        },
        {
          id: 'station_table_3',
          type: 'serving_table',
          name: '테이블 #3',
          x: 120,
          y: 280,
          width: 40,
          height: 36,
          interactionZone: { x: 140, y: 300, radius: 36 },
          state: 'idle',
          progress: 0,
          level: 1,
          tableId: 3,
        },
        {
          id: 'station_table_4',
          type: 'serving_table',
          name: '테이블 #4',
          x: 240,
          y: 280,
          width: 40,
          height: 36,
          interactionZone: { x: 260, y: 300, radius: 36 },
          state: 'idle',
          progress: 0,
          level: 1,
          tableId: 4,
        }
      );
    }

    // Level 3+ additions (Dual Coffee machine, Table 5 & 6)
    if (level >= 3) {
      newStations.push(
        {
          id: 'station_coffee_2',
          type: 'coffee_machine',
          name: '프리미엄 에스프레소 머신 #2',
          x: 440,
          y: 60,
          width: 48,
          height: 32,
          interactionZone: { x: 464, y: 104, radius: 36 },
          state: 'idle',
          progress: 0,
          level: this.upgrades.machineSpeedLevel + 1,
        },
        {
          id: 'station_table_5',
          type: 'serving_table',
          name: 'VIP 라운지 소파',
          x: 360,
          y: 190,
          width: 50,
          height: 40,
          interactionZone: { x: 385, y: 215, radius: 40 },
          state: 'idle',
          progress: 0,
          level: 2,
          tableId: 5,
        },
        {
          id: 'station_table_6',
          type: 'serving_table',
          name: '테라스 창가석',
          x: 360,
          y: 280,
          width: 46,
          height: 38,
          interactionZone: { x: 383, y: 300, radius: 38 },
          state: 'idle',
          progress: 0,
          level: 2,
          tableId: 6,
        }
      );
    }

    this.stations = newStations;
  }

  /**
   * Start animation frame loop
   */
  public start() {
    this.lastTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;

      if (!this.stats.isPaused) {
        this.update(dt);
      }

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /**
   * Game Tick Update
   */
  public update(dt: number) {
    this.updateClock(dt);
    this.updatePlayerMovement(dt);
    this.updateStations(dt);
    this.updateCustomers(dt);
    this.updateStaff(dt);
    this.updateParticles(dt);
    this.updateFloatingTexts(dt);

    if (this.onStateUpdate) {
      this.onStateUpdate();
    }
  }

  /**
   * Clock & Day / Night simulation
   */
  private updateClock(dt: number) {
    // 1 real second = ~0.15 game hours (approx 1.5 minutes per game day)
    this.stats.timeOfDay += dt * 0.14;

    // Rush hours check: 8.5 to 10.0 (morning) or 13.0 to 14.5 (afternoon)
    this.stats.isRushHour =
      (this.stats.timeOfDay >= 8.5 && this.stats.timeOfDay <= 10.0) ||
      (this.stats.timeOfDay >= 13.0 && this.stats.timeOfDay <= 14.5);

    // Day ends at 22:00
    if (this.stats.timeOfDay >= 22.0) {
      this.stats.timeOfDay = 8.0; // Reset to 8 AM next day
      this.stats.day += 1;
      sound.playFanfare();

      if (this.onDayEnd) {
        this.onDayEnd({ ...this.stats });
      }

      // Reset daily counters
      this.stats.dayRevenue = 0;
      this.stats.dayTips = 0;
      this.stats.dayCustomersServed = 0;
    }
  }

  /**
   * Player movement physics & collision with walls/furniture
   */
  private updatePlayerMovement(dt: number) {
    let dx = 0;
    let dy = 0;

    // Keyboard controls
    if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

    // Virtual Joystick / Touch
    if (Math.abs(this.joystickVector.x) > 0.1 || Math.abs(this.joystickVector.y) > 0.1) {
      dx = this.joystickVector.x;
      dy = this.joystickVector.y;
    }

    // Click / Tap to move
    if (this.targetMovePosition && dx === 0 && dy === 0) {
      const distX = this.targetMovePosition.x - this.player.x;
      const distY = this.targetMovePosition.y - this.player.y;
      const dist = Math.hypot(distX, distY);
      if (dist > 8) {
        dx = distX / dist;
        dy = distY / dist;
      } else {
        this.targetMovePosition = null;
      }
    }

    const len = Math.hypot(dx, dy);
    if (len > 0.05) {
      dx = dx / len;
      dy = dy / len;

      this.player.isMoving = true;
      const effectiveSpeed = this.player.speed * (1 + (this.upgrades.playerSpeedLevel - 1) * 0.2);

      const newX = this.player.x + dx * effectiveSpeed * dt;
      const newY = this.player.y + dy * effectiveSpeed * dt;

      // Wall bounds collision
      const margin = 16;
      const minX = margin;
      const maxX = this.roomWidth - margin;
      const minY = 64 + margin; // Below top wall
      const maxY = this.roomHeight - margin;

      if (newX >= minX && newX <= maxX && !this.isBlockedByFurniture(newX, this.player.y)) {
        this.player.x = newX;
      }
      if (newY >= minY && newY <= maxY && !this.isBlockedByFurniture(this.player.x, newY)) {
        this.player.y = newY;
      }

      // Direction
      if (Math.abs(dx) > Math.abs(dy)) {
        this.player.direction = dx > 0 ? 'right' : 'left';
      } else {
        this.player.direction = dy > 0 ? 'down' : 'up';
      }

      // Walk cycle animation
      this.player.walkTimer += dt * 10;
      if (this.player.walkTimer > 1) {
        this.player.walkTimer = 0;
        this.player.frame = (this.player.frame + 1) % 4;
        if (this.player.frame % 2 === 0) {
          sound.playFootstep();
        }
      }

      // Auto check nearby station interaction
      this.checkStationInteraction();
    } else {
      this.player.isMoving = false;
      this.player.frame = 0;
    }
  }

  /**
   * Furniture collision check
   */
  private isBlockedByFurniture(x: number, y: number): boolean {
    const playerRadius = 8;
    for (const st of this.stations) {
      if (
        x + playerRadius > st.x &&
        x - playerRadius < st.x + st.width &&
        y + playerRadius > st.y &&
        y - playerRadius < st.y + st.height
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if player is standing on station interaction zone
   */
  private checkStationInteraction() {
    for (const station of this.stations) {
      const dist = Math.hypot(
        this.player.x - station.interactionZone.x,
        this.player.y - station.interactionZone.y
      );
      if (dist <= station.interactionZone.radius) {
        this.interactWithStation(station, 'player');
        break;
      }
    }
  }

  /**
   * Handle Station Interaction
   */
  public interactWithStation(station: Station, actor: 'player' | 'staff', staffMember?: Staff) {
    const inv = actor === 'player' ? this.player.inventory : staffMember?.inventory;
    if (!inv) return;

    const maxInv = actor === 'player' ? this.player.maxInventory : 1;

    switch (station.type) {
      case 'bean_storage': {
        // Pick up coffee beans if inventory has space
        if (inv.length < maxInv && !inv.includes('coffee_beans')) {
          inv.push('coffee_beans');
          sound.playPickup();
          this.addFloatingText('🫘 원두 획득', station.interactionZone.x, station.interactionZone.y, '#f59e0b');
        }
        break;
      }

      case 'dough_storage': {
        if (!this.stats.croissantUnlocked) {
          if (actor === 'player') {
            sound.playFootstep();
            this.addFloatingText('🔒 매장 Lv.2 확장 필요 (크루아상 잠김)', station.interactionZone.x, station.interactionZone.y, '#ef4444');
          }
          break;
        }
        // Pick up pastry dough
        if (inv.length < maxInv && !inv.includes('dough')) {
          inv.push('dough');
          sound.playPickup();
          this.addFloatingText('🍞 생지 획득', station.interactionZone.x, station.interactionZone.y, '#fef08a');
        }
        break;
      }

      case 'coffee_machine': {
        // If holding coffee beans and machine is idle: start brewing
        if (station.state === 'idle') {
          const beanIdx = inv.indexOf('coffee_beans');
          if (beanIdx !== -1) {
            inv.splice(beanIdx, 1);
            station.state = 'processing';
            station.progress = 0;

            // 1단계에서는 항상 아메리카노만 추출
            // 2단계 이상에서는 라떼를 기다리는 손님이 있을 경우 카페라떼 자동 추출
            let drinkToBrew: ItemType = 'americano';
            if (this.stats.cafeLevel >= 2) {
              const wantsLatte = this.customers.some(
                (c) =>
                  (c.state === 'ordering' || c.state === 'queueing' || c.state === 'seated_waiting') &&
                  c.desiredItem === 'latte'
              );
              if (wantsLatte) {
                drinkToBrew = 'latte';
              }
            }
            station.heldItem = drinkToBrew;

            sound.playBrew();
            const drinkName = drinkToBrew === 'latte' ? '🥛 카페라떼' : '☕ 아메리카노';
            this.addFloatingText(`${drinkName} 추출 시작...`, station.x + 20, station.y - 10, '#38bdf8');
            this.createBurstParticles(station.x + 24, station.y + 12, '#38bdf8', 6);
          }
        } else if (station.state === 'ready') {
          // Collect brewed coffee
          if (inv.length < maxInv) {
            const finishedDrink = station.heldItem || 'americano';
            inv.push(finishedDrink);
            station.state = 'idle';
            station.progress = 0;
            station.heldItem = undefined;
            sound.playPickup();
            const drinkName = finishedDrink === 'latte' ? '🥛 카페라떼' : '☕ 아메리카노';
            this.addFloatingText(`${drinkName} 완성!`, station.x + 20, station.y - 10, '#22c55e');
            this.trackQuestProgress('serve_item', 0); // progress
          }
        }
        break;
      }

      case 'oven': {
        if (!this.stats.croissantUnlocked) {
          if (actor === 'player') {
            sound.playFootstep();
            this.addFloatingText('🔒 베이커리 잠김 (매장 Lv.2 필요)', station.x + 20, station.y - 10, '#ef4444');
          }
          break;
        }
        // If holding dough and oven is idle: start baking
        if (station.state === 'idle') {
          const doughIdx = inv.indexOf('dough');
          if (doughIdx !== -1) {
            inv.splice(doughIdx, 1);
            station.state = 'processing';
            station.progress = 0;

            // 2단계에서는 크루아상, 3단계에서는 케이크 요청 손님이 있을 시 딸기케이크 구움
            let pastryToBake: ItemType = 'croissant';
            if (this.stats.cafeLevel >= 3) {
              const wantsCake = this.customers.some(
                (c) =>
                  (c.state === 'ordering' || c.state === 'queueing' || c.state === 'seated_waiting') &&
                  c.desiredItem === 'strawberry_cake'
              );
              if (wantsCake) {
                pastryToBake = 'strawberry_cake';
              }
            }
            station.heldItem = pastryToBake;

            sound.playBrew();
            const pastryName = pastryToBake === 'strawberry_cake' ? '🍰 딸기케이크' : '🥐 크루아상';
            this.addFloatingText(`${pastryName} 굽기 시작...`, station.x + 20, station.y - 10, '#f97316');
            this.createBurstParticles(station.x + 24, station.y + 12, '#f97316', 6);
          }
        } else if (station.state === 'ready') {
          // Collect baked croissant or cake
          if (inv.length < maxInv) {
            const finishedPastry = station.heldItem || 'croissant';
            inv.push(finishedPastry);
            station.state = 'idle';
            station.progress = 0;
            station.heldItem = undefined;
            sound.playPickup();
            const pastryName = finishedPastry === 'strawberry_cake' ? '🍰 딸기케이크' : '🥐 크루아상';
            this.addFloatingText(`${pastryName} 완성!`, station.x + 20, station.y - 10, '#22c55e');
          }
        }
        break;
      }

      case 'register': {
        // Serve customer in queue at counter!
        this.serveQueueCustomer(inv);
        break;
      }

      case 'serving_table': {
        // Table interaction:
        // 1. Deliver food to seated customer
        // 2. Clean dirty dishes
        if (station.heldItem === 'dirty_dish') {
          if (inv.length < maxInv) {
            station.heldItem = undefined;
            station.state = 'idle';
            inv.push('dirty_dish');
            sound.playPickup();
            this.addFloatingText('🍽️ 빈 그릇 수거', station.x + 20, station.y - 10, '#94a3b8');
            this.trackQuestProgress('clean_tables', 1);
          }
        } else {
          // Check if customer seated here needs food
          const seatedCustomer = this.customers.find(
            (c) => c.assignedTableId === station.tableId && c.state === 'seated_waiting'
          );
          if (seatedCustomer) {
            const itemIdx = inv.indexOf(seatedCustomer.desiredItem);
            if (itemIdx !== -1) {
              const itemType = inv.splice(itemIdx, 1)[0];
              station.heldItem = itemType;
              seatedCustomer.state = 'consuming';
              seatedCustomer.patience = seatedCustomer.maxPatience; // reset
              seatedCustomer.speechBubble = undefined;
              sound.playCustomerHappy();
              this.createBurstParticles(seatedCustomer.x, seatedCustomer.y - 10, '#ec4899', 8); // Hearts!
              this.addFloatingText('맛있게 드세요! ❤️', seatedCustomer.x, seatedCustomer.y - 20, '#f43f5e');
            }
          }
        }
        break;
      }

      case 'dish_sink': {
        // Wash dirty dishes
        const dishIdx = inv.indexOf('dirty_dish');
        if (dishIdx !== -1) {
          inv.splice(dishIdx, 1);
          sound.playCoin();
          this.stats.reputation = Math.min(5.0, this.stats.reputation + 0.05);
          this.addFloatingText('✨ 식기 세척 완료 (+위생)', station.x + 20, station.y - 10, '#38bdf8');
          this.createBurstParticles(station.x + 20, station.y + 10, '#38bdf8', 6);
        }
        break;
      }

      case 'trash_bin': {
        // Discard any unwanted item or trash
        if (inv.length > 0) {
          const removed = inv.pop();
          sound.playFootstep();
          this.addFloatingText('🗑️ 버림', station.x + 10, station.y - 10, '#64748b');
        }
        break;
      }
    }
  }

  /**
   * Serve waiting customer at register
   */
  private serveQueueCustomer(inv: ItemType[]) {
    const queuedCustomer = this.customers.find(
      (c) => c.state === 'ordering' || c.state === 'queueing'
    );
    if (!queuedCustomer) return;

    const itemIdx = inv.indexOf(queuedCustomer.desiredItem);
    if (itemIdx !== -1) {
      const servedItem = inv.splice(itemIdx, 1)[0];
      const itemInfo = ITEMS[servedItem];

      // Base price + bean/butter quality upgrade bonus
      let price = itemInfo.basePrice;
      if (itemInfo.category === 'drink') {
        price = Math.floor(price * (1 + (this.upgrades.beanQualityLevel - 1) * 0.25));
      } else if (itemInfo.category === 'bakery') {
        price = Math.floor(price * (1 + (this.upgrades.butterQualityLevel - 1) * 0.3));
      }

      // Tip calculation based on remaining patience & VIP
      const tipPct = (queuedCustomer.patience / queuedCustomer.maxPatience) * 0.3;
      let tip = Math.floor(price * tipPct * queuedCustomer.tipMultiplier);
      if (queuedCustomer.isVIP) tip *= 2;

      const totalGain = price + tip;
      this.stats.gold += totalGain;
      this.stats.dayRevenue += price;
      this.stats.dayTips += tip;
      this.stats.totalRevenue += totalGain;
      this.stats.totalCustomersServed += 1;
      this.stats.dayCustomersServed += 1;

      // Reputation boost
      const repGain = queuedCustomer.isVIP ? 0.2 : 0.04;
      this.stats.reputation = Math.min(5.0, Number((this.stats.reputation + repGain).toFixed(2)));

      sound.playRegister();
      this.addFloatingText(`+${price}G (팁 +${tip}G)`, queuedCustomer.x, queuedCustomer.y - 20, '#fbbf24');
      this.createBurstParticles(queuedCustomer.x, queuedCustomer.y - 10, '#fbbf24', 8);

      queuedCustomer.state = 'leaving';
      queuedCustomer.targetX = this.roomWidth / 2;
      queuedCustomer.targetY = this.roomHeight + 40;
      queuedCustomer.speechBubble = undefined;

      this.trackQuestProgress('serve_item', 1);
      this.trackQuestProgress('earn_gold', totalGain);
      this.checkGoalReached();
    }
  }

  /**
   * Update Stations (Brewing & Baking timers)
   */
  private updateStations(dt: number) {
    for (const station of this.stations) {
      if (station.state === 'processing') {
        let speedMult = 1.0;
        if (station.type === 'coffee_machine') {
          speedMult = 1.0 + (this.upgrades.machineSpeedLevel - 1) * 0.3;
        } else if (station.type === 'oven') {
          speedMult = 1.0 + (this.upgrades.ovenSpeedLevel - 1) * 0.35;
        }

        const baseTime = station.type === 'coffee_machine' ? 3.0 : 4.5;
        station.progress += (dt * speedMult) / baseTime;

        if (station.progress >= 1.0) {
          station.progress = 1.0;
          station.state = 'ready';
          if (station.type === 'coffee_machine') {
            sound.playCoin();
          } else if (station.type === 'oven') {
            sound.playOvenDing();
          }
        }
      }
    }
  }

  /**
   * Customer AI, Spawning & Navigation
   */
  private updateCustomers(dt: number) {
    // Spawn new customer
    this.customerSpawnTimer += dt;
    const spawnInterval = this.stats.isRushHour ? 4.0 : Math.max(5.0, 9.0 - this.stats.reputation * 0.8);

    if (this.customerSpawnTimer >= spawnInterval && this.customers.length < 8) {
      this.customerSpawnTimer = 0;
      this.spawnCustomer();
    }

    // Update each customer
    for (let i = this.customers.length - 1; i >= 0; i--) {
      const c = this.customers[i];

      // Move toward target
      const dx = c.targetX - c.x;
      const dy = c.targetY - c.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 4) {
        const speed = 60;
        c.x += (dx / dist) * speed * dt;
        c.y += (dy / dist) * speed * dt;
        c.frame = (c.frame + dt * 6) % 4;
        c.direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
      }

      // State handling
      switch (c.state) {
        case 'spawning': {
          if (dist <= 4) {
            // Check if there is a free table for dine-in
            const freeTable = this.findFreeTable();
            if (freeTable && Math.random() > 0.4) {
              c.state = 'seated_waiting';
              c.assignedTableId = freeTable.tableId;
              c.targetX = freeTable.x + freeTable.width / 2;
              c.targetY = freeTable.y + freeTable.height / 2 + 16;
              c.speechBubble = { text: '주문', item: c.desiredItem, timer: 999 };
            } else {
              // Line up at register
              c.state = 'queueing';
              this.updateQueuePositions();
            }
          }
          break;
        }

        case 'queueing':
        case 'ordering': {
          // Patience drains while waiting
          c.patience -= dt * 2.5;
          if (c.patience <= 0) {
            // Customer leaves upset
            c.state = 'leaving';
            c.targetX = this.roomWidth / 2;
            c.targetY = this.roomHeight + 40;
            c.speechBubble = undefined;
            this.stats.reputation = Math.max(1.0, Number((this.stats.reputation - 0.15).toFixed(2)));
            this.addFloatingText('너무 오래 걸려요! 💢', c.x, c.y - 20, '#ef4444');
          }
          break;
        }

        case 'seated_waiting': {
          c.patience -= dt * 1.8;
          if (c.patience <= 0) {
            c.state = 'leaving';
            c.targetX = this.roomWidth / 2;
            c.targetY = this.roomHeight + 40;
            c.speechBubble = undefined;
            this.stats.reputation = Math.max(1.0, Number((this.stats.reputation - 0.15).toFixed(2)));
            this.addFloatingText('주문이 안 나와요... 😢', c.x, c.y - 20, '#ef4444');
          }
          break;
        }

        case 'consuming': {
          // Eating/Drinking for 4 seconds
          c.patience -= dt * 25;
          if (Math.random() < 0.05) {
            this.createBurstParticles(c.x, c.y - 12, '#f43f5e', 1);
          }
          if (c.patience <= 0) {
            // Finished! Pay bill and leave dirty dish
            const table = this.stations.find((s) => s.tableId === c.assignedTableId);
            if (table) {
              table.heldItem = 'dirty_dish';
            }

            const itemInfo = ITEMS[c.desiredItem];
            const price = itemInfo.basePrice;
            const tip = Math.floor(price * 0.25 * c.tipMultiplier);
            const total = price + tip;

            this.stats.gold += total;
            this.stats.dayRevenue += price;
            this.stats.dayTips += tip;
            this.stats.totalRevenue += total;
            this.stats.totalCustomersServed += 1;
            this.stats.dayCustomersServed += 1;

            sound.playCoin();
            this.addFloatingText(`+${price}G (팁 +${tip}G)`, c.x, c.y - 20, '#fbbf24');
            this.createBurstParticles(c.x, c.y - 10, '#fbbf24', 6);

            c.state = 'leaving';
            c.targetX = this.roomWidth / 2;
            c.targetY = this.roomHeight + 40;
            c.speechBubble = undefined;

            this.trackQuestProgress('serve_item', 1);
            this.trackQuestProgress('earn_gold', total);
            this.checkGoalReached();
          }
          break;
        }

        case 'leaving': {
          if (c.y >= this.roomHeight + 30) {
            this.customers.splice(i, 1);
            this.updateQueuePositions();
          }
          break;
        }
      }
    }
  }

  /**
   * Spawn a customer
   */
  private spawnCustomer() {
    const types: CustomerType[] = ['student', 'office_worker', 'hipster', 'grandma'];
    if (Math.random() < 0.15) types.push('cat_guest');
    if (this.stats.reputation >= 3.5 && Math.random() < 0.2) types.push('critic');

    const selectedType = types[Math.floor(Math.random() * types.length)];
    const isVIP = selectedType === 'critic';

    // 1단계(Lv.1)에서는 오직 요리 가능한 '아메리카노'만 주문합니다!
    const possibleItems: ItemType[] = ['americano'];

    // 2단계 (베이커리 확장): 크루아상 & 카페라떼 해금
    if (this.stats.cafeLevel >= 2 && this.stats.croissantUnlocked) {
      possibleItems.push('croissant', 'latte');
    }

    // 3단계 (프리미엄 로스터리): 딸기 조각케이크 해금
    if (this.stats.cafeLevel >= 3) {
      possibleItems.push('strawberry_cake');
    }

    const desiredItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];

    const customer: Customer = {
      id: `cust_${Date.now()}_${Math.random()}`,
      type: selectedType,
      name: isVIP ? '미식가 VIP 손님' : '손님',
      x: this.roomWidth / 2,
      y: this.roomHeight + 20, // starts outside door
      targetX: this.roomWidth / 2,
      targetY: this.roomHeight - 30,
      direction: 'up',
      state: 'spawning',
      desiredItem,
      patience: isVIP ? 80 : 100,
      maxPatience: isVIP ? 80 : 100,
      isVIP,
      frame: 0,
      tipMultiplier: isVIP ? 3.0 : 1.0,
      speechBubble: undefined,
    };

    this.customers.push(customer);
  }

  /**
   * Find available dining table
   */
  private findFreeTable(): Station | undefined {
    const occupiedTableIds = this.customers
      .filter((c) => c.assignedTableId && (c.state === 'seated_waiting' || c.state === 'consuming'))
      .map((c) => c.assignedTableId);

    return this.stations.find(
      (s) =>
        s.type === 'serving_table' &&
        s.heldItem !== 'dirty_dish' &&
        !occupiedTableIds.includes(s.tableId)
    );
  }

  /**
   * Align waiting queue in front of register
   */
  private updateQueuePositions() {
    const queued = this.customers.filter((c) => c.state === 'queueing' || c.state === 'ordering');
    const registerStation = this.stations.find((s) => s.type === 'register');
    if (!registerStation) return;

    queued.forEach((cust, index) => {
      cust.targetX = registerStation.x + 32;
      cust.targetY = registerStation.y + 45 + index * 26;
      if (index === 0) {
        cust.state = 'ordering';
        cust.speechBubble = { text: '주문', item: cust.desiredItem, timer: 999 };
      }
    });
  }

  /**
   * Update Hired Staff Automation
   */
  private updateStaff(dt: number) {
    for (const member of this.staff) {
      if (!member.hired) continue;

      // Staff wage deduction over time
      // (Handled at day end or steady drip)

      // Staff movement
      const dx = member.targetX - member.x;
      const dy = member.targetY - member.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 4) {
        member.x += (dx / dist) * member.speed * dt;
        member.y += (dy / dist) * member.speed * dt;
        member.frame = (member.frame + dt * 6) % 4;
        member.direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
      }

      // Automation Routine by Role
      switch (member.role) {
        case 'barista': {
          // Routine: Bean storage -> Coffee machine -> brew & leave ready
          const coffeeMachine = this.stations.find(
            (s) => s.type === 'coffee_machine' && (s.state === 'idle' || s.state === 'ready')
          );
          const beanStorage = this.stations.find((s) => s.type === 'bean_storage');

          if (member.inventory.includes('coffee_beans') && coffeeMachine && coffeeMachine.state === 'idle') {
            member.targetX = coffeeMachine.interactionZone.x;
            member.targetY = coffeeMachine.interactionZone.y;
            if (dist <= 8) {
              this.interactWithStation(coffeeMachine, 'staff', member);
            }
          } else if (!member.inventory.includes('coffee_beans') && beanStorage) {
            member.targetX = beanStorage.interactionZone.x;
            member.targetY = beanStorage.interactionZone.y;
            if (dist <= 8) {
              this.interactWithStation(beanStorage, 'staff', member);
            }
          }
          break;
        }

        case 'baker': {
          // Routine: Dough storage -> Oven -> bake & leave ready
          const oven = this.stations.find((s) => s.type === 'oven' && s.state === 'idle');
          const doughStorage = this.stations.find((s) => s.type === 'dough_storage');

          if (member.inventory.includes('dough') && oven) {
            member.targetX = oven.interactionZone.x;
            member.targetY = oven.interactionZone.y;
            if (dist <= 8) {
              this.interactWithStation(oven, 'staff', member);
            }
          } else if (!member.inventory.includes('dough') && doughStorage) {
            member.targetX = doughStorage.interactionZone.x;
            member.targetY = doughStorage.interactionZone.y;
            if (dist <= 8) {
              this.interactWithStation(doughStorage, 'staff', member);
            }
          }
          break;
        }

        case 'waiter': {
          // Routine: Pick up ready coffee or croissant, serve queue or tables
          const readyMachine = this.stations.find((s) => s.state === 'ready');
          const register = this.stations.find((s) => s.type === 'register');

          if (member.inventory.length === 0 && readyMachine) {
            member.targetX = readyMachine.interactionZone.x;
            member.targetY = readyMachine.interactionZone.y;
            if (dist <= 8) {
              this.interactWithStation(readyMachine, 'staff', member);
            }
          } else if (member.inventory.length > 0 && register) {
            member.targetX = register.interactionZone.x;
            member.targetY = register.interactionZone.y;
            if (dist <= 8) {
              this.serveQueueCustomer(member.inventory);
            }
          }
          break;
        }

        case 'cleaner_cat': {
          // Cat wanders around tables, cleans dirty dishes, purrs to make customers patient
          const dirtyTable = this.stations.find((s) => s.type === 'serving_table' && s.heldItem === 'dirty_dish');
          const sink = this.stations.find((s) => s.type === 'dish_sink');

          if (dirtyTable && member.inventory.length === 0) {
            member.targetX = dirtyTable.interactionZone.x;
            member.targetY = dirtyTable.interactionZone.y;
            if (dist <= 8) {
              dirtyTable.heldItem = undefined;
              member.inventory.push('dirty_dish');
              this.addFloatingText('🐾 냥이 청소 완료!', dirtyTable.x + 20, dirtyTable.y - 10, '#f59e0b');
              this.trackQuestProgress('clean_tables', 1);
            }
          } else if (member.inventory.includes('dirty_dish') && sink) {
            member.targetX = sink.interactionZone.x;
            member.targetY = sink.interactionZone.y;
            if (dist <= 8) {
              member.inventory = [];
              this.addFloatingText('✨ 개수대 정리 완료', sink.x + 20, sink.y - 10, '#38bdf8');
            }
          } else {
            // Wandering cute behavior
            if (Math.random() < 0.02) {
              member.targetX = 100 + Math.random() * (this.roomWidth - 200);
              member.targetY = 160 + Math.random() * (this.roomHeight - 220);
            }
          }
          break;
        }
      }
    }
  }

  /**
   * Floating notification texts (+150G, tips, etc.)
   */
  public addFloatingText(text: string, x: number, y: number, color = '#fbbf24') {
    this.floatingTexts.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      text,
      x,
      y,
      color,
      life: 1.0,
      velocityY: -24,
    });
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.velocityY * dt;
      ft.life -= dt * 1.2;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  /**
   * Particle Systems (Sparkles, Steam, Hearts, Coins)
   */
  public createBurstParticles(x: number, y: number, color: string, count = 6) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 20 + Math.random() * 40;
      this.particles.push({
        id: `p_${Date.now()}_${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 15,
        color,
        size: 3 + Math.floor(Math.random() * 2),
        life: 1.0,
        maxLife: 0.6 + Math.random() * 0.4,
      });
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 40 * dt; // gravity
      p.life -= dt / p.maxLife;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Quest Tracker
   */
  public trackQuestProgress(type: Quest['type'], amount: number) {
    for (const q of this.quests) {
      if (!q.completed && q.type === type) {
        if (type === 'earn_gold') {
          q.progress = Math.min(q.target, Math.max(q.progress + amount, this.stats.totalRevenue));
        } else {
          q.progress += amount;
        }
        if (q.progress >= q.target) {
          q.progress = q.target;
          q.completed = true;
          sound.playFanfare();
          this.addFloatingText(`퀘스트 완료: ${q.title}! 🎉`, this.player.x, this.player.y - 30, '#ec4899');
        }
      }
    }
  }

  public checkGoalReached() {
    if (this.stats.gold >= this.stats.targetGold && !this.stats.goalReached) {
      this.stats.goalReached = true;
      sound.playFanfare();
      this.createBurstParticles(this.player.x, this.player.y - 20, '#fbbf24', 24);
      this.addFloatingText('🏆 100만 골드 달성! 전설의 타이쿤!', this.player.x, this.player.y - 40, '#f59e0b');
      if (this.onGoalReached) {
        this.onGoalReached();
      }
    }
  }

  public claimQuestReward(questId: string): boolean {
    const q = this.quests.find((x) => x.id === questId);
    if (!q || !q.completed || q.claimed) return false;

    q.claimed = true;
    this.stats.gold += q.rewardGold;
    this.stats.reputation = Math.min(5.0, Number((this.stats.reputation + q.rewardReputation).toFixed(2)));
    sound.playRegister();
    this.addFloatingText(`+${q.rewardGold}G 보상 획득!`, this.player.x, this.player.y - 30, '#22c55e');
    this.checkGoalReached();
    return true;
  }
}
