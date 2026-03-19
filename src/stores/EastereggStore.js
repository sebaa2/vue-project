import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Swal from 'sweetalert2'
import rayquazaGif from '../assets/images/pokemon-rayquaza.gif'
import woChienImg from '../assets/images/live.jpg'
import sound from '../assets/sounds/conga.m4a'

const RAYQUAZA_GIF = rayquazaGif
const WOCHIEN_IMG = woChienImg

export const useEasterEggStore = defineStore(
  'easterEgg',
  () => {
    // ==================== STATE ====================
    const timesTriggered = ref(0)
    const firstTriggeredAt = ref(null)
    const lastTriggeredAt = ref(null)

    const woChienTimesTriggered = ref(0)
    const woChienFirstTriggeredAt = ref(null)
    const woChienLastTriggeredAt = ref(null)

    // ==================== GETTERS ====================
    const hasTriggeredBefore = computed(() => timesTriggered.value > 0)

    const triggerMessage = computed(() => {
      if (timesTriggered.value === 0) return '¡Lo encontraste por primera vez!'
      if (timesTriggered.value === 1) return '¡Ya lo sabías! 👀'
      if (timesTriggered.value < 5) return `¡${timesTriggered.value} veces y contando! 🔥`
      return `¡mira! × ${timesTriggered.value} 🏆`
    })

    const woChienTriggerMessage = computed(() => {
      if (woChienTimesTriggered.value === 0) return '¡Invocaste a Wo-Chien!'
      if (woChienTimesTriggered.value === 1) return '¡Volviste a invocar las runas! 📜'
      if (woChienTimesTriggered.value < 5) return `¡${woChienTimesTriggered.value} invocaciones! 🌿`
      return `¡Maestro de las Ruinas! × ${woChienTimesTriggered.value} 🏛️`
    })

    // ==================== ACTIONS ====================
    const trigger = () => {
      const now = new Date().toLocaleString('es-CL')

      timesTriggered.value++
      lastTriggeredAt.value = now
      if (timesTriggered.value === 1) {
        firstTriggeredAt.value = now
      }

      const audio = new Audio(sound)
      audio.volume = 1
      audio.play()

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
        didDestroy: () => {
          // Detener el audio al cerrar el modal
          audio.pause()
          audio.currentTime = 0
        },
      })
    }

    const triggerWoChien = () => {
      const now = new Date().toLocaleString('es-CL')

      woChienTimesTriggered.value++
      woChienLastTriggeredAt.value = now
      if (woChienTimesTriggered.value === 1) woChienFirstTriggeredAt.value = now

      Swal.fire({
        title: '🌿 ¡WO-CHIEN APARECIÓ!',
        html: `
          <p class="text-green-300 text-sm mb-1">"wo-chien"</p>
          <p class="text-yellow-400 text-xs font-bold mb-4">${woChienTriggerMessage.value}</p>
          <img
            src="${WOCHIEN_IMG}"
            alt="Wo-Chien live reaction"
            class="mx-auto rounded-xl shadow-lg"
            style="max-width: 280px; width: 100%;"
          />
          <p class="text-gray-400 text-xs mt-4">
            Invocado ${woChienTimesTriggered.value} ${woChienTimesTriggered.value === 1 ? 'vez' : 'veces'}
          </p>
        `,
        background: '#0f2010',
        color: '#ffffff',
        confirmButtonText: '¡Las runas hablan!',
        confirmButtonColor: '#16a34a',
        width: 400,
        padding: '2rem',
        backdrop: 'rgba(0, 20, 0, 0.85)',
      })
    }

    const reset = () => {
      timesTriggered.value = 0
      firstTriggeredAt.value = null
      lastTriggeredAt.value = null
    }

    const resetWoChien = () => {
      woChienTimesTriggered.value = 0
      woChienFirstTriggeredAt.value = null
      woChienLastTriggeredAt.value = null
    }

    return {
      // state
      timesTriggered,
      firstTriggeredAt,
      lastTriggeredAt,
      woChienTimesTriggered,
      woChienFirstTriggeredAt,
      woChienLastTriggeredAt,
      // getters
      hasTriggeredBefore,
      triggerMessage,
      woChienTriggerMessage,
      // actions
      trigger,
      triggerWoChien,
      reset,
      resetWoChien,
    }
  },
  {
    persist: {
      key: 'pokemon-easter-egg',
      pick: [
        'timesTriggered',
        'firstTriggeredAt',
        'lastTriggeredAt',
        'woChienTimesTriggered',
        'woChienFirstTriggeredAt',
        'woChienLastTriggeredAt',
      ],
    },
  },
)

// https://tenor.com/bIpTx.gif
