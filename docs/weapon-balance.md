# Balance de armas — daño, ticks y alcance

Valores con las fórmulas actuales de `js/systems/weapons.js` + pasivas/meta.
**Actualizado** tras nerf proyectil/orbe, buff melee/orbital y partida a **15 min**.

**Supuesto DPM:** un enemigo siempre en rango y cada tick conecta. Orbe = ida+vuelta. Orbital = CD por enemigo (orbs extras = cobertura).

---

## Fórmulas

```
damage     = base.damage × (1 + mods.damage) × damageMult
cooldown   = max(0.12, base.cooldown × (1 − mods.cadence) × cooldownMult)
damageMult = (1 + 0.15 × pasivaDaño) × (1 + 0.05 × metaDaño)
cooldownMult = max(0.35, (1 − 0.07 × pasivaCD) × (1 − 0.03 × metaCD))
sizeMult   = (1 + 0.07 × pasivaTamaño) × (1 + 0.05 × metaTamaño)
DPM        = damage × hitsPorCiclo × (60 / tickSegundos)
```

Tick orbital = `max(0.18, cooldown × 0.75)`.

### Multiplicadores globales

| Escenario | dmg× | cd× | size× |
|-----------|-----:|----:|------:|
| Sin pasivas / sin meta | 1.00 | 1.00 | 1.00 |
| Pasiva Daño Nv5 | 1.75 | 1.00 | 1.00 |
| Pasiva Cooldown Nv5 | 1.00 | 0.65 | 1.00 |
| Pasiva Tamaño Nv5 | 1.00 | 1.00 | 1.35 |
| Meta Daño+CD+Tamaño R5 | 1.25 | 0.85 | 1.25 |
| Full (pasivas D/CD/Size Nv5 + meta R5) | 2.188 | 0.552 | 1.688 |

### Mods acumulados por nivel de arma

| Tipo | Nv2 | Nv3 | Nv4 | Nv5 |
|------|-----|-----|-----|-----|
| projectile / orb | +1 proy | +25% dmg | +30% cadence | +15% dmg, +15% cadence |
| aura | +40% size | +40% dmg | +40% cadence | +30% size, +30% dmg, +15% cadence |
| melee | +20% dmg | +1 wedge, +15% dmg | +20% cadence | +20% dmg, +15% cadence, +1 wedge |
| orbital | +1 orb | +35% dmg | +1 orb, +10% spin | +1 orb, +25% dmg, +10% spin |

### Amenaza enemiga (15 min)

`WIN_TIME = 900`. Bosses a 5 / 10 / 14 min.

```
hpScale = 1 + mins×0.1 + max(0,mins−5)×0.2 + max(0,mins−10)×0.25
armor   = 0 si mins<7; si no min(0.25, (mins−7)/8 × 0.25)
dmg efectivo ≈ dmg × (1 − armor)
```

| Min | hpScale | armor | tankiness aprox vs dmg |
|----:|--------:|------:|-----------------------:|
| 1 | 1.10 | 0% | ×1.10 |
| 5 | 1.50 | 0% | ×1.50 |
| 7 | 1.90 | 0% | ×1.90 |
| 10 | 2.50 | ~9% | ×2.76 |
| 15 | 5.75 | 25% | ×7.67 |

Spawn: `rate = max(0.38, 1.2 − t×0.001)`, `batch = min(5, 1 + floor(t/100))`.

---

## Ranking DPM (sin pasivas / sin meta)

| # | Arma Nv1 | DPM | Arma Nv5 | DPM |
|--:|----------|----:|----------|----:|
| 1 | Matakrakens | 4571 | Matakrakens | 17455 |
| 2 | Filo Infinito | 3927 | Enfoque del Horizonte | 14374 |
| 3 | Canto Bélico de Shurelya | 3657 | Égida de Fuego Solar | 11333 |
| 4 | Égida de Fuego Solar | 3000 | Filo Infinito | 9365 |
| 5 | Enfoque del Horizonte | 2824 | Códice Diabólico | 9309 |
| 6 | Espadon | 1886 | Arco Recurvo | 6664 |
| 7 | Códice Diabólico | 1829 | Canto Bélico de Shurelya | 5851 |
| 8 | Brizna de Éter | 1778 | Ceniza de Bami | 5181 |
| 9 | Ceniza de Bami | 1371 | Espadon | 4497 |
| 10 | Arco Recurvo | 1309 | Brizna de Éter | 2844 |

