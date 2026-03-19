import { onMounted, onUnmounted, ref } from 'vue'
import { useEasterEggStore } from '../stores/EastereggStore'

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

export function useKonamiCode() {
  const progress = ref(0)
  const easterEggStore = useEasterEggStore()

  const handleKeyDown = (e) => {
    const expected = KONAMI_CODE[progress.value]

    if (e.key === expected) {
      progress.value++

      if (progress.value === KONAMI_CODE.length) {
        progress.value = 0
        easterEggStore.trigger()
      }
    } else {
      progress.value = e.key === KONAMI_CODE[0] ? 1 : 0
    }
  }

  onMounted(() => window.addEventListener('keydown', handleKeyDown))
  onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))

  return { progress }
}
