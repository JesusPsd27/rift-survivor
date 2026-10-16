window.RS = window.RS || {};

RS.spawnFloater = (state, x, y, text, color) => {
  state.floaters.push({
    x: x + RS.rand(-6, 6),
    y: y - 8,
    vy: -55,
    text: String(text),
    color: color || "#e8eef8",
    life: 0.75,
    maxLife: 0.75,
  });
};

RS.updateFloaters = (state, dt) => {
  for (const f of state.floaters) {
    f.y += f.vy * dt;
    f.life -= dt;
  }
  state.floaters = state.floaters.filter((f) => f.life > 0);
};

RS.drawFloaters = (ctx, state) => {
  ctx.save();
  ctx.font = "bold 14px Segoe UI, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const f of state.floaters) {
    const a = RS.clamp(f.life / f.maxLife, 0, 1);
    ctx.globalAlpha = a;
    ctx.fillStyle = f.color;
    ctx.strokeStyle = "rgba(0,0,0,0.65)";
    ctx.lineWidth = 3;
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.restore();
};
