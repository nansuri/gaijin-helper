/**
 * useLanguage composable
 * Handles language selection and management
 */

import { ref } from 'vue';
import { DEFAULT_FROM_LANGUAGE, DEFAULT_TO_LANGUAGE, SUPPORTED_LANGUAGES } from '../constants';
import type { LanguageCode } from '../types';

export function useLanguage() {
  const fromLanguage = ref<LanguageCode>(DEFAULT_FROM_LANGUAGE as LanguageCode);
  const toLanguage = ref<LanguageCode>(DEFAULT_TO_LANGUAGE as LanguageCode);

  /**
   * Swaps source and target languages
   */
  const swapLanguages = () => {
    [fromLanguage.value, toLanguage.value] = [toLanguage.value, fromLanguage.value];
  };

  /**
   * Sets source language
   */
  const setFromLanguage = (lang: LanguageCode) => {
    fromLanguage.value = lang;
  };

  /**
   * Sets target language
   */
  const setToLanguage = (lang: LanguageCode) => {
    toLanguage.value = lang;
  };

  /**
   * Gets list of supported languages
   */
  const getSupportedLanguages = () => SUPPORTED_LANGUAGES;

  /**
   * Gets language name by code
   */
  const getLanguageName = (code: LanguageCode): string => {
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    return lang ? lang.name : code;
  };

  return {
    fromLanguage,
    toLanguage,
    swapLanguages,
    setFromLanguage,
    setToLanguage,
    getSupportedLanguages,
    getLanguageName,
  };
}
