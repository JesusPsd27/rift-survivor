window.RS = window.RS || {};

RS.LevelUp = {
  gainXp(state, amount) {
    const p = state.player;
    const mult = RS.DEBUG?.enabled ? RS.DEBUG.xpMult || 1 : 1;
    p.xp += amount * mult;
    while (p.xp >= p.xpToLevel) {
      p.xp -= p.xpToLevel;
      p.level += 1;
      p.xpToLevel = Math.floor(5 + p.level * 3.2);
      state.pendingLevelUps += 1;
    }
  },

  _mejoraChip(player, passiveId, fallback) {
    const weaponName = RS.evoHintWeaponName?.(player, passiveId);
    if (weaponName) {
      return { tone: "evolve_hint", text: `Evolucionar ${weaponName}` };
    }
    return fallback;
  },

  poolFor(player) {
    const pool = [];

    // Mejoras nuevas (si hay slot)
    if (player.passives.length < RS.MAX_PASSIVES) {
      for (const u of RS.UPGRADES) {
        if (RS.hasPassive(player, u.id)) continue;
        pool.push({
          kind: "mejora",
          id: u.id,
          name: u.name,
          desc: u.desc,
          chip: this._mejoraChip(player, u.id, {
            tone: "new_mejora",
            text: "Nueva Mejora",
          }),
          apply: () => RS.addPassive(player, u.id),
        });
      }
    }

    // Subir mejoras existentes
    for (const pas of player.passives) {
      if (pas.level >= RS.MAX_LEVEL) continue;
      const u = RS.upgradeById(pas.id);
      pool.push({
        kind: "mejora_level",
        id: pas.id,
        name: u ? u.name : pas.id,
        desc: u ? u.desc : "",
        chip: this._mejoraChip(player, pas.id, {
          tone: "level",
          text: `Nivel ${pas.level} > ${pas.level + 1}`,
        }),
        apply: () => RS.levelPassive(player, pas.id),
      });
    }

    // Armas nuevas
    if (player.weapons.length < RS.MAX_WEAPONS) {
      for (const def of RS.WEAPONS) {
        if (RS.hasWeapon(player, def.id)) continue;
        if (def.evolvedOnly) continue;
        if (RS.hasEvolvedFrom?.(player, def.id)) continue;
        pool.push({
          kind: "new_weapon",
          id: def.id,
          name: def.name,
          desc: def.desc,
          chip: { tone: "new_arma", text: "Nueva Arma" },
          apply: () => RS.addWeapon(player, def.id),
        });
      }
    }

    // Subir armas (desc = bono del siguiente nivel)
    for (const inst of player.weapons) {
      const def = RS.weaponById(inst.id);
      if (!def || inst.level >= def.maxLevel) continue;
      const next = inst.level + 1;
      pool.push({
        kind: "weapon_level",
        id: def.id,
        name: def.name,
        desc: RS.weaponLevelUpText(def.type, next),
        chip: { tone: "level", text: `Nivel ${inst.level} > ${next}` },
        apply: () => RS.levelWeapon(player, def.id),
      });
    }

    // Evoluciones (arma max + mejora)
    for (const evo of RS.EVOLUTIONS) {
      if (!RS.canEvolve(player, evo)) continue;
      pool.push({
        kind: "evolve",
        id: evo.id,
        name: evo.name,
        desc: RS.evolutionUpgradeText(evo),
        chip: { tone: "evolve", text: "Evolución" },
        apply: () => RS.applyEvolution(player, evo.id),
      });
    }

    return pool;
  },

  choices(player, count = 3) {
    const pool = this.poolFor(player);
    const forced =
      typeof RS.debugLevelUpChoices === "function"
        ? RS.debugLevelUpChoices(player, count, pool)
        : null;
    if (forced) return forced;

    // Evoluciones listas: siempre ocupan hueco (no dependen del RNG)
    const evoCards = [];
    const rest = [];
    for (const c of pool) {
      if (c.kind === "evolve") evoCards.push(c);
      else rest.push(c);
    }

    const out = evoCards.slice(0, count);
    while (out.length < count && rest.length) {
      const i = RS.randInt(0, rest.length - 1);
      out.push(rest.splice(i, 1)[0]);
    }
    return out;
  },

  apply(state, choice) {
    if (choice && typeof choice.apply === "function") choice.apply();
    state.pendingLevelUps = Math.max(0, state.pendingLevelUps - 1);
  },
};
