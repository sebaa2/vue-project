import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Swal from 'sweetalert2'
import rayquazaGif from '../assets/images/pokemon-rayquaza.gif'
import woChienImg from '../assets/images/live.jpg'
import hidden from '../assets/images/rayquaza.png'
import sound from '../assets/sounds/conga.m4a'

const RAYQUAZA_GIF = rayquazaGif
const WOCHIEN_IMG = woChienImg
const HIDDEN_IMG = hidden

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

    // Nuevo estado para el Easter Egg de la silla
    const sillaTimesTriggered = ref(0)
    const sillaFirstTriggeredAt = ref(null)
    const sillaLastTriggeredAt = ref(null)

    const mikuTimesTriggered = ref(0)
    const mikuFirstTriggeredAt = ref(null)
    const mikuLastTriggeredAt = ref(null)

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
      return `¡wo chien llego! × ${woChienTimesTriggered.value} 🏛️`
    })

    // Getter para el mensaje de la silla
    const sillaTriggerMessage = computed(() => {
      if (sillaTimesTriggered.value === 0) return '¡Encontraste el botón escondido!'
      if (sillaTimesTriggered.value === 1) return '¡Otra vez con la silla!'
      if (sillaTimesTriggered.value < 5) return `¡${sillaTimesTriggered.value} sillazos!`
      return `¡Dale con la silla! × ${sillaTimesTriggered.value} `
    })

    const mikuTriggerMessage = computed(() => {
      if (mikuTimesTriggered.value === 0) return '¡Miku apareció! 🎵'
      if (mikuTimesTriggered.value === 1) return '¡Miku otra vez! 🎤'
      if (mikuTimesTriggered.value < 5) return `¡${mikuTimesTriggered.value} veces con Miku! 🎶`
      return `¡Miku Miku! × ${mikuTimesTriggered.value} 🎧`
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
        title: '🌿 ¡Y AHORA QUE HICISTE!',
        html: `
          <p class="text-green-300 text-sm mb-1">"entra lentamente"</p>
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
        confirmButtonText: '¡Adios!',
        confirmButtonColor: '#16a34a',
        width: 400,
        padding: '2rem',
        backdrop: 'rgba(0, 20, 0, 0.85)',
      })
    }

    // Nueva acción para el Easter Egg de la silla
    const triggerSilla = () => {
      console.log('triggerSilla ejecutado') // Para debugging
      const now = new Date().toLocaleString('es-CL')

      sillaTimesTriggered.value++
      sillaLastTriggeredAt.value = now
      if (sillaTimesTriggered.value === 1) {
        sillaFirstTriggeredAt.value = now
      }

      Swal.fire({
        title: ' ¡OMG!',
        html: `
          <p class="text-blue-300 text-sm mb-1">¡es Rayquaza y trae un silla!</p>
          <p class="text-yellow-400 text-base font-bold mb-4">${sillaTriggerMessage.value}</p>
          <img
            src="${HIDDEN_IMG}"
            alt="Rayquaza escondido"
            class="mx-auto rounded-xl shadow-lg"
            style="max-width: 280px; width: 100%; object-fit: contain;"
          />
          <p class="text-gray-400 text-xs mt-4">
            Activado ${sillaTimesTriggered.value} ${sillaTimesTriggered.value === 1 ? 'vez' : 'veces'}
          </p>
        `,
        background: '#1e293b',
        color: '#ffffff',
        confirmButtonText: '¡Sí, dale!',
        confirmButtonColor: '#f59e0b',
        width: 400,
        padding: '2rem',
        backdrop: 'rgba(0, 0, 0, 0.85)',
      })
    }

    const triggerMiku = () => {
      const now = new Date().toLocaleString('es-CL')

      mikuTimesTriggered.value++
      mikuLastTriggeredAt.value = now
      if (mikuTimesTriggered.value === 1) {
        mikuFirstTriggeredAt.value = now
      }
      Swal.fire({
        title: '🎵 ¡MIKU APARECIÓ! 🎵',
        html: `
      <p class="text-pink-300 text-sm mb-1">"Miku Miku ni shite ageru♪"</p>
      <p class="text-purple-400 text-xs font-bold mb-4">${mikuTriggerMessage.value}</p>
      <div class="flex justify-center mb-4">
        <div class="text-8xl animate-bounce">🎤</div>
      </div>
      <p class="text-gray-400 text-xs mt-4">
        Invocada ${mikuTimesTriggered.value} ${mikuTimesTriggered.value === 1 ? 'vez' : 'veces'}
      </p>
    `,
        background: '#1a1a2e',
        color: '#ffffff',
        confirmButtonText: '¡Miku Miku!',
        confirmButtonColor: '#ec489a',
        width: 400,
        padding: '2rem',
        backdrop: 'rgba(0, 0, 30, 0.85)',
        didDestroy: () => {
          // audio.pause()
          // audio.currentTime = 0
        },
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

    const resetSilla = () => {
      sillaTimesTriggered.value = 0
      sillaFirstTriggeredAt.value = null
      sillaLastTriggeredAt.value = null
    }

    const resetMiku = () => {
      mikuTimesTriggered.value = 0
      mikuFirstTriggeredAt.value = null
      mikuLastTriggeredAt.value = null
    }

    // Asegurarse de que todas las funciones estén en el return
    return {
      // state
      timesTriggered,
      firstTriggeredAt,
      lastTriggeredAt,
      woChienTimesTriggered,
      woChienFirstTriggeredAt,
      woChienLastTriggeredAt,
      sillaTimesTriggered,
      sillaFirstTriggeredAt,
      sillaLastTriggeredAt,
      // getters
      hasTriggeredBefore,
      triggerMessage,
      woChienTriggerMessage,
      sillaTriggerMessage,
      // actions - VERIFICAR QUE TODAS ESTÉN AQUÍ
      trigger,
      triggerWoChien,
      triggerSilla, // Asegurar que esta línea existe
      reset,
      resetWoChien,
      resetSilla,

      mikuTimesTriggered,
      mikuFirstTriggeredAt,
      mikuLastTriggeredAt,
      // ... existing getters
      mikuTriggerMessage,
      // ... existing actions
      triggerMiku,
      resetMiku,
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
        'sillaTimesTriggered',
        'sillaFirstTriggeredAt',
        'sillaLastTriggeredAt',

        'mikuTimesTriggered',
        'mikuFirstTriggeredAt',
        'mikuLastTriggeredAt',
      ],
    },
  },
)

// https://tenor.com/bIpTx.gif
