window.RS = window.RS || {};

RS.createPlayer = (champ, x, y) => ({
  id: champ.id,
  name: champ.name,
  color: champ.color,
  x,
  y,
  radius: 14,
  facing: { x: 1, y: 0 },
  maxHp: champ.hp,
  hp: champ.hp,
  speed: champ.speed,
  damage: champ.damage,
  cooldown: champ.cooldown,
  attackCd: 0,
  attack: champ.attack,
  projectileSpeed: champ.projectileSpeed || 500,
  projectileRadius: champ.projectileRadius || 5,
  range: champ.range || 300,
  auraRadius: champ.auraRadius || 60,
  projectileCount: 1,
  regen: 0,
  xp: 0,
  xpToLevel: 5,
  level: 1,
  invuln: 0,
});

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
  if (p.attackCd > 0) p.attackCd -= dt;
};

RS.drawPlayer = (ctx, p) => {
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
  ctx.fillStyle = p.invuln > 0 ? "#ffffff" : p.color;
  ctx.fill();
  ctx.strokeStyle = "#0b1220";
  ctx.lineWidth = 2;
  ctx.stroke();

  // facing tick
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + p.facing.x * (p.radius + 8), p.y + p.facing.y * (p.radius + 8));
  ctx.strokeStyle = "#e8eef8";
  ctx.lineWidth = 3;
  ctx.stroke();

  if (p.attack === "aura") {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.auraRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(61, 154, 106, 0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
};
