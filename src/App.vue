<template>
  <UpdateBanner v-if="updateInfo" :info="updateInfo" @dismiss="updateInfo = null" />

  <ViewHome
    v-if="currentView === 'home'"
    :t="t"
    :lang="lang"
    :profile="profile"
    @calibrate="startCalibration"
    @read="goToReaderSetup"
    @import-profile="handleImportProfile"
    @download-profile="handleDownloadProfile"
    @lang-change="setLang"
  />

  <ViewCalIntro
    v-else-if="currentView === 'cal-intro'"
    :t="t"
    @back="stopAndGo('home')"
    @start="runDemo"
  />

  <ViewCalDemo
    v-else-if="currentView === 'cal-demo'"
    :t="t"
    :word-parts="wordParts"
    :is-playing="isPlaying"
    @next="handleDemoNext"
  />

  <ViewCalBaseline
    v-else-if="currentView === 'cal-baseline'"
    :t="t"
    :word-parts="wordParts"
    :is-playing="isPlaying"
    :step-info="calStepInfo"
    @submit-recall="handleBaselineRecall"
  />

  <ViewCalRamp
    v-else-if="currentView === 'cal-ramp'"
    :t="t"
    :word-parts="wordParts"
    :is-playing="isPlaying"
    :wpm="calStepInfo ? calStepInfo.wpm : 200"
    @submit-recall="handleRampRecall"
  />

  <ViewCalConfirm
    v-else-if="currentView === 'cal-confirm'"
    :t="t"
    :word-parts="wordParts"
    :is-playing="isPlaying"
    :wpm="calStepInfo ? calStepInfo.wpm : 200"
    :is-retry="calStepInfo ? calStepInfo.isRetry : false"
    @submit-recall="handleConfirmRecall"
  />

  <ViewCalResults
    v-else-if="currentView === 'cal-results'"
    :t="t"
    :cal-data="calData"
    @save-profile="handleSaveProfile"
    @go-read="handleGoRead"
  />

  <ViewReaderSetup
    v-else-if="currentView === 'reader-setup'"
    :t="t"
    :profile="profile"
    :initial-wpm="readerWpm"
    @back="stopAndGo('home')"
    @start="startReading"
  />

  <ViewReader
    v-else-if="currentView === 'reader'"
    :t="t"
    :word-parts="wordParts"
    :wpm="readerWpm"
    :progress="readerProgress"
    :is-playing="readerIsPlaying"
    @back="handleReaderBack"
    @pause-play="handleReaderPausePlay"
    @rewind="handleReaderRewind"
    @forward="handleReaderForward"
    @restart="handleReaderRestart"
    @wpm-change="handleReaderWpmChange"
  />

  <ViewReaderDone
    v-else-if="currentView === 'reader-done'"
    :t="t"
    @read-again="handleReadAgain"
    @new-text="stopAndGo('reader-setup')"
    @home="stopAndGo('home')"
  />

  <Teleport to="body">
    <div v-if="toastVisible" :class="['toast', toastError ? 'toast-error' : 'toast-ok', 'visible']">
      {{ toastMsg }}
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

import { RSVPReader, detectRefreshRate } from './lib/reader.js'
import { CalibrationController } from './lib/calibration.js'
import { createProfile, saveToStorage, loadFromStorage, downloadProfile, importProfile } from './lib/profile.js'
import { tokenize, splitWordForORP } from './lib/orp.js'
import LANG from './i18n.js'

import UpdateBanner from './components/UpdateBanner.vue'
import ViewHome from './components/ViewHome.vue'
import ViewCalIntro from './components/ViewCalIntro.vue'
import ViewCalDemo from './components/ViewCalDemo.vue'
import ViewCalBaseline from './components/ViewCalBaseline.vue'
import ViewCalRamp from './components/ViewCalRamp.vue'
import ViewCalConfirm from './components/ViewCalConfirm.vue'
import ViewCalResults from './components/ViewCalResults.vue'
import ViewReaderSetup from './components/ViewReaderSetup.vue'
import ViewReader from './components/ViewReader.vue'
import ViewReaderDone from './components/ViewReaderDone.vue'

// ── Global state ──────────────────────────────────────────────────────────
const currentView = ref('home')
const lang = ref('de')
const t = computed(() => LANG[lang.value])
const profile = ref(null)
const screenHz = ref(60)

