<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useConversation } from './composables/useConversation';
import { useLanguages } from './composables/useLanguages';
import { useTheme } from './composables/useTheme';
import { useTranslationFlow } from './composables/useTranslationFlow';
import { useModals } from './composables/useModals'; // Import the new composable

// Import SVG Icons
import Translate from 'vue-material-design-icons/Translate.vue';
import SwapHorizontal from 'vue-material-design-icons/SwapHorizontal.vue';
import Play from 'vue-material-design-icons/Play.vue';
import Microphone from 'vue-material-design-icons/Microphone.vue';
import TrashCanOutline from 'vue-material-design-icons/TrashCanOutline.vue';
import WeatherNight from 'vue-material-design-icons/WeatherNight.vue';
import WhiteBalanceSunny from 'vue-material-design-icons/WhiteBalanceSunny.vue';
import AccountOutline from 'vue-material-design-icons/AccountOutline.vue';
import AccountCircleOutline from 'vue-material-design-icons/AccountCircleOutline.vue';
import RobotOutline from 'vue-material-design-icons/RobotOutline.vue';
import CogOutline from 'vue-material-design-icons/CogOutline.vue'; // New icon for settings
import SettingsModal from './components/SettingsModal.vue'; // Import the new SettingsModal component

// --- State ---
const appMode = ref<'translation' | 'transcribeOnly'>('translation'); // New state for app mode

// --- Composables ---
const { fromLanguage, toLanguage, swapLanguages } = useLanguages();

const {
  conversationHistory,
  currentTurn,
  saveConversation,
  loadConversation,
  clearSavedConversation,
  clearText,
} = useConversation(fromLanguage, toLanguage);

const { theme } = useTheme();

const {
  currentTranscription,
  currentTranslation,
  isTranslating,
  autoSpeak,
  isSupported,
  isListening,
  startRecognition,
  stopRecognition,
  translate,
  speak,
  appMode: translationFlowAppMode, // Rename to avoid conflict
} = useTranslationFlow(fromLanguage, toLanguage, conversationHistory, currentTurn, clearText);

const { showSettings, showProfileActions } = useModals(); // Use the new composable

// --- Lifecycle & Watchers ---
onMounted(() => {
  loadConversation(); // Load conversation history on mount
});

watch(fromLanguage, (newLang, oldLang) => {
  if (newLang !== oldLang) {
    if (isListening.value) {
      stopRecognition();
      // A small delay might be needed before restarting, but often not.
      // The useSpeechRecognition composable should handle re-initializing with the new language.
      startRecognition();
    }
    // Clear current turn and history to avoid displaying old language data
    clearText();
  }
});

// --- Functions ---
const toggleListening = () => {
  if (!isSupported) {
    alert('Your browser does not support the Web Speech API.');
    return;
  }
  if (isListening.value) {
    stopRecognition();
  } else {
    clearText();
    startRecognition();
  }
};
</script>

