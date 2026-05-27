<template>
  <section class="view active">
    <header class="lang-bar">
      <div class="lang-switcher">
        <button :class="['lang-btn', lang === 'de' ? 'active' : '']" @click="$emit('lang-change', 'de')">DE</button>
        <button :class="['lang-btn', lang === 'en' ? 'active' : '']" @click="$emit('lang-change', 'en')">EN</button>
      </div>
    </header>
    <main class="view-main center">
      <div class="logo-block">
        <h1 class="app-title">SpeedReader</h1>
        <p class="app-tagline">{{ t.tagline }}</p>
      </div>

      <div v-if="profile" class="profile-card">
        <div class="profile-dot"></div>
        <div>
          <p class="profile-rec-label">{{ t.recommendedWpm }}</p>
          <p class="profile-wpm-val">{{ profile.recommendedWpm }} {{ t.wpm }}</p>
        </div>
      </div>

      <div class="btn-stack">
        <button class="btn btn-primary" @click="$emit('calibrate')">{{ t.btnCalibrate }}</button>
        <button class="btn btn-primary" @click="$emit('read')">{{ t.btnRead }}</button>
        <button class="btn btn-ghost" @click="triggerImport">{{ t.btnImportProfile }}</button>
        <button v-if="profile" class="btn btn-ghost" @click="$emit('download-profile')">{{ t.btnDownloadProfile }}</button>
      </div>
    </main>
    <input ref="fileInput" type="file" accept=".json" class="sr-only" @change="onFileChange">
  </section>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  t: { type: Object, required: true },
  lang: { type: String, required: true },
  profile: { type: Object, default: null },
})
const emit = defineEmits(['calibrate', 'read', 'import-profile', 'download-profile', 'lang-change'])

const fileInput = ref(null)

function triggerImport() {
  fileInput.value?.click()
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) emit('import-profile', file)
  e.target.value = ''
}
</script>
