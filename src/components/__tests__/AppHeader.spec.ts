import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppHeader from '@/components/AppHeader.vue';

describe('AppHeader.vue', () => {
  it('renders with default title and description', () => {
    const wrapper = mount(AppHeader);
    expect(wrapper.text()).toContain('Gaijin Helper');
    expect(wrapper.text()).toContain('Real-time Conversation Translator');
  });

  it('renders with custom title and description', () => {
    const wrapper = mount(AppHeader, {
      props: {
        title: 'Custom Title',
        description: 'Custom Description',
      },
    });
    expect(wrapper.text()).toContain('Custom Title');
    expect(wrapper.text()).toContain('Custom Description');
  });

  it('renders settings button', () => {
    const wrapper = mount(AppHeader);
    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(2); // Settings and Profile buttons
    expect(buttons[0].attributes('aria-label')).toBe('Open Settings');
  });

  it('renders profile button', () => {
    const wrapper = mount(AppHeader);
    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(2);
    expect(buttons[1].attributes('aria-label')).toBe('Open Profile');
  });

  it('emits settings-click event when settings button is clicked', async () => {
    const wrapper = mount(AppHeader);
    const settingsButton = wrapper.findAll('button')[0];
    await settingsButton.trigger('click');
    expect(wrapper.emitted('settings-click')).toBeTruthy();
    expect(wrapper.emitted('settings-click')).toHaveLength(1);
  });

  it('emits profile-click event when profile button is clicked', async () => {
    const wrapper = mount(AppHeader);
    const profileButton = wrapper.findAll('button')[1];
    await profileButton.trigger('click');
    expect(wrapper.emitted('profile-click')).toBeTruthy();
    expect(wrapper.emitted('profile-click')).toHaveLength(1);
  });

  it('renders translate icon', () => {
    const wrapper = mount(AppHeader);
    const svg = wrapper.find('svg');
    expect(svg.exists()).toBe(true);
  });

  it('has proper CSS classes', () => {
    const wrapper = mount(AppHeader);
    expect(wrapper.find('.app-header').exists()).toBe(true);
    expect(wrapper.find('.app-header__title-group').exists()).toBe(true);
    expect(wrapper.find('.app-header__controls').exists()).toBe(true);
    expect(wrapper.find('.app-header__title').exists()).toBe(true);
    expect(wrapper.find('.app-header__description').exists()).toBe(true);
  });

  it('renders multiple button clicks correctly', async () => {
    const wrapper = mount(AppHeader);
    const settingsButton = wrapper.findAll('button')[0];
    const profileButton = wrapper.findAll('button')[1];

    await settingsButton.trigger('click');
    await profileButton.trigger('click');
    await settingsButton.trigger('click');

    expect(wrapper.emitted('settings-click')).toHaveLength(2);
    expect(wrapper.emitted('profile-click')).toHaveLength(1);
  });
});
