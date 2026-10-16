window.RS = window.RS || {};

/**
 * Overrides de prueba. Pon enabled: true y edita lo que quieras.
 * IDs armas base: recurve_bow | bamis_cinder | fiendish_codex | bf_sword | aether_wisp
 * IDs evo:        kraken_slayer | sunfire_aegis | horizon_focus | infinity_edge | shurelyas_battlesong
 * IDs mejoras:    damage | cooldown | speed | hp | area | regen
 *
 * Deja null / [] para no forzar esa parte.
 *
 * Ejemplo evo rápida (Arco → Matakrakens):
 *   startWeapons: ["recurve_bow"], startPassives: ["cooldown"],
 *   startWeaponLevel: 5, startPassiveLevel: 1,
 *   forceLevelUpIds: ["kraken_slayer"],
 */
RS.DEBUG = {
  enabled: false,

  /** Reemplaza las armas iniciales del campeón. */
  startWeapons: ["aether_wisp"], // ej: ["recurve_bow"]

  /** Mejoras que ya tienes al empezar. */
  startPassives: ["speed", "area"], // ej: ["cooldown"]

  /** Nivel inicial de cada arma/mejora de start* (1–5). */
  startWeaponLevel: 5,
  startPassiveLevel: 1,

  /**
   * Al subir de nivel, las cartas salen SOLO de estos ids (arma, mejora o evo).
   * ej: ["kraken_slayer"] fuerza la carta de evolución si cumples requisitos.
   */
  forceLevelUpIds: null,

  /** Multiplicador de XP (ej: 10 para level-ups rápidos). */
  xpMult: 10,
};

/** Aplica startWeapons / startPassives / niveles iniciales. */
RS.applyDebugStart = (player) => {
  const d = RS.DEBUG;
  if (!d?.enabled) return;

  if (Array.isArray(d.startWeapons)) {
    player.weapons.length = 0;
    for (const id of d.startWeapons) RS.addWeapon(player, id);
  }

  const wLv = Math.max(1, Math.min(RS.MAX_LEVEL, d.startWeaponLevel || 1));
  if (wLv > 1) {
    for (const w of player.weapons) {
      w.level = wLv;
      RS.recalcWeapon(player, w);
    }
  }

  if (Array.isArray(d.startPassives)) {
    for (const id of d.startPassives) RS.addPassive(player, id);
  }

  const pLv = Math.max(1, Math.min(RS.MAX_LEVEL, d.startPassiveLevel || 1));
  if (pLv > 1) {
    for (const pas of player.passives) {
      pas.level = pLv;
    }
    RS.recalcPlayer(player);
  }
};

/** Filtra / arma cartas de level-up según forceLevelUpIds. */
RS.debugLevelUpChoices = (player, count, pool) => {
  const ids = RS.DEBUG?.forceLevelUpIds;
  if (!RS.DEBUG?.enabled || !Array.isArray(ids) || !ids.length) return null;

  const out = [];
  for (const id of ids) {
    if (out.length >= count) break;
    const matches = pool.filter((c) => c.id === id);
    // preferir evolución si está disponible (mismo id que resultWeapon)
    const evo = matches.find((c) => c.kind === "evolve");
    const levelUp = matches.find(
      (c) => c.kind === "weapon_level" || c.kind === "mejora_level"
    );
    const neu = matches.find(
      (c) => c.kind === "new_weapon" || c.kind === "mejora"
    );
    const pick = evo || levelUp || neu;
    if (pick && !out.includes(pick)) out.push(pick);
  }
  return out;
};
