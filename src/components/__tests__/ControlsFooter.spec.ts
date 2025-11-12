import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ControlsFooter from '../ControlsFooter.vue';

describe('ControlsFooter.vue', () => {
  it('renders language selectors', () => {
    const wrapper = mount(ControlsFooter, {
      props: {
        fromLanguage: 'en',
        toLanguage: 'ja',
        isListening: false,
        isSpeaking: false,
      },
    });

    const selects = wrapper.findAll('.language-select');
    expect(selects.length).toBe(2);
  });

  it('displays current language selections', () => {
    const wrapper = mount(ControlsFooter, {
      props: {
        fromLanguage: 'en',
        toLanguage: 'ja',
        isListening: false,
        isSpeaking: false,
      },
    });

    const selects = wrapper.findAll('.language-select');
    expect(selects[0].element.value).toBe('en');
    expect(selects[1].element.value).toBe('ja');
  });

  it('emits language-from event when source language changes', async () => {
    const wrapper = mount(ControlsFooter, {
      props: {
        fromLanguage: 'en',
        toLanguage: 'ja',
        isListening: false,
        isSpeaking: false,
      },
    });

    const fromSelect = wrapper.findAll('.language-select')[0];
    await fromSelect.setValue('id');
    
    expect(wrapper.emitted('language-from')).toBeTruthy();
    expect(wrapper.emitted('language-from')?.[0]).toEqual(['id']);
  });

  it('emits language-to event when target language changes', async () => {
    const wrapper = mount(ControlsFooter, {
      props: {
        fromLanguage: 'en',
        toLanguage: 'ja',
        isListening: false,
        isSpeaking: false,
      },
    });

    const toSelect = wrapper.findAll('.language-select')[1];
    await toSelect.setValue('id');
    
    expect(wrapper.emitted('language-to')).toBeTruthy();
    expect(wrapper.emitted('language-to')?.[0]).toEqual(['id']);
  });

  it('renders swap button', () => {
    const wrapper = mount(ControlsFooter, {
      props: {
        fromLanguage: 'en',
        toLanguage: 'ja',
        isListening: false,
        isSpeaking: false,
      },
    });

    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.some(btn => btn.attributes('aria-label') === 'Swap Languages')).toBe(true);
  });

  it('emits swap-languages event when swap button is clicked', async () => {
    const wrapper = mount(ControlsFooter, {
      props: {
        fromLanguage: 'en',
        toLanguage: 'ja',
        isListening: false,
        isSpeaking: false,
      },
    });

    const swapButton = wrapper.findAll('button').find(btn => btn.attributes('aria-label') === 'Swap Languages');
    await swapButton?.trigger('click');

    expect(wrapper.emitted('swap-languages')).toBeTruthy();
  });

  it('renders speak/stop button', () => {
    const wrapper = mount(ControlsFooter, {
      props: {
        fromLanguage: 'en',
        toLanguage: 'ja',
        isListening: false,
        isSpeaking: false,
      },
    });

    const buttons = wrapper.findAll('button');
    expect(buttons.some(btn => btn.attributes('aria-label')?.includes('Speak'))).toBe(true);
  });

  it('emits speak-click event when speak button is clicked', async () => {
    const wrapper = mount(ControlsFooter, {
      props: {
        fromLanguage: 'en',
        toLanguage: 'ja',
        isListening: false,
        isSpeaking: false,
      },
    });

    const speakButton = wrapper.findAll('button').find(btn => btn.attributes('aria-label')?.includes('Speak'));
    await speakButton?.trigger('click');

    expect(wrapper.emitted('speak-click')).toBeTruthy();
  });

  it('renders microphone button', () => {
    const wrapper = mount(ControlsFooter, {
      props: {
        fromLanguage: 'en',
        toLanguage: 'ja',
        isListening: false,
        isSpeaking: false,
      },
    });

    const micButton = wrapper.find('button[aria-label="Toggle Microphone"]');
    expect(micButton.exists()).toBe(true);
  });

  it('emits mic-click event when mic button is clicked', async () => {
    const wrapper = mount(ControlsFooter, {
      props: {
        fromLanguage: 'en',
        toLanguage: 'ja',
        isListening: false,
        isSpeaking: false,
      },
    });

    const micButton = wrapper.find('button[aria-label="Toggle Microphone"]');
    await micButton.trigger('click');

    expect(wrapper.emitted('mic-click')).toBeTruthy();
  });

  it('renders clear button', () => {
    const wrapper = mount(ControlsFooter, {
      props: {
        fromLanguage: 'en',
        toLanguage: 'ja',
        isListening: false,
        isSpeaking: false,
      },
    });

    const clearButton = wrapper.find('button[aria-label="Clear All Messages"]');
    expect(clearButton.exists()).toBe(true);
  });

  it('emits clear-click event when clear button is clicked', async () => {
    const wrapper = mount(ControlsFooter, {
      props: {
        fromLanguage: 'en',
        toLanguage: 'ja',
        isListening: false,
        isSpeaking: false,
      },
    });

    const clearButton = wrapper.find('button[aria-label="Clear All Messages"]');
    await clearButton.trigger('click');

    expect(wrapper.emitted('clear-click')).toBeTruthy();
  });

  it('applies recording class when isListening is true', () => {
    const wrapper = mount(ControlsFooter, {
      props: {
        fromLanguage: 'en',
        toLanguage: 'ja',
        isListening: true,
        isSpeaking: false,
      },
    });

    const micButton = wrapper.find('button[aria-label="Toggle Microphone"]');
    expect(micButton.classes()).toContain('btn--recording');
  });

  it('applies speaking class when isSpeaking is true', () => {
    const wrapper = mount(ControlsFooter, {
      props: {
        fromLanguage: 'en',
        toLanguage: 'ja',
        isListening: false,
        isSpeaking: true,
      },
    });

    const speakButton = wrapper.findAll('button').find(btn => btn.attributes('aria-label')?.includes('Speak'));
    expect(speakButton?.classes()).toContain('btn--speaking');
  });

  it('displays copyright notice', () => {
    const wrapper = mount(ControlsFooter, {
      props: {
        fromLanguage: 'en',
        toLanguage: 'ja',
        isListening: false,
        isSpeaking: false,
      },
    });

    expect(wrapper.text()).toContain('Copyright');
    expect(wrapper.text()).toContain('Nansuri');
    expect(wrapper.text()).toContain('2025');
  });

  it('has proper CSS classes', () => {
    const wrapper = mount(ControlsFooter, {
      props: {
        fromLanguage: 'en',
        toLanguage: 'ja',
        isListening: false,
        isSpeaking: false,
      },
    });

    expect(wrapper.find('.controls-footer').exists()).toBe(true);
    expect(wrapper.find('.language-controls').exists()).toBe(true);
    expect(wrapper.find('.main-controls').exists()).toBe(true);
    expect(wrapper.find('.copyright').exists()).toBe(true);
  });

  it('renders all language options in selectors', () => {
    const wrapper = mount(ControlsFooter, {
      props: {
        fromLanguage: 'en',
        toLanguage: 'ja',
        isListening: false,
        isSpeaking: false,
      },
    });

    const options = wrapper.findAll('option');
    const values = options.map(opt => opt.element.value);
    
    expect(values).toContain('en');
    expect(values).toContain('ja');
    expect(values).toContain('id');
  });
});
