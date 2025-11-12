import { ref, watch } from 'vue';

export function useConversation(fromLanguage: Ref<string>, toLanguage: Ref<string>) {
  const conversationHistory = ref<{
    transcription: string;
    translation: string;
    fromLanguage: string;
    toLanguage: string;
  }[]>([]);
  const currentTurn = ref<{
    transcription: string;
    translation: string;
    fromLanguage: string;
    toLanguage: string;
  }>({ transcription: '', translation: '', fromLanguage: fromLanguage.value, toLanguage: toLanguage.value });

  const saveConversation = () => {
    localStorage.setItem('gaijin-helper-conversation-history', JSON.stringify(conversationHistory.value));
    alert('Conversation saved!');
  };

  const loadConversation = () => {
    const savedHistory = localStorage.getItem('gaijin-helper-conversation-history');
    if (savedHistory) {
      conversationHistory.value = JSON.parse(savedHistory);
      alert('Conversation loaded!');
    }
  };

  const clearSavedConversation = () => {
    localStorage.removeItem('gaijin-helper-conversation-history');
    conversationHistory.value = []; // Also clear current history in app
    alert('Saved conversation cleared!');
  };

  const clearText = () => {
    currentTurn.value = { transcription: '', translation: '', fromLanguage: fromLanguage.value, toLanguage: toLanguage.value };
    conversationHistory.value = []; // Clear history
  };

  // Watch for language changes to update currentTurn's language
  watch([fromLanguage, toLanguage], () => {
    currentTurn.value.fromLanguage = fromLanguage.value;
    currentTurn.value.toLanguage = toLanguage.value;
  });

  return {
    conversationHistory,
    currentTurn,
    saveConversation,
    loadConversation,
    clearSavedConversation,
    clearText,
  };
}
