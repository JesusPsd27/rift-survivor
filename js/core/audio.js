window.RS = window.RS || {};

/** Pistas de alex-morgan y juniorsoundays, Pixabay Content License. Crédito no obligatorio. */
RS.Audio = {
  menu: null,
  ui: null,
  wantMenu: false,

  hub(screen) {
    return (
      screen === "menu" ||
      screen === "select" ||
      screen === "meta" ||
      screen === "stats" ||
      screen === "settings" ||
      screen === "credits"
    );
  },

  apply() {
    const s = RS.Save.settings();
    this.sfxUi = s.master * s.sfxUi;
    this.sfxGame = s.master * s.sfxGame;
    this._mix("menu", s.master * s.musicUi);
    this._mix("play", s.master * s.musicGame);
  },

  /** Reparte el volumen de un par de copias según cuánto lleva el loop cruzándose. */
  _mix(name, vol) {
    const t = this.tracks[name];
    if (!t) return;
    const x = this.cross[name];
    t[0].volume = vol * this.fade[name] * (1 - x);
    t[1].volume = vol * this.fade[name] * x;
  },

  tracks: {},
  cross: { menu: 0, play: 0 },
  fade: { menu: 1, play: 1 },
  _fadeTimers: {},
  FADE: 2.5,
  LOOP_XFADE: 3,

  /** Anima `bag[name]` hacia `to`. bag "cross" cruza el loop; si no, es el fade de entrada/salida. */
  _fadeTo(name, to, done, bag = "fade", secs = this.FADE) {
    const id = bag + name;
    clearInterval(this._fadeTimers[id]);
    const from = this[bag][name];
    const t0 = performance.now();
    this._fadeTimers[id] = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / (secs * 1000));
      this[bag][name] = from + (to - from) * k;
      this.apply();
      if (k < 1) return;
      clearInterval(this._fadeTimers[id]);
      // Al terminar el cruce, la copia que entró pasa a ser la principal.
      if (bag === "cross" && to === 1) this.cross[name] = 0;
      if (done) done();
    }, 50);
  },

  /** Dos copias sin loop nativo: al acercarse al final arranca la otra y se cruzan. */
  _pair(src) {
    return [0, 1].map(() => Object.assign(new Audio(src), { preload: "auto" }));
  },

  _watch(name) {
    const t = this.tracks[name];
    const lead = t[this.cross[name] < 0.5 ? 0 : 1];
    if (!lead.duration || lead.paused) return;
    const left = lead.duration - lead.currentTime;
    if (left > this.LOOP_XFADE || this.cross[name] > 0) return;
    const next = t[lead === t[0] ? 1 : 0];
    next.currentTime = 0;
    next.play().catch(() => {});
    this._fadeTo(name, 1, null, "cross", this.LOOP_XFADE);
    // La copia que sale se pausa al terminar el cruce para no gastar decodificación.
    setTimeout(() => {
      if (!lead.paused && lead.currentTime > this.LOOP_XFADE) lead.pause();
    }, this.LOOP_XFADE * 1000 + 300);
  },

  init() {
    this.tracks.menu = this._pair("audio/main-menu.mp3");
    this.tracks.play = this._pair("audio/gameplay.mp3");
    this.menu = this.tracks.menu[0];
    this.play = this.tracks.play[0];
    setInterval(() => {
      this._watch("menu");
      this._watch("play");
    }, 250);
    this.ui = new Audio("audio/ui-click.mp3");
    this.backSnd = new Audio("audio/ui-back.mp3");
    this.pickSnd = new Audio("audio/ui-character-select.mp3");
    this.buySnd = new Audio("audio/ui-buy.mp3");
    this.refundSnd = new Audio("audio/ui-refund.mp3");
    this.apply();
    const kick = () => {
      if (this.wantMenu && this.menu.paused) this.menu.play().catch(() => {});
    };
    addEventListener("pointerdown", kick);
    addEventListener("keydown", kick);
  },

  click() {
    this._sfx(this.ui);
  },

  back() {
    this._sfx(this.backSnd);
  },

  pick() {
    this._sfx(this.pickSnd);
  },

  buy() {
    this._sfx(this.buySnd);
  },

  refund() {
    this._sfx(this.refundSnd);
  },

  /** Efectos de partida (disparos, XP...): usan el volumen "Efectos · Juego". */
  fx(a) {
    this._sfx(a, this.sfxGame);
  },

  _sfx(a, v = this.sfxUi) {
    if (!a || v <= 0) return;
    a.volume = v;
    a.currentTime = 0;
    a.play().catch(() => {});
  },

  /** Pausa las dos copias y deja la primera lista para empezar de cero. */
  _reset(name) {
    clearInterval(this._fadeTimers["cross" + name]);
    this.cross[name] = 0;
    for (const a of this.tracks[name]) {
      if (!a.paused) a.pause();
      a.currentTime = 0;
    }
  },

  /** Empieza la pista de la partida desde cero (nueva run) con fade in. */
  startPlay() {
    this._reset("play");
    this.fade.play = 0;
    this.apply();
    this.play.play().catch(() => {});
    this._fadeTo("play", 1);
  },

  stopPlay() {
    this._fadeTo("play", 0, () => this._reset("play"));
  },

  /** Solo al salir de una partida (pausa o victoria/derrota). */
  restartMenu() {
    this._reset("menu");
  },

  setMenu(on) {
    this.wantMenu = on;
    if (!this.menu) return;
    if (!on) {
      if (this.tracks.menu.some((a) => !a.paused)) this._fadeTo("menu", 0, () => this._reset("menu"));
      return;
    }
    if (this.menu.paused) this.menu.play().catch(() => {});
    this._fadeTo("menu", 1);
  },
};

console.assert(
  RS.Audio.hub("menu") &&
    RS.Audio.hub("settings") &&
    RS.Audio.hub("credits") &&
    !RS.Audio.hub("pause") &&
    !RS.Audio.hub("over") &&
    !RS.Audio.hub(null),
  "musica de menu"
);
