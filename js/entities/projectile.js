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

/** Cache de PNG de proyectiles (una Image por src). */
RS.sprite = (src) => {
  RS._sprites = RS._sprites || {};
  if (RS._sprites[src]) return RS._sprites[src];
  const img = new Image();
  img.src = src;
  RS._sprites[src] = img;
  return img;
};
RS.sprite("icons/projectiles/hostile_bolt.png");
RS.sprite("icons/projectiles/aether_wisp.png");
RS.sprite("icons/projectiles/orb.png");

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
  const img = RS.sprite("icons/projectiles/hostile_bolt.png");
  if (!img.complete || !img.naturalWidth) {
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
  const speed = Math.hypot(p.vx, p.vy) || 1;
  const gx = p.x - (p.vx / speed) * w * 0.35;
  const gy = p.y - (p.vy / speed) * w * 0.35;

  const blit = (x, y, alpha) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  };
  blit(gx, gy, 0.35);
  blit(p.x, p.y, 1);
};

/**
 * Brizna / orbital: sheet 8 frames horizontales.
 * La flama siempre mira hacia arriba; solo cambia la posición al orbitar.
 */
RS.drawAetherWisp = (ctx, x, y, radius, phase = 0) => {
  const img = RS.sprite("icons/projectiles/aether_wisp.png");
  if (!img.complete || !img.naturalWidth) {
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
  const frames = 8;
  const fw = Math.floor(img.naturalWidth / frames);
  const fh = img.naturalHeight;
  const fi = Math.floor(performance.now() / 80 + phase) % frames;
  const scale = (radius * 4) / fw;
  const dw = fw * scale;
  const dh = fh * scale;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, fi * fw, 0, fw, fh, x - dw / 2, y - dh / 2, dw, dh);
  ctx.restore();
};

/** Flecha → orientada a la velocidad. */
RS.drawArrowProjectile = (ctx, p) => {
  const ang = Math.atan2(p.vy, p.vx);
  const r = Math.max(4, p.radius);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(ang);
  // asta
  ctx.strokeStyle = p.color;
  ctx.lineWidth = Math.max(1.5, r * 0.45);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-r * 3.0, 0);
  ctx.lineTo(r * 1.8, 0);
  ctx.stroke();
  // punta
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.moveTo(r * 3.2, 0);
  ctx.lineTo(r * 1.5, r * 0.65);
  ctx.lineTo(r * 1.5, -r * 0.65);
  ctx.closePath();
  ctx.fill();
  // plumas: vértice hacia la punta, brazos hacia la cola (misma orientación que la punta)
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = Math.max(1.8, r * 0.4);
  ctx.lineJoin = "round";
  ctx.beginPath();
  // fila delantera
  ctx.moveTo(-r * 2.3, -r * 0.85);
  ctx.lineTo(-r * 1.6, 0);
  ctx.lineTo(-r * 2.3, r * 0.85);
  // fila trasera
  ctx.moveTo(-r * 3.0, -r * 0.85);
  ctx.lineTo(-r * 2.3, 0);
  ctx.lineTo(-r * 3.0, r * 0.85);
  ctx.stroke();
  ctx.restore();
};

/**
 * Hechizo del tomo: sheet 4 frames horizontales (punta →), rota a la velocidad + ghost.
 */
RS.drawSpellOrb = (ctx, p) => {
  const img = RS.sprite("icons/projectiles/orb.png");
  const r = p.radius;
  if (!img.complete || !img.naturalWidth) {
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
  const frames = 4;
  const fw = Math.floor(img.naturalWidth / frames);
  const fh = img.naturalHeight;
  const fi = Math.floor(performance.now() / 80) % frames;
  const scale = (r * 4) / fw;
  const dw = fw * scale;
  const dh = fh * scale;
  const ang = Math.atan2(p.vy, p.vx);
  const speed = Math.hypot(p.vx, p.vy) || 1;
  const gx = p.x - (p.vx / speed) * dw * 0.3;
  const gy = p.y - (p.vy / speed) * dw * 0.3;

  const blit = (x, y, alpha) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.drawImage(img, fi * fw, 0, fw, fh, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  };
  blit(gx, gy, 0.35);
  blit(p.x, p.y, 1);
};
