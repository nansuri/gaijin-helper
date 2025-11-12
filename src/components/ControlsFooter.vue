<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import SwapHorizontal from 'vue-material-design-icons/SwapHorizontal.vue';
import Play from 'vue-material-design-icons/Play.vue';
import Microphone from 'vue-material-design-icons/Microphone.vue';
import TrashCanOutline from 'vue-material-design-icons/TrashCanOutline.vue';

defineProps<{
  fromLanguage: string;
  toLanguage: string;
  isListening: boolean;
  isSpeaking: boolean;
}>();

const emit = defineEmits<{
  (e: 'swap-languages'): void;
  (e: 'speak-click'): void;
  (e: 'mic-click'): void;
  (e: 'clear-click'): void;
  (e: 'language-from', value: string): void;
  (e: 'language-to', value: string): void;
}>();
</script>

<template>
  <footer class="controls-footer">
    <div class="language-controls">
      <div class="select-wrapper">
        <select
          :value="fromLanguage"
          @input="$emit('language-from', ($event.target as HTMLSelectElement).value)"
          class="language-select"
          aria-label="Source Language"
        >
          <option value="en">English</option>
          <option value="ja">Japanese</option>
          <option value="id">Indonesian</option>
        </select>
      </div>
      <button
        @click="$emit('swap-languages')"
        class="btn btn--icon"
        title="Swap Languages"
        aria-label="Swap Languages"
      >
        <SwapHorizontal />
      </button>
      <div class="select-wrapper">
        <select
          :value="toLanguage"
          @input="$emit('language-to', ($event.target as HTMLSelectElement).value)"
          class="language-select"
          aria-label="Target Language"
        >
          <option value="en">English</option>
          <option value="ja">Japanese</option>
          <option value="id">Indonesian</option>
        </select>
      </div>
    </div>

    <div class="main-controls">
      <button
        @click="$emit('speak-click')"
        class="btn btn--icon"
        :class="{ 'btn--speaking': isSpeaking }"
        title="Speak / Stop"
        aria-label="Speak Translation or Stop"
      >
        <Play />
      </button>
      <button
        @click="$emit('mic-click')"
        class="btn btn--lg"
        :class="{ 'btn--recording': isListening }"
        title="Start/Stop Listening"
        aria-label="Toggle Microphone"
      >
        <Microphone :size="36" />
      </button>
      <button
        @click="$emit('clear-click')"
        class="btn btn--icon"
        title="Clear Messages"
        aria-label="Clear All Messages"
      >
        <TrashCanOutline />
      </button>
    </div>

    <div class="copyright">
      Copyright &copy; Nansuri 2025
    </div>
  </footer>
</template>

<style scoped>
.controls-footer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  box-shadow: 0 -2px 10px var(--shadow-color);
  flex-shrink: 0;
}

.language-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.select-wrapper {
  position: relative;
  flex-grow: 1;
  max-width: 300px;
}

.main-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.btn--recording {
  background-color: #dc3545;
  color: white;
  border-color: #dc3545;
  animation: pulse 1.5s infinite;
}

.btn--speaking {
  background-color: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
  animation: pulse 1.5s infinite;
}

.copyright {
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

@media (max-width: 600px) {
  .controls-footer {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }

  .language-controls {
    gap: 0.75rem;
  }

  .select-wrapper {
    max-width: none;
  }

  .main-controls {
    gap: 0.75rem;
  }

  .copyright {
    font-size: 0.7rem;
    margin-top: 0.25rem;
  }
}
</style>
