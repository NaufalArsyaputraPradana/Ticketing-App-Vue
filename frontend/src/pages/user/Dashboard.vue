<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import axios from 'axios'
import html2pdf from 'html2pdf.js'

const auth = useAuthStore()
const tickets = ref([])
const transactions = ref([])
const loading = ref(true)
const activeTab = ref('pending') // 'pending', 'active' or 'history'
const showQRModal = ref(false)
const selectedTicketCode = ref('')

const openQR = (code) => {
  selectedTicketCode.value = code
  showQRModal.value = true
}
const closeQR = () => {
  showQRModal.value = false
  selectedTicketCode.value = ''
}

onMounted(async () => {
  try {
    const [ticketRes, trxRes] = await Promise.all([
      axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/transactions/tickets', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }),
      axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/transactions/my-transactions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
    ]);
    tickets.value = ticketRes.data;
    transactions.value = trxRes.data;
  } catch (error) {
    console.error('Gagal mengambil tiket:', error)
  } finally {
    loading.value = false
  }
})

const activeTickets = computed(() => tickets.value.filter(t => t.status === 'active'))
const historyTickets = computed(() => tickets.value.filter(t => t.status === 'used'))
const pendingTransactions = computed(() => transactions.value.filter(t => t.payment_status === 'pending'))

const uploadProof = async (event, transactionId) => {
  const file = event.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('payment_proof', file);
  try {
    await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000') + ''}/api/transactions/${transactionId}/upload-proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    alert('Bukti pembayaran berhasil diunggah! Menunggu verifikasi admin.');
    // Refresh page or data
    window.location.reload();
  } catch (error) {
    alert('Gagal mengunggah bukti pembayaran.');
    console.error(error);
  }
}

