<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import axios from 'axios'
import * as XLSX from 'xlsx'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useToast } from 'vue-toastification'
import { useRoute, useRouter } from 'vue-router'

const auth = useAuthStore()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const events = ref([])
const loading = ref(true)

const activeMenu = computed({
  get: () => route.query.tab || 'dashboard',
  set: (val) => router.replace({ query: { tab: val } })
})

let html5QrcodeScanner = null

watch(() => route.query.tab, (newTab, oldTab) => {
  if (newTab === 'scanner' && oldTab !== 'scanner') {
    setTimeout(() => {
      if (!document.getElementById('reader')) return;
      html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false
      )
      html5QrcodeScanner.render(onScanSuccess, onScanFailure)
    }, 300)
  } else if (oldTab === 'scanner' && newTab !== 'scanner') {
    if (html5QrcodeScanner) {
      html5QrcodeScanner.clear().catch(e => console.error(e))
      html5QrcodeScanner = null
    }
  }
})

const isCreatingEvent = ref(false)
const isAddingTicket = ref(false)
const isAddingPromo = ref(false)
const selectedEventId = ref(null)

const promos = ref([])
const banks = ref([])
const transactions = ref([])

const newEvent = ref({
  title: '', description: '', venue_name: '', city: '',
  start_date: '', end_date: '', banner_image: '', category_id: 1
})
const imageFile = ref(null)

const newTicket = ref({ name: '', price: 0, quota: 100, description: '' })
const newPromo = ref({ code: '', discount_type: 'percentage', discount_value: 0, valid_until: '', usage_limit: 100, event_id: '' })
const newBank = ref({ bank_name: '', account_number: '', account_name: '', is_active: true })

onMounted(async () => {
  fetchEvents()
  fetchPromos()
  fetchBanks()
  fetchTransactions()
})

onUnmounted(() => {
  if (html5QrcodeScanner) {
    html5QrcodeScanner.clear().catch(e => console.error(e))
  }
})

const fetchEvents = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/events/eo/my-events', {
      headers: { Authorization: `Bearer ${token}` }
    })
    events.value = response.data
  } catch (error) {
    console.error('Failed to fetch events', error)
  } finally {
    loading.value = false
  }
}

const fetchPromos = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/promos', {
      headers: { Authorization: `Bearer ${token}` }
    })
    promos.value = response.data
  } catch (error) {
    console.error('Failed to fetch promos', error)
  }
}

const fetchBanks = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/banks/my-banks', {
      headers: { Authorization: `Bearer ${token}` }
    })
    banks.value = response.data
  } catch (error) {
    console.error('Failed to fetch banks', error)
  }
}

const fetchTransactions = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/transactions/all', {
      headers: { Authorization: `Bearer ${token}` }
    })
    transactions.value = response.data
  } catch (error) {
    console.error('Failed to fetch transactions', error)
  }
}

const handleFileChange = (e) => {
  imageFile.value = e.target.files[0]
}

const submitEvent = async () => {
  try {
    const token = localStorage.getItem('token')
    
    const formData = new FormData()
    formData.append('title', newEvent.value.title)
    formData.append('description', newEvent.value.description)
    formData.append('venue_name', newEvent.value.venue_name)
    formData.append('city', newEvent.value.city)
    formData.append('start_date', newEvent.value.start_date)
    formData.append('end_date', newEvent.value.end_date)
    formData.append('category_id', newEvent.value.category_id)
    
    if (imageFile.value) {
      formData.append('banner_image', imageFile.value)
    } else {
      formData.append('banner_image', newEvent.value.banner_image)
    }

    await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/events/eo/create', formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    toast.success('Event berhasil dibuat!')
    isCreatingEvent.value = false
    newEvent.value = { title: '', description: '', venue_name: '', city: '', start_date: '', end_date: '', banner_image: '', category_id: 1 }
    imageFile.value = null
    fetchEvents()
  } catch (error) {
    toast.error('Gagal membuat event.')
  }
}

