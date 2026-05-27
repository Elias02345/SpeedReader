import { getDurationMultiplier, splitWordForORP } from './orp.js';

export async function detectRefreshRate() {
  return new Promise(resolve => {
    const samples = [];
    let lastTime = null;

    function sample(ts) {
      if (lastTime !== null) samples.push(ts - lastTime);
      lastTime = ts;
      if (samples.length < 30) {
        requestAnimationFrame(sample);
      } else {
        const sorted = [...samples].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const hz = Math.round(1000 / median);
        const known = [24, 30, 48, 60, 75, 90, 120, 144, 165, 240];
        resolve(known.reduce((p, c) => Math.abs(c - hz) < Math.abs(p - hz) ? c : p));
      }
    }
    requestAnimationFrame(sample);
  });
}

export class RSVPReader {
  constructor() {
    this.words = [];
    this.index = 0;
    this.wpm = 250;
    this.running = false;
    this.accumulator = 0;
    this.lastTimestamp = null;
    this.rafId = null;
    this.punctuationDelays = true;
    this.onWord = null;
    this.onEnd = null;
  }

  load(words, wpm = 250) {
    this.stop();
    this.words = words;
    this.wpm = wpm;
    this.index = 0;
    this.accumulator = 0;
  }

  get msPerWord() {
    return 60000 / Math.max(1, this.wpm);
  }

  wordDuration(word) {
    const base = this.msPerWord;
    const m = this.punctuationDelays ? getDurationMultiplier(word) : 1.0;
    return base * m;
  }

  start() {
    if (this.running) return;
    if (this.index >= this.words.length) return;
    this.running = true;
    this.lastTimestamp = null;
    this.rafId = requestAnimationFrame(ts => this._tick(ts));
  }

  pause() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.lastTimestamp = null;
  }

  resume() {
    if (!this.running && this.index < this.words.length) this.start();
  }

  togglePause() {
    this.running ? this.pause() : this.resume();
  }

  stop() {
    this.pause();
    this.index = 0;
    this.accumulator = 0;
  }

  setWPM(wpm) {
    this.wpm = Math.max(50, Math.min(1000, Math.round(wpm)));
  }

  jumpBy(delta) {
    this.index = Math.max(0, Math.min(this.words.length - 1, this.index + delta));
    this.accumulator = 0;
    if (this.index < this.words.length) this._emit(this.index);
  }

  _tick(timestamp) {
    if (!this.running) return;

    if (this.lastTimestamp !== null) {
      // clamp delta to avoid burst after tab switch
      this.accumulator += Math.min(timestamp - this.lastTimestamp, 300);
    }
    this.lastTimestamp = timestamp;

    // advance through words that fit in accumulated time
    while (this.running && this.accumulator >= this.wordDuration(this.words[this.index])) {
      this.accumulator -= this.wordDuration(this.words[this.index]);
      this._emit(this.index);
      this.index++;
      if (this.index >= this.words.length) {
        this.running = false;
        this.onEnd?.();
        return;
      }
    }

    this.rafId = requestAnimationFrame(ts => this._tick(ts));
  }

  _emit(idx) {
    const word = this.words[idx];
    const [left, orp, right] = splitWordForORP(word);
    this.onWord?.(word, idx, this.words.length, { left, orp, right });
  }
}
