const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export class NeonAudio {
  private ctx?: AudioContext;
  private enabled = true;

  toggle(enabled: boolean) {
    this.enabled = enabled;
  }

  playBirth(energy: number) {
    this.playNote(220 + energy * 4, 0.3, 0.1);
  }

  playConsume(energy: number) {
    this.playNote(320 + energy * 2, 0.45, 0.08);
  }

  playDeath() {
    this.playNote(120, 0.22, 0.18);
  }

  private ensureContext() {
    if (!this.ctx) this.ctx = new AudioContext();
  }

  private playNote(frequency: number, gainValue: number, duration: number) {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = clamp(frequency, 80, 1200);

    gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    oscillator.connect(gain).connect(this.ctx.destination);
    oscillator.start();
    oscillator.stop(this.ctx.currentTime + duration);
  }
}
