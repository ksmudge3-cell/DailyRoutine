/* ============================================================
   DCC — NARRATOR / APPRAISAL SUBROUTINE   (build step 2)
   ------------------------------------------------------------
   Procedural item-description generator (Tone Spec §3).
   Fills the `description` slot on rolled loot items.

   Usage after a roll:
     const items = DCCLoot.rollBox('rare');
     DCCNarrator.appraiseAll(items);   // sets item.description on each

   Voice = the System's rambling "appraisal subroutine": fake stats,
   tangents, disclaimers, guest-sponsor plugs, snark at the crawler.
   Length scales with rarity (Common = terse; Legendary = full essay).
   Register is the *opposite* of the clipped System warnings — keep
   them distinct (warnings stay short; descriptions ramble).
   ============================================================ */
(function () {

  // House sponsor stamps the permanent furniture elsewhere; guest
  // sponsors rotate through item descriptions (Tone Spec sponsor layer).
  // Swap to 'Borant' for the canon deep cut, or your own megacorp.
  const HOUSE_SPONSOR = 'the Syndicate';

  const GUEST_SPONSORS = [
    "NokNok Personal Security", "Gupp's Premium Hydration Solutions",
    "Velbon Synthetic Comforts", "Drazil Reputable Financial Instruments",
    "Moople Brand Adhesives", "the Department of Encouraged Outcomes",
    "Tentaclon Wellness Devices", "the makers of regret",
  ];

  const FRAG = {
    flourish: [
      "Behold:", "Oh. It's this one.", "Congratulations, allegedly.",
      "Against all odds:", "Salvaged. Barely.", "The audience leans in.",
    ],
    provenance: [
      "Previously owned by someone who also made poor choices.",
      "Recovered from a floor no one talks about.",
      "Last appraised during an incident.",
      "Its origin is classified for morale reasons.",
      "Found wedged somewhere the cameras don't reach.",
    ],
    disclaimer: [
      "Non-refundable. Side effects may include consequences.",
      "Warranty void if used, observed, or believed in.",
      "Not responsible for outcomes, feelings, or floor collapse.",
      "By accepting this you agree to terms you did not read.",
    ],
    close: [
      "Frankly, more than you deserve. Enjoy.",
      "Try not to lose it immediately.",
      "The audience expected better. So did we.",
      "Use it or don't. We're contractually indifferent.",
      "Do try to act surprised.",
    ],
    stat: [
      "+{n} Smugness", "-{n} Object Permanence", "+{n} Unearned Confidence",
      "Durability: emotional", "Weight: regrettable", "+{n} Resale Anxiety",
      "-{n} Common Sense", "Glows when judged", "+{n} Ambient Menace",
      "Durability: bureaucratic", "Effective range: optimistic",
    ],
  };

  // type-flavored opening appraisal lines
  const APPRAISAL = {
    junk: [
      "Statistically, an object.",
      "A relic of unmatched mediocrity.",
      "It exists. That is the kindest thing to be said of it.",
      "The System logged this purely for legal reasons.",
    ],
    buff: [
      "The System grudgingly concedes this one has uses.",
      "Functional. Irritatingly so.",
      "Deploy it well and the audience may forgive your earlier choices.",
      "A genuine advantage, which the System resents providing.",
    ],
    food: [
      "Sustenance. The crawler requires fuel; the sponsors require footage of you eating it.",
      "Edible, per the most generous interpretation of the word.",
      "Calories, broadcast live. Enjoy on your own schedule.",
    ],
    voucher: [
      "A promise of future commerce, redeemable at the kiosk.",
      "Paper. But paper that means something, allegedly.",
    ],
    cosmetic: [
      "Purely decorative. The audience adores decorative.",
      "Adds nothing of substance, which is precisely the appeal.",
      "Wear it. Be perceived. That is the entire point.",
    ],
    donutLine: [
      "Her Majesty has authorized additional dialogue. You are honored.",
      "A rare audience with the cat. Do not waste it.",
    ],
    currency: [
      "Funds deposited. The System notes the transaction without joy.",
      "Coin and experience, dispensed at the legally required minimum.",
    ],
  };

  const RANKS = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

  function statLine() { return rand(FRAG.stat).replace('{n}', randInt(1, 8)); }

  function pickOptionals(budget) {
    const pool = ['flourish', 'provenance', 'disclaimer', 'sponsor'];
    const out = [];
    while (out.length < budget && pool.length) {
      out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return out;
  }

  // Build a description string for one inventory item.
  function describe(item) {
    const rank = Math.max(0, RANKS.indexOf(item.tier || 'common'));

    // currency stays short regardless of tier — it's a deposit, not a relic
    if (item.type === 'currency') {
      const p = item.payload || {};
      const amt = `+${p.coins || 0}\u{1FA99} +${p.xp || 0}\u26A1`;
      return `// APPRAISING…\n${rand(APPRAISAL.currency)}\n${amt}`;
    }

    const budget = [0, 1, 2, 3, 4][rank];
    const opt = pickOptionals(budget);
    const has = (k) => opt.includes(k);

    const lines = ['// APPRAISING…'];
    if (has('flourish')) lines.push(`${rand(FRAG.flourish)} ${item.name}.`);
    else lines.push(`${item.name}.`);

    lines.push(rand(APPRAISAL[item.type] || APPRAISAL.junk));

    // stat block — more lines at higher tier (junk gets at most one)
    const maxStats = item.type === 'junk' ? 1 : 1 + Math.min(rank, 2) + (Math.random() < 0.5 ? 1 : 0);
    const templates = [...FRAG.stat].sort(() => Math.random() - 0.5).slice(0, maxStats);
    const stats = templates.map((t) => t.replace('{n}', randInt(1, 8)));
    lines.push(stats.join(' · '));

    if (has('provenance')) lines.push(rand(FRAG.provenance));
    if (has('disclaimer')) lines.push(rand(FRAG.disclaimer));
    if (has('sponsor')) lines.push(`This appraisal sponsored by ${rand(GUEST_SPONSORS)}.`);
    lines.push(rand(FRAG.close));

    return lines.join('\n');
  }

  // Fill `description` on every item in a rolled box (mutates + returns).
  function appraiseAll(items) {
    for (const it of items) it.description = describe(it);
    return items;
  }

  const DCCNarrator = { describe, appraiseAll, HOUSE_SPONSOR, GUEST_SPONSORS, FRAG, APPRAISAL };
  if (typeof module !== 'undefined' && module.exports) module.exports = DCCNarrator;
  if (typeof window !== 'undefined') window.DCCNarrator = DCCNarrator;

})();
