<script setup>
import { ref, onMounted } from 'vue'

const isVisible = ref(true)

onMounted(() => {
  setTimeout(() => {
    isVisible.value = false
  }, 2000)
})
</script>

<template>
  <Transition name="fade">
    <div v-if="isVisible" class="splash-screen">
      <div class="logo-container">
        <h1 class="logo glow-text">TicketFlow</h1>
        <p class="tagline">Your Gateway to Amazing Experiences</p>
        <div class="loader"></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.splash-screen {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: var(--bg-dark);
  display: flex; justify-content: center; align-items: center;
  z-index: 99999;
  background-image: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.2), transparent 50%);
}
.logo-container { text-align: center; }
.logo { font-size: 4rem; margin: 0; color: white; }
.tagline { color: #94a3b8; font-size: 1.2rem; margin-top: 0.5rem; margin-bottom: 2rem; letter-spacing: 2px; }
.glow-text { text-shadow: 0 0 20px rgba(168, 85, 247, 0.8); }

.loader {
  width: 50px; height: 50px;
  border: 4px solid rgba(255,255,255,0.1);
  border-top-color: #a855f7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}
@keyframes spin { to { transform: rotate(360deg); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
