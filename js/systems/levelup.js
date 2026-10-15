window.RS = window.RS || {};

RS.LevelUp = {
  gainXp(state, amount) {
    const p = state.player;
    p.xp += amount;
    while (p.xp >= p.xpToLevel) {
      p.xp -= p.xpToLevel;
      p.level += 1;
      p.xpToLevel = Math.floor(5 + p.level * 3.2);
      state.pendingLevelUps += 1;
    }
  },

  choices(count = 3) {
    const pool = RS.UPGRADES.slice();
    const out = [];
    while (out.length < count && pool.length) {
      const i = RS.randInt(0, pool.length - 1);
      out.push(pool.splice(i, 1)[0]);
    }
    return out;
  },

  apply(state, upgrade) {
    upgrade.apply(state.player);
    state.pendingLevelUps = Math.max(0, state.pendingLevelUps - 1);
  },
};