const wordParts = ref({ left: '', orp: '', right: '' })
const isPlaying = ref(false)

const calStepInfo = ref(null)
const calData = ref(null)

const readerWords = ref([])
const readerWpm = ref(250)
const readerProgress = ref({ current: 0, total: 0 })
const readerIsPlaying = ref(false)

const toastMsg = ref('')
const toastError = ref(false)
const toastVisible = ref(false)
const updateInfo = ref(null)

// Plain objects (not reactive) — reader uses rAF internally
const reader = new RSVPReader()
let cal = null
let toastTimer = null

// ── Helpers ───────────────────────────────────────────────────────────────
function flash(msg, isError = false) {
  toastMsg.value = msg
  toastError.value = isError
  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastVisible.value = false }, 2500)
}

function stopAndGo(view) {
  reader.stop()
  currentView.value = view
}

function runPassage(passage, wpm) {
  const words = tokenize(passage.text)
  reader.load(words, wpm)
  if (words.length > 0) {
    const [l, o, r] = splitWordForORP(words[0])
    wordParts.value = { left: l, orp: o, right: r }
  }
  isPlaying.value = true
  return new Promise(resolve => {
    reader.onWord = (_, _i, _n, parts) => { wordParts.value = parts }
    reader.onEnd = () => {
      reader.onWord = null
      reader.onEnd = null
      isPlaying.value = false
      resolve()
    }
    reader.start()
  })
}

// ── Profile ───────────────────────────────────────────────────────────────
function setLang(newLang) {
  if (!LANG[newLang]) return
  lang.value = newLang
  if (cal) cal.setLang(newLang)
}

function applyProfile(p) {
  profile.value = p
  if (p.lang && LANG[p.lang]) setLang(p.lang)
  readerWpm.value = p.recommendedWpm ?? 250
  reader.punctuationDelays = p.preferences?.punctuationDelays !== false
}

function handleImportProfile(file) {
  importProfile(file)
    .then(p => {
      applyProfile(p)
      saveToStorage(p)
      flash(t.value.profileImportOk)
    })
    .catch(() => flash(t.value.profileImportErr, true))
}

function handleDownloadProfile() {
  if (profile.value) downloadProfile(profile.value)
}

// ── Calibration flow ──────────────────────────────────────────────────────
function startCalibration() {
  cal = new CalibrationController(lang.value)
  currentView.value = 'cal-intro'
}

async function runDemo() {
  currentView.value = 'cal-demo'
  const info = cal.startDemo()
  await runPassage(info.passage, info.wpm)
}

async function handleDemoNext() {
  reader.stop()
  await runBaselineStep(cal.startBaseline())
}

async function runBaselineStep(info) {
  if (info.done) {
    await runRampStep(cal.startRamp())
    return
  }
  calStepInfo.value = { stageIndex: info.stageIndex, totalStages: info.totalStages, wpm: info.wpm }
  currentView.value = 'cal-baseline'
  await runPassage(info.passage, info.wpm)
}

async function handleBaselineRecall(text) {
  reader.stop()
  await runBaselineStep(cal.submitBaselineRecall(text))
}

async function runRampStep(info) {
  if (info.done) {
    await runConfirmStep(cal.startConfirm(), false)
    return
  }
  calStepInfo.value = { wpm: info.wpm, isRetry: false }
  currentView.value = 'cal-ramp'
  await runPassage(info.passage, info.wpm)
}

async function handleRampRecall(text) {
  reader.stop()
  await runRampStep(cal.submitRampRecall(text))
}

async function runConfirmStep(info, isRetry) {
  calStepInfo.value = { wpm: info.wpm, isRetry }
  currentView.value = 'cal-confirm'
  await runPassage(info.passage, info.wpm)
}

async function handleConfirmRecall(text) {
  reader.stop()
  const result = cal.submitConfirmRecall(text)
  if (result.retry) {
    await runConfirmStep(result, true)
  } else if (result.done) {
    calData.value = result
    currentView.value = 'cal-results'
  }
}

function handleSaveProfile() {
  if (!calData.value) return
  const p = createProfile({ ...calData.value, lang: lang.value, screenHz: screenHz.value })
  profile.value = p
  saveToStorage(p)
  downloadProfile(p)
}

