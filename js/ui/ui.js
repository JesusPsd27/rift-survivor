window.RS = window.RS || {};

RS.UI = {
  selectedChampionId: null,

  init(game) {
    this.game = game;
    this.els = {
      overlay: document.getElementById("overlay"),
      menu: document.getElementById("screen-menu"),
      levelup: document.getElementById("screen-levelup"),
      pause: document.getElementById("screen-pause"),
      over: document.getElementById("screen-over"),
      champList: document.getElementById("champion-list"),
      upgradeList: document.getElementById("upgrade-list"),
      btnStart: document.getElementById("btn-start"),
      btnResume: document.getElementById("btn-resume"),
      btnQuit: document.getElementById("btn-quit"),
      btnAgain: document.getElementById("btn-again"),
      btnMenu: document.getElementById("btn-menu"),
      best: document.getElementById("best-stats"),
      hud: document.getElementById("hud"),
      hudName: document.getElementById("hud-name"),
      hudLevel: document.getElementById("hud-level"),
      hudTime: document.getElementById("hud-time"),
      hudKills: document.getElementById("hud-kills"),
      hpFill: document.getElementById("hp-fill"),
      xpFill: document.getElementById("xp-fill"),
      overTitle: document.getElementById("over-title"),
      overStats: document.getElementById("over-stats"),
    };

    this.renderChampions();
    this.refreshBest();

    this.els.btnStart.addEventListener("click", () => {
      if (!this.selectedChampionId) return;
      game.startRun(this.selectedChampionId);
    });
    this.els.btnResume.addEventListener("click", () => game.resume());
    this.els.btnQuit.addEventListener("click", () => game.toMenu());
    this.els.btnAgain.addEventListener("click", () => {
      if (this.selectedChampionId) game.startRun(this.selectedChampionId);
    });
    this.els.btnMenu.addEventListener("click", () => game.toMenu());
  },

  renderChampions() {
    this.els.champList.innerHTML = "";
    for (const c of RS.CHAMPIONS) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "champ-card";
      btn.innerHTML = `<div class="swatch" style="background:${c.color}"></div>
        <div><strong>${c.name}</strong><span>${c.blurb}</span></div>`;
      btn.addEventListener("click", () => {
        this.selectedChampionId = c.id;
        this.els.champList.querySelectorAll(".champ-card").forEach((el) => {
          el.classList.toggle("selected", el === btn);
        });
        this.els.btnStart.disabled = false;
      });
      this.els.champList.appendChild(btn);
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

  show(screen) {
    const map = {
      menu: this.els.menu,
      levelup: this.els.levelup,
      pause: this.els.pause,
      over: this.els.over,
    };
    for (const el of Object.values(map)) el.classList.add("hidden");
    if (screen && map[screen]) map[screen].classList.remove("hidden");
    this.els.hud.classList.toggle("hidden", screen === "menu" || !screen);
    this.els.overlay.style.pointerEvents = screen ? "auto" : "none";
  },

  showLevelUp(choices, onPick) {
    this.els.upgradeList.innerHTML = "";
    for (const u of choices) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "upgrade-card";
      btn.innerHTML = `<strong>${u.name}</strong><span>${u.desc}</span>`;
      btn.addEventListener("click", () => onPick(u));
      this.els.upgradeList.appendChild(btn);
    }
    this.show("levelup");
  },

  showGameOver(won, stats) {
    this.els.overTitle.textContent = won ? "Victoria" : "Derrota";
    this.els.overStats.textContent = `Tiempo ${RS.formatTime(stats.time)} · Nivel ${stats.level} · ${stats.kills} kills`;
    this.refreshBest();
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
  },
};
