import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(true)

  const toggleTheme = () => {
    isDark.value = !isDark.value
    updateTheme()
  }

  const updateTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.remove('light-theme')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.add('light-theme')
      localStorage.setItem('theme', 'light')
    }
  }

  const initTheme = () => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light') {
      isDark.value = false
      document.documentElement.classList.add('light-theme')
    }
  }

  return { isDark, toggleTheme, initTheme }
})
