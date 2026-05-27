import { RSVPReader, detectRefreshRate } from './reader.js';
import { CalibrationController } from './calibration.js';
import { createProfile, saveToStorage, loadFromStorage, downloadProfile, importProfile } from './profile.js';
import { tokenize, splitWordForORP } from './orp.js';

// ── i18n ──────────────────────────────────────────────────────────────────────
const LANG = {
  de: {
    appName: 'SpeedReader',
    tagline: 'Schneller lesen. Mehr verstehen.',
    btnCalibrate: 'Kalibrieren',
    btnRead: 'Lesen',
    btnImportProfile: 'Profil laden',
    btnDownloadProfile: 'Profil speichern',
    profileLoaded: 'Profil geladen',
    recommendedWpm: 'Empfohlene Geschwindigkeit',
    noProfile: 'Kein Profil vorhanden',
    calIntroTitle: 'Kalibrierung starten',
    calIntroBody: '<p>Das Kalibrierungs-Spiel findet deine optimale Lesegeschwindigkeit in 4 Schritten:</p><ol><li><strong>Demo</strong> – Lerne die rote Buchstaben-Technik kennen</li><li><strong>Basis-Test</strong> – Wir finden deine Startgeschwindigkeit</li><li><strong>Geschwindigkeits-Test</strong> – Die Geschwindigkeit steigt, bis du an deine Grenze stößt</li><li><strong>Bestätigung</strong> – Wir bestätigen deine optimale Geschwindigkeit</li></ol><p>Dauer: ca. 5–8 Minuten. Danach kannst du dein Profil speichern und in jeder neuen Session nutzen.</p>',
    btnStartCal: 'Kalibrierung starten',
    demoTitle: 'So funktioniert es',
    demoDesc: 'Der <span class="orp-inline">rote Buchstabe</span> bleibt immer an derselben Stelle. Fixiere deinen Blick auf diesen Punkt – die Wörter kommen zu dir.',
    btnDemoNext: 'Verstanden – weiter',
    baselineTitle: 'Basis-Test',
    baselineDesc: 'Schreib auf, woran du dich erinnerst. Stichworte reichen völlig.',
    recallPlaceholder: 'Was hast du gelesen? Stichworte oder Sätze…',
    btnSubmitRecall: 'Weiter →',
    rampTitle: 'Geschwindigkeits-Test',
    rampDesc: 'Die Geschwindigkeit steigt automatisch. Lies so viel du kannst.',
    confirmTitle: 'Abschluss-Test',
    confirmDesc: 'Ein längerer Text. Schreib danach auf, woran du dich erinnerst.',
    resultsTitle: '✓ Kalibrierung abgeschlossen',
    resultsBaseline: 'Startgeschwindigkeit',
    resultsMax: 'Maximale Geschwindigkeit',
    resultsRecommended: 'Empfohlen für dich',
    btnSaveProfile: 'Profil herunterladen (.json)',
    btnGoRead: 'Jetzt lesen',
    readerSetupTitle: 'Text lesen',
    readerPlaceholder: 'Text hier einfügen…',
    btnStartReading: 'Lesen starten',
    wpmLabel: 'Wörter / Minute',
    btnPause: '⏸',
    btnPlay: '▶',
    done: 'Fertig!',
    doneMsg: 'Du hast den gesamten Text gelesen.',
    btnReadAgain: 'Nochmal',
    btnNewText: 'Neuer Text',
    btnHome: 'Startseite',
    profileImportOk: '✓ Profil geladen!',
    profileImportErr: 'Ungültiges Profil-Format.',
    textTooShort: 'Bitte mindestens 10 Wörter eingeben.',
    pressSpace: 'Leertaste = Pause/Weiter  ·  ← → = ±5 Wörter  ·  ↑ ↓ = Geschwindigkeit',
    step: 'Schritt',
    of: 'von',
    wpm: 'WPM',
    recallPrompt: 'Was hast du gelesen?',
    confirmAttempt2: 'Noch ein Versuch – etwas langsamer.',
    speedLabel: 'Geschwindigkeit',
    screenHz: 'Bildschirm-Hz',
  },
  en: {
    appName: 'SpeedReader',
    tagline: 'Read faster. Understand more.',
    btnCalibrate: 'Calibrate',
    btnRead: 'Read',
    btnImportProfile: 'Load Profile',
    btnDownloadProfile: 'Save Profile',
    profileLoaded: 'Profile loaded',
    recommendedWpm: 'Recommended speed',
    noProfile: 'No profile loaded',
    calIntroTitle: 'Start Calibration',
    calIntroBody: '<p>The calibration game finds your optimal reading speed in 4 steps:</p><ol><li><strong>Demo</strong> – Learn the red letter technique</li><li><strong>Baseline Test</strong> – We find your starting speed</li><li><strong>Speed Test</strong> – Speed increases until you reach your limit</li><li><strong>Confirmation</strong> – We confirm your optimal speed</li></ol><p>Duration: approx. 5–8 minutes. Then you can save your profile and use it in future sessions.</p>',
    btnStartCal: 'Start calibration',
    demoTitle: 'How it works',
    demoDesc: 'The <span class="orp-inline">red letter</span> always stays at the same position. Fix your gaze on that point – the words come to you.',
    btnDemoNext: 'Got it – continue',
    baselineTitle: 'Baseline Test',
    baselineDesc: 'Write what you remember. Keywords are fine.',
    recallPlaceholder: 'What did you read? Keywords or sentences…',
    btnSubmitRecall: 'Continue →',
    rampTitle: 'Speed Test',
    rampDesc: 'Speed increases automatically. Read as much as you can.',
    confirmTitle: 'Final Test',
    confirmDesc: 'A longer passage. Write what you remember afterwards.',
    resultsTitle: '✓ Calibration complete',
    resultsBaseline: 'Starting speed',
    resultsMax: 'Maximum speed',
    resultsRecommended: 'Recommended for you',
    btnSaveProfile: 'Download profile (.json)',
    btnGoRead: 'Start reading',
    readerSetupTitle: 'Read Text',
    readerPlaceholder: 'Paste your text here…',
    btnStartReading: 'Start reading',
    wpmLabel: 'Words / Minute',
    btnPause: '⏸',
    btnPlay: '▶',
    done: 'Done!',
    doneMsg: 'You have read the entire text.',
    btnReadAgain: 'Read again',
    btnNewText: 'New text',
    btnHome: 'Home',
    profileImportOk: '✓ Profile loaded!',
    profileImportErr: 'Invalid profile format.',
    textTooShort: 'Please enter at least 10 words.',
    pressSpace: 'Space = Pause/Resume  ·  ← → = ±5 words  ·  ↑ ↓ = speed',
    step: 'Step',
    of: 'of',
    wpm: 'WPM',
    recallPrompt: 'What did you read?',
    confirmAttempt2: 'One more try – slightly slower.',
    speedLabel: 'Speed',
    screenHz: 'Screen Hz',
  }
};

