window.RS = window.RS || {};

RS.createWeaponInstance = (weaponId, level = 1) => {
  const def = RS.weaponById(weaponId);
  if (!def) return null;
  return {
    id: def.id,
    level,
    cd: 0,
    damage: 0,
    cooldown: 0,
    range: 0,
    auraRadius: 0,
    orbitRadius: 0,
    orbitSpeed: 0,
    meleeArc: 0,
    projectileSpeed: 0,
    projectileRadius: 0,
    projectiles: 1,
    orbitAngle: 0,
    orbitHitCd: new Map(),
  };
};

RS.addWeapon = (player, weaponId) => {
  if (player.weapons.some((w) => w.id === weaponId)) return false;
  if (player.weapons.length >= RS.MAX_WEAPONS) return false;
  const inst = RS.createWeaponInstance(weaponId, 1);
  if (!inst) return false;
  player.weapons.push(inst);
  RS.recalcWeapon(player, inst);
  return true;
};

RS.levelWeapon = (player, weaponId) => {
  const inst = player.weapons.find((w) => w.id === weaponId);
  const def = RS.weaponById(weaponId);
  if (!inst || !def || inst.level >= def.maxLevel) return false;
  inst.level += 1;
  RS.recalcWeapon(player, inst);
  return true;
};

/**
 * Bonos acumulados del arma (solo esa arma).
 * Proyectil / orbe:
 *   2 +1 proy | 3 +40% dmg | 4 +30% cadencia | 5 +1 proy, +30% dmg, +15% cadencia
 * Aura:
 *   2 +40% área | 3 +40% dmg | 4 +40% cadencia | 5 +30% área, +30% dmg, +15% cadencia
 * Melee:
 *   2 +20% dmg | 3 +1 triángulo | 4 +20% cadencia | 5 +20% dmg, +15% cadencia, +1 triángulo
 * Orbital:
 *   2 +1 orb | 3 +20% dmg | 4 +1 orb, +10% giro | 5 +1 orb, +15% dmg, +10% giro
 */
RS.weaponLevelMods = (type, level) => {
  const L = level || 1;
  const mods = {
    damage: 0,
    cadence: 0,
    area: 0,
    projectiles: 0,
    spin: 0,
    meleeWedges: 0,
  };

  if (type === "projectile" || type === "orb") {
    if (L >= 2) mods.projectiles += 1;
    if (L >= 3) mods.damage += 0.4;
    if (L >= 4) mods.cadence += 0.3;
    if (L >= 5) {
      mods.projectiles += 1;
      mods.damage += 0.3;
      mods.cadence += 0.15;
    }
    return mods;
  }

  if (type === "aura") {
    if (L >= 2) mods.area += 0.4;
    if (L >= 3) mods.damage += 0.4;
    if (L >= 4) mods.cadence += 0.4;
    if (L >= 5) {
      mods.area += 0.3;
      mods.damage += 0.3;
      mods.cadence += 0.15;
    }
    return mods;
  }

  if (type === "melee") {
    if (L >= 2) mods.damage += 0.2;
    if (L >= 3) mods.meleeWedges += 1;
    if (L >= 4) mods.cadence += 0.2;
    if (L >= 5) {
      mods.damage += 0.2;
      mods.cadence += 0.15;
      mods.meleeWedges += 1;
    }
    return mods;
  }

  if (type === "orbital") {
    if (L >= 2) mods.projectiles += 1;
    if (L >= 3) mods.damage += 0.2;
    if (L >= 4) {
      mods.projectiles += 1;
      mods.spin += 0.1;
    }
    if (L >= 5) {
      mods.projectiles += 1;
      mods.damage += 0.15;
      mods.spin += 0.1;
    }
    return mods;
  }

  return mods;
};

