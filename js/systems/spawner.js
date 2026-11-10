window.RS = window.RS || {};

RS.Spawner = {
  /** Más allá de esto (y fuera de cámara) el enemigo se despawnea. */
  DESPAWN_DIST: 1400,

  /** Bosses a ~5 / 10 / 14 min (victoria a 15). */
  BOSS_TIMES: [300, 600, 840],
  BOSS_SCALES: [4, 6, 8],

  init(state) {
    state.spawnTimer = 0.4;
    state.spawnRate = 1.2;
    state.bossWave = state.bossWave || 0;
  },

  /**
   * Amenaza por tiempo de run (15 min).
   * HP: early suave, late más duro (~×5.8 a los 15 min).
   * Armor: desde min 7, hasta 25% a los 15 min.
   * speedScale: chase melee +0→35% (casters ~1/3 de eso). No supera loco vs player ~200.
   */
  threat(t) {
    const mins = t / 60;
    const hpScale =
      1 +
      mins * 0.1 +
      Math.max(0, mins - 5) * 0.2 +
      Math.max(0, mins - 10) * 0.25;
    const armor =
      mins < 7 ? 0 : Math.min(0.25, ((mins - 7) / 8) * 0.25);
    const speedScale = 1 + Math.min(0.35, mins * 0.025);
    return { hpScale, armor, speedScale };
  },

  update(state, dt) {
    state.spawnTimer -= dt;
    const t = state.time;
    // Capados para 15 min: no lotes de 20+
    const rate = Math.max(0.38, state.spawnRate - t * 0.001);
    const batch = Math.min(5, 1 + Math.floor(t / 100));

    if (state.spawnTimer <= 0) {
      for (let i = 0; i < batch; i++) this.spawnOne(state);
      state.spawnTimer = rate;
    }

    const wave = state.bossWave || 0;
    if (wave < this.BOSS_TIMES.length && t >= this.BOSS_TIMES[wave]) {
      this.spawnBoss(state, this.BOSS_SCALES[wave] || 4);
      state.bossWave = wave + 1;
    }

    this.cullFar(state);
  },

  cullFar(state) {
    const p = state.player;
    const maxD = this.DESPAWN_DIST;
    state.enemies = state.enemies.filter((e) => {
      if (e.isBoss) return true;
      return RS.dist(e.x, e.y, p.x, p.y) < maxD;
    });
  },

  pickType() {
    const types = RS.ENEMY_TYPES;
    let total = 0;
    for (const t of types) total += t.weight;
    let r = Math.random() * total;
    for (const t of types) {
      r -= t.weight;
      if (r <= 0) return t;
    }
    return types[0];
  },

  spawnOne(state) {
    const p = state.player;
    const cam = RS.Camera;
    const margin = 40;
    const side = RS.randInt(0, 3);
    let x;
    let y;
    if (side === 0) {
      x = cam.x - margin;
      y = RS.rand(cam.y, cam.y + cam.h);
    } else if (side === 1) {
      x = cam.x + cam.w + margin;
      y = RS.rand(cam.y, cam.y + cam.h);
    } else if (side === 2) {
      x = RS.rand(cam.x, cam.x + cam.w);
      y = cam.y - margin;
    } else {
      x = RS.rand(cam.x, cam.x + cam.w);
      y = cam.y + cam.h + margin;
    }
    if (RS.dist(x, y, p.x, p.y) < 220) {
      const dir = RS.norm(x - p.x, y - p.y);
      x = p.x + dir.x * 280;
      y = p.y + dir.y * 280;
    }
    const type = this.pickType();
    const { hpScale, armor, speedScale } = this.threat(state.time);
    // Melee persigue de verdad; casters solo un poco más rápidos
    const spd = type.preferRange
      ? 1 + (speedScale - 1) * 0.35
      : speedScale;
    state.enemies.push(RS.createEnemy(type, x, y, hpScale, armor, spd));
  },

  spawnBoss(state, scale = 4) {
    const p = state.player;
    const brute = RS.ENEMY_TYPES.find((t) => t.id === "brute");
    const { armor, speedScale } = this.threat(state.time);
    // Tanque: un poco de chase scale, pero más lento que minions
    const boss = RS.createEnemy(
      brute,
      p.x + 320,
      p.y,
      scale,
      armor,
      0.8 * speedScale
    );
    boss.color = "#c8aa6e";
    boss.radius = 40 + scale * 2;
    boss.xp = 2 + Math.floor(scale / 2);
    boss.isBoss = true;
    state.enemies.push(boss);
  },
};

(() => {
  const state = {
    player: { x: 0, y: 0 },
    enemies: [
      { x: 100, y: 0 },
      { x: RS.Spawner.DESPAWN_DIST + 50, y: 0 },
      { x: RS.Spawner.DESPAWN_DIST + 50, y: 0, isBoss: true },
    ],
  };
  RS.Spawner.cullFar(state);
  console.assert(state.enemies.length === 2, "cullFar quita lejanos y deja boss");

  const early = RS.Spawner.threat(60);
  const late = RS.Spawner.threat(900);
  console.assert(early.hpScale < 1.3 && early.armor === 0, "threat early suave");
  console.assert(late.hpScale > 5 && late.armor >= 0.24, "threat late duro");
  console.assert(early.speedScale < 1.05 && late.speedScale <= 1.35, "speed scale acotado");
})();
