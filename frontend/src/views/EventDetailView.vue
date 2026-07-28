<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet marker icon issue
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const event = ref(null)
const loading = ref(true)

const selectedTicket = ref(null)
const quantity = ref(1)
const isCheckingOut = ref(false)

const banks = ref([])
const selectedBank = ref('')

const promoCode = ref('')
const promoMessage = ref('')
const promoApplied = ref(null)

onMounted(async () => {
  try {
    const eventRes = await axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000') + ''}/api/events/${route.params.id}`).catch(e => null)
    if (eventRes) {
      event.value = eventRes.data
      const banksRes = await axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000') + ''}/api/banks/organizer/${event.value.organizer_id}`).catch(e => null)
      if (banksRes) {
        banks.value = banksRes.data.filter(b => b.is_active)
        if (banks.value.length > 0) selectedBank.value = banks.value[0].bank_name
      }
    }
    
    loading.value = false
    
    await nextTick()
    if (event.value && document.getElementById('map-container')) {
      const lat = event.value.latitude || -6.200000;
      const lng = event.value.longitude || 106.816666;
      const map = L.map('map-container').setView([lat, lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b>${event.value.venue_name || 'Lokasi Event'}</b>`).openPopup();
    }

  } catch (error) {
    console.error('Error fetching data:', error)
    loading.value = false
  }
})

const buyTicket = (ticket) => {
  if (!auth.isAuthenticated) {
    alert('Silakan login terlebih dahulu untuk membeli tiket.')
    router.push('/login')
    return
  }
  selectedTicket.value = ticket
  quantity.value = 1
  promoCode.value = ''
  promoApplied.value = null
  promoMessage.value = ''
}

const validatePromo = async () => {
  if (!promoCode.value) return
  promoMessage.value = 'Mengecek promo...'
  try {
    const res = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/promos/validate', {
      code: promoCode.value,
      event_id: event.value.id
    })
    promoApplied.value = res.data.promo
    promoMessage.value = 'Promo berhasil digunakan!'
  } catch (error) {
    promoApplied.value = null
    promoMessage.value = error.response?.data?.message || 'Promo tidak valid.'
  }
}

const calculateDiscount = () => {
  if (!promoApplied.value || !selectedTicket.value) return 0;
  const subtotal = selectedTicket.value.price * quantity.value;
  if (promoApplied.value.discount_type === 'percentage') {
    return (subtotal * promoApplied.value.discount_value) / 100;
  }
  return Number(promoApplied.value.discount_value);
}

const confirmPurchase = async () => {
  if (!selectedTicket.value) return
  if (!selectedBank.value) {
    alert('Pilih bank tujuan transfer.');
    return;
  }
  
  isCheckingOut.value = true
  try {
    const payload = {
      items: [
        {
          ticket_category_id: selectedTicket.value.id,
          quantity: quantity.value,
          holder_name: auth.user.name,
          holder_email: auth.user.email
        }
      ],
      paymentMethod: selectedBank.value,
      promo_code_id: promoApplied.value ? promoApplied.value.id : null
    }
    
    await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/transactions/checkout', payload, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    
    alert('Checkout berhasil! Silakan upload bukti pembayaran di Dashboard.')
    selectedTicket.value = null
    router.push('/dashboard/user')
  } catch (error) {
    alert(error.response?.data?.message || 'Pembelian gagal.')
  } finally {
    isCheckingOut.value = false
  }
}
</script>

<template>
  <div class="event-detail-page">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat keajaiban event...</p>
    </div>
    
    <div v-else-if="event" class="detail-container">
      <button class="back-btn glass-btn" @click="router.back()">← Kembali</button>
      
      <!-- Parallax Hero -->
      <div class="hero-banner" :style="{ backgroundImage: `url(${event.banner_image || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop'})` }">
        <div class="hero-overlay glass-card">
          <span class="category-badge">{{ event.category?.name }}</span>
          <h1 class="glow-text">{{ event.title }}</h1>
          
          <div class="meta-info">
            <div class="meta-item">
              <span class="icon">📍</span>
              <div>
                <strong>Lokasi</strong>
                <p>{{ event.venue_name }}, {{ event.city }}</p>
              </div>
            </div>
            
            <div class="meta-item">
              <span class="icon">📅</span>
              <div>
                <strong>Waktu</strong>
                <p>{{ new Date(event.start_date).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="detail-body">
        <div class="description glass-card">
          <h2>📝 Deskripsi Event</h2>
          <p>{{ event.description }}</p>
          <div class="organizer-info">
            <span class="icon">👤</span>
            <div>
              <small>Diselenggarakan oleh</small>
              <p>{{ event.organizer?.name || 'Admin' }}</p>
            </div>
          </div>
          
          <h3 style="margin-top: 2rem; color: #a855f7;">Peta Lokasi</h3>
          <div id="map-container" class="map-container"></div>
        </div>
        
        <div class="tickets glass-card">
          <h2>🎟️ Pilih Tiket</h2>
          <div class="ticket-list">
            <div v-for="ticket in event.ticket_categories" :key="ticket.id" class="ticket-card" :class="{ 'sold-out': ticket.quota - ticket.sold <= 0 }">
              <div class="ticket-info">
                <h3>{{ ticket.name }}</h3>
                <div class="progress-bar">
                  <div class="progress" :style="{ width: `${((ticket.sold / ticket.quota) * 100)}%` }"></div>
                </div>
                <p>Sisa stok: <strong>{{ ticket.quota - ticket.sold }}</strong> / {{ ticket.quota }}</p>
              </div>
              <div class="ticket-action">
                <span class="price">Rp {{ parseFloat(ticket.price).toLocaleString('id-ID') }}</span>
                <button 
                  class="buy-btn" 
                  @click="buyTicket(ticket)" 
                  :disabled="ticket.quota - ticket.sold <= 0">
                  {{ ticket.quota - ticket.sold <= 0 ? 'Habis Terjual' : 'Beli Tiket' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="not-found glass-card">
      <h2>Event tidak ditemukan</h2>
      <button class="btn-primary" @click="router.push('/')">Kembali ke Beranda</button>
    </div>

    <!-- Glass Modal Checkout -->
    <Transition name="fade">
      <div v-if="selectedTicket" class="modal-overlay">
        <div class="modal-content glass-card">
          <h2>Konfirmasi Pembelian</h2>
          <div class="checkout-details">
            <div class="receipt-header">
              <h3>{{ event.title }}</h3>
              <p class="receipt-cat">{{ selectedTicket.name }}</p>
            </div>
            
            <div class="receipt-body">
              <div class="row">
                <span>Harga Satuan:</span>
                <span>Rp {{ parseFloat(selectedTicket.price).toLocaleString('id-ID') }}</span>
              </div>
              
              <div class="qty-control">
                <span>Jumlah:</span>
                <div class="qty-buttons">
                  <button class="btn-qty" @click="quantity > 1 ? quantity-- : null" :disabled="quantity <= 1">-</button>
                  <span class="qty-display">{{ quantity }}</span>
                  <button class="btn-qty" @click="quantity < (selectedTicket.quota - selectedTicket.sold) ? quantity++ : null" :disabled="quantity >= (selectedTicket.quota - selectedTicket.sold)">+</button>
                </div>
              </div>
              
              <div class="promo-section">
                <div class="promo-input-group">
                  <input type="text" v-model="promoCode" placeholder="Kode Promo" class="promo-input" />
                  <button class="btn-primary-small" @click="validatePromo">Gunakan</button>
                </div>
                <small :class="{'text-success': promoApplied, 'text-error': !promoApplied && promoMessage}">{{ promoMessage }}</small>
              </div>
              
              <div class="bank-section">
                <label>Metode Pembayaran (Transfer Bank):</label>
                <select v-model="selectedBank" class="bank-select">
                  <option v-for="bank in banks" :key="bank.id" :value="bank.bank_name">
                    {{ bank.bank_name }} - {{ bank.account_number }} (a.n {{ bank.account_name }})
                  </option>
                  <option v-if="banks.length === 0" value="MANUAL_TRANSFER">Manual Transfer (Default)</option>
                </select>
              </div>
              
              <hr />
              <div class="row" v-if="promoApplied">
                <span>Diskon:</span>
                <span class="text-success">- Rp {{ calculateDiscount().toLocaleString('id-ID') }}</span>
              </div>
              <div class="row total">
                <span>Total Bayar:</span>
                <span class="glow-text">Rp {{ Math.max(0, (parseFloat(selectedTicket.price) * quantity) - calculateDiscount()).toLocaleString('id-ID') }}</span>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" @click="selectedTicket = null" :disabled="isCheckingOut">Batal</button>
            <button class="btn-confirm pulse-btn" @click="confirmPurchase" :disabled="isCheckingOut">
              {{ isCheckingOut ? 'Memproses...' : 'Checkout 🚀' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.detail-container { max-width: 1100px; margin: 0 auto; padding-bottom: 4rem; }

.glass-btn {
  background: var(--btn-hover-bg); backdrop-filter: blur(5px);
  border: 1px solid var(--glass-border); color: var(--text-light);
  padding: 0.5rem 1rem; border-radius: 50px; cursor: pointer; transition: 0.3s;
  margin-bottom: 1.5rem;
}
.glass-btn:hover { background: var(--glass-border-hover); transform: translateX(-5px); }

/* Parallax Hero */
.hero-banner {
  width: 100%; height: 400px;
  background-size: cover; background-position: center; background-attachment: fixed;
  border-radius: 20px;
  position: relative;
  display: flex; align-items: flex-end;
  margin-bottom: 3rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}
.hero-overlay {
  width: calc(100% - 4rem); margin: 2rem;
  padding: 2rem;
  background: rgba(15, 23, 42, 0.75);
}
.category-badge {
  background: var(--primary-color); color: white;
  padding: 0.25rem 1rem; border-radius: 50px; font-weight: bold; text-transform: uppercase; font-size: 0.8rem;
}
.glow-text {
  font-size: 2.5rem; margin: 1rem 0;
  text-shadow: 0 0 15px rgba(168, 85, 247, 0.5);
}
.meta-info { display: flex; gap: 2rem; flex-wrap: wrap; }
.meta-item { display: flex; gap: 1rem; align-items: center; }
.meta-item .icon { font-size: 1.5rem; background: var(--btn-hover-bg); padding: 0.5rem; border-radius: 12px; }
.meta-item strong { color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; }
.meta-item p { margin: 0; font-weight: bold; font-size: 1.1rem; }

.detail-body { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media(min-width: 800px) { .detail-body { grid-template-columns: 1.5fr 1fr; } }

.description, .tickets { padding: 2rem; }
.description h2, .tickets h2 { margin-top: 0; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem; color: #a855f7; }
.description p { line-height: 1.8; color: var(--text-muted); font-size: 1.05rem; margin-bottom: 2rem; }
.organizer-info { display: flex; gap: 1rem; align-items: center; background: var(--input-bg); padding: 1rem; border-radius: 12px; border: 1px solid var(--glass-border); }
.organizer-info p { margin:0; font-weight: bold; color: var(--text-light); }

.map-container {
  height: 300px;
  width: 100%;
  margin-top: 1rem;
  border-radius: 12px;
  z-index: 1; /* Keep leaflet under modals */
  border: 1px solid var(--glass-border);
}

.ticket-list { display: flex; flex-direction: column; gap: 1rem; }
.ticket-card {
  background: var(--input-bg); border: 1px solid var(--glass-border);
  padding: 1.5rem; border-radius: 16px;
  transition: transform 0.3s, border-color 0.3s;
}
.ticket-card:hover:not(.sold-out) { transform: translateY(-3px); border-color: #a855f7; }
.ticket-card.sold-out { opacity: 0.6; filter: grayscale(1); cursor: not-allowed; }

.ticket-info h3 { margin: 0 0 1rem 0; font-size: 1.25rem; color: var(--text-light); }
.ticket-info p { color: var(--text-muted); }
.progress-bar { width: 100%; height: 6px; background: var(--glass-border); border-radius: 10px; margin-bottom: 0.5rem; overflow: hidden; }
.progress { height: 100%; background: linear-gradient(90deg, #6366f1, #a855f7); }

.ticket-action { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; }
.price { font-size: 1.4rem; font-weight: 800; color: #a855f7; }
.buy-btn { background: var(--primary-color); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 50px; font-weight: bold; cursor: pointer; transition: 0.3s; box-shadow: 0 5px 15px rgba(99, 102, 241, 0.4); }
.buy-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(99, 102, 241, 0.6); }

/* Modal Checkout */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 9999; padding: 1rem; }
.modal-content { padding: 2.5rem; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
.modal-content h2 { text-align: center; color: var(--text-light); margin-top: 0; margin-bottom: 2rem; }
.receipt-header { background: rgba(168, 85, 247, 0.2); padding: 1.5rem; border-radius: 12px 12px 0 0; text-align: center; border-bottom: 2px dashed var(--glass-border); }
.receipt-header h3 { margin:0 0 0.5rem 0; color: var(--text-light); }
.receipt-cat { margin:0; color: #a855f7; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
.receipt-body { background: var(--input-bg); padding: 1.5rem; border-radius: 0 0 12px 12px; }
.row { display: flex; justify-content: space-between; margin-bottom: 1rem; color: var(--text-muted); }
.row.total { font-size: 1.3rem; color: var(--text-light); font-weight: bold; margin-bottom: 0; margin-top: 1rem; }

.qty-control { display: flex; justify-content: space-between; align-items: center; margin: 1.5rem 0; }
.qty-buttons { display: flex; align-items: center; gap: 1rem; background: var(--card-bg); border-radius: 50px; padding: 0.25rem; border: 1px solid var(--glass-border); }
.btn-qty { width: 35px; height: 35px; border-radius: 50%; border: none; background: var(--btn-hover-bg); color: var(--text-light); font-size: 1.2rem; cursor: pointer; transition: 0.3s; }
.btn-qty:hover:not(:disabled) { background: #a855f7; }
.qty-display { font-weight: bold; font-size: 1.2rem; width: 20px; text-align: center; color: var(--text-light); }

.promo-section { margin-bottom: 1.5rem; }
.promo-input-group { display: flex; gap: 0.5rem; }
.promo-input { flex: 1; padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid var(--glass-border); background: var(--card-bg); color: var(--text-light); }
.btn-primary-small { background: #6366f1; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; }
.text-success { color: #10b981; }
.text-error { color: #ef4444; }

.bank-section { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
.bank-section label { color: var(--text-muted); font-size: 0.9rem; }
.bank-select { padding: 0.75rem; border-radius: 8px; border: 1px solid var(--glass-border); background: var(--card-bg); color: var(--text-light); }

.modal-actions { display: flex; gap: 1rem; margin-top: 2rem; }
.modal-actions button { flex: 1; padding: 1rem; border-radius: 50px; font-weight: bold; cursor: pointer; border: none; transition: 0.3s; }
.btn-cancel { background: transparent; border: 1px solid var(--glass-border); color: var(--text-light); }
.btn-cancel:hover { background: var(--btn-hover-bg); }
.btn-confirm { background: linear-gradient(45deg, #6366f1, #a855f7); color: white; }
.pulse-btn:hover { box-shadow: 0 0 20px rgba(168, 85, 247, 0.6); }

.loading-state, .not-found { text-align: center; padding: 5rem; }
.spinner { width: 50px; height: 50px; border: 5px solid var(--glass-border); border-top-color: #a855f7; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem auto; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
