/**
 * Pixel Cafe Tycoon - Game Types & Interfaces
 */

export type Direction = 'up' | 'down' | 'left' | 'right';

export type ItemType =
  | 'none'
  | 'coffee_beans'
  | 'americano'
  | 'latte'
  | 'dough'
  | 'croissant'
  | 'strawberry_cake'
  | 'dirty_dish';

export interface ItemInfo {
  id: ItemType;
  name: string;
  category: 'drink' | 'bakery' | 'ingredient' | 'waste';
  basePrice: number;
  prepTime: number; // in seconds
  icon: string;
  color: string;
  description: string;
}

export type StationType =
  | 'register'
  | 'coffee_machine'
  | 'oven'
  | 'bean_storage'
  | 'dough_storage'
  | 'serving_table'
  | 'dish_sink'
  | 'trash_bin';

export interface Station {
  id: string;
  type: StationType;
  name: string;
  x: number; // grid x
  y: number; // grid y
  width: number;
  height: number;
  interactionZone: { x: number; y: number; radius: number };
  state: 'idle' | 'processing' | 'ready' | 'needs_restock' | 'dirty';
  progress: number; // 0 to 1
  level: number;
  heldItem?: ItemType;
  stock?: number;
  maxStock?: number;
  tableId?: number; // for serving tables
  assignedStaffId?: string;
}

export interface Player {
  x: number; // world pixels
  y: number;
  speed: number;
  direction: Direction;
  isMoving: boolean;
  frame: number;
  inventory: ItemType[];
  maxInventory: number;
  walkTimer: number;
}

export type CustomerType =
  | 'student'
  | 'office_worker'
  | 'hipster'
  | 'grandma'
  | 'critic'
  | 'cat_guest';

export interface Customer {
  id: string;
  type: CustomerType;
  name: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  direction: Direction;
  state:
    | 'spawning'
    | 'queueing'
    | 'ordering'
    | 'waiting_for_seat'
    | 'seated_waiting'
    | 'consuming'
    | 'leaving';
  desiredItem: ItemType;
  patience: number; // 0 to 100
  maxPatience: number;
  assignedTableId?: number;
  isVIP?: boolean;
  frame: number;
  tipMultiplier: number;
  speechBubble?: {
    text: string;
    item?: ItemType;
    timer: number;
  };
}

export interface Staff {
  id: string;
  name: string;
  role: 'barista' | 'baker' | 'waiter' | 'cleaner_cat';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  level: number;
  hired: boolean;
  cost: number;
  wagePerMin: number;
  direction: Direction;
  frame: number;
  inventory: ItemType[];
  currentTask?: string;
  description: string;
  avatarColor: string;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number; // 0 to 1
  velocityY: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  rewardGold: number;
  rewardReputation: number;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  type: 'serve_item' | 'earn_gold' | 'hire_staff' | 'expand_cafe' | 'clean_tables';
}

export interface CafeStats {
  gold: number;
  reputation: number; // 1.0 to 5.0
  totalCustomersServed: number;
  totalRevenue: number;
  cafeLevel: number;
  day: number;
  timeOfDay: number; // 0 to 24 hours (game clock)
  isRushHour: boolean;
  isPaused: boolean;
  dayRevenue: number;
  dayTips: number;
  dayCustomersServed: number;
  targetGold: number; // 1,000,000 G
  goalReached: boolean;
  croissantUnlocked: boolean;
}

export interface CafeExpansion {
  level: number;
  name: string;
  cost: number;
  requiredRep: number;
  width: number;
  height: number;
  description: string;
  features: string[];
}
