<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
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

// --- Watchers ---
watch(transcription, (newTranscription) => {
  if (newTranscription) {
    handleTranscription(newTranscription, isFinal.value);
  }
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
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
}, { deep: true });


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
    alert('Your browser does not support the Web Speech API. Please use Google Chrome.');
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
  const temp = fromLanguage.value;
  fromLanguage.value = toLanguage.value;
  toLanguage.value = temp;
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

    if (autoSpeak.value) {
      speak(translatedText);
    }

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

const clearText = () => {
  messages.value = [];
};

</script>

<template>
  <div class="container-fluid d-flex flex-column vh-100 p-0">
    <header class="bg-primary text-white p-3 d-flex justify-content-between align-items-center shadow-sm">
      <h1 class="h5 mb-0">Real-time Conversation Translator</h1>
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" role="switch" id="auto-speak" v-model="autoSpeak">
        <label class="form-check-label" for="auto-speak">Auto Speak</label>
      </div>
    </header>

    <main ref="chatContainer" class="flex-grow-1 p-3 d-flex flex-column">
      <ChatBubble v-for="message in messages" :key="message.id" :text="message.text" :type="message.type" />
    </main>

    <div class="language-selector-bar bg-light p-2 border-top border-bottom">
        <div class="row g-2 align-items-center">
            <div class="col">
                <select id="from-language" class="form-select" v-model="fromLanguage">
                    <option value="en">English</option>
                    <option value="ja">Japanese</option>
                    <option value="id">Indonesian</option>
                </select>
            </div>
            <div class="col-auto">
                <button class="btn btn-secondary" @click="swapLanguages" title="Swap Languages"><i class="fas fa-exchange-alt"></i></button>
            </div>
            <div class="col">
                <select id="to-language" class="form-select" v-model="toLanguage">
                    <option value="en">English</option>
                    <option value="ja">Japanese</option>
                    <option value="id">Indonesian</option>
                </select>
            </div>
        </div>
    </div>

    <footer class="bg-light p-3 border-top">
      <div class="d-flex justify-content-center align-items-center">
        <button class="btn btn-lg rounded-circle mx-3" :class="isListening ? 'btn-danger' : 'btn-primary'" @click="toggleListening" title="Start/Stop Listening">
          <i class="fas fa-microphone"></i>
        </button>
        <button class="btn btn-info mx-2" @click="speak()" title="Speak Translation"><i class="fas fa-volume-up"></i></button>
        <button class="btn btn-warning mx-2" @click="clearText" title="Clear Text"><i class="fas fa-sync-alt"></i></button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
main {
  overflow-y: auto;
}
.language-selector-bar {
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}
.form-check-label {
    color: white;
}
</style>
