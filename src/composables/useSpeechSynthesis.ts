/**
 * useSpeechSynthesis composable
 * Handles text-to-speech functionality
 */

import { ref } from 'vue';
import { ERROR_MESSAGES } from '../constants';
import type { LanguageCode } from '../types';

export function useSpeechSynthesis() {
  const isSpeaking = ref(false);
  const speechError = ref<string | null>(null);
  const wasListeningBeforeSpeech = ref(false);

  /**
   * Speaks the provided text using browser's Web Speech API
   */
  const speak = (text: string, language: LanguageCode): boolean => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;

      utterance.onstart = () => {
        isSpeaking.value = true;
        speechError.value = null;
      };

      utterance.onend = () => {
        isSpeaking.value = false;
      };

      utterance.onerror = (event) => {
        isSpeaking.value = false;
        console.error('Speech synthesis error:', event.error);
        speechError.value = `${ERROR_MESSAGES.SPEECH_ERROR} ${event.error}`;
      };

      speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error('Failed to speak:', error);
      speechError.value = ERROR_MESSAGES.SPEECH_ERROR;
      return false;
    }
  };

  /**
   * Stops current speech synthesis
   */
  const stop = (): void => {
    speechSynthesis.cancel();
    isSpeaking.value = false;
  };

  /**
   * Toggles speech on/off
   */
  const toggle = (text: string, language: LanguageCode): boolean => {
    if (isSpeaking.value) {
      stop();
      return false;
    }
    return speak(text, language);
  };

  const clearError = () => {
    speechError.value = null;
  };

  return {
    isSpeaking,
    speechError,
    wasListeningBeforeSpeech,
    speak,
    stop,
    toggle,
    clearError,
  };
}
