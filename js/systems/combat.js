window.RS = window.RS || {};

RS.Combat = {
  tryAttack(state) {
    const p = state.player;
    if (p.attackCd > 0 || p.hp <= 0) return;
    if (p.attack === "aura") {
      this.auraTick(state);
      p.attackCd = p.cooldown;
      return;
    }
    const target = this.nearestEnemy(state, p.range);
    if (p.attack === "ranged" && !target) return;
    this.fireProjectiles(state, target);
    p.attackCd = p.cooldown;
  },

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

  fireProjectiles(state, target) {
    const p = state.player;
    let base;
    if (target) {
      base = RS.norm(target.x - p.x, target.y - p.y);
    } else {
      base = p.facing;
    }
    const count = p.projectileCount || 1;
    const spread = count === 1 ? 0 : 0.22;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : (i / (count - 1) - 0.5) * spread * (count - 1);
      const c = Math.cos(t);
      const s = Math.sin(t);
      const dx = base.x * c - base.y * s;
      const dy = base.x * s + base.y * c;
      const dir = RS.norm(dx, dy);
      state.projectiles.push(
        RS.createProjectile({
          x: p.x,
          y: p.y,
          vx: dir.x * p.projectileSpeed,
          vy: dir.y * p.projectileSpeed,
          radius: p.projectileRadius,
          damage: p.damage,
          life: p.range / p.projectileSpeed + 0.15,
          color: p.color,
        })
      );
    }
  },

  auraTick(state) {
    const p = state.player;
    for (const e of state.enemies) {
      if (RS.dist(p.x, p.y, e.x, e.y) <= p.auraRadius + e.radius) {
        this.hurtEnemy(state, e, p.damage);
      }
    }
  },

  hurtEnemy(state, e, dmg) {
    e.hp -= dmg;
    e.hitFlash = 0.08;
    if (e.hp <= 0) this.killEnemy(state, e);
  },

  killEnemy(state, e) {
    state.kills += 1;
    state.pickups.push(RS.createXpOrb(e.x, e.y, e.xp));
    e.hp = 0;
  },

  resolveHits(state) {
    const p = state.player;
    for (const proj of state.projectiles) {
      for (const e of state.enemies) {
        if (e.hp <= 0) continue;
        if (RS.dist(proj.x, proj.y, e.x, e.y) <= proj.radius + e.radius) {
          this.hurtEnemy(state, e, proj.damage);
          if (proj.pierce > 0) proj.pierce -= 1;
          else proj.life = 0;
          break;
        }
      }
    }

    if (p.invuln > 0 || p.hp <= 0) return;
    for (const e of state.enemies) {
      if (e.hp <= 0) continue;
      if (RS.dist(p.x, p.y, e.x, e.y) <= p.radius + e.radius - 2) {
        p.hp -= e.damage;
        p.invuln = 0.55;
        if (p.hp <= 0) {
          p.hp = 0;
          state.pendingGameOver = true;
        }
        break;
      }
    }
  },
};
