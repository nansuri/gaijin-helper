<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  modelValue: boolean; // Controls visibility of the modal
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const closeUserModal = () => {
  emit('update:modelValue', false);
};

// Placeholder for register functionality
const registerUser = () => {
  alert('Register functionality coming soon!');
  closeUserModal(); // Close modal after action
};
</script>

<template>
  <div v-if="modelValue" class="user-modal-overlay" @click.self="closeUserModal">
    <div class="user-modal-content">
      <h2 class="user-modal-title">User Actions</h2>

      <div class="user-actions-section">
        <button @click="registerUser" class="register-button">Register</button>
        <!-- Future user management actions can go here -->
        <!-- <button class="login-button">Login</button> -->
        <!-- <button class="profile-button">View Profile</button> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-modal-overlay {
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

.user-modal-content {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  min-width: 280px;
  max-width: 90%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
}

.user-modal-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  text-align: center;
}

.user-actions-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.register-button {
  width: 100%;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  background-color: var(--accent-primary);
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  font-size: 1rem;
  box-shadow: 0 2px 5px var(--shadow-color);
  text-align: center;
}

.register-button:hover {
  background-color: var(--accent-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-color);
}
</style>
