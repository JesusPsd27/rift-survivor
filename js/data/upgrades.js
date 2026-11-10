window.RS = window.RS || {};

/**
 * Mejoras: inventario máx. MAX_PASSIVES, cada una hasta MAX_LEVEL.
 * perLevel = bonus por nivel (fracción o unidades absolutas).
 */
RS.UPGRADES = [
  {
    id: "damage",
    name: "Daño",
    desc: "+15% daño de todas las armas",
    color: "#f87171",
    perLevel: 0.15,
    unit: "pct",
  },
  {
    id: "cooldown",
    name: "Cooldown",
    desc: "-7% cooldown de todas las armas",
    color: "#60a5fa",
    perLevel: 0.07,
    unit: "pct_neg",
  },
  {
    id: "speed",
    name: "Movilidad",
    desc: "+5% de la velocidad base",
    color: "#34d399",
    perLevel: 0.05,
    unit: "pct",
  },
  {
    id: "hp",
    name: "Vitalidad",
    desc: "+15 HP máximo (cura al subir)",
    color: "#fbbf24",
    perLevel: 15,
    unit: "hp",
  },
  {
    id: "size",
    name: "Tamaño",
    desc: "+7% alcance / radio / tamaño",
    color: "#a78bfa",
    perLevel: 0.07,
    unit: "pct",
  },
  {
    id: "regen",
    name: "Regeneración",
    desc: "+0.5 HP/s",
    color: "#4ade80",
    perLevel: 0.5,
    unit: "regen",
  },
  {
    id: "armor",
    name: "Armadura",
    desc: "+6% reducción de daño",
    color: "#94a3b8",
    perLevel: 0.06,
    unit: "pct",
  },
  {
    id: "magnet",
    name: "Imán",
    desc: "+20% radio para atraer orbes",
    color: "#22d3ee",
    perLevel: 0.2,
    unit: "pct",
  },
  {
    id: "xp",
    name: "Experiencia",
    desc: "+6% experiencia",
    color: "#c084fc",
    perLevel: 0.06,
    unit: "pct",
  },
];

RS.upgradeById = (id) => RS.UPGRADES.find((u) => u.id === id);

RS.getPassiveLevel = (player, id) => {
  const p = player.passives.find((x) => x.id === id);
  return p ? p.level : 0;
};

RS.hasPassive = (player, id) => RS.getPassiveLevel(player, id) > 0;

RS.addPassive = (player, id) => {
  if (RS.hasPassive(player, id)) return false;
  if (player.passives.length >= RS.MAX_PASSIVES) return false;
  if (!RS.upgradeById(id)) return false;
  player.passives.push({ id, level: 1 });
  RS.recalcPlayer(player);
  return true;
};

RS.levelPassive = (player, id) => {
  const p = player.passives.find((x) => x.id === id);
  if (!p || p.level >= RS.MAX_LEVEL) return false;
  p.level += 1;
  RS.recalcPlayer(player);
  return true;
};
