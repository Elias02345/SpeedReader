<template>
  <section class="view active">
    <header class="view-header cal-header">
      <h2>{{ t.baselineTitle }}</h2>
      <div class="cal-meta">
        <span class="step-label">{{ t.step }} {{ stepInfo.stageIndex + 1 }} {{ t.of }} {{ stepInfo.totalStages }}</span>
        <span class="wpm-badge">{{ stepInfo.wpm }} {{ t.wpm }}</span>
      </div>
      <div class="dots-row">
        <span
          v-for="i in stepInfo.totalStages"
          :key="i"
          :class="['dot', i - 1 < stepInfo.stageIndex ? 'done' : i - 1 === stepInfo.stageIndex ? 'active' : '']"
        ></span>
      </div>
    </header>
    <main class="view-main">
      <WordDisplay :word-parts="wordParts" />
      <div v-if="!isPlaying" class="recall-panel">
        <p class="recall-prompt">{{ t.baselineDesc }}</p>
        <textarea
          ref="recallInput"
          v-model="recallText"
          class="recall-textarea"
          rows="3"
          :placeholder="t.recallPlaceholder"
          @keydown="onKeydown"
        ></textarea>
        <button class="btn btn-primary" @click="submit">{{ t.btnSubmitRecall }}</button>
        <p class="hint-tiny">Ctrl + Enter</p>
      </div>
    </main>
  </section>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import WordDisplay from './WordDisplay.vue'

const props = defineProps({
  t: { type: Object, required: true },
  wordParts: { type: Object, required: true },
  isPlaying: { type: Boolean, required: true },
  stepInfo: { type: Object, required: true },
})
const emit = defineEmits(['submit-recall'])

const recallText = ref('')
const recallInput = ref(null)

watch(() => props.isPlaying, (val) => {
  if (!val) {
    recallText.value = ''
    nextTick(() => recallInput.value?.focus())
  }
})

function submit() {
  emit('submit-recall', recallText.value)
  recallText.value = ''
}

function onKeydown(e) {
  if (e.ctrlKey && e.key === 'Enter') submit()
}
</script>
