# Rift Survivor

Fan game offline estilo *Vampire Survivors*, inspirado en arquetipos de MOBAs (no oficial).

HTML + CSS + JavaScript vanilla + Canvas 2D. Sin build ni dependencias: clona el repo y abre `index.html`.

## Disclaimer

**Rift Survivor** isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.

This is a free, non-commercial fan project. League of Legends character names used as temporary placeholders in the MVP do not imply ownership or affiliation. The game does **not** redistribute official Riot art, audio, or client assets; visuals are geometric placeholders until original art is added.

## Jugar

1. Clona el repositorio.
2. Abre `index.html` en el navegador (doble clic o arrastrar a Chrome/Firefox).
3. Elige campeón → **Jugar**.

| Tecla | Acción |
|-------|--------|
| `W` `A` `S` `D` / flechas | Moverse |
| `Esc` / `P` | Pausa |

Sobrevive **4 minutos** para ganar la run. El progreso de récords se guarda en `localStorage`.

## Campeones y armas (placeholders)

Cada campeón empieza con un arma. Inventario: **4 armas** + **4 mejoras**, cada una hasta nivel **5**.

Referencias temáticas (ítems LoL; sin assets oficiales). Tipos: proyectil, aura, orbe, orbital, melee. Evoluciones en `evolutions.js`.

| ID | Nombre (ES) | Tipo | Evolución (mejora) |
|----|-------------|------|--------------------|
| `recurve_bow` | Arco Recurvo | proyectil | `kraken_slayer` (Cadencia) |
| `bamis_cinder` | Ceniza de Bami | aura | `sunfire_aegis` (Vitalidad) |
| `fiendish_codex` | Códice Diabólico | orbe | `horizon_focus` (Daño) |
| `bf_sword` | Espadon | melee | `infinity_edge` (Daño) |
| `aether_wisp` | Brizna de Éter | orbital | `shurelyas_battlesong` (Movilidad) |

| Campeón | Arma inicial |
|---------|----------------|
| Ashe | Arco Recurvo |
| Garen | Ceniza de Bami |
| Ahri | Códice Diabólico |

Al level-up: arma/mejora nueva, subir nivel, o evolución si aplica.

## Estructura

```
index.html
css/style.css
js/
  game.js
  core/      input, camera, util, save
  data/      champions, enemies, upgrades
  entities/  player, enemy, projectile, pickup
  systems/   combat, spawner, levelup
  ui/        menús + HUD
```

## Estado del proyecto

MVP funcional con formas geométricas. Assets, más campeones y pulido visual vienen después.

## Licencia

Código: pendiente (MIT previsto). Cualquier licencia del código aplica solo al código y assets originales de este repo, no a marcas ni propiedad intelectual de Riot Games.
