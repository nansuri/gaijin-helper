<script setup lang="ts">
import { ref, computed } from 'vue';

// Import SVG Icons
import WeatherNight from 'vue-material-design-icons/WeatherNight.vue';
import WhiteBalanceSunny from 'vue-material-design-icons/WhiteBalanceSunny.vue';

const props = defineProps<{
  modelValue: boolean; // Controls visibility of the modal
  theme: 'light' | 'dark';
  appMode: 'translation' | 'transcribeOnly';
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'update:theme', value: 'light' | 'dark'): void;
  (e: 'update:appMode', value: 'translation' | 'transcribeOnly'): void;
}>();

const localTheme = computed({
  get: () => props.theme,
  set: (value: 'light' | 'dark') => emit('update:theme', value),
});

const isTranslationMode = computed({
  get: () => props.appMode === 'translation',
  set: (value: boolean) => emit('update:appMode', value ? 'translation' : 'transcribeOnly'),
});

const toggleTheme = () => {
  localTheme.value = localTheme.value === 'light' ? 'dark' : 'light';
};

const closeSettings = () => {
  emit('update:modelValue', false);
};
</script>

<template>
  <div v-if="modelValue" class="settings-modal-overlay" @click.self="closeSettings">
    <div class="settings-modal-content">
      <h2 class="settings-title">Settings</h2>

      <div class="settings-section">
        <div class="setting-item">
          <span>Dark Mode</span>
          <button @click="toggleTheme" class="theme-toggle" title="Toggle Theme">
            <WeatherNight v-if="localTheme === 'light'" :size="24" />
            <WhiteBalanceSunny v-else :size="24" />
          </button>
        </div>
      </div>

      <div class="settings-section">
        <div class="setting-item">
          <span>Mode:</span>
          <div class="mode-switch-labels">
            <span>Transcribe Only</span>
            <label class="switch">
              <input type="checkbox" v-model="isTranslationMode">
              <span class="slider round"></span>
            </label>
            <span>Translation</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.settings-modal-content {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  min-width: 300px;
  max-width: 90%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
}

.settings-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  text-align: center;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  color: var(--text-primary);
}

.theme-toggle {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: transform 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.theme-toggle:hover {
  color: var(--accent-primary);
  transform: scale(1.1);
}

.mode-switch-labels {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mode-switch-labels span {
  font-size: 0.9rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 24px;
  margin: 0 0.5rem; /* Added margin for spacing */
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: var(--accent-primary);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--accent-primary);
}

input:checked + .slider:before {
  -webkit-transform: translateX(16px);
  -ms-transform: translateX(16px);
  transform: translateX(16px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
