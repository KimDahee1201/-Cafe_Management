/**
 * Pixel Cafe Tycoon - Retro Web Audio API Synthesizer
 * Generates authentic 8-bit sound effects & chiptune melodies without external assets.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private isBgmPlaying: boolean = false;
  private bgmTimeout: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isBgmPlaying) {
      this.stopBGM();
    }
    return this.isMuted;
  }

  // Play a simple synthesized retro tone
  private playTone(freq: number, type: OscillatorType, duration: number, gainValue = 0.1) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio not permitted yet or unsupported
    }
  }

  // Coin / Cash sound (Ding-chime)
  public playCoin() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore
    }
  }

  // Cash Register Cha-Ching!
  public playRegister() {
    this.playCoin();
    setTimeout(() => {
      this.playTone(1760, 'triangle', 0.25, 0.1);
    }, 90);
  }

  // Item pickup / drop blip
  public playPickup() {
    this.playTone(520, 'sine', 0.1, 0.08);
  }

  // Coffee machine brewing / bubbling sound
  public playBrew() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.2);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Ignore
    }
  }

  // Oven Ding! (Metallic bell)
  public playOvenDing() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(1200, now);
      osc2.frequency.setValueAtTime(2400, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch {
      // Ignore
    }
  }

  // Happy customer cheer (Two rising harmonious tones)
  public playCustomerHappy() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(880.0, now + 0.1); // A5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Ignore
    }
  }

  // Level Up / Milestone fanfare
  public playFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.28, 0.12);
      }, idx * 110);
    });
  }

  // Soft Footstep
  public playFootstep() {
    this.playTone(180, 'sine', 0.05, 0.02);
  }

  // Gentle Retro Chiptune Loop (Cozy Cafe Melody)
  public startBGM() {
    if (this.isBgmPlaying || this.isMuted) return;
    this.isBgmPlaying = true;

    // Melody notes in Hz (C major / Pentatonic cozy cafe vibe)
    const melody = [
      { note: 261.63, dur: 0.3 }, // C4
      { note: 329.63, dur: 0.3 }, // E4
      { note: 392.0, dur: 0.3 }, // G4
      { note: 440.0, dur: 0.4 }, // A4
      { note: 392.0, dur: 0.3 }, // G4
      { note: 329.63, dur: 0.3 }, // E4
      { note: 293.66, dur: 0.4 }, // D4
      { note: 261.63, dur: 0.5 }, // C4
    ];

    let noteIdx = 0;
    const playNext = () => {
      if (!this.isBgmPlaying || this.isMuted) return;
      const current = melody[noteIdx];
      this.playTone(current.note, 'triangle', current.dur, 0.035);
      noteIdx = (noteIdx + 1) % melody.length;
      this.bgmTimeout = window.setTimeout(playNext, current.dur * 1000 + 120);
    };

    playNext();
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimeout !== null) {
      clearTimeout(this.bgmTimeout);
      this.bgmTimeout = null;
    }
  }

  public toggleBGM(): boolean {
    if (this.isBgmPlaying) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  }

  public getBgmState() {
    return this.isBgmPlaying;
  }
}

export const sound = new SoundSystem();
