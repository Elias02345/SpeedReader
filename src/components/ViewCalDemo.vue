<template>
  <section class="view active">
    <header class="view-header">
      <h2>{{ t.demoTitle }}</h2>
    </header>
    <main class="view-main">
      <p class="hint-text" v-html="t.demoDesc"></p>
      <WordDisplay :word-parts="wordParts" />
      <button v-if="!isPlaying" class="btn btn-primary" @click="$emit('next')">
        {{ t.btnDemoNext }}
      </button>
    </main>
  </section>
</template>

<script setup>
import WordDisplay from './WordDisplay.vue'

defineProps({
  t: { type: Object, required: true },
  wordParts: { type: Object, required: true },
  isPlaying: { type: Boolean, required: true },
})
defineEmits(['next'])
</script>
