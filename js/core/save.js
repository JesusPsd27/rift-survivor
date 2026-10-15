window.RS = window.RS || {};

RS.Save = {
  KEY: "rift-survivor-v1",

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return { bestKills: 0, bestTime: 0, bestChampion: null };
      return { bestKills: 0, bestTime: 0, bestChampion: null, ...JSON.parse(raw) };
    } catch {
      return { bestKills: 0, bestTime: 0, bestChampion: null };
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
};
