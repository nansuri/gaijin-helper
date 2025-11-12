import { ref } from 'vue';

export function useModals() {
  const showSettings = ref(false);
  const showProfileActions = ref(false);

  return {
    showSettings,
    showProfileActions,
  };
}
