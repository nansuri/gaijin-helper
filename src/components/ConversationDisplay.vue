<script setup lang="ts">
import { defineProps } from 'vue';
import AccountCircleOutline from 'vue-material-design-icons/AccountCircleOutline.vue';
import type { ConversationTurn } from '@/types';

defineProps<{
  history: ConversationTurn[];
  currentTurn: ConversationTurn;
  isListening: boolean;
  isTranslating: boolean;
  appMode: 'translation' | 'transcribeOnly';
}>();
</script>

<template>
  <main class="conversation-display">
    <div class="conversation-container">
      <div class="conversation-history">
        <div v-for="(turn, index) in history" :key="index" class="conversation-turn">
          <div class="conversation-turn__speaker-icon">
            <AccountCircleOutline :size="24" />
          </div>
          <div class="conversation-turn__bubble">
            <p class="conversation-turn__text conversation-turn__text--from">
              <strong>{{ turn.fromLanguage.toUpperCase() }}:</strong> {{ turn.transcription }}
            </p>
            <p v-if="appMode === 'translation'" class="conversation-turn__text conversation-turn__text--to">
              <strong>{{ turn.toLanguage.toUpperCase() }}:</strong> {{ turn.translation }}
            </p>
          </div>
        </div>

        <!-- Current active turn -->
        <div v-if="currentTurn.transcription || isListening" class="conversation-turn conversation-turn--active">
          <div class="conversation-turn__speaker-icon">
            <AccountCircleOutline :size="24" />
          </div>
          <div class="conversation-turn__bubble">
            <p class="conversation-turn__text conversation-turn__text--from">
              <strong>{{ currentTurn.fromLanguage.toUpperCase() }}:</strong>
              {{ currentTurn.transcription || (isListening ? 'Listening...' : 'Waiting...') }}
            </p>
            <p v-if="appMode === 'translation'" class="conversation-turn__text conversation-turn__text--to">
              <strong>{{ currentTurn.toLanguage.toUpperCase() }}:</strong>
              <span v-if="isTranslating" class="spinner"></span>
              <span v-else>{{ currentTurn.translation || 'Translation will appear here...' }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.conversation-display {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1.5rem;
  overflow-y: auto;
}

.conversation-container {
  width: 100%;
  max-width: 900px;
}

.conversation-history {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.conversation-turn {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  animation: slide-up 0.3s ease-in;
}

.conversation-turn--active {
  margin-top: 1.5rem;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background-color: rgba(13, 110, 253, 0.05);
}

.conversation-turn__speaker-icon {
  flex-shrink: 0;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.conversation-turn__bubble {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 0.75rem 1rem;
  max-width: 80%;
  word-wrap: break-word;
  flex-grow: 1;
}

.conversation-turn__text {
  margin: 0;
  line-height: 1.5;
  color: var(--text-primary);
  font-size: 1rem;
}

.conversation-turn__text--from {
  color: var(--accent-primary);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.conversation-turn__text--to {
  color: var(--text-primary);
  font-style: italic;
  font-weight: 500;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-color);
  border-bottom-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@media (max-width: 600px) {
  .conversation-display {
    padding: 0.5rem;
  }

  .conversation-turn__bubble {
    max-width: 100%;
    padding: 0.5rem 0.75rem;
  }

  .conversation-turn__text {
    font-size: 0.9rem;
  }

  .conversation-turn--active {
    padding: 0.5rem;
    margin-top: 1rem;
  }
}
</style>
