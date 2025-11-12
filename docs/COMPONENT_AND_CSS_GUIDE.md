# Component & CSS Separation Strategy

**Date:** November 12, 2025  
**Pattern:** Atomic Design + BEM Naming + Scoped CSS

---

## 📐 Architecture Overview

```
src/
├── assets/
│   ├── main.css                    (Global styles & theme vars)
│   ├── utilities/
│   │   ├── buttons.css            (Button utilities)
│   │   ├── modals.css             (Modal utilities)
│   │   ├── transitions.css        (Animation utilities)
│   │   └── layout.css             (Layout utilities)
│   └── theme/
│       ├── light.css
│       └── dark.css
├── components/
│   ├── common/
│   │   ├── AppHeader.vue          (Header component)
│   │   ├── ConversationDisplay.vue (Main conversation area)
│   │   ├── ControlsFooter.vue     (Footer with controls)
│   │   └── LanguageSelector.vue   (Language dropdowns)
│   ├── buttons/
│   │   ├── PlayButton.vue         (Play/Stop button)
│   │   ├── MicButton.vue          (Microphone button)
│   │   └── IconButton.vue         (Generic icon button)
│   ├── conversation/
│   │   ├── ConversationTurn.vue   (Single conversation item)
│   │   ├── ConversationHistory.vue (History list)
│   │   └── CurrentTurn.vue        (Current input display)
│   ├── modals/
│   │   ├── SettingsModal.vue
│   │   └── UserModal.vue
│   └── App.vue                    (Main orchestrator - ~50 lines)
```

---

## 🎯 CSS Organization Strategy

### 1. **Global Styles** (`src/assets/main.css`)

Keep only:
- CSS variables for theme
- Base element styles (body, html)
- Global typography
- Root layout

```css
:root {
  --font-sans: 'Inter', sans-serif;
  
  /* Light theme colors */
  --bg-primary: #f8f9fa;
  --bg-secondary: #ffffff;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --accent-primary: #0d6efd;
  --border-color: #dee2e6;
  --shadow-color: rgba(0, 0, 0, 0.05);
}

.dark {
  --bg-primary: #121212;
  --bg-secondary: #1e1e1e;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  --accent-primary: #4dabf7;
  --border-color: #333333;
  --shadow-color: rgba(0, 0, 0, 0.2);
}

html, body {
  margin: 0;
  padding: 0;
  font-family: var(--font-sans);
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

### 2. **Utility Styles** (`src/assets/utilities/`)

Create separate utility files:

**buttons.css**
```css
.btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-family: var(--font-sans);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--shadow-color);
}

