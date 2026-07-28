<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const events = ref([])
const loading = ref(true)
const searchQuery = ref('')
const router = useRouter()
const showPromo = ref(true)
const showSmallPromo = ref(true)
const favoritesMap = ref({}) // event_id -> boolean

// Debounce for search
let searchTimeout

const fetchEvents = async (search = '') => {
  loading.value = true
  try {
    const url = search 
      ? `${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000') + ''}/api/events?search=${encodeURIComponent(search)}` 
      : (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/events'
    const response = await axios.get(url)
    events.value = response.data
  } catch (error) {
    console.error('Error fetching events:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEvents()
  if (auth.isAuthenticated && auth.role === 'user') {
    fetchFavorites()
  }
  
  // Auto-close main promo after 5 seconds
  setTimeout(() => {
    showPromo.value = false
  }, 5000)
})

const fetchFavorites = async () => {
  try {
    const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/favorites', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    const map = {}
    res.data.forEach(f => { map[f.event_id] = true })
    favoritesMap.value = map
  } catch (error) {
    console.error('Failed to fetch favorites', error)
  }
}

const toggleFavorite = async (event, eventId) => {
  event.stopPropagation()
  if (!auth.isAuthenticated) {
    router.push('/login')
    return
  }
  try {
    const res = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/favorites/toggle', { event_id: eventId }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    favoritesMap.value[eventId] = res.data.isFavorite
  } catch (error) {
    console.error('Failed to toggle favorite', error)
  }
}

watch(searchQuery, (newValue) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchEvents(newValue)
  }, 500) // 500ms debounce
})

const goToEvent = (id) => {
  router.push(`/events/${id}`)
}
</script>

<template>
  <div class="home">
    <!-- Promo Popup -->
    <div v-if="showPromo" class="promo-overlay" @click.self="showPromo = false">
      <div class="promo-content">
        <button class="close-promo" @click="showPromo = false">&times;</button>
        <div class="promo-body" @click="window.open('https://naufalarsyaputrapradana.github.io/other-project', '_blank')">
          <span class="promo-badge">Portofolio Lainnya</span>
          <h2>Cek Project Keren Saya Lainnya!</h2>
          <p>Kunjungi website portofolio saya untuk melihat karya-karya hebat lainnya yang pernah saya bangun.</p>
          <a href="https://naufalarsyaputrapradana.github.io/other-project" target="_blank" class="promo-btn">Lihat Sekarang 🚀</a>
        </div>
      </div>
    </div>

    <!-- Small Corner Promo -->
    <div v-if="showSmallPromo" class="small-promo">
      <button class="close-small-promo" @click="showSmallPromo = false">&times;</button>
      <div class="small-promo-content" @click="window.open('https://naufalarsyaputrapradana.github.io/other-project', '_blank')">
        <div class="small-promo-icon">✨</div>
        <div>
          <h4>Project Lainnya</h4>
          <p>Cek portofolio saya!</p>
        </div>
      </div>
    </div>

    <section class="hero">
      <h1>Discover Amazing Events</h1>
      <p>Book your tickets now for the best concerts, seminars, and more.</p>
      
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Cari event berdasarkan judul, lokasi, atau kota..." 
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="feature-card glass-card">
        <div class="feature-icon">⚡</div>
        <h3>Booking Cepat</h3>
        <p>Proses pembelian tiket instan, tanpa antre panjang.</p>
      </div>
      <div class="feature-card glass-card">
        <div class="feature-icon">🔒</div>
        <h3>Pembayaran Aman</h3>
        <p>Transaksi dijamin aman dengan berbagai metode pembayaran.</p>
      </div>
      <div class="feature-card glass-card">
        <div class="feature-icon">🎉</div>
        <h3>Event Terbaik</h3>
        <p>Dapatkan akses ke konser, seminar, dan acara eksklusif.</p>
      </div>
    </section>

    <section class="events-section">
      <h2 class="section-title">Upcoming Events</h2>
      
      <!-- Skeleton Loaders -->
      <div v-if="loading" class="event-grid">
        <div v-for="n in 6" :key="n" class="event-card skeleton">
          <div class="skeleton-image"></div>
          <div class="skeleton-content">
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text short"></div>
          </div>
        </div>
      </div>
      
      <div v-else-if="events.length === 0" class="empty-state">
        <p>Tidak ada event yang sesuai dengan pencarian Anda.</p>
      </div>
      
      <div v-else class="event-grid">
        <div v-for="event in events" :key="event.id" class="event-card" @click="goToEvent(event.id)">
          <div class="event-image">
            <img :src="event.banner_image || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800&auto=format&fit=crop'" alt="Event image" />
            <span class="category-badge">{{ event.category?.name || 'Uncategorized' }}</span>
            <button class="fav-btn" :class="{ active: favoritesMap[event.id] }" @click="(e) => toggleFavorite(e, event.id)">❤️</button>
          </div>
          <div class="event-content">
            <h3>{{ event.title }}</h3>
            <p class="location">📍 {{ event.venue_name || event.city }}</p>
            <p class="date">📅 {{ new Date(event.start_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
            <p class="price-range" v-if="event.ticket_categories && event.ticket_categories.length > 0">
              Mulai dari Rp {{ Math.min(...event.ticket_categories.map(t => parseFloat(t.price))).toLocaleString('id-ID') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA / Newsletter Section -->
    <section class="cta-section">
      <div class="cta-content glass-card">
        <h2>Jangan Lewatkan Event Seru!</h2>
        <p>Berlangganan newsletter kami untuk mendapatkan info terbaru tentang konser dan penawaran eksklusif.</p>
        <div class="cta-form">
          <input type="email" placeholder="Masukkan email Anda..." class="cta-input" />
          <button class="cta-btn">Berlangganan</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(15, 23, 42, 0) 100%);
  border-radius: 20px;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: -webkit-linear-gradient(45deg, #818cf8, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero p {
  font-size: 1.2rem;
  color: var(--text-muted);
  max-width: 600px;
  margin: 0 auto 2rem auto;
}

.search-bar {
  max-width: 600px;
  margin: 0 auto;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 1rem 1.5rem 1rem 3rem;
  border-radius: 50px;
  border: 1px solid var(--glass-border);
  background: var(--input-bg);
  color: var(--text-light);
  font-size: 1.1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #818cf8;
}

.search-icon {
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

/* Features Section */
.features-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
  padding: 0 1rem;
}
.feature-card {
  text-align: center;
  padding: 2.5rem 1.5rem;
  border-radius: 20px;
  background: var(--card-bg);
  border: 1px solid var(--glass-border);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.5);
}
.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: var(--btn-hover-bg);
  display: inline-block;
  padding: 1rem;
  border-radius: 50%;
}
.feature-card h3 {
  font-size: 1.5rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}
.feature-card p {
  color: var(--text-muted);
  line-height: 1.6;
}

.section-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-title::after {
  content: "";
  height: 2px;
  flex: 1;
  background: linear-gradient(90deg, rgba(79,70,229,0.5) 0%, rgba(255,255,255,0) 100%);
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.event-card {
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid var(--glass-border);
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4);
  border-color: rgba(79, 70, 229, 0.5);
}

.event-image {
  position: relative;
  height: 200px;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.event-card:hover .event-image img {
  transform: scale(1.05);
}

.category-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--input-bg);
  backdrop-filter: blur(4px);
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--primary-color);
}

