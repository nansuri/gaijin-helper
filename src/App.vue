<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useSpeechRecognition } from './composables/useSpeechRecognition';

// Import Components
import AppHeader from './components/AppHeader.vue';
import ConversationDisplay from './components/ConversationDisplay.vue';
import ControlsFooter from './components/ControlsFooter.vue';
import SettingsModal from './components/SettingsModal.vue';
import UserModal from './components/UserModal.vue';

// --- State ---
const fromLanguage = ref('en');
const toLanguage = ref('ja');
const isTranslating = ref(false);
const autoSpeak = ref(false);
const isSpeaking = ref(false);
const theme = ref<'light' | 'dark'>('dark');
const wasListeningBeforeSpeak = ref(false);
let translationTimeout: number | undefined;
let pendingTranslation = false; // Track if translation is pending to avoid duplicate triggers
const appMode = ref<'translation' | 'transcribeOnly'>('translation');
const showSettings = ref(false);
const showProfileActions = ref(false);
const conversationHistory = ref<{
  transcription: string;
  translation: string;
  fromLanguage: string;
  toLanguage: string;
}[]>([]);
const currentTurn = ref<{
  transcription: string;
  translation: string;
  fromLanguage: string;
  toLanguage: string;
}>({ transcription: '', translation: '', fromLanguage: fromLanguage.value, toLanguage: toLanguage.value });

// --- Composables ---
const {
  isSupported,
  isListening,
  transcription,
  isFinal,
  finalCount,
  start: startRecognition,
  stop: stopRecognition,
} = useSpeechRecognition(fromLanguage);

// --- Lifecycle & Watchers ---
onMounted(() => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
  if (savedTheme) {
    theme.value = savedTheme;
    document.documentElement.className = savedTheme;
  } else {
    theme.value = 'dark';
    document.documentElement.className = 'dark';
  }
  loadConversation();
});

onUnmounted(() => {
  clearTimeout(translationTimeout);
  stopRecognition();
});

watch(transcription, (newTranscription) => {
  currentTurn.value.transcription = newTranscription;
  currentTurn.value.fromLanguage = fromLanguage.value; // Update language
});

watch(finalCount, (newCount) => {
  if (newCount > 0 && !pendingTranslation && currentTurn.value.transcription.trim()) {
    pendingTranslation = true;
    clearTimeout(translationTimeout);
    // Increased timeout to 2 seconds to allow user to continue speaking after a pause
    // This prevents premature translation when user pauses mid-sentence
    translationTimeout = setTimeout(() => {
      translate(currentTurn.value.transcription.trim());
    }, 2000);
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
      // Add a small delay to ensure recognition is fully stopped before restarting
      setTimeout(() => {
        startRecognition();
      }, 100);
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
    try {
      conversationHistory.value = JSON.parse(savedHistory);
      alert('Conversation loaded!');
    } catch (error) {
      console.error('Failed to parse saved conversation:', error);
      alert('Error loading conversation. Data may be corrupted.');
      localStorage.removeItem('gaijin-helper-conversation-history');
    }
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
    pendingTranslation = false; // Reset pending flag when starting new recognition
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
  currentTurn.value.translation = '';

  try {
    const LIBRETRANSLATE_API_URL = import.meta.env.VITE_LIBRETRANSLATE_API_URL || 'https://translate-api.justnansuri.com';
    const res = await fetch(`${LIBRETRANSLATE_API_URL}/translate`, {
      method: 'POST',
      body: JSON.stringify({ q: text, source: fromLanguage.value, target: toLanguage.value, format: 'text' }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    const translatedText = data.translatedText;
    
    currentTurn.value.translation = translatedText;
    conversationHistory.value.push({ ...currentTurn.value });
    currentTurn.value = { transcription: '', translation: '', fromLanguage: fromLanguage.value, toLanguage: toLanguage.value };
    pendingTranslation = false; // Reset flag after translation
    
    if (autoSpeak.value) {
      speak(translatedText);
    } else {
      if (isSupported && !isListening.value) {
        startRecognition();
      }
    }

  } catch (error) {
    console.error('Translation error:', error);
    currentTurn.value.translation = 'Error: Could not translate.';
    pendingTranslation = false; // Reset flag on error too
    if (isSupported && !isListening.value) {
      startRecognition();
    }
  } finally {
    isTranslating.value = false;
  }
};

const speak = (textToSpeak?: string) => {
  // If currently speaking, stop the speech
  if (isSpeaking.value) {
    speechSynthesis.cancel();
    isSpeaking.value = false;
    return;
  }

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

    utterance.onstart = () => {
      isSpeaking.value = true;
    };

    utterance.onend = () => {
      isSpeaking.value = false;
      if (wasListeningBeforeSpeak.value && isSupported) {
        startRecognition();
        wasListeningBeforeSpeak.value = false;
      }
    };

    utterance.onerror = () => {
      isSpeaking.value = false;
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
  <div id="app" :class="theme">
    <AppHeader
      @settings-click="showSettings = true"
      @profile-click="showProfileActions = true"
    />

    <ConversationDisplay
      :history="conversationHistory"
      :current-turn="currentTurn"
      :is-listening="isListening"
      :is-translating="isTranslating"
      :app-mode="appMode"
    />

    <ControlsFooter
      :from-language="fromLanguage"
      :to-language="toLanguage"
      :is-listening="isListening"
      :is-speaking="isSpeaking"
      @swap-languages="swapLanguages"
      @speak-click="speak()"
      @mic-click="toggleListening"
      @clear-click="clearText"
      @language-from="(lang) => (fromLanguage = lang)"
      @language-to="(lang) => (toLanguage = lang)"
    />

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
#app {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s, color 0.3s;
}
</style>