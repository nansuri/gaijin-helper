# Gaijin Helper

Real-time, voice-driven translation application with Vue 3, TypeScript, and Web Speech API.

## 🚀 Quick Start

### Development
```bash
./dev.sh
```
App runs at `http://localhost:5173`

### Production
```bash
docker-compose up -d --build
```
App runs at `http://localhost:8090`

## 📋 Features

- 🎤 Real-time speech recognition with Web Speech API
- 🌐 Multi-language translation via LibreTranslate
- 🔊 Text-to-speech synthesis
- 🌙 Dark/Light theme support
- 📱 Fully responsive design
- ♿ Accessible with ARIA labels

## 🛠️ Tech Stack

- **Frontend:** Vue 3 (Composition API) + TypeScript
- **Build:** Vite
- **Styling:** CSS Variables + Scoped Components
- **Icons:** Vue Material Design Icons
- **Testing:** Vitest + Vue Test Utils
- **Translation:** LibreTranslate (self-hosted)
- **Deployment:** Docker + Nginx

## 📁 Project Structure

```
src/
├── App.vue                    # Root component orchestrating state
├── components/                # UI components
│   ├── AppHeader.vue         # Header with title & settings
│   ├── ConversationDisplay.vue # Conversation history display
│   ├── ControlsFooter.vue    # Language & control buttons
│   ├── SettingsModal.vue     # Settings panel
│   └── UserModal.vue         # User actions panel
├── composables/               # Business logic
│   ├── useSpeechRecognition.ts
│   ├── useTranslation.ts
│   ├── useSpeechSynthesis.ts
│   ├── useTheme.ts
│   ├── useLanguage.ts
│   └── useConversationHistory.ts
├── assets/
│   └── main.css              # Global styles & utilities
├── types.ts                   # TypeScript interfaces
├── constants.ts               # Configuration constants
└── main.ts                    # App entry point

docs/                          # Documentation
├── BUG_REPORT.md
├── FIXES_APPLIED.md
├── COMPONENT_SEPARATION_COMPLETE.md
└── ...
```

## 📚 Documentation

See the [docs](./docs) folder for detailed documentation:

- **[COMPONENT_SEPARATION_COMPLETE.md](./docs/COMPONENT_SEPARATION_COMPLETE.md)** - Architecture and component design
- **[REFACTORING_GUIDE.md](./docs/REFACTORING_GUIDE.md)** - Complete refactoring details
- **[MODULAR_ARCHITECTURE_QUICK_REF.md](./docs/MODULAR_ARCHITECTURE_QUICK_REF.md)** - Quick API reference

## 🧪 Testing

```bash
npm test              # Run tests once
npm run test:ui       # Run with UI
npm run test:coverage # Generate coverage report
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run unit tests

## 🔧 Environment Variables

Set `VITE_LIBRETRANSLATE_API_URL` to override the translation API endpoint (default: `https://translate-api.justnansuri.com`)

## 📄 License

MIT