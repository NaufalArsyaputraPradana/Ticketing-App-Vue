<script setup>
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import PublicLayout from './layouts/PublicLayout.vue'
import DashboardLayout from './layouts/DashboardLayout.vue'
import SplashScreen from './components/SplashScreen.vue'
import { useThemeStore } from './stores/theme'

const route = useRoute()
const themeStore = useThemeStore()

// Initialize theme on app load
themeStore.initTheme()

const layout = computed(() => {
  if (route.meta.layout === 'DashboardLayout') {
    return DashboardLayout
  }
  return PublicLayout
})
</script>

<template>
  <SplashScreen />
  <component :is="layout">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </component>
</template>
