<script setup>
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'

const auth = useAuthStore()
const themeStore = useThemeStore()
</script>

<template>
  <div class="public-layout">
    <header>
      <nav class="navbar">
        <div class="logo">
          <RouterLink to="/">TicketFlow</RouterLink>
        </div>
        <div class="nav-links">
          <div id="google_translate_element"></div>
          <button @click="themeStore.toggleTheme" class="theme-toggle">
            {{ themeStore.isDark ? '🌞 Terang' : '🌙 Gelap' }}
          </button>
          <RouterLink to="/">Beranda</RouterLink>
          <template v-if="!auth.isAuthenticated">
            <RouterLink to="/login" class="btn-login">Login</RouterLink>
          </template>
          <template v-else>
            <RouterLink to="/favorites" v-if="auth.role === 'user'">❤️ Favorit</RouterLink>
            <RouterLink v-if="auth.isAdmin" to="/dashboard/admin" class="btn-dashboard">Dashboard Admin</RouterLink>
            <RouterLink v-else-if="auth.isOrganizer" to="/dashboard/organizer" class="btn-dashboard">Dashboard EO</RouterLink>
            <RouterLink v-else to="/dashboard/user" class="btn-dashboard">Dashboard Saya</RouterLink>
          </template>
        </div>
      </nav>
    </header>

    <main>
      <slot></slot>
    </main>
    
    <footer>
      <p>&copy; 2026 TicketFlow. All rights reserved.</p>
    </footer>
  </div>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 5%;
  background: var(--nav-bg);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--glass-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo a {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  text-decoration: none;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-links a {
  color: var(--text-light);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-links a:hover {
  color: var(--secondary-color);
}

.btn-login, .btn-dashboard {
  background: var(--primary-color);
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  color: white !important;
  font-weight: 600;
  transition: transform 0.2s, background 0.2s;
}

.btn-login:hover, .btn-dashboard:hover {
  background: #4338ca;
  transform: translateY(-2px);
}

main {
  min-height: 80vh;
  padding: 2rem 5%;
}

footer {
  text-align: center;
  padding: 2rem;
  border-top: 1px solid var(--glass-border);
  color: var(--text-muted);
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
</style>
