<script setup lang="ts">
defineProps<{
  text: string;
  type: 'transcription' | 'translation';
}>();
</script>

<template>
  <div class="chat-bubble" :class="type">
    {{ text }}
  </div>
</template>

<style scoped>
.chat-bubble {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 20px;
  margin-bottom: 10px;
  word-wrap: break-word;
}

.chat-bubble.transcription {
  background-color: #0d6efd;
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 5px;
}

.chat-bubble.translation {
  background-color: #f0f0f0;
  color: #212529;
  align-self: flex-start;
  border-bottom-left-radius: 5px;
}
</style>
