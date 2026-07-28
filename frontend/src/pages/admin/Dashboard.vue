<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import axios from 'axios'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const auth = useAuthStore()
const stats = ref({ totalUsers: 0, activeEvents: 0, totalIncome: 0, pendingWithdrawals: 0 })
const users = ref([])
const loading = ref(true)

const chartData = computed(() => {
  const labels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
  const dataPoints = [0, 500000, 1500000, 1200000, 3000000, 2500000, stats.value.totalIncome]
  
  return {
    labels,
    datasets: [
      {
        label: 'Pendapatan (Rp)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: '#6366f1',
        borderWidth: 2,
        pointBackgroundColor: '#a855f7',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#a855f7',
        fill: true,
        tension: 0.4,
        data: dataPoints
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
  scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' } }, y: { grid: { color: 'rgba(255,255,255,0.05)' } } }
}

const fetchData = async () => {
  try {
    const token = localStorage.getItem('token')
    const config = { headers: { Authorization: `Bearer ${token}` } }
    
    const [statsRes, usersRes] = await Promise.all([
      axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin/stats', config),
      axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin/users', config)
    ].map(p => p.catch(e => { console.error(e); return {data: []} })))
    
    if(statsRes.data.totalUsers !== undefined) stats.value = statsRes.data
    if(usersRes.data.length) users.value = usersRes.data
  } catch (error) {
    console.error('Failed to fetch admin data', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

</script>

<template>
  <div class="dashboard-page">
    <div class="header glass-card">
      <div class="header-content">
        <h1>Admin Dashboard ⚡</h1>
        <p>Sistem Pemantauan Utama Platform TicketFlow</p>
      </div>
    </div>
    
    <div v-if="loading" class="loading">Memuat data sistem...</div>
    
    <template v-else>
      <div class="stats-grid">
        <div class="stat-card glass-card">
          <div class="icon">👥</div>
          <div class="info">
            <h3>Total Pengguna</h3>
            <p class="value">{{ stats.totalUsers || users.length }}</p>
          </div>
        </div>
        <div class="stat-card glass-card">
          <div class="icon">🎟️</div>
          <div class="info">
            <h3>Event Aktif</h3>
            <p class="value">{{ stats.activeEvents || 0 }}</p>
          </div>
        </div>
        <div class="stat-card glass-card">
          <div class="icon">💰</div>
          <div class="info">
            <h3>Transaksi Berhasil</h3>
            <p class="value">Rp {{ stats.totalIncome.toLocaleString('id-ID') }}</p>
          </div>
        </div>
      </div>

      <div class="dashboard-sections">
        <div class="section glass-card">
          <h2>👤 Pengguna Terdaftar</h2>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Pengguna</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in users.slice(0, 10)" :key="u.id">
                  <td>
                    <strong>{{ u.name }}</strong><br>
                    <small>{{ u.email }}</small>
                  </td>
                  <td><span class="role-badge" :class="u.role">{{ u.role }}</span></td>
                  <td>
                    <div class="status-indicator" :class="{ active: u.is_active }"></div>
                    {{ u.is_active ? 'Aktif' : 'Non-Aktif' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.header { 
  margin-bottom: 2rem; 
  padding: 2rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
}
.header h1 { margin: 0 0 0.5rem 0; color: var(--text-light); text-shadow: 0 0 10px rgba(168, 85, 247, 0.5); }
.header p { color: var(--text-muted); margin: 0; }

.loading { font-style: italic; color: #94a3b8; text-align: center; padding: 3rem; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.stat-card { padding: 1.5rem; display: flex; align-items: center; gap: 1.5rem; transition: transform 0.3s ease, box-shadow 0.3s ease; }
.stat-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px -10px rgba(168, 85, 247, 0.3); border-color: rgba(168, 85, 247, 0.5); }
.stat-card .icon { font-size: 2.5rem; background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 50%; }
.stat-card h3 { margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
.stat-card .value { font-size: 1.8rem; font-weight: 800; margin: 0; color: #fff; }

.dashboard-sections { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 1024px) { .dashboard-sections { grid-template-columns: 1fr 1fr; } }
.full-width { grid-column: 1 / -1; }
.section { padding: 1.5rem; }
.section h2 { margin: 0 0 1.5rem 0; font-size: 1.25rem; color: var(--text-light); }
.table-container { overflow-x: auto; }
table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
th, td { padding: 1rem; text-align: left; color: var(--text-light); }
th { color: #94a3b8; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); }
td { background: var(--input-bg); }
td:first-child { border-top-left-radius: 8px; border-bottom-left-radius: 8px; }
td:last-child { border-top-right-radius: 8px; border-bottom-right-radius: 8px; }
tbody tr { transition: transform 0.2s; }
tbody tr:hover { transform: scale(1.01); background: rgba(255,255,255,0.05); }

.amount { font-weight: 600; color: #a855f7; }
small { color: #94a3b8; }
.link { color: #6366f1; text-decoration: underline; }

.badge, .role-badge { padding: 0.35rem 0.75rem; border-radius: 50px; font-size: 0.75rem; text-transform: uppercase; font-weight: bold; }
.badge.paid { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
.badge.pending { background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.3); }
.badge.failed { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
.role-badge.admin { background: rgba(239, 68, 68, 0.15); color: #f87171; }
.role-badge.organizer { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
.role-badge.user { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }

code { background: var(--input-bg); padding: 0.25rem 0.5rem; border-radius: 4px; color: #a855f7; font-family: monospace; }

.status-indicator { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #ef4444; margin-right: 5px; }
.status-indicator.active { background: #22c55e; box-shadow: 0 0 5px #22c55e; }

.actions { display: flex; gap: 0.5rem; }
.btn-success-sm { background: #10b981; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; }
.btn-danger-sm { background: #ef4444; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; }
.btn-primary { background: linear-gradient(45deg, #6366f1, #a855f7); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: bold; }
input { background: var(--input-bg); border: 1px solid var(--glass-border); padding: 0.75rem; border-radius: 8px; color: var(--text-light); }
</style>
