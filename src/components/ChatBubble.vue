<script setup lang="ts">
defineProps<{
  text: string;
  type: 'transcription' | 'translation';
}>();
</script>

<template>
  <div class="chat-bubble-wrapper" :class="`type-${type}`">
    <div class="chat-bubble">
      {{ text }}
    </div>
  </div>
</template>

<style scoped>
.chat-bubble-wrapper {
  display: flex;
  max-width: 80%;
}

.chat-bubble {
  padding: 0.75rem 1.25rem;
  border-radius: 1.25rem;
  line-height: 1.5;
  font-size: 1rem;
  word-wrap: break-word;
  box-shadow: 0 2px 4px var(--shadow-color);
  transition: all 0.3s ease;
}

/* User's transcription bubble */
.type-transcription {
  align-self: flex-end;
  margin-left: auto;
}
.type-transcription .chat-bubble {
  background-color: var(--bubble-user);
  color: var(--bubble-user-text);
  border-bottom-right-radius: 0.5rem;
}

/* Bot's translation bubble */
.type-translation {
  align-self: flex-start;
}
.type-translation .chat-bubble {
  background-color: var(--bubble-bot);
  color: var(--bubble-bot-text);
  border-bottom-left-radius: 0.5rem;
}
</style>