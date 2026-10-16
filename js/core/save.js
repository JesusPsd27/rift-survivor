window.RS = window.RS || {};

RS.Save = {
  KEY: "rift-survivor-v1",

  defaults() {
    return {
      bestKills: 0,
      bestTime: 0,
      bestChampion: null,
      gold: 0,
      meta: {},
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return this.defaults();
      const parsed = JSON.parse(raw);
      return { ...this.defaults(), ...parsed, meta: { ...(parsed.meta || {}) } };
    } catch {
      return this.defaults();
    }
  },

  save(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  recordRun(kills, time, championId) {
    const cur = this.load();
    let changed = false;
    if (kills > cur.bestKills) {
      cur.bestKills = kills;
      cur.bestChampion = championId;
      changed = true;
    }
    if (time > cur.bestTime) {
      cur.bestTime = time;
      changed = true;
    }
    if (changed) this.save(cur);
    return cur;
  },

  /** Oro ganado al terminar: kills + bonus tiempo + victoria. */
  goldForRun(kills, time, won) {
    return Math.max(0, kills + Math.floor(time / 8) + (won ? 40 : 0));
  },

  addGold(amount) {
    const cur = this.load();
    cur.gold = Math.max(0, (cur.gold || 0) + Math.floor(amount));
    this.save(cur);
    return cur.gold;
  },

  buyMeta(id) {
    const def = RS.metaById(id);
    if (!def) return { ok: false, reason: "unknown" };
    const cur = this.load();
    const rank = Math.min(def.maxRank, cur.meta[id] || 0);
    if (rank >= def.maxRank) return { ok: false, reason: "max" };
    const cost = def.baseCost * (rank + 1);
    if ((cur.gold || 0) < cost) return { ok: false, reason: "gold" };
    cur.gold -= cost;
    cur.meta[id] = rank + 1;
    this.save(cur);
    return { ok: true, rank: cur.meta[id], gold: cur.gold, cost };
  },

  refundMeta() {
    const cur = this.load();
    const refund = RS.metaSpentTotal();
    cur.gold = (cur.gold || 0) + refund;
    cur.meta = {};
    this.save(cur);
    return { gold: cur.gold, refund };
  },
};
