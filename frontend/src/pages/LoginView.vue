<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const router = useRouter()
const auth = useAuthStore()

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    
    if (auth.isAdmin) {
      router.push('/dashboard/admin')
    } else if (auth.isOrganizer) {
      router.push('/dashboard/organizer')
    } else {
      router.push('/dashboard/user')
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Login gagal. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Welcome Back</h2>
      <p>Masuk ke akun TicketFlow Anda</p>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="error" class="error-alert">{{ error }}</div>
        
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="email" required placeholder="admin@example.com" />
        </div>
        
        <div class="form-group">
          <label>Password</label>
          <input type="password" v-model="password" required placeholder="••••••••" />
        </div>
        
        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? 'Loading...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.login-card {
  background: var(--card-bg);
  padding: 3rem;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

.login-card h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  background: -webkit-linear-gradient(45deg, #818cf8, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-card p {
  color: #94a3b8;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #cbd5e1;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: white;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #818cf8;
}

.error-alert {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.login-btn {
  width: 100%;
  padding: 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #4338ca;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
