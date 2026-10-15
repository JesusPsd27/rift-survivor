window.RS = window.RS || {};

RS.Camera = {
  x: 0,
  y: 0,
  w: 1280,
  h: 720,

  follow(tx, ty, dt) {
    const lerp = 1 - Math.pow(0.001, dt);
    this.x = RS.lerp(this.x, tx - this.w / 2, lerp);
    this.y = RS.lerp(this.y, ty - this.h / 2, lerp);
  },

  apply(ctx) {
    ctx.setTransform(1, 0, 0, 1, -this.x, -this.y);
  },

  reset(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  },

  worldToScreen(wx, wy) {
    return { x: wx - this.x, y: wy - this.y };
  },
};
