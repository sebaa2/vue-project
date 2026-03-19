import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Swal from 'sweetalert2'
import rayquazaGif from '../assets/images/pokemon-rayquaza.gif'
const RAYQUAZA_GIF = rayquazaGif

export const useEasterEggStore = defineStore(
  'easterEgg',
  () => {
    // ==================== STATE ====================
    // Se persiste en localStorage automáticamente
    const timesTriggered = ref(0)
    const firstTriggeredAt = ref(null)
    const lastTriggeredAt = ref(null)

    // ==================== GETTERS ====================
    const hasTriggeredBefore = computed(() => timesTriggered.value > 0)

    const triggerMessage = computed(() => {
      if (timesTriggered.value === 0) return '¡Lo encontraste por primera vez!'
      if (timesTriggered.value === 1) return '¡Ya lo sabías! 👀'
      if (timesTriggered.value < 5) return `¡${timesTriggered.value} veces y contando! 🔥`
      return `¡mira! × ${timesTriggered.value} 🏆`
    })

    // ==================== ACTIONS ====================
    const trigger = () => {
      const now = new Date().toLocaleString('es-CL')

      timesTriggered.value++
      lastTriggeredAt.value = now
      if (timesTriggered.value === 1) {
        firstTriggeredAt.value = now
      }

      Swal.fire({
        title: '🐉 ¡RAYQUAZA APARECIÓ!',
        html: `
          <p class="text-purple-300 text-sm mb-1">↑ ↑ ↓ ↓ ← → ← → B A</p>
          <p class="text-yellow-400 text-xs font-bold mb-4">${triggerMessage.value}</p>
          <img
            src="${RAYQUAZA_GIF}"
            alt="Rayquaza bailando"
            class="mx-auto rounded-xl shadow-lg"
            style="max-width: 280px; width: 100%;"
          />
          <p class="text-gray-400 text-xs mt-4">
            Activado ${timesTriggered.value} ${timesTriggered.value === 1 ? 'vez' : 'veces'}
          </p>
        `,
        background: '#1a1a2e',
        color: '#ffffff',
        confirmButtonText: '¡Increíble!',
        confirmButtonColor: '#7c3aed',
        width: 400,
        padding: '2rem',
        backdrop: 'rgba(0, 0, 30, 0.85)',
      })
    }

    const reset = () => {
      timesTriggered.value = 0
      firstTriggeredAt.value = null
      lastTriggeredAt.value = null
    }

    return {
      // state
      timesTriggered,
      firstTriggeredAt,
      lastTriggeredAt,
      // getters
      hasTriggeredBefore,
      triggerMessage,
      // actions
      trigger,
      reset,
    }
  },
  {
    // Configuración de persistencia
    persist: {
      key: 'pokemon-easter-egg', // clave en localStorage
      pick: ['timesTriggered', 'firstTriggeredAt', 'lastTriggeredAt'], // solo persistir estos campos
    },
  },
)

// https://tenor.com/bIpTx.gif