# Rift Survivor

Fan game offline estilo *Vampire Survivors*, ambientado en el universo de League of Legends (no oficial).

HTML + CSS + JavaScript vanilla + Canvas 2D. Sin build ni dependencias: clona el repo y abre `index.html`.

> **Disclaimer:** League of Legends y todos los personajes asociados son propiedad de Riot Games. Este es un proyecto de fans sin ánimo de lucro, no afiliado a Riot.

## Jugar

1. Clona el repositorio.
2. Abre `index.html` en el navegador (doble clic o arrastrar a Chrome/Firefox).
3. Elige campeón → **Jugar**.

| Tecla | Acción |
|-------|--------|
| `W` `A` `S` `D` / flechas | Moverse |
| `Esc` / `P` | Pausa |

Sobrevive **4 minutos** para ganar la run. El progreso de récords se guarda en `localStorage`.

## Campeones (placeholders)

| Campeón | Kit simplificado |
|---------|------------------|
| Ashe | Disparo a distancia al más cercano |
| Garen | Aura / spin melee |
| Lux | Ráfaga en la dirección de movimiento |

Al subir de nivel eliges 1 de 3 mejoras (daño, cadencia, velocidad, HP, área, multishot, regen).

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

Código: pendiente (MIT previsto). Marcas y lore de LoL: Riot Games.
