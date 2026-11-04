window.RS = window.RS || {};

RS.Spawner = {
  /** Más allá de esto (y fuera de cámara) el enemigo se despawnea. */
  DESPAWN_DIST: 1400,

  init(state) {
    state.spawnTimer = 0.4;
    state.spawnRate = 1.1;
  },

  update(state, dt) {
    state.spawnTimer -= dt;
    // rampa suave con el tiempo de run
    const t = state.time;
    const rate = Math.max(0.28, state.spawnRate - t * 0.008);
    const batch = 1 + Math.floor(t / 45);

    if (state.spawnTimer <= 0) {
      for (let i = 0; i < batch; i++) this.spawnOne(state);
      state.spawnTimer = rate;
    }

    // jefe ligero a los 3 minutos
    if (!state.bossSpawned && state.time >= 180) {
      this.spawnBoss(state);
      state.bossSpawned = true;
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
    // un poco lejos del jugador
    if (RS.dist(x, y, p.x, p.y) < 220) {
      const dir = RS.norm(x - p.x, y - p.y);
      x = p.x + dir.x * 280;
      y = p.y + dir.y * 280;
    }
    const scale = 1 + Math.floor(state.time / 90) * 0.15;
    state.enemies.push(RS.createEnemy(this.pickType(), x, y, scale));
  },

  spawnBoss(state) {
    const p = state.player;
    const brute = RS.ENEMY_TYPES.find((t) => t.id === "brute");
    const boss = RS.createEnemy(brute, p.x + 320, p.y, 4);
    boss.color = "#c8aa6e";
    boss.radius = 48;
    boss.xp = 2;
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
})();
