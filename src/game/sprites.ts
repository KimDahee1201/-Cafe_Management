/**
 * Pixel Cafe Tycoon - Pixel Sprite Rendering Engine
 * Custom pixel-art canvas renderer for character walk cycles, furniture, items & animations.
 */

import { Customer, Direction, ItemType, Player, Staff, Station } from './types';
import { ITEMS } from './constants';

// Helper to draw pixel rectangles
export function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

/**
 * Draw player character with walk cycle & held items
 */
export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player
) {
  const { x, y, direction, frame, isMoving, inventory } = player;
  const bob = isMoving ? (frame % 2 === 0 ? 0 : -2) : 0;
  const legOffset = isMoving ? (frame === 1 ? -2 : frame === 3 ? 2 : 0) : 0;

  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y + bob));

  // Character shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 8, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shoes / Legs
  ctx.fillStyle = '#1e293b';
  if (direction === 'left' || direction === 'right') {
    ctx.fillRect(-5 + legOffset, 4, 4, 6);
    ctx.fillRect(1 - legOffset, 4, 4, 6);
  } else {
    ctx.fillRect(-6, 4 + (legOffset > 0 ? -1 : 0), 4, 6);
    ctx.fillRect(2, 4 + (legOffset < 0 ? -1 : 0), 4, 6);
  }

  // Pants (Jeans)
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(-6, 0, 12, 6);

  // Body / Cafe Uniform (Cream Apron over Dark Navy Shirt)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-7, -10, 14, 10);

  // Apron (Khaki / Coffee Brown)
  ctx.fillStyle = '#d97706';
  ctx.fillRect(-5, -9, 10, 10);
  // Apron pocket
  ctx.fillStyle = '#b45309';
  ctx.fillRect(-3, -4, 6, 4);

  // Head
  // Hair base
  ctx.fillStyle = '#3e2723';
  ctx.fillRect(-6, -20, 12, 10);

  // Face (Skin tone)
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(-5, -18, 10, 8);

  // Eyes and direction details
  ctx.fillStyle = '#1e293b';
  if (direction === 'down') {
    ctx.fillRect(-4, -15, 2, 2);
    ctx.fillRect(2, -15, 2, 2);
    // Blush
    ctx.fillStyle = '#fca5a5';
    ctx.fillRect(-5, -13, 2, 1);
    ctx.fillRect(3, -13, 2, 1);
  } else if (direction === 'up') {
    // Back of hair
    ctx.fillStyle = '#2d1810';
    ctx.fillRect(-5, -19, 10, 8);
  } else if (direction === 'left') {
    ctx.fillRect(-4, -15, 2, 2);
    ctx.fillStyle = '#fca5a5';
    ctx.fillRect(-5, -13, 2, 1);
  } else if (direction === 'right') {
    ctx.fillRect(2, -15, 2, 2);
    ctx.fillStyle = '#fca5a5';
    ctx.fillRect(3, -13, 2, 1);
  }

  // Barista Cap / Beret
  ctx.fillStyle = '#451a03';
  ctx.fillRect(-7, -22, 14, 4);
  ctx.fillRect(-4, -24, 8, 3);
  // Cap badge
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(-1, -22, 2, 2);

  // Held Item Tray & Top item
  if (inventory.length > 0) {
    const topItem = inventory[inventory.length - 1];
    const trayY = -7;
    let trayX = 0;
    if (direction === 'left') trayX = -8;
    else if (direction === 'right') trayX = 8;
    else if (direction === 'up') trayX = 0;
    else trayX = 0;

    // Wood/Silver Tray
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(trayX - 8, trayY, 16, 3);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(trayX - 7, trayY + 2, 14, 1);

    // Render small item on tray
    drawItemIcon(ctx, topItem, trayX - 6, trayY - 12, 12);

    // Quantity indicator if more than 1
    if (inventory.length > 1) {
      ctx.fillStyle = '#1e293b';
      ctx.font = '8px NeoDunggeunmo, monospace';
      ctx.fillText(`x${inventory.length}`, trayX + 8, trayY - 4);
    }
  }

  ctx.restore();
}

