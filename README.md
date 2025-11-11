# Gaijin Helper - Technical Documentation

## 1. Project Overview

Gaijin Helper is a real-time, voice-driven translation application. Its primary function is to capture audio from a user's microphone, transcribe it to text, translate that text into a selected target language, and read the translated text aloud. The user interface is designed as a single-card "translation device" that focuses on the current turn of conversation.

## 2. Core Technologies

- **Frontend Framework:** [Vue 3](https://vuejs.org/) using the Composition API.
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** Custom CSS using CSS Variables for a dynamic light/dark theme system.
- **Iconography:** [Vue Material Design Icons](https://www.npmjs.com/package/vue-material-design-icons) (SVG-based).
- **Backend Translation Service:** [LibreTranslate](https://github.com/LibreTranslate/LibreTranslate) (self-hosted).
- **Containerization:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/).
- **Browser APIs:**
  - Web Speech API (`SpeechRecognition`) for transcription.
  - Web Speech API (`SpeechSynthesis`) for speaking the translation.

## 3. Architecture & Project Structure

The frontend is a single-page application built with Vue 3. The architecture is based on the Composition API, with state and logic encapsulated within the main `App.vue` component and reusable logic extracted into composables.

```
/
├── public/             # Static assets (Not currently used after icon library removal)
├── src/
│   ├── assets/         # main.css: Global styles and theme (CSS variables) setup.
│   ├── components/     # Currently empty. For future reusable UI components.
│   ├── composables/    # Contains reusable Composition API logic.
│   │   └── useSpeechRecognition.ts # Encapsulates all Web Speech API logic.
│   ├── App.vue         # The root Vue component. Contains all UI layout and primary state management.
│   └── main.ts         # The application's entry point. Initializes Vue.
├── docker-compose.yml  # Defines the 'frontend' and 'libretranslate' services for deployment.
├── Dockerfile          # A multi-stage Dockerfile to build the Vue app and serve it with Nginx.
├── dev.sh              # A shell script for setting up and running the local development environment.
└── package.json        # Project dependencies and NPM scripts.
```

## 4. State Management

Application state is managed within `App.vue` using Vue 3's reactive `ref()`s. Key state variables include:

- `fromLanguage`, `toLanguage`: The selected source and target languages.
- `currentTranscription`, `currentTranslation`: The text for the current conversation turn.
- `isListening`: A boolean tracking the microphone's state.
- `isTranslating`: A boolean for showing a loading state during API calls.
- `theme`: A string ('light' or 'dark') that controls the current UI theme.
- `autoSpeak`: A boolean to toggle the automatic speaking of translations.
- `wasListeningBeforeSpeak`: A boolean to manage the pause/resume logic of the microphone.

## 5. Core Logic Flow (`Catch -> Transcribe -> Translate -> Read`)

This flow is orchestrated within `App.vue`.

1.  **Catch & Transcribe:**
    - `toggleListening()` calls `startRecognition()` from the `useSpeechRecognition` composable.
    - The composable captures microphone input and updates the reactive `transcription` ref.
    - A `watch`er in `App.vue` observes this `transcription` ref and updates the `currentTranscription` state, which updates the UI.

2.  **Translate:**
    - The `useSpeechRecognition` composable also exposes a reactive boolean `isFinal`.
    - A `watch`er in `App.vue` observes `isFinal`. When it becomes `true`, a timeout is set (to wait for the end of a sentence) which then calls the `translate()` function.
    - `translate()` sends the `currentTranscription` text to the LibreTranslate API (`http://localhost:5050/translate`).
    - On a successful response, it updates the `currentTranslation` ref, which updates the UI.

3.  **Read:**
    - If `autoSpeak` is `true`, the `translate()` function calls `speak()` upon receiving a successful translation.
    - The `speak()` function can also be triggered manually.
    - **Pause/Resume Logic:** The `speak()` function checks if `isListening` is true. If so, it calls `stopRecognition()` to pause listening. It then uses the `utterance.onend` event to call `startRecognition()` again, ensuring the app doesn't transcribe its own voice.

## 6. How to Run the Application

There are two primary methods for running the application.

### A. Development Mode

This mode is for active development and provides hot-reloading.

**To Run:** Execute the development script from the project root:
```bash
./dev.sh
```

**What it does:**
1.  Starts the `libretranslate` service in the background using `docker-compose`.
2.  Installs/updates NPM dependencies via `npm install`.
3.  Starts the Vite development server via `npm run dev`.
4.  The application will be available at `http://localhost:5173`.

### B. Production-Like Mode

This mode builds the optimized Vue application and serves it via Nginx, all within Docker containers. This is how the application would be deployed.

**To Run:** Execute the docker-compose command from the project root:
```bash
docker-compose up --build
```
**To Stop:** Press `Ctrl+C` or run `docker-compose down` from another terminal.

**What it does:**
1.  Builds the production frontend image as defined in `Dockerfile`.
2.  Starts the `frontend` service.
3.  Starts the `libretranslate` service.
4.  The application will be available at `http://localhost:8090`.