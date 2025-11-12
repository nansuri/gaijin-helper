# Modular Architecture Quick Reference

## 📁 New File Structure

```
src/
├── App.vue                          (Main - will be simplified)
├── main.ts                          (Entry point)
├── types.ts                         ✨ NEW - All TypeScript types
├── constants.ts                     ✨ NEW - All configuration
├── assets/
│   └── main.css
├── components/
│   ├── SettingsModal.vue
│   ├── UserModal.vue
│   ├── AppHeader.vue               (To be created)
│   ├── ConversationDisplay.vue      (To be created)
│   └── ControlsFooter.vue           (To be created)
├── composables/
│   ├── useSpeechRecognition.ts      (Existing - improved)
│   ├── useTranslation.ts            ✨ NEW
│   ├── useConversationHistory.ts    ✨ NEW
│   ├── useSpeechSynthesis.ts        ✨ NEW
│   ├── useTheme.ts                  ✨ NEW
│   └── useLanguage.ts               ✨ NEW
└── public/
```

---

## 🎯 Quick Usage Examples

### Import and Use Translation

```typescript
import { useTranslation } from '@/composables/useTranslation';

const { translate, isTranslating, hasError } = useTranslation();

// Translate text
const result = await translate('Hello', 'en', 'ja');
```

### Manage Conversation History

```typescript
import { useConversationHistory } from '@/composables/useConversationHistory';

const { addTurn, clearHistory, saveToStorage, loadFromStorage } = useConversationHistory();

addTurn({
  transcription: 'Hello',
  translation: 'こんにちは',
  fromLanguage: 'en',
  toLanguage: 'ja'
});

saveToStorage();
```

### Handle Speech Synthesis

```typescript
import { useSpeechSynthesis } from '@/composables/useSpeechSynthesis';

const { speak, stop, isSpeaking } = useSpeechSynthesis();

speak('Hello world', 'en');
// Later...
stop();
```

### Manage Theme

```typescript
import { useTheme } from '@/composables/useTheme';

const { theme, toggleTheme, setTheme } = useTheme();

// Initialize on mount
onMounted(() => {
  initializeTheme();
});
```

### Manage Languages

```typescript
import { useLanguage } from '@/composables/useLanguage';

const { 
  fromLanguage, 
  toLanguage, 
  swapLanguages,
  getLanguageName 
} = useLanguage();

swapLanguages();
const langName = getLanguageName('ja'); // 'Japanese'
```

---

## 🔑 Key Interfaces

### ConversationTurn
```typescript
{
  transcription: string;
  translation: string;
  fromLanguage: 'en' | 'ja' | 'id';
  toLanguage: 'en' | 'ja' | 'id';
}
```

### AppMode
```typescript
type AppMode = 'translation' | 'transcribeOnly';
```

### Theme
```typescript
type Theme = 'light' | 'dark';
```

---

## ⚙️ Configuration

All configuration is in `src/constants.ts`:

```typescript
// API URL
API_CONFIG.LIBRETRANSLATE_URL

// Timing
TRANSLATION_DELAY_MS          // 2000ms
LANGUAGE_SWITCH_DELAY_MS      // 100ms

// Languages
SUPPORTED_LANGUAGES           // List of available languages
DEFAULT_FROM_LANGUAGE         // 'en'
DEFAULT_TO_LANGUAGE           // 'ja'

// Storage
STORAGE_KEYS.THEME            // localStorage key
STORAGE_KEYS.CONVERSATION_HISTORY

// Error messages
ERROR_MESSAGES.TRANSLATION_FAILED
ERROR_MESSAGES.NO_SPEECH_SUPPORT
ERROR_MESSAGES.NO_TEXT_TO_SPEAK
```

---

## ✅ Benefits Summary

| Aspect | Benefit |
|--------|---------|
| **Reusability** | Use composables in multiple components |
| **Testing** | Test each composable independently |
| **Maintenance** | Changes don't cascade |
| **Scalability** | Easy to add new features |
| **Type Safety** | TypeScript catches errors early |
| **Performance** | Better tree-shaking |
| **Debugging** | Isolated logic is easier to trace |

---

## 🚀 Next Steps

1. Create component files:
   - `AppHeader.vue`
   - `ConversationDisplay.vue`
   - `ControlsFooter.vue`

2. Extract logic from `App.vue` into components

3. Use composables in each component

4. Simplify `App.vue` to mainly orchestrate components

5. Add unit tests for composables

---

## 📞 Architecture Support

Need to understand a composable? Check:
1. The composable file itself (well-documented)
2. `types.ts` for related types
3. `constants.ts` for configuration
4. `REFACTORING_GUIDE.md` for deep dive

