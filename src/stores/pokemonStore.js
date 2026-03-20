// stores/pokemonStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getPokemon } from '../helpers/getPokemon.js'
import { getSpecies } from '../helpers/getSpecies.js'
import { getEvolutionChain } from '../helpers/getEvo.js'
import { getMoves } from '../helpers/getMoves.js'
import { formatTipos } from '../config/arrayTipo.js'
import {
  shouldUseShowdown,
  getShowdownSpritesWithFallback,
  CHERRIM_SUNSHINE_SPRITES,
} from '../helpers/showdownSprites.js'
import Swal from 'sweetalert2'
import { usePokemonCacheStore } from './pokemonCacheStore.js'

export const usePokemonStore = defineStore(
  'pokemon',
  () => {
    // ==================== STATE ====================
    const pokemon = ref(null)
    const forms = ref([])
    const evolutions = ref([])
    const movesPokemon = ref([])
    const isLoading = ref(false)
    const prefetchEnabled = ref(true)
    const loadingFromCache = ref(false) // NUEVO: faltaba esta variable

    // CORRECCIÓN: Usar objeto simple en lugar de Map para persistencia
    const fallbackSpritesStatus = ref({}) // Objeto: { pokemonId: boolean }

    // CORRECCIÓN: Timeouts como objeto simple
    const activeTimeouts = ref({
      prefetch: null,
      evolution: null,
      forms: {}, // Objeto: { formId: timeoutId }
    })

    // Obtener instancia del caché de Pokémon
    const pokemonCache = usePokemonCacheStore()

    // ==================== GETTERS ====================
    const stats = computed(() => {
      if (!pokemon.value) return []
      return pokemon.value.stats.map((stat) => stat.base_stat)
    })

    const types = computed(() => {
      if (!pokemon.value) return []
      return pokemon.value.types.map((type) => type.type.name)
    })

    const formattedTypes = computed(() => {
      return types.value.map((type) => formatTipos(type))
    })

    const currentSprite = computed(() => {
      if (!pokemon.value) return {}
      const spriteTypes = ['front_default', 'front_shiny', 'back_default', 'back_shiny']
      const sprites = {}

      // CORRECCIÓN: Acceder al objeto en lugar de Map
      const useFallback = fallbackSpritesStatus.value[pokemon.value.id] || false

      spriteTypes.forEach((type) => {
        if (useFallback && pokemon.value._fallbackSprites) {
          sprites[type] = pokemon.value._fallbackSprites[type]
        } else {
          sprites[type] = pokemon.value.sprites[type]
        }
      })

      return sprites
    })

    const filteredForms = computed(() => {
      const order = ['10', '50', 'complete', 'mega']
      return forms.value
        .filter(
          (form) =>
            !form.pokemon.name.includes('koraidon') &&
            !form.pokemon.name.includes('miraidon') &&
            form.pokemon.name !== 'zygarde-10-power-construct' &&
            form.pokemon.name !== 'zygarde-50-power-construct',
        )
        .sort((a, b) => {
          const getOrder = (name) => {
            const match = order.findIndex((key) => name.includes(key))
            return match === -1 ? order.length : match
          }
          return getOrder(a.pokemon.name) - getOrder(b.pokemon.name)
        })
    })

    const uniqueMoveTypes = computed(() => {
      if (!movesPokemon.value.length) return []
      const tiposEnIngles = new Set(movesPokemon.value.map((move) => move.type))
      const tiposConEspanol = Array.from(tiposEnIngles).map((tipo) => ({
        value: tipo,
        label: formatTipos(tipo).tipo,
      }))
      tiposConEspanol.sort((a, b) => a.label.localeCompare(b.label))
      return tiposConEspanol
    })

    const uniqueCategories = computed(() => {
      if (!movesPokemon.value.length) return []
      const categoriasEnIngles = new Set(movesPokemon.value.map((move) => move.category))
      return Array.from(categoriasEnIngles).map((cat) => ({
        value: cat,
        label:
          cat === 'physical'
            ? 'Físico'
            : cat === 'special'
              ? 'Especial'
              : cat === 'status'
                ? 'Estado'
                : cat,
      }))
    })

    const isFromCache = computed(() => loadingFromCache.value)

    // Getter para saber si hay timeouts activos
    const hasActiveTimeouts = computed(() => {
      return (
        activeTimeouts.value.prefetch !== null ||
        activeTimeouts.value.evolution !== null ||
        Object.keys(activeTimeouts.value.forms).length > 0
      )
    })

    // ==================== HELPERS ====================
    const applySprites = (pokemonData) => {
      const pokemonName = pokemonData.name
      console.log(`🎨 Aplicando sprites para: ${pokemonName}`)

      if (pokemonName === 'cherrim-sunshine') {
        pokemonData.sprites = { ...pokemonData.sprites, ...CHERRIM_SUNSHINE_SPRITES }
        pokemonData._fallbackSprites = null
      } else if (shouldUseShowdown(pokemonName)) {
        const showdownSprites = getShowdownSpritesWithFallback(pokemonName)
        pokemonData.sprites = { ...pokemonData.sprites, ...showdownSprites.animated }
        pokemonData._fallbackSprites = showdownSprites.fallback

        // Resetear estado de fallback para este Pokémon
        fallbackSpritesStatus.value[pokemonData.id] = false
      }

      return pokemonData
    }

    const getBaseSpeciesId = async (pokemonName, currentId) => {
      if (!pokemonName.includes('-')) return currentId

      // Intentar obtener del caché primero
      const cacheKey = `species_base_${pokemonName.split('-')[0]}`
      const cachedBaseId = pokemonCache.getMetadata(cacheKey)

      if (cachedBaseId) {
        console.log(`📀 Especie base desde caché: ${cachedBaseId}`)
        return cachedBaseId
      }

      try {
        const baseName = pokemonName.split('-')[0]
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${baseName}`)
        if (speciesRes.ok) {
          const speciesData = await speciesRes.json()
          const baseId = speciesData.id

          // Guardar en caché
          pokemonCache.setMetadata(cacheKey, baseId)

          return baseId
        }
      } catch (error) {
        console.error('Error obteniendo especie base:', error)
      }

      return currentId
    }

    // Función para limpiar timeouts
    const clearAllTimeouts = () => {
      // Limpiar prefetch
      if (activeTimeouts.value.prefetch) {
        clearTimeout(activeTimeouts.value.prefetch)
        activeTimeouts.value.prefetch = null
      }

      // Limpiar evolution
      if (activeTimeouts.value.evolution) {
        clearTimeout(activeTimeouts.value.evolution)
        activeTimeouts.value.evolution = null
      }

      // Limpiar timeouts de formas
      Object.values(activeTimeouts.value.forms).forEach((timeout) => {
        clearTimeout(timeout)
      })
      activeTimeouts.value.forms = {}

      console.log('🧹 Todos los timeouts limpiados')
    }

    // ==================== PREFETCHING CON TIMEOUTS REACTIVOS ====================

    const prefetchNextPokemon = (currentId) => {
      if (!prefetchEnabled.value) return
      if (!currentId) return

      const nextId = currentId + 1
      if (nextId > 1025) return

      // Limpiar timeout anterior si existe
      if (activeTimeouts.value.prefetch) {
        clearTimeout(activeTimeouts.value.prefetch)
        activeTimeouts.value.prefetch = null
      }

      // Crear nuevo timeout
      activeTimeouts.value.prefetch = setTimeout(() => {
        if (!pokemonCache.hasPokemon(nextId)) {
          console.log(`🔄 Precargando Pokémon #${nextId}...`)

          getPokemon(nextId)
            .then((data) => {
              const processedData = applySprites(data)
              pokemonCache.setPokemon(nextId, processedData)
              console.log(`✅ Pokémon #${nextId} precargado`)
            })
            .catch((err) => console.error(`Error precargando #${nextId}:`, err))
            .finally(() => {
              activeTimeouts.value.prefetch = null
            })
        } else {
          activeTimeouts.value.prefetch = null
        }
      }, 2000)
    }

    const prefetchMainEvolution = (evolutionChain) => {
      if (!prefetchEnabled.value) return
      if (!evolutionChain || evolutionChain.length === 0) return

      const mainEvolution = evolutionChain[0]
      if (!mainEvolution || !mainEvolution.id) return

      // Limpiar timeout anterior
      if (activeTimeouts.value.evolution) {
        clearTimeout(activeTimeouts.value.evolution)
        activeTimeouts.value.evolution = null
      }

      // Crear nuevo timeout
      activeTimeouts.value.evolution = setTimeout(() => {
        if (!pokemonCache.hasPokemon(mainEvolution.id)) {
          console.log(`🔄 Precargando evolución: ${mainEvolution.name}...`)

          getPokemon(mainEvolution.id)
            .then((data) => {
              const processedData = applySprites(data)
              pokemonCache.setPokemon(mainEvolution.id, processedData)
              console.log(`✅ Evolución ${mainEvolution.name} precargada`)
            })
            .catch((err) => console.error(`Error precargando evolución:`, err))
            .finally(() => {
              activeTimeouts.value.evolution = null
            })
        } else {
          activeTimeouts.value.evolution = null
        }
      }, 3000)
    }

    const prefetchForms = async (formsList, currentFormId) => {
      if (!prefetchEnabled.value) return
      if (!formsList || formsList.length === 0) return

      // Tomar máximo 3 formas para precargar
      const formsToPrefetch = formsList
        .filter((form) => {
          const formId = form.pokemon.url.split('/').filter(Boolean).pop()
          return formId != currentFormId && !pokemonCache.hasPokemon(parseInt(formId))
        })
        .slice(0, 3)

      formsToPrefetch.forEach((form, index) => {
        const formId = form.pokemon.url.split('/').filter(Boolean).pop()

        // Limpiar timeout existente para esta forma
        if (activeTimeouts.value.forms[formId]) {
          clearTimeout(activeTimeouts.value.forms[formId])
          delete activeTimeouts.value.forms[formId]
        }

        // Crear timeout con delay progresivo
        const timeout = setTimeout(
          () => {
            console.log(`🔄 Precargando forma: ${form.pokemon.name}...`)

            getPokemon(formId)
              .then((data) => {
                const processedData = applySprites(data)
                pokemonCache.setPokemon(parseInt(formId), processedData)
                console.log(`✅ Forma ${form.pokemon.name} precargada`)
              })
              .catch((err) => console.error(`Error precargando forma:`, err))
              .finally(() => {
                delete activeTimeouts.value.forms[formId]
              })
          },
          4000 + index * 1000,
        )

        activeTimeouts.value.forms[formId] = timeout
      })
    }

    const togglePrefetch = () => {
      prefetchEnabled.value = !prefetchEnabled.value
      console.log(`⚡ Prefetching ${prefetchEnabled.value ? 'activado' : 'desactivado'}`)

      if (!prefetchEnabled.value) {
        clearAllTimeouts()
      }
    }

    // ==================== ACTIONS ====================

    const loadPokemon = async (id) => {
      // Limpiar timeouts anteriores
      clearAllTimeouts()

      isLoading.value = true
      loadingFromCache.value = false

      const cachedPokemon = pokemonCache.getPokemon(id)

      if (cachedPokemon) {
        console.log(`📀 Cargando Pokémon ${id} desde caché`)
        loadingFromCache.value = true

        // Restaurar estado de fallback desde caché
        const savedFallbackStatus = pokemonCache.getMetadata(`fallback_${id}`)
        if (savedFallbackStatus !== undefined) {
          fallbackSpritesStatus.value[id] = savedFallbackStatus
        }

        pokemon.value = cachedPokemon

        Swal.fire({
          title: 'Cargando desde caché...',
          text: 'Cargando datos adicionales...',
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => Swal.showLoading(),
        })

        try {
          const speciesId = await getBaseSpeciesId(cachedPokemon.name, id)

          const [speciesForms, evolutionChain, moves] = await Promise.all([
            getSpecies(speciesId),
            getEvolutionChain(speciesId, cachedPokemon.name),
            getMoves(cachedPokemon.moves),
          ])

          forms.value = speciesForms
          evolutions.value = evolutionChain
          movesPokemon.value = moves

          if (evolutionChain && evolutionChain.length > 0) {
            prefetchMainEvolution(evolutionChain)
          }
          prefetchNextPokemon(id)

          if (speciesForms && speciesForms.length > 1) {
            prefetchForms(speciesForms, id)
          }

          Swal.close()
        } catch (error) {
          console.error('Error cargando datos adicionales:', error)
          Swal.fire({
            icon: 'warning',
            title: 'Datos incompletos',
            text: 'Algunos datos se cargaron desde caché, pero hubo un error con datos adicionales',
          })
        } finally {
          isLoading.value = false
        }

        return
      }

      // Si no está en caché, cargar normalmente
      console.log(`🌐 Cargando Pokémon ${id} desde API`)
      pokemon.value = null

      Swal.fire({
        title: 'Cargando Pokémon...',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      })

      try {
        let pokemonData = await getPokemon(id)
        pokemonData = applySprites(pokemonData)
        pokemon.value = pokemonData

        const speciesId = await getBaseSpeciesId(pokemonData.name, id)

        const [speciesForms, evolutionChain, moves] = await Promise.all([
          getSpecies(speciesId),
          getEvolutionChain(speciesId, pokemonData.name),
          getMoves(pokemonData.moves),
        ])

        forms.value = speciesForms
        evolutions.value = evolutionChain
        movesPokemon.value = moves

        pokemonCache.setPokemon(id, pokemonData)
        pokemonCache.setMetadata(`fallback_${id}`, false)

        if (evolutionChain && evolutionChain.length > 0) {
          prefetchMainEvolution(evolutionChain)
        }
        prefetchNextPokemon(id)

        if (speciesForms && speciesForms.length > 1) {
          prefetchForms(speciesForms, id)
        }
      } catch (error) {
        console.error('Error cargando Pokémon:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el Pokémon',
        })
      } finally {
        isLoading.value = false
        Swal.close()
      }
    }

    const selectForm = async (form) => {
      clearAllTimeouts()

      isLoading.value = true
      loadingFromCache.value = false
      pokemon.value = null

      Swal.fire({
        title: 'Cargando forma...',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      })

      try {
        const formId = parseInt(form.pokemon.url.split('/').filter(Boolean).pop())
        const cachedForm = pokemonCache.getPokemon(formId)

        if (cachedForm) {
          console.log(`📀 Cargando forma ${formId} desde caché`)
          loadingFromCache.value = true

          const savedFallbackStatus = pokemonCache.getMetadata(`fallback_${formId}`)
          if (savedFallbackStatus !== undefined) {
            fallbackSpritesStatus.value[formId] = savedFallbackStatus
          }

          pokemon.value = cachedForm

          const speciesId = await getBaseSpeciesId(cachedForm.name, cachedForm.id)
          forms.value = await getSpecies(speciesId)
          const moves = await getMoves(cachedForm.moves)
          movesPokemon.value = moves
        } else {
          const res = await fetch(form.pokemon.url)
          let data = await res.json()
          data = applySprites(data)
          pokemon.value = data

          pokemonCache.setPokemon(data.id, data)
          pokemonCache.setMetadata(`fallback_${data.id}`, false)

          const speciesId = await getBaseSpeciesId(data.name, data.id)
          forms.value = await getSpecies(speciesId)

          const moves = await getMoves(data.moves)
          movesPokemon.value = moves
        }

        if (evolutions.value && evolutions.value.length > 0) {
          prefetchMainEvolution(evolutions.value)
        }
        prefetchNextPokemon(pokemon.value.id)

        if (forms.value && forms.value.length > 1) {
          prefetchForms(forms.value, pokemon.value.id)
        }
      } catch (error) {
        console.error('Error cargando forma:', error)
      } finally {
        isLoading.value = false
        Swal.close()
      }
    }

