document.addEventListener('DOMContentLoaded', function() {
    const elems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(elems);
    M.AutoInit();
    app.init();
});

const app = {
    fromLanguage: document.getElementById('from-language'),
    toLanguage: document.getElementById('to-language'),
    recordBtn: document.getElementById('record-btn'),
    speakBtn: document.getElementById('speak-btn'),
    swapBtn: document.getElementById('swap-btn'),
    clearBtn: document.getElementById('clear-btn'),
    autoSpeak: document.getElementById('auto-speak'),
    transcription: document.getElementById('transcription'),
    translation: document.getElementById('translation'),
    historyContainer: document.getElementById('history-container'),
    clearHistoryBtn: document.getElementById('clear-history-btn'),
    listening: false,
    recognition: null,
    translationTimeout: null,
    history: [],

    init() {
        this.loadHistory();
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = this.fromLanguage.value;

            this.recognition.onresult = (event) => {
                let interim_transcript = '';
                let final_transcript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        final_transcript += event.results[i][0].transcript;
                    } else {
                        interim_transcript += event.results[i][0].transcript;
                    }
                }

                this.transcription.value = final_transcript + interim_transcript;
                M.textareaAutoResize(this.transcription);

                clearTimeout(this.translationTimeout);
                if (final_transcript) {
                    this.translationTimeout = setTimeout(() => {
                        this.translate(final_transcript, this.fromLanguage.value, this.toLanguage.value);
                    }, 500); // Wait for 500ms of inactivity before translating
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                M.toast({html: `Speech recognition error: ${event.error}`});
            };
        } else {
            M.toast({html: 'Your browser does not support the Web Speech API. Please use Google Chrome.'});
        }

        this.addEventListeners();
    },

    addEventListeners() {
        this.recordBtn.addEventListener('click', () => {
            if (!this.listening) {
                this.startListening();
            } else {
                this.stopListening();
            }
        });

        this.speakBtn.addEventListener('click', () => {
            const text = this.translation.value;
            if (text) {
                this.speak(text, this.toLanguage.value);
            }
        });

        this.swapBtn.addEventListener('click', () => {
            const fromSelect = M.FormSelect.getInstance(this.fromLanguage);
            const toSelect = M.FormSelect.getInstance(this.toLanguage);
            const fromVal = this.fromLanguage.value;
            const toVal = this.toLanguage.value;

            fromSelect.el.value = toVal;
            toSelect.el.value = fromVal;
            
            // Re-initialize the selects to reflect the new values
            M.FormSelect.init(fromSelect.el);
            M.FormSelect.init(toSelect.el);

            if (this.recognition) {
                this.recognition.lang = this.fromLanguage.value;
            }
        });

        this.clearBtn.addEventListener('click', () => {
            this.transcription.value = '';
            this.translation.value = '';
            M.textareaAutoResize(this.transcription);
            M.textareaAutoResize(this.translation);
        });

        this.clearHistoryBtn.addEventListener('click', () => {
            this.history = [];
            localStorage.removeItem('translationHistory');
            this.renderHistory();
            M.toast({html: 'History cleared!'});
        });

        this.fromLanguage.addEventListener('change', () => {
            if (this.recognition) {
                this.recognition.lang = this.fromLanguage.value;
            }
        });

        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const targetTextarea = document.getElementById(targetId);
                targetTextarea.select();
                document.execCommand('copy');
                M.toast({html: 'Copied to clipboard!'});
            });
        });
    },

    startListening() {
        if (this.recognition) {
            this.recognition.start();
            this.recordBtn.classList.add('recording');
            this.listening = true;
        }
    },

    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
            this.recordBtn.classList.remove('recording');
            this.listening = false;
        }
    },

    async translate(text, source, target) {
        try {
            // Note: This now uses a locally deployed LibreTranslate instance.
            // Make sure you have LibreTranslate running on http://localhost:5050
            const res = await fetch('http://localhost:5050/translate', {
                method: 'POST',
                body: JSON.stringify({
                    q: text,
                    source: source,
                    target: target,
                    format: 'text'
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            this.translation.value = data.translatedText;
            M.textareaAutoResize(this.translation);

            this.saveToHistory(text, data.translatedText, source, target);

            if (this.autoSpeak.checked) {
                this.speak(data.translatedText, target);
            }
        } catch (error) {
            console.error('Translation error:', error);
            this.translation.value = 'Error: Could not translate text.';
            M.toast({html: 'Error: Could not translate text. Please check your internet connection and try again.'});
        }
    },

    speak(text, lang) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        speechSynthesis.speak(utterance);
    },

    loadHistory() {
        const history = localStorage.getItem('translationHistory');
        if (history) {
            this.history = JSON.parse(history);
            this.renderHistory();
        }
    },

    saveToHistory(transcription, translation, from, to) {
        this.history.unshift({ transcription, translation, from, to, date: new Date() });
        if (this.history.length > 50) { // Keep the last 50 entries
            this.history.pop();
        }
        localStorage.setItem('translationHistory', JSON.stringify(this.history));
        this.renderHistory();
    },

    renderHistory() {
        this.historyContainer.innerHTML = '';
        if (this.history.length === 0) {
            this.historyContainer.innerHTML = '<li><a class="center-align">No history yet.</a></li>';
            return;
        }
        this.history.forEach(entry => {
            const item = document.createElement('li');
            item.innerHTML = `
                <a href="#!">
                    <span class="grey-text text-darken-2">${entry.transcription}</span><br>
                    <span class="blue-text text-darken-2">${entry.translation}</span>
                    <span class="grey-text" style="font-size: 0.8rem; display: block; margin-top: 5px;">
                        ${new Date(entry.date).toLocaleString()}
                    </span>
                </a>
            `;
            this.historyContainer.appendChild(item);
        });
    }
};