const openAddTicket = (eventId) => {
  selectedEventId.value = eventId
  isAddingTicket.value = true
}

const submitTicket = async () => {
  try {
    const token = localStorage.getItem('token')
    await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000') + ''}/api/events/eo/${selectedEventId.value}/tickets`, newTicket.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    toast.success('Kategori tiket berhasil ditambahkan!')
    isAddingTicket.value = false
    newTicket.value = { name: '', price: 0, quota: 100, description: '' }
    fetchEvents()
  } catch (error) {
    toast.error('Gagal menambahkan tiket')
  }
}

const submitPromo = async () => {
  try {
    const token = localStorage.getItem('token')
    await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/promos', newPromo.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    toast.success('Kode promo berhasil dibuat!')
    isAddingPromo.value = false
    newPromo.value = { code: '', discount_type: 'percentage', discount_value: 0, valid_until: '', usage_limit: 100, event_id: '' }
    fetchPromos()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Gagal membuat promo')
  }
}

const addBank = async () => {
  try {
    const token = localStorage.getItem('token')
    await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/banks', newBank.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    toast.success('Rekening Bank berhasil ditambahkan')
    newBank.value = { bank_name: '', account_number: '', account_name: '', is_active: true }
    fetchBanks()
  } catch (error) {
    toast.error('Gagal menambah rekening bank')
  }
}

const deleteBank = async (id) => {
  if (!confirm('Hapus rekening ini?')) return
  try {
    const token = localStorage.getItem('token')
    await axios.delete(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000') + ''}/api/banks/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    toast.success('Rekening bank dihapus')
    fetchBanks()
  } catch (error) {
    toast.error('Gagal menghapus bank')
  }
}

const verifyTx = async (id, status) => {
  try {
    const token = localStorage.getItem('token')
    await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000') + ''}/api/transactions/${id}/verify`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    toast.success('Transaksi berhasil diverifikasi!')
    fetchTransactions()
  } catch (error) {
    toast.error('Gagal memverifikasi transaksi')
  }
}

const getPaymentProofUrl = (url) => {
  if (!url) return '';
  return `${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000') + ''}${url}`;
}

const toggleScanner = () => {
  if (activeMenu.value !== 'scanner') {
    activeMenu.value = 'scanner'
    setTimeout(() => {
      html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false
      )
      html5QrcodeScanner.render(onScanSuccess, onScanFailure)
    }, 300)
  } else {
    activeMenu.value = 'dashboard'
    if (html5QrcodeScanner) {
      html5QrcodeScanner.clear().catch(e => console.error(e))
    }
  }
}

const onScanSuccess = async (decodedText) => {
  if (html5QrcodeScanner) html5QrcodeScanner.pause()
  try {
    const token = localStorage.getItem('token')
    const response = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/tickets/scan', 
      { ticket_code: decodedText }, 
      { headers: { Authorization: `Bearer ${token}` }}
    )
    toast.success(response.data.message || `Check-in berhasil: ${decodedText}`)
  } catch (error) {
    toast.error(error.response?.data?.message || 'Tiket tidak valid atau sudah digunakan!')
  }
  setTimeout(() => {
    if (html5QrcodeScanner) html5QrcodeScanner.resume()
  }, 2000)
}

const onScanFailure = (error) => {}

const totalTicketsSold = computed(() => {
  return events.value.reduce((total, event) => {
    const eventSold = event.ticket_categories?.reduce((sum, cat) => sum + cat.sold, 0) || 0
    return total + eventSold
  }, 0)
})

const totalRevenue = computed(() => {
  return events.value.reduce((total, event) => {
    const eventRevenue = event.ticket_categories?.reduce((sum, cat) => sum + (cat.sold * parseFloat(cat.price)), 0) || 0
    return total + eventRevenue
  }, 0)
})

