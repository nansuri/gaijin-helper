/**
 * useTheme composable
 * Handles theme management and persistence
 */

import { ref, watch } from 'vue';
import { STORAGE_KEYS, DEFAULT_THEME } from '../constants';
import type { Theme } from '../types';

export function useTheme() {
  const theme = ref<Theme>(DEFAULT_THEME);

  /**
   * Initializes theme from localStorage or system preference
   */
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null;
    if (savedTheme) {
      theme.value = savedTheme;
    } else {
      theme.value = DEFAULT_THEME;
    }
    applyTheme();
  };

  /**
   * Applies theme to DOM
   */
  const applyTheme = () => {
    document.documentElement.className = theme.value;
  };

  /**
   * Toggles between light and dark theme
   */
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    applyTheme();
  };

  /**
   * Sets specific theme
   */
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
    applyTheme();
  };

  /**
   * Watch for theme changes and persist to localStorage
   */
  watch(theme, (newTheme) => {
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    applyTheme();
  });

  return {
    theme,
    initializeTheme,
    toggleTheme,
    setTheme,
    applyTheme,
  };
}
