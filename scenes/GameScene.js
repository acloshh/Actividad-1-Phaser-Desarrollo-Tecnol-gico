import { soundManager } from "../utils/sound.js";

const SHAPE_CONFIG = {
  square: { key: "square", points: 15, label: "Cuadrado", color: "#60a5fa" },
  triangle: { key: "triangle", points: 20, label: "Triángulo", color: "#34d399" },
  diamond: { key: "diamond", points: 30, label: "Rombo", color: "#f472b6" },
};

const WIN_MIN_PER_SHAPE = 2;
const WIN_MIN_SCORE = 101; // "superar los 100 puntos"
const INITIAL_TIME = 60;
const SPAWN_INTERVAL_MS = 500;
const BOUNCE_PENALTY = 5;
const BAD_ITEM_PENALTY = 20;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    const { width, height } = this.scale;

    this.score = 0;
    this.timeLeft = INITIAL_TIME;
    this.collectedItems = [];
    this.isGameOver = false;

    this._createBadItemTexture();

    // Background
    this.add.image(width / 2, height / 2, "cielo").setDisplaySize(width, height);

    // Platforms (ground + extra platforms)
    this.groundGroup = this.physics.add.staticGroup();
    const ground = this.groundGroup.create(width / 2, height - 20, "platform");
    ground.setDisplaySize(width, 40).refreshBody();

    this.extraPlatformsGroup = this.physics.add.staticGroup();
    const extraPlatforms = [
      { x: 150, y: 445, sx: 0.45, sy: 0.75 },
      { x: 650, y: 445, sx: 0.45, sy: 0.75 },
      { x: 400, y: 330, sx: 0.5, sy: 0.75 },
      { x: 170, y: 215, sx: 0.38, sy: 0.75 },
      { x: 630, y: 215, sx: 0.38, sy: 0.75 },
    ];
    extraPlatforms.forEach(({ x, y, sx, sy }) => {
      this.extraPlatformsGroup.create(x, y, "platform").setScale(sx, sy).refreshBody();
    });

    // Player (Enkei Kiiro)
    this.player = this.physics.add.sprite(width / 2, height - 80, "ninja");
    this.player.setDisplaySize(68, 68);
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.05);
    this.player.body.setSize(340, 420);
    this.player.body.setOffset(86, 60);

    // Groups for falling items
    this.collectibles = this.physics.add.group();
    this.badItems = this.physics.add.group();

    // Colliders & overlaps
    this.physics.add.collider(this.player, this.groundGroup);
    this.physics.add.collider(this.player, this.extraPlatformsGroup);

    this.physics.add.collider(this.collectibles, this.extraPlatformsGroup);
    this.physics.add.collider(
      this.collectibles,
      this.groundGroup,
      this._handleCollectibleGroundBounce,
      null,
      this
    );

    this.physics.add.collider(this.badItems, this.extraPlatformsGroup);
    this.physics.add.collider(
      this.badItems,
      this.groundGroup,
      this._handleBadGroundBounce,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this._handleCollectItem,
      null,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.badItems,
      this._handleHitBadItem,
      null,
      this
    );

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // HUD
    this._createHUD(width);

    // Spawn falling items every 0.5 seconds
    this.spawnTimer = this.time.addEvent({
      delay: SPAWN_INTERVAL_MS,
      callback: this._spawnFallingItem,
      callbackScope: this,
      loop: true,
    });

    // Countdown timer (1 second)
    this.countdownTimer = this.time.addEvent({
      delay: 1000,
      callback: this._tickTimer,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    if (this.isGameOver) return;

    const speed = 280;
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    const onFloor = this.player.body.blocked.down || this.player.body.touching.down;
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && onFloor) {
      this.player.setVelocityY(-440);
      soundManager.playJump();
    }
  }

  _createBadItemTexture() {
    if (this.textures.exists("badItem")) return;

    const size = 48;
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    const cx = size / 2;
    const cy = size / 2;

    // Spiked dark-red asteroid
    gfx.fillStyle(0xdc2626, 1);
    const spikes = 8;
    const outerR = 22;
    const innerR = 13;
    gfx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (Math.PI / spikes) * i;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) gfx.moveTo(x, y);
      else gfx.lineTo(x, y);
    }
    gfx.closePath();
    gfx.fillPath();

    gfx.fillStyle(0x7f1d1d, 1);
    gfx.fillCircle(cx, cy, 8);
    gfx.lineStyle(2, 0xfca5a5, 1);
    gfx.strokeCircle(cx, cy, 8);

    gfx.generateTexture("badItem", size, size);
    gfx.destroy();
  }

  _createHUD(width) {
    // Top-left score & collected shapes
    this.add.rectangle(165, 42, 310, 68, 0x0f172a, 0.7).setStrokeStyle(1, 0x38bdf8, 0.5);

    this.scoreText = this.add.text(22, 16, "Puntaje: 0", {
      fontFamily: "Arial, sans-serif",
      fontSize: "22px",
      fontStyle: "bold",
      color: "#ffd166",
    });

    this.countsText = this.add.text(22, 46, "■ 0/2   ▲ 0/2   ◆ 0/2", {
      fontFamily: "Arial, sans-serif",
      fontSize: "17px",
      color: "#f8fafc",
    });

    // Top-right timer & mute button
    this.add.rectangle(width - 110, 34, 195, 48, 0x0f172a, 0.7).setStrokeStyle(1, 0x38bdf8, 0.5);

    this.timerText = this.add
      .text(width - 135, 34, `Tiempo: ${this.timeLeft}s`, {
        fontFamily: "Arial, sans-serif",
        fontSize: "21px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.muteText = this.add
      .text(width - 34, 34, soundManager.muted ? "🔇" : "🔊", {
        fontSize: "22px",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.muteText.on("pointerdown", () => {
      const muted = soundManager.toggleMute();
      this.muteText.setText(muted ? "🔇" : "🔊");
    });
  }

  _spawnFallingItem() {
    if (this.isGameOver) return;

    const x = Phaser.Math.Between(40, this.scale.width - 40);
    const roll = Phaser.Math.Between(1, 100);

    if (roll <= 20) {
      // Negative item (20% chance)
      const bad = this.badItems.create(x, -20, "badItem");
      bad.setDisplaySize(40, 40);
      bad.setBounce(0.6);
      bad.setCollideWorldBounds(true);
      bad.setVelocityX(Phaser.Math.Between(-80, 80));
      bad.setAngularVelocity(Phaser.Math.Between(-150, 150));
      bad.setData("bouncesLeft", 2);
      return;
    }

    const types = ["square", "triangle", "diamond"];
    const type = Phaser.Utils.Array.GetRandom(types);
    const cfg = SHAPE_CONFIG[type];

    const item = this.collectibles.create(x, -20, cfg.key);
    item.setDisplaySize(38, 38);
    item.setBounce(0.7);
    item.setCollideWorldBounds(true);
    item.setVelocityX(Phaser.Math.Between(-70, 70));
    item.setData("type", type);
    item.setData("points", cfg.points);
    item.setData("maxPoints", cfg.points);
    item.setData("lastBounceTime", 0);
  }

  _handleCollectibleGroundBounce(item) {
    if (!item.active) return;

    const now = this.time.now;
    if (now - item.getData("lastBounceTime") < 140) return;
    item.setData("lastBounceTime", now);

    const nextPoints = item.getData("points") - BOUNCE_PENALTY;
    item.setData("points", nextPoints);
    soundManager.playBounce();

    if (nextPoints <= 0) {
      this._showFloatingText(item.x, item.y - 12, "0", "#94a3b8");
      item.destroy();
      return;
    }

    const ratio = nextPoints / item.getData("maxPoints");
    item.setAlpha(Math.max(0.35, ratio));
    this._showFloatingText(item.x, item.y - 12, `-${BOUNCE_PENALTY}`, "#cbd5e1");
  }

  _handleBadGroundBounce(bad) {
    if (!bad.active) return;

    const now = this.time.now;
    if (now - (bad.getData("lastBounceTime") || 0) < 140) return;
    bad.setData("lastBounceTime", now);

    const left = bad.getData("bouncesLeft") - 1;
    bad.setData("bouncesLeft", left);
    if (left <= 0) {
      bad.destroy();
    }
  }

  _handleCollectItem(_player, item) {
    if (this.isGameOver || !item.active) return;

    const type = item.getData("type");
    const points = item.getData("points");
    const cfg = SHAPE_CONFIG[type];

    // Persist collected item in array
    this.collectedItems.push({ type, points });
    this.score += points;

    soundManager.playCollect(type);
    this._showFloatingText(item.x, item.y - 16, `+${points}`, cfg.color);
    item.destroy();

    const counts = this._getShapeCounts();
    this._updateHUD(counts);

    // Check win condition after each collection
    const hasAllShapes =
      counts.square >= WIN_MIN_PER_SHAPE &&
      counts.triangle >= WIN_MIN_PER_SHAPE &&
      counts.diamond >= WIN_MIN_PER_SHAPE;

    if (hasAllShapes && this.score >= WIN_MIN_SCORE) {
      this._endGame(true, counts);
    }
  }

  _handleHitBadItem(_player, bad) {
    if (this.isGameOver || !bad.active) return;

    this.score = Math.max(0, this.score - BAD_ITEM_PENALTY);
    soundManager.playBad();
    this.cameras.main.shake(160, 0.008);
    this._showFloatingText(bad.x, bad.y - 16, `-${BAD_ITEM_PENALTY}`, "#ef4444");
    bad.destroy();

    this._updateHUD(this._getShapeCounts());
  }

  _getShapeCounts() {
    const counts = { square: 0, triangle: 0, diamond: 0 };
    for (const item of this.collectedItems) {
      if (counts[item.type] !== undefined) {
        counts[item.type] += 1;
      }
    }
    return counts;
  }

  _updateHUD(counts) {
    this.scoreText.setText(`Puntaje: ${this.score}`);
    this.countsText.setText(
      `■ ${counts.square}/${WIN_MIN_PER_SHAPE}   ▲ ${counts.triangle}/${WIN_MIN_PER_SHAPE}   ◆ ${counts.diamond}/${WIN_MIN_PER_SHAPE}`
    );
  }

  _tickTimer() {
    if (this.isGameOver) return;

    this.timeLeft -= 1;
    this.timerText.setText(`Tiempo: ${this.timeLeft}s`);

    if (this.timeLeft <= 10) {
      this.timerText.setColor("#ef4444");
    }

    if (this.timeLeft <= 0) {
      this._endGame(false, this._getShapeCounts());
    }
  }

  _showFloatingText(x, y, message, color) {
    const txt = this.add
      .text(x, y, message, {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        fontStyle: "bold",
        color,
        stroke: "#0f172a",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: txt,
      y: y - 30,
      alpha: 0,
      duration: 550,
      onComplete: () => txt.destroy(),
    });
  }

  _endGame(won, counts) {
    this.isGameOver = true;
    this.spawnTimer.remove(false);
    this.countdownTimer.remove(false);
    this.physics.pause();

    if (won) soundManager.playWin();
    else soundManager.playLose();

    this.time.delayedCall(450, () => {
      this.scene.start("GameOverScene", {
        won,
        score: this.score,
        counts,
        timeLeft: Math.max(0, this.timeLeft),
      });
    });
  }
}
