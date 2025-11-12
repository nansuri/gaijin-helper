/**
 * Type definitions for Gaijin Helper application
 */

export interface ConversationTurn {
  transcription: string;
  translation: string;
  fromLanguage: string;
  toLanguage: string;
}

export type AppMode = 'translation' | 'transcribeOnly';
export type Theme = 'light' | 'dark';
export type LanguageCode = 'en' | 'ja' | 'id';

export interface TranslationResponse {
  translatedText: string;
}

export interface SpeechRecognitionOptions {
  language: LanguageCode;
  continuous: boolean;
  interimResults: boolean;
}

export interface SpeechSynthesisOptions {
  language: LanguageCode;
}