const exportToExcel = () => {
  const data = []
  events.value.forEach(event => {
    if (event.ticket_categories) {
      event.ticket_categories.forEach(cat => {
        data.push({
          'Event': event.title,
          'Kategori': cat.name,
          'Harga': cat.price,
          'Terjual': cat.sold,
          'Pendapatan': cat.sold * cat.price
        })
      })
    }
  })
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Laporan Penjualan")
  XLSX.writeFile(wb, `Laporan_EO_${Date.now()}.xlsx`)
  toast.success('Laporan Excel berhasil diunduh!')
}
</script>

<template>
  <div class="eo-dashboard-container">
    <!-- Main Content -->
    <main class="main-content">
      <div class="header glass-card">
        <div class="header-content">
          <h1>Selamat Datang! 👋</h1>
          <p>Kelola event dan pantau penjualan tiket Anda, <strong>{{ auth.user?.name }}</strong></p>
        </div>
        <div class="header-actions">
          <button class="btn-outline" @click="exportToExcel">📥 Export Excel</button>
        </div>
      </div>
      
      <!-- DASHBOARD STATS -->
      <div v-if="activeMenu === 'dashboard'" class="fade-enter content-area">
        <div class="stats-grid">
          <div class="stat-card glass-card">
            <div class="icon">🎟️</div>
            <div class="info">
              <h3>Tiket Terjual</h3>
              <p class="value">{{ totalTicketsSold }}</p>
            </div>
          </div>
          <div class="stat-card glass-card">
            <div class="icon">🎪</div>
            <div class="info">
              <h3>Event Berjalan</h3>
              <p class="value">{{ events.length }}</p>
            </div>
          </div>
          <div class="stat-card glass-card">
            <div class="icon">💎</div>
            <div class="info">
              <h3>Estimasi Pendapatan</h3>
              <p class="value">Rp {{ totalRevenue.toLocaleString('id-ID') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- EVENTS -->
      <div v-if="activeMenu === 'events'" class="fade-enter content-area">
        <div class="section-header">
          <h2 class="section-title">Event Anda</h2>
          <button class="btn-primary pulse-btn" @click="isCreatingEvent = true">+ Buat Event Baru</button>
        </div>
        <div v-if="loading" class="loading-state">Memuat event Anda...</div>
        <div v-else-if="events.length === 0" class="empty-state glass-card">Belum ada event yang dibuat. Ayo buat event pertamamu!</div>
        <div v-else class="event-cards">
          <div v-for="event in events" :key="event.id" class="event-card-detail glass-card">
            <img :src="event.banner_image || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800&auto=format&fit=crop'" alt="Banner" class="event-banner"/>
            <div class="event-info">
              <h3>{{ event.title }}</h3>
              <p class="status-badge" :class="event.status">{{ event.status }}</p>
              <p class="event-time">📅 {{ new Date(event.start_date).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }) }}</p>
              
              <div class="ticket-stats">
                <h4>Kategori Tiket:</h4>
                <ul v-if="event.ticket_categories && event.ticket_categories.length > 0">
                  <li v-for="cat in event.ticket_categories" :key="cat.id">
                    <div class="cat-header">
                      <strong>{{ cat.name }}</strong>
                      <span>Rp {{ parseFloat(cat.price).toLocaleString('id-ID') }}</span>
                    </div>
                    <div class="cat-progress-bar">
                      <div class="cat-progress" :style="{ width: `${(cat.sold / cat.quota) * 100}%` }"></div>
                    </div>
                    <div class="cat-footer">Terjual: {{ cat.sold }} / {{ cat.quota }}</div>
                  </li>
                </ul>
                <div v-else class="no-tickets">Belum ada kategori tiket.</div>
                <button class="btn-outline-small" @click="openAddTicket(event.id)">+ Tambah Kategori Tiket</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TRANSACTIONS -->
      <div v-if="activeMenu === 'transactions'" class="fade-enter content-area">
        <div class="section-header">
          <h2 class="section-title">💸 Pesanan & Transaksi</h2>
        </div>
        <div class="table-card glass-card">
          <div class="table-responsive">
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th>Booking Code</th>
                  <th>Pembeli</th>
                  <th>Event</th>
                  <th>Bukti Transfer</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tx in transactions" :key="tx.id">
                  <td><code>{{ tx.booking_code }}</code></td>
                  <td>{{ tx.user?.name }}</td>
                  <td>{{ tx.items?.[0]?.ticket_category?.event?.title }}</td>
                  <td>
                    <a v-if="tx.payment_proof" :href="getPaymentProofUrl(tx.payment_proof)" target="_blank" class="link-proof">Lihat Bukti</a>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td><span class="status-badge" :class="tx.payment_status === 'paid' ? 'published' : 'draft'">{{ tx.payment_status }}</span></td>
                  <td>
                    <div v-if="tx.payment_status === 'pending' && tx.payment_proof" class="action-buttons">
                      <button class="btn-approve" @click="verifyTx(tx.id, 'paid')">Approve</button>
                      <button class="btn-reject" @click="verifyTx(tx.id, 'failed')">Reject</button>
                    </div>
                  </td>
                </tr>
                <tr v-if="transactions.length === 0">
                  <td colspan="6" class="empty-state-table">Belum ada transaksi saat ini.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- PROMOS -->
      <div v-if="activeMenu === 'promos'" class="fade-enter content-area">
        <div class="section-header">
          <h2 class="section-title">🎁 Kode Promo Anda</h2>
          <button class="btn-primary pulse-btn" @click="isAddingPromo = true">+ Buat Promo Baru</button>
        </div>
        <div class="table-card glass-card">
          <div class="table-responsive">
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Diskon</th>
                  <th>Event</th>
                  <th>Kadaluarsa</th>
                  <th>Digunakan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="promo in promos" :key="promo.id">
                  <td><strong>{{ promo.code }}</strong></td>
                  <td>
                    {{ promo.discount_type === 'percentage' ? promo.discount_value + '%' : 'Rp ' + parseFloat(promo.discount_value).toLocaleString('id-ID') }}
                  </td>
                  <td>{{ promo.event?.title || 'Semua Event' }}</td>
                  <td>{{ promo.valid_until ? new Date(promo.valid_until).toLocaleDateString('id-ID') : 'Tanpa batas' }}</td>
                  <td>{{ promo.used_count }} / {{ promo.usage_limit || '∞' }}</td>
                </tr>
                <tr v-if="promos.length === 0">
                  <td colspan="5" class="empty-state-table">Belum ada kode promo dibuat.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- BANKS -->
      <div v-if="activeMenu === 'banks'" class="fade-enter content-area">
        <div class="section-header">
          <h2 class="section-title">🏦 Kelola Rekening Bank</h2>
        </div>
        <div class="glass-card" style="padding: 2rem; margin-bottom: 2rem;">
          <form @submit.prevent="addBank" class="form-grid">
            <div class="form-group">
              <input type="text" v-model="newBank.bank_name" placeholder="Nama Bank (BCA, BNI)" required />
            </div>
            <div class="form-group">
              <input type="text" v-model="newBank.account_number" placeholder="No. Rekening" required />
            </div>
            <div class="form-group">
              <input type="text" v-model="newBank.account_name" placeholder="Atas Nama" required />
            </div>
            <div class="form-group" style="display: flex; align-items: flex-end;">
              <button type="submit" class="btn-primary" style="width: 100%;">+ Tambah Rekening</button>
            </div>
          </form>
        </div>

        <div class="table-card glass-card">
          <div class="table-responsive">
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th>Bank</th>
                  <th>No Rekening</th>
                  <th>Atas Nama</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="bank in banks" :key="bank.id">
                  <td><strong>{{ bank.bank_name }}</strong></td>
                  <td>{{ bank.account_number }}</td>
                  <td>{{ bank.account_name }}</td>
                  <td>
                    <button class="btn-reject" @click="deleteBank(bank.id)">Hapus</button>
                  </td>
                </tr>
                <tr v-if="banks.length === 0">
                  <td colspan="4" class="empty-state-table">Belum ada rekening bank yang ditambahkan.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- SCANNER -->
      <div v-if="activeMenu === 'scanner'" class="fade-enter content-area">
        <div class="scanner-section glass-card">
          <div class="scanner-header">
            <h2>📷 Scanner QR Tiket</h2>
            <button class="btn-cancel" @click="toggleScanner">Tutup Scanner</button>
          </div>
          <div id="reader" width="100%"></div>
        </div>
      </div>
    </main>

    <!-- MODALS -->
    <Transition name="fade">
      <div v-if="isCreatingEvent" class="modal-overlay">
        <div class="modal-content large glass-card">
          <h2>Buat Event Baru</h2>
          <form @submit.prevent="submitEvent" class="form-grid">
            <div class="form-group">
              <label>Judul Event</label>
              <input type="text" v-model="newEvent.title" required placeholder="Konser Akbar 2026" />
            </div>
            <div class="form-group">
              <label>Lokasi / Venue</label>
              <input type="text" v-model="newEvent.venue_name" required placeholder="Stadion Utama" />
            </div>
            <div class="form-group">
              <label>Kota</label>
              <input type="text" v-model="newEvent.city" required placeholder="Jakarta" />
            </div>
            <div class="form-group">
              <label>Kategori Event</label>
              <select v-model="newEvent.category_id" required>
                <option value="1">Konser</option>
                <option value="2">Seminar</option>
                <option value="3">Olahraga</option>
              </select>
            </div>
            <div class="form-group">
              <label>Waktu Mulai</label>
              <input type="datetime-local" v-model="newEvent.start_date" required />
            </div>
            <div class="form-group">
              <label>Waktu Selesai</label>
              <input type="datetime-local" v-model="newEvent.end_date" required />
            </div>
            <div class="form-group full-width upload-group">
              <label>Upload Gambar Banner (Maks 5MB)</label>
              <div class="upload-area">
                <input type="file" @change="handleFileChange" accept="image/*" class="file-input" />
                <div class="upload-hint">Drag & Drop atau klik untuk memilih file</div>
              </div>
              <small>Atau gunakan URL Banner (jika file kosong):</small>
              <input type="url" v-model="newEvent.banner_image" placeholder="https://..." />
            </div>
            <div class="form-group full-width">
              <label>Deskripsi Lengkap</label>
              <textarea v-model="newEvent.description" rows="5" required placeholder="Ceritakan detail menarik tentang event ini..."></textarea>
            </div>
            <div class="modal-actions full-width">
              <button type="button" class="btn-cancel" @click="isCreatingEvent = false">Batal</button>
              <button type="submit" class="btn-primary pulse-btn">Simpan Event ✨</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="isAddingTicket" class="modal-overlay">
        <div class="modal-content glass-card">
          <h2>Tambah Kategori Tiket</h2>
          <form @submit.prevent="submitTicket" class="form-grid">
            <div class="form-group full-width">
              <label>Nama Kategori</label>
              <input type="text" v-model="newTicket.name" required placeholder="VIP, Festival, dsb" />
            </div>
            <div class="form-group">
              <label>Harga (Rp)</label>
              <input type="number" v-model.number="newTicket.price" required min="0" />
            </div>
            <div class="form-group">
              <label>Kuota Stok</label>
              <input type="number" v-model.number="newTicket.quota" required min="1" />
            </div>
            <div class="modal-actions full-width">
              <button type="button" class="btn-cancel" @click="isAddingTicket = false">Batal</button>
              <button type="submit" class="btn-primary pulse-btn">Tambah Tiket</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="isAddingPromo" class="modal-overlay">
        <div class="modal-content glass-card">
          <h2>Buat Kode Promo Baru</h2>
          <form @submit.prevent="submitPromo" class="form-grid">
            <div class="form-group full-width">
              <label>Kode Promo (Misal: DISKON20)</label>
              <input type="text" v-model="newPromo.code" required style="text-transform: uppercase;" />
            </div>
            <div class="form-group">
              <label>Tipe Diskon</label>
              <select v-model="newPromo.discount_type">
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Nominal (Rp)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Nilai Diskon</label>
              <input type="number" v-model.number="newPromo.discount_value" required min="1" />
            </div>
            <div class="form-group">
              <label>Pilih Event (Opsional)</label>
              <select v-model="newPromo.event_id">
                <option value="">Berlaku untuk semua event saya</option>
                <option v-for="ev in events" :key="ev.id" :value="ev.id">{{ ev.title }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Batas Penggunaan (Kuota)</label>
              <input type="number" v-model.number="newPromo.usage_limit" min="1" placeholder="Kosongkan jika tak terbatas" />
            </div>
            <div class="form-group full-width">
              <label>Berlaku Hingga</label>
              <input type="datetime-local" v-model="newPromo.valid_until" />
            </div>
            <div class="modal-actions full-width">
              <button type="button" class="btn-cancel" @click="isAddingPromo = false">Batal</button>
              <button type="submit" class="btn-primary pulse-btn">Simpan Promo</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.eo-dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 100%;
}

