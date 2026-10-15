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
});

RS.updateProjectile = (p, dt) => {
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.life -= dt;
};

RS.drawProjectile = (ctx, p) => {
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.fill();
};