// ── App state ─────────────────────────────────────────────────────────────────
let lang = 'de';
let t = LANG.de;
let profile = null;
let screenHz = 60;
let readerWords = [];
let calData = null;
const reader = new RSVPReader();
let cal = null;

// ── DOM helpers ───────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

function navigateTo(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  $(viewId)?.classList.add('active');
  window.scrollTo(0, 0);
}

function showEl(id) { $(id)?.classList.remove('hidden'); }
function hideEl(id) { $(id)?.classList.add('hidden'); }

function setSliderAndLabel(sliderId, labelId, value) {
  const s = $(sliderId); if (s) s.value = value;
  const l = $(labelId); if (l) l.textContent = value;
}

function renderWordParts(displayId, { left, orp, right }) {
  const el = $(displayId);
  if (!el) return;
  el.querySelector('.word-left').textContent = left;
  el.querySelector('.word-orp').textContent = orp;
  el.querySelector('.word-right').textContent = right;
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] === undefined) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = t[key];
    } else {
      el.innerHTML = t[key];
    }
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    if (t[key] !== undefined) el.placeholder = t[key];
  });
  document.documentElement.lang = lang;
}

function setLang(newLang) {
  if (!LANG[newLang]) return;
  lang = newLang;
  t = LANG[lang];
  $('lang-de')?.classList.toggle('active', lang === 'de');
  $('lang-en')?.classList.toggle('active', lang === 'en');
  if (cal) cal.setLang(lang);
  applyI18n();
  updateHomeCard();
}

