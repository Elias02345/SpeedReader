<template>
  <div class="update-banner">
    <span class="update-icon">↑</span>
    <span class="update-msg">{{ info.isDE ? 'Update verfügbar' : 'Update available' }}</span>
    <code class="update-cmd">sudo speedreader-update</code>
    <span class="update-sha">{{ info.current }} → {{ info.latest }}</span>
    <button class="update-close" @click="$emit('dismiss')" title="Dismiss">×</button>
  </div>
</template>

<script setup>
defineProps({ info: { type: Object, required: true } })
defineEmits(['dismiss'])
</script>
