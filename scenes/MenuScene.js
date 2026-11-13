import { soundManager } from "../utils/sound.js";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  preload() {
    this.load.image("fondoMenu", "./public/assets/FondoMenu.jpg");
    this.load.image("cielo", "./public/assets/Cielo.webp");
    this.load.image("ninja", "./public/assets/Ninja.png");
    this.load.image("platform", "./public/assets/platform.png");
    this.load.image("square", "./public/assets/square.png");
    this.load.image("triangle", "./public/assets/triangle.png");
    this.load.image("diamond", "./public/assets/diamond.png");
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.image(width / 2, height / 2, "fondoMenu").setDisplaySize(width, height);
    this.add.rectangle(width / 2, height / 2, width, height, 0x0b1021, 0.58);

    // Title
    this.add
      .text(width / 2, 88, "NINJA MONCHO", {
        fontFamily: "Arial, sans-serif",
        fontSize: "54px",
        fontStyle: "bold",
        color: "#ffd166",
        stroke: "#111827",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 138, "Enkei Kiiro vs. la lluvia de asteroides geométricos", {
        fontFamily: "Arial, sans-serif",
        fontSize: "19px",
        color: "#e2e8f0",
        stroke: "#0f172a",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // Info card
    this.add.rectangle(width / 2, 315, 620, 250, 0x0f172a, 0.82).setStrokeStyle(2, 0x38bdf8, 0.8);

    const instructions = [
      "OBJETIVO: Juntá al menos 2 figuras de cada tipo (■ ▲ ◆) y superá los 100 puntos",
      "antes de que el tiempo llegue a 0.",
      "",
      "PUNTAJES:  Cuadrado: +15 pts  |  Triángulo: +20 pts  |  Rombo: +30 pts",
      "¡CUIDADO!: Cada rebote en el piso resta 5 pts a la figura (en 0 desaparece).",
      "¡EVITÁ los asteroides rojos (-20 pts)!",
      "",
      "CONTROLES: Flechas ← → para moverte, ↑ (o Espacio) para saltar.",
    ];

    this.add
      .text(width / 2, 315, instructions.join("\n"), {
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        color: "#f8fafc",
        align: "center",
        lineSpacing: 7,
      })
      .setOrigin(0.5);

    // Play button
    const playBtn = this.add
      .rectangle(width / 2, 500, 240, 62, 0x10b981)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true });

    const playLabel = this.add
      .text(width / 2, 500, "JUGAR", {
        fontFamily: "Arial, sans-serif",
        fontSize: "28px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const startGame = () => {
      soundManager.playClick();
      this.scene.start("GameScene");
    };

    playBtn.on("pointerover", () => {
      playBtn.setFillStyle(0x059669);
      playBtn.setScale(1.04);
      playLabel.setScale(1.04);
    });

    playBtn.on("pointerout", () => {
      playBtn.setFillStyle(0x10b981);
      playBtn.setScale(1);
      playLabel.setScale(1);
    });

    playBtn.on("pointerdown", startGame);

    this.input.keyboard.once("keydown-ENTER", startGame);
    this.input.keyboard.once("keydown-SPACE", startGame);
  }
}
