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
  if (RS.dist(orb.x, orb.y, player.x, player.y) < (player.magnet || 90)) orb.homing = true;
  if (!orb.homing) return;
  // Acelera hasta ir por delante del jugador; una vez enganchado no se suelta.
  const cap = player.speed + 60;
  orb.pull = Math.min(cap, (orb.pull || 80) + 700 * dt);
  const pull = RS.norm(player.x - orb.x, player.y - orb.y);
  orb.x += pull.x * orb.pull * dt;
  orb.y += pull.y * orb.pull * dt;
};

(() => {
  const far = RS.createXpOrb(0, 0, 1);
  RS.updatePickup(far, 0.5, { x: 200, y: 0, speed: 220, radius: 20 });
  console.assert(far.x === 0 && !far.homing, "xp fuera de rango no se mueve");

  const wide = RS.createXpOrb(0, 0, 1);
  RS.updatePickup(wide, 1 / 60, { x: 100, y: 0, speed: 200, radius: 20, magnet: 120 });
  console.assert(wide.homing, "iman amplio engancha mas lejos");

  const player = { x: 0, y: 0, speed: 360, radius: 20 };
  const orb = RS.createXpOrb(-70, 0, 1);
  let caught = false;
  let overtook = false;
  for (let i = 0; i < 8 * 60; i++) {
    player.x += player.speed / 60;
    RS.updatePickup(orb, 1 / 60, player);
    if (i / 60 >= 0.5 && orb.pull > player.speed) overtook = true;
    if (RS.dist(orb.x, orb.y, player.x, player.y) <= player.radius + orb.radius) caught = true;
  }
  console.assert(overtook && caught, "xp enganchado alcanza a un jugador que huye");
})();

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
