<template>
  <section class="view active">
    <header class="view-header">
      <h2>{{ t.resultsTitle }}</h2>
    </header>
    <main class="view-main center">
      <div class="results-stats">
        <div class="stat-row">
          <span class="stat-label">{{ t.resultsBaseline }}</span>
          <span class="stat-value">{{ calData.baselineWpm }} {{ t.wpm }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">{{ t.resultsMax }}</span>
          <span class="stat-value">{{ calData.maxWpm }} {{ t.wpm }}</span>
        </div>
        <div class="stat-row highlight">
          <span class="stat-label">{{ t.resultsRecommended }}</span>
          <span class="stat-value accent">{{ calData.recommendedWpm }} {{ t.wpm }}</span>
        </div>
      </div>

      <div class="results-chart">
        <div v-for="bar in bars" :key="bar.cls" class="chart-row">
          <span class="chart-label">{{ bar.label }}</span>
          <div class="chart-bar-wrap">
            <div class="chart-bar" :class="bar.cls" :style="{ width: bar.pct + '%' }"></div>
          </div>
          <span class="chart-val">{{ bar.value }} {{ t.wpm }}</span>
        </div>
      </div>

      <div class="btn-stack">
        <button class="btn btn-primary" @click="$emit('save-profile')">{{ t.btnSaveProfile }}</button>
        <button class="btn btn-ghost" @click="$emit('go-read')">{{ t.btnGoRead }}</button>
      </div>
    </main>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  t: { type: Object, required: true },
  calData: { type: Object, required: true },
})
defineEmits(['save-profile', 'go-read'])

const bars = computed(() => {
  const maxVal = Math.max(props.calData.maxWpm, 400, props.calData.recommendedWpm)
  return [
    { label: props.t.resultsBaseline, value: props.calData.baselineWpm, cls: 'bar-baseline', pct: Math.round(props.calData.baselineWpm / maxVal * 100) },
    { label: props.t.resultsMax,      value: props.calData.maxWpm,      cls: 'bar-max',      pct: Math.round(props.calData.maxWpm      / maxVal * 100) },
    { label: props.t.resultsRecommended, value: props.calData.recommendedWpm, cls: 'bar-rec', pct: Math.round(props.calData.recommendedWpm / maxVal * 100) },
  ]
})
</script>
