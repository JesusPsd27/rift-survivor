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
      statsSummary: document.getElementById("stats-summary"),
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
    this.els.statsChampion.addEventListener("change", () => this.renderStats());
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
    const sel = this.els.statsChampion;
    const all = document.createElement("option");
    all.value = "";
    all.textContent = "Todos";
    sel.appendChild(all);
    for (const c of RS.CHAMPIONS) {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      sel.appendChild(opt);
    }
  },

  _champName(id) {
    return RS.CHAMPIONS.find((c) => c.id === id)?.name || id || "—";
  },

  showStats() {
    this.renderStats();
    this.show("stats");
  },

  renderStats() {
    const id = this.els.statsChampion.value || null;
    const s = RS.Save.summarize(RS.Save.load().runs, id);
    const winRate = s.runs ? Math.round((s.wins / s.runs) * 100) : 0;
    const cells = [
      ["Partidas", s.runs],
      ["Victorias", s.wins],
      ["Derrotas", s.losses],
      ["% victoria", `${winRate}%`],
      ["Kills", s.kills],
      ["Tiempo jugado", RS.formatTime(s.time)],
      ["Mejor tiempo", RS.formatTime(s.bestTime)],
      ["Mejor kills", s.bestKills],
      ["Nivel máximo", s.bestLevel],
      ["Oro ganado", s.gold],
    ];
    this.els.statsSummary.innerHTML = cells
      .map(([label, value]) => `<div class="stats-cell"><span>${label}</span><strong>${value}</strong></div>`)
      .join("");

    if (!s.top.length) {
      this.els.statsTimes.innerHTML = `<div class="stats-empty">Sin partidas todavía</div>`;
      return;
    }
    this.els.statsTimes.innerHTML = s.top
      .map((r, i) => {
        const result = r.won ? "Victoria" : "Derrota";
        return `<div class="stats-time">
          <span class="rank">${i + 1}</span>
          <span>${this._champName(r.championId)}</span>
          <span class="when">${RS.formatTime(r.time)}</span>
          <span>${r.kills} kills · ${result}</span>
        </div>`;
      })
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
        <span class="meta-card-gain">${this._gain(def)}</span>
        <div class="meta-card-icon">${this._glyph(def.id)}</div>
        <div class="meta-pips">${pips}</div>
        <span class="meta-card-rank">${rank}/${def.maxRank}</span>
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
    const hideHud = screen === "over" || (menuScreen && !inRun);
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
    this.renderPauseStats(state.player);
    this.show("pause");
  },

  _glyph(kind) {
    const box = (inner, cls) =>
      `<svg${cls ? ` class="${cls}"` : ""} viewBox="0 0 16 16" aria-hidden="true">${inner}</svg>`;
    const mejora = box(
      `<circle cx="8" cy="8" r="5.5" fill="none" stroke="#fff" stroke-width="1.6"/><circle cx="8" cy="8" r="2" fill="#fff"/>`,
      "loadout-glyph",
    );
    const img = (src) => `<img class="pixel" src="${src}" alt="">`;
    const icons = {
      weapon: box(
        `<path fill="#fff" d="M8 1l1.2 4.2H14l-3.5 2.6L11.8 13 8 10.2 4.2 13l1.3-5.2L2 5.2h4.8z"/>`,
        "loadout-glyph",
      ),
      mejora,
      passive: mejora,
      damage: img("icons/stats/damage.svg"),
      hp: img("icons/stats/hp.svg"),
      regen: img("icons/stats/regen.svg"),
      speed: img("icons/stats/speed.svg"),
      cooldown: img("icons/stats/cooldown.svg"),
      size: img("icons/stats/size.svg"),
      armor: img("icons/stats/armor.svg"),
      magnet: img("icons/stats/magnet.svg"),
      xp: img("icons/stats/xp.svg"),
      recurve_bow: img("icons/weapons/recurve_bow.svg"),
      bamis_cinder: img("icons/weapons/bamis_cinder.svg"),
      fiendish_codex: img("icons/weapons/fiendish_codex.svg"),
    };
    if (Object.prototype.hasOwnProperty.call(icons, kind)) return icons[kind];
    return icons.weapon;
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