/**
 * Draw Customers
 */
export function drawCustomer(ctx: CanvasRenderingContext2D, customer: Customer) {
  const { x, y, direction, frame, type, speechBubble, patience, maxPatience, isVIP } = customer;
  const bob = frame % 2 === 0 ? 0 : -1;

  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y + bob));

  // VIP golden glow
  if (isVIP) {
    ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
    ctx.beginPath();
    ctx.arc(0, -6, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(0, 6, 8, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Outfit & Hair palette based on Customer Type
  let hairColor = '#3e2723';
  let shirtColor = '#3b82f6';
  let pantsColor = '#1e293b';
  let skinColor = '#fed7aa';

  switch (type) {
    case 'office_worker':
      hairColor = '#172554';
      shirtColor = '#e2e8f0';
      pantsColor = '#0f172a';
      break;
    case 'student':
      hairColor = '#78350f';
      shirtColor = '#06b6d4';
      pantsColor = '#475569';
      break;
    case 'hipster':
      hairColor = '#b45309';
      shirtColor = '#10b981';
      pantsColor = '#854d0e';
      break;
    case 'grandma':
      hairColor = '#cbd5e1';
      shirtColor = '#c084fc';
      pantsColor = '#64748b';
      skinColor = '#fde047';
      break;
    case 'critic':
      hairColor = '#18181b';
      shirtColor = '#dc2626';
      pantsColor = '#09090b';
      break;
    case 'cat_guest':
      // Special pixel cat customer walking on two legs!
      drawCatGuest(ctx, direction);
      renderCustomerBubbleAndPatience(ctx, speechBubble, patience, maxPatience, isVIP);
      ctx.restore();
      return;
  }

  // Pants & shoes
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-5, 3, 3, 5);
  ctx.fillRect(2, 3, 3, 5);
  ctx.fillStyle = pantsColor;
  ctx.fillRect(-5, -1, 10, 5);

  // Shirt
  ctx.fillStyle = shirtColor;
  ctx.fillRect(-6, -10, 12, 9);

  // Office worker tie
  if (type === 'office_worker' && direction === 'down') {
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-1, -8, 2, 6);
  }

  // Head
  ctx.fillStyle = hairColor;
  ctx.fillRect(-5, -19, 10, 9);
  ctx.fillStyle = skinColor;
  ctx.fillRect(-4, -17, 8, 7);

  // Eyes
  ctx.fillStyle = '#0f172a';
  if (direction === 'down') {
    ctx.fillRect(-3, -15, 2, 2);
    ctx.fillRect(1, -15, 2, 2);
    if (type === 'critic') {
      // Golden Monocle
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1;
      ctx.strokeRect(-4, -16, 4, 4);
    }
  } else if (direction === 'left') {
    ctx.fillRect(-3, -15, 2, 2);
  } else if (direction === 'right') {
    ctx.fillRect(1, -15, 2, 2);
  }

  // Glasses for Grandma
  if (type === 'grandma' && direction === 'down') {
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1;
    ctx.strokeRect(-4, -16, 3, 3);
    ctx.strokeRect(1, -16, 3, 3);
  }

  // Speech bubble & Patience meter
  renderCustomerBubbleAndPatience(ctx, speechBubble, patience, maxPatience, isVIP);

  ctx.restore();
}

/**
 * Render special cute cat customer
 */