// ── Profile UI ────────────────────────────────────────────────────────────────
function updateHomeCard() {
  if (profile) {
    showEl('home-profile-card');
    $('profile-wpm-val').textContent = `${profile.recommendedWpm} ${t.wpm}`;
    $('profile-rec-label').textContent = t.recommendedWpm;
    showEl('btn-download-profile');
  } else {
    hideEl('home-profile-card');
    hideEl('btn-download-profile');
  }
  showEl('btn-read');
}

function applyProfile(p) {
  profile = p;
  const pLang = p.lang && LANG[p.lang] ? p.lang : lang;
  lang = pLang;
  t = LANG[lang];
  setSliderAndLabel('setup-wpm-slider', 'setup-wpm-value', p.recommendedWpm);
  setSliderAndLabel('reader-wpm-slider', 'reader-wpm-inline', p.recommendedWpm);
  reader.setWPM(p.recommendedWpm);
  reader.punctuationDelays = p.preferences?.punctuationDelays !== false;
  setLang(lang);
}

// ── Passage runner ────────────────────────────────────────────────────────────
function runPassage(displayId, passage, wpm, onDone) {
  const words = tokenize(passage.text);
  reader.load(words, wpm);
  // Show first word immediately so display isn't blank
  if (words.length > 0) {
    const [l, o, r] = splitWordForORP(words[0]);
    renderWordParts(displayId, { left: l, orp: o, right: r });
  }
  reader.onWord = (_, _i, _n, parts) => renderWordParts(displayId, parts);
  reader.onEnd = () => {
    reader.onWord = null;
    reader.onEnd = null;
    onDone();
  };
  reader.start();
}

// ── CALIBRATION FLOW ──────────────────────────────────────────────────────────
function startCalibration() {
  cal = new CalibrationController(lang);
  $('cal-intro-body').innerHTML = t.calIntroBody;
  navigateTo('view-cal-intro');
}

function runDemo() {
  navigateTo('view-cal-demo');
  hideEl('btn-demo-next');
  const info = cal.startDemo();
  runPassage('demo-word', info.passage, info.wpm, () => showEl('btn-demo-next'));
}

function runBaseline(info) {
  if (info.done) { startRamp(); return; }
  navigateTo('view-cal-baseline');
  hideEl('baseline-recall');

  $('baseline-step').textContent = `${t.step} ${info.stageIndex + 1} ${t.of} ${info.totalStages}`;
  $('baseline-wpm-badge').textContent = `${info.wpm} ${t.wpm}`;

  // progress dots
  const dotsEl = $('baseline-dots');
  dotsEl.innerHTML = '';
  for (let i = 0; i < info.totalStages; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i < info.stageIndex ? ' done' : i === info.stageIndex ? ' active' : '');
    dotsEl.appendChild(dot);
  }

  runPassage('baseline-word', info.passage, info.wpm, () => {
    showEl('baseline-recall');
    $('baseline-recall-label').innerHTML = t.baselineDesc;
    $('baseline-input').value = '';
    $('baseline-input').placeholder = t.recallPlaceholder;
    $('baseline-input').focus();
  });
}

function startRamp() {
  const info = cal.startRamp();
  runRamp(info);
}

function runRamp(info) {
  if (info.done) { startConfirm(); return; }
  navigateTo('view-cal-ramp');
  hideEl('ramp-recall');
  $('ramp-wpm-display').textContent = `${info.wpm} ${t.wpm}`;
  $('ramp-desc').innerHTML = t.rampDesc;

  runPassage('ramp-word', info.passage, info.wpm, () => {
    showEl('ramp-recall');
    $('ramp-input').value = '';
    $('ramp-input').placeholder = t.recallPlaceholder;
    $('ramp-input').focus();
  });
}

