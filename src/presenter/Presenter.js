export class Presenter {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.isListening = false;
        this.translationTimeout = null;
    }

    init() {
        if (!this.model.speech.isSupported()) {
            alert('Your browser does not support the Web Speech API. Please use Google Chrome.');
            return;
        }
        this.model.speech.init(this.view.fromLanguage.value);
        this.view.renderHistory(this.model.history.getHistory(), (entry) => this.onHistoryItemClick(entry));
        this._bindHandlers();
    }

    _bindHandlers() {
        this.view.bindRecordClick(() => this.onRecordClick());
        this.view.bindSwapClick(() => this.onSwapClick());
        this.view.bindClearClick(() => this.view.clearChat());
        this.view.bindClearHistoryClick(() => this.onClearHistoryClick());
        this.view.bindLanguageChange(() => this.onLanguageChange());
        this.view.bindSpeakClick(() => this.onSpeakClick());

        this.model.speech.onResult = (event) => this.onSpeechResult(event);
        this.model.speech.onError = (event) => this.view.showToast(`Speech recognition error: ${event.error}`);
    }

    onRecordClick() {
        this.isListening = !this.isListening;
        this.view.updateRecordButton(this.isListening);
        if (this.isListening) {
            this.model.speech.start();
        } else {
            this.model.speech.stop();
            this.view.currentTranscriptionBubble = null;
        }
    }

    onSwapClick() {
        const fromVal = this.view.fromLanguage.value;
        const toVal = this.view.toLanguage.value;
        this.view.fromLanguage.value = toVal;
        this.view.toLanguage.value = fromVal;
        this.onLanguageChange();
    }

    onLanguageChange() {
        this.model.speech.setLang(this.view.fromLanguage.value);
    }

    onClearHistoryClick() {
        this.model.history.clear();
        this.view.renderHistory(this.model.history.getHistory());
        this.view.showToast('History cleared!');
    }

    onHistoryItemClick(entry) {
        this.view.addMessage(entry.transcription, 'transcription', entry.from);
        this.view.addMessage(entry.translation, 'translation', entry.to);
    }

    onSpeechResult(event) {
        const { final_transcript, interim_transcript } = this._processSpeechEvent(event);
        this.view.handleTranscription(final_transcript + interim_transcript, final_transcript !== '');

        clearTimeout(this.translationTimeout);
        if (final_transcript) {
            this.translationTimeout = setTimeout(() => {
                this.translateText(final_transcript.trim());
            }, 800);
        }
    }

    async translateText(text) {
        const source = this.view.fromLanguage.value;
        const target = this.view.toLanguage.value;
        const updateBubble = this.view.addTranslationMessage(text, target);

        try {
            const data = await this.model.translator.translate(text, source, target);
            this._handleSuccessfulTranslation(text, data.translatedText, source, target, updateBubble);
        } catch (error) {
            this._handleFailedTranslation(error, updateBubble);
        }
    }

    onSpeakClick() {
        const lastTranslationBubble = this.view.chatContainer.querySelector('.chat-bubble.translation:last-child');
        if (lastTranslationBubble) {
            this.speak(lastTranslationBubble.innerText, this.view.toLanguage.value);
        }
    }

    speak(text, lang) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        speechSynthesis.speak(utterance);
    }

    // --- Private Helper Methods ---
    _processSpeechEvent(event) {
        let final_transcript = '';
        let interim_transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        return { final_transcript, interim_transcript };
    }

    _handleSuccessfulTranslation(text, translatedText, source, target, updateBubble) {
        updateBubble(translatedText);
        const newEntry = { transcription: text, translation: translatedText, from: source, to: target, date: new Date() };
        this.model.history.add(newEntry);
        this.view.renderHistory(this.model.history.getHistory(), (entry) => this.onHistoryItemClick(entry));

        if (this.view.autoSpeak.checked) {
            this.speak(translatedText, target);
        }
    }

    _handleFailedTranslation(error, updateBubble) {
        console.error(error);
        updateBubble('Error: Could not translate.');
        this.view.showToast('Error: Could not translate text.');
    }
}
