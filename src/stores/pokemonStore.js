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
import { useHistoryStore } from './historyStore.js'

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
    const loadingFromCache = ref(false)

    const fallbackSpritesStatus = ref({})

    const activeTimeouts = ref({
      prefetch: null,
      evolution: null,
      forms: {},
    })

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
      if (!pokemon.value) return []
      const typesList = pokemon.value.types.map((type) => {
        if (typeof type === 'string') {
          return formatTipos(type)
        }
        return formatTipos(type.type?.name || type)
      })
      return typesList
    })

    const currentSprite = computed(() => {
      if (!pokemon.value) return {}
      const spriteTypes = ['front_default', 'front_shiny', 'back_default', 'back_shiny']
      const sprites = {}

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

    const hasActiveTimeouts = computed(() => {
      return (
        activeTimeouts.value.prefetch !== null ||
        activeTimeouts.value.evolution !== null ||
        Object.keys(activeTimeouts.value.forms).length > 0
      )
    })

    const abilities = computed(() => {
      if (!pokemon.value) return []
      return pokemon.value.abilities || []
    })

    const normalAbilities = computed(() => {
      return abilities.value.filter((a) => !a.is_hidden)
    })

    const hiddenAbility = computed(() => {
      const hidden = abilities.value.find((a) => a.is_hidden)
      return hidden || null
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

        fallbackSpritesStatus.value[pokemonData.id] = false
      }

      return pokemonData
    }

    const getBaseSpeciesId = async (pokemonName, currentId) => {
      if (!pokemonName.includes('-')) return currentId

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

          pokemonCache.setMetadata(cacheKey, baseId)

          return baseId
        }
      } catch (error) {
        console.error('Error obteniendo especie base:', error)
      }

      return currentId
    }

    const clearAllTimeouts = () => {
      if (activeTimeouts.value.prefetch) {
        clearTimeout(activeTimeouts.value.prefetch)
        activeTimeouts.value.prefetch = null
      }

      if (activeTimeouts.value.evolution) {
        clearTimeout(activeTimeouts.value.evolution)
        activeTimeouts.value.evolution = null
      }

      Object.values(activeTimeouts.value.forms).forEach((timeout) => {
        clearTimeout(timeout)
      })
      activeTimeouts.value.forms = {}

      console.log('🧹 Todos los timeouts limpiados')
    }

    // ==================== PREFETCHING ====================
    const prefetchNextPokemon = (currentId) => {
      if (!prefetchEnabled.value) return
      if (!currentId) return

      const nextId = currentId + 1
      if (nextId > 1025) return

      if (activeTimeouts.value.prefetch) {
        clearTimeout(activeTimeouts.value.prefetch)
        activeTimeouts.value.prefetch = null
      }

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

      if (activeTimeouts.value.evolution) {
        clearTimeout(activeTimeouts.value.evolution)
        activeTimeouts.value.evolution = null
      }

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

      const formsToPrefetch = formsList
        .filter((form) => {
          const urlParts = form.pokemon.url.split('/').filter(Boolean)
          const lastPart = urlParts.pop()
          const formId = parseInt(lastPart)
          const isValidId = !isNaN(formId) && formId > 0
          const formIdentifier = isValidId ? formId : lastPart

          // Verificar si ya está en caché (por ID o por nombre)
          const isCached = isValidId
            ? pokemonCache.hasPokemon(formId)
            : pokemonCache.hasPokemonByName?.(lastPart) || false

          return formIdentifier != currentFormId && !isCached
        })
        .slice(0, 3)

      formsToPrefetch.forEach((form, index) => {
        const urlParts = form.pokemon.url.split('/').filter(Boolean)
        const lastPart = urlParts.pop()
        const formId = parseInt(lastPart)
        const isValidId = !isNaN(formId) && formId > 0
        const formIdentifier = isValidId ? formId : lastPart

        if (activeTimeouts.value.forms[formIdentifier]) {
          clearTimeout(activeTimeouts.value.forms[formIdentifier])
          delete activeTimeouts.value.forms[formIdentifier]
        }

        const timeout = setTimeout(
          () => {
            console.log(`🔄 Precargando forma: ${form.pokemon.name}...`)

            fetch(form.pokemon.url)
              .then((res) => res.json())
              .then((data) => {
                const processedData = applySprites(data)
                pokemonCache.setPokemon(processedData.id, processedData)
                // También guardar por nombre para búsquedas rápidas
                if (pokemonCache.setPokemonByName) {
                  pokemonCache.setPokemonByName(processedData.name, processedData)
                }
                console.log(`✅ Forma ${form.pokemon.name} precargada`)
              })
              .catch((err) => console.error(`Error precargando forma:`, err))
              .finally(() => {
                delete activeTimeouts.value.forms[formIdentifier]
              })
          },
          4000 + index * 1000,
        )

        activeTimeouts.value.forms[formIdentifier] = timeout
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
      clearAllTimeouts()

      isLoading.value = true
      loadingFromCache.value = false

      const historyStore = useHistoryStore()
      const cachedPokemon = pokemonCache.getPokemon(id)

      if (cachedPokemon) {
        console.log(`📀 Cargando Pokémon ${id} desde caché`)
        loadingFromCache.value = true

        const savedFallbackStatus = pokemonCache.getMetadata(`fallback_${id}`)
        if (savedFallbackStatus !== undefined) {
          fallbackSpritesStatus.value[id] = savedFallbackStatus
        }

        pokemon.value = cachedPokemon

        // Registrar visita
        historyStore.addVisit(cachedPokemon)

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

      console.log(`🌐 Cargando Pokémon ${id} desde API`)
      pokemon.value = null

      try {
        let pokemonData = await getPokemon(id)
        pokemonData = applySprites(pokemonData)
        pokemon.value = pokemonData

        // Registrar visita
        historyStore.addVisit(pokemonData)

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
      }
    }

    const selectForm = async (form) => {
      clearAllTimeouts()

      isLoading.value = true
      loadingFromCache.value = false
      pokemon.value = null

      try {
        const urlParts = form.pokemon.url.split('/').filter(Boolean)
        const lastPart = urlParts.pop()

        // Intentar obtener ID numérico, si falla usar el nombre
        const formIdNum = parseInt(lastPart)
        const isValidId = !isNaN(formIdNum) && formIdNum > 0

        let pokemonIdentifier
        let cachedForm

        if (isValidId) {
          pokemonIdentifier = formIdNum
          cachedForm = pokemonCache.getPokemon(formIdNum)
        } else {
          pokemonIdentifier = lastPart
          // Buscar por nombre si el cache lo soporta
          cachedForm = pokemonCache.getPokemonByName?.(lastPart) || null
        }

        if (cachedForm) {
          console.log(`📀 Cargando forma ${pokemonIdentifier} desde caché`)
          loadingFromCache.value = true

          const savedFallbackStatus = pokemonCache.getMetadata(`fallback_${cachedForm.id}`)
          if (savedFallbackStatus !== undefined) {
            fallbackSpritesStatus.value[cachedForm.id] = savedFallbackStatus
          }

          pokemon.value = cachedForm

          const speciesId = await getBaseSpeciesId(cachedForm.name, cachedForm.id)
          forms.value = await getSpecies(speciesId)
          const moves = await getMoves(cachedForm.moves)
          movesPokemon.value = moves
        } else {
          console.log(`🌐 Cargando forma desde API: ${form.pokemon.url}`)
          const res = await fetch(form.pokemon.url)
          let data = await res.json()
          data = applySprites(data)
          pokemon.value = data

          pokemonCache.setPokemon(data.id, data)
          // Guardar también por nombre si está disponible
          if (pokemonCache.setPokemonByName) {
            pokemonCache.setPokemonByName(data.name, data)
          }
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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la forma del Pokémon',
        })
      } finally {
        isLoading.value = false
      }
    }

    const goToEvolution = async (evolutionName) => {
      let pokemonId

      const specialEvolutions = {
        dudunsparce: 'dudunsparce-two-segment',
        urshifu: 892,
        'urshifu-rapid-strike': 892,
        'urshifu-single-strike': 892,
      }

      if (specialEvolutions[evolutionName]) {
        if (typeof specialEvolutions[evolutionName] === 'number') {
          pokemonId = specialEvolutions[evolutionName]
        } else {
          const pokemonRes = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${specialEvolutions[evolutionName]}/`,
          )
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
      abilities,
      normalAbilities,
      hiddenAbility,
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
      paths: ['prefetchEnabled', 'fallbackSpritesStatus'],
    },
  },
)
