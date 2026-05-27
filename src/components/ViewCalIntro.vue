<template>
  <section class="view active">
    <header class="view-header">
      <button class="btn-icon" @click="$emit('back')">←</button>
      <h2>{{ t.calIntroTitle }}</h2>
    </header>
    <main class="view-main center">
      <div class="prose" v-html="t.calIntroBody"></div>
      <button class="btn btn-primary" @click="$emit('start')">{{ t.btnStartCal }}</button>
    </main>
  </section>
</template>

<script setup>
defineProps({ t: { type: Object, required: true } })
defineEmits(['back', 'start'])
</script>
