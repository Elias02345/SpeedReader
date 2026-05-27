<template>
  <div class="word-stage">
    <div class="word-display" :class="large ? 'reader-word-display' : ''">
      <span class="word-left">{{ wordParts.left }}</span>
      <span class="word-orp">{{ wordParts.orp }}</span>
      <span class="word-right">{{ wordParts.right }}</span>
    </div>
    <div class="orp-guide" :class="large ? 'reader-orp-guide' : ''"></div>
  </div>
</template>

<script setup>
defineProps({
  wordParts: { type: Object, required: true },
  large: { type: Boolean, default: false },
})
</script>
