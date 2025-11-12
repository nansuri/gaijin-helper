<script setup lang="ts">
import { defineEmits } from 'vue';
import Translate from 'vue-material-design-icons/Translate.vue';
import CogOutline from 'vue-material-design-icons/CogOutline.vue';
import AccountOutline from 'vue-material-design-icons/AccountOutline.vue';

defineProps<{
  title?: string;
  description?: string;
}>();

const emit = defineEmits<{
  (e: 'settings-click'): void;
  (e: 'profile-click'): void;
}>();
</script>

<template>
  <header class="app-header">
    <div class="app-header__title-group">
      <Translate :size="32" class="app-header__icon" />
      <div>
        <h1 class="app-header__title">{{ title || 'Gaijin Helper' }}</h1>
        <p class="app-header__description">{{ description || 'Real-time Conversation Translator' }}</p>
      </div>
    </div>
    <div class="app-header__controls">
      <button
        @click="$emit('settings-click')"
        class="btn btn--icon"
        title="Settings"
        aria-label="Open Settings"
      >
        <CogOutline :size="24" />
      </button>
      <button
        @click="$emit('profile-click')"
        class="btn btn--icon"
        title="Profile"
        aria-label="Open Profile"
      >
        <AccountOutline :size="24" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.app-header__title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.app-header__icon {
  color: var(--accent-primary);
}

.app-header__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.app-header__description {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
}

.app-header__controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

@media (max-width: 600px) {
  .app-header {
    padding: 0.5rem 1rem;
  }

  .app-header__title-group {
    gap: 0.5rem;
  }

  .app-header__title {
    font-size: 1rem;
  }

  .app-header__description {
    font-size: 0.75rem;
  }
}
</style>
