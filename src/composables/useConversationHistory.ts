/**
 * useConversationHistory composable
 * Handles conversation history management and localStorage persistence
 */

import { ref, computed } from 'vue';
import { STORAGE_KEYS, ERROR_MESSAGES } from '../constants';
import type { ConversationTurn } from '../types';

export function useConversationHistory() {
  const conversationHistory = ref<ConversationTurn[]>([]);
  const historyError = ref<string | null>(null);

  /**
   * Adds a new turn to conversation history
   */
  const addTurn = (turn: ConversationTurn) => {
    conversationHistory.value.push(turn);
  };

  /**
   * Clears all conversation history
   */
  const clearHistory = () => {
    conversationHistory.value = [];
    historyError.value = null;
  };

  /**
   * Saves conversation history to localStorage
   */
  const saveToStorage = (): boolean => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CONVERSATION_HISTORY,
        JSON.stringify(conversationHistory.value)
      );
      return true;
    } catch (error) {
      console.error('Failed to save conversation:', error);
      historyError.value = 'Failed to save conversation.';
      return false;
    }
  };

  /**
   * Loads conversation history from localStorage
   */
  const loadFromStorage = (): boolean => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEYS.CONVERSATION_HISTORY);
      if (savedHistory) {
        conversationHistory.value = JSON.parse(savedHistory);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to parse saved conversation:', error);
      historyError.value = ERROR_MESSAGES.CONVERSATION_LOAD_FAILED;
      localStorage.removeItem(STORAGE_KEYS.CONVERSATION_HISTORY);
      return false;
    }
  };

  /**
   * Clears stored conversation from localStorage
   */
  const clearStorage = (): boolean => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CONVERSATION_HISTORY);
      conversationHistory.value = [];
      return true;
    } catch (error) {
      console.error('Failed to clear saved conversation:', error);
      historyError.value = 'Failed to clear saved conversation.';
      return false;
    }
  };

  const hasHistory = computed(() => conversationHistory.value.length > 0);
  const getTurnsCount = computed(() => conversationHistory.value.length);

  return {
    conversationHistory,
    historyError,
    addTurn,
    clearHistory,
    saveToStorage,
    loadFromStorage,
    clearStorage,
    hasHistory,
    getTurnsCount,
  };
}
