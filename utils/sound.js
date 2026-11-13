// Lightweight Web Audio API sound effects generator (no external audio files required)

class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  _ensureContext() {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  _playTone({ freq, endFreq = null, duration = 0.12, type = "sine", volume = 0.15, delay = 0 }) {
    const ctx = this._ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playClick() {
    this._playTone({ freq: 520, endFreq: 760, duration: 0.08, type: "triangle", volume: 0.14 });
  }

  playJump() {
    this._playTone({ freq: 240, endFreq: 520, duration: 0.14, type: "square", volume: 0.08 });
  }

  playCollect(shapeType) {
    const pitchMap = {
      square: 523.25,   // C5
      triangle: 659.25, // E5
      diamond: 880.0,   // A5
    };
    const base = pitchMap[shapeType] || 587.33;
    this._playTone({ freq: base, endFreq: base * 1.25, duration: 0.12, type: "triangle", volume: 0.16 });
  }

  playBad() {
    this._playTone({ freq: 180, endFreq: 75, duration: 0.25, type: "sawtooth", volume: 0.14 });
  }

  playBounce() {
    this._playTone({ freq: 190, endFreq: 110, duration: 0.06, type: "sine", volume: 0.06 });
  }

  playWin() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      this._playTone({ freq, duration: 0.18, type: "triangle", volume: 0.18, delay: idx * 0.1 });
    });
  }

  playLose() {
    const notes = [392.0, 349.23, 311.13, 261.63];
    notes.forEach((freq, idx) => {
      this._playTone({ freq, duration: 0.22, type: "sawtooth", volume: 0.11, delay: idx * 0.13 });
    });
  }
}

export const soundManager = new SoundManager();