function handleGoRead() {
  if (calData.value) {
    const p = createProfile({ ...calData.value, lang: lang.value, screenHz: screenHz.value })
    applyProfile(p)
    saveToStorage(p)
  }
  goToReaderSetup()
}

// ── Reader flow ───────────────────────────────────────────────────────────
function goToReaderSetup() {
  currentView.value = 'reader-setup'
}

function startReading(text, wpm) {
  const words = tokenize(text)
  if (words.length < 10) { flash(t.value.textTooShort, true); return }
  readerWords.value = words
  readerWpm.value = wpm
  launchReader(wpm)
}

function launchReader(wpm) {
  reader.load(readerWords.value, wpm)
  reader.punctuationDelays = true
  currentView.value = 'reader'
  readerWpm.value = wpm
  readerIsPlaying.value = true
  readerProgress.value = { current: 0, total: readerWords.value.length }
  reader.onWord = (_, idx, total, parts) => {
    wordParts.value = parts
    readerProgress.value = { current: idx + 1, total }
  }
  reader.onEnd = () => {
    readerIsPlaying.value = false
    setTimeout(() => { currentView.value = 'reader-done' }, 600)
  }
  reader.start()
}

function handleReaderPausePlay() {
  if (reader.running) {
    reader.pause()
    readerIsPlaying.value = false
  } else {
    reader.resume()
    readerIsPlaying.value = true
  }
}

function handleReaderRewind() {
  reader.jumpBy(-5)
  readerProgress.value = { current: reader.index, total: readerWords.value.length }
}

function handleReaderForward() {
  reader.jumpBy(5)
  readerProgress.value = { current: reader.index, total: readerWords.value.length }
}

function handleReaderRestart() {
  reader.stop()
  launchReader(readerWpm.value)
}

function handleReaderWpmChange(wpm) {
  readerWpm.value = wpm
  reader.setWPM(wpm)
}

function handleReaderBack() {
  reader.stop()
  currentView.value = 'reader-setup'
}

function handleReadAgain() {
  reader.stop()
  launchReader(readerWpm.value)
}

// ── Keyboard shortcuts (reader only) ─────────────────────────────────────
function handleKeydown(e) {
  if (currentView.value !== 'reader') return
  switch (e.code) {
    case 'Space':
      e.preventDefault(); handleReaderPausePlay(); break
    case 'ArrowLeft':
      e.preventDefault(); handleReaderRewind(); break
    case 'ArrowRight':
      e.preventDefault(); handleReaderForward(); break
    case 'ArrowUp': {
      e.preventDefault()
      handleReaderWpmChange(Math.min(1000, readerWpm.value + 25))
      break
    }
    case 'ArrowDown': {
      e.preventDefault()
      handleReaderWpmChange(Math.max(50, readerWpm.value - 25))
      break
    }
    case 'Escape':
      handleReaderBack(); break
  }
}

// ── Update checker ────────────────────────────────────────────────────────
const GITHUB_REPO = 'elias02345/SpeedReader'
const GITHUB_BRANCH = 'main'

async function checkForUpdates() {
  try {
    const vRes = await fetch('/version.json', { cache: 'no-store' })
    if (!vRes.ok) return
    const version = await vRes.json()
    if (!version.commit) return
    const gRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/branches/${encodeURIComponent(GITHUB_BRANCH)}`,
      { headers: { Accept: 'application/vnd.github.v3+json' }, cache: 'no-store' }
    )
    if (!gRes.ok) return
    const data = await gRes.json()
    const latestSha = data?.commit?.sha
    if (latestSha && latestSha !== version.commit) {
      updateInfo.value = {
        current: version.commit.slice(0, 8),
        latest: latestSha.slice(0, 8),
        isDE: lang.value === 'de',
      }
    }
  } catch { /* offline – skip */ }
}

// ── Init ──────────────────────────────────────────────────────────────────
onMounted(async () => {
  document.addEventListener('keydown', handleKeydown)
  screenHz.value = await detectRefreshRate()
  const saved = loadFromStorage()
  if (saved) applyProfile(saved)
  setTimeout(checkForUpdates, 2000)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  reader.stop()
  clearTimeout(toastTimer)
})
</script>
