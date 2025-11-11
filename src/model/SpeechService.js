export class SpeechService {
    constructor() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
        } else {
            this.recognition = null;
        }
        this.onResult = null;
        this.onError = null;
    }

    init(lang) {
        if (!this.recognition) return;
        this.recognition.lang = lang;
        this.recognition.onresult = (event) => {
            if (this.onResult) this.onResult(event);
        };
        this.recognition.onerror = (event) => {
            if (this.onError) this.onError(event);
        };
    }

    start() {
        if (this.recognition) this.recognition.start();
    }

    stop() {
        if (this.recognition) this.recognition.stop();
    }

    setLang(lang) {
        if (this.recognition) this.recognition.lang = lang;
    }

    isSupported() {
        return this.recognition !== null;
    }
}
