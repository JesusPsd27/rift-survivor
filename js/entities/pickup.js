window.RS = window.RS || {};

/** XP +1: rombo claro. XP ≥2: deltoide más oscuro. */
RS.XP_ORB = {
  1: { color: "#e9d5ff", radius: 6 },
  2: { color: "#a855f7", radius: 8 },
};

/** Soft-cap: más allá se fusionan orbes lejos del jugador. */
RS.PICKUP_SOFT_CAP = 500;
RS.PICKUP_MERGE_CELL = 160;

RS.xpOrbLook = (value) => (value >= 2 ? RS.XP_ORB[2] : RS.XP_ORB[1]);

RS.createXpOrb = (x, y, value) => {
  const v = Math.max(1, Math.round(value));
  const look = RS.xpOrbLook(v);
  return {
    x,
    y,
    value: v,
    radius: look.radius,
    color: look.color,
  };
};

RS.applyXpOrbLook = (orb) => {
  const look = RS.xpOrbLook(orb.value);
  orb.radius = look.radius;
  orb.color = look.color;
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
  if (RS.dist(orb.x, orb.y, player.x, player.y) < (player.magnet || 90)) orb.homing = true;
  if (!orb.homing) return;
  // Acelera hasta ir por delante del jugador; una vez enganchado no se suelta.
  const cap = player.speed + 60;
  orb.pull = Math.min(cap, (orb.pull || 80) + 700 * dt);
  const pull = RS.norm(player.x - orb.x, player.y - orb.y);
  orb.x += pull.x * orb.pull * dt;
  orb.y += pull.y * orb.pull * dt;
};

/**
 * Fusiona orbes lejos del imán en celdas de grid para no acumular miles al kitear.
 * Los que van hacia el jugador (homing) o están cerca no se tocan.
 */
RS.trimPickups = (state, player) => {
  const list = state.pickups;
  if (list.length <= RS.PICKUP_SOFT_CAP) return;

  const nearR = (player.magnet || 90) * 2;
  const keep = [];
  const far = [];
  for (const o of list) {
    if (o.homing || RS.dist(o.x, o.y, player.x, player.y) < nearR) keep.push(o);
    else far.push(o);
  }

  const cell = RS.PICKUP_MERGE_CELL;
  const bags = new Map();
  for (const o of far) {
    const k = `${Math.floor(o.x / cell)},${Math.floor(o.y / cell)}`;
    const bag = bags.get(k);
    if (!bag) {
      bags.set(k, o);
      continue;
    }
    bag.value += o.value;
    RS.applyXpOrbLook(bag);
  }

  state.pickups = keep.concat([...bags.values()]);

  // Si sigue por encima (pila enorme cerca), conservar los más cercanos y volcar el resto en uno.
  if (state.pickups.length <= RS.PICKUP_SOFT_CAP) return;
  const scored = state.pickups.map((o) => ({
    o,
    d: o.homing ? -1 : RS.dist(o.x, o.y, player.x, player.y),
  }));
  scored.sort((a, b) => a.d - b.d);
  const out = [];
  let sink = null;
  const excess = [];
  for (const { o, d } of scored) {
    if (d < 0 || out.length < RS.PICKUP_SOFT_CAP) {
      out.push(o);
      if (d >= 0) sink = o;
      continue;
    }
    excess.push(o);
  }
  if (excess.length) {
    if (!sink) {
      sink = excess.shift();
      out.push(sink);
    }
    for (const o of excess) sink.value += o.value;
    RS.applyXpOrbLook(sink);
  }
  state.pickups = out;
};

RS.pickupOnScreen = (orb, margin = 48) => {
  const cam = RS.Camera;
  return (
    orb.x >= cam.x - margin &&
    orb.x <= cam.x + cam.w + margin &&
    orb.y >= cam.y - margin &&
    orb.y <= cam.y + cam.h + margin
  );
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

  const state = { pickups: [] };
  for (let i = 0; i < RS.PICKUP_SOFT_CAP + 40; i++) {
    state.pickups.push(RS.createXpOrb(2000 + (i % 10) * 20, 2000 + Math.floor(i / 10) * 20, 1));
  }
  const before = state.pickups.reduce((s, o) => s + o.value, 0);
  RS.trimPickups(state, { x: 0, y: 0, magnet: 90 });
  const after = state.pickups.reduce((s, o) => s + o.value, 0);
  console.assert(state.pickups.length <= RS.PICKUP_SOFT_CAP, "trim baja bajo soft-cap");
  console.assert(after === before, "trim conserva XP total");
})();

RS.drawPickup = (ctx, orb) => {
  // Solo dibujo: el radio de colisión no cambia. Fase aleatoria para que no latan al unísono.
  orb.phase = orb.phase ?? Math.random() * 6.28;
  const pulse = 1 + 0.12 * Math.sin(performance.now() / 220 + orb.phase);
  const r = orb.radius * 1.6 * pulse;
  const big = orb.value >= 2;
  const color = orb.color || RS.xpOrbLook(orb.value).color;

  if (big) {
    // halo morado (gradiente plano, barato con muchos orbes)
    const g = ctx.createRadialGradient(orb.x, orb.y, r * 0.3, orb.x, orb.y, r * 2.2);
    g.addColorStop(0, "rgba(192,132,252,0.45)");
    g.addColorStop(1, "rgba(192,132,252,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, r * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  if (big) {
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
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineJoin = "round";
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#3b0764";
  ctx.stroke();

  // brillo interior
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.arc(orb.x, orb.y - r * 0.15, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
};
