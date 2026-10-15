window.RS = window.RS || {};

RS.createEnemy = (type, x, y, scale = 1) => ({
  id: type.id,
  color: type.color,
  x,
  y,
  radius: type.radius * (scale > 1 ? 1.2 : 1),
  maxHp: type.hp * scale,
  hp: type.hp * scale,
  speed: type.speed * (scale > 1 ? 0.9 : 1),
  damage: type.damage * scale,
  xp: Math.ceil(type.xp * scale),
  hitFlash: 0,
});

RS.updateEnemy = (e, dt, player) => {
  const dir = RS.norm(player.x - e.x, player.y - e.y);
  e.x += dir.x * e.speed * dt;
  e.y += dir.y * e.speed * dt;
  if (e.hitFlash > 0) e.hitFlash -= dt;
};

RS.drawEnemy = (ctx, e) => {
  ctx.beginPath();
  ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
  ctx.fillStyle = e.hitFlash > 0 ? "#fff" : e.color;
  ctx.fill();

  // tiny hp bar
  const w = e.radius * 2;
  const ratio = RS.clamp(e.hp / e.maxHp, 0, 1);
  ctx.fillStyle = "#000";
  ctx.fillRect(e.x - w / 2, e.y - e.radius - 8, w, 3);
  ctx.fillStyle = "#c45c5c";
  ctx.fillRect(e.x - w / 2, e.y - e.radius - 8, w * ratio, 3);
};
