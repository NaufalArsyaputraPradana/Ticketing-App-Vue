<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'

const auth = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="logo">TicketFlow</div>
      <nav class="sidebar-nav">
        <router-link to="/">🏠 Beranda Utama</router-link>
        <router-link v-if="auth.isAdmin" to="/dashboard/admin">👑 Dashboard Admin</router-link>
        <router-link v-if="auth.isOrganizer" to="/dashboard/organizer?tab=dashboard">📊 Ringkasan</router-link>
        <router-link v-if="auth.isOrganizer" to="/dashboard/organizer?tab=events">🎪 Event Saya</router-link>
        <router-link v-if="auth.isOrganizer" to="/dashboard/organizer?tab=transactions">💸 Transaksi</router-link>
        <router-link v-if="auth.isOrganizer" to="/dashboard/organizer?tab=promos">🎁 Kode Promo</router-link>
        <router-link v-if="auth.isOrganizer" to="/dashboard/organizer?tab=banks">🏦 Rekening Bank</router-link>
        <router-link v-if="auth.isOrganizer" to="/dashboard/organizer?tab=scanner">📷 Scanner</router-link>
        <router-link v-if="!auth.isAdmin && !auth.isOrganizer" to="/dashboard/user">🎟️ Dashboard Saya</router-link>
        <router-link v-if="!auth.isAdmin && !auth.isOrganizer" to="/favorites">❤️ Favorit</router-link>
        <router-link to="/dashboard/profile">👤 Profil Settings</router-link>
      </nav>
      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </aside>
    
    <main class="dashboard-content">
      <header class="dashboard-header">
        <div class="header-actions">
          <div id="google_translate_element"></div>
          <button @click="themeStore.toggleTheme" class="theme-toggle">
            {{ themeStore.isDark ? '🌞 Mode Terang' : '🌙 Mode Gelap' }}
          </button>
          <div class="user-info">
            <span>{{ auth.user?.name }} ({{ auth.user?.role }})</span>
          </div>
        </div>
      </header>
      <div class="content-wrapper">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-dark);
}

.sidebar {
  width: 260px;
  flex-shrink: 0;
  background: var(--card-bg);
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.logo {
  padding: 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  border-bottom: 1px solid var(--glass-border);
}

.sidebar-nav {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.sidebar-nav a {
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
}

.sidebar-nav a:hover, .sidebar-nav a.router-link-exact-active {
  background: rgba(79, 70, 229, 0.1);
  color: #818cf8;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--glass-border);
}

.logout-btn {
  width: 100%;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.dashboard-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  height: 70px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 2rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.theme-toggle {
  background: var(--btn-hover-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-light);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: var(--glass-border-hover);
}

.user-info {
  font-weight: 500;
  color: var(--text-light);
}

.content-wrapper {
  padding: 2rem;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--bg-dark);
}
</style>