---

## 1) Sin pasivas / sin meta

### Arco Recurvo (`recurve_bow`) — projectile

| Nv | Dmg/tick | Tick (s) | Hits/ciclo | Alcance | DPM |
|---:|---------:|---------:|-----------:|---------|----:|
| 1 | 12 | 0.55 | 1 | 420 (×1) | 1309 |
| 2 | 12 | 0.55 | 2 | 420 (×2) | 2618 |
| 3 | 15 | 0.55 | 2 | 420 (×2) | 3273 |
| 4 | 15 | 0.39 | 2 | 420 (×2) | 4675 |
| 5 | 16.8 | 0.30 | 2 | 420 (×2) | 6664 |

### Ceniza de Bami (`bamis_cinder`) — aura

| Nv | Dmg/tick | Tick (s) | Hits/ciclo | Alcance | DPM |
|---:|---------:|---------:|-----------:|---------|----:|
| 1 | 8 | 0.35 | 1 | radio 70 | 1371 |
| 2 | 8 | 0.35 | 1 | radio 98 | 1371 |
| 3 | 11.2 | 0.35 | 1 | radio 98 | 1920 |
| 4 | 11.2 | 0.21 | 1 | radio 98 | 3200 |
| 5 | 13.6 | 0.16 | 1 | radio 119 | 5181 |

### Códice Diabólico (`fiendish_codex`) — orb

| Nv | Dmg/tick | Tick (s) | Hits/ciclo | Alcance | DPM |
|---:|---------:|---------:|-----------:|---------|----:|
| 1 | 16 | 1.05 | 2 | 320 (×1) | 1829 |
| 2 | 16 | 1.05 | 4 | 320 (×2) | 3657 |
| 3 | 20 | 1.05 | 4 | 320 (×2) | 4571 |
| 4 | 20 | 0.73 | 4 | 320 (×2) | 6531 |
| 5 | 22.4 | 0.58 | 4 | 320 (×2) | 9309 |

### Espadon (`bf_sword`) — melee

| Nv | Dmg/tick | Tick (s) | Hits/ciclo | Alcance | DPM |
|---:|---------:|---------:|-----------:|---------|----:|
| 1 | 22 | 0.70 | 1 | 100 · arco 52° | 1886 |
| 2 | 26.4 | 0.70 | 1 | 100 · arco 52° | 2263 |
| 3 | 29.7 | 0.70 | 1 | 100 · arco 103° | 2546 |
| 4 | 29.7 | 0.56 | 1 | 100 · arco 103° | 3182 |
| 5 | 34.1 | 0.45 | 1 | 100 · arco 155° | 4497 |

### Brizna de Éter (`aether_wisp`) — orbital

| Nv | Dmg/tick | Tick (s) | Hits/ciclo | Alcance | DPM |
|---:|---------:|---------:|-----------:|---------|----:|
| 1 | 10 | 0.34 | 1 | órbita 140 / hitR 13 · ×1 | 1778 |
| 2 | 10 | 0.34 | 1 | órbita 140 / hitR 13 · ×2 | 1778 |
| 3 | 13.5 | 0.34 | 1 | órbita 140 / hitR 13 · ×2 | 2400 |
| 4 | 13.5 | 0.34 | 1 | órbita 140 / hitR 13 · ×3 | 2400 |
| 5 | 16 | 0.34 | 1 | órbita 140 / hitR 13 · ×4 | 2844 |

### Matakrakens (`kraken_slayer`) — projectile · evo

| Nv | Dmg/tick | Tick (s) | Hits/ciclo | Alcance | DPM |
|---:|---------:|---------:|-----------:|---------|----:|
| 1 | 16 | 0.42 | 2 | 460 (×2) | 4571 |
| 2 | 16 | 0.42 | 3 | 460 (×3) | 6857 |
| 3 | 20 | 0.42 | 3 | 460 (×3) | 8571 |
| 4 | 20 | 0.29 | 3 | 460 (×3) | 12245 |
| 5 | 22.4 | 0.23 | 3 | 460 (×3) | 17455 |

