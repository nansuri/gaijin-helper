import { ref, watch } from 'vue';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useLanguages } from './useLanguages';
import { useConversation } from './useConversation';

export function useTranslationFlow(
  fromLanguage: Ref<string>,
  toLanguage: Ref<string>,
  conversationHistory: Ref<any[]>, // Adjust type as needed
  currentTurn: Ref<any>, // Adjust type as needed
  clearText: () => void
) {
  const currentTranscription = ref('');
  const currentTranslation = ref('');
  const isTranslating = ref(false);
  const autoSpeak = ref(false);
  const wasListeningBeforeSpeak = ref(false);
  let translationTimeout: number | undefined;
  const appMode = ref<'translation' | 'transcribeOnly'>('translation'); // This might need to be managed higher up or passed in

  const {
    isSupported,
    isListening,
    transcription,
    isFinal,
    start: startRecognition,
    stop: stopRecognition,
  } = useSpeechRecognition(fromLanguage);

  watch(transcription, (newTranscription) => {
    currentTurn.value.transcription = newTranscription;
  });

  watch(isFinal, (newIsFinal) => {
    if (newIsFinal) {
      clearTimeout(translationTimeout);
      translationTimeout = setTimeout(() => {
        translate(currentTurn.value.transcription.trim());
      }, 400);
    }
  });

  const translate = async (text: string) => {
    if (!text || appMode.value === 'transcribeOnly') return;
    isTranslating.value = true;
    currentTurn.value.translation = ''; // Clear current translation while translating

    try {
      const LIBRETRANSLATE_API_URL = 'https://translate-api.justnansuri.com';
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
      currentTurn.value.transcription = ''; // Reset current transcription
      currentTurn.value.translation = ''; // Reset current translation
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

  return {
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
    appMode, // Expose appMode for now, might move later
  };
}
