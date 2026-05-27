<template>
  <section class="view active">
    <main class="view-main center">
      <h2 class="done-title">{{ t.done }}</h2>
      <p class="done-msg">{{ t.doneMsg }}</p>
      <div class="btn-stack">
        <button class="btn btn-primary" @click="$emit('read-again')">{{ t.btnReadAgain }}</button>
        <button class="btn btn-ghost" @click="$emit('new-text')">{{ t.btnNewText }}</button>
        <button class="btn btn-ghost" @click="$emit('home')">{{ t.btnHome }}</button>
      </div>
    </main>
  </section>
</template>

<script setup>
defineProps({ t: { type: Object, required: true } })
defineEmits(['read-again', 'new-text', 'home'])
</script>
