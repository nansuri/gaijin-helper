<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import ChatBubble from './components/ChatBubble.vue';
import { useSpeechRecognition } from './composables/useSpeechRecognition';

// --- Types ---
interface Message {
  id: number;
  text: string;
  type: 'transcription' | 'translation';
}

// --- State ---
const fromLanguage = ref('en');
const toLanguage = ref('ja');
const messages = ref<Message[]>([]);
const chatContainer = ref<HTMLElement | null>(null);
const autoSpeak = ref(false);
const theme = ref<'light' | 'dark'>('light');
let messageIdCounter = 0;
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
  // You could load a saved theme from localStorage here
  // const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
  // if (savedTheme) theme.value = savedTheme;
});

watch(transcription, (newTranscription) => {
  if (newTranscription) handleTranscription(newTranscription, isFinal.value);
});

watch(isFinal, (newIsFinal) => {
  if (newIsFinal) {
    clearTimeout(translationTimeout);
    translationTimeout = setTimeout(() => {
      translate(transcription.value.trim());
    }, 500);
  }
});

watch(messages, () => {
  nextTick(() => {
    if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  });
}, { deep: true });

watch(theme, (newTheme) => {
  document.documentElement.className = newTheme;
  // You could save the theme to localStorage here
  // localStorage.setItem('theme', newTheme);
});

// --- Functions ---
const handleTranscription = (text: string, isLast: boolean) => {
  const lastMessage = messages.value[messages.value.length - 1];
  if (lastMessage?.type === 'transcription' && !isLast) {
    lastMessage.text = text;
  } else {
    messages.value.push({ id: messageIdCounter++, text: text, type: 'transcription' });
  }
};

const toggleListening = () => {
  if (!isSupported) {
    alert('Your browser does not support the Web Speech API.');
    return;
  }
  if (isListening.value) {
    stopRecognition();
  } else {
    messages.value = [];
    startRecognition();
  }
};

const swapLanguages = () => {
  [fromLanguage.value, toLanguage.value] = [toLanguage.value, fromLanguage.value];
};

const translate = async (text: string) => {
  if (!text) return;
  const translationMessage: Message = { id: messageIdCounter++, text: '...', type: 'translation' };
  messages.value.push(translationMessage);

  try {
    const res = await fetch('http://localhost:5050/translate', {
      method: 'POST',
      body: JSON.stringify({ q: text, source: fromLanguage.value, target: toLanguage.value, format: 'text' }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    const translatedText = data.translatedText;
    
    const index = messages.value.findIndex(m => m.id === translationMessage.id);
    if (index !== -1) messages.value[index].text = translatedText;

    if (autoSpeak.value) speak(translatedText);

  } catch (error) {
    console.error('Translation error:', error);
    const index = messages.value.findIndex(m => m.id === translationMessage.id);
    if (index !== -1) messages.value[index].text = 'Error: Could not translate.';
  }
};

const speak = (textToSpeak?: string) => {
  let text = textToSpeak;
  if (!text) {
    const lastTranslation = messages.value.filter(m => m.type === 'translation').pop();
    text = lastTranslation?.text;
  }
  if (text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = toLanguage.value;
    speechSynthesis.speak(utterance);
  }
};

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
};
</script>

<template>
  <div id="app-container" :class="theme">
    <header class="app-header">
      <h1 class="app-title">Gaijin Helper</h1>
      <div class="header-controls">
        <div class="control-switch">
          <input id="auto-speak" type="checkbox" v-model="autoSpeak">
          <label for="auto-speak">Auto Speak</label>
        </div>
        <button @click="toggleTheme" class="theme-toggle" title="Toggle Theme">
          <i class="fas" :class="theme === 'light' ? 'fa-moon' : 'fa-sun'"></i>
        </button>
      </div>
    </header>

    <main ref="chatContainer" class="chat-window">
      <ChatBubble v-for="message in messages" :key="message.id" :text="message.text" :type="message.type" />
    </main>

    <footer class="app-footer">
      <div class="language-controls">
        <select class="language-select" v-model="fromLanguage">
          <option value="en">English</option>
          <option value="ja">Japanese</option>
          <option value="id">Indonesian</option>
        </select>
        <button @click="swapLanguages" class="control-button" title="Swap Languages">
          <i class="fas fa-arrows-rotate"></i>
        </button>
        <select class="language-select" v-model="toLanguage">
          <option value="en">English</option>
          <option value="ja">Japanese</option>
          <option value="id">Indonesian</option>
        </select>
      </div>
      <div class="main-controls">
        <button @click="speak()" class="control-button" title="Speak Translation">
          <i class="fas fa-play"></i>
        </button>
        <button @click="toggleListening" class="mic-button" :class="{ 'recording': isListening }" title="Start/Stop Listening">
          <i class="fas fa-microphone-lines"></i>
        </button>
        <button @click="clearText" class="control-button" title="Clear Messages">
          <i class="fas fa-broom"></i>
        </button>
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

.app-title {
  font-size: 1.25rem;
  font-weight: 700;
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
  font-size: 1.25rem;
  cursor: pointer;
  transition: color 0.2s;
}
.theme-toggle:hover {
  color: var(--accent-primary);
}

.chat-window {
  flex-grow: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
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

.language-select {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-family: var(--font-sans);
  flex-grow: 1;
}

.main-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
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
}

.mic-button {
  background-color: var(--accent-primary);
  color: white;
  border: none;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  font-size: 1.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px -5px var(--accent-primary);
  order: 0; /* Keep mic button in the middle if needed, but flexbox gap is better */
}
.mic-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px -5px var(--accent-primary);
}

.mic-button.recording {
  animation: pulse 1.5s infinite;
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
