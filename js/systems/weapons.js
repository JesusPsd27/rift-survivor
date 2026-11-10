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
 *   2 +1 proy | 3 +25% dmg | 4 +30% Cooldown | 5 +15% dmg, +15% Cooldown
 * Aura:
 *   2 +40% tamaño | 3 +40% dmg | 4 +40% Cooldown | 5 +30% tamaño, +30% dmg, +15% Cooldown
 * Melee:
 *   2 +20% dmg | 3 +1 triángulo, +15% dmg | 4 +20% Cooldown | 5 +20% dmg, +15% Cooldown, +1 triángulo
 * Orbital:
 *   2 +1 orb | 3 +35% dmg | 4 +1 orb, +10% giro | 5 +1 orb, +25% dmg, +10% giro
 */
RS.weaponLevelMods = (type, level) => {
  const L = level || 1;
  const mods = {
    damage: 0,
    cadence: 0,
    size: 0,
    projectiles: 0,
    spin: 0,
    meleeWedges: 0,
  };

  if (type === "projectile" || type === "orb") {
    if (L >= 2) mods.projectiles += 1;
    if (L >= 3) mods.damage += 0.25;
    if (L >= 4) mods.cadence += 0.3;
    if (L >= 5) {
      mods.damage += 0.15;
      mods.cadence += 0.15;
    }
    return mods;
  }

  if (type === "aura") {
    if (L >= 2) mods.size += 0.4;
    if (L >= 3) mods.damage += 0.4;
    if (L >= 4) mods.cadence += 0.4;
    if (L >= 5) {
      mods.size += 0.3;
      mods.damage += 0.3;
      mods.cadence += 0.15;
    }
    return mods;
  }

  if (type === "melee") {
    if (L >= 2) mods.damage += 0.2;
    if (L >= 3) {
      mods.meleeWedges += 1;
      mods.damage += 0.15;
    }
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
    if (L >= 3) mods.damage += 0.35;
    if (L >= 4) {
      mods.projectiles += 1;
      mods.spin += 0.1;
    }
    if (L >= 5) {
      mods.projectiles += 1;
      mods.damage += 0.25;
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
    if (L === 3) return "+25% daño de esta arma";
    if (L === 4) return "+30% Cooldown de esta arma";
    if (L === 5) return "+15% daño · +15% Cooldown";
  }
  if (type === "orb") {
    if (L === 2) return "+1 hechizo";
    if (L === 3) return "+25% daño de esta arma";
    if (L === 4) return "+30% Cooldown de esta arma";
    if (L === 5) return "+15% daño · +15% Cooldown";
  }
  if (type === "aura") {
    if (L === 2) return "+40% tamaño de esta arma";
    if (L === 3) return "+40% daño de esta arma";
    if (L === 4) return "+40% Cooldown de esta arma";
    if (L === 5) return "+30% tamaño · +30% daño · +15% Cooldown";
  }
  if (type === "melee") {
    if (L === 2) return "+20% daño de esta arma";
    if (L === 3) return "+1 triángulo de tajo · +15% daño";
    if (L === 4) return "+20% Cooldown de esta arma";
    if (L === 5) return "+20% daño · +15% Cooldown · +1 triángulo de tajo";
  }
  if (type === "orbital") {
    if (L === 2) return "+1 orbital";
    if (L === 3) return "+35% daño";
    if (L === 4) return "+1 orbital · +10% velocidad de giro";
    if (L === 5) return "+1 orbital · +25% daño · +10% giro";
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
  const sizeMult = player.sizeMult || 1;

  inst.damage = b.damage * (1 + mods.damage) * dmgMult;
  inst.cooldown = Math.max(0.12, b.cooldown * (1 - mods.cadence) * cdMult);

  if (def.type === "aura") {
    inst.auraRadius = (b.auraRadius || 60) * (1 + mods.size) * sizeMult;
  } else if (def.type === "orbital") {
    // tamaño solo agranda la brizna; la distancia de órbita no cambia
    inst.orbitRadius = b.orbitRadius || 55;
    inst.orbitSpeed = (b.orbitSpeed || 2.8) * (1 + mods.spin);
    inst.projectileRadius = (b.projectileRadius || 8) * (1 + mods.size) * sizeMult;
    inst.projectiles = (b.projectiles || 1) + mods.projectiles;
  } else if (def.type === "melee") {
    const wedges = 1 + (mods.meleeWedges || 0);
    inst.range = (b.range || 70) * (1 + mods.size) * sizeMult;
    inst.meleeArc = Math.min(
      Math.PI * 1.5,
      (b.meleeArc || 1.05) * wedges * (1 + mods.size * 0.15)
    );
  } else {
    // projectile + orb
    inst.range = (b.range || 300) * sizeMult;
    inst.projectileSpeed = b.projectileSpeed || 500;
    inst.projectileRadius = (b.projectileRadius || 5) * sizeMult;
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
  const hitEvery = Math.max(0.18, w.cooldown * 0.75);

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
          sprite: def.projectileSprite,
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
          sprite: def.projectileSprite,
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
    const slashLife = def.projectileSprite ? 0.18 : 0.12;
    state.slashes.push({
      x: p.x,
      y: p.y,
      facing: { ...facing },
      range,
      arc,
      color: def.color,
      sprite: def.projectileSprite || null,
      life: slashLife,
      maxLife: slashLife,
    });

    // Hitbox alineada al sprite (más grande/ancho que el cono de datos).
    const hit = def.projectileSprite ? RS.slashHitbox(range, arc) : { range, arc };
    const face = Math.atan2(facing.y, facing.x);
    for (const e of state.enemies) {
      if (e.hp <= 0) continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist > hit.range + e.radius) continue;
      const ang = Math.atan2(dy, dx);
      let diff = ang - face;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      if (Math.abs(diff) <= hit.arc / 2) {
        RS.Combat.hurtEnemy(state, e, w.damage);
      }
    }
  },
};

/** Escala/offset del crescent; mismos números en dibujo y daño. */
RS.SLASH_VIS = { scale: 1.55, offset: 0.45, aspect: 32 / 48 };

RS.slashHitbox = (range, arc) => {
  const v = RS.SLASH_VIS;
  const hitRange = range * (v.offset + v.scale / 2);
  const halfH = (range * v.scale * v.aspect) / 2;
  const hitArc = Math.max(arc, 2 * Math.atan2(halfH, range * v.offset));
  return { range: hitRange, arc: hitArc };
};

RS.drawWeaponAuras = (ctx, player) => {
  for (const w of player.weapons) {
    const def = RS.weaponById(w.id);
    if (!def || def.type !== "aura" || !def.projectileSprite) continue;
    RS.drawAuraSprite(ctx, player.x, player.y, w.auraRadius, def.projectileSprite);
  }
};

/** Sheet 8 frames horizontales; escala al diámetro del aura. */
RS.drawAuraSprite = (ctx, x, y, radius, spriteSrc) => {
  const img = RS.sprite(spriteSrc);
  if (!RS._spriteReady?.(img)) return;
  const { fw, fh, sx } = RS._sheetFrame(img, 8);
  const scale = (radius * 2) / Math.max(fw, fh);
  const dw = fw * scale;
  const dh = fh * scale;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, sx, 0, fw, fh, x - dw / 2, y - dh / 2, dw, dh);
  ctx.restore();
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
      // phase distinta por orbital para que no paren al unísono
      RS.drawAetherWisp(
        ctx,
        ox,
        oy,
        w.projectileRadius,
        i * 2.7,
        def.projectileSprite
      );
    }
  }
};

RS.drawSlashes = (ctx, state) => {
  if (!state.slashes) return;
  for (const s of state.slashes) {
    const progress = 1 - s.life / s.maxLife;
    const face = Math.atan2(s.facing.y, s.facing.x);
    if (s.sprite && RS.sprite) {
      RS.drawSlashSprite(ctx, s, face, progress);
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.arc(s.x, s.y, s.range, face - s.arc / 2, face + s.arc / 2);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.globalAlpha = 0.4 * (1 - progress);
    ctx.fill();
    ctx.globalAlpha = 0.55 * (1 - progress);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
};

/** Sheet 4 frames horizontales (crescent →); progreso 0→1 elige frame + fade. */
RS.drawSlashSprite = (ctx, s, face, progress) => {
  const img = RS.sprite(s.sprite);
  if (!img.complete || !img.naturalWidth) return;
  const frames = 4;
  const fw = Math.floor(img.naturalWidth / frames);
  const fh = img.naturalHeight;
  const fi = Math.min(frames - 1, Math.floor(progress * frames));
  const v = RS.SLASH_VIS;
  const scale = (s.range * v.scale) / Math.max(fw, fh);
  const dw = fw * scale;
  const dh = fh * scale;
  const ox = s.x + Math.cos(face) * s.range * v.offset;
  const oy = s.y + Math.sin(face) * s.range * v.offset;
  ctx.save();
  ctx.globalAlpha = 0.95 * (1 - progress * 0.35);
  ctx.imageSmoothingEnabled = false;
  ctx.translate(ox, oy);
  ctx.rotate(face);
  ctx.drawImage(img, fi * fw, 0, fw, fh, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
};
