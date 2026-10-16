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

RS.drawProjectile = (ctx, p) => {
  if (p.kind === "arrow") {
    RS.drawArrowProjectile(ctx, p);
    return;
  }
  if (p.kind === "orb") {
    RS.drawSpellOrb(ctx, p);
    return;
  }
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.fill();
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

/** Hechizo del tomo: núcleo + anillo rúnico. */
RS.drawSpellOrb = (ctx, p) => {
  const r = p.radius;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r + 5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(199, 125, 255, 0.22)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(p.x, p.y, r * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(p.x, p.y, r + 3, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
};
