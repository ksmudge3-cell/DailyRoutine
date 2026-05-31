/* ============================================================
   DCC — LOOT BOX DATA MODEL + LOOT TABLE   (build step 1)
   ------------------------------------------------------------
   No UX. Defines box tiers, the loot pool, tier weights, and
   rollBox(). Output = inventory-ready items (see INVENTORY §2A),
   each with a `description: null` slot for the narrator (step 2).

   Reward rule (spec §0): boxes are EARNED, never purchased.
   This file only produces contents; it doesn't grant boxes.
   ============================================================ */
(function () {

  /* ---------- TUNING (everything adjustable lives here) ---------- */
  const TUNING = {
    // currency per box rank [common..legendary] — kept conservative
    currency: [
      { coins: [2, 5],   xp: [5, 10]   }, // common
      { coins: [4, 8],   xp: [10, 18]  }, // uncommon
      { coins: [8, 15],  xp: [20, 35]  }, // rare
      { coins: [15, 25], xp: [40, 70]  }, // epic
      { coins: [30, 50], xp: [90, 150] }, // legendary
    ],
    // how many item slots a box yields (currency slot is separate + always given)
    slots: [
      [1, 1], // common:    1 extra item
      [1, 2], // uncommon:  1-2
      [2, 2], // rare:      2
      [2, 3], // epic:      2-3
      [3, 4], // legendary: 3-4
    ],
    // chance a box ALSO drops a bonus currency item on top of the guaranteed one
    bonusCurrencyChance: [0, 0.1, 0.2, 0.35, 0.5],
    // relative weight of each item TYPE by box rank (drives the "feel" of a tier)
    // common leans junk; legendary leans buff/cosmetic
    typeWeights: [
      { junk: 6, food: 3, voucher: 2, buff: 1, cosmetic: 0, donutLine: 0 }, // common
      { junk: 4, food: 3, voucher: 3, buff: 2, cosmetic: 1, donutLine: 0 }, // uncommon
      { junk: 2, food: 3, voucher: 3, buff: 4, cosmetic: 2, donutLine: 1 }, // rare
      { junk: 1, food: 2, voucher: 2, buff: 5, cosmetic: 3, donutLine: 2 }, // epic
      { junk: 0, food: 2, voucher: 2, buff: 6, cosmetic: 4, donutLine: 3 }, // legendary
    ],
  };

  /* ---------- BOX TIERS (orb/glow colors per Design System) ---------- */
  const BOX_TIERS = {
    common:    { key: 'common',    label: 'Common',    rank: 0, glow: '#6b7280' },
    uncommon:  { key: 'uncommon',  label: 'Uncommon',  rank: 1, glow: '#B8D926' },
    rare:      { key: 'rare',      label: 'Rare',      rank: 2, glow: '#3a7bff' },
    epic:      { key: 'epic',      label: 'Epic',      rank: 3, glow: '#D947FF' },
    legendary: { key: 'legendary', label: 'Legendary', rank: 4, glow: '#FFD43A' },
  };
  const RANK_KEYS = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

  /* ---------- LOOT POOL ----------
     minRank = lowest BOX rank this item can appear in.
     weight  = relative chance WITHIN its own type.
     Buff `effect` keys are wired to real mechanics in a later step. */
  const POOL = [
    // —— BUFFS (the timing-decision items; the shields you liked) ——
    { itemId: 'head_start',     name: 'Head Start',        type: 'buff', minRank: 0, weight: 3, effect: 'preclear_one_task',          activation: 'voluntary', tier: 'common' },
    { itemId: 'debuff_shield',  name: 'Containment Field', type: 'buff', minRank: 1, weight: 3, effect: 'block_one_debuff',           activation: 'armed',     tier: 'uncommon' },
    { itemId: 'cleanse',        name: 'Decontamination',   type: 'buff', minRank: 1, weight: 3, effect: 'clear_one_active_debuff',    activation: 'instant',   tier: 'uncommon' },
    { itemId: 'streak_freeze',  name: 'Continuity Clause', type: 'buff', minRank: 1, weight: 2, effect: 'streak_freeze_one_day',      activation: 'auto',      tier: 'rare' },
    { itemId: 'surge',          name: 'Sponsor Surge',     type: 'buff', minRank: 2, weight: 2, effect: 'double_rewards_one_floor',   activation: 'voluntary', tier: 'rare' },
    { itemId: 'recovery_token', name: 'Wellness Package',  type: 'buff', minRank: 2, weight: 2, effect: 'recovery_mode_voluntary',    activation: 'voluntary', tier: 'epic' },

    // —— FOOD TREATS (the vending menu; go to inventory, used when ready) ——
    { itemId: 'food_cookie',    name: 'Cookie',     type: 'food', minRank: 0, weight: 4, vendKey: 'cookie',    tier: 'common' },
    { itemId: 'food_fries',     name: 'Fries',      type: 'food', minRank: 0, weight: 3, vendKey: 'fries',     tier: 'common' },
    { itemId: 'food_sandwich',  name: 'Sandwich',   type: 'food', minRank: 1, weight: 3, vendKey: 'sandwich',  tier: 'uncommon' },
    { itemId: 'food_lunch',     name: 'Hot Lunch',  type: 'food', minRank: 2, weight: 2, vendKey: 'lunch',     tier: 'rare' },
    { itemId: 'food_pizza',     name: 'Whole Pizza',type: 'food', minRank: 3, weight: 1, vendKey: 'pizza',     tier: 'epic' },

    // —— VOUCHERS (redeem at the Vending Machine) ——
    { itemId: 'voucher_small',  name: 'Discount Chit (−25%)', type: 'voucher', minRank: 0, weight: 3, discount: 0.25, tier: 'common' },
    { itemId: 'voucher_big',    name: 'Comp Voucher (free daily item)', type: 'voucher', minRank: 2, weight: 2, freeItem: true, tier: 'rare' },

    // —— COSMETICS (equip; persistent, not consumed) ——
    { itemId: 'frame_gilded',   name: 'Gilded Card Frame',      type: 'cosmetic', minRank: 2, weight: 3, slot: 'frame', tier: 'rare' },
    { itemId: 'flair_static',   name: 'Broadcast Static Flair', type: 'cosmetic', minRank: 2, weight: 2, slot: 'flair', tier: 'rare' },
    { itemId: 'donut_tiara',    name: "Donut's Spare Tiara",    type: 'cosmetic', minRank: 3, weight: 2, slot: 'companion', tier: 'epic' },
    { itemId: 'frame_boss',     name: 'Boss-Slayer Frame',      type: 'cosmetic', minRank: 4, weight: 1, slot: 'frame', tier: 'legendary' },

    // —— DONUT LINES (unlock rare dialogue; flag-only) ——
    { itemId: 'donut_line_rare',  name: 'Rare Donut Audience',  type: 'donutLine', minRank: 2, weight: 1, lineSet: 'rare',  tier: 'rare' },
    { itemId: 'donut_line_secret',name: 'Donut Confession',     type: 'donutLine', minRank: 4, weight: 1, lineSet: 'secret',tier: 'legendary' },

    // —— JUNK (the comedy slot; flavor only) ——
    { itemId: 'junk_sock',      name: 'A single damp sock',           type: 'junk', minRank: 0, weight: 3, tier: 'common' },
    { itemId: 'junk_coupon',    name: 'An expired coupon',            type: 'junk', minRank: 0, weight: 3, tier: 'common' },
    { itemId: 'junk_granola',   name: 'Half a granola bar',           type: 'junk', minRank: 0, weight: 2, tier: 'common' },
    { itemId: 'junk_button',    name: 'A button (origin unknown)',    type: 'junk', minRank: 0, weight: 2, tier: 'common' },
    { itemId: 'junk_coin',      name: 'A suspiciously warm coin',     type: 'junk', minRank: 0, weight: 1, tier: 'common' },
    { itemId: 'junk_sticker',   name: 'A motivational sticker, peeling', type: 'junk', minRank: 0, weight: 2, tier: 'common' },
  ];

  /* ---------- helpers ---------- */
  const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  function weightedPick(items, weightFn) {
    const total = items.reduce((s, it) => s + weightFn(it), 0);
    if (total <= 0) return null;
    let n = Math.random() * total;
    for (const it of items) { n -= weightFn(it); if (n <= 0) return it; }
    return items[items.length - 1];
  }
  function uid() { return 'inv_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  // wrap a pool entry into an inventory-ready item (INVENTORY §2A shape)
  function toInventoryItem(entry, source, qty = 1) {
    return {
      id: uid(),
      itemId: entry.itemId,
      name: entry.name,
      type: entry.type,
      tier: entry.tier || 'common',
      qty,
      source,                 // e.g. 'box:rare', 'quest:morning_crawl'
      acquiredAt: Date.now(),
      usedAt: null,
      equipped: false,
      description: null,      // ← narrator fills this in step 2
      payload: { ...entry },  // effect/vendKey/discount/slot/etc. for wiring later
    };
  }

  function rollCurrency(rank, source) {
    const c = TUNING.currency[rank];
    return {
      id: uid(),
      itemId: 'currency',
      name: 'Crawler Coins & XP',
      type: 'currency',
      tier: RANK_KEYS[rank],
      qty: 1,
      source,
      acquiredAt: Date.now(),
      usedAt: null,
      equipped: false,
      description: null,
      payload: { coins: randInt(c.coins[0], c.coins[1]), xp: randInt(c.xp[0], c.xp[1]) },
    };
  }

  /* ---------- the roll ----------
     Returns an array of inventory-ready items for an opened box. */
  function rollBox(boxKey) {
    const tier = BOX_TIERS[boxKey];
    if (!tier) throw new Error('Unknown box tier: ' + boxKey);
    const rank = tier.rank;
    const source = 'box:' + boxKey;
    const out = [];

    // 1) guaranteed currency slot
    out.push(rollCurrency(rank, source));

    // 2) optional bonus currency
    if (Math.random() < TUNING.bonusCurrencyChance[rank]) {
      out.push(rollCurrency(rank, source));
    }

    // 3) item slots
    const [lo, hi] = TUNING.slots[rank];
    const slots = randInt(lo, hi);
    const typeW = TUNING.typeWeights[rank];
    const eligible = POOL.filter((e) => e.minRank <= rank);

    const drawByType = (excludeTypes = []) => {
      const types = Object.keys(typeW).filter(
        (t) => typeW[t] > 0 && !excludeTypes.includes(t) && eligible.some((e) => e.type === t)
      );
      if (!types.length) return null;
      const chosenType = weightedPick(types, (t) => typeW[t]);
      const ofType = eligible.filter((e) => e.type === chosenType);
      const entry = weightedPick(ofType, (e) => e.weight);
      return entry ? toInventoryItem(entry, source) : null;
    };

    for (let i = 0; i < slots; i++) {
      const item = drawByType();
      if (item) out.push(item);
    }

    // 4) guarantees
    const has = (t) => out.some((it) => it.type === t);
    // legendary: guarantee a buff or cosmetic
    if (rank >= 4 && !has('buff') && !has('cosmetic')) {
      const item = drawByType(['junk', 'food', 'voucher', 'currency', 'donutLine']);
      if (item) replaceFiller(out, item);
    }
    // rare+: don't let a box be all-junk-and-currency
    if (rank >= 2) {
      const meaningful = out.some((it) => ['buff', 'cosmetic', 'voucher', 'food', 'donutLine'].includes(it.type));
      if (!meaningful) {
        const item = drawByType(['junk', 'currency']);
        if (item) replaceFiller(out, item);
      }
    }

    return out;
  }

  // swap a junk item for the guaranteed one (or just append if no junk present)
  function replaceFiller(out, item) {
    const junkIdx = out.findIndex((it) => it.type === 'junk');
    if (junkIdx >= 0) out[junkIdx] = item;
    else out.push(item);
  }

  /* ---------- export (browser global + node for testing) ---------- */
  const DCCLoot = { BOX_TIERS, TUNING, POOL, rollBox, rollCurrency };
  if (typeof module !== 'undefined' && module.exports) module.exports = DCCLoot;
  if (typeof window !== 'undefined') window.DCCLoot = DCCLoot;

})();