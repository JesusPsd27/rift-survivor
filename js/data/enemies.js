window.RS = window.RS || {};

/**
 * weight = probabilidad relativa de spawn (minion 10 vs caster 4 vs brute 2
 * → ~62% / 25% / 13%).
 */
RS.ENEMY_TYPES = [
  {
    id: "minion",
    color: "#8b4a4a",
    hp: 28,
    speed: 95,
    radius: 17,
    damage: 8,
    xp: 1,
    weight: 10,
  },
  {
    id: "caster",
    color: "#7a5aa8",
    hp: 18,
    speed: 120,
    radius: 14,
    damage: 6,
    xp: 1,
    weight: 4,
    preferRange: 230,
    attackRange: 360,
    attackCooldown: 1.5,
    projectileSpeed: 260,
    projectileRange: 480,
    projectileRadius: 5,
    projectileColor: "#60a5fa",
  },
  {
    id: "brute",
    color: "#5a3a2a",
    hp: 70,
    speed: 70,
    radius: 25,
    damage: 14,
    xp: 2,
    weight: 2,
  },
];
