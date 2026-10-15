window.RS = window.RS || {};

RS.UPGRADES = [
  {
    id: "damage",
    name: "Daño +",
    desc: "+20% daño de ataque",
    apply(p) {
      p.damage *= 1.2;
    },
  },
  {
    id: "cooldown",
    name: "Cadencia +",
    desc: "-12% cooldown de ataque",
    apply(p) {
      p.cooldown *= 0.88;
    },
  },
  {
    id: "speed",
    name: "Movilidad +",
    desc: "+12% velocidad de movimiento",
    apply(p) {
      p.speed *= 1.12;
    },
  },
  {
    id: "hp",
    name: "Vitalidad +",
    desc: "+25 HP máximo y cura esa cantidad",
    apply(p) {
      p.maxHp += 25;
      p.hp = Math.min(p.maxHp, p.hp + 25);
    },
  },
  {
    id: "area",
    name: "Área +",
    desc: "+18% alcance / radio de ataque",
    apply(p) {
      if (p.auraRadius) p.auraRadius *= 1.18;
      if (p.range) p.range *= 1.18;
      if (p.projectileRadius) p.projectileRadius *= 1.1;
    },
  },
  {
    id: "projectiles",
    name: "Multishot",
    desc: "+1 proyectil (Ashe / Lux)",
    apply(p) {
      p.projectileCount = (p.projectileCount || 1) + 1;
    },
  },
  {
    id: "regen",
    name: "Regeneración",
    desc: "+1.5 HP/s",
    apply(p) {
      p.regen += 1.5;
    },
  },
];
