import { soundManager } from "../utils/sound.js";

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  create(data) {
    const { width, height } = this.scale;
    const won = Boolean(data?.won);
    const score = data?.score ?? 0;
    const counts = data?.counts ?? { square: 0, triangle: 0, diamond: 0 };
    const timeLeft = data?.timeLeft ?? 0;

    // Background
    this.add.image(width / 2, height / 2, "cielo").setDisplaySize(width, height);
    this.add.rectangle(width / 2, height / 2, width, height, 0x0b1021, 0.72);

    const accent = won ? 0x10b981 : 0xef4444;
    const titleColor = won ? "#34d399" : "#f87171";
    const titleText = won ? "¡GANASTE!" : "¡PERDISTE!";
    const subtitleText = won
      ? "¡Enkei Kiiro defendió la aldea de los asteroides geométricos!"
      : "¡Se acabó el tiempo! Los asteroides geométricos superaron la defensa.";

    // Result card
    this.add.rectangle(width / 2, 265, 620, 310, 0x0f172a, 0.88).setStrokeStyle(3, accent);

    this.add
      .text(width / 2, 155, titleText, {
        fontFamily: "Arial, sans-serif",
        fontSize: "54px",
        fontStyle: "bold",
        color: titleColor,
        stroke: "#020617",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 215, subtitleText, {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        color: "#e2e8f0",
        align: "center",
        wordWrap: { width: 560 },
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 285, `Puntuación final: ${score} pts`, {
        fontFamily: "Arial, sans-serif",
        fontSize: "30px",
        fontStyle: "bold",
        color: "#ffd166",
      })
      .setOrigin(0.5);

    const statsLine = `Cuadrados: ${counts.square}   |   Triángulos: ${counts.triangle}   |   Rombos: ${counts.diamond}`;
    this.add
      .text(width / 2, 338, statsLine, {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        color: "#cbd5e1",
      })
      .setOrigin(0.5);

    if (won) {
      this.add
        .text(width / 2, 376, `Tiempo restante: ${timeLeft}s`, {
          fontFamily: "Arial, sans-serif",
          fontSize: "16px",
          color: "#94a3b8",
        })
        .setOrigin(0.5);
    }

    // Buttons
    this._createButton(width / 2 - 140, 495, "JUGAR DE NUEVO", 0x10b981, 0x059669, () => {
      soundManager.playClick();
      this.scene.start("GameScene");
    });

    this._createButton(width / 2 + 140, 495, "MENÚ PRINCIPAL", 0x3b82f6, 0x2563eb, () => {
      soundManager.playClick();
      this.scene.start("MenuScene");
    });

    this.input.keyboard.once("keydown-ENTER", () => {
      soundManager.playClick();
      this.scene.start("GameScene");
    });
  }

  _createButton(x, y, label, fillColor, hoverColor, onClick) {
    const btn = this.add
      .rectangle(x, y, 230, 56, fillColor)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });

    const txt = this.add
      .text(x, y, label, {
        fontFamily: "Arial, sans-serif",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    btn.on("pointerover", () => {
      btn.setFillStyle(hoverColor);
      btn.setScale(1.04);
      txt.setScale(1.04);
    });

    btn.on("pointerout", () => {
      btn.setFillStyle(fillColor);
      btn.setScale(1);
      txt.setScale(1);
    });

    btn.on("pointerdown", onClick);
  }
}