/** Texto del bono al subir A este nivel (delta de ese nivel). */
RS.weaponLevelUpText = (type, toLevel) => {
  const L = toLevel;
  if (type === "projectile") {
    if (L === 2) return "+1 proyectil";
    if (L === 3) return "+40% daño de esta arma";
    if (L === 4) return "+30% cadencia de esta arma";
    if (L === 5) return "+1 proyectil · +30% daño · +15% cadencia";
  }
  if (type === "orb") {
    if (L === 2) return "+1 hechizo";
    if (L === 3) return "+40% daño de esta arma";
    if (L === 4) return "+30% cadencia de esta arma";
    if (L === 5) return "+1 hechizo · +30% daño · +15% cadencia";
  }
  if (type === "aura") {
    if (L === 2) return "+40% área de esta arma";
    if (L === 3) return "+40% daño de esta arma";
    if (L === 4) return "+40% cadencia de esta arma";
    if (L === 5) return "+30% área · +30% daño · +15% cadencia";
  }
  if (type === "melee") {
    if (L === 2) return "+20% daño de esta arma";
    if (L === 3) return "+1 triángulo de tajo";
    if (L === 4) return "+20% cadencia de esta arma";
    if (L === 5) return "+20% daño · +15% cadencia · +1 triángulo de tajo";
  }
  if (type === "orbital") {
    if (L === 2) return "+1 orbital";
    if (L === 3) return "+20% daño";
    if (L === 4) return "+1 orbital · +10% velocidad de giro";
    if (L === 5) return "+1 orbital · +15% daño · +10% giro";
  }
  return `Sube a nivel ${L}`;
};

RS.recalcWeapon = (player, inst) => {
  const def = RS.weaponById(inst.id);
  if (!def) return;
  const b = def.base;
  const mods = RS.weaponLevelMods(def.type, inst.level);
  const dmgMult = player.damageMult || 1;
  const cdMult = player.cooldownMult || 1;
  const areaMult = player.areaMult || 1;

  inst.damage = b.damage * (1 + mods.damage) * dmgMult;
  inst.cooldown = Math.max(0.12, b.cooldown * (1 - mods.cadence) * cdMult);

  if (def.type === "aura") {
    inst.auraRadius = (b.auraRadius || 60) * (1 + mods.area) * areaMult;
  } else if (def.type === "orbital") {
    // área solo agranda la brizna; la distancia de órbita no cambia
    inst.orbitRadius = b.orbitRadius || 55;
    inst.orbitSpeed = (b.orbitSpeed || 2.8) * (1 + mods.spin);
    inst.projectileRadius = (b.projectileRadius || 8) * (1 + mods.area) * areaMult;
    inst.projectiles = (b.projectiles || 1) + mods.projectiles;
  } else if (def.type === "melee") {
    const wedges = 1 + (mods.meleeWedges || 0);
    inst.range = (b.range || 70) * (1 + mods.area) * areaMult;
    inst.meleeArc = Math.min(
      Math.PI * 1.5,
      (b.meleeArc || 1.05) * wedges * (1 + mods.area * 0.15)
    );
  } else {
    // projectile + orb
    inst.range = (b.range || 300) * areaMult;
    inst.projectileSpeed = b.projectileSpeed || 500;
    inst.projectileRadius = (b.projectileRadius || 5) * areaMult;
    inst.projectiles = (b.projectiles || 1) + mods.projectiles;
  }
};

RS.recalcAllWeapons = (player) => {
  for (const w of player.weapons) RS.recalcWeapon(player, w);
};

RS.hasWeapon = (player, weaponId) => player.weapons.some((w) => w.id === weaponId);

RS.updateWeapons = (state, dt) => {
  const p = state.player;
  if (p.hp <= 0) return;

  for (const w of p.weapons) {
    const def = RS.weaponById(w.id);
    if (!def) continue;

    if (def.type === "orbital") {
      RS.updateOrbitalWeapon(state, w, def, dt);
      continue;
    }

    if (w.cd > 0) w.cd -= dt;
    if (w.cd <= 0) RS.fireWeapon(state, w);
  }

  if (state.slashes) {
    for (const s of state.slashes) s.life -= dt;
    state.slashes = state.slashes.filter((s) => s.life > 0);
  }
};

