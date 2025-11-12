import { ref, watch, onUnmounted } from 'vue';
import type { Ref } from 'vue';

export function useSpeechRecognition(language: Ref<string>) {
  const isListening = ref(false);
  const transcription = ref('');
  const isFinal = ref(false);
  const error = ref<string | null>(null);

  let recognition: SpeechRecognition | null = null;

  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      isListening.value = true;
      isFinal.value = false;
      transcription.value = '';
      error.value = null;
    };

    recognition.onend = () => {
      isListening.value = false;
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      error.value = event.error;
      console.error('SpeechRecognition error:', event.error);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      transcription.value = final + interim;
      isFinal.value = final !== '';
    };

  }

  const start = () => {
    if (recognition && !isListening.value) {
      recognition.lang = language.value;
      recognition.start();
    }
  };

  const stop = () => {
    if (recognition && isListening.value) {
      recognition.stop();
    }
  };

  watch(language, (newLang) => {
    if (recognition && isListening.value) {
      // If recognition is running and language changes, restart it with the new language
      recognition.stop();
      // Wait for stop to complete before restarting
      setTimeout(() => {
        if (recognition) {
          recognition.lang = newLang;
          recognition.start();
        }
      }, 100);
    } else if (recognition) {
      // If not running, just update the language for the next start
      recognition.lang = newLang;
    }
  });

  onUnmounted(() => {
    stop();
  });

  return {
    isSupported: recognition !== null,
    isListening,
    transcription,
    isFinal,
    error,
    start,
    stop,
  };
}