function drawCatGuest(ctx: CanvasRenderingContext2D, direction: Direction) {
  // Orange Tabby Cat
  ctx.fillStyle = '#f97316';
  ctx.fillRect(-5, -10, 10, 12); // body
  ctx.fillRect(-6, -17, 12, 8); // head
  // Ears
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(-6, -20, 3, 3);
  ctx.fillRect(3, -20, 3, 3);
  // White belly & paws
  ctx.fillStyle = '#fff7ed';
  ctx.fillRect(-3, -6, 6, 7);
  ctx.fillRect(-5, 2, 3, 4);
  ctx.fillRect(2, 2, 3, 4);
  // Eyes
  ctx.fillStyle = '#1e293b';
  if (direction === 'down') {
    ctx.fillRect(-3, -14, 2, 2);
    ctx.fillRect(1, -14, 2, 2);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(-1, -11, 2, 1);
  } else {
    ctx.fillRect(-2, -14, 2, 2);
  }
  // Cute Red Scarf
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-6, -10, 12, 3);
  ctx.fillRect(2, -7, 3, 4);
}

/**
 * Speech Bubble & Patience Bar Helper
 */
function renderCustomerBubbleAndPatience(
  ctx: CanvasRenderingContext2D,
  speechBubble: Customer['speechBubble'],
  patience: number,
  maxPatience: number,
  isVIP?: boolean
) {
  // Patience Meter (Mini bar above head)
  const barW = 20;
  const barH = 3;
  const barX = -barW / 2;
  const barY = -27;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

  const pct = Math.max(0, Math.min(1, patience / maxPatience));
  let barColor = '#22c55e'; // green
  if (pct < 0.3) barColor = '#ef4444'; // red
  else if (pct < 0.6) barColor = '#f59e0b'; // amber

  ctx.fillStyle = barColor;
  ctx.fillRect(barX, barY, Math.floor(barW * pct), barH);

  // VIP Crown badge
  if (isVIP) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = '10px NeoDunggeunmo, monospace';
    ctx.fillText('👑', -5, -31);
  }

  // Thought / Speech Bubble
  if (speechBubble && speechBubble.item) {
    const bubbleW = 28;
    const bubbleH = 22;
    const bubbleX = -bubbleW / 2;
    const bubbleY = -52;

    // Bubble frame
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bubbleX, bubbleY, bubbleW, bubbleH);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bubbleX, bubbleY, bubbleW, bubbleH);

    // Pointer notch
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-3, bubbleY + bubbleH);
    ctx.lineTo(0, bubbleY + bubbleH + 4);
    ctx.lineTo(3, bubbleY + bubbleH);
    ctx.fill();

    // Draw requested item icon
    drawItemIcon(ctx, speechBubble.item, bubbleX + 3, bubbleY + 2, 16);
  }
}

/**
 * Draw Staff Member
 */
export function drawStaff(ctx: CanvasRenderingContext2D, staff: Staff) {
  const { x, y, direction, frame, role, name, inventory } = staff;
  const bob = frame % 2 === 0 ? 0 : -1;

  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y + bob));

  // Special drawing for Cleaner Cat!
  if (role === 'cleaner_cat') {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Orange Cat with Cute Apron and Broom
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-5, -6, 10, 8); // body
    ctx.fillRect(-6, -14, 12, 8); // head
    // Ears
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-6, -17, 3, 3);
    ctx.fillRect(3, -17, 3, 3);
    // Apron
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-4, -5, 8, 7);
    // Little broom in hand
    ctx.fillStyle = '#78350f';
    ctx.fillRect(5, -12, 2, 14);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(4, 2, 5, 4);

    // Name tag
    ctx.fillStyle = '#0f172a';
    ctx.font = '8px NeoDunggeunmo, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🐾 나비', 0, -20);
    ctx.restore();
    return;
  }

  // Regular staff shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(0, 7, 9, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Uniform color by role
  let uniformColor = '#3b82f6';
  let hatColor = '#1d4ed8';
  if (role === 'baker') {
    uniformColor = '#ec4899';
    hatColor = '#ffffff'; // White Baker Toque
  } else if (role === 'waiter') {
    uniformColor = '#10b981';
    hatColor = '#065f46';
  }

  // Shoes & Pants
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-5, 4, 3, 5);
  ctx.fillRect(2, 4, 3, 5);
  ctx.fillStyle = '#334155';
  ctx.fillRect(-5, 0, 10, 5);

  // Body Uniform
  ctx.fillStyle = uniformColor;
  ctx.fillRect(-6, -9, 12, 9);

  // Head
  ctx.fillStyle = '#451a03';
  ctx.fillRect(-5, -18, 10, 9);
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(-4, -16, 8, 7);

  // Eyes
  ctx.fillStyle = '#0f172a';
  if (direction === 'down') {
    ctx.fillRect(-3, -14, 2, 2);
    ctx.fillRect(1, -14, 2, 2);
  } else if (direction === 'left') {
    ctx.fillRect(-3, -14, 2, 2);
  } else {
    ctx.fillRect(1, -14, 2, 2);
  }

  // Hat
  if (role === 'baker') {
    // Tall Baker Chef Hat
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, -24, 12, 7);
    ctx.fillRect(-8, -26, 16, 4);
  } else {
    // Staff Visor
    ctx.fillStyle = hatColor;
    ctx.fillRect(-7, -20, 14, 3);
  }

  // Held item
  if (inventory.length > 0) {
    drawItemIcon(ctx, inventory[0], -6, -2, 12);
  }

  // Name tag
  ctx.fillStyle = '#0f172a';
  ctx.font = '8px NeoDunggeunmo, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(name.split(' ')[0], 0, -26);

  ctx.restore();
}

