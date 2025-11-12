# Bug Fix: Second Bubble Translation Not Working

**Date:** November 12, 2025  
**Status:** ✅ FIXED

## 🐛 Problem Description

Translation was not working on the second (and subsequent) conversation bubbles. The first translation would work correctly, but after that, the app would not translate subsequent speech inputs.

## 🔍 Root Cause Analysis

The issue was in the `isFinal` watcher in `App.vue`:

1. When the first speech finishes, `isFinal` becomes `true`
2. The watcher triggers, sets a 2000ms timeout, then calls `translate()`
3. After translation succeeds, `currentTurn` is reset to empty
4. Recognition restarts and user speaks again
5. When the second speech finishes, `isFinal` becomes `true` again
6. **BUT:** The watcher was called multiple times without proper state management, causing the pending translation flag to not reset properly

The fundamental issue: **`isFinal` could become `true` while a previous translation was still pending, causing the watcher to fire multiple times or not fire when expected.**

## ✅ Solution Implemented

### 1. Added Pending Translation Flag
```typescript
let pendingTranslation = false; // Track if translation is pending
```

### 2. Updated isFinal Watcher
Added guard clause to prevent duplicate translation attempts:
```typescript
watch(isFinal, (newIsFinal) => {
  if (newIsFinal && !pendingTranslation && currentTurn.value.transcription.trim()) {
    pendingTranslation = true; // Set flag BEFORE timeout
    // ... trigger translation
  }
});
```

### 3. Reset Flag After Translation
```typescript
const translate = async (text: string) => {
  // ... translation logic ...
  currentTurn.value = { transcription: '', translation: '', ... };
  pendingTranslation = false; // Reset flag after translation completes
  // ...
}
```

### 4. Reset Flag on Error
```typescript
catch (error) {
  // ... error handling ...
  pendingTranslation = false; // Reset flag on error too
}
```

### 5. Reset Flag When Starting Recognition
```typescript
const toggleListening = () => {
  // ...
  clearText();
  pendingTranslation = false; // Reset pending flag
  startRecognition();
}
```

## 🧪 Testing

- ✅ Build passes: No errors
- ✅ All 38 unit tests pass
- ✅ Translation now works for all conversation bubbles
- ✅ No duplicate translations

## 📝 Changes Made

### Files Modified:
1. **src/App.vue**
   - Added `pendingTranslation` flag
   - Updated `isFinal` watcher with guard clause
   - Reset flag in `translate()` function (success and error cases)
   - Reset flag in `toggleListening()` function

2. **src/composables/useSpeechRecognition.ts**
   - Restored `isFinal = false` reset in `onend` handler to ensure watcher can trigger again

## 🎯 Impact

- ✅ Users can now translate multiple conversation turns in sequence
- ✅ No more "stuck" translation state
- ✅ Proper state management prevents race conditions
- ✅ All existing functionality preserved

---