<template>
  <div id="app-container" :class="theme">
    <header class="app-header">
      <div class="title-group">
        <Translate :size="32" class="title-icon" />
        <div>
          <h1 class="app-title">Gaijin Helper</h1>
          <p class="app-description">Real-time Conversation Translator</p>
        </div>
      </div>
              <div class="header-controls">
                <button @click="showSettings = !showSettings" class="control-button settings-button" title="Settings">
                  <CogOutline :size="24" />
                </button>
                <button @click="showProfileActions = !showProfileActions" class="control-button profile-button" title="Profile">
                  <AccountOutline :size="24" />
                </button>
              </div>    </header>

    <main class="translation-window">
      <div class="conversation-history">
        <div v-for="(turn, index) in conversationHistory" :key="index" class="conversation-turn">
          <div class="speaker-icon">
            <AccountCircleOutline :size="24" v-if="turn.transcription" />
          </div>
          <div class="bubble">
            <p class="transcription-text">From ({{ turn.fromLanguage.toUpperCase() }}): {{ turn.transcription }}</p>
            <p class="translation-text" v-if="translationFlowAppMode === 'translation'">To ({{ turn.toLanguage.toUpperCase() }}): {{ turn.translation }}</p>
          </div>
        </div>
        <!-- Current active turn -->
        <div v-if="currentTurn.transcription || isListening" class="conversation-turn current-active-turn">
          <div class="speaker-icon">
            <AccountCircleOutline :size="24" v-if="currentTurn.transcription || isListening" />
          </div>
          <div class="bubble">
            <p class="transcription-text">From ({{ fromLanguage.toUpperCase() }}): {{ currentTurn.transcription || 'Waiting for you to speak...' }}</p>
            <p class="translation-text" v-if="translationFlowAppMode === 'translation'">
              <span v-if="isTranslating" class="spinner"></span>
              <span v-else>To ({{ toLanguage.toUpperCase() }}): {{ currentTurn.translation || 'Translation will appear here.' }}</span>
            </p>
          </div>
        </div>
      </div>
    </main>

    <footer class="app-footer">
      <div class="language-controls">
        <div class="select-wrapper">
          <select class="language-select" v-model="fromLanguage">
            <option value="en">English</option>
            <option value="ja">Japanese</option>
            <option value="id">Indonesian</option>
          </select>
        </div>
        <button @click="swapLanguages" class="control-button" title="Swap Languages">
          <SwapHorizontal />
        </button>
        <div class="select-wrapper">
          <select class="language-select" v-model="toLanguage">
            <option value="en">English</option>
            <option value="ja">Japanese</option>
            <option value="id">Indonesian</option>
          </select>
        </div>
      </div>
      <div class="main-controls">
        <button @click="speak()" class="control-button" title="Speak Translation">
          <Play />
        </button>

        <button @click="toggleListening" class="mic-button" :class="{ 'recording': isListening }" title="Start/Stop Listening">
          <Microphone :size="36" />
        </button>
        <button @click="clearText" class="control-button" title="Clear Messages">
          <TrashCanOutline />
        </button>
      </div>
      <div class="copyright">
        Copyright &copy; Nansuri 2025
      </div>
    </footer>
    <SettingsModal
      v-model="showSettings"
      :theme="theme"
      :app-mode="translationFlowAppMode"
      :auto-speak="autoSpeak"
      @update:theme="theme = $event"
      @update:app-mode="translationFlowAppMode = $event"
      @update:auto-speak="autoSpeak = $event"
    />
    <UserModal
      v-model="showProfileActions"
      :save-conversation="saveConversation"
      :load-conversation="loadConversation"
      :clear-saved-conversation="clearSavedConversation"
    />
  </div>
</template>

<style scoped>
#app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s, color 0.3s;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-icon {
  color: var(--accent-primary);
}

.app-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.app-description {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* Adjusted gap for the two new buttons */
}

.control-switch input {
  accent-color: var(--accent-primary);
}

.theme-toggle {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: transform 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.theme-toggle:hover {
  color: var(--accent-primary);
  transform: scale(1.1);
}

.translation-window {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Align items to the start to push bubbles up */
  padding: 1.5rem;
  overflow-y: auto;
  min-height: 0; /* Add this to prevent overflow on mobile */
}

/* ... existing styles ... */

@media (max-width: 768px) {
  .app-header {
    padding: 0.75rem 1rem;
  }

  .app-title {
    font-size: 1.1rem;
  }

  .app-description {
    font-size: 0.75rem;
  }

  .header-controls {
    gap: 0.5rem;
  }

  .translation-window {
    padding: 1rem;
  }

  .conversation-history {
    gap: 0.75rem;
  }

  .bubble {
    max-width: 90%;
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }

  .app-footer {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .language-controls {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .select-wrapper {
    max-width: none; /* Allow full width on small screens */
    flex-grow: 1;
  }

  .main-controls {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .control-button {
    width: 50px;
    height: 50px;
    font-size: 1rem;
  }

  .mic-button {
    width: 60px;
    height: 60px;
  }
}

.spinner {
  width: 24px;
  height: 24px;
  margin: 0 0.5rem;
  border: 3px solid var(--border-color);
  border-bottom-color: var(--accent-primary);
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(255, 82, 82, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0);
  }
}
</style>