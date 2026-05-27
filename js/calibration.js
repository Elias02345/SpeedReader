import { scoreRecall } from './orp.js';
import { getPassagesForStage, getDemoPassage, getBaselinePassages, getConfirmPassage } from './data.js';

const BASELINE_SPEEDS = [150, 200, 250, 300];

export class CalibrationController {
  constructor(lang = 'de') {
    this.lang = lang;
    this.reset();
  }

  reset() {
    this.phase = 'idle';        // idle | demo | baseline | ramp | confirm | done
    this.baselineResults = [];  // { wpm, score, passed }
    this.rampResults = [];
    this.confirmResult = null;
    this.baselineWpm = 150;
    this.maxWpm = 200;
    this.recommendedWpm = 200;
    this.currentPassage = null;
    this.currentWpm = 150;
    this._baselineIndex = 0;
    this._rampConsecutiveFails = 0;
    this._usedIds = new Set();
    this._startTime = null;
    this._confirmAttempts = 0;
    this._confirmWpm = 200;
  }

  setLang(lang) {
    this.lang = lang;
  }

  // ── DEMO ─────────────────────────────────────────────────────────────────
  startDemo() {
    this.phase = 'demo';
    this.currentPassage = getDemoPassage(this.lang);
    this.currentWpm = 150;
    return { passage: this.currentPassage, wpm: this.currentWpm };
  }

  // ── BASELINE ──────────────────────────────────────────────────────────────
  startBaseline() {
    this.phase = 'baseline';
    this._baselineIndex = 0;
    this.baselineResults = [];
    this._startTime = Date.now();
    const passages = getBaselinePassages(this.lang);
    this._baselinePassages = passages;
    return this._nextBaseline();
  }

  _nextBaseline() {
    if (this._baselineIndex >= BASELINE_SPEEDS.length) {
      return this._finishBaseline();
    }
    this.currentWpm = BASELINE_SPEEDS[this._baselineIndex];
    this.currentPassage = this._baselinePassages[this._baselineIndex];
    return {
      passage: this.currentPassage,
      wpm: this.currentWpm,
      stageIndex: this._baselineIndex,
      totalStages: BASELINE_SPEEDS.length,
      done: false,
    };
  }

  submitBaselineRecall(userInput) {
    const score = scoreRecall(userInput, this.currentPassage.keywords);
    const passed = score >= 0.45;
    this.baselineResults.push({ wpm: this.currentWpm, score, passed });
    this._usedIds.add(this.currentPassage.id);
    this._baselineIndex++;

    // Early stop: failed 150 WPM
    if (this._baselineIndex === 1 && !passed) {
      return this._finishBaseline();
    }
    return this._nextBaseline();
  }

  _finishBaseline() {
    let highest = 100;
    this.baselineResults.forEach((r, i) => {
      if (r.passed) highest = BASELINE_SPEEDS[i] ?? r.wpm;
    });
    this.baselineWpm = highest;
    return { done: true, baselineWpm: this.baselineWpm };
  }

  // ── RAMP ──────────────────────────────────────────────────────────────────
  startRamp() {
    this.phase = 'ramp';
    this.rampResults = [];
    this._rampConsecutiveFails = 0;
    this.currentWpm = Math.min(this.baselineWpm + 50, 400);
    this.currentPassage = this._pickRampPassage();
    return { passage: this.currentPassage, wpm: this.currentWpm };
  }

  _pickRampPassage() {
    const diff = this.currentWpm > 600 ? 'hard' : this.currentWpm > 400 ? 'medium' : 'easy';
    const pool = getPassagesForStage(this.lang, 'ramp', diff)
      .filter(p => !this._usedIds.has(p.id));
    if (pool.length === 0) {
      // exhausted – reuse
      const full = getPassagesForStage(this.lang, 'ramp', diff);
      return full[Math.floor(Math.random() * full.length)];
    }
    const p = pool[Math.floor(Math.random() * pool.length)];
    this._usedIds.add(p.id);
    return p;
  }

  submitRampRecall(userInput) {
    const score = scoreRecall(userInput, this.currentPassage.keywords);
    const passed = score >= 0.35;
    this.rampResults.push({ wpm: this.currentWpm, score, passed });

    if (passed) {
      this._rampConsecutiveFails = 0;
    } else {
      this._rampConsecutiveFails++;
    }

    if (this._rampConsecutiveFails >= 2 || this.currentWpm >= 1000) {
      return this._finishRamp();
    }

    this.currentWpm = Math.min(this.currentWpm + 25, 1000);
    this.currentPassage = this._pickRampPassage();
    return { passage: this.currentPassage, wpm: this.currentWpm, done: false };
  }

  _finishRamp() {
    let maxPassed = this.baselineWpm;
    let consecutive = 0;
    for (const r of this.rampResults) {
      if (r.passed) { maxPassed = r.wpm; consecutive = 0; }
      else if (++consecutive >= 2) break;
    }
    this.maxWpm = maxPassed;
    return { done: true, maxWpm: this.maxWpm };
  }

  // ── CONFIRM ───────────────────────────────────────────────────────────────
  startConfirm() {
    this.phase = 'confirm';
    this._confirmAttempts = 0;
    this._confirmWpm = Math.max(100, Math.round(this.maxWpm * 0.80 / 25) * 25);
    this.currentWpm = this._confirmWpm;
    this.currentPassage = getConfirmPassage(this.lang, [...this._usedIds]);
    this._usedIds.add(this.currentPassage.id);
    return { passage: this.currentPassage, wpm: this.currentWpm, attempt: 1 };
  }

  submitConfirmRecall(userInput) {
    const score = scoreRecall(userInput, this.currentPassage.keywords);
    const passed = score >= 0.45;
    this._confirmAttempts++;
    this.confirmResult = { wpm: this.currentWpm, score, passed, attempts: this._confirmAttempts };

    if (passed) {
      this.recommendedWpm = this.currentWpm;
    } else if (this._confirmAttempts < 2) {
      // One retry at lower speed
      this._confirmWpm = Math.max(100, Math.round(this.maxWpm * 0.65 / 25) * 25);
      this.currentWpm = this._confirmWpm;
      this.currentPassage = getConfirmPassage(this.lang, [...this._usedIds]);
      this._usedIds.add(this.currentPassage.id);
      return { retry: true, passage: this.currentPassage, wpm: this.currentWpm, attempt: 2 };
    } else {
      this.recommendedWpm = Math.max(100, Math.round(this.maxWpm * 0.60 / 25) * 25);
    }

    this.phase = 'done';
    return {
      done: true,
      baselineWpm: this.baselineWpm,
      maxWpm: this.maxWpm,
      recommendedWpm: this.recommendedWpm,
      baselineResults: this.baselineResults,
      rampResults: this.rampResults,
      confirmResult: this.confirmResult,
      durationSeconds: Math.round((Date.now() - this._startTime) / 1000),
    };
  }
}