### Égida de Fuego Solar (`sunfire_aegis`) — aura · evo

| Nv | Dmg/tick | Tick (s) | Hits/ciclo | Alcance | DPM |
|---:|---------:|---------:|-----------:|---------|----:|
| 1 | 14 | 0.28 | 1 | radio 100 | 3000 |
| 2 | 14 | 0.28 | 1 | radio 140 | 3000 |
| 3 | 19.6 | 0.28 | 1 | radio 140 | 4200 |
| 4 | 19.6 | 0.17 | 1 | radio 140 | 7000 |
| 5 | 23.8 | 0.13 | 1 | radio 170 | 11333 |

### Enfoque del Horizonte (`horizon_focus`) — orb · evo

| Nv | Dmg/tick | Tick (s) | Hits/ciclo | Alcance | DPM |
|---:|---------:|---------:|-----------:|---------|----:|
| 1 | 20 | 0.85 | 2 | 400 (×1) | 2824 |
| 2 | 20 | 0.85 | 4 | 400 (×2) | 5647 |
| 3 | 25 | 0.85 | 4 | 400 (×2) | 7059 |
| 4 | 25 | 0.59 | 4 | 400 (×2) | 10084 |
| 5 | 28 | 0.47 | 4 | 400 (×2) | 14374 |

### Filo Infinito (`infinity_edge`) — melee · evo

| Nv | Dmg/tick | Tick (s) | Hits/ciclo | Alcance | DPM |
|---:|---------:|---------:|-----------:|---------|----:|
| 1 | 36 | 0.55 | 1 | 118 · arco 60° | 3927 |
| 2 | 43.2 | 0.55 | 1 | 118 · arco 60° | 4713 |
| 3 | 48.6 | 0.55 | 1 | 118 · arco 120° | 5302 |
| 4 | 48.6 | 0.44 | 1 | 118 · arco 120° | 6627 |
| 5 | 55.8 | 0.36 | 1 | 118 · arco 180° | 9365 |

### Canto Bélico de Shurelya (`shurelyas_battlesong`) — orbital · evo

| Nv | Dmg/tick | Tick (s) | Hits/ciclo | Alcance | DPM |
|---:|---------:|---------:|-----------:|---------|----:|
| 1 | 16 | 0.26 | 1 | órbita 150 / hitR 16 · ×2 | 3657 |
| 2 | 16 | 0.26 | 1 | órbita 150 / hitR 16 · ×3 | 3657 |
| 3 | 21.6 | 0.26 | 1 | órbita 150 / hitR 16 · ×3 | 4937 |
| 4 | 21.6 | 0.26 | 1 | órbita 150 / hitR 16 · ×4 | 4937 |
| 5 | 25.6 | 0.26 | 1 | órbita 150 / hitR 16 · ×5 | 5851 |


---

## 2) Pasiva Daño Nv5 (×1.75)

| Arma | Nv1 DPM | Nv5 DPM |
|------|--------:|--------:|
| Arco Recurvo | 2291 | 11663 |
| Ceniza de Bami | 2400 | 9067 |
| Códice Diabólico | 3200 | 16291 |
| Espadon | 3300 | 7869 |
| Brizna de Éter | 3111 | 4978 |
| Matakrakens | 8000 | 30545 |
| Égida de Fuego Solar | 5250 | 19833 |
| Enfoque del Horizonte | 4941 | 25155 |
| Filo Infinito | 6873 | 16389 |
| Canto Bélico de Shurelya | 6400 | 10240 |

---

## 3) Pasiva Cooldown Nv5 (cd×0.65)

| Arma | Tick Nv1 | DPM Nv1 | Tick Nv5 | DPM Nv5 |
|------|---------:|--------:|---------:|--------:|
| Arco Recurvo | 0.36 | 2014 | 0.20 | 10253 |
| Ceniza de Bami | 0.23 | 2110 | 0.12 | 6800 |
| Códice Diabólico | 0.68 | 2813 | 0.38 | 14322 |
| Espadon | 0.45 | 2901 | 0.30 | 6918 |
| Brizna de Éter | 0.22 | 2735 | 0.22 | 4376 |
| Matakrakens | 0.27 | 7033 | 0.15 | 26853 |
| Égida de Fuego Solar | 0.18 | 4615 | 0.12 | 11900 |
| Enfoque del Horizonte | 0.55 | 4344 | 0.30 | 22114 |
| Filo Infinito | 0.36 | 6042 | 0.23 | 14408 |
| Canto Bélico de Shurelya | 0.18 | 5333 | 0.18 | 8533 |

