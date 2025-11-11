<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useSpeechRecognition } from './composables/useSpeechRecognition';

// Import SVG Icons
import Translate from 'vue-material-design-icons/Translate.vue';
import SwapHorizontal from 'vue-material-design-icons/SwapHorizontal.vue';
import Play from 'vue-material-design-icons/Play.vue';
import Microphone from 'vue-material-design-icons/Microphone.vue';
import TrashCanOutline from 'vue-material-design-icons/TrashCanOutline.vue';
import WeatherNight from 'vue-material-design-icons/WeatherNight.vue';
import WhiteBalanceSunny from 'vue-material-design-icons/WhiteBalanceSunny.vue';

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
});

watch(transcription, (newTranscription) => {
  currentTranscription.value = newTranscription;
});

watch(isFinal, (newIsFinal) => {
  if (newIsFinal) {
    clearTimeout(translationTimeout);
    translationTimeout = setTimeout(() => {
      translate(transcription.value.trim());
    }, 400);
  }
});

watch(theme, (newTheme) => {
  document.documentElement.className = newTheme;
  localStorage.setItem('theme', newTheme);
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

const swapLanguages = () => {
  [fromLanguage.value, toLanguage.value] = [toLanguage.value, fromLanguage.value];
};

const translate = async (text: string) => {
  if (!text) return;
  isTranslating.value = true;
  currentTranslation.value = '';

  try {
const LIBRETRANSLATE_API_URL = import.meta.env.VITE_LIBRETRANSLATE_API_URL || 'http://localhost:5050';
// ...
    const res = await fetch(`${LIBRETRANSLATE_API_URL}/translate`, {
      method: 'POST',
      body: JSON.stringify({ q: text, source: fromLanguage.value, target: toLanguage.value, format: 'text' }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    const translatedText = data.translatedText;
    
    currentTranslation.value = translatedText;
    if (autoSpeak.value) speak(translatedText);

  } catch (error) {
    console.error('Translation error:', error);
    currentTranslation.value = 'Error: Could not translate.';
  } finally {
    isTranslating.value = false;
  }
};

const speak = (textToSpeak?: string) => {
  let text = textToSpeak || currentTranslation.value;
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
  }
};

const clearText = () => {
  currentTranscription.value = '';
  currentTranslation.value = '';
};

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
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
        <div class="control-switch">
          <input id="auto-speak" type="checkbox" v-model="autoSpeak">
          <label for="auto-speak">Auto Speak</label>
        </div>
        <button @click="toggleTheme" class="theme-toggle" title="Toggle Theme">
          <WeatherNight v-if="theme === 'light'" :size="24" />
          <WhiteBalanceSunny v-else :size="24" />
        </button>
      </div>
    </header>

    <main class="translation-window">
      <div class="translation-card">
        <div class="panel transcription-panel">
          <div class="panel-header">From: {{ fromLanguage.toUpperCase() }}</div>
          <div class="panel-content">{{ currentTranscription || 'Waiting for you to speak...' }}</div>
        </div>
        <div class="panel translation-panel">
          <div class="panel-header">To: {{ toLanguage.toUpperCase() }}</div>
          <div class="panel-content">
            <span v-if="isTranslating" class="spinner"></span>
            <span v-else>{{ currentTranslation || 'Translation will appear here.' }}</span>
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
  gap: 1.5rem;
}

.control-switch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
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
  align-items: center;
  padding: 1.5rem;
  overflow-y: auto;
}

.translation-card {
  width: 100%;
  max-width: 900px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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