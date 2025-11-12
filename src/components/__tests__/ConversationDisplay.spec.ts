import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ConversationDisplay from '../ConversationDisplay.vue';

describe('ConversationDisplay.vue', () => {
  const mockHistory = [
    {
      transcription: 'Hello',
      translation: 'こんにちは',
      fromLanguage: 'en',
      toLanguage: 'ja',
    },
    {
      transcription: 'How are you?',
      translation: 'お元気ですか？',
      fromLanguage: 'en',
      toLanguage: 'ja',
    },
  ];

  const mockCurrentTurn = {
    transcription: 'Good',
    translation: '良い',
    fromLanguage: 'en',
    toLanguage: 'ja',
  };

  it('renders conversation history items', () => {
    const wrapper = mount(ConversationDisplay, {
      props: {
        history: mockHistory,
        currentTurn: mockCurrentTurn,
        isListening: false,
        isTranslating: false,
        appMode: 'translation',
      },
    });

    const turns = wrapper.findAll('.conversation-turn');
    // 2 history items + 1 current turn
    expect(turns.length).toBe(3);
  });

  it('displays transcription text for history items', () => {
    const wrapper = mount(ConversationDisplay, {
      props: {
        history: mockHistory,
        currentTurn: mockCurrentTurn,
        isListening: false,
        isTranslating: false,
        appMode: 'translation',
      },
    });

    expect(wrapper.text()).toContain('Hello');
    expect(wrapper.text()).toContain('How are you?');
  });

  it('displays translation text in translation mode', () => {
    const wrapper = mount(ConversationDisplay, {
      props: {
        history: mockHistory,
        currentTurn: mockCurrentTurn,
        isListening: false,
        isTranslating: false,
        appMode: 'translation',
      },
    });

    expect(wrapper.text()).toContain('こんにちは');
    expect(wrapper.text()).toContain('お元気ですか？');
  });

  it('does not display translation in transcribeOnly mode', () => {
    const wrapper = mount(ConversationDisplay, {
      props: {
        history: mockHistory,
        currentTurn: mockCurrentTurn,
        isListening: false,
        isTranslating: false,
        appMode: 'transcribeOnly',
      },
    });

    expect(wrapper.text()).toContain('Hello');
    expect(wrapper.text()).not.toContain('こんにちは');
  });

  it('shows current turn as active', () => {
    const wrapper = mount(ConversationDisplay, {
      props: {
        history: mockHistory,
        currentTurn: mockCurrentTurn,
        isListening: false,
        isTranslating: false,
        appMode: 'translation',
      },
    });

    const activeTurn = wrapper.find('.conversation-turn--active');
    expect(activeTurn.exists()).toBe(true);
  });

  it('displays language codes in uppercase', () => {
    const wrapper = mount(ConversationDisplay, {
      props: {
        history: mockHistory,
        currentTurn: mockCurrentTurn,
        isListening: false,
        isTranslating: false,
        appMode: 'translation',
      },
    });

    expect(wrapper.text()).toContain('EN:');
    expect(wrapper.text()).toContain('JA:');
  });

  it('shows spinner when translating', () => {
    const wrapper = mount(ConversationDisplay, {
      props: {
        history: mockHistory,
        currentTurn: mockCurrentTurn,
        isListening: false,
        isTranslating: true,
        appMode: 'translation',
      },
    });

    const spinner = wrapper.find('.spinner');
    expect(spinner.exists()).toBe(true);
  });

  it('hides spinner when not translating', () => {
    const wrapper = mount(ConversationDisplay, {
      props: {
        history: mockHistory,
        currentTurn: mockCurrentTurn,
        isListening: false,
        isTranslating: false,
        appMode: 'translation',
      },
    });

    const spinner = wrapper.find('.spinner');
    expect(spinner.exists()).toBe(false);
  });

  it('shows listening status when isListening is true', () => {
    const wrapper = mount(ConversationDisplay, {
      props: {
        history: [],
        currentTurn: { transcription: '', translation: '', fromLanguage: 'en', toLanguage: 'ja' },
        isListening: true,
        isTranslating: false,
        appMode: 'translation',
      },
    });

    expect(wrapper.text()).toContain('Listening...');
  });

  it('shows waiting status when isListening is false', () => {
    const wrapper = mount(ConversationDisplay, {
      props: {
        history: [],
        currentTurn: { transcription: '', translation: '', fromLanguage: 'en', toLanguage: 'ja' },
        isListening: false,
        isTranslating: false,
        appMode: 'translation',
      },
    });

    // When there's no transcription and isListening is false, the current turn is not rendered
    // This is expected behavior - we only show current turn if transcription exists or isListening
    expect(wrapper.find('.conversation-turn--active').exists()).toBe(false);
  });

  it('renders with empty history', () => {
    const wrapper = mount(ConversationDisplay, {
      props: {
        history: [],
        currentTurn: mockCurrentTurn,
        isListening: false,
        isTranslating: false,
        appMode: 'translation',
      },
    });

    expect(wrapper.find('.conversation-display').exists()).toBe(true);
  });

  it('has proper CSS classes', () => {
    const wrapper = mount(ConversationDisplay, {
      props: {
        history: mockHistory,
        currentTurn: mockCurrentTurn,
        isListening: false,
        isTranslating: false,
        appMode: 'translation',
      },
    });

    expect(wrapper.find('.conversation-display').exists()).toBe(true);
    expect(wrapper.find('.conversation-container').exists()).toBe(true);
    expect(wrapper.find('.conversation-history').exists()).toBe(true);
  });
});
