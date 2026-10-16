window.RS = window.RS || {};

/**
 * Evoluciones: arma al máximo + mejora requerida → arma evolucionada.
 * Referencias LoL (temática; sin assets oficiales).
 */
RS.EVOLUTIONS = [
  {
    id: "kraken_slayer",
    fromWeapon: "recurve_bow",
    requiresPassive: "cooldown",
    requiresPassiveLevel: 1,
    resultWeapon: "kraken_slayer",
    name: "Matakrakens",
  },
  {
    id: "sunfire_aegis",
    fromWeapon: "bamis_cinder",
    requiresPassive: "hp",
    requiresPassiveLevel: 1,
    resultWeapon: "sunfire_aegis",
    name: "Égida de Fuego Solar",
  },
  {
    id: "horizon_focus",
    fromWeapon: "fiendish_codex",
    requiresPassive: "damage",
    requiresPassiveLevel: 1,
    resultWeapon: "horizon_focus",
    name: "Enfoque del Horizonte",
  },
  {
    id: "infinity_edge",
    fromWeapon: "bf_sword",
    requiresPassive: "damage",
    requiresPassiveLevel: 1,
    resultWeapon: "infinity_edge",
    name: "Filo Infinito",
  },
  {
    id: "shurelyas_battlesong",
    fromWeapon: "aether_wisp",
    requiresPassive: "speed",
    requiresPassiveLevel: 1,
    resultWeapon: "shurelyas_battlesong",
    name: "Canto Bélico de Shurelya",
  },
];

RS.evolutionById = (id) => RS.EVOLUTIONS.find((e) => e.id === id);

/** True si ya tienes la evolución de esta arma base (no volver a ofrecerla). */
RS.hasEvolvedFrom = (player, baseWeaponId) => {
  for (const evo of RS.EVOLUTIONS) {
    if (evo.fromWeapon === baseWeaponId && RS.hasWeapon(player, evo.resultWeapon)) {
      return true;
    }
  }
  return false;
};

/** Texto de mejoras base→evo (para la carta de level-up). */
RS.evolutionUpgradeText = (evo) => {
  const from = RS.weaponById(evo.fromWeapon)?.base;
  const to = RS.weaponById(evo.resultWeapon)?.base;
  if (!from || !to) return RS.weaponById(evo.resultWeapon)?.desc || "Evolución";

  const parts = [];
  const pct = (a, b) => Math.round(((b - a) / a) * 100);

  if (to.damage > from.damage) parts.push(`+${pct(from.damage, to.damage)}% daño`);
  if (to.cooldown < from.cooldown) {
    parts.push(`-${Math.round((1 - to.cooldown / from.cooldown) * 100)}% cooldown`);
  }
  if ((to.range || 0) > (from.range || 0)) {
    parts.push(`+${pct(from.range, to.range)}% alcance`);
  }
  if ((to.auraRadius || 0) > (from.auraRadius || 0)) {
    parts.push(`+${pct(from.auraRadius, to.auraRadius)}% área`);
  }
  if ((to.meleeArc || 0) > (from.meleeArc || 0)) {
    parts.push(`+${pct(from.meleeArc, to.meleeArc)}% arco`);
  }
  if ((to.orbitSpeed || 0) > (from.orbitSpeed || 0)) {
    parts.push(`+${pct(from.orbitSpeed, to.orbitSpeed)}% giro`);
  }
  if ((to.projectileRadius || 0) > (from.projectileRadius || 0)) {
    parts.push(`+${pct(from.projectileRadius, to.projectileRadius)}% tamaño`);
  }
  if ((to.projectiles || 1) > (from.projectiles || 1)) {
    const extra = (to.projectiles || 1) - (from.projectiles || 1);
    const kind = RS.weaponById(evo.fromWeapon)?.type === "orbital" ? "orbital" : "proyectil";
    parts.push(`+${extra} ${kind}${extra > 1 ? "es" : ""}`);
  }
  if ((to.projectileSpeed || 0) > (from.projectileSpeed || 0)) {
    parts.push(`+${pct(from.projectileSpeed, to.projectileSpeed)}% vel. proyectil`);
  }

  return parts.length ? parts.join(" · ") : RS.weaponById(evo.resultWeapon)?.desc || "Evolución";
};

RS.canEvolve = (player, evo) => {
  if (!evo) return false;
  const w = player.weapons.find((x) => x.id === evo.fromWeapon);
  if (!w || w.level < (RS.weaponById(evo.fromWeapon)?.maxLevel || RS.MAX_LEVEL)) {
    return false;
  }
  const need = evo.requiresPassiveLevel ?? 1;
  if (RS.getPassiveLevel(player, evo.requiresPassive) < need) return false;
  if (RS.hasWeapon(player, evo.resultWeapon)) return false;
  return true;
};

/**
 * Si subir/obtener esta mejora desbloquea una evo (arma ya al máx.),
 * devuelve el nombre del arma base para el chip. Si no, null.
 */
RS.evoHintWeaponName = (player, passiveId) => {
  for (const evo of RS.EVOLUTIONS) {
    if (evo.requiresPassive !== passiveId) continue;
    if (RS.hasWeapon(player, evo.resultWeapon)) continue;
    const w = player.weapons.find((x) => x.id === evo.fromWeapon);
    if (!w) continue;
    const max = RS.weaponById(evo.fromWeapon)?.maxLevel || RS.MAX_LEVEL;
    if (w.level < max) continue;
    const need = evo.requiresPassiveLevel ?? 1;
    const have = RS.getPassiveLevel(player, passiveId);
    if (have >= need) continue;
    if (have + 1 < need) continue;
    return RS.weaponById(evo.fromWeapon)?.name || evo.fromWeapon;
  }
  return null;
};

/** Reemplaza el arma base por la evolucionada (nivel 1 de la forma evo). */
RS.applyEvolution = (player, evoId) => {
  const evo = RS.evolutionById(evoId);
  if (!evo || !RS.canEvolve(player, evo)) return false;
  const idx = player.weapons.findIndex((w) => w.id === evo.fromWeapon);
  if (idx < 0) return false;
  const next = RS.createWeaponInstance(evo.resultWeapon, 1);
  if (!next) return false;
  player.weapons[idx] = next;
  RS.recalcWeapon(player, next);
  return true;
};
