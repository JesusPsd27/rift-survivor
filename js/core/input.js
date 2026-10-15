window.RS = window.RS || {};

RS.Input = {
  keys: Object.create(null),
  justPressed: Object.create(null),

  init() {
    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      if (!this.keys[k]) this.justPressed[k] = true;
      this.keys[k] = true;
      if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        e.preventDefault();
      }
    });
    window.addEventListener("keyup", (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
    window.addEventListener("blur", () => {
      this.keys = Object.create(null);
    });
  },

  endFrame() {
    this.justPressed = Object.create(null);
  },

  down(k) {
    return !!this.keys[k];
  },

  pressed(k) {
    return !!this.justPressed[k];
  },

  moveVector() {
    let x = 0;
    let y = 0;
    if (this.down("w") || this.down("arrowup")) y -= 1;
    if (this.down("s") || this.down("arrowdown")) y += 1;
    if (this.down("a") || this.down("arrowleft")) x -= 1;
    if (this.down("d") || this.down("arrowright")) x += 1;
    if (x || y) return RS.norm(x, y);
    return { x: 0, y: 0 };
  },
};
