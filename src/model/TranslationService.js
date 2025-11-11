export class TranslationService {
    async translate(text, source, target) {
        if (!text) return { translatedText: '' };
        try {
            const res = await fetch('http://localhost:5050/translate', {
                method: 'POST',
                body: JSON.stringify({ q: text, source, target, format: 'text' }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return await res.json();
        } catch (error) {
            console.error('Translation error:', error);
            throw error;
        }
    }
}