const downloadTicket = (ticket) => {
  const element = document.getElementById(`ticket-pdf-${ticket.id}`)
  // temporarily make it visible for PDF render if needed, or render as is
  element.style.display = 'block'
  
  const opt = {
    margin: 0.5,
    filename: `E-Ticket_${ticket.ticket_code}.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
  }
  html2pdf().set(opt).from(element).save().then(() => {
    element.style.display = 'none'
  })
}
</script>

<template>
  <div class="dashboard-page">
    <div class="header glass-card">
      <div class="header-content">
        <h1>Dashboard Saya 🎟️</h1>
        <p>Selamat datang kembali, <strong>{{ auth.user?.name }}</strong>!</p>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="icon">🎫</div>
        <div class="info">
          <h3>Tiket Aktif</h3>
          <p class="value">{{ activeTickets.length }}</p>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="icon">✅</div>
        <div class="info">
          <h3>Tiket Digunakan</h3>
          <p class="value">{{ historyTickets.length }}</p>
        </div>
      </div>
    </div>

    <div class="ticket-section glass-card">
      <div class="tabs">
        <button :class="['tab-btn', { active: activeTab === 'pending' }]" @click="activeTab = 'pending'">
          Menunggu Pembayaran
          <span v-if="pendingTransactions.length > 0" class="badge">{{ pendingTransactions.length }}</span>
        </button>
        <button :class="['tab-btn', { active: activeTab === 'active' }]" @click="activeTab = 'active'">Tiket Aktif</button>
        <button :class="['tab-btn', { active: activeTab === 'history' }]" @click="activeTab = 'history'">Riwayat Penggunaan</button>
      </div>

      <div class="tab-content">
        <div v-if="loading" class="loading-state">Memuat data...</div>
        
        <!-- Pending Transactions -->
        <div v-else-if="activeTab === 'pending'">
          <div v-if="pendingTransactions.length === 0" class="empty-state">
            <p>Tidak ada transaksi yang menunggu pembayaran.</p>
          </div>
          <div v-else class="ticket-list">
            <div v-for="trx in pendingTransactions" :key="trx.id" class="physical-ticket" style="display: flex; flex-direction: column;">
              <div style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem; margin-bottom: 1rem;">
                  <h3 style="margin: 0; color: var(--text-light);">Kode Booking: {{ trx.booking_code }}</h3>
                  <span class="status-badge warning">Pending</span>
                </div>
                <div v-for="item in trx.items" :key="item.id" style="margin-bottom: 1rem;">
                  <strong style="color: var(--primary-color);">{{ item.ticket_category.event.title }}</strong> - {{ item.ticket_category.name }}
                  <p style="margin: 0.25rem 0; color: var(--text-muted);">{{ item.quantity }}x Tiket</p>
                </div>
                <div style="margin-top: 1rem;">
                  <p><strong>Total Tagihan:</strong> <span style="color: #a855f7; font-size: 1.2rem; font-weight: bold;">Rp {{ parseFloat(trx.total_amount).toLocaleString('id-ID') }}</span></p>
                  <p style="color: var(--text-muted);">Silakan transfer ke rekening: <strong>{{ trx.payment_method }}</strong></p>
                </div>
              </div>
              <div style="background: var(--input-bg); padding: 1.5rem; text-align: center; border-top: 1px solid var(--glass-border);">
                <div v-if="trx.payment_proof">
                  <p style="color: #10b981;">✅ Bukti pembayaran telah diunggah. Menunggu verifikasi admin.</p>
                </div>
                <div v-else>
                  <p style="margin-bottom: 1rem; color: #ef4444;">Upload bukti transfer agar tiket Anda dapat diterbitkan.</p>
                  <input type="file" :id="'file-' + trx.id" style="display: none;" @change="uploadProof($event, trx.id)" accept="image/*" />
                  <label :for="'file-' + trx.id" class="btn-primary" style="cursor: pointer;">📤 Upload Bukti Transfer</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Tickets -->
        <div v-else-if="activeTab === 'active'">
          <div v-if="activeTickets.length === 0" class="empty-state">
            <p>Belum ada tiket aktif. Yuk cari event seru!</p>
            <router-link to="/" class="btn-primary">Jelajahi Event</router-link>
          </div>
          <div v-else class="ticket-list">
            <div v-for="ticket in activeTickets" :key="ticket.id" class="physical-ticket">
              <div class="ticket-left">
                <div class="event-title">{{ ticket.transaction_item?.ticket_category?.event?.title }}</div>
                <div class="event-details">
                  <p>📍 {{ ticket.transaction_item?.ticket_category?.event?.venue_name }}</p>
                  <p>📅 {{ new Date(ticket.transaction_item?.ticket_category?.event?.start_date).toLocaleString('id-ID') }}</p>
                  <p>👤 {{ ticket.transaction_item?.holder_name }}</p>
                </div>
              </div>
              <div class="ticket-rip"></div>
              <div class="ticket-right">
                <div class="ticket-category">{{ ticket.transaction_item?.ticket_category?.name }}</div>
                <div class="barcode">||||||| | ||| |||| | ||</div>
                <div class="ticket-code">{{ ticket.ticket_code }}</div>
                <div class="action-buttons">
                  <button class="btn-primary-small" @click="openQR(ticket.ticket_code)">📱 Lihat QR</button>
                  <button class="btn-download" @click="downloadTicket(ticket)">📥 PDF</button>
                </div>
              </div>

              <!-- Hidden PDF element to ensure clean print layout -->
              <div :id="`ticket-pdf-${ticket.id}`" style="display:none; width: 800px; padding: 40px; background: #fff; color: #000; border: 2px solid #000; border-radius: 20px;">
                <h1 style="color: #4f46e5; margin:0 0 10px 0; border-bottom: 2px solid #ccc; padding-bottom: 10px;">{{ ticket.transaction_item?.ticket_category?.event?.title }}</h1>
                <p><strong>Venue:</strong> {{ ticket.transaction_item?.ticket_category?.event?.venue_name }}</p>
                <p><strong>Date:</strong> {{ new Date(ticket.transaction_item?.ticket_category?.event?.start_date).toLocaleString('id-ID') }}</p>
                <p><strong>Category:</strong> {{ ticket.transaction_item?.ticket_category?.name }}</p>
                <p><strong>Holder Name:</strong> {{ ticket.transaction_item?.holder_name }}</p>
                <div style="margin-top: 30px; padding: 20px; background: #f3f4f6; text-align: center; border-radius: 10px;">
                  <h3>BOOKING CODE</h3>
                  <h1 style="letter-spacing: 5px; font-family: monospace;">{{ ticket.ticket_code }}</h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- History Tickets -->
        <div v-else-if="activeTab === 'history'">
          <div v-if="historyTickets.length === 0" class="empty-state">
            <p>Belum ada riwayat tiket yang digunakan.</p>
          </div>
          <div v-else class="ticket-list">
             <div v-for="ticket in historyTickets" :key="ticket.id" class="physical-ticket used">
              <div class="ticket-left">
                <div class="event-title">{{ ticket.transaction_item?.ticket_category?.event?.title }}</div>
                <div class="event-details">
                  <p>📍 {{ ticket.transaction_item?.ticket_category?.event?.venue_name }}</p>
                  <p>📅 {{ new Date(ticket.transaction_item?.ticket_category?.event?.start_date).toLocaleString('id-ID') }}</p>
                  <p>👤 {{ ticket.transaction_item?.holder_name }}</p>
                </div>
              </div>
              <div class="ticket-rip"></div>
              <div class="ticket-right">
                <div class="ticket-category">{{ ticket.transaction_item?.ticket_category?.name }}</div>
                <div class="ticket-code">{{ ticket.ticket_code }}</div>
                <div class="status-stamp">TELAH DIGUNAKAN</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Modal -->
    <Transition name="fade">
      <div v-if="showQRModal" class="modal-overlay" @click.self="closeQR">
        <div class="modal-content glass-card qr-modal">
          <h2>Screen Ticket</h2>
          <p>Tunjukkan QR Code ini kepada panitia saat Check-in</p>
          <div class="qr-container">
            <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${selectedTicketCode}`" alt="QR Code" />
          </div>
          <p class="qr-code-text">{{ selectedTicketCode }}</p>
          <button class="btn-cancel" @click="closeQR">Tutup</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.header {
  padding: 2rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
}
.header h1 {
  margin: 0 0 0.5rem 0;
  background: -webkit-linear-gradient(45deg, #a855f7, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.header p { color: var(--text-muted); margin: 0; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.stat-card {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: transform 0.3s;
}
.stat-card:hover { transform: translateY(-5px); border-color: rgba(168, 85, 247, 0.5); }
.stat-card .icon { font-size: 2.5rem; background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 50%; }
.stat-card h3 { margin: 0 0 0.5rem 0; font-size: 1rem; color: var(--text-muted); }
.stat-card .value { font-size: 2rem; font-weight: 800; margin: 0; color: var(--text-light); }

.ticket-section {
  padding: 0;
  overflow: hidden;
}
.tabs {
  display: flex;
  background: rgba(0,0,0,0.2);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.tab-btn {
  flex: 1;
  padding: 1.25rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
}
.tab-btn:hover { color: var(--text-light); background: var(--btn-hover-bg); }
.tab-btn.active { color: #a855f7; border-bottom-color: #a855f7; background: rgba(168, 85, 247, 0.05); }

.badge { background: #ef4444; color: white; padding: 2px 8px; border-radius: 50px; font-size: 0.8rem; margin-left: 0.5rem; }
.status-badge { padding: 0.25rem 0.75rem; border-radius: 50px; font-weight: bold; font-size: 0.8rem; }
.status-badge.warning { background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid #f59e0b; }

.tab-content { padding: 2rem; }
.loading-state, .empty-state { text-align: center; color: var(--text-muted); padding: 3rem; }
.btn-primary { display: inline-block; background: var(--primary-color); color: white; padding: 0.75rem 1.5rem; border-radius: 50px; margin-top: 1rem; }

/* Holographic Ticket Design */
.ticket-list { display: flex; flex-direction: column; gap: 2rem; }
.physical-ticket {
  display: flex;
  background: var(--card-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  transition: transform 0.3s, box-shadow 0.3s;
}
.physical-ticket:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 40px rgba(168, 85, 247, 0.3);
  border-color: rgba(168, 85, 247, 0.5);
}
.physical-ticket::before {
  content: "";
  position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: skewX(-25deg);
  animation: shine 6s infinite;
}
@keyframes shine {
  0% { left: -100%; }
  20% { left: 200%; }
  100% { left: 200%; }
}

.ticket-left {
  flex: 2;
  padding: 2rem;
  position: relative;
}
.event-title { font-size: 1.5rem; font-weight: 800; color: var(--text-light); margin-bottom: 1rem; text-shadow: 0 2px 5px rgba(0,0,0,0.2); }
.event-details p { margin: 0.5rem 0; color: var(--text-muted); font-size: 0.95rem; }

.ticket-rip {
  width: 2px;
  background-image: linear-gradient(to bottom, rgba(255,255,255,0.2) 50%, transparent 50%);
  background-size: 2px 15px;
  position: relative;
}
.ticket-rip::before, .ticket-rip::after {
  content: ""; position: absolute; width: 30px; height: 30px; background: var(--bg-dark); border-radius: 50%; left: -15px;
}
.ticket-rip::before { top: -15px; }
.ticket-rip::after { bottom: -15px; }

.ticket-right {
  flex: 1;
  padding: 2rem;
  background: var(--input-bg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.ticket-category { background: #a855f7; color: white; padding: 0.25rem 1rem; border-radius: 50px; font-weight: bold; margin-bottom: 1rem; letter-spacing: 2px; }
.barcode { font-family: monospace; font-size: 1.5rem; letter-spacing: 2px; opacity: 0.5; margin-bottom: 0.5rem; color: var(--text-light); }
.ticket-code { font-family: monospace; font-size: 1.25rem; font-weight: bold; background: var(--btn-hover-bg); color: var(--text-light); padding: 0.5rem 1rem; border-radius: 8px; margin-bottom: 1rem; }
.btn-download { background: transparent; border: 1px solid #a855f7; color: #a855f7; padding: 0.5rem 1rem; border-radius: 50px; cursor: pointer; transition: 0.3s; }
.btn-download:hover { background: #a855f7; color: white; }

.physical-ticket.used { opacity: 0.6; filter: grayscale(80%); }
.physical-ticket.used:hover { transform: none; box-shadow: none; border-color: var(--glass-border); }
.status-stamp {
  color: #ef4444; border: 3px solid #ef4444; padding: 0.5rem 1rem; font-weight: 900; font-size: 1.2rem;
  transform: rotate(-15deg); margin-top: 1rem; border-radius: 8px;
}
.action-buttons { display: flex; gap: 0.5rem; }
.btn-primary-small { background: linear-gradient(45deg, #6366f1, #a855f7); color: white; border: none; padding: 0.5rem 1rem; border-radius: 50px; cursor: pointer; transition: 0.3s; font-weight: bold; }
.btn-primary-small:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(168, 85, 247, 0.4); }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content.qr-modal { padding: 3rem; text-align: center; border-radius: 20px; max-width: 400px; }
.modal-content.qr-modal h2 { margin: 0 0 0.5rem 0; color: #a855f7; }
.modal-content.qr-modal p { color: var(--text-muted); margin-bottom: 2rem; }
.qr-container { background: white; padding: 1rem; border-radius: 12px; display: inline-block; margin-bottom: 1rem; border: 1px solid var(--glass-border); }
.qr-container img { display: block; }
.qr-code-text { font-family: monospace; font-size: 1.5rem; font-weight: bold; letter-spacing: 5px; margin-bottom: 2rem; color: var(--text-light); }
.btn-cancel { background: transparent; border: 1px solid var(--glass-border); color: var(--text-light); padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer; transition: 0.3s; width: 100%; }
.btn-cancel:hover { background: var(--btn-hover-bg); }
</style>
