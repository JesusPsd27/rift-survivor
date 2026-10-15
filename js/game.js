window.RS = window.RS || {};

RS.Game = {
  WIN_TIME: 240, // 4 min survival = victoria básica

  init() {
    this.canvas = document.getElementById("game");
    this.ctx = this.canvas.getContext("2d");
    RS.Camera.w = this.canvas.width;
    RS.Camera.h = this.canvas.height;
    RS.Input.init();
    RS.UI.init(this);
    this.mode = "menu";
    this.state = null;
    this.last = RS.now();
    RS.UI.show("menu");
    requestAnimationFrame(() => this.frame());
  },

  toMenu() {
    this.mode = "menu";
    this.state = null;
    RS.UI.show("menu");
    RS.UI.refreshBest();
  },

  startRun(championId) {
    const champ = RS.CHAMPIONS.find((c) => c.id === championId);
    if (!champ) return;
    this.state = {
      world: { size: 3200 },
      player: RS.createPlayer(champ, 0, 0),
      enemies: [],
      projectiles: [],
      pickups: [],
      time: 0,
      kills: 0,
      pendingLevelUps: 0,
      pendingGameOver: false,
      bossSpawned: false,
      won: false,
    };
    RS.Spawner.init(this.state);
    RS.Camera.x = -RS.Camera.w / 2;
    RS.Camera.y = -RS.Camera.h / 2;
    this.mode = "play";
    RS.UI.show(null);
    RS.UI.updateHud(this.state);
  },

  pause() {
    if (this.mode !== "play") return;
    this.mode = "pause";
    RS.UI.show("pause");
  },

  resume() {
    if (this.mode !== "pause") return;
    this.mode = "play";
    RS.UI.show(null);
    this.last = RS.now();
  },

  beginLevelUp() {
    this.mode = "levelup";
    const choices = RS.LevelUp.choices(3);
    RS.UI.showLevelUp(choices, (u) => {
      RS.LevelUp.apply(this.state, u);
      if (this.state.pendingLevelUps > 0) {
        this.beginLevelUp();
      } else {
        this.mode = "play";
        RS.UI.show(null);
        this.last = RS.now();
      }
    });
  },

  endRun(won) {
    this.mode = "over";
    this.state.won = won;
    const p = this.state.player;
    RS.Save.recordRun(this.state.kills, this.state.time, p.id);
    RS.UI.showGameOver(won, {
      time: this.state.time,
      level: p.level,
      kills: this.state.kills,
    });
  },

  frame() {
    const t = RS.now();
    let dt = Math.min(0.05, t - this.last);
    this.last = t;

    if (RS.Input.pressed("escape") || RS.Input.pressed("p")) {
      if (this.mode === "play") this.pause();
      else if (this.mode === "pause") this.resume();
    }

    if (this.mode === "play") this.update(dt);
    this.draw();
    RS.Input.endFrame();
    requestAnimationFrame(() => this.frame());
  },

  update(dt) {
    const s = this.state;
    s.time += dt;

    RS.updatePlayer(s.player, dt, s.world);
    RS.Camera.follow(s.player.x, s.player.y, dt);
    RS.Spawner.update(s, dt);
    RS.Combat.tryAttack(s);

    for (const e of s.enemies) RS.updateEnemy(e, dt, s.player);
    for (const proj of s.projectiles) RS.updateProjectile(proj, dt);
    for (const orb of s.pickups) RS.updatePickup(orb, dt, s.player);

    RS.Combat.resolveHits(s);

    // XP pickup
    for (const orb of s.pickups) {
      if (RS.dist(orb.x, orb.y, s.player.x, s.player.y) <= s.player.radius + orb.radius) {
        RS.LevelUp.gainXp(s, orb.value);
        orb.life = 0;
      }
    }

    s.enemies = s.enemies.filter((e) => e.hp > 0);
    s.projectiles = s.projectiles.filter((p) => p.life > 0);
    s.pickups = s.pickups.filter((o) => o.life > 0);

    RS.UI.updateHud(s);

    if (s.pendingGameOver) {
      this.endRun(false);
      return;
    }
    if (s.time >= this.WIN_TIME) {
      this.endRun(true);
      return;
    }
    if (s.pendingLevelUps > 0) this.beginLevelUp();
  },

  draw() {
    const ctx = this.ctx;
    const { width: w, height: h } = this.canvas;
    ctx.clearRect(0, 0, w, h);

    // fondo menú
    if (!this.state) {
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, w, h);
      this.drawGrid(ctx, 0, 0);
      return;
    }

    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, w, h);

    RS.Camera.apply(ctx);
    this.drawWorld(ctx, this.state);
    for (const orb of this.state.pickups) RS.drawPickup(ctx, orb);
    for (const e of this.state.enemies) RS.drawEnemy(ctx, e);
    for (const p of this.state.projectiles) RS.drawProjectile(ctx, p);
    RS.drawPlayer(ctx, this.state.player);
    RS.Camera.reset(ctx);
  },

  drawWorld(ctx, state) {
    const half = state.world.size / 2;
    // arena
    ctx.fillStyle = "#10182a";
    ctx.fillRect(-half, -half, state.world.size, state.world.size);
    this.drawGrid(ctx, RS.Camera.x, RS.Camera.y);

    ctx.strokeStyle = "#2a3a55";
    ctx.lineWidth = 4;
    ctx.strokeRect(-half, -half, state.world.size, state.world.size);
  },

  drawGrid(ctx, ox, oy) {
    const step = 64;
    const x0 = Math.floor(ox / step) * step;
    const y0 = Math.floor(oy / step) * step;
    ctx.strokeStyle = "rgba(42, 58, 85, 0.45)";
    ctx.lineWidth = 1;
    for (let x = x0; x < ox + RS.Camera.w + step; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, oy);
      ctx.lineTo(x, oy + RS.Camera.h);
      ctx.stroke();
    }
    for (let y = y0; y < oy + RS.Camera.h + step; y += step) {
      ctx.beginPath();
      ctx.moveTo(ox, y);
      ctx.lineTo(ox + RS.Camera.w, y);
      ctx.stroke();
    }
  },
};

window.addEventListener("DOMContentLoaded", () => RS.Game.init());
