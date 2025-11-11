export class HistoryService {
    constructor(maxSize = 50) {
        this.maxSize = maxSize;
        this.history = this.load();
    }

    load() {
        const history = localStorage.getItem('translationHistory');
        return history ? JSON.parse(history) : [];
    }

    getHistory() {
        return this.history;
    }

    add(entry) {
        this.history.unshift(entry);
        if (this.history.length > this.maxSize) {
            this.history.pop();
        }
        this.save();
    }

    save() {
        localStorage.setItem('translationHistory', JSON.stringify(this.history));
    }

    clear() {
        this.history = [];
        localStorage.removeItem('translationHistory');
    }
}
