<template>
  <section class="view active reader-view">
    <div class="reader-topbar">
      <span class="reader-wpm-label">{{ wpm }} {{ t.wpm }}</span>
      <div class="reader-progress-wrap">
        <div class="reader-progress-track">
          <div class="reader-progress-fill" :style="{ width: progressPct + '%' }"></div>
        </div>
        <span class="reader-progress-text">{{ progress.current }} / {{ progress.total }}</span>
      </div>
    </div>

    <main class="reader-stage">
      <div class="word-stage reader-word-stage">
        <div class="word-display reader-word-display">
          <span class="word-left">{{ wordParts.left }}</span>
          <span class="word-orp">{{ wordParts.orp }}</span>
          <span class="word-right">{{ wordParts.right }}</span>
        </div>
        <div class="orp-guide reader-orp-guide"></div>
      </div>
    </main>

    <div class="reader-controls">
      <button class="ctrl-btn" title="Back (Esc)" @click="$emit('back')">←</button>
      <button class="ctrl-btn" title="−5 words (←)" @click="$emit('rewind')">«</button>
      <button class="ctrl-btn ctrl-main" @click="$emit('pause-play')">
        {{ isPlaying ? t.btnPause : t.btnPlay }}
      </button>
      <button class="ctrl-btn" title="+5 words (→)" @click="$emit('forward')">»</button>
      <button class="ctrl-btn" title="Restart" @click="$emit('restart')">↺</button>
      <div class="speed-inline">
        <input
          :value="wpm"
          type="range"
          class="wpm-slider-sm"
          min="50"
          max="1000"
          step="25"
          @input="$emit('wpm-change', +$event.target.value)"
        >
        <span class="wpm-inline-val">{{ wpm }}</span>
      </div>
    </div>
    <p class="key-hint">{{ t.pressSpace }}</p>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  t: { type: Object, required: true },
  wordParts: { type: Object, required: true },
  wpm: { type: Number, required: true },
  progress: { type: Object, required: true },
  isPlaying: { type: Boolean, required: true },
})
defineEmits(['back', 'pause-play', 'rewind', 'forward', 'restart', 'wpm-change'])

const progressPct = computed(() =>
  props.progress.total > 0
    ? (props.progress.current / props.progress.total) * 100
    : 0
)
</script>
