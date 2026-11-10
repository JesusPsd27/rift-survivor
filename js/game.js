window.RS = window.RS || {};

RS.Game = {
  WIN_TIME: 900, // 15 min survival = victoria

  init() {
    this.canvas = document.getElementById("game");
    this.ctx = this.canvas.getContext("2d");
    RS.Camera.w = this.canvas.width;
    RS.Camera.h = this.canvas.height;
    RS.Input.init();
    RS.Audio.init();
    RS.UI.init(this);
    this.mode = "menu";
    this.state = null;
    this.menuCamX = 0;
    this.menuCamY = 0;
    this.last = RS.now();
    RS.UI.show("menu");
    requestAnimationFrame(() => this.frame());
  },

  toMenu() {
    this.mode = "menu";
    this.state = null;
    RS.Audio.stopPlay();
    RS.Audio.restartMenu();
    RS.UI.show("menu");
    RS.UI.refreshBest();
    RS.UI.refreshGold();
  },

  startRun(championId) {
    const champ = RS.CHAMPIONS.find((c) => c.id === championId);
    if (!champ) return;
    this.state = {
      player: RS.createPlayer(champ, 0, 0),
      enemies: [],
      projectiles: [],
      pickups: [],
      floaters: [],
      slashes: [],
      time: 0,
      kills: 0,
      pendingLevelUps: 0,
      pendingGameOver: false,
      bossWave: 0,
      won: false,
    };
    RS.Ground.clearCache();
    RS.Spawner.init(this.state);
    RS.Camera.x = -RS.Camera.w / 2;
    RS.Camera.y = -RS.Camera.h / 2;
    this.mode = "play";
    RS.Audio.startPlay();
    RS.UI.show(null);
    RS.UI.updateHud(this.state);
  },

  pause() {
    if (this.mode !== "play") return;
    this.mode = "pause";
    RS.UI.showPause(this.state);
  },

  resume() {
    if (this.mode !== "pause") return;
    this.mode = "play";
    RS.UI.show(null);
    this.last = RS.now();
  },

  beginLevelUp() {
    const choices = RS.LevelUp.choices(this.state.player, 3);
    if (!choices.length) {
      this.state.pendingLevelUps = 0;
      this.mode = "play";
      RS.UI.show(null);
      this.last = RS.now();
      return;
    }
    this.mode = "levelup";
    RS.UI.showLevelUp(this.state.player.level, choices, (u) => {
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
    const goldEarned = RS.Save.goldForRun(this.state.kills, this.state.time, won);
    const goldTotal = RS.Save.addGold(goldEarned);
    RS.Save.recordRun({
      kills: this.state.kills,
      time: this.state.time,
      championId: p.id,
      won,
      level: p.level,
      gold: goldEarned,
    });
    RS.UI.showGameOver(won, {
      time: this.state.time,
      level: p.level,
      kills: this.state.kills,
      goldEarned,
      goldTotal,
    });
  },

  frame() {
    const t = RS.now();
    let dt = Math.min(0.05, t - this.last);
    this.last = t;

    if (RS.Input.pressed("escape") || RS.Input.pressed("p")) {
      if (this.mode === "play") this.pause();
      else if (this.mode === "pause" && RS.UI._screen === "settings") RS.UI.closeSettings();
      else if (this.mode === "pause") this.resume();
    }

    if (this.mode === "play") this.update(dt);
    else if (!this.state) this.updateMenuCam(dt);
    this.draw();
    RS.Input.endFrame();
    requestAnimationFrame(() => this.frame());
  },

  updateMenuCam(dt) {
    this.menuCamX += 22 * dt;
    this.menuCamY += 9 * dt + Math.sin(this.menuCamX * 0.002) * 4 * dt;
  },

  update(dt) {
    const s = this.state;
    s.time += dt;

    RS.updatePlayer(s.player, dt);
    RS.Camera.follow(s.player.x, s.player.y, dt);
    RS.Spawner.update(s, dt);
    RS.updateWeapons(s, dt);

    for (const e of s.enemies) RS.updateEnemy(e, dt, s);
    for (const proj of s.projectiles) RS.updateProjectile(proj, dt, s.player);
    for (const orb of s.pickups) RS.updatePickup(orb, dt, s.player);

    RS.Combat.resolveHits(s);

    // XP pickup
    for (const orb of s.pickups) {
      if (RS.dist(orb.x, orb.y, s.player.x, s.player.y) <= s.player.radius + orb.radius) {
        RS.LevelUp.gainXp(s, orb.value);
        orb.dead = true;
      }
    }

    RS.updateFloaters(s, dt);

    s.enemies = s.enemies.filter((e) => e.hp > 0);
    s.projectiles = s.projectiles.filter((p) => p.life > 0);
    s.pickups = s.pickups.filter((o) => !o.dead);
    RS.trimPickups(s, s.player);

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

    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, w, h);

    if (!this.state) {
      this.drawMenuBackground(ctx);
      return;
    }

    RS.Camera.apply(ctx);
    this.drawWorld(ctx);
    for (const orb of this.state.pickups) {
      if (RS.pickupOnScreen(orb)) RS.drawPickup(ctx, orb);
    }
    for (const e of this.state.enemies) RS.drawEnemy(ctx, e);
    for (const p of this.state.projectiles) RS.drawProjectile(ctx, p);
    RS.drawSlashes(ctx, this.state);
    RS.drawPlayer(ctx, this.state.player);
    RS.drawFloaters(ctx, this.state);
    RS.Camera.reset(ctx);
  },

  drawMenuBackground(ctx) {
    const x = this.menuCamX;
    const y = this.menuCamY;
    ctx.setTransform(1, 0, 0, 1, -Math.round(x), -Math.round(y));
    RS.Ground.draw(ctx, x, y, RS.Camera.w, RS.Camera.h);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "rgba(5, 8, 15, 0.42)";
    ctx.fillRect(0, 0, RS.Camera.w, RS.Camera.h);
  },

  drawWorld(ctx) {
    const cam = RS.Camera;
    RS.Ground.draw(ctx, cam.x, cam.y, cam.w, cam.h);
  },
};

window.addEventListener("DOMContentLoaded", () => RS.Game.init());
