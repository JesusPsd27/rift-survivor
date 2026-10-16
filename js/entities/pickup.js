window.RS = window.RS || {};

/** XP +1: rombo claro. XP +2: deltoide más oscuro. */
RS.XP_ORB = {
  1: { color: "#e9d5ff", radius: 6 },
  2: { color: "#a855f7", radius: 8 },
};

RS.createXpOrb = (x, y, value) => {
  const v = value >= 2 ? 2 : 1;
  const look = RS.XP_ORB[v];
  return {
    x,
    y,
    value: v,
    radius: look.radius,
    color: look.color,
    life: 20,
  };
};

/** Parte el XP total en orbes de 1 y 2 (prioriza 2). */
RS.spawnXpOrbs = (state, x, y, total) => {
  let left = Math.max(0, Math.round(total));
  let n = 0;
  while (left > 0) {
    const v = left >= 2 ? 2 : 1;
    const jitter = n === 0 ? 0 : 10;
    const a = n * 2.1;
    state.pickups.push(
      RS.createXpOrb(x + Math.cos(a) * jitter, y + Math.sin(a) * jitter, v)
    );
    left -= v;
    n += 1;
  }
};

RS.updatePickup = (orb, dt, player) => {
  orb.life -= dt;
  const d = RS.dist(orb.x, orb.y, player.x, player.y);
  const magnet = 90;
  if (d < magnet) {
    const pull = RS.norm(player.x - orb.x, player.y - orb.y);
    const strength = 280 * (1 - d / magnet);
    orb.x += pull.x * strength * dt;
    orb.y += pull.y * strength * dt;
  }
};

RS.drawPickup = (ctx, orb) => {
  const r = orb.radius;
  ctx.fillStyle = orb.color || RS.XP_ORB[orb.value]?.color || "#c084fc";
  ctx.beginPath();
  if (orb.value >= 2) {
    // deltoide (cometa): punta arriba, ancha abajo
    ctx.moveTo(orb.x, orb.y - r * 1.2);
    ctx.lineTo(orb.x + r * 0.85, orb.y + r * 0.15);
    ctx.lineTo(orb.x, orb.y + r * 0.95);
    ctx.lineTo(orb.x - r * 0.85, orb.y + r * 0.15);
  } else {
    // rombo
    ctx.moveTo(orb.x, orb.y - r);
    ctx.lineTo(orb.x + r, orb.y);
    ctx.lineTo(orb.x, orb.y + r);
    ctx.lineTo(orb.x - r, orb.y);
  }
  ctx.closePath();
  ctx.fill();
};
