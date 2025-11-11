export class View {
    constructor() {
        this.fromLanguage = document.getElementById('from-language');
        this.toLanguage = document.getElementById('to-language');
        this.recordBtn = document.getElementById('record-btn');
        this.speakBtn = document.getElementById('speak-btn');
        this.swapBtn = document.getElementById('swap-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.autoSpeak = document.getElementById('auto-speak');
        this.chatContainer = document.getElementById('chat-container');
        this.historyContainer = document.getElementById('history-container');
        this.clearHistoryBtn = document.getElementById('clear-history-btn');
        this.currentTranscriptionBubble = null;
    }

    // --- Event Binders ---
    bindRecordClick(handler) { this.recordBtn.addEventListener('click', handler); }
    bindSpeakClick(handler) { this.speakBtn.addEventListener('click', handler); }
    bindSwapClick(handler) { this.swapBtn.addEventListener('click', handler); }
    bindClearClick(handler) { this.clearBtn.addEventListener('click', handler); }
    bindClearHistoryClick(handler) { this.clearHistoryBtn.addEventListener('click', handler); }
    bindLanguageChange(handler) { this.fromLanguage.addEventListener('change', () => handler()); }

    // --- UI Updates ---
    updateRecordButton(isRecording) {
        this.recordBtn.classList.toggle('recording', isRecording);
        this.recordBtn.innerHTML = isRecording ? '<i class="fas fa-stop"></i>' : '<i class="fas fa-microphone"></i>';
    }

    handleTranscription(text, isFinal) {
        if (!this.currentTranscriptionBubble) {
            this.currentTranscriptionBubble = this.addMessage(text, 'transcription', this.fromLanguage.value);
        } else {
            this.currentTranscriptionBubble.innerText = text;
        }
        if (isFinal) this.currentTranscriptionBubble = null;
        this.scrollToBottom();
    }

    addMessage(text, type, lang) {
        const bubble = this._createElement('div', ['chat-bubble', type], { 'data-lang': lang }, text);
        this.chatContainer.appendChild(bubble);
        this.scrollToBottom();
        return bubble;
    }

    addTranslationMessage(text, lang) {
        const bubble = this.addMessage('', 'translation', lang);
        const spinner = this._createElement('div', ['spinner-border', 'spinner-border-sm']);
        bubble.appendChild(spinner);
        this.scrollToBottom();
        
        return (translatedText) => {
            bubble.innerText = translatedText;
        };
    }

    renderHistory(history, onItemClick) {
        this.historyContainer.innerHTML = '';
        if (history.length === 0) {
            this.historyContainer.innerHTML = '<p class="text-center text-muted">No history yet.</p>';
            return;
        }
        history.forEach(entry => {
            const item = this._createHistoryItemElement(entry, onItemClick);
            this.historyContainer.appendChild(item);
        });
    }

    clearChat() { this.chatContainer.innerHTML = ''; }
    scrollToBottom() { this.chatContainer.scrollTop = this.chatContainer.scrollHeight; }

    showToast(message) {
        const toastContainer = this._createElement('div', [], {
            style: 'position: fixed; bottom: 20px; right: 20px; z-index: 1050;'
        });
        const toast = this._createElement('div', ['toast', 'show']);
        toast.innerHTML = `
            <div class="toast-header"><strong class="me-auto">Notification</strong><button type="button" class="btn-close" data-bs-dismiss="toast"></button></div>
            <div class="toast-body">${message}</div>
        `;
        toastContainer.appendChild(toast);
        document.body.appendChild(toastContainer);

        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        toast.addEventListener('hidden.bs.toast', () => toastContainer.remove());
    }

    // --- Private Helper Methods ---
    _createHistoryItemElement(entry, onItemClick) {
        const item = this._createElement('div', ['history-item']);
        item.innerHTML = `
            <p class="mb-1 transcription-text">${entry.transcription}</p>
            <p class="mb-1 translation-text">${entry.translation}</p>
            <p class="mb-0 history-date">${new Date(entry.date).toLocaleString()}</p>
        `;
        item.addEventListener('click', () => onItemClick(entry));
        return item;
    }

    _createElement(tag, classes = [], attributes = {}, textContent = '') {
        const el = document.createElement(tag);
        if (classes.length) el.classList.add(...classes);
        for (const key in attributes) {
            el.setAttribute(key, attributes[key]);
        }
        if (textContent) el.textContent = textContent;
        return el;
    }
}