.btn--primary {
  background-color: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.btn--secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.btn--icon {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn--lg {
  width: 70px;
  height: 70px;
}
```

**modals.css**
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  min-width: 300px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}
```

**transitions.css**
```css
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(77, 171, 247, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(77, 171, 247, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(77, 171, 247, 0);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### 3. **Component Scoped Styles**

Each `.vue` file has `<style scoped>`:

```vue
<template>
  <div class="app-header">
    <!-- Component markup -->
  </div>
</template>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.app-header__title {
  font-size: 1.25rem;
  font-weight: 700;
}

.app-header__controls {
  display: flex;
  gap: 0.75rem;
}
</style>
```

---

## 📝 CSS Naming Convention - BEM

Use BEM (Block, Element, Modifier) for consistency:

```
.block__element--modifier
```

### Examples

```css
/* Block: represents a standalone component */
.conversation-turn { }

/* Element: child of block (always prefixed) */
.conversation-turn__speaker-icon { }
.conversation-turn__bubble { }

/* Modifier: variation of block or element */
.conversation-turn--active { }
.conversation-turn__bubble--user { }
.conversation-turn__bubble--system { }
```

---

## 🧩 Component Breakdown

### AppHeader.vue (60 lines)

```vue
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import Translate from 'vue-material-design-icons/Translate.vue';
import CogOutline from 'vue-material-design-icons/CogOutline.vue';
import AccountOutline from 'vue-material-design-icons/AccountOutline.vue';

const props = defineProps<{
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
      <button @click="$emit('settings-click')" class="btn btn--icon" title="Settings" aria-label="Open Settings">
        <CogOutline :size="24" />
      </button>
      <button @click="$emit('profile-click')" class="btn btn--icon" title="Profile" aria-label="Open Profile">
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
</style>
```

### ConversationDisplay.vue (100 lines)

```vue
<script setup lang="ts">
import { defineProps } from 'vue';
import AccountCircleOutline from 'vue-material-design-icons/AccountCircleOutline.vue';
import type { ConversationTurn } from '@/types';

defineProps<{
  history: ConversationTurn[];
  currentTurn: ConversationTurn;
  isListening: boolean;
  isTranslating: boolean;
  appMode: 'translation' | 'transcribeOnly';
}>();
</script>

<template>
  <main class="conversation-display">
    <div class="conversation-history">
      <div v-for="(turn, index) in history" :key="index" class="conversation-turn">
        <div class="conversation-turn__speaker-icon">
          <AccountCircleOutline :size="24" v-if="turn.transcription" />
        </div>
        <div class="conversation-turn__bubble">
          <p class="conversation-turn__text conversation-turn__text--from">
            From ({{ turn.fromLanguage.toUpperCase() }}): {{ turn.transcription }}
          </p>
          <p v-if="appMode === 'translation'" class="conversation-turn__text conversation-turn__text--to">
            To ({{ turn.toLanguage.toUpperCase() }}): {{ turn.translation }}
          </p>
        </div>
      </div>

      <!-- Current active turn -->
      <div v-if="currentTurn.transcription || isListening" class="conversation-turn conversation-turn--active">
        <div class="conversation-turn__speaker-icon">
          <AccountCircleOutline :size="24" />
        </div>
        <div class="conversation-turn__bubble">
          <p class="conversation-turn__text conversation-turn__text--from">
            From ({{ currentTurn.fromLanguage.toUpperCase() }}): 
            {{ currentTurn.transcription || 'Waiting for you to speak...' }}
          </p>
          <p v-if="appMode === 'translation'" class="conversation-turn__text conversation-turn__text--to">
            <span v-if="isTranslating" class="spinner"></span>
            <span v-else>
              To ({{ currentTurn.toLanguage.toUpperCase() }}): 
              {{ currentTurn.translation || 'Translation will appear here.' }}
            </span>
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.conversation-display {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1.5rem;
  overflow-y: auto;
}

.conversation-history {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.conversation-turn {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.conversation-turn--active {
  margin-top: 1.5rem;
}

.conversation-turn__speaker-icon {
  flex-shrink: 0;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.conversation-turn__bubble {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 0.75rem 1rem;
  max-width: 80%;
  word-wrap: break-word;
  flex-grow: 1;
}

.conversation-turn__text {
  margin: 0;
  line-height: 1.5;
  color: var(--text-primary);
  font-size: 1rem;
}

.conversation-turn__text--from {
  font-weight: 500;
  color: var(--accent-primary);
  margin-bottom: 0.5rem;
}

.conversation-turn__text--to {
  color: var(--text-primary);
  font-style: italic;
}

.spinner {
  width: 24px;
  height: 24px;
  margin: 0 0.5rem;
  border: 3px solid var(--border-color);
  border-bottom-color: var(--accent-primary);
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: spin 1s linear infinite;
}

@media (max-width: 600px) {
  .conversation-display {
    padding: 0.5rem;
  }

  .conversation-turn__bubble {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }

  .conversation-turn__text {
    font-size: 0.9rem;
  }
}
</style>
```

### ControlsFooter.vue (120 lines)

```vue
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import SwapHorizontal from 'vue-material-design-icons/SwapHorizontal.vue';
import Play from 'vue-material-design-icons/Play.vue';
import Microphone from 'vue-material-design-icons/Microphone.vue';
import TrashCanOutline from 'vue-material-design-icons/TrashCanOutline.vue';

defineProps<{
  fromLanguage: string;
  toLanguage: string;
  isListening: boolean;
  isSpeaking: boolean;
}>();

const emit = defineEmits<{
  (e: 'swap-languages'): void;
  (e: 'speak-click'): void;
  (e: 'mic-click'): void;
  (e: 'clear-click'): void;
  (e: 'language-from', value: string): void;
  (e: 'language-to', value: string): void;
}>();
</script>

<template>
  <footer class="controls-footer">
    <div class="language-controls">
      <div class="select-wrapper">
        <select 
          :value="fromLanguage" 
          @input="$emit('language-from', ($event.target as HTMLSelectElement).value)"
          class="language-select"
        >
          <option value="en">English</option>
          <option value="ja">Japanese</option>
          <option value="id">Indonesian</option>
        </select>
      </div>
      <button @click="$emit('swap-languages')" class="btn btn--icon" title="Swap Languages" aria-label="Swap Languages">
        <SwapHorizontal />
      </button>
      <div class="select-wrapper">
        <select 
          :value="toLanguage" 
          @input="$emit('language-to', ($event.target as HTMLSelectElement).value)"
          class="language-select"
        >
          <option value="en">English</option>
          <option value="ja">Japanese</option>
          <option value="id">Indonesian</option>
        </select>
      </div>
    </div>

    <div class="main-controls">
      <button @click="$emit('speak-click')" class="btn btn--icon" :class="{ 'btn--speaking': isSpeaking }" title="Speak / Stop" aria-label="Speak Translation or Stop">
        <Play />
      </button>
      <button @click="$emit('mic-click')" class="btn btn--lg" :class="{ 'btn--recording': isListening }" title="Start/Stop Listening" aria-label="Toggle Microphone">
        <Microphone :size="36" />
      </button>
      <button @click="$emit('clear-click')" class="btn btn--icon" title="Clear Messages" aria-label="Clear All Messages">
        <TrashCanOutline />
      </button>
    </div>

    <div class="copyright">
      Copyright &copy; Nansuri 2025
    </div>
  </footer>
</template>

<style scoped>
.controls-footer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  box-shadow: 0 -2px 10px var(--shadow-color);
  flex-shrink: 0;
}

.language-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.select-wrapper {
  position: relative;
  flex-grow: 1;
  max-width: 300px;
}

.language-select {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  width: 100%;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  cursor: pointer;
}

.select-wrapper::after {
  content: '▼';
  font-size: 0.8rem;
  color: var(--text-secondary);
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.main-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.btn--recording {
  background-color: #dc3545;
  color: white;
  border-color: #dc3545;
  box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
  animation: pulse 1.5s infinite;
}

.btn--speaking {
  background-color: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 0 var(--accent-primary);
  animation: pulse 1.5s infinite;
}

.copyright {
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

@media (max-width: 600px) {
  .controls-footer {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }

  .language-controls {
    gap: 0.75rem;
  }

  .main-controls {
    gap: 0.75rem;
  }

  .btn--icon {
    width: 50px;
    height: 50px;
  }

  .btn--lg {
    width: 60px;
    height: 60px;
  }

  .copyright {
    font-size: 0.7rem;
    margin-top: 0.25rem;
  }
}
</style>
```

---

## 🎯 CSS Structure Benefits

✅ **Modular** - Each component has its own styles  
✅ **Maintainable** - Changes don't affect other components  
✅ **Reusable** - Utility classes shared across components  
✅ **Scalable** - Easy to add new components  
✅ **Performance** - Scoped styles prevent style conflicts  
✅ **Themeable** - CSS variables make theming easy  
✅ **Responsive** - Media queries in each component  

---

## 📦 Import Structure in main.css

```css
@import './utilities/buttons.css';
@import './utilities/modals.css';
@import './utilities/transitions.css';
@import './utilities/layout.css';
```

---

## ✨ Best Practices

1. **Keep main.css minimal** - Only global styles and theme variables
2. **Use scoped styles** - `<style scoped>` for component-specific styles
3. **Use BEM naming** - Consistent naming across all components
4. **Leverage CSS variables** - For colors, sizes, spacing
5. **Mobile-first** - Start with mobile, add media queries
6. **Separate concerns** - Component logic separate from styling

---