.fav-btn {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(0,0,0,0.5);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.3s;
  backdrop-filter: blur(5px);
  filter: grayscale(100%);
}
.fav-btn:hover {
  transform: scale(1.1);
  filter: grayscale(0%);
}
.fav-btn.active {
  filter: grayscale(0%);
  color: #ef4444;
}

.event-content {
  padding: 1.5rem;
}

.event-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  line-height: 1.4;
}

.location, .date {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.price-range {
  margin-top: 1rem;
  font-weight: 700;
  color: #818cf8;
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: var(--text-muted);
  font-size: 1.2rem;
}

/* CTA Section */
.cta-section {
  margin-top: 4rem;
  margin-bottom: 2rem;
}
.cta-content {
  text-align: center;
  padding: 4rem 2rem;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border: 1px solid var(--glass-border);
}
.cta-content h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: -webkit-linear-gradient(45deg, #818cf8, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.cta-content p {
  color: var(--text-muted);
  font-size: 1.2rem;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
.cta-form {
  display: flex;
  max-width: 500px;
  margin: 0 auto;
  gap: 1rem;
}
.cta-input {
  flex: 1;
  padding: 1rem 1.5rem;
  border-radius: 50px;
  border: 1px solid var(--glass-border);
  background: var(--input-bg);
  color: var(--text-light);
  font-size: 1rem;
  transition: border-color 0.3s;
}
.cta-input:focus {
  outline: none;
  border-color: #818cf8;
}
.cta-btn {
  background: linear-gradient(45deg, #6366f1, #a855f7);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}
.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(168, 85, 247, 0.3);
}
@media (max-width: 600px) {
  .cta-form {
    flex-direction: column;
  }
}

/* Skeleton Loading Animation */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton {
  cursor: default;
}
.skeleton:hover {
  transform: none;
  box-shadow: none;
  border-color: rgba(255,255,255,0.05);
}
.skeleton-image {
  height: 200px;
  background: #334155;
  background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
}
.skeleton-content {
  padding: 1.5rem;
}
.skeleton-title {
  height: 24px;
  width: 80%;
  margin-bottom: 1rem;
  border-radius: 4px;
  background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
}
.skeleton-text {
  height: 16px;
  width: 100%;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
}
.skeleton-text.short {
  width: 60%;
}

/* Promo Popup Styles */
.promo-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 1rem;
}
.promo-content {
  background: var(--card-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  position: relative;
  box-shadow: var(--glass-shadow);
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.close-promo {
  position: absolute;
  top: 15px; right: 15px;
  background: var(--btn-hover-bg);
  border: none;
  color: var(--text-light);
  width: 30px; height: 30px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex; justify-content: center; align-items: center;
  transition: background 0.3s;
}
.close-promo:hover {
  background: rgba(239, 68, 68, 0.8);
}
.promo-body {
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
}
.promo-badge {
  display: inline-block;
  background: rgba(192, 132, 252, 0.2);
  color: #c084fc;
  padding: 0.25rem 1rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-transform: uppercase;
}
.promo-body h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  background: -webkit-linear-gradient(45deg, #818cf8, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.promo-body p {
  color: var(--text-muted);
  margin-bottom: 2rem;
  line-height: 1.6;
}
.promo-btn {
  display: inline-block;
  background: #818cf8;
  color: white;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: bold;
  font-size: 1.1rem;
  transition: transform 0.3s, box-shadow 0.3s;
}
.promo-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(129, 140, 248, 0.4);
}

@keyframes popIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Small Promo Styles */
.small-promo {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: var(--card-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  z-index: 9998;
  padding: 1rem;
  width: 250px;
  animation: slideInBottom 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.small-promo-content {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.small-promo-icon {
  font-size: 2rem;
  background: -webkit-linear-gradient(45deg, #818cf8, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.small-promo-content h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  color: var(--text-light);
}
.small-promo-content p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}
.close-small-promo {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  transition: transform 0.2s;
}
.close-small-promo:hover {
  transform: scale(1.1);
}

@keyframes slideInBottom {
  0% { transform: translateY(100px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
</style>
