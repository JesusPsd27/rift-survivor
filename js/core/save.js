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
      runs: [],
      settings: { master: 1, musicUi: 0.35, musicGame: 0.35, sfxUi: 0.8, sfxGame: 0.8 },
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return this.defaults();
      const parsed = JSON.parse(raw);
      const ps = parsed.settings || {};
      const legacy = {};
      if (ps.music != null) legacy.musicUi = legacy.musicGame = ps.music;
      if (ps.sfx != null) legacy.sfxUi = legacy.sfxGame = ps.sfx;
      const data = {
        ...this.defaults(),
        ...parsed,
        meta: { ...(parsed.meta || {}) },
        settings: { ...this.defaults().settings, ...legacy, ...ps },
      };
      delete data.settings.music;
      delete data.settings.sfx;
      if (!Array.isArray(data.runs)) data.runs = [];
      if (data.meta.area != null && data.meta.size == null) data.meta.size = data.meta.area;
      delete data.meta.area;
      return data;
    } catch {
      return this.defaults();
    }
  },

  save(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  recordRun(run) {
    const cur = this.load();
    const entry = {
      kills: run.kills || 0,
      time: run.time || 0,
      championId: run.championId,
      won: !!run.won,
      level: run.level || 0,
      gold: run.gold || 0,
    };
    cur.runs.push(entry);
    // shortcut: solo las últimas 300; el top 5 sale de ahí
    if (cur.runs.length > 300) cur.runs.splice(0, cur.runs.length - 300);
    if (entry.kills > cur.bestKills) {
      cur.bestKills = entry.kills;
      cur.bestChampion = entry.championId;
    }
    if (entry.time > cur.bestTime) cur.bestTime = entry.time;
    this.save(cur);
    return cur;
  },

  summarize(runs, championId) {
    const list = (runs || []).filter((r) => !championId || r.championId === championId);
    let wins = 0;
    let kills = 0;
    let time = 0;
    let gold = 0;
    let bestKills = 0;
    let bestLevel = 0;
    let bestTime = 0;
    let bestKillsChamp = null;
    let bestLevelChamp = null;
    let bestTimeChamp = null;
    for (const r of list) {
      if (r.won) wins += 1;
      kills += r.kills || 0;
      time += r.time || 0;
      gold += r.gold || 0;
      if ((r.kills || 0) > bestKills) {
        bestKills = r.kills;
        bestKillsChamp = r.championId;
      }
      if ((r.level || 0) > bestLevel) {
        bestLevel = r.level;
        bestLevelChamp = r.championId;
      }
      if ((r.time || 0) > bestTime) {
        bestTime = r.time;
        bestTimeChamp = r.championId;
      }
    }
    const n = list.length;
    return {
      runs: n,
      wins,
      losses: n - wins,
      kills,
      time,
      gold,
      bestKills,
      bestLevel,
      bestTime,
      bestKillsChamp,
      bestLevelChamp,
      bestTimeChamp,
      list,
    };
  },

  /** Top N partidas según sort: time | kills | recent */
  rankRuns(runs, sort = "time", limit = 5) {
    const list = (runs || []).slice();
    if (sort === "kills") list.sort((a, b) => (b.kills || 0) - (a.kills || 0) || (b.time || 0) - (a.time || 0));
    else if (sort === "recent") list.reverse();
    else list.sort((a, b) => (b.time || 0) - (a.time || 0) || (b.kills || 0) - (a.kills || 0));
    return list.slice(0, limit);
  },

  /** Oro ganado al terminar: kills + bonus tiempo + victoria (tunado a runs de 15 min). */
  goldForRun(kills, time, won) {
    return Math.max(0, kills + Math.floor(time / 20) + (won ? 50 : 0));
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

  settings() {
    const d = this.defaults().settings;
    const s = this.load().settings || {};
    const out = {};
    for (const k in d) out[k] = Number.isFinite(Number(s[k])) ? RS.clamp(Number(s[k]), 0, 1) : d[k];
    return out;
  },

  setSetting(key, value) {
    if (!(key in this.defaults().settings)) return;
    const cur = this.load();
    cur.settings[key] = RS.clamp(Number(value) || 0, 0, 1);
    this.save(cur);
    if (RS.Audio) RS.Audio.apply();
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

(() => {
  const s = RS.Save.summarize(
    [
      { kills: 3, time: 10, championId: "ashe", won: false, level: 2, gold: 1 },
      { kills: 8, time: 40, championId: "garen", won: true, level: 5, gold: 4 },
      { kills: 1, time: 50, championId: "ashe", won: true, level: 3, gold: 2 },
    ],
    "ashe",
  );
  const top = RS.Save.rankRuns(s.list, "time", 5);
  if (s.runs !== 2 || s.wins !== 1 || s.losses !== 1 || s.kills !== 4 || top[0].time !== 50) {
    throw new Error("RS.Save.summarize");
  }
})();
