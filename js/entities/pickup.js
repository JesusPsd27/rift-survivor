window.RS = window.RS || {};

RS.createXpOrb = (x, y, value) => ({
  x,
  y,
  value,
  radius: 5 + Math.min(4, value),
  life: 20,
});

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
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#4a7fd4";
  ctx.fill();
};
