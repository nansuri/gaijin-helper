<script setup lang="ts">
defineProps<{
  text: string;
  type: 'transcription' | 'translation';
}>();
</script>

<template>
  <div class="chat-bubble-wrapper" :class="`type-${type}`">
    <div class="speaker-icon">
      <i class="fas" :class="type === 'transcription' ? 'fa-user' : 'fa-robot'"></i>
    </div>
    <div class="chat-bubble">
      {{ text }}
    </div>
  </div>
</template>

<style scoped>
.chat-bubble-wrapper {
  display: flex;
  max-width: 75%;
  align-items: flex-end;
  gap: 0.75rem;
}

.speaker-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  box-shadow: 0 2px 4px var(--shadow-color);
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
.type-transcription .speaker-icon {
  background-color: var(--accent-primary);
  color: var(--bubble-user-text);
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
