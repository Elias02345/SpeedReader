<template>
  <section class="view active">
    <header class="view-header">
      <h2>{{ t.confirmTitle }}</h2>
      <span class="wpm-badge">{{ wpm }} {{ t.wpm }}</span>
    </header>
    <main class="view-main">
      <p class="hint-text">{{ isRetry ? t.confirmAttempt2 + ' ' : '' }}{{ t.confirmDesc }}</p>
      <WordDisplay :word-parts="wordParts" />
      <div v-if="!isPlaying" class="recall-panel">
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
  wpm: { type: Number, required: true },
  isRetry: { type: Boolean, default: false },
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
