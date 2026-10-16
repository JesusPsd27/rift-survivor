window.RS = window.RS || {};

RS.createPlayer = (champ, x, y) => {
  const p = {
    id: champ.id,
    name: champ.name,
    color: champ.color,
    x,
    y,
    radius: 20,
    facing: { x: 1, y: 0 },
    base: {
      maxHp: champ.hp,
      speed: champ.speed,
    },
    weapons: [],
    passives: [],
    xp: 0,
    xpToLevel: 5,
    level: 1,
    invuln: 0,
    hp: champ.hp,
    maxHp: champ.hp,
    speed: champ.speed,
    regen: 0,
    damageMult: 1,
    cooldownMult: 1,
    areaMult: 1,
  };

  for (const wid of champ.startWeapons || []) {
    RS.addWeapon(p, wid);
  }
  RS.recalcPlayer(p);
  if (typeof RS.applyDebugStart === "function") RS.applyDebugStart(p);
  return p;
};

RS.recalcPlayer = (p) => {
  const b = p.base;
  const rate = (id) => RS.upgradeById(id)?.perLevel || 0;
  const lv = (id) => RS.getPassiveLevel(p, id);
  const m = typeof RS.getMetaBonuses === "function" ? RS.getMetaBonuses() : {};

  p.damageMult = (1 + rate("damage") * lv("damage")) * (1 + (m.damage || 0));
  p.cooldownMult = Math.max(
    0.35,
    (1 - rate("cooldown") * lv("cooldown")) * (1 - (m.cooldown || 0))
  );
  p.areaMult = (1 + rate("area") * lv("area")) * (1 + (m.area || 0));
  p.speed = b.speed * (1 + rate("speed") * lv("speed")) * (1 + (m.speed || 0));
  p.regen = rate("regen") * lv("regen") + (m.regen || 0);

  const newMax = b.maxHp + rate("hp") * lv("hp") + (m.hp || 0);
  if (newMax > p.maxHp) p.hp += newMax - p.maxHp;
  p.maxHp = newMax;
  p.hp = RS.clamp(p.hp, 0, p.maxHp);

  RS.recalcAllWeapons(p);
};

RS.formatStat = (n, digits = 1) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return "0";
  if (Math.abs(v - Math.round(v)) < 0.05) return String(Math.round(v));
  return v.toFixed(digits);
};

/** Bonus acumulado de una mejora según nivel (usa perLevel de UPGRADES). */
RS.passiveAccumText = (id, level) => {
  const def = RS.upgradeById(id);
  if (!def) return "";
  const total = (def.perLevel || 0) * (level || 0);
  switch (def.unit) {
    case "pct":
      return `+${RS.formatStat(total * 100)}%`;
    case "pct_neg":
      return `-${RS.formatStat(total * 100)}%`;
    case "hp":
      return `+${RS.formatStat(total, 0)} HP`;
    case "regen":
      return `+${RS.formatStat(total)} /s`;
    default:
      return "";
  }
};

/** Panel de pausa: stats base | armas + mejoras. */
RS.pauseStatColumns = (p) => {
  const base = [
    {
      icon: "hp",
      color: "#3d9a6a",
      label: "Vitalidad",
      value: `${RS.formatStat(p.hp, 0)} / ${RS.formatStat(p.maxHp, 0)}`,
    },
    {
      icon: "regen",
      color: "#4ade80",
      label: "Regeneración",
      value: `${RS.formatStat(p.regen)} /s`,
    },
    {
      icon: "speed",
      color: "#34d399",
      label: "Movilidad",
      value: RS.formatStat(p.speed, 0),
    },
    {
      icon: "damage",
      color: "#f87171",
      label: "Daño",
      value: `×${RS.formatStat(p.damageMult, 2)}`,
    },
    {
      icon: "cooldown",
      color: "#60a5fa",
      label: "Cadencia",
      value: `×${RS.formatStat(p.cooldownMult, 2)}`,
    },
    {
      icon: "area",
      color: "#a78bfa",
      label: "Área",
      value: `×${RS.formatStat(p.areaMult, 2)}`,
    },
  ];

  const weapons = [];
  for (const w of p.weapons) {
    const def = RS.weaponById(w.id);
    weapons.push({
      icon: "weapon",
      color: def?.color || "#64748b",
      label: def?.name || w.id,
      value: `Nv ${w.level} · ${RS.formatStat(w.damage)} dmg`,
    });
  }
  const mejoras = [];
  for (const pas of p.passives) {
    const def = RS.upgradeById(pas.id);
    const accum = RS.passiveAccumText(pas.id, pas.level);
    mejoras.push({
      icon: "mejora",
      color: def?.color || "#64748b",
      label: def?.name || pas.id,
      value: accum ? `Nv ${pas.level} · ${accum}` : `Nv ${pas.level}`,
    });
  }
  return { base, weapons, mejoras };
};

RS.updatePlayer = (p, dt, world) => {
  const mv = RS.Input.moveVector();
  if (mv.x || mv.y) {
    p.x += mv.x * p.speed * dt;
    p.y += mv.y * p.speed * dt;
    p.facing = mv;
  }

  const half = world.size / 2;
  p.x = RS.clamp(p.x, -half + p.radius, half - p.radius);
  p.y = RS.clamp(p.y, -half + p.radius, half - p.radius);

  if (p.regen > 0 && p.hp > 0) {
    p.hp = Math.min(p.maxHp, p.hp + p.regen * dt);
  }
  if (p.invuln > 0) p.invuln -= dt;
};

RS.drawPlayer = (ctx, p) => {
  RS.drawWeaponAuras(ctx, p);
  RS.drawOrbitals(ctx, p);

  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
  ctx.fillStyle = p.invuln > 0 ? "#ffffff" : p.color;
  ctx.fill();
  ctx.strokeStyle = "#0b1220";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + p.facing.x * (p.radius + 8), p.y + p.facing.y * (p.radius + 8));
  ctx.strokeStyle = "#e8eef8";
  ctx.lineWidth = 3;
  ctx.stroke();
};
