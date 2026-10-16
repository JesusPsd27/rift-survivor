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
  xp: type.xp, // fijo: no escala con el tiempo
  hitFlash: 0,
  preferRange: type.preferRange || 0,
  attackRange: type.attackRange || 0,
  attackCooldown: type.attackCooldown || 0,
  attackCd: type.attackCooldown ? RS.rand(0.2, type.attackCooldown) : 0,
  projectileSpeed: type.projectileSpeed || 0,
  projectileRange: type.projectileRange || type.attackRange || 300,
  projectileRadius: type.projectileRadius || 5,
  projectileColor: type.projectileColor || "#60a5fa",
});

RS.updateEnemy = (e, dt, state) => {
  const player = state.player;
  if (e.preferRange > 0) {
    RS.updateRangedEnemy(e, dt, state);
  } else {
    const dir = RS.norm(player.x - e.x, player.y - e.y);
    e.x += dir.x * e.speed * dt;
    e.y += dir.y * e.speed * dt;
  }
  if (e.hitFlash > 0) e.hitFlash -= dt;
};

/** Caster: mantiene distancia y dispara proyectiles azules. */
RS.updateRangedEnemy = (e, dt, state) => {
  const player = state.player;
  const d = RS.dist(e.x, e.y, player.x, player.y);
  const ideal = e.preferRange;
  const dir = RS.norm(player.x - e.x, player.y - e.y);

  if (d > ideal + 24) {
    e.x += dir.x * e.speed * dt;
    e.y += dir.y * e.speed * dt;
  } else if (d < ideal - 36) {
    e.x -= dir.x * e.speed * 0.85 * dt;
    e.y -= dir.y * e.speed * 0.85 * dt;
  }

  if (e.attackCd > 0) e.attackCd -= dt;
  if (e.attackCd <= 0 && d <= e.attackRange) {
    const shoot = RS.norm(player.x - e.x, player.y - e.y);
    const spd = e.projectileSpeed || 260;
    const range = e.projectileRange || e.attackRange || 300;
    state.projectiles.push(
      RS.createProjectile({
        x: e.x + shoot.x * e.radius,
        y: e.y + shoot.y * e.radius,
        vx: shoot.x * spd,
        vy: shoot.y * spd,
        radius: e.projectileRadius || 5,
        damage: e.damage,
        life: range / spd + 0.2,
        color: e.projectileColor || "#60a5fa",
        kind: "bolt",
        hostile: true,
      })
    );
    e.attackCd = e.attackCooldown || 1.5;
  }
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
