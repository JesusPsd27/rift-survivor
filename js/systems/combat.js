window.RS = window.RS || {};

RS.Combat = {
  nearestEnemy(state, range) {
    let best = null;
    let bestD = range;
    for (const e of state.enemies) {
      const d = RS.dist(state.player.x, state.player.y, e.x, e.y);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  },

  hurtEnemy(state, e, dmg) {
    const dealt = Math.max(1, Math.round(dmg));
    e.hp -= dealt;
    e.hitFlash = 0.08;
    RS.spawnFloater(state, e.x, e.y - e.radius, dealt, "#ffd27a");
    if (e.hp <= 0) this.killEnemy(state, e);
  },

  killEnemy(state, e) {
    state.kills += 1;
    RS.spawnXpOrbs(state, e.x, e.y, e.xp);
    e.hp = 0;
  },

  hurtPlayer(state, amount) {
    const p = state.player;
    if (p.invuln > 0 || p.hp <= 0) return;
    const taken = Math.max(1, Math.round(amount));
    p.hp -= taken;
    p.invuln = 0.55;
    RS.spawnFloater(state, p.x, p.y - p.radius, `-${taken}`, "#ff6b6b");
    if (p.hp <= 0) {
      p.hp = 0;
      state.pendingGameOver = true;
    }
  },

  resolveHits(state) {
    const p = state.player;
    for (const proj of state.projectiles) {
      if (proj.hostile) {
        if (p.hp <= 0) continue;
        if (RS.dist(proj.x, proj.y, p.x, p.y) > proj.radius + p.radius) continue;
        this.hurtPlayer(state, proj.damage);
        proj.life = 0;
        continue;
      }

      for (const e of state.enemies) {
        if (e.hp <= 0) continue;
        if (RS.dist(proj.x, proj.y, e.x, e.y) > proj.radius + e.radius) continue;

        if (proj.kind === "orb") {
          const bag = proj.phase === "out" ? proj.hitOut : proj.hitBack;
          if (bag.has(e)) continue;
          bag.add(e);
          this.hurtEnemy(state, e, proj.damage);
          continue;
        }

        this.hurtEnemy(state, e, proj.damage);
        if (proj.pierce > 0) proj.pierce -= 1;
        else proj.life = 0;
        break;
      }
    }

    if (p.invuln > 0 || p.hp <= 0) return;
    for (const e of state.enemies) {
      if (e.hp <= 0) continue;
      // casters no hacen daño por contacto; solo proyectiles
      if (e.preferRange > 0) continue;
      if (RS.dist(p.x, p.y, e.x, e.y) <= p.radius + e.radius - 2) {
        this.hurtPlayer(state, e.damage);
        break;
      }
    }
  },
};
