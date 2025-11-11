import { Presenter } from './presenter/Presenter.js';
import { View } from './view/View.js';
import { SpeechService } from './model/SpeechService.js';
import { TranslationService } from './model/TranslationService.js';
import { HistoryService } from './model/HistoryService.js';

document.addEventListener('DOMContentLoaded', () => {
    const view = new View();
    const model = {
        speech: new SpeechService(),
        translator: new TranslationService(),
        history: new HistoryService()
    };
    const presenter = new Presenter(model, view);
    presenter.init();
});
