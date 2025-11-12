/**
 * useTranslation composable
 * Handles translation API calls and translation state management
 */

import { ref, computed } from 'vue';
import { API_CONFIG, ERROR_MESSAGES } from '../constants';
import type { ConversationTurn, LanguageCode, TranslationResponse } from '../types';

export function useTranslation() {
  const isTranslating = ref(false);
  const translationError = ref<string | null>(null);

  /**
   * Fetches translation from LibreTranslate API
   */
  const translate = async (
    text: string,
    sourceLanguage: LanguageCode,
    targetLanguage: LanguageCode
  ): Promise<string | null> => {
    if (!text) return null;

    isTranslating.value = true;
    translationError.value = null;

    try {
      const response = await fetch(`${API_CONFIG.LIBRETRANSLATE_URL}/translate`, {
        method: 'POST',
        body: JSON.stringify({
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TranslationResponse = await response.json();
      return data.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      translationError.value = ERROR_MESSAGES.TRANSLATION_FAILED;
      return null;
    } finally {
      isTranslating.value = false;
    }
  };

  const hasError = computed(() => translationError.value !== null);
  const getError = computed(() => translationError.value);

  const clearError = () => {
    translationError.value = null;
  };

  return {
    isTranslating,
    translate,
    hasError,
    getError,
    clearError,
    translationError,
  };
}