RS.updateOrbitalWeapon = (state, w, def, dt) => {
  const p = state.player;
  w.orbitAngle = (w.orbitAngle || 0) + (w.orbitSpeed || 2.5) * dt;
  const count = Math.max(1, w.projectiles || 1);
  const hitEvery = Math.max(0.2, w.cooldown * 0.85);

  for (let i = 0; i < count; i++) {
    const a = w.orbitAngle + (i / count) * Math.PI * 2;
    const ox = p.x + Math.cos(a) * w.orbitRadius;
    const oy = p.y + Math.sin(a) * w.orbitRadius;

    for (const e of state.enemies) {
      if (e.hp <= 0) continue;
      if (RS.dist(ox, oy, e.x, e.y) > w.projectileRadius + e.radius) continue;
      const key = `${w.id}:${i}:${e.x.toFixed(0)},${e.y.toFixed(0)}`;
      // per-enemy cooldown keyed by enemy object
      const prev = w.orbitHitCd.get(e) || 0;
      if (prev > 0) continue;
      RS.Combat.hurtEnemy(state, e, w.damage);
      w.orbitHitCd.set(e, hitEvery);
    }
  }

  for (const [e, t] of [...w.orbitHitCd.entries()]) {
    const next = t - dt;
    if (next <= 0 || e.hp <= 0) w.orbitHitCd.delete(e);
    else w.orbitHitCd.set(e, next);
  }
};

RS.fireWeapon = (state, w) => {
  const def = RS.weaponById(w.id);
  if (!def) return;
  const p = state.player;

  if (def.type === "aura") {
    for (const e of state.enemies) {
      if (RS.dist(p.x, p.y, e.x, e.y) <= w.auraRadius + e.radius) {
        RS.Combat.hurtEnemy(state, e, w.damage);
      }
    }
    w.cd = w.cooldown;
    return;
  }

  if (def.type === "projectile") {
    const target = RS.Combat.nearestEnemy(state, w.range);
    if (!target) return;
    RS.Weapons._shoot(state, w, def, RS.norm(target.x - p.x, target.y - p.y));
    w.cd = w.cooldown;
    return;
  }

  if (def.type === "orb") {
    const target = RS.Combat.nearestEnemy(state, w.range * 1.2);
    const dir = target
      ? RS.norm(target.x - p.x, target.y - p.y)
      : p.facing.x || p.facing.y
        ? p.facing
        : { x: 1, y: 0 };
    RS.Weapons._shootOrb(state, w, def, dir);
    w.cd = w.cooldown;
    return;
  }

  if (def.type === "melee") {
    RS.Weapons._slash(state, w, def);
    w.cd = w.cooldown;
  }
};

