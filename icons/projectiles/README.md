# Proyectiles (assets)

Guía para dibujar y exportar proyectiles del juego. Preferimos **PNG pixel art** cargados con `drawImage` (barato con muchos en pantalla) en lugar de dibujarlos a mano cada frame.

Herramientas recomendadas: **LibreSprite** o **Piskel** (la que te resulte más cómoda).

## Qué NO usar

| Formato | Por qué no |
| --- | --- |
| GIF animado | El navegador lo anima a su ritmo, no al del juego; con pausa se desincroniza; transparencia sucia; peor con muchos + rotación. |
| APNG / WebP animado | Mismos problemas de control que el GIF. |
| SVG para el proyectil en canvas | Los SVG van bien en UI (`icons/weapons`); en canvas conviene raster (PNG) para blit limpio. |

## Enfoque recomendado

**Híbrido:**

1. **Cuerpo del proyectil:** PNG estático o sprite sheet de 2–4 frames (pulso / brillo).
2. **Sensación de movimiento:** estela corta en código (1–2 ghosts con alpha, o puntos detrás). Barato y se siente vivo.
3. **Impacto / disparo:** partículas puntuales en código, no metidas en el asset del proyectil.

Primera versión de un proyectil nuevo: **1 frame estático** + estela en código. Si se siente plano, añade 2–4 frames en sheet.

## Convenciones de archivo

### Carpeta y nombres

```text
icons/projectiles/
  hostile_bolt.png       # caster enemigo
  recurve_arrow.png      # ejemplo jugador
  fiendish_orb.png
  README.md              # esta guía
```

- Nombre = id claro en `snake_case`, alineado con el arma / enemigo cuando se pueda.
- Un proyectil = un PNG (estático o sheet).

### Orientación del arte

**La punta mira a la derecha (`→`).**

En canvas el ángulo `0` es a la derecha. El juego rota con `atan2(vy, vx)`. Si el arte apunta abajo o arriba, la rotación queda torcida.

### Tamaño

- Usa un tamaño de frame fijo por proyectil, idealmente pequeño: p. ej. `12×24`, `16×32`, `8×18`.
- Potencias de 2 no son obligatorias, pero ayudan.
- En juego se dibuja a 2× o 3× con `imageSmoothingEnabled = false` para pixel nítido.

### Transparencia

- PNG-24 / PNG-32 con **fondo transparente**.
- Sin halo negro ni matte blanco alrededor del sprite.

### Sprite sheet (animación)

- **Fila horizontal:** frame 0, 1, 2… en una sola fila.
- **Sin padding** entre frames (o padding 0 al exportar).
- Todos los frames del mismo tamaño.

Ejemplo: 4 frames de `16×32` → PNG de **64×32**.

Si el sheet necesita metadatos explícitos, opcional junto al PNG:

```json
{
  "frames": 4,
  "fw": 16,
  "fh": 32,
  "fps": 10
}
```

Nombre sugerido: `hostile_bolt.json` al lado de `hostile_bolt.png`.

## Exportar desde LibreSprite

1. Dibuja el proyectil con la punta a la derecha.
2. Si hay animación: un frame por celda del timeline.
3. *File → Export Sprite Sheet* (o equivalente):
   - Layout: horizontal / strip
   - Padding: 0
   - Formato: PNG
4. Guarda en esta carpeta con el nombre del id.

## Exportar desde Piskel

1. Canvas del tamaño de **un** frame (p. ej. 16×32).
2. Frames en el timeline; punta a la derecha.
3. Export → PNG → **sprite sheet** (horizontal) o PNG de un solo frame.
4. Guarda aquí con el nombre del id.

## Colisión vs visual

El asset es **solo visual**. El hitbox sigue siendo un círculo (`radius` en datos del arma/enemigo). No hace falta que el PNG coincida pixel a pixel con el radio; solo que se lea bien a la escala del juego.

## Checklist antes de subir

- [ ] Punta a la derecha
- [ ] PNG transparente, sin matte
- [ ] Sheet horizontal, frames del mismo tamaño, padding 0
- [ ] Nombre `snake_case` en `icons/projectiles/`
- [ ] Se ve bien a 2× / 3× sobre el suelo verde del mapa
- [ ] (Opcional) JSON con `frames`, `fw`, `fh` si no es 1 frame obvio

## Proyectiles previstos

| Archivo | Uso |
| --- | --- |
| `hostile_bolt.png` | Proyectil de casters enemigos |
| *(pendiente)* | Flecha del Recurve Bow |
| *(pendiente)* | Orbe / hechizo del Fiendish Codex |
| *(pendiente)* | Otros según armas / evoluciones |

Cuando el PNG esté en esta carpeta, se cablea en `js/entities/projectile.js` con `drawImage` + rotación.