/**
 * Draw Interactive Workstations & Cafe Furniture
 */
export function drawStation(ctx: CanvasRenderingContext2D, station: Station) {
  const { x, y, width, height, type, state, progress, level, heldItem, stock } = station;
  const px = Math.floor(x);
  const py = Math.floor(y);

  ctx.save();

  switch (type) {
    case 'register': {
      // Counter Base
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px, py + 8, width, height - 8);
      // Polished Marble Counter Top
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(px, py + 4, width, 6);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(px, py + 10, width, 2);

      // Gold / Pixel Cash Register
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px + width / 2 - 8, py - 4, 16, 12);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px + width / 2 - 6, py - 2, 12, 6); // screen
      // Green glow on screen
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(px + width / 2 - 4, py, 8, 2);

      // Bell
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px + width / 2 + 10, py + 1, 4, 4);
      break;
    }

    case 'coffee_machine': {
      // Counter table below
      ctx.fillStyle = '#451a03';
      ctx.fillRect(px, py + 14, width, height - 14);

      // Espresso Machine Body (Stainless steel & Chrome Red)
      ctx.fillStyle = level > 1 ? '#dc2626' : '#64748b';
      ctx.fillRect(px + 4, py - 8, width - 8, 22);

      // Chrome Trim & Cup warmer
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(px + 2, py - 10, width - 4, 3);

      // Dual Portafilters
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px + 8, py + 8, 4, 6);
      ctx.fillRect(px + width - 12, py + 8, 4, 6);

      // Pressure Gauge
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + width / 2 - 3, py - 4, 6, 6);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(px + width / 2 - 1, py - 2, 2, 2);

      // Ready Cup or Brewing Stream
      if (state === 'processing') {
        // Pouring animation stream
        ctx.fillStyle = '#451a03';
        ctx.fillRect(px + 9, py + 12, 2, 4);
        ctx.fillRect(px + width - 11, py + 12, 2, 4);
      } else if (state === 'ready') {
        // Fresh steaming cup
        drawItemIcon(ctx, 'americano', px + width / 2 - 6, py + 6, 14);
      }
      break;
    }

    case 'oven': {
      // Bakery Convection Oven
      ctx.fillStyle = '#334155';
      ctx.fillRect(px + 2, py - 6, width - 4, height + 6);
      // Silver Frame
      ctx.fillStyle = '#64748b';
      ctx.fillRect(px + 4, py - 4, width - 8, 4);

      // Glass Window (glowing orange when baking!)
      ctx.fillStyle = state === 'processing' ? '#f97316' : '#1e293b';
      ctx.fillRect(px + 6, py + 4, width - 12, 14);

      // Internal glowing heating coils
      if (state === 'processing') {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(px + 8, py + 7, width - 16, 2);
        ctx.fillRect(px + 8, py + 13, width - 16, 2);
      } else if (state === 'ready') {
        // Fresh golden croissant ready
        drawItemIcon(ctx, heldItem || 'croissant', px + width / 2 - 7, py + 4, 14);
      }

      // Digital Control dial
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(px + width - 10, py - 2, 3, 3);
      break;
    }

    case 'bean_storage': {
      // Wood pallet
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px, py + 12, width, height - 12);
      // Burlap Sack of Coffee Beans
      ctx.fillStyle = '#b45309';
      ctx.fillRect(px + 4, py - 4, width - 8, 18);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(px + 6, py - 6, width - 12, 4);
      // Coffee Bean Emblem
      ctx.fillStyle = '#451a03';
      ctx.fillRect(px + width / 2 - 3, py + 2, 6, 4);
      break;
    }

    case 'dough_storage': {
      // Wood box
      ctx.fillStyle = '#a16207';
      ctx.fillRect(px, py + 10, width, height - 10);
      // Flour sacks & Dough bowl
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(px + 4, py - 2, width - 8, 14);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 6, py - 4, width - 12, 4);
      break;
    }

    case 'serving_table': {
      // Round Wooden Cafe Table
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.ellipse(px + width / 2, py + height / 2 + 6, width / 2 - 2, height / 2 - 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tablecloth / Top Surface
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(px + width / 2, py + height / 2, width / 2 - 4, height / 2 - 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Flower vase or candle in center
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px + width / 2 - 2, py + height / 2 - 4, 4, 5);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(px + width / 2 - 3, py + height / 2 - 7, 6, 3);

      // Stools (Left & Right)
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(px - 4, py + height / 2, 5, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(px + width + 4, py + height / 2, 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Item on table if occupied/served or dirty dish
      if (heldItem && heldItem !== 'none') {
        drawItemIcon(ctx, heldItem, px + width / 2 - 8, py + height / 2 - 12, 16);
      }
      break;
    }

    case 'dish_sink': {
      // Stainless Steel Dishwashing Sink
      ctx.fillStyle = '#64748b';
      ctx.fillRect(px, py, width, height);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(px + 4, py + 4, width - 8, height - 8);
      // Water / Bubbles
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px + 6, py + 6, width - 12, height - 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 8, py + 8, 3, 3);
      ctx.fillRect(px + width - 12, py + 10, 4, 4);

      // Faucet
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(px + width / 2 - 2, py - 4, 4, 8);
      break;
    }

    case 'trash_bin': {
      // Green Recycling / Compost Bin
      ctx.fillStyle = '#15803d';
      ctx.fillRect(px + 2, py + 2, width - 4, height - 2);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(px, py, width, 4);
      // Recycling symbol
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + width / 2 - 2, py + 8, 4, 4);
      break;
    }
  }

  // Workstation Progress Bar (when brewing or baking)
  if (state === 'processing') {
    const barW = width - 4;
    const barH = 5;
    const barX = px + 2;
    const barY = py - 14;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(barX, barY, Math.floor(barW * Math.min(1, progress)), barH);
  }

  // "READY!" or "STOCK" badge
  if (state === 'ready') {
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(px + width / 2 - 14, py - 18, 28, 10);
    ctx.fillStyle = '#ffffff';
    ctx.font = '7px NeoDunggeunmo, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('완료!', px + width / 2, py - 10);
  } else if (stock !== undefined && (type === 'bean_storage' || type === 'dough_storage')) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(px + width / 2 - 12, py - 14, 24, 9);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '7px NeoDunggeunmo, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${stock}개`, px + width / 2, py - 7);
  }

  ctx.restore();
}

