// composables/useMiku.js
import { onMounted, onUnmounted, ref } from 'vue'
import { useEasterEggStore } from '../stores/EastereggStore.js'

const SECRET_WORD = 'miku'

export function useMiku() {
  const buffer = ref('')
  const easterEggStore = useEasterEggStore()

  const isSearchBar = (target) => {
    if (!target) return false
    const tag = target.tagName?.toLowerCase()
    return tag === 'input' || tag === 'textarea' || target.isContentEditable
  }

  const handleKeyDown = (e) => {
    // Si el foco está en la barra de búsqueda u otro input, ignorar
    if (isSearchBar(document.activeElement)) return

    // Solo letras
    if (e.key.length !== 1 || !e.key.match(/[a-zA-Z]/)) {
      if (e.key === 'Escape' || e.key === 'Enter') buffer.value = ''
      return
    }

    buffer.value += e.key.toLowerCase()

    // Mantener solo los últimos N caracteres
    if (buffer.value.length > SECRET_WORD.length) {
      buffer.value = buffer.value.slice(-SECRET_WORD.length)
    }

    // Verificar si coincide con la palabra secreta
    if (buffer.value === SECRET_WORD) {
      buffer.value = ''
      easterEggStore.triggerMiku()
    }
  }

  onMounted(() => window.addEventListener('keydown', handleKeyDown))
  onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))

  return { buffer }
}