window.RS = window.RS || {};

RS.createProjectile = (opts) => ({
  x: opts.x,
  y: opts.y,
  vx: opts.vx,
  vy: opts.vy,
  radius: opts.radius,
  damage: opts.damage,
  life: opts.life ?? 1.2,
  color: opts.color || "#e8eef8",
  pierce: opts.pierce || 0,
  kind: opts.kind || "bolt",
  hostile: !!opts.hostile,
  phase: opts.phase || null,
  speed: opts.speed || 0,
  maxDist: opts.maxDist || 0,
  traveled: 0,
  hitOut: opts.kind === "orb" ? new Set() : null,
  hitBack: opts.kind === "orb" ? new Set() : null,
  sprite: opts.sprite || null,
});

RS.updateProjectile = (p, dt, player) => {
  if (p.kind === "orb" && player) {
    RS.updateOrbProjectile(p, dt, player);
    return;
  }
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.life -= dt;
};

RS.updateOrbProjectile = (p, dt, player) => {
  const speed = p.speed || Math.hypot(p.vx, p.vy) || 400;

  if (p.phase === "out") {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.traveled += speed * dt;
    if (p.traveled >= p.maxDist) {
      p.phase = "back";
    }
  } else {
    const dir = RS.norm(player.x - p.x, player.y - p.y);
    p.vx = dir.x * speed;
    p.vy = dir.y * speed;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (RS.dist(p.x, p.y, player.x, player.y) <= player.radius + p.radius) {
      p.life = 0;
    }
  }

  // timeout de seguridad (life se setea al crear ≈ ida+vuelta)
  p.life -= dt;
};

/** Cache de PNG (una Image por src). Lazy: también sirve si no se prelogueó. */
RS.sprite = (src) => {
  RS._sprites = RS._sprites || {};
  if (RS._sprites[src]) return RS._sprites[src];
  const img = new Image();
  img.src = src;
  RS._sprites[src] = img;
  return img;
};

RS._spriteReady = (img) => img && img.complete && img.naturalWidth > 0;

/**
 * Precarga: bolt hostil + todos los projectileSprite de armas.
 * Fuente de verdad = WEAPONS (cargado antes que este archivo).
 */
RS.HOSTILE_BOLT = "icons/projectiles/hostile_bolt.png";
RS.preloadProjectileSprites = () => {
  RS.sprite(RS.HOSTILE_BOLT);
  if (!RS.WEAPONS) return;
  for (const w of RS.WEAPONS) {
    if (w.projectileSprite) RS.sprite(w.projectileSprite);
  }
};
RS.preloadProjectileSprites();

/** Frame de sheet horizontal: { fw, fh, fi, sx }. */
RS._sheetFrame = (img, frames, phase = 0) => {
  const fw = Math.floor(img.naturalWidth / frames);
  const fh = img.naturalHeight;
  const fi = Math.floor(performance.now() / 80 + phase) % frames;
  return { fw, fh, fi, sx: fi * fw };
};

/** PNG/frame orientado a la velocidad + 1 ghost de estela. */
RS._blitFacingTrail = (ctx, img, x, y, vx, vy, dw, dh, ang, sx, sy, sw, sh) => {
  const speed = Math.hypot(vx, vy) || 1;
  const gx = x - (vx / speed) * dw * 0.3;
  const gy = y - (vy / speed) * dw * 0.3;
  const blit = (bx, by, alpha) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    ctx.translate(bx, by);
    ctx.rotate(ang);
    if (sw != null) ctx.drawImage(img, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh);
    else ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  };
  blit(gx, gy, 0.35);
  blit(x, y, 1);
};

RS.drawProjectile = (ctx, p) => {
  if (p.kind === "arrow") {
    RS.drawArrowProjectile(ctx, p);
    return;
  }
  if (p.kind === "orb") {
    RS.drawSpellOrb(ctx, p);
    return;
  }
  if (p.hostile) {
    RS.drawHostileBoltSprite(ctx, p);
    return;
  }
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.fill();
};

/** Caster: PNG orientado a la velocidad + 1 ghost de estela. */
RS.drawHostileBoltSprite = (ctx, p) => {
  const img = RS.sprite(RS.HOSTILE_BOLT);
  if (!RS._spriteReady(img)) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color || "#60a5fa";
    ctx.fill();
    return;
  }
  const ang = Math.atan2(p.vy, p.vx);
  const scale = 1.2;
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  RS._blitFacingTrail(ctx, img, p.x, p.y, p.vx, p.vy, w, h, ang);
};

/**
 * Brizna / orbital: sheet 8 frames horizontales.
 * La flama siempre mira hacia arriba; solo cambia la posición al orbitar.
 */
RS.drawAetherWisp = (ctx, x, y, radius, phase = 0, spriteSrc) => {
  const img = RS.sprite(spriteSrc);
  if (!RS._spriteReady(img)) {
    ctx.beginPath();
    ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(125, 211, 252, 0.25)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#7dd3fc";
    ctx.fill();
    return;
  }
  const { fw, fh, sx } = RS._sheetFrame(img, 8, phase);
  const scale = (radius * 4) / fw;
  const dw = fw * scale;
  const dh = fh * scale;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, sx, 0, fw, fh, x - dw / 2, y - dh / 2, dw, dh);
  ctx.restore();
};

/** Flecha PNG (punta →) orientada a la velocidad + ghost. */
RS.drawArrowProjectile = (ctx, p) => {
  const img = RS.sprite(p.sprite);
  const r = Math.max(4, p.radius);
  const ang = Math.atan2(p.vy, p.vx);
  if (!RS._spriteReady(img)) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(ang);
    ctx.fillStyle = p.color || "#e8eef8";
    ctx.beginPath();
    ctx.moveTo(r * 3.2, 0);
    ctx.lineTo(-r * 2.5, r * 0.7);
    ctx.lineTo(-r * 2.5, -r * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }
  const scale = (r * 7) / img.naturalWidth;
  RS._blitFacingTrail(
    ctx,
    img,
    p.x,
    p.y,
    p.vx,
    p.vy,
    img.naturalWidth * scale,
    img.naturalHeight * scale,
    ang
  );
};

/** Hechizo del tomo: sheet 4 frames horizontales (punta →) + ghost. */
RS.drawSpellOrb = (ctx, p) => {
  const img = RS.sprite(p.sprite);
  const r = p.radius;
  if (!RS._spriteReady(img)) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, r + 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(199, 125, 255, 0.22)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = p.color || "#c47dff";
    ctx.fill();
    return;
  }
  const { fw, fh, sx } = RS._sheetFrame(img, 4);
  const scale = (r * 4) / fw;
  const dw = fw * scale;
  const dh = fh * scale;
  const ang = Math.atan2(p.vy, p.vx);
  RS._blitFacingTrail(ctx, img, p.x, p.y, p.vx, p.vy, dw, dh, ang, sx, 0, fw, fh);
};