.header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 2rem; margin-bottom: 2rem; flex-wrap: wrap; gap: 1.5rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
}
.header h1 { margin: 0 0 0.5rem 0; background: -webkit-linear-gradient(45deg, #a855f7, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.header p { color: var(--text-muted); margin: 0; }
.header-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }

.btn-primary { background: linear-gradient(45deg, #6366f1, #a855f7); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.3s; }
.pulse-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(168, 85, 247, 0.4); }
.btn-outline { background: rgba(255,255,255,0.05); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.5); padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.3s; }
.btn-outline:hover { background: rgba(168, 85, 247, 0.2); }
.btn-outline-small { background: transparent; color: #a855f7; border: 1px solid #a855f7; padding: 0.5rem 1rem; border-radius: 50px; cursor: pointer; font-size: 0.85rem; margin-top: 1rem; transition: 0.3s; }
.btn-outline-small:hover { background: #a855f7; color: white; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
.stat-card { padding: 1.5rem; display: flex; align-items: center; gap: 1.5rem; transition: transform 0.3s; }
.stat-card:hover { transform: translateY(-5px); border-color: rgba(168, 85, 247, 0.5); }
.stat-card .icon { font-size: 2.5rem; background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 50%; }
.stat-card h3 { margin: 0 0 0.5rem 0; font-size: 1rem; color: #94a3b8; }
.stat-card .value { font-size: 2rem; font-weight: 800; margin: 0; color: #fff; }

.scanner-section { padding: 2rem; text-align: center; }
.scanner-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.scanner-header h2 { margin: 0; color: #c084fc; }

.section-title { font-size: 1.5rem; color: white; margin: 0; }
.loading-state, .empty-state { text-align: center; padding: 4rem 2rem; color: #94a3b8; border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; margin-top: 1rem; }
.event-cards { display: grid; grid-template-columns: 1fr; gap: 2rem; }
.event-card-detail { overflow: hidden; display: flex; flex-direction: column; transition: 0.3s; background: rgba(0,0,0,0.2); }
.event-card-detail:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); border-color: rgba(168, 85, 247, 0.4); }
@media(min-width: 768px) { .event-card-detail { flex-direction: row; } .event-banner { width: 350px; height: auto; min-height: 100%; object-fit: cover; } }
.event-banner { width: 100%; height: 250px; object-fit: cover; border-right: 1px solid rgba(255,255,255,0.05); }
.event-info { padding: 2.5rem; flex: 1; }
.event-info h3 { margin: 0 0 0.5rem 0; font-size: 1.75rem; color: #fff; }
.event-time { color: #cbd5e1; margin-bottom: 2rem; font-weight: 500; }

.status-badge { display: inline-block; padding: 0.35rem 1rem; border-radius: 50px; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin-bottom: 1rem; }
.status-badge.published { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
.status-badge.draft { background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.3); }

.ticket-stats { background: rgba(0,0,0,0.3); padding: 2rem; border-radius: 12px; margin-top: 1rem; border: 1px solid rgba(255,255,255,0.05); }
.ticket-stats h4 { margin: 0 0 1.5rem 0; color: #a855f7; font-size: 1.1rem; }
.ticket-stats ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem; }
.ticket-stats li { background: rgba(255,255,255,0.03); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
.cat-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; align-items: center; }
.cat-header strong { font-size: 1.1rem; color: #fff; }
.cat-header span { font-weight: 600; color: #e2e8f0; }
.cat-progress-bar { width: 100%; height: 8px; background: rgba(0,0,0,0.4); border-radius: 10px; margin-bottom: 0.75rem; overflow: hidden; }
.cat-progress { height: 100%; background: linear-gradient(90deg, #6366f1, #a855f7); border-radius: 10px; }
.cat-footer { font-size: 0.85rem; color: #94a3b8; text-align: right; font-weight: 500; }
.no-tickets { color: #94a3b8; font-style: italic; padding: 1rem; text-align: center; background: rgba(0,0,0,0.2); border-radius: 8px; margin-bottom: 1rem; }

/* Table Styles */
.table-card { padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); }
.table-responsive { overflow-x: auto; }
.dashboard-table { width: 100%; border-collapse: separate; border-spacing: 0; color: white; text-align: left; }
.dashboard-table th { padding: 1.25rem 1rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: #a855f7; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: 700; }
.dashboard-table td { padding: 1.25rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: middle; }
.dashboard-table tbody tr { transition: background 0.2s; }
.dashboard-table tbody tr:hover { background: rgba(255,255,255,0.03); }
.dashboard-table tbody tr:last-child td { border-bottom: none; }
.empty-state-table { text-align: center; padding: 3rem !important; color: #94a3b8; font-style: italic; }

.link-proof { color: #818cf8; text-decoration: none; font-weight: 600; padding: 0.4rem 0.8rem; background: rgba(99,102,241,0.1); border-radius: 50px; transition: 0.2s; display: inline-block; }
.link-proof:hover { background: rgba(99,102,241,0.2); color: #fff; }
.text-muted { color: #64748b; }

.action-buttons { display: flex; gap: 0.75rem; }
.btn-approve { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; font-size: 0.85rem; }
.btn-approve:hover { background: rgba(34, 197, 94, 0.25); color: #fff; }
.btn-reject { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; font-size: 0.85rem; }
.btn-reject:hover { background: rgba(239, 68, 68, 0.25); color: #fff; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 1rem; }
.modal-content { padding: 2.5rem; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
.modal-content.large { max-width: 800px; }
.modal-content h2 { margin-top: 0; margin-bottom: 2rem; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; }

.form-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
@media(min-width: 768px) { .form-grid { grid-template-columns: 1fr 1fr; } }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #cbd5e1; font-weight: 500; }
.form-group input, .form-group textarea, .form-group select { width: 100%; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); color: white; transition: 0.3s; box-sizing: border-box; }
.form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #a855f7; background: rgba(0,0,0,0.4); box-shadow: 0 0 10px rgba(168, 85, 247, 0.2); }

.upload-area { border: 2px dashed rgba(255,255,255,0.2); border-radius: 12px; padding: 2rem; text-align: center; position: relative; background: rgba(0,0,0,0.1); transition: 0.3s; margin-bottom: 1rem; }
.upload-area:hover { border-color: #a855f7; background: rgba(168, 85, 247, 0.05); }
.file-input { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.upload-hint { color: #94a3b8; font-weight: 600; pointer-events: none; }
.upload-group small { display: block; color: #64748b; margin-bottom: 0.5rem; }

.modal-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem; }
.btn-cancel { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer; transition: 0.3s; }
.btn-cancel:hover { background: rgba(255,255,255,0.1); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
