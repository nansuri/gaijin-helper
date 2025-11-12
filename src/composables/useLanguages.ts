import { ref } from 'vue';

export function useLanguages() {
  const fromLanguage = ref('en');
  const toLanguage = ref('ja');

  const swapLanguages = () => {
    [fromLanguage.value, toLanguage.value] = [toLanguage.value, fromLanguage.value];
  };

  return {
    fromLanguage,
    toLanguage,
    swapLanguages,
  };
}