function startConfirm() {
  const info = cal.startConfirm();
  renderConfirm(info, false);
}

function renderConfirm(info, isRetry) {
  navigateTo('view-cal-confirm');
  hideEl('confirm-recall');
  $('confirm-wpm-display').textContent = `${info.wpm} ${t.wpm}`;
  $('confirm-desc').innerHTML = isRetry ? `${t.confirmAttempt2} ${t.confirmDesc}` : t.confirmDesc;

  runPassage('confirm-word', info.passage, info.wpm, () => {
    showEl('confirm-recall');
    $('confirm-input').value = '';
    $('confirm-input').placeholder = t.recallPlaceholder;
    $('confirm-input').focus();
  });
}

function showResults(data) {
  calData = data;
  navigateTo('view-cal-results');
  $('result-title').innerHTML = t.resultsTitle;
  $('result-baseline').textContent = `${data.baselineWpm} ${t.wpm}`;
  $('result-max').textContent = `${data.maxWpm} ${t.wpm}`;
  $('result-recommended').textContent = `${data.recommendedWpm} ${t.wpm}`;
  $('result-baseline-label').textContent = t.resultsBaseline;
  $('result-max-label').textContent = t.resultsMax;
  $('result-recommended-label').textContent = t.resultsRecommended;

  // Bar chart
  const chart = $('results-chart');
  chart.innerHTML = '';
  const maxVal = Math.max(data.maxWpm, 400, data.recommendedWpm);
  const bars = [
    { label: t.resultsBaseline, value: data.baselineWpm, cls: 'bar-baseline' },
    { label: t.resultsMax, value: data.maxWpm, cls: 'bar-max' },
    { label: t.resultsRecommended, value: data.recommendedWpm, cls: 'bar-rec' },
  ];
  bars.forEach(({ label, value, cls }) => {
    const row = document.createElement('div');
    row.className = 'chart-row';
    row.innerHTML = `<span class="chart-label">${label}</span>
      <div class="chart-bar-wrap"><div class="chart-bar ${cls}" style="width:${Math.round(value/maxVal*100)}%"></div></div>
      <span class="chart-val">${value} ${t.wpm}</span>`;
    chart.appendChild(row);
  });
}

// ── READER FLOW ───────────────────────────────────────────────────────────────
function goToReaderSetup() {
  navigateTo('view-reader-setup');
  const hint = $('reader-profile-hint');
  hint.textContent = profile
    ? `${t.profileLoaded} · ${profile.recommendedWpm} ${t.wpm}`
    : t.noProfile;
  const wpm = profile?.recommendedWpm ?? parseInt($('setup-wpm-slider').value, 10);
  setSliderAndLabel('setup-wpm-slider', 'setup-wpm-value', wpm);
}

function startReading() {
  const raw = $('reader-text-input').value.trim();
  if (!raw) return;
  const words = tokenize(raw);
  if (words.length < 10) { flashMessage(t.textTooShort, true); return; }
  readerWords = words;
  const wpm = parseInt($('setup-wpm-slider').value, 10);
  launchReader(wpm);
}

function launchReader(wpm) {
  reader.load(readerWords, wpm);
  reader.punctuationDelays = true;
  navigateTo('view-reader');
  setSliderAndLabel('reader-wpm-slider', 'reader-wpm-inline', wpm);
  updateReaderWPM(wpm);
  updateProgress(0, readerWords.length);
  $('btn-reader-playpause').textContent = t.btnPause;
  reader.onWord = (_, idx, total, parts) => {
    renderWordParts('reader-word', parts);
    updateProgress(idx + 1, total);
  };
  reader.onEnd = () => {
    $('btn-reader-playpause').textContent = t.btnPlay;
    setTimeout(() => navigateTo('view-reader-done'), 600);
  };
  reader.start();
}

function updateProgress(current, total) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  $('reader-progress-fill').style.width = `${pct}%`;
  $('reader-progress-text').textContent = `${current} / ${total}`;
}

