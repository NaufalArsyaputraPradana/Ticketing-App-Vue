<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const favorites = ref([])
const loading = ref(true)

onMounted(async () => {
  if (!auth.isAuthenticated) {
    router.push('/login')
    return
  }
  fetchFavorites()
})

const fetchFavorites = async () => {
  try {
    const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/favorites', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    favorites.value = res.data.map(f => f.event)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const toggleFavorite = async (event) => {
  try {
    await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/favorites/toggle', { event_id: event.id }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    fetchFavorites() // Refresh list
  } catch (error) {
    console.error('Failed to toggle favorite', error)
  }
}
</script>

<template>
  <div class="favorites-page">
    <div class="header">
      <h1 class="glow-text">Event Favorit Saya ❤️</h1>
      <p>Koleksi event yang Anda sukai</p>
    </div>

    <div v-if="loading" class="loading-state">Memuat favorit...</div>
    <div v-else-if="favorites.length === 0" class="empty-state glass-card">
      <div class="icon">💔</div>
      <h3>Belum ada event favorit</h3>
      <p>Jelajahi event dan tambahkan ke wishlist Anda!</p>
      <button class="btn-primary" @click="router.push('/')">Cari Event</button>
    </div>
    <div v-else class="event-grid">
      <div v-for="event in favorites" :key="event.id" class="event-card glass-card">
        <div class="image-wrapper">
          <img :src="event.banner_image || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600'" :alt="event.title">
          <button class="fav-btn active" @click="toggleFavorite(event)">❤️</button>
          <span class="category-badge">{{ event.category?.name }}</span>
        </div>
        <div class="event-content">
          <h3>{{ event.title }}</h3>
          <p class="date">📅 {{ new Date(event.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
          <p class="venue">📍 {{ event.venue_name }}, {{ event.city }}</p>
          <button class="btn-detail" @click="router.push(`/event/${event.id}`)">Lihat Detail</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.favorites-page { padding: 2rem 0; }
.header { text-align: center; margin-bottom: 3rem; }
.glow-text { color: var(--text-light); text-shadow: 0 0 15px rgba(239, 68, 68, 0.8); margin: 0; font-size: 2.5rem; }
.header p { color: var(--text-muted); }

.loading-state, .empty-state { text-align: center; padding: 4rem; color: var(--text-muted); }
.empty-state { border-radius: 20px; max-width: 500px; margin: 0 auto; }
.empty-state .icon { font-size: 4rem; margin-bottom: 1rem; }
.btn-primary { background: linear-gradient(45deg, #6366f1, #a855f7); color: white; border: none; padding: 0.75rem 2rem; border-radius: 50px; font-weight: bold; cursor: pointer; margin-top: 1rem; }

.event-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
.event-card { border-radius: 16px; overflow: hidden; transition: transform 0.3s; position: relative; }
.event-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(168, 85, 247, 0.2); }
.image-wrapper { height: 200px; position: relative; overflow: hidden; }
.image-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.event-card:hover .image-wrapper img { transform: scale(1.05); }

.fav-btn { position: absolute; top: 1rem; right: 1rem; background: rgba(0,0,0,0.5); border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; backdrop-filter: blur(5px); }
.fav-btn:hover { transform: scale(1.1); }
.fav-btn.active { color: #ef4444; }

.category-badge { position: absolute; top: 1rem; left: 1rem; background: var(--primary-color); color: white; padding: 0.25rem 1rem; border-radius: 50px; font-size: 0.8rem; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }

.event-content { padding: 1.5rem; }
.event-content h3 { margin: 0 0 1rem 0; font-size: 1.2rem; color: var(--text-light); line-height: 1.4; }
.date, .venue { margin: 0 0 0.5rem 0; color: var(--text-muted); font-size: 0.9rem; }
.btn-detail { width: 100%; background: var(--btn-hover-bg); color: var(--text-light); border: 1px solid var(--glass-border); padding: 0.75rem; border-radius: 8px; margin-top: 1rem; cursor: pointer; transition: 0.3s; font-weight: bold; }
.btn-detail:hover { background: #a855f7; border-color: #a855f7; }
</style>
