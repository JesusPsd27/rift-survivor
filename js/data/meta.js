window.RS = window.RS || {};

/**
 * Mejoras permanentes (meta) compradas con oro entre partidas.
 * Se aplican al crear el jugador, encima de las mejoras de la run.
 */
RS.META_UPGRADES = [
  {
    id: "damage",
    name: "Daño",
    desc: "+5% daño por rango (máx +25%)",
    color: "#f87171",
    maxRank: 5,
    perRank: 0.05,
    unit: "pct",
    baseCost: 100,
  },
  {
    id: "cooldown",
    name: "Cadencia",
    desc: "-3% cooldown por rango (máx -15%)",
    color: "#60a5fa",
    maxRank: 5,
    perRank: 0.03,
    unit: "pct_neg",
    baseCost: 120,
  },
  {
    id: "hp",
    name: "Vitalidad",
    desc: "+12 HP máximo por rango (máx +60)",
    color: "#fbbf24",
    maxRank: 5,
    perRank: 12,
    unit: "hp",
    baseCost: 100,
  },
  {
    id: "regen",
    name: "Regeneración",
    desc: "+0.4 HP/s por rango (máx +2)",
    color: "#4ade80",
    maxRank: 5,
    perRank: 0.4,
    unit: "regen",
    baseCost: 110,
  },
  {
    id: "area",
    name: "Área",
    desc: "+5% área por rango (máx +25%)",
    color: "#a78bfa",
    maxRank: 5,
    perRank: 0.05,
    unit: "pct",
    baseCost: 100,
  },
  {
    id: "speed",
    name: "Movilidad",
    desc: "+5% velocidad por rango (máx +25%)",
    color: "#34d399",
    maxRank: 5,
    perRank: 0.05,
    unit: "pct",
    baseCost: 100,
  },
];

RS.metaById = (id) => RS.META_UPGRADES.find((m) => m.id === id);

/** Bonos totales según rangos guardados. */
RS.getMetaBonuses = () => {
  const ranks = RS.Save.load().meta || {};
  const out = { damage: 0, cooldown: 0, speed: 0, hp: 0, area: 0, regen: 0 };
  for (const def of RS.META_UPGRADES) {
    const r = Math.min(def.maxRank, ranks[def.id] || 0);
    out[def.id] = def.perRank * r;
  }
  return out;
};

RS.metaRank = (id) => {
  const def = RS.metaById(id);
  if (!def) return 0;
  return Math.min(def.maxRank, RS.Save.load().meta?.[id] || 0);
};

/** Costo del siguiente rango (0-index: precio para comprar rank actual+1). */
RS.metaNextCost = (id) => {
  const def = RS.metaById(id);
  if (!def) return 0;
  const rank = RS.metaRank(id);
  if (rank >= def.maxRank) return 0;
  return def.baseCost * (rank + 1);
};

RS.metaSpentTotal = () => {
  let spent = 0;
  for (const def of RS.META_UPGRADES) {
    const rank = RS.metaRank(def.id);
    for (let i = 0; i < rank; i++) spent += def.baseCost * (i + 1);
  }
  return spent;
};
