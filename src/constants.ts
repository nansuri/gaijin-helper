/**
 * Application-wide constants and configuration
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: 'Japanese' },
  { code: 'id', name: 'Indonesian' },
] as const;

export const DEFAULT_FROM_LANGUAGE = 'en';
export const DEFAULT_TO_LANGUAGE = 'ja';
export const DEFAULT_THEME = 'dark' as const;
export const DEFAULT_APP_MODE = 'translation' as const;

export const TRANSLATION_DELAY_MS = 2000; // Wait 2 seconds for user to finish speaking
export const LANGUAGE_SWITCH_DELAY_MS = 100; // Delay before restarting recognition

export const API_CONFIG = {
  LIBRETRANSLATE_URL: 'https://translate-api.justnansuri.com',
  TIMEOUT_MS: 10000,
} as const;

export const STORAGE_KEYS = {
  THEME: 'theme',
  CONVERSATION_HISTORY: 'gaijin-helper-conversation-history',
} as const;

export const ERROR_MESSAGES = {
  TRANSLATION_FAILED: 'Error: Could not translate.',
  NO_SPEECH_SUPPORT: 'Your browser does not support the Web Speech API.',
  NO_TEXT_TO_SPEAK: 'No text available to speak.',
  CONVERSATION_LOAD_FAILED: 'Error loading conversation. Data may be corrupted.',
  SPEECH_ERROR: 'Speech recognition error.',
} as const;
