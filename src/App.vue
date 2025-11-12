<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useSpeechRecognition } from './composables/useSpeechRecognition';

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
const fromLanguage = ref('en');
const toLanguage = ref('ja');
const currentTranscription = ref('');
const currentTranslation = ref('');
const isTranslating = ref(false);
const autoSpeak = ref(false);
const theme = ref<'light' | 'dark'>('dark');
const wasListeningBeforeSpeak = ref(false);
let translationTimeout: number | undefined;
const appMode = ref<'translation' | 'transcribeOnly'>('translation'); // New state for app mode
const showSettings = ref(false); // New state for settings menu visibility
const showProfileActions = ref(false); // New state for profile actions visibility
const conversationHistory = ref<{
  transcription: string;
  translation: string;
  fromLanguage: string;
  toLanguage: string;
}[]>([]); // New state for conversation history
const currentTurn = ref<{
  transcription: string;
  translation: string;
  fromLanguage: string;
  toLanguage: string;
}>({ transcription: '', translation: '', fromLanguage: fromLanguage.value, toLanguage: toLanguage.value }); // New state for the current turn

// --- Composables ---
const {
  isSupported,
  isListening,
  transcription,
  isFinal,
  start: startRecognition,
  stop: stopRecognition,
} = useSpeechRecognition(fromLanguage);

// --- Lifecycle & Watchers ---
onMounted(() => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
  if (savedTheme) {
    theme.value = savedTheme;
  } else {
    document.documentElement.className = 'dark';
  }
  loadConversation(); // Load conversation history on mount
});

watch(transcription, (newTranscription) => {
  currentTurn.value.transcription = newTranscription;
  currentTurn.value.fromLanguage = fromLanguage.value; // Update language
});

watch(isFinal, (newIsFinal) => {
  if (newIsFinal) {
    clearTimeout(translationTimeout);
    translationTimeout = setTimeout(() => {
      translate(currentTurn.value.transcription.trim());
    }, 400);
  }
});

