<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const loading = ref(false)
const message = ref('')

const profile = ref({
  name: '',
  email: '',
  phone: ''
})

onMounted(() => {
  if (auth.user) {
    profile.value.name = auth.user.name
    profile.value.email = auth.user.email
    profile.value.phone = auth.user.phone || ''
  }
})

const saveProfile = async () => {
  loading.value = true
  message.value = ''
  try {
    const res = await axios.put((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/profile', {
      name: profile.value.name,
      phone: profile.value.phone
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    message.value = res.data.message
    // Update store
    auth.user.name = res.data.user.name
    auth.user.phone = res.data.user.phone
  } catch (error) {
    message.value = 'Gagal menyimpan profil.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="profile-page">
    <div class="header">
      <h1 class="glow-text">Pengaturan Profil 👤</h1>
      <p>Kelola data diri Anda</p>
    </div>

    <div class="profile-container glass-card">
      <div class="avatar-section">
        <div class="avatar">{{ profile.name.charAt(0).toUpperCase() }}</div>
        <p class="role-badge">{{ auth.user?.role }}</p>
      </div>

      <form @submit.prevent="saveProfile" class="profile-form">
        <div v-if="message" class="alert">{{ message }}</div>
        
        <div class="form-group">
          <label>Email (Tidak bisa diubah)</label>
          <input type="email" v-model="profile.email" disabled class="disabled-input" />
        </div>
        
        <div class="form-group">
          <label>Nama Lengkap</label>
          <input type="text" v-model="profile.name" required />
        </div>
        
        <div class="form-group">
          <label>Nomor Telepon</label>
          <input type="tel" v-model="profile.phone" placeholder="08123456789" />
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.profile-page { max-width: 600px; margin: 0 auto; padding: 2rem 0; }
.header { text-align: center; margin-bottom: 3rem; }
.glow-text { color: var(--text-light); text-shadow: 0 0 15px rgba(168, 85, 247, 0.8); margin: 0; font-size: 2.5rem; }
.header p { color: var(--text-muted); }

.profile-container { padding: 3rem; border-radius: 20px; }

.avatar-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 2rem; }
.avatar { width: 100px; height: 100px; background: linear-gradient(45deg, #6366f1, #a855f7); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: bold; color: white; margin-bottom: 1rem; box-shadow: 0 10px 20px rgba(168, 85, 247, 0.3); }
.role-badge { background: var(--btn-hover-bg); padding: 0.25rem 1rem; border-radius: 50px; text-transform: uppercase; font-size: 0.8rem; font-weight: bold; margin: 0; }

.alert { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid #4ade80; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: center; }

.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.5rem; color: var(--text-muted); font-weight: 500; }
.form-group input { width: 100%; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--glass-border); background: var(--input-bg); color: var(--text-light); transition: 0.3s; box-sizing: border-box; }
.form-group input:focus { outline: none; border-color: #a855f7; box-shadow: 0 0 10px rgba(168, 85, 247, 0.2); }
.disabled-input { opacity: 0.5; cursor: not-allowed; }

.btn-primary { width: 100%; background: linear-gradient(45deg, #6366f1, #a855f7); color: white; border: none; padding: 1rem; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.3s; margin-top: 1rem; }
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(168, 85, 247, 0.4); }
</style>