/**
 * Draw Item Icon onto Canvas
 */
export function drawItemIcon(
  ctx: CanvasRenderingContext2D,
  itemType: ItemType,
  x: number,
  y: number,
  size = 16
) {
  const item = ITEMS[itemType];
  if (!item || itemType === 'none') return;

  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));

  switch (itemType) {
    case 'americano': {
      // White ceramic cup with brown coffee
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, 4, size - 4, size - 6);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(3, 4, size - 6, 3);
      // Cup handle
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(size - 3, 6, 3, size - 10);
      // Steam
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(4, 1, 2, 2);
      ctx.fillRect(8, 0, 2, 2);
      break;
    }
    case 'latte': {
      // Glass mug with latte layers & heart foam
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, 4, size - 4, size - 6);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(3, 8, size - 6, size - 10);
      ctx.fillStyle = '#fef3c7'; // Foam
      ctx.fillRect(3, 4, size - 6, 4);
      // Latte art heart
      ctx.fillStyle = '#b45309';
      ctx.fillRect(size / 2 - 2, 5, 4, 2);
      break;
    }
    case 'croissant': {
      // Golden crescent pastry
      ctx.fillStyle = '#b45309';
      ctx.fillRect(2, size / 2 - 2, size - 4, 6);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(4, size / 2 - 4, size - 8, 4);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(3, size / 2 - 1, 3, 3);
      ctx.fillRect(size - 6, size / 2 - 1, 3, 3);
      break;
    }
    case 'strawberry_cake': {
      // Slice of white cake with strawberry on top
      ctx.fillStyle = '#fef08a'; // sponge
      ctx.fillRect(2, 6, size - 4, size - 8);
      ctx.fillStyle = '#ffffff'; // frosting
      ctx.fillRect(2, 5, size - 4, 3);
      ctx.fillRect(2, 9, size - 4, 2);
      // Red Strawberry
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(size / 2 - 2, 1, 5, 4);
      ctx.fillStyle = '#22c55e'; // green leaf
      ctx.fillRect(size / 2, 0, 2, 1);
      break;
    }
    case 'coffee_beans': {
      // Three roasted coffee beans
      ctx.fillStyle = '#78350f';
      ctx.fillRect(2, 4, 5, 7);
      ctx.fillRect(8, 2, 5, 7);
      ctx.fillRect(5, 8, 5, 6);
      // bean split line
      ctx.fillStyle = '#451a03';
      ctx.fillRect(4, 5, 1, 5);
      ctx.fillRect(10, 3, 1, 5);
      break;
    }
    case 'dough': {
      // Soft rounded yellow dough
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.ellipse(size / 2, size / 2, size / 2 - 2, size / 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.fillRect(size / 2 - 2, size / 2 - 1, 4, 2);
      break;
    }
    case 'dirty_dish': {
      // Stack of plates with messy crumbs
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(2, size - 6, size - 4, 4);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(4, size - 10, size - 8, 4);
      ctx.fillStyle = '#78350f'; // crumbs
      ctx.fillRect(5, size - 8, 2, 2);
      break;
    }
  }

  ctx.restore();
}

/**
 * Render Floor & Wall Tiles
 */
export function drawCafeBackground(
  ctx: CanvasRenderingContext2D,
  roomW: number,
  roomH: number,
  level: number
) {
  // 1. Outside / Street background (Cobblestone sidewalk & street lamps)
  ctx.fillStyle = '#1e1b18';
  ctx.fillRect(-100, -100, roomW + 200, roomH + 200);

  // 2. Outdoor Sidewalk / Flowerbed
  ctx.fillStyle = '#475569';
  ctx.fillRect(-40, roomH - 40, roomW + 80, 80);

  // Sidewalk grid lines
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  for (let sx = -40; sx < roomW + 80; sx += 32) {
    ctx.strokeRect(sx, roomH - 40, 32, 40);
  }

  // 3. Cafe Floor (Warm Parquet / Checkered Tiles)
  const tileSize = 32;
  for (let r = 0; r < roomH; r += tileSize) {
    for (let c = 0; c < roomW; c += tileSize) {
      const isAlt = ((r / tileSize) + (c / tileSize)) % 2 === 0;
      if (level >= 2) {
        // Warm Walnut Parquet Floor
        ctx.fillStyle = isAlt ? '#7c2d12' : '#9a3412';
        ctx.fillRect(c, r, tileSize, tileSize);
        // Wood grain hairline
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(c, r + 8, tileSize, 1);
        ctx.fillRect(c, r + 24, tileSize, 1);
      } else {
        // Classic Retro Checkerboard Tiles
        ctx.fillStyle = isAlt ? '#fef3c7' : '#f59e0b';
        ctx.fillRect(c, r, tileSize, tileSize);
      }
    }
  }

  // 4. Cafe Cozy Red Rug in seating area
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(tileSize * 3, tileSize * 4, tileSize * 6, tileSize * 5);
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(tileSize * 3 + 4, tileSize * 4 + 4, tileSize * 6 - 8, tileSize * 5 - 8);
  // Gold rug fringe
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(tileSize * 3, tileSize * 4, tileSize * 6, 2);
  ctx.fillRect(tileSize * 3, tileSize * 9 - 2, tileSize * 6, 2);

  // 5. Cafe Interior Walls (Top & Sides)
  const wallH = 64;
  // Brick Pattern
  ctx.fillStyle = '#3f1d14';
  ctx.fillRect(0, 0, roomW, wallH);
  ctx.fillStyle = '#5c2b1e';
  for (let wy = 0; wy < wallH; wy += 8) {
    const shift = (wy / 8) % 2 === 0 ? 0 : 8;
    for (let wx = 0; wx < roomW; wx += 16) {
      ctx.fillRect(wx + shift, wy, 14, 6);
    }
  }

  // Wall Moldings / Trim
  ctx.fillStyle = '#78350f';
  ctx.fillRect(0, wallH - 6, roomW, 6);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(0, wallH, roomW, 2);

  // Cafe Window looking outside
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(tileSize * 7, 8, 80, 42);
  ctx.fillStyle = '#60a5fa';
  ctx.fillRect(tileSize * 7 + 4, 12, 72, 34);
  // Window frame & sunlight ray
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(tileSize * 7 + 4, 12, 72, 34);
  ctx.beginPath();
  ctx.moveTo(tileSize * 7 + 40, 12);
  ctx.lineTo(tileSize * 7 + 40, 46);
  ctx.stroke();

  // Menu Chalkboard on Wall
  ctx.fillStyle = '#14532d'; // Dark slate chalkboard
  ctx.fillRect(tileSize * 2, 10, 60, 40);
  ctx.strokeStyle = '#a16207'; // wooden frame
  ctx.lineWidth = 3;
  ctx.strokeRect(tileSize * 2, 10, 60, 40);
  // Chalk text lines
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(tileSize * 2 + 6, 16, 20, 2);
  ctx.fillRect(tileSize * 2 + 6, 22, 45, 2);
  ctx.fillRect(tileSize * 2 + 6, 28, 40, 2);
  ctx.fillRect(tileSize * 2 + 6, 34, 30, 2);

  // Hanging Wall Sconces / Lanterns with warm glow
  const sconces = [tileSize * 1, tileSize * 5, tileSize * 10];
  sconces.forEach((sx) => {
    // Glow circle
    ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
    ctx.beginPath();
    ctx.arc(sx + 8, 30, 24, 0, Math.PI * 2);
    ctx.fill();

    // Sconce fixture
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(sx + 6, 26, 4, 8);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(sx + 5, 24, 6, 5);
  });

  // Entrance Door Mat at bottom
  ctx.fillStyle = '#334155';
  ctx.fillRect(roomW / 2 - 24, roomH - 12, 48, 12);
  ctx.fillStyle = '#ffffff';
  ctx.font = '6px NeoDunggeunmo, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('WELCOME', roomW / 2, roomH - 4);
}
