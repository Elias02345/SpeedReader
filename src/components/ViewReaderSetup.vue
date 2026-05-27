<template>
  <section class="view active">
    <header class="view-header">
      <button class="btn-icon" @click="$emit('back')">←</button>
      <h2>{{ t.readerSetupTitle }}</h2>
      <p class="profile-hint">
        {{ profile ? `${t.profileLoaded} · ${profile.recommendedWpm} ${t.wpm}` : t.noProfile }}
      </p>
    </header>
    <main class="view-main">
      <textarea
        v-model="text"
        class="text-input"
        rows="8"
        :placeholder="t.readerPlaceholder"
      ></textarea>
      <div class="wpm-control">
        <label class="wpm-label">
          <span>{{ t.wpmLabel }}</span>
          <strong>{{ localWpm }}</strong>
        </label>
        <input
          v-model.number="localWpm"
          type="range"
          class="wpm-slider"
          min="50"
          max="1000"
          step="25"
        >
      </div>
      <button class="btn btn-primary" @click="startReading">{{ t.btnStartReading }}</button>
    </main>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  t: { type: Object, required: true },
  profile: { type: Object, default: null },
  initialWpm: { type: Number, default: 250 },
})
const emit = defineEmits(['back', 'start'])

const text = ref('')
const localWpm = ref(props.initialWpm)

watch(() => props.initialWpm, (val) => { localWpm.value = val })

function startReading() {
  emit('start', text.value.trim(), localWpm.value)
}
</script>
