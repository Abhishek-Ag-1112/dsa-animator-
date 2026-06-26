class AudioEngine {
  private ctx: AudioContext | null = null;
  private volume: number = 0.5; // default 50%
  private isMuted: boolean = false;

  private init() {
    if (typeof window === 'undefined') return;
    
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(vol: number) {
    // vol is 0 to 1
    this.volume = vol;
    this.init();
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    this.init();
  }

  getVolume() {
    return this.volume;
  }

  getMuted() {
    return this.isMuted;
  }

  private playTone(freqStart: number, freqEnd: number, durationMs: number, type: OscillatorType = 'sine') {
    if (this.isMuted || this.volume <= 0) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, this.ctx.currentTime);
      if (freqEnd !== freqStart) {
        osc.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + durationMs / 1000);
      }

      // Smooth amplitude envelope to avoid pops
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.12, this.ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + durationMs / 1000);
    } catch (e) {
      console.warn("Audio playback failed", e);
    }
  }

  playComparison() {
    // 520 Hz, 100ms, sine wave ping
    this.playTone(520, 520, 100, 'sine');
  }

  playSwap() {
    // 300 Hz, 150ms, triangle wave sweep
    this.playTone(300, 300, 150, 'triangle');
  }

  playCompletion() {
    // Three-note C5-E5-G5 chime with timed offsets
    if (this.isMuted || this.volume <= 0) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { freq: 523.25, delay: 0.0, duration: 0.2 }, // C5
      { freq: 659.25, delay: 0.12, duration: 0.2 }, // E5
      { freq: 783.99, delay: 0.24, duration: 0.4 }, // G5
    ];

    notes.forEach((note) => {
      try {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, now + note.delay);

        gain.gain.setValueAtTime(0.001, now + note.delay);
        gain.gain.linearRampToValueAtTime(this.volume * 0.12, now + note.delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.delay + note.duration);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + note.delay);
        osc.stop(now + note.delay + note.duration);
      } catch (e) {
        console.warn("Audio completion note failed", e);
      }
    });
  }
}

export const audioEngine = new AudioEngine();
export default audioEngine;