RS.Weapons = {
  _spreadAngles(count, step) {
    if (count <= 1) return [0];
    const angles = [0];
    for (let k = 1; angles.length < count; k++) {
      angles.push(k * step);
      if (angles.length < count) angles.push(-k * step);
    }
    return angles;
  },

  _shoot(state, w, def, baseDir) {
    const p = state.player;
    const count = w.projectiles || 1;
    const angles = this._spreadAngles(count, 0.14);
    for (const t of angles) {
      const c = Math.cos(t);
      const s = Math.sin(t);
      const dir = RS.norm(baseDir.x * c - baseDir.y * s, baseDir.x * s + baseDir.y * c);
      state.projectiles.push(
        RS.createProjectile({
          x: p.x,
          y: p.y,
          vx: dir.x * w.projectileSpeed,
          vy: dir.y * w.projectileSpeed,
          radius: w.projectileRadius,
          damage: w.damage,
          life: w.range / w.projectileSpeed + 0.15,
          color: def.color,
          kind: "arrow",
        })
      );
    }
  },

  _shootOrb(state, w, def, baseDir) {
    const p = state.player;
    const count = w.projectiles || 1;
    const angles = this._spreadAngles(count, 0.22);
    const trip = (w.range / w.projectileSpeed) * 2 + 1.5;
    for (const t of angles) {
      const c = Math.cos(t);
      const s = Math.sin(t);
      const dir = RS.norm(baseDir.x * c - baseDir.y * s, baseDir.x * s + baseDir.y * c);
      state.projectiles.push(
        RS.createProjectile({
          x: p.x,
          y: p.y,
          vx: dir.x * w.projectileSpeed,
          vy: dir.y * w.projectileSpeed,
          radius: w.projectileRadius,
          damage: w.damage,
          life: trip,
          color: def.color,
          kind: "orb",
          phase: "out",
          speed: w.projectileSpeed,
          maxDist: w.range,
        })
      );
    }
  },

  _slash(state, w, def) {
    const p = state.player;
    const range = w.range || 70;
    const arc = w.meleeArc || 1.05;
    const target = RS.Combat.nearestEnemy(state, 1e9);
    const facing = target
      ? RS.norm(target.x - p.x, target.y - p.y)
      : p.facing.x || p.facing.y
        ? p.facing
        : { x: 1, y: 0 };

    state.slashes = state.slashes || [];
    state.slashes.push({
      x: p.x,
      y: p.y,
      facing: { ...facing },
      range,
      arc,
      color: def.color,
      life: 0.12,
      maxLife: 0.12,
    });

    const face = Math.atan2(facing.y, facing.x);
    for (const e of state.enemies) {
      if (e.hp <= 0) continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist > range + e.radius) continue;
      const ang = Math.atan2(dy, dx);
      let diff = ang - face;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      if (Math.abs(diff) <= arc / 2) {
        RS.Combat.hurtEnemy(state, e, w.damage);
      }
    }
  },
};

RS.drawWeaponAuras = (ctx, player) => {
  const t = typeof RS.now === "function" ? RS.now() : performance.now() / 1000;
  for (const w of player.weapons) {
    const def = RS.weaponById(w.id);
    if (!def || def.type !== "aura") continue;

    // borde base
    ctx.beginPath();
    ctx.arc(player.x, player.y, w.auraRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 140, 66, 0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // heatwave: anillos que se expanden y se desvanecen
    for (let i = 0; i < 3; i++) {
      const phase = (t * 0.7 + i / 3) % 1;
      const r = w.auraRadius * (0.25 + phase * 0.75);
      ctx.beginPath();
      ctx.arc(player.x, player.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 120, 40, ${0.32 * (1 - phase)})`;
      ctx.lineWidth = 2.5 * (1 - phase * 0.5);
      ctx.stroke();
    }

    // glow suave interior
    const g = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, w.auraRadius);
    g.addColorStop(0, "rgba(255, 140, 66, 0.08)");
    g.addColorStop(0.7, "rgba(255, 100, 30, 0.05)");
    g.addColorStop(1, "rgba(255, 80, 20, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(player.x, player.y, w.auraRadius, 0, Math.PI * 2);
    ctx.fill();
  }
};

RS.drawOrbitals = (ctx, player) => {
  for (const w of player.weapons) {
    const def = RS.weaponById(w.id);
    if (!def || def.type !== "orbital") continue;
    const count = Math.max(1, w.projectiles || 1);
    for (let i = 0; i < count; i++) {
      const a = (w.orbitAngle || 0) + (i / count) * Math.PI * 2;
      const ox = player.x + Math.cos(a) * w.orbitRadius;
      const oy = player.y + Math.sin(a) * w.orbitRadius;
      const r = w.projectileRadius;
      // brizna etérea: halo + núcleo
      ctx.beginPath();
      ctx.arc(ox, oy, r + 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(125, 211, 252, 0.25)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fillStyle = def.color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ox - r * 0.25, oy - r * 0.25, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.fill();
    }
  }
};

RS.drawSlashes = (ctx, state) => {
  if (!state.slashes) return;
  for (const s of state.slashes) {
    const a = 1 - s.life / s.maxLife;
    const face = Math.atan2(s.facing.y, s.facing.x);
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.arc(s.x, s.y, s.range, face - s.arc / 2, face + s.arc / 2);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.globalAlpha = 0.4 * (1 - a);
    ctx.fill();
    ctx.globalAlpha = 0.55 * (1 - a);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
};
