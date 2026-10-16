window.RS = window.RS || {};

RS.MAX_WEAPONS = 4;
RS.MAX_PASSIVES = 4;
/** Nivel máximo de armas y mejoras. */
RS.MAX_LEVEL = 5;

/**
 * Tipos de arma (comportamiento en systems/weapons.js).
 * - projectile: bala hacia el enemigo
 * - aura: daño en radio alrededor
 * - orb: proyectil que va y vuelve
 * - orbital: orbes que giran alrededor del jugador
 * - melee: tajo en cono hacia donde miras
 */
RS.WEAPON_TYPES = {
  projectile: { id: "projectile", label: "Proyectil" },
  aura: { id: "aura", label: "Aura" },
  orb: { id: "orb", label: "Orbe (boomerang)" },
  orbital: { id: "orbital", label: "Orbital" },
  melee: { id: "melee", label: "Melee" },
};

/**
 * Armas base + evoluciones (ítems LoL como referencia; no assets oficiales).
 * evolvedOnly: no sale como arma nueva en level-up (solo por evolución).
 */
RS.WEAPONS = [
  // —— Bases ——
  {
    id: "recurve_bow",
    name: "Arco Recurvo",
    desc: "Dispara flechas al enemigo más cercano",
    type: "projectile",
    color: "#c4a574",
    maxLevel: RS.MAX_LEVEL,
    base: {
      damage: 12,
      cooldown: 0.55,
      range: 420,
      projectileSpeed: 520,
      projectileRadius: 7,
      projectiles: 1,
    },
  },
  {
    id: "bamis_cinder",
    name: "Ceniza de Bami",
    desc: "Aura de inmolación a tu alrededor",
    type: "aura",
    color: "#ff8c42",
    maxLevel: RS.MAX_LEVEL,
    base: {
      damage: 8,
      cooldown: 0.35,
      auraRadius: 70,
    },
  },
  {
    id: "fiendish_codex",
    name: "Códice Diabólico",
    desc: "Lanza un hechizo que va y vuelve",
    type: "orb",
    color: "#a78bfa",
    maxLevel: RS.MAX_LEVEL,
    base: {
      damage: 16,
      cooldown: 1.05,
      range: 320,
      projectileSpeed: 380,
      projectileRadius: 10,
      projectiles: 1,
    },
  },
  {
    id: "bf_sword",
    name: "Espadon",
    desc: "Tajo hacia el enemigo más cercano",
    type: "melee",
    color: "#d4dce8",
    maxLevel: RS.MAX_LEVEL,
    base: {
      damage: 22,
      cooldown: 0.7,
      range: 100,
      meleeArc: 0.9,
    },
  },
  {
    id: "aether_wisp",
    name: "Brizna de Éter",
    desc: "Espíritus que orbitan y dañan al tocar",
    type: "orbital",
    color: "#7dd3fc",
    maxLevel: RS.MAX_LEVEL,
    base: {
      damage: 10,
      cooldown: 0.45,
      orbitRadius: 140,
      orbitSpeed: 3,
      projectileRadius: 13,
      projectiles: 1,
    },
  },

  // —— Evoluciones (mecánica = misma por ahora; stats más altas) ——
  {
    id: "kraken_slayer",
    name: "Matakrakens",
    desc: "Evolución del Arco Recurvo · flechas más fuertes y rápidas",
    type: "projectile",
    color: "#38bdf8",
    evolvedOnly: true,
    maxLevel: RS.MAX_LEVEL,
    base: {
      damage: 20,
      cooldown: 0.42,
      range: 460,
      projectileSpeed: 600,
      projectileRadius: 8,
      projectiles: 2,
    },
  },
  {
    id: "sunfire_aegis",
    name: "Égida de Fuego Solar",
    desc: "Evolución de Ceniza de Bami · aura más amplia y letal",
    type: "aura",
    color: "#f97316",
    evolvedOnly: true,
    maxLevel: RS.MAX_LEVEL,
    base: {
      damage: 14,
      cooldown: 0.28,
      auraRadius: 100,
    },
  },
  {
    id: "horizon_focus",
    name: "Enfoque del Horizonte",
    desc: "Evolución del Códice Diabólico · hechizo más largo y potente",
    type: "orb",
    color: "#e879f9",
    evolvedOnly: true,
    maxLevel: RS.MAX_LEVEL,
    base: {
      damage: 26,
      cooldown: 0.85,
      range: 400,
      projectileSpeed: 440,
      projectileRadius: 13,
      projectiles: 1,
    },
  },
  {
    id: "infinity_edge",
    name: "Filo Infinito",
    desc: "Evolución del Espadon · tajos devastadores",
    type: "melee",
    color: "#fbbf24",
    evolvedOnly: true,
    maxLevel: RS.MAX_LEVEL,
    base: {
      damage: 36,
      cooldown: 0.55,
      range: 118,
      meleeArc: 1.05,
    },
  },
  {
    id: "shurelyas_battlesong",
    name: "Canto Bélico de Shurelya",
    desc: "Evolución de Brizna de Éter · más briznas y giro veloz",
    type: "orbital",
    color: "#faaf24",
    evolvedOnly: true,
    maxLevel: RS.MAX_LEVEL,
    base: {
      damage: 16,
      cooldown: 0.35,
      orbitRadius: 150,
      orbitSpeed: 3.8,
      projectileRadius: 16,
      projectiles: 2,
    },
  },
];

RS.weaponById = (id) => RS.WEAPONS.find((w) => w.id === id);
