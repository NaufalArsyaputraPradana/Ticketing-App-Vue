<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const isLoading = ref(false)
const isSent = ref(false)

const handleReset = () => {
  isLoading.value = true
  // Mock sending email
  setTimeout(() => {
    isLoading.value = false
    isSent.value = true
  }, 1500)
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card glass-card">
      <div class="text-center">
        <h1 class="glow-text">Lupa Password?</h1>
        <p class="subtitle">Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi.</p>
      </div>

      <div v-if="isSent" class="success-message">
        <div class="icon">✉️</div>
        <h3>Tautan Terkirim!</h3>
        <p>Silakan periksa kotak masuk email Anda ({{ email }}).</p>
        <button class="btn-outline mt-4" @click="router.push('/login')">Kembali ke Login</button>
      </div>

      <form v-else @submit.prevent="handleReset" class="auth-form">
        <div class="form-group">
          <label>Alamat Email</label>
          <input type="email" v-model="email" required placeholder="nama@email.com" />
        </div>
        
        <button type="submit" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Mengirim...' : 'Kirim Tautan Reset' }}
        </button>
      </form>

      <div v-if="!isSent" class="auth-links text-center">
        <p>Ingat password Anda? <router-link to="/login">Login di sini</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 2rem;
}
.auth-card {
  width: 100%; max-width: 450px;
  padding: 3rem 2rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}
.text-center { text-align: center; }
.glow-text { font-size: 2rem; margin: 0 0 0.5rem 0; color: white; text-shadow: 0 0 15px rgba(168, 85, 247, 0.5); }
.subtitle { color: var(--text-muted); margin-bottom: 2rem; line-height: 1.5; }

.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #cbd5e1; font-weight: 500; }
.form-group input {
  width: 100%; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--glass-border);
  background: var(--input-bg); color: var(--text-light); transition: 0.3s; box-sizing: border-box;
}
.form-group input:focus { outline: none; border-color: #a855f7; background: rgba(0,0,0,0.4); box-shadow: 0 0 10px rgba(168, 85, 247, 0.2); }

.btn-primary { width: 100%; background: linear-gradient(45deg, #6366f1, #a855f7); color: white; border: none; padding: 1rem; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.3s; }
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(168, 85, 247, 0.4); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

.auth-links { margin-top: 2rem; }

.success-message { text-align: center; padding: 2rem 0; }
.success-message .icon { font-size: 4rem; margin-bottom: 1rem; }
.success-message h3 { color: #4ade80; margin: 0 0 0.5rem 0; }
.btn-outline { width: 100%; background: transparent; border: 1px solid #a855f7; color: #a855f7; padding: 0.75rem; border-radius: 8px; cursor: pointer; transition: 0.3s; }
.btn-outline:hover { background: #a855f7; color: white; }
.mt-4 { margin-top: 1rem; }
</style>