const goToEvolution = async (evolutionName) => {
  let pokemonId
  
  // Casos especiales que necesitan mapeo explícito
  const specialEvolutions = {
    'dudunsparce': 'dudunsparce-two-segment', // Por defecto la forma de 2 segmentos
    'urshifu': 892,
    'urshifu-rapid-strike': 892,
    'urshifu-single-strike': 892
  }
  
  if (specialEvolutions[evolutionName]) {
    if (typeof specialEvolutions[evolutionName] === 'number') {
      pokemonId = specialEvolutions[evolutionName]
    } else {
      // Es un nombre de forma, buscar por nombre
      const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${specialEvolutions[evolutionName]}/`)
      const pokemonData = await pokemonRes.json()
      pokemonId = pokemonData.id
    }
  } else {
    const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${evolutionName}/`)
    const pokemonData = await pokemonRes.json()
    pokemonId = pokemonData.id
  }
  
  await loadPokemon(pokemonId)
}

    const handleImageError = (e, notFoundImg) => {
      if (!pokemon.value) return

      const currentFallbackStatus = fallbackSpritesStatus.value[pokemon.value.id] || false

      if (!currentFallbackStatus && shouldUseShowdown(pokemon.value.name)) {
        fallbackSpritesStatus.value[pokemon.value.id] = true
        pokemonCache.setMetadata(`fallback_${pokemon.value.id}`, true)
        console.log(`🖼️ Activando fallback sprites para ${pokemon.value.name}`)
      } else {
        e.target.src = notFoundImg
      }
    }

    const refreshPokemon = async () => {
      if (pokemon.value) {
        const id = pokemon.value.id
        pokemonCache.removePokemon(id)
        delete fallbackSpritesStatus.value[id]
        pokemonCache.removeMetadata(`fallback_${id}`)
        await loadPokemon(id)
      }
    }

    const cleanup = () => {
      clearAllTimeouts()
    }

    return {
      // state
      pokemon,
      forms,
      evolutions,
      movesPokemon,
      isLoading,
      prefetchEnabled,
      loadingFromCache,
      fallbackSpritesStatus,
      activeTimeouts,
      // getters
      stats,
      types,
      formattedTypes,
      currentSprite,
      filteredForms,
      uniqueMoveTypes,
      uniqueCategories,
      isFromCache,
      hasActiveTimeouts,
      // actions
      loadPokemon,
      selectForm,
      goToEvolution,
      handleImageError,
      refreshPokemon,
      togglePrefetch,
      cleanup,
    }
  },
  {
    persist: {
      key: 'pokemon-store',
      storage: localStorage,
      paths: ['prefetchEnabled', 'fallbackSpritesStatus'], // Persistir fallbackSpritesStatus
    },
  },
)
