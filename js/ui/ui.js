window.RS = window.RS || {};

RS.UI = {
  selectedChampionId: null,
  selectedMetaId: null,

  init(game) {
    this.game = game;
    this.els = {
      overlay: document.getElementById("overlay"),
      menu: document.getElementById("screen-menu"),
      select: document.getElementById("screen-select"),
      meta: document.getElementById("screen-meta"),
      levelup: document.getElementById("screen-levelup"),
      levelupTitle: document.getElementById("levelup-title"),
      pause: document.getElementById("screen-pause"),
      over: document.getElementById("screen-over"),
      champList: document.getElementById("champion-list"),
      upgradeList: document.getElementById("upgrade-list"),
      metaGrid: document.getElementById("meta-grid"),
      menuGold: document.getElementById("menu-gold"),
      metaGold: document.getElementById("meta-gold"),
      metaDetailName: document.getElementById("meta-detail-name"),
      metaDetailDesc: document.getElementById("meta-detail-desc"),
      metaDetailCost: document.getElementById("meta-detail-cost"),
      previewSwatch: document.getElementById("preview-swatch"),
      previewName: document.getElementById("preview-name"),
      previewBlurb: document.getElementById("preview-blurb"),
      previewStats: document.getElementById("preview-stats"),
      previewWeapon: document.getElementById("preview-weapon"),
      btnPlay: document.getElementById("btn-play"),
      btnStart: document.getElementById("btn-start"),
      btnSelectBack: document.getElementById("btn-select-back"),
      btnMeta: document.getElementById("btn-meta"),
      btnMetaBack: document.getElementById("btn-meta-back"),
      btnMetaBuy: document.getElementById("btn-meta-buy"),
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

    this.els.btnPlay.addEventListener("click", () => this.showSelect());
    this.els.btnStart.addEventListener("click", () => {
      if (!this.selectedChampionId) return;
      game.startRun(this.selectedChampionId);
    });
    this.els.btnSelectBack.addEventListener("click", () => this.show("menu"));
    this.els.btnMeta.addEventListener("click", () => this.showMeta());
    this.els.btnMetaBack.addEventListener("click", () => {
      this.refreshGold();
      this.show("menu");
    });
    this.els.btnMetaBuy.addEventListener("click", () => this.buySelectedMeta());
    this.els.btnMetaRefund.addEventListener("click", () => {
      RS.Save.refundMeta();
      this.renderMetaGrid();
      this.refreshMetaDetail();
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
    const area = 1 + (m.area || 0);
    const cd = Math.max(0.35, 1 - (m.cooldown || 0));
    const regen = m.regen || 0;

    this.els.previewSwatch.style.background = c.color;
    this.els.previewName.textContent = c.name;
    this.els.previewBlurb.textContent = c.blurb;
    this.els.previewStats.innerHTML = `
      <div class="preview-stat"><span>HP</span><strong>${RS.formatStat(hp, 0)}</strong></div>
      <div class="preview-stat"><span>Velocidad</span><strong>${speed}</strong></div>
      <div class="preview-stat"><span>Daño</span><strong>×${RS.formatStat(dmg, 2)}</strong></div>
      <div class="preview-stat"><span>Cadencia</span><strong>×${RS.formatStat(cd, 2)}</strong></div>
      <div class="preview-stat"><span>Área</span><strong>×${RS.formatStat(area, 2)}</strong></div>
      <div class="preview-stat"><span>Regen</span><strong>${RS.formatStat(regen)}/s</strong></div>`;

    const wid = c.startWeapons?.[0];
    const w = wid ? RS.weaponById(wid) : null;
    if (w) {
      this.els.previewWeapon.innerHTML = `
        <div class="preview-weapon-label">Arma inicial</div>
        <div class="preview-weapon-row">
          <div class="preview-weapon-icon" style="background:${w.color}"></div>
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
    const g = RS.Save.load().gold || 0;
    const text = `Oro: ${g}`;
    if (this.els.menuGold) this.els.menuGold.textContent = text;
    if (this.els.metaGold) this.els.metaGold.textContent = text;
  },

  showMeta() {
    if (!this.selectedMetaId) this.selectedMetaId = RS.META_UPGRADES[0]?.id || null;
    this.renderMetaGrid();
    this.refreshMetaDetail();
    this.refreshGold();
    this.show("meta");
  },

  renderMetaGrid() {
    const gold = RS.Save.load().gold || 0;
    this.els.metaGrid.innerHTML = "";
    for (const def of RS.META_UPGRADES) {
      const rank = RS.metaRank(def.id);
      const maxed = rank >= def.maxRank;
      const cost = RS.metaNextCost(def.id);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "meta-card";
      if (this.selectedMetaId === def.id) btn.classList.add("selected");
      if (maxed) btn.classList.add("maxed");
      else if (gold < cost) btn.classList.add("locked");

      let pips = "";
      for (let i = 1; i <= def.maxRank; i++) {
        pips += `<span class="meta-pip${i <= rank ? " on" : ""}"></span>`;
      }

      btn.innerHTML = `
        <span class="meta-card-name">${def.name}</span>
        <div class="meta-card-icon" style="background:${def.color}">${this._glyph(def.id)}</div>
        <div class="meta-pips">${pips}</div>
        <span class="meta-card-rank">${rank}/${def.maxRank}</span>`;
      btn.addEventListener("click", () => {
        this.selectedMetaId = def.id;
        this.renderMetaGrid();
        this.refreshMetaDetail();
      });
      this.els.metaGrid.appendChild(btn);
    }
  },

  refreshMetaDetail() {
    const def = RS.metaById(this.selectedMetaId);
    if (!def) {
      this.els.metaDetailName.textContent = "—";
      this.els.metaDetailDesc.textContent = "Elige un stat";
      this.els.metaDetailCost.textContent = "";
      this.els.btnMetaBuy.disabled = true;
      return;
    }
    const rank = RS.metaRank(def.id);
    const gold = RS.Save.load().gold || 0;
    const cost = RS.metaNextCost(def.id);
    const maxed = rank >= def.maxRank;
    this.els.metaDetailName.textContent = def.name;
    this.els.metaDetailDesc.textContent = def.desc;
    if (maxed) {
      this.els.metaDetailCost.textContent = "Máximo";
      this.els.btnMetaBuy.disabled = true;
      this.els.btnMetaBuy.textContent = "Máximo";
    } else {
      this.els.metaDetailCost.textContent = `Costo: ${cost}`;
      this.els.btnMetaBuy.disabled = gold < cost;
      this.els.btnMetaBuy.textContent = "Comprar";
    }
  },

  buySelectedMeta() {
    if (!this.selectedMetaId) return;
    const res = RS.Save.buyMeta(this.selectedMetaId);
    if (!res.ok) return;
    this.renderMetaGrid();
    this.refreshMetaDetail();
    this.refreshGold();
  },

  show(screen) {
    const map = {
      menu: this.els.menu,
      select: this.els.select,
      meta: this.els.meta,
      levelup: this.els.levelup,
      pause: this.els.pause,
      over: this.els.over,
    };
    for (const el of Object.values(map)) el.classList.add("hidden");
    if (screen && map[screen]) map[screen].classList.remove("hidden");
    const hideHud =
      screen === "menu" || screen === "select" || screen === "meta" || screen === "over";
    this.els.hud.classList.toggle("hidden", hideHud);
    this.els.loadout.classList.toggle("hidden", hideHud);
    this.els.overlay.style.pointerEvents = screen ? "auto" : "none";
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
        <div class="upgrade-head">
          <strong>${u.name}</strong>
          <span class="chip chip-${chip.tone}">${chip.text}</span>
        </div>
        <span class="upgrade-desc">${u.desc}</span>`;
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
    // Placeholder hasta assets reales (arma / mejora / stats)
    if (kind === "weapon") {
      return `<svg class="loadout-glyph" viewBox="0 0 16 16" aria-hidden="true"><path fill="#fff" d="M8 1l1.2 4.2H14l-3.5 2.6L11.8 13 8 10.2 4.2 13l1.3-5.2L2 5.2h4.8z"/></svg>`;
    }
    if (kind === "mejora" || kind === "passive") {
      return `<svg class="loadout-glyph" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5" fill="none" stroke="#fff" stroke-width="1.6"/><circle cx="8" cy="8" r="2" fill="#fff"/></svg>`;
    }
    const paths = {
      hp: `<path fill="#fff" d="M8 14S2 9.5 2 5.8C2 3.6 3.7 2 5.7 2c1.2 0 2.2.6 2.3 1.5C8.1 2.6 9.1 2 10.3 2 12.3 2 14 3.6 14 5.8 14 9.5 8 14 8 14z"/>`,
      regen: `<path fill="#fff" d="M8 2v4l2.5-1.5L8 2zm0 12V10l-2.5 1.5L8 14zM2 8h4L4.5 5.5 2 8zm12 0h-4l1.5 2.5L14 8z"/>`,
      speed: `<path fill="#fff" d="M3 11l5-9 1.2 4.2L15 8l-5 9-1.2-4.2z"/>`,
      damage: `<path fill="#fff" d="M9.5 1.5L14 6l-7.5 7.5H2.5V9L9.5 1.5z"/>`,
      cooldown: `<path fill="#fff" d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 2v4.2l3 1.8-.8 1.2L7 9V4h1z"/>`,
      area: `<path fill="none" stroke="#fff" stroke-width="1.5" d="M8 2.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11z"/><circle cx="8" cy="8" r="1.5" fill="#fff"/>`,
      default: `<circle cx="8" cy="8" r="3" fill="#fff"/>`,
    };
    const d = paths[kind] || paths.default;
    return `<svg viewBox="0 0 16 16" aria-hidden="true">${d}</svg>`;
  },

  _pauseRowsHtml(rows) {
    if (!rows.length) {
      return `<div class="pause-stat empty"><span class="pause-stat-name">—</span></div>`;
    }
    return rows
      .map((row) => {
        const bg = row.color || "#334155";
        return `<div class="pause-stat">
          <div class="pause-stat-icon" style="background:${bg}">${this._glyph(row.icon)}</div>
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
    const bg = empty ? "#1a2438" : color || "#64748b";
    const glyph = empty ? "" : this._glyph(kind);
    const tip = title ? ` title="${title}"` : "";
    return `<div class="loadout-slot${empty ? " empty" : ""}"${tip}>
      <div class="loadout-icon" style="background:${bg}">${glyph}</div>
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
        this._loadoutSlot(def?.color, w.level, "weapon", false, def?.name || w.id)
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
        this._loadoutSlot(def?.color, pas.level, "mejora", false, def?.name || pas.id)
      );
    }
    this.els.loadoutPassives.innerHTML = passives.join("");
  },
};
