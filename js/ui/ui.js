window.RS = window.RS || {};

RS.UI = {
  selectedChampionId: null,

  init(game) {
    this.game = game;
    this.els = {
      overlay: document.getElementById("overlay"),
      menu: document.getElementById("screen-menu"),
      select: document.getElementById("screen-select"),
      meta: document.getElementById("screen-meta"),
      stats: document.getElementById("screen-stats"),
      levelup: document.getElementById("screen-levelup"),
      levelupTitle: document.getElementById("levelup-title"),
      pause: document.getElementById("screen-pause"),
      over: document.getElementById("screen-over"),
      champList: document.getElementById("champion-list"),
      upgradeList: document.getElementById("upgrade-list"),
      metaGrid: document.getElementById("meta-grid"),
      menuGold: document.getElementById("menu-gold"),
      metaGold: document.getElementById("meta-gold"),
      previewSwatch: document.getElementById("preview-swatch"),
      previewName: document.getElementById("preview-name"),
      previewBlurb: document.getElementById("preview-blurb"),
      previewStats: document.getElementById("preview-stats"),
      previewWeapon: document.getElementById("preview-weapon"),
      btnPlay: document.getElementById("btn-play"),
      btnStart: document.getElementById("btn-start"),
      btnSelectBack: document.getElementById("btn-select-back"),
      btnMeta: document.getElementById("btn-meta"),
      btnStats: document.getElementById("btn-stats"),
      btnStatsBack: document.getElementById("btn-stats-back"),
      btnSettings: document.getElementById("btn-settings"),
      btnCredits: document.getElementById("btn-credits"),
      settings: document.getElementById("screen-settings"),
      credits: document.getElementById("screen-credits"),
      vols: [...document.querySelectorAll("#screen-settings input[data-vol]")],
      btnPauseSettings: document.getElementById("btn-pause-settings"),
      btnFullscreen: document.getElementById("btn-fullscreen"),
      btnSettingsBack: document.getElementById("btn-settings-back"),
      btnCreditsBack: document.getElementById("btn-credits-back"),
      statsChampion: document.getElementById("stats-champion"),
      statsChampPills: document.getElementById("stats-champ-pills"),
      statsHero: document.getElementById("stats-hero"),
      statsSummary: document.getElementById("stats-summary"),
      statsSortTabs: document.getElementById("stats-sort-tabs"),
      statsTimes: document.getElementById("stats-times"),
      btnMetaBack: document.getElementById("btn-meta-back"),
      btnMetaRefund: document.getElementById("btn-meta-refund"),
      btnResume: document.getElementById("btn-resume"),
      btnQuit: document.getElementById("btn-quit"),
      btnAgain: document.getElementById("btn-again"),
      btnMenu: document.getElementById("btn-menu"),
      best: document.getElementById("best-stats"),
      hud: document.getElementById("hud"),
      loadout: document.getElementById("loadout"),
      loadoutWeapons: document.getElementById("loadout-weapons"),
      loadoutPassives: document.getElementById("loadout-passives"),
      hudName: document.getElementById("hud-name"),
      hudLevel: document.getElementById("hud-level"),
      hudTime: document.getElementById("hud-time"),
      hudKills: document.getElementById("hud-kills"),
      hpFill: document.getElementById("hp-fill"),
      xpFill: document.getElementById("xp-fill"),
      hpText: document.getElementById("hp-text"),
      xpText: document.getElementById("xp-text"),
      pauseMeta: document.getElementById("pause-meta"),
      pauseStatsBase: document.getElementById("pause-stats-base"),
      pauseStatsWeapons: document.getElementById("pause-stats-weapons"),
      pauseStatsMejoras: document.getElementById("pause-stats-mejoras"),
      overTitle: document.getElementById("over-title"),
      overStats: document.getElementById("over-stats"),
    };

    this.refreshBest();
    this.refreshGold();
    this._fillStatsFilter();

    this.els.menu.addEventListener("click", (e) => {
      if (e.target.closest(".menu-stack button")) RS.Audio.click();
    });
    this.els.overlay.addEventListener("click", (e) => {
      if (e.target.closest("[id$='-back']")) RS.Audio.back();
    });
    this.els.btnPlay.addEventListener("click", () => this.showSelect());
    this.els.btnStart.addEventListener("click", () => {
      if (!this.selectedChampionId) return;
      game.startRun(this.selectedChampionId);
    });
    this.els.btnSelectBack.addEventListener("click", () => this.show("menu"));
    this.els.btnMeta.addEventListener("click", () => this.showMeta());
    this.els.btnStats.addEventListener("click", () => this.showStats());
    this.els.btnStatsBack.addEventListener("click", () => this.show("menu"));
    this.els.btnSettings.addEventListener("click", () => this.showSettings());
    this.els.btnCredits.addEventListener("click", () => this.show("credits"));
    this.els.btnSettingsBack.addEventListener("click", () => this.closeSettings());
    this.els.btnPauseSettings.addEventListener("click", () => this.showSettings());
    this.els.btnCreditsBack.addEventListener("click", () => this.show("menu"));
    for (const input of this.els.vols) this._bindVolume(input);
    this.els.btnFullscreen.addEventListener("click", () => this.toggleFullscreen());
    document.addEventListener("fullscreenchange", () => this.syncFullscreen());
    this._statsSort = "time";
    this.els.statsChampPills.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-champ]");
      if (!btn) return;
      this.els.statsChampion.value = btn.dataset.champ;
      this.renderStats();
    });
    this.els.statsSortTabs.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-sort]");
      if (!btn) return;
      this._statsSort = btn.dataset.sort;
      this.renderStats();
    });
    this.els.btnMetaBack.addEventListener("click", () => {
      this.refreshGold();
      this.show("menu");
    });
    this.els.btnMetaRefund.addEventListener("click", () => {
      RS.Save.refundMeta();
      RS.Audio.refund();
      this.renderMetaGrid();
      this.refreshGold();
    });
    this.els.btnResume.addEventListener("click", () => game.resume());
    this.els.btnQuit.addEventListener("click", () => game.toMenu());
    this.els.btnAgain.addEventListener("click", () => {
      if (this.selectedChampionId) game.startRun(this.selectedChampionId);
      else this.showSelect();
    });
    this.els.btnMenu.addEventListener("click", () => game.toMenu());
  },

  showSelect() {
    if (!this.selectedChampionId && RS.CHAMPIONS[0]) {
      this.selectedChampionId = RS.CHAMPIONS[0].id;
    }
    this.renderChampions();
    this.refreshChampPreview();
    this.els.btnStart.disabled = !this.selectedChampionId;
    this.show("select");
  },

  renderChampions() {
    this.els.champList.innerHTML = "";
    for (const c of RS.CHAMPIONS) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "champ-card";
      if (this.selectedChampionId === c.id) btn.classList.add("selected");
      btn.innerHTML = `<div class="swatch" style="background:${c.color}"></div>
        <div><strong>${c.name}</strong><span>${c.blurb}</span></div>`;
      btn.addEventListener("click", () => {
        this.selectedChampionId = c.id;
        RS.Audio.pick();
        this.renderChampions();
        this.refreshChampPreview();
        this.els.btnStart.disabled = false;
      });
      this.els.champList.appendChild(btn);
    }
  },

  refreshChampPreview() {
    const c = RS.CHAMPIONS.find((x) => x.id === this.selectedChampionId);
    if (!c) {
      this.els.previewSwatch.style.background = "#334155";
      this.els.previewName.textContent = "—";
      this.els.previewBlurb.textContent = "Selecciona un campeón";
      this.els.previewStats.innerHTML = "";
      this.els.previewWeapon.innerHTML = "";
      return;
    }

    const m = typeof RS.getMetaBonuses === "function" ? RS.getMetaBonuses() : {};
    const hp = c.hp + (m.hp || 0);
    const speed = Math.round(c.speed * (1 + (m.speed || 0)));
    const dmg = 1 + (m.damage || 0);
    const size = 1 + (m.size || 0);
    const cd = Math.max(0.35, 1 - (m.cooldown || 0));
    const regen = m.regen || 0;
    const armor = (m.armor || 0) * 100;
    const magnet = Math.round(90 * (1 + (m.magnet || 0)));
    const xp = 1 + (m.xp || 0);

    this.els.previewSwatch.style.background = c.color;
    this.els.previewName.textContent = c.name;
    this.els.previewBlurb.textContent = c.blurb;
    this.els.previewStats.innerHTML = `
      <div class="preview-stat"><span>HP</span><strong>${RS.formatStat(hp, 0)}</strong></div>
      <div class="preview-stat"><span>Velocidad</span><strong>${speed}</strong></div>
      <div class="preview-stat"><span>Daño</span><strong>×${RS.formatStat(dmg, 2)}</strong></div>
      <div class="preview-stat"><span>Cooldown</span><strong>×${RS.formatStat(cd, 2)}</strong></div>
      <div class="preview-stat"><span>Tamaño</span><strong>×${RS.formatStat(size, 2)}</strong></div>
      <div class="preview-stat"><span>Regen</span><strong>${RS.formatStat(regen)}/s</strong></div>
      <div class="preview-stat"><span>Armadura</span><strong>${RS.formatStat(armor)}%</strong></div>
      <div class="preview-stat"><span>Imán</span><strong>${magnet}</strong></div>
      <div class="preview-stat"><span>Experiencia</span><strong>×${RS.formatStat(xp, 2)}</strong></div>`;

    const wid = c.startWeapons?.[0];
    const w = wid ? RS.weaponById(wid) : null;
    if (w) {
      this.els.previewWeapon.innerHTML = `
        <div class="preview-weapon-label">Arma inicial</div>
        <div class="preview-weapon-row">
          <div class="preview-weapon-icon">${this._glyph(w.id)}</div>
          <div>
            <strong>${w.name}</strong>
            <span>${w.desc}</span>
          </div>
        </div>`;
    } else {
      this.els.previewWeapon.innerHTML = "";
    }
  },

  refreshBest() {
    const s = RS.Save.load();
    if (!s.bestKills && !s.bestTime) {
      this.els.best.textContent = "Sin récords aún · WASD mover · Esc pausa";
      return;
    }
    this.els.best.textContent = `Mejor: ${s.bestKills} kills · ${RS.formatTime(s.bestTime)}${
      s.bestChampion ? ` · ${s.bestChampion}` : ""
    }`;
  },

  refreshGold() {
    const text = `Oro: ${RS.Save.load().gold || 0}`;
    for (const el of [this.els.menuGold, this.els.metaGold]) {
      const amount = el?.querySelector(".gold-amount");
      if (amount) amount.textContent = text;
    }
  },

  _coinIcon() {
    return `<svg class="gold-icon" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="#e6c15a" stroke="#8a6a28" stroke-width="1.2"/><circle cx="8" cy="8" r="4.1" fill="none" stroke="#8a6a28" stroke-width="0.8"/><path d="M8 4.4v7.2M6.1 6.1h2.5a1.15 1.15 0 0 1 0 2.3H6.5a1.15 1.15 0 0 0 0 2.3h2.7" fill="none" stroke="#6b5018" stroke-width="0.9" stroke-linecap="round"/></svg>`;
  },

  showMeta() {
    this.renderMetaGrid();
    this.refreshGold();
    this.show("meta");
  },

  _fillStatsFilter() {
    // pills se redibujan en renderStats; el hidden input guarda el filtro
    this.els.statsChampion.value = "";
  },

  _champName(id) {
    return RS.CHAMPIONS.find((c) => c.id === id)?.name || id || "—";
  },

  _champColor(id) {
    return RS.CHAMPIONS.find((c) => c.id === id)?.color || "#8b9bb4";
  },

  _champAvatar(id, sizeClass = "") {
    const name = this._champName(id);
    const initial = (name || "?").charAt(0).toUpperCase();
    const color = this._champColor(id);
    return `<span class="stats-avatar ${sizeClass}" style="--champ:${color}" title="${name}">${initial}</span>`;
  },

  _statsIcon(kind) {
    const common = `class="stats-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`;
    const paths = {
      swords: `<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6"/><path d="m16 16 4 4"/><path d="m9.5 6.5 8-3.5L21 6l-3.5 8"/><path d="m14.5 14.5 6 6"/>`,
      clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
      hourglass: `<path d="M6 3h12"/><path d="M6 21h12"/><path d="M8 3c0 5 2.5 6.5 4 8 1.5 1.5 4 3 4 8"/><path d="M16 3c0 5-2.5 6.5-4 8-1.5 1.5-4 3-4 8"/>`,
      star: `<path d="m12 3 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9 7.2 18l.9-5.4L4.2 8.7l5.4-.8z"/>`,
      skull: `<path d="M12 3c-4.4 0-8 3.1-8 7.5 0 2.6 1.3 4.6 3.2 5.8V19h9.6v-2.7c1.9-1.2 3.2-3.2 3.2-5.8C20 6.1 16.4 3 12 3z"/><circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none"/>`,
      coin: `<circle cx="12" cy="12" r="8"/><path d="M12 7v10M9.5 9.5h3.2a1.6 1.6 0 0 1 0 3.2H9.8a1.6 1.6 0 0 0 0 3.2H14"/>`,
      chart: `<path d="M4 19h16"/><path d="M7 16v-5"/><path d="M12 16V8"/><path d="M17 16v-8"/>`,
    };
    return `<svg ${common}>${paths[kind] || paths.star}</svg>`;
  },

  showStats() {
    this.renderStats();
    this.show("stats");
  },

  renderStats() {
    const id = this.els.statsChampion.value || null;
    const s = RS.Save.summarize(RS.Save.load().runs, id || null);
    const winRate = s.runs ? Math.round((s.wins / s.runs) * 100) : 0;
    const avgTime = s.runs ? s.time / s.runs : 0;
    const kpm = s.time > 0 ? (s.kills / s.time) * 60 : 0;
    const goldAvg = s.runs ? Math.round(s.gold / s.runs) : 0;

    this._renderStatsPills(id);
    this._renderStatsSortTabs();

    const ring = Math.max(0, Math.min(100, winRate));
    this.els.statsHero.innerHTML = `
      <div class="stats-records-panel">
        <div class="stats-ring">
          <svg viewBox="0 0 36 36" aria-hidden="true">
            <circle class="stats-ring-track" cx="18" cy="18" r="15.5" />
            <circle class="stats-ring-fill" cx="18" cy="18" r="15.5"
              stroke-dasharray="${ring} ${100 - ring}" />
          </svg>
          <div class="stats-ring-label">
            <strong>${winRate}%</strong>
            <span>victoria</span>
          </div>
          <div class="stats-ring-sub">${s.wins} V · ${s.losses} D</div>
        </div>
        <div class="stats-records">
          <div class="stats-record">
            ${this._statsIcon("clock")}
            <span class="stats-record-label">Mejor tiempo</span>
            <strong>${RS.formatTime(s.bestTime)}</strong>
            <em>${s.bestTimeChamp ? this._champName(s.bestTimeChamp) : "—"}</em>
          </div>
          <div class="stats-record">
            ${this._statsIcon("swords")}
            <span class="stats-record-label">Mejor kills</span>
            <strong>${s.bestKills}</strong>
            <em>${s.bestKillsChamp ? this._champName(s.bestKillsChamp) : "—"}</em>
          </div>
          <div class="stats-record">
            ${this._statsIcon("star")}
            <span class="stats-record-label">Nivel máximo</span>
            <strong>${s.bestLevel || 0}</strong>
            <em>${s.bestLevelChamp ? this._champName(s.bestLevelChamp) : "—"}</em>
          </div>
        </div>
      </div>`;

    this.els.statsSummary.innerHTML = `
      <div class="stats-strip-item">
        ${this._statsIcon("swords")}
        <div>
          <span>Partidas</span>
          <strong>${s.runs}</strong>
          <em>${s.wins} ganada${s.wins === 1 ? "" : "s"} · ${s.losses} perdida${s.losses === 1 ? "" : "s"}</em>
        </div>
      </div>
      <div class="stats-strip-item">
        ${this._statsIcon("hourglass")}
        <div>
          <span>Tiempo jugado</span>
          <strong>${RS.formatTime(s.time)}</strong>
          <em>${s.runs ? `≈ ${RS.formatTime(avgTime)} / partida` : "—"}</em>
        </div>
      </div>
      <div class="stats-strip-item">
        ${this._statsIcon("skull")}
        <div>
          <span>Kills</span>
          <strong>${s.kills}</strong>
          <em>${s.time ? `≈ ${kpm.toFixed(1)} / min` : "—"}</em>
        </div>
      </div>
      <div class="stats-strip-item">
        ${this._statsIcon("coin")}
        <div>
          <span>Oro ganado</span>
          <strong>${s.gold}</strong>
          <em>${s.runs ? `≈ ${goldAvg} / partida` : "—"}</em>
        </div>
      </div>`;

    const top = RS.Save.rankRuns(s.list, this._statsSort || "time", 5);
    if (!top.length) {
      this.els.statsTimes.innerHTML = `<div class="stats-empty">Sin partidas todavía</div>`;
      return;
    }
    this.els.statsTimes.innerHTML = top
      .map((r, i) => {
        const medal = i < 3 ? ` medal-${i + 1}` : "";
        const badge = r.won
          ? `<span class="stats-badge win">Victoria</span>`
          : `<span class="stats-badge loss">Derrota</span>`;
        return `<div class="stats-time">
          <span class="rank${medal}">${i + 1}</span>
          ${this._champAvatar(r.championId)}
          <span class="stats-time-name">${this._champName(r.championId)}</span>
          <span class="when">${RS.formatTime(r.time)}</span>
          <span class="stats-time-kills">${this._statsIcon("swords")} ${r.kills}</span>
          ${badge}
        </div>`;
      })
      .join("");
  },

  _renderStatsPills(activeId) {
    const cur = activeId || "";
    const pills = [
      { id: "", name: "Todos", color: null },
      ...RS.CHAMPIONS.map((c) => ({ id: c.id, name: c.name, color: c.color })),
    ];
    this.els.statsChampPills.innerHTML = pills
      .map((p) => {
        const on = p.id === cur ? " on" : "";
        const av = p.id
          ? this._champAvatar(p.id, "sm")
          : `<span class="stats-avatar sm all" aria-hidden="true">◈</span>`;
        return `<button type="button" class="stats-pill${on}" data-champ="${p.id}">${av}<span>${p.name}</span></button>`;
      })
      .join("");
  },

  _renderStatsSortTabs() {
    const cur = this._statsSort || "time";
    const tabs = [
      { id: "time", label: "Tiempo" },
      { id: "kills", label: "Kills" },
      { id: "recent", label: "Recientes" },
    ];
    this.els.statsSortTabs.innerHTML = tabs
      .map(
        (t) =>
          `<button type="button" class="stats-sort-tab${t.id === cur ? " on" : ""}" data-sort="${t.id}">${t.label}</button>`
      )
      .join("");
  },

  renderMetaGrid() {
    const gold = RS.Save.load().gold || 0;
    this.els.metaGrid.innerHTML = "";
    for (const def of RS.META_UPGRADES) {
      const rank = RS.metaRank(def.id);
      const maxed = rank >= def.maxRank;
      const cost = RS.metaNextCost(def.id);
      const card = document.createElement("div");
      card.className = "meta-card";
      if (maxed) card.classList.add("maxed");
      else if (gold < cost) card.classList.add("locked");

      let pips = "";
      for (let i = 1; i <= def.maxRank; i++) {
        pips += `<span class="meta-pip${i <= rank ? " on" : ""}"></span>`;
      }

      const buyLabel = maxed ? "Máximo" : `Comprar ${def.name} por ${cost}`;
      const buyInner = maxed
        ? "Máx"
        : `${this._coinIcon()}<span>${cost}</span>`;

      card.innerHTML = `
        <span class="meta-card-name">${def.name}</span>
        <span class="meta-card-gain">${maxed ? "Nivel máximo" : this._gain(def)}</span>
        <div class="meta-card-icon">${this._glyph(def.id)}</div>
        <div class="meta-card-progress">
          <div class="meta-pips">${pips}</div>
          <span class="meta-card-rank">${rank}/${def.maxRank}</span>
        </div>
        <button type="button" class="meta-buy" aria-label="${buyLabel}" ${maxed || gold < cost ? "disabled" : ""}>${buyInner}</button>`;

      card.querySelector(".meta-buy").addEventListener("click", () => this.buyMeta(def.id));
      this.els.metaGrid.appendChild(card);
    }
  },

  _gain(def) {
    const pct = Math.round(def.perRank * 100);
    const text = {
      damage: `+${pct}% daño`,
      cooldown: `−${pct}% cooldown`,
      hp: `+${def.perRank} HP`,
      regen: `+${def.perRank} HP/s`,
      size: `+${pct}% tamaño`,
      speed: `+${pct}% velocidad`,
      armor: `+${pct}% reducción`,
      magnet: `+${pct}% imán`,
      xp: `+${pct}% experiencia`,
    };
    return text[def.id] || def.desc;
  },

  buyMeta(id) {
    const res = RS.Save.buyMeta(id);
    if (!res.ok) return;
    RS.Audio.buy();
    this.renderMetaGrid();
    this.refreshGold();
  },

  showSettings() {
    this.syncSettings();
    this.show("settings");
  },

  /** Vuelve a la pausa si se abrió desde una partida. */
  closeSettings() {
    this.show(this.game.mode === "pause" ? "pause" : "menu");
  },

  _bindVolume(input) {
    input.addEventListener("input", () => {
      const pct = Number(input.value);
      input.closest(".setting").querySelector("strong").textContent = `${pct}%`;
      RS.Save.setSetting(input.dataset.vol, pct / 100);
    });
  },

  syncSettings() {
    const s = RS.Save.settings();
    for (const input of this.els.vols) {
      const pct = Math.round(s[input.dataset.vol] * 100);
      input.value = String(pct);
      input.closest(".setting").querySelector("strong").textContent = `${pct}%`;
    }
    this.syncFullscreen();
  },

  syncFullscreen() {
    this.els.btnFullscreen.textContent = document.fullscreenElement
      ? "Salir de pantalla completa"
      : "Pantalla completa";
  },

  toggleFullscreen() {
    const p = document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen();
    p.catch(() => {});
  },

  show(screen) {
    const map = {
      menu: this.els.menu,
      select: this.els.select,
      meta: this.els.meta,
      stats: this.els.stats,
      settings: this.els.settings,
      credits: this.els.credits,
      levelup: this.els.levelup,
      pause: this.els.pause,
      over: this.els.over,
    };
    const menuScreen =
      screen === "menu" ||
      screen === "select" ||
      screen === "meta" ||
      screen === "stats" ||
      screen === "settings" ||
      screen === "credits";
    const prev = this._screen;
    this._screen = screen;
    for (const el of Object.values(map)) {
      el.classList.add("hidden");
      el.classList.remove("panel-in");
    }
    const next = screen && map[screen];
    if (next) {
      next.classList.remove("hidden");
      if (prev && prev !== screen && menuScreen) {
        void next.offsetWidth;
        next.classList.add("panel-in");
      }
    }
    const inRun = this.game.mode !== "menu";
    const hideHud =
      screen === "over" || screen === "pause" || (menuScreen && !inRun);
    this.els.hud.classList.toggle("hidden", hideHud);
    this.els.loadout.classList.toggle("hidden", hideHud);
    this.els.overlay.style.pointerEvents = screen ? "auto" : "none";
    if (RS.Audio) RS.Audio.setMenu(RS.Audio.hub(screen) && !inRun);
  },

  showLevelUp(playerLevel, choices, onPick) {
    this.els.levelupTitle.textContent = `¡Nivel ${playerLevel}!`;
    this.els.upgradeList.innerHTML = "";
    for (const u of choices) {
      const chip = u.chip || { tone: "new_mejora", text: "New" };
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "upgrade-card";
      btn.innerHTML = `
        <div class="upgrade-icon">${this._glyph(u.id)}</div>
        <div class="upgrade-body">
          <div class="upgrade-head">
            <strong>${u.name}</strong>
            <span class="chip chip-${chip.tone}">${chip.text}</span>
          </div>
          <span class="upgrade-desc">${u.desc}</span>
        </div>`;
      btn.addEventListener("click", () => onPick(u));
      this.els.upgradeList.appendChild(btn);
    }
    this.show("levelup");
  },

  showPause(state) {
    const p = state.player;
    this.els.pauseMeta.textContent = `${p.name} · Nv ${p.level} · ${RS.formatTime(state.time)} · ${state.kills} kills`;
    this.renderPauseStats(p);
    this.show("pause");
  },

  // Icono: weapons/<id>.png (armas) o stats/<id>.svg (stats).
  // Evoluciones sin icono propio reutilizan el de su arma base; si falta el archivo, glifo genérico.
  _glyph(kind) {
    const box = (inner) =>
      `<svg class="loadout-glyph" viewBox="0 0 16 16" aria-hidden="true">${inner}</svg>`;
    const star = box(
      `<path fill="#fff" d="M8 1l1.2 4.2H14l-3.5 2.6L11.8 13 8 10.2 4.2 13l1.3-5.2L2 5.2h4.8z"/>`,
    );
    if (kind === "mejora" || kind === "passive") {
      return box(
        `<circle cx="8" cy="8" r="5.5" fill="none" stroke="#fff" stroke-width="1.6"/><circle cx="8" cy="8" r="2" fill="#fff"/>`,
      );
    }
    let path;
    let ext = "svg";
    if (RS.weaponById(kind)) {
      const evo = RS.EVOLUTIONS.find((e) => e.resultWeapon === kind);
      path = `weapons/${evo ? evo.fromWeapon : kind}`;
      ext = "png";
    } else if (RS.UPGRADES.some((u) => u.id === kind)) {
      path = `stats/${kind}`;
    } else {
      return star;
    }
    this._starHtml = star;
    return `<img class="pixel" src="icons/${path}.${ext}" alt="" onerror="RS.UI._iconFallback(this)">`;
  },

  _iconFallback(img) {
    img.outerHTML = this._starHtml;
  },

  _pauseRowsHtml(rows) {
    if (!rows.length) {
      return `<div class="pause-stat empty"><span class="pause-stat-name">—</span></div>`;
    }
    return rows
      .map((row) => {
        const glyph = this._glyph(row.icon);
        const plain = glyph.includes("<img");
        const bg = plain || !row.color ? "" : ` style="background:${row.color}"`;
        return `<div class="pause-stat">
          <div class="pause-stat-icon${plain ? " plain" : ""}"${bg}>${glyph}</div>
          <span class="pause-stat-name">${row.label}</span>
          <span class="pause-stat-value">${row.value}</span>
        </div>`;
      })
      .join("");
  },

  renderPauseStats(player) {
    const cols = RS.pauseStatColumns(player);
    this.els.pauseStatsBase.innerHTML = this._pauseRowsHtml(cols.base);
    this.els.pauseStatsWeapons.innerHTML = this._pauseRowsHtml(cols.weapons);
    this.els.pauseStatsMejoras.innerHTML = this._pauseRowsHtml(cols.mejoras);
  },

  showGameOver(won, stats) {
    this.els.overTitle.textContent = won ? "Victoria" : "Derrota";
    const goldLine =
      stats.goldEarned != null
        ? ` · +${stats.goldEarned} oro (${stats.goldTotal} total)`
        : "";
    this.els.overStats.textContent = `Tiempo ${RS.formatTime(stats.time)} · Nivel ${stats.level} · ${stats.kills} kills${goldLine}`;
    this.refreshBest();
    this.refreshGold();
    this.show("over");
  },

  updateHud(state) {
    const p = state.player;
    this.els.hudName.textContent = p.name;
    this.els.hudLevel.textContent = `Nv ${p.level}`;
    this.els.hudTime.textContent = RS.formatTime(state.time);
    this.els.hudKills.textContent = `${state.kills} kills`;
    this.els.hpFill.style.transform = `scaleX(${RS.clamp(p.hp / p.maxHp, 0, 1)})`;
    this.els.xpFill.style.transform = `scaleX(${RS.clamp(p.xp / p.xpToLevel, 0, 1)})`;
    this.els.hpText.textContent = `${Math.ceil(p.hp)}/${Math.round(p.maxHp)}`;
    this.els.xpText.textContent = `${Math.floor(p.xp)}/${p.xpToLevel}`;
    this.renderLoadout(p);
  },

  _dots(level, max = RS.MAX_LEVEL) {
    let html = "";
    for (let i = 1; i <= max; i++) {
      html += `<span class="loadout-dot${i <= level ? " on" : ""}"></span>`;
    }
    return `<div class="loadout-dots">${html}</div>`;
  },

  _loadoutSlot(color, level, kind, empty, title) {
    const glyph = empty ? "" : this._glyph(kind);
    const tip = title ? ` title="${title}"` : "";
    const bg = color && glyph && !glyph.includes("<img") ? ` style="background:${color}"` : "";
    return `<div class="loadout-slot${empty ? " empty" : ""}"${tip}>
      <div class="loadout-icon"${bg}>${glyph}</div>
      ${this._dots(empty ? 0 : level)}
    </div>`;
  },

  renderLoadout(player) {
    const weapons = [];
    for (let i = 0; i < RS.MAX_WEAPONS; i++) {
      const w = player.weapons[i];
      if (!w) {
        weapons.push(this._loadoutSlot(null, 0, "weapon", true));
        continue;
      }
      const def = RS.weaponById(w.id);
      weapons.push(
        this._loadoutSlot(def?.color, w.level, w.id, false, def?.name || w.id),
      );
    }
    this.els.loadoutWeapons.innerHTML = weapons.join("");

    const passives = [];
    for (let i = 0; i < RS.MAX_PASSIVES; i++) {
      const pas = player.passives[i];
      if (!pas) {
        passives.push(this._loadoutSlot(null, 0, "mejora", true));
        continue;
      }
      const def = RS.upgradeById(pas.id);
      passives.push(
        this._loadoutSlot(null, pas.level, pas.id, false, def?.name || pas.id)
      );
    }
    this.els.loadoutPassives.innerHTML = passives.join("");
  },
};