function updateReaderWPM(wpm) {
  $('reader-wpm-label').textContent = `${wpm} ${t.wpm}`;
  $('reader-wpm-inline').textContent = wpm;
}

function toggleReaderPause() {
  if (reader.running) {
    reader.pause();
    $('btn-reader-playpause').textContent = t.btnPlay;
  } else {
    reader.resume();
    $('btn-reader-playpause').textContent = t.btnPause;
  }
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function flashMessage(msg, isError = false) {
  let toast = $('app-toast');
  if (!toast) {
    toast = Object.assign(document.createElement('div'), { id: 'app-toast', className: 'toast' });
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${isError ? 'toast-error' : 'toast-ok'} visible`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('visible'), 2500);
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
function wireEvents() {
  // Language
  $('lang-de').addEventListener('click', () => setLang('de'));
  $('lang-en').addEventListener('click', () => setLang('en'));

  // Home
  $('btn-calibrate').addEventListener('click', startCalibration);
  $('btn-read').addEventListener('click', goToReaderSetup);
  $('btn-import').addEventListener('click', () => $('import-file').click());
  $('btn-download-profile').addEventListener('click', () => profile && downloadProfile(profile));
  $('import-file').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const p = await importProfile(file);
      applyProfile(p);
      saveToStorage(p);
      updateHomeCard();
      flashMessage(t.profileImportOk);
    } catch {
      flashMessage(t.profileImportErr, true);
    }
    e.target.value = '';
  });

  // Cal intro
  $('btn-start-cal').addEventListener('click', runDemo);
  $('btn-back-intro').addEventListener('click', () => { reader.stop(); navigateTo('view-home'); });

  // Demo
  $('btn-demo-next').addEventListener('click', () => {
    reader.stop();
    runBaseline(cal.startBaseline());
  });

  // Baseline
  function submitBaseline() {
    reader.stop();
    runBaseline(cal.submitBaselineRecall($('baseline-input').value));
  }
  $('btn-baseline-submit').addEventListener('click', submitBaseline);
  $('baseline-input').addEventListener('keydown', e => { if (e.ctrlKey && e.key === 'Enter') submitBaseline(); });

  // Ramp
  function submitRamp() {
    reader.stop();
    const info = cal.submitRampRecall($('ramp-input').value);
    runRamp(info);
  }
  $('btn-ramp-submit').addEventListener('click', submitRamp);
  $('ramp-input').addEventListener('keydown', e => { if (e.ctrlKey && e.key === 'Enter') submitRamp(); });

  // Confirm
  function submitConfirm() {
    reader.stop();
    const result = cal.submitConfirmRecall($('confirm-input').value);
    if (result.retry) renderConfirm(result, true);
    else if (result.done) showResults(result);
  }
  $('btn-confirm-submit').addEventListener('click', submitConfirm);
  $('confirm-input').addEventListener('keydown', e => { if (e.ctrlKey && e.key === 'Enter') submitConfirm(); });

  // Results
  $('btn-save-profile').addEventListener('click', () => {
    if (!calData) return;
    const p = createProfile({ ...calData, lang, screenHz });
    profile = p;
    saveToStorage(p);
    updateHomeCard();
    downloadProfile(p);
  });
  $('btn-go-read').addEventListener('click', () => {
    if (calData) {
      const p = createProfile({ ...calData, lang, screenHz });
      applyProfile(p);
      saveToStorage(p);
    }
    goToReaderSetup();
  });

  // Reader setup
  $('setup-wpm-slider').addEventListener('input', function () {
    $('setup-wpm-value').textContent = this.value;
  });
  $('btn-start-reading').addEventListener('click', startReading);
  $('btn-back-setup').addEventListener('click', () => navigateTo('view-home'));

  // Reader controls
  $('btn-reader-back').addEventListener('click', () => { reader.stop(); navigateTo('view-reader-setup'); });
  $('btn-reader-playpause').addEventListener('click', toggleReaderPause);
  $('btn-reader-rewind').addEventListener('click', () => {
    reader.jumpBy(-5);
    updateProgress(reader.index, readerWords.length);
  });
  $('btn-reader-forward').addEventListener('click', () => {
    reader.jumpBy(5);
    updateProgress(reader.index, readerWords.length);
  });
  $('btn-reader-restart').addEventListener('click', () => {
    reader.stop();
    launchReader(parseInt($('reader-wpm-slider').value, 10));
  });
  $('reader-wpm-slider').addEventListener('input', function () {
    const wpm = parseInt(this.value, 10);
    reader.setWPM(wpm);
    updateReaderWPM(wpm);
  });

  // Done
  $('btn-read-again').addEventListener('click', () => {
    reader.stop();
    launchReader(parseInt($('reader-wpm-slider').value, 10));
  });
  $('btn-new-text').addEventListener('click', () => { reader.stop(); goToReaderSetup(); });
  $('btn-done-home').addEventListener('click', () => { reader.stop(); navigateTo('view-home'); });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    const view = document.querySelector('.view.active')?.id;
    if (view !== 'view-reader') return;
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        toggleReaderPause();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        reader.jumpBy(-5);
        updateProgress(reader.index, readerWords.length);
        break;
      case 'ArrowRight':
        e.preventDefault();
        reader.jumpBy(5);
        updateProgress(reader.index, readerWords.length);
        break;
      case 'ArrowUp': {
        e.preventDefault();
        const up = Math.min(1000, reader.wpm + 25);
        reader.setWPM(up);
        setSliderAndLabel('reader-wpm-slider', 'reader-wpm-inline', up);
        updateReaderWPM(up);
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        const down = Math.max(50, reader.wpm - 25);
        reader.setWPM(down);
        setSliderAndLabel('reader-wpm-slider', 'reader-wpm-inline', down);
        updateReaderWPM(down);
        break;
      }
      case 'Escape':
        reader.stop();
        navigateTo('view-reader-setup');
        break;
    }
  });
}

// ── UPDATE CHECK ──────────────────────────────────────────────────────────────
const GITHUB_REPO = 'elias02345/SpeedReader';
const GITHUB_BRANCH = 'claude/speed-reading-calibration-app-tRzW9';

async function checkForUpdates() {
  try {
    // Only active when running from an installed service (version.json exists)
    const vRes = await fetch('/version.json', { cache: 'no-store' });
    if (!vRes.ok) return; // dev mode – skip silently
    const version = await vRes.json();
    if (!version.commit) return;

    // Ask GitHub for latest commit on the branch
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/branches/${encodeURIComponent(GITHUB_BRANCH)}`;
    const gRes = await fetch(apiUrl, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
      cache: 'no-store',
    });
    if (!gRes.ok) return; // rate-limited or offline – skip

    const data = await gRes.json();
    const latestSha = data?.commit?.sha;
    if (!latestSha) return;

    if (latestSha !== version.commit) {
      showUpdateBanner(version.commit.slice(0, 8), latestSha.slice(0, 8));
    }
  } catch {
    // Network unavailable or CORS issue – fail silently
  }
}

function showUpdateBanner(currentSha, latestSha) {
  if ($('update-banner')) return; // already shown

  const isDE = lang === 'de';
  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.className = 'update-banner';
  banner.innerHTML = `
    <span class="update-icon">↑</span>
    <span class="update-msg">${isDE ? 'Update verfügbar' : 'Update available'}</span>
    <code class="update-cmd">sudo speedreader-update</code>
    <span class="update-sha">${currentSha} → ${latestSha}</span>
    <button class="update-close" onclick="document.getElementById('update-banner').remove()" title="Dismiss">×</button>
  `;
  document.body.prepend(banner);
}

// ── INIT ──────────────────────────────────────────────────────────────────────
async function init() {
  detectRefreshRate().then(hz => { screenHz = hz; });
  const saved = loadFromStorage();
  if (saved) applyProfile(saved);
  applyI18n();
  updateHomeCard();
  wireEvents();
  navigateTo('view-home');
  // Check for updates after a short delay (non-blocking)
  setTimeout(checkForUpdates, 2000);
}

document.addEventListener('DOMContentLoaded', init);
