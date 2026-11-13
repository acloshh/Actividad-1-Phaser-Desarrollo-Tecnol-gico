# Ninja Moncho — Phaser 3

Videojuego desarrollado en **Phaser 3** para el **Trabajo Práctico Módulo #1 (Propuesta 1)** de **Desarrollo Tecnológico 2**, siguiendo el GDD de **Ninja Moncho**.

## Premisa

**Enkei Kiiro** es el último guerrero del clan ninja Moncho y tiene la misión de defender su pueblo natal de una lluvia de asteroides geométricos.

## Controles

- **Flechas `←` / `→`**: Mover al ninja hacia la izquierda o derecha.
- **Flecha `↑` o `Espacio`**: Saltar.

## Reglas y Mecánicas

- **Figuras recolectables**: caen cada `0.5` segundos desde la parte superior.
  - Cuadrado (`■`): `+15` puntos
  - Triángulo (`▲`): `+20` puntos
  - Rombo (`◆`): `+30` puntos
- **Rebote en el piso**: cada vez que una figura rebota en el suelo pierde `5` puntos; si llega a `0`, desaparece.
- **Asteroide rojo**: al tocarlo descuenta `20` puntos.
- **Condición de victoria**: juntar al menos **2 figuras de cada tipo** (persistidas en un array) **y superar los 100 puntos** antes de que el temporizador de `60s` llegue a `0`.
- **Condición de derrota**: el tiempo llega a `0` sin cumplir el objetivo.

## Estructura del Proyecto

- `index.html`: Página principal y carga de Phaser 3 (`3.87.0`).
- `main.js`: Configuración de Phaser 3 y registro de escenas.
- `scenes/MenuScene.js`: Pantalla de inicio con instrucciones y botón de juego.
- `scenes/GameScene.js`: Escena principal con físicas Arcade, plataformas, spawn, HUD y temporizador.
- `scenes/GameOverScene.js`: Escena única de fin de juego (victoria y derrota) con puntuación final.
- `utils/sound.js`: Generador de efectos de sonido mediante Web Audio API.
- `public/assets/`: Recursos gráficos del juego.

## Jugar Online (GitHub Pages)

El proyecto es estático y está listo para servirse desde la rama `main` (carpeta `/`) en **GitHub Pages**:
`https://acloshh.github.io/Actividad-1-Phaser-Desarrollo-Tecnol-gico/`
