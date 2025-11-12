import { ref, onMounted, watch } from 'vue';

export function useTheme() {
  const theme = ref<'light' | 'dark'>('dark');

  onMounted(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      theme.value = savedTheme;
    } else {
      document.documentElement.className = 'dark';
    }
  });

  watch(theme, (newTheme) => {
    document.documentElement.className = newTheme;
    localStorage.setItem('theme', newTheme);
  });

  return {
    theme,
  };
}