watch(theme, (newTheme) => {
  document.documentElement.className = newTheme;
  localStorage.setItem('theme', newTheme);
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
const saveConversation = () => {
  localStorage.setItem('gaijin-helper-conversation-history', JSON.stringify(conversationHistory.value));
  alert('Conversation saved!');
};

const loadConversation = () => {
  const savedHistory = localStorage.getItem('gaijin-helper-conversation-history');
  if (savedHistory) {
    conversationHistory.value = JSON.parse(savedHistory);
    alert('Conversation loaded!');
  }
};

const clearSavedConversation = () => {
  localStorage.removeItem('gaijin-helper-conversation-history');
  conversationHistory.value = []; // Also clear current history in app
  alert('Saved conversation cleared!');
};

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

const swapLanguages = () => {
  [fromLanguage.value, toLanguage.value] = [toLanguage.value, fromLanguage.value];
  currentTurn.value.fromLanguage = fromLanguage.value;
  currentTurn.value.toLanguage = toLanguage.value;
};

const translate = async (text: string) => {
  if (!text || appMode.value === 'transcribeOnly') return;
  isTranslating.value = true;
  currentTurn.value.translation = ''; // Clear current translation while translating

  try {
const LIBRETRANSLATE_API_URL = 'https://translate-api.justnansuri.com';
// ...
    const res = await fetch(`${LIBRETRANSLATE_API_URL}/translate`, {
      method: 'POST',
      body: JSON.stringify({ q: text, source: fromLanguage.value, target: toLanguage.value, format: 'text' }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    const translatedText = data.translatedText;
    
    currentTurn.value.translation = translatedText;
    conversationHistory.value.push({ ...currentTurn.value }); // Add current turn to history
    currentTurn.value = { transcription: '', translation: '', fromLanguage: fromLanguage.value, toLanguage: toLanguage.value }; // Reset current turn
    if (autoSpeak.value) speak(translatedText);

  } catch (error) {
    console.error('Translation error:', error);
    currentTurn.value.translation = 'Error: Could not translate.';
  } finally {
    isTranslating.value = false;
  }
};

const speak = (textToSpeak?: string) => {
  let text = textToSpeak; // Use provided text first

  if (!text) { // If no text was provided to the function
    if (currentTurn.value.translation) {
      text = currentTurn.value.translation;
    } else if (conversationHistory.value.length > 0) {
      // If current translation is empty, try to speak the last translation from history
      text = conversationHistory.value[conversationHistory.value.length - 1].translation;
    }
  }

  if (text) {
    wasListeningBeforeSpeak.value = isListening.value;
    if (isListening.value) {
      stopRecognition();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = toLanguage.value;

    utterance.onend = () => {
      if (wasListeningBeforeSpeak.value) {
        startRecognition();
        wasListeningBeforeSpeak.value = false;
      }
    };

    speechSynthesis.speak(utterance);
  } else {
    console.warn("No text available to speak.");
  }
};

const clearText = () => {
  currentTurn.value = { transcription: '', translation: '', fromLanguage: fromLanguage.value, toLanguage: toLanguage.value };
  conversationHistory.value = []; // Clear history
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
            <p class="translation-text" v-if="appMode === 'translation'">To ({{ turn.toLanguage.toUpperCase() }}): {{ turn.translation }}</p>
          </div>
        </div>
        <!-- Current active turn -->
        <div v-if="currentTurn.transcription || isListening" class="conversation-turn current-active-turn">
          <div class="speaker-icon">
            <AccountCircleOutline :size="24" v-if="currentTurn.transcription || isListening" />
          </div>
          <div class="bubble">
            <p class="transcription-text">From ({{ fromLanguage.toUpperCase() }}): {{ currentTurn.transcription || 'Waiting for you to speak...' }}</p>
            <p class="translation-text" v-if="appMode === 'translation'">
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
      :app-mode="appMode"
      :auto-speak="autoSpeak"
      @update:theme="theme = $event"
      @update:app-mode="appMode = $event"
      @update:auto-speak="autoSpeak = $event"
    />
    <UserModal
      v-model="showProfileActions"
      @save-conversation="saveConversation"
      @load-conversation="loadConversation"
      @clear-saved-conversation="clearSavedConversation"
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
}

.conversation-history {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 1rem; /* Add some padding at the bottom */
}

.conversation-turn {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.speaker-icon {
  flex-shrink: 0;
  color: var(--text-secondary);
  margin-top: 0.25rem; /* Align icon with the top of the bubble */
}

.bubble {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 0.75rem 1rem;
  max-width: 80%;
  word-wrap: break-word;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-primary);
  flex-grow: 1;
}

.bubble p {
  margin: 0;
}

.transcription-text {
  font-weight: 500;
  color: var(--accent-primary);
  margin-bottom: 0.5rem;
}

.translation-text {
  color: var(--text-primary);
  font-style: italic;
}

.current-active-turn {
  margin-top: 1.5rem; /* Space between history and current input */
}

.panel {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px var(--shadow-color);
}

.panel-header {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.panel-content {
  flex-grow: 1;
  font-size: 1.5rem;
  line-height: 1.6;
  color: var(--text-primary);
}

.transcription-panel .panel-content {
  color: var(--accent-primary);
  font-weight: 500;
}

.app-footer {
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

.language-select {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  font-family: var(--font-sans);
  width: 100%;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.select-wrapper::after {
  content: '▼';
  font-size: 0.8rem;
  color: var(--text-secondary);
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.main-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.setting-item.auto-speak-control {
  width: 120px; /* Give it a defined width to control spacing */
}

.setting-item.auto-speak-control > label { /* Target the new outer label */
  display: flex;
  justify-content: space-between; /* Ensure space between label and switch */
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-primary);
  width: 100%; /* Make the label take full width of its parent div */
}

.control-button {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  width: 55px;
  height: 55px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 5px var(--shadow-color);
}
.control-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--shadow-color);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.mic-button {
  background-color: var(--accent-primary);
  color: white;
  border: none;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px -5px var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.mic-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px -5px var(--accent-primary);
}
.mic-button.recording {
  background-color: var(--accent-dark); /* A more vibrant color when recording */
  animation: pulse 1.5s infinite;
}

.copyright {
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
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

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .app-header {
    padding: 0.5rem 1rem;
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
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }

  .app-footer {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }

  .language-controls {
    flex-direction: column;
    gap: 0.75rem;
  }

  .select-wrapper {
    max-width: 100%; /* Allow language selects to take full width */
  }

  .main-controls {
    gap: 0.75rem;
  }

  .control-button {
    width: 48px;
    height: 48px;
    font-size: 1rem;
  }

  .mic-button {
    width: 60px;
    height: 60px;
  }
}
</style>