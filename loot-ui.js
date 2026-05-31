/* ════════════════════════════════════════════════════════════════
   loot-ui.js — DCC Loot visual layer (Piece 1: The Stash grid)
   Classic script. No IIFE, no modules — every render fn is a top-level
   declaration so inline onclick="..." can reach it.

   Data ONLY through the global API (app.js owns persistence + sync):
     getPendingBoxes()  openBox(id)  getInventory()  useInventoryItem(id)
   We never read/mutate the raw inventory / pendingBoxes arrays.

   Reveal overlay (the chest fanfare) is the NEXT build — see openLootBox().
   ════════════════════════════════════════════════════════════════ */

/* ── rarity tiers → color + orb asset (names resolved off window at runtime,
      so a renamed/missing asset degrades to a colored dot instead of blanking) ── */
var STASH_TIER = {
  common:    { color: '#6b7280', orb: ['ORB_GRAY', 'ICON_ORB_WHITE'], label: 'COMMON' },
  uncommon:  { color: '#B8D926', orb: ['ICON_ORB_GREEN'],             label: 'UNCOMMON' },
  rare:      { color: '#3a7bff', orb: ['ICON_ORB_BLUE'],              label: 'RARE' },
  epic:      { color: '#D947FF', orb: ['ORB_PURPLE'],                 label: 'EPIC' },
  legendary: { color: '#FFD43A', orb: ['ORB_YELLOW'],                 label: 'LEGENDARY' }
};

/* ── itemId / type → icon asset (handoff §3); prefixes + type fallbacks below ── */
var STASH_ICON = {
  food_cookie: 'ICON_COOKIE', food_fries: 'ICON_FRIES', food_sandwich: 'ICON_SANDWICH',
  food_lunch: 'ICON_DINNER_PLATE', food_pizza: 'ICON_PIZZA',
  debuff_shield: 'ICON_SHIELD', cleanse: 'ICON_FIRST_AID', recovery_token: 'ICON_POTION',
  surge: 'ICON_FIRE', head_start: 'ICON_STAR', streak_freeze: 'ICON_LOCK',
  donut_tiara: 'ICON_CROWN'
};
var STASH_ICON_BY_TYPE = {
  food: 'ICON_DINNER_PLATE', voucher: 'ICON_MONEY_BAG', buff: 'ICON_STAR',
  cosmetic: 'ICON_CROWN', donutLine: 'ICON_PRINCESS_DONUT_PORTRAIT'
};
var STASH_FALLBACK_GLYPH = {
  food: '🍴', voucher: '🎟', buff: '✦', cosmetic: '♛', donutLine: '👑', junk: '▨'
};

/* accordion + flash state (UI-only, not game state) */
var _stashOpenId = null;
var _stashFlash = null;
var _stashFlashTimer = null;

/* ── tiny helpers ──────────────────────────────────────────────── */
function stashAsset(names) {
  if (!names) return null;
  if (typeof names === 'string') names = [names];
  for (var i = 0; i < names.length; i++) {
    if (names[i] && typeof window[names[i]] !== 'undefined' && window[names[i]]) return window[names[i]];
  }
  return null;
}
function stashTier(t) { return STASH_TIER[t] || STASH_TIER.common; }
function stashHexToRgba(hex, a) {
  var h = String(hex).replace('#', '');
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  var r = parseInt(h.substr(0,2),16), g = parseInt(h.substr(2,2),16), b = parseInt(h.substr(4,2),16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}
function stashEsc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function stashArg(id) { return String(id).replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }
function stashImg(src, size, cls) {
  if (typeof pixelIcon === 'function') {
    try { var out = pixelIcon(src, size); if (typeof out === 'string') return out; } catch (e) {}
  }
  return '<img class="' + (cls || '') + '" src="' + src + '" alt="" ' +
         'style="width:' + size + 'px;height:' + size + 'px;image-rendering:pixelated;display:block">';
}
function stashIconName(it) {
  if (STASH_ICON[it.itemId]) return STASH_ICON[it.itemId];
  if (/^voucher_/.test(it.itemId || '')) return 'ICON_MONEY_BAG';
  if (/^donut_line_/.test(it.itemId || '')) return 'ICON_PRINCESS_DONUT_PORTRAIT';
  return STASH_ICON_BY_TYPE[it.type] || null; // junk → null → glyph tile
}

/* action verb per item type (junk has none) */
function stashActionLabel(it) {
  switch (it.type) {
    case 'buff':      return 'Activate';
    case 'food':      return 'Enjoy';
    case 'voucher':   return 'Redeem';
    case 'donutLine': return 'Play';
    case 'cosmetic':  return it.equipped ? 'Equipped ✓' : 'Equip';
    default:          return null; // junk
  }
}

/* ── MAIN: fill #inventory-content from getInventory() + getPendingBoxes() ── */
function renderInventory() {
  var el = document.getElementById('inventory-content');
  if (!el) return;

  var boxes = (typeof getPendingBoxes === 'function') ? (getPendingBoxes() || []) : [];
  var items = (typeof getInventory === 'function') ? (getInventory() || []) : [];

  var html = '';

  if (_stashFlash) html += '<div class="stash-flash">' + stashEsc(_stashFlash) + '</div>';

  if (boxes.length) {
    html += '<div class="stash-label">UNOPENED · ' + boxes.length + ' CRATE' + (boxes.length === 1 ? '' : 'S') + '</div>';
    html += '<div class="stash-pending">';
    for (var b = 0; b < boxes.length; b++) html += stashCrateCell(boxes[b]);
    html += '</div>';
  }

  var effects = (typeof getActiveEffects === 'function') ? (getActiveEffects() || []) : [];
  if (effects.length) html += stashActiveStrip(effects);

  html += '<div class="stash-label">YOUR HAUL · ' + items.length + ' ITEM' + (items.length === 1 ? '' : 'S') + '</div>';
  if (!items.length) {
    html += '<div class="stash-empty">// STASH EMPTY\nCLEAR FLOORS AND HOLD STREAKS TO EARN CRATES.</div>';
  } else {
    html += '<div class="stash-grid">';
    for (var i = 0; i < items.length; i++) html += stashItemCell(items[i]);
    html += '</div>';
  }

  el.innerHTML = html;

  // flash auto-clears so it doesn't linger across navigations
  if (_stashFlash) {
    if (_stashFlashTimer) clearTimeout(_stashFlashTimer);
    _stashFlashTimer = setTimeout(function () { _stashFlash = null; renderInventory(); }, 4200);
  }
}

/* ── a pending crate (tap to open) ─────────────────────────────── */
function stashCrateCell(box) {
  var tier = stashTier(box.tier);
  var styleVars = '--tier:' + tier.color + ';--tier-dim:' + stashHexToRgba(tier.color, 0.16);
  var chest = stashAsset('ICON_CHEST') || stashAsset('CHEST_CLOSED_PX');
  var art = chest
    ? stashImg(chest, 46, 'stash-crate-img')
    : '<div class="stash-crate-fallback">▣</div>';
  return '<div class="stash-crate" style="' + styleVars + '" onclick="openLootBox(\'' + stashArg(box.id) + '\')">' +
           art +
           '<div class="stash-crate-tier">' + tier.label + '</div>' +
         '</div>';
}

/* ── one inventory cell (collapsed) / expanded with appraisal + action ── */
function stashItemCell(it) {
  var tier = stashTier(it.tier);
  var open = (_stashOpenId === it.id);
  var styleVars = '--tier:' + tier.color + ';--tier-dim:' + stashHexToRgba(tier.color, 0.16);

  var iconSrc = stashAsset(stashIconName(it));
  var icon = iconSrc
    ? '<div class="stash-icon-wrap">' + stashImg(iconSrc, 44, 'stash-icon') + '</div>'
    : '<div class="stash-icon-wrap"><div class="stash-icon-fallback">' +
        (STASH_FALLBACK_GLYPH[it.type] || '▨') + '</div></div>';

  // tier marker: real orb asset if present, else a glowing dot
  var orbSrc = stashAsset(tier.orb);
  var orb = orbSrc
    ? stashImg(orbSrc, 13, 'stash-orb-img')
    : '<span class="stash-orb-dot"></span>';

  // qty badge for stackables only (buffs are always 1; cosmetics use the toggle)
  var qty = '';
  if ((it.type === 'food' || it.type === 'voucher' || it.type === 'junk') && it.qty > 1) {
    qty = '<div class="stash-qty">×' + it.qty + '</div>';
  }

  var detail = '';
  if (open) {
    var appraisal = it.description
      ? '<div class="loot-appraisal">' + stashEsc(it.description) + '</div>'
      : '';
    var label = stashActionLabel(it);
    var btn = '';
    if (label) {
      var btnCls = 'stash-use-btn' +
        (it.type === 'cosmetic' && it.equipped ? ' equipped' :
         (it.type === 'cosmetic' ? ' ghost' : ''));
      btn = '<button class="' + btnCls + '" ' +
            'onclick="event.stopPropagation();useStashItem(\'' + stashArg(it.id) + '\')">' +
            stashEsc(label) + '</button>';
    }
    detail = '<div class="stash-detail">' + appraisal + btn + '</div>';
  }

  return '<div class="stash-cell tier-' + stashEsc(it.tier || 'common') + (open ? ' open' : '') + '" ' +
           'style="' + styleVars + '" onclick="toggleStashCell(\'' + stashArg(it.id) + '\')">' +
           qty + icon +
           '<div class="stash-name">' + stashEsc(it.name) + '</div>' +
           '<div class="stash-tier-row">' + orb +
             '<span class="stash-tier-label">' + tier.label + '</span>' +
           '</div>' +
           detail +
         '</div>';
}

/* ── interactions (all global for inline onclick) ──────────────── */
function toggleStashCell(id) {
  _stashOpenId = (_stashOpenId === id) ? null : id;
  renderInventory();
}

function useStashItem(id) {
  if (typeof useInventoryItem !== 'function') return;
  useInventoryItem(id);           // API consumes/equips + persists + syncs
  renderInventory();              // reflect the new state
}

/* INTERIM open — opens the crate cleanly and drops items into the grid so the
   item-card layer is testable now. The NEXT build swaps this body for the
   animated chest reveal overlay (.encounter-overlay pattern) per Loot Spec §2;
   the API call below (openBox) stays exactly the same. */
function openLootBox(boxId) {
  if (typeof openBox !== 'function') return;
  var r = openBox(boxId);
  var n = (r && r.items) ? r.items.length : 0;
  var coins = (r && r.deposited && r.deposited.coins != null) ? r.deposited.coins : 0;
  var xp = (r && r.deposited && r.deposited.xp != null) ? r.deposited.xp : 0;
  _stashFlash = '// CRATE BREACHED — ' + n + ' ITEM' + (n === 1 ? '' : 'S') + ' LOGGED TO STASH\n' +
                '+' + coins + ' CRAWLER COINS   +' + xp + ' XP';
  _stashOpenId = null;
  renderInventory();
}

/* ════════════════════════════════════════════════════════════════
   IN PLAY strip — active / banked effects above the haul grid
   Data via getActiveEffects(): { name, status:'active'|'banked', note, itemId, tier }
   Read-only status display (no tap action). amber = active, dimmed = banked.
   ════════════════════════════════════════════════════════════════ */
function stashActiveStrip(effects) {
  var html = '<div class="stash-label">IN PLAY</div><div class="stash-inplay">';
  for (var i = 0; i < effects.length; i++) html += stashEffectChip(effects[i]);
  return html + '</div>';
}

function stashEffectChip(e) {
  var banked = (e.status === 'banked');
  var tier = stashTier(e.tier);
  var styleVars = '--tier:' + tier.color + ';--tier-dim:' + stashHexToRgba(tier.color, 0.16);
  var iconSrc = stashAsset(stashIconName({ itemId: e.itemId, type: 'buff' }));
  var icon = iconSrc
    ? stashImg(iconSrc, 22, 'stash-inplay-icon')
    : '<span class="stash-inplay-glyph">✦</span>';
  return '<div class="stash-inplay-chip' + (banked ? ' banked' : '') + '" style="' + styleVars + '">' +
           icon +
           '<div class="stash-inplay-text">' +
             '<div class="stash-inplay-name">' + stashEsc(e.name) +
               '<span class="stash-inplay-status">' + (banked ? 'BANKED' : 'ACTIVE') + '</span>' +
             '</div>' +
             (e.note ? '<div class="stash-inplay-note">' + stashEsc(e.note) + '</div>' : '') +
           '</div>' +
         '</div>';
}