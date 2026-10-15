window.RS = window.RS || {};

RS.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
RS.lerp = (a, b, t) => a + (b - a) * t;
RS.rand = (a, b) => a + Math.random() * (b - a);
RS.randInt = (a, b) => Math.floor(RS.rand(a, b + 1));
RS.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

RS.dist = (ax, ay, bx, by) => {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.hypot(dx, dy);
};

RS.norm = (x, y) => {
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
};

RS.now = () => performance.now() / 1000;

RS.formatTime = (sec) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};