---

## 4) Pasiva Tamaño Nv5 (size×1.35)

No cambia DPM teórico; solo alcance / hitR (órbita de briznas sigue fija).

| Arma | Alcance Nv1 base | Con Size Nv5 |
|------|------------------|--------------|
| Arco Recurvo | 420 (×1) | 567 (×1) |
| Ceniza de Bami | radio 70 | radio 95 |
| Códice Diabólico | 320 (×1) | 432 (×1) |
| Espadon | 100 · arco 52° | 135 · arco 52° |
| Brizna de Éter | órbita 140 / hitR 13 · ×1 | órbita 140 / hitR 18 · ×1 |
| Matakrakens | 460 (×2) | 621 (×2) |
| Égida de Fuego Solar | radio 100 | radio 135 |
| Enfoque del Horizonte | 400 (×1) | 540 (×1) |
| Filo Infinito | 118 · arco 60° | 159 · arco 60° |
| Canto Bélico de Shurelya | órbita 150 / hitR 16 · ×2 | órbita 150 / hitR 22 · ×2 |

---

## 5) Meta Daño+CD+Tamaño R5

| Arma | Nv1 DPM | Nv5 DPM | Alcance Nv1 |
|------|--------:|--------:|-------------|
| Arco Recurvo | 1925 | 9801 | 525 (×1) |
| Ceniza de Bami | 2017 | 7619 | radio 88 |
| Códice Diabólico | 2689 | 13690 | 400 (×1) |
| Espadon | 2773 | 6613 | 125 · arco 52° |
| Brizna de Éter | 2614 | 4183 | órbita 140 / hitR 16 · ×1 |
| Matakrakens | 6723 | 25668 | 575 (×2) |
| Égida de Fuego Solar | 4412 | 14875 | radio 125 |
| Enfoque del Horizonte | 4152 | 21139 | 500 (×1) |
| Filo Infinito | 5775 | 13772 | 148 · arco 60° |
| Canto Bélico de Shurelya | 5378 | 8605 | órbita 150 / hitR 20 · ×2 |

---

## 6) Full build (pasivas D/CD/Size Nv5 + meta R5)

| Arma | Nv1 DPM | Nv5 DPM | Tick Nv5 | Alcance Nv5 |
|------|--------:|--------:|---------:|-------------|
| Arco Recurvo | 5183 | 26386 | 0.17 | 709 (×2) |
| Ceniza de Bami | 5430 | 14875 | 0.12 | radio 201 |
| Códice Diabólico | 7240 | 36857 | 0.32 | 540 (×2) |
| Espadon | 7466 | 17804 | 0.25 | 169 · arco 155° |
| Brizna de Éter | 7039 | 11262 | 0.19 | órbita 140 / hitR 22 · ×4 |
| Matakrakens | 18100 | 69107 | 0.13 | 776 (×3) |
| Égida de Fuego Solar | 11878 | 26031 | 0.12 | radio 287 |
| Enfoque del Horizonte | 11179 | 56912 | 0.26 | 675 (×2) |
| Filo Infinito | 15549 | 37079 | 0.20 | 199 · arco 180° |
| Canto Bélico de Shurelya | 11667 | 18667 | 0.18 | órbita 150 / hitR 27 · ×5 |

---

## Cambios de esta pasada

- **Proyectil/orbe:** Nv3 +25% dmg (era +40%); Nv5 ya no da +1 proy, solo +15% dmg/+15% cadence.
- **Matakrakens:** base dmg 20→16. **Horizonte:** 26→20.
- **Melee Nv3:** +15% dmg además del wedge.
- **Orbital:** más dmg por nivel; tick `max(0.18, cd×0.75)`.
- **Run 15 min** + HP/armor por tiempo + bosses 5/10/14 + spawn capped.

*Si cambian bases o mods, regenerar este archivo.*
