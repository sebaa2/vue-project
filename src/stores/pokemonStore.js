// stores/pokemonStore.js (versión modificada con caché)
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
    const useFallbackSprite = ref(false)
    const loadingFromCache = ref(false) // Nuevo: indica si se cargó desde caché

    // Caché para movimientos (NO se persiste)
    const movesCache = new Map()

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

      spriteTypes.forEach((type) => {
        if (useFallbackSprite.value && pokemon.value._fallbackSprites) {
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

    // Nuevo getter: indica si el Pokémon actual se cargó desde caché
    const isFromCache = computed(() => loadingFromCache.value)

    // ==================== HELPERS ====================
    const applySprites = (pokemonData) => {
      const pokemonName = pokemonData.name
      console.log(pokemonData.name)

      if (pokemonName === 'cherrim-sunshine') {
        pokemonData.sprites = { ...pokemonData.sprites, ...CHERRIM_SUNSHINE_SPRITES }
      } else if (shouldUseShowdown(pokemonName)) {
        const showdownSprites = getShowdownSpritesWithFallback(pokemonName)
        pokemonData.sprites = { ...pokemonData.sprites, ...showdownSprites.animated }
        pokemonData._fallbackSprites = showdownSprites.fallback
      }

      return pokemonData
    }

    const getBaseSpeciesId = async (pokemonName, currentId) => {
      if (!pokemonName.includes('-')) return currentId

      try {
        const baseName = pokemonName.split('-')[0]
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${baseName}`)
        if (speciesRes.ok) {
          const speciesData = await speciesRes.json()
          return speciesData.id
        }
      } catch (error) {
        console.error('Error obteniendo especie base:', error)
      }

      return currentId
    }

    const loadMovesWithCache = async (movesList) => {
      const cacheKey = JSON.stringify(movesList.map((m) => m.move.name).sort())

      if (movesCache.has(cacheKey)) {
        console.log('Usando caché de movimientos')
        return movesCache.get(cacheKey)
      }

      const moves = await getMoves(movesList)
      movesCache.set(cacheKey, moves)

      if (movesCache.size > 50) {
        const firstKey = movesCache.keys().next().value
        movesCache.delete(firstKey)
      }

      return moves
    }

    // Nuevo: cargar datos adicionales (formas y evoluciones) en background
    const loadAdditionalData = async (pokemonData, speciesId) => {
      try {
        const [speciesForms, evolutionChain] = await Promise.all([
          getSpecies(speciesId),
          getEvolutionChain(speciesId, pokemonData.name),
        ])

        forms.value = speciesForms
        evolutions.value = evolutionChain
      } catch (error) {
        console.error('Error cargando datos adicionales:', error)
      }
    }

    // ==================== ACTIONS ====================
    const loadPokemon = async (id) => {
      isLoading.value = true
      loadingFromCache.value = false

      // Verificar si está en caché
      const cachedPokemon = pokemonCache.getPokemon(id)

      if (cachedPokemon) {
        console.log(`📀 Cargando Pokémon ${id} desde caché`)
        loadingFromCache.value = true

        // Cargar datos principales desde caché
        pokemon.value = cachedPokemon

        // Intentar cargar movimientos desde caché si existen
        const cachedMovesKey = `moves_${id}`
        // Los movimientos se cargarán normalmente pero podrían estar en movesCache

        Swal.fire({
          title: 'Cargando desde caché...',
          text: 'Cargando datos adicionales...',
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => Swal.showLoading(),
        })

        try {
          // Cargar datos adicionales en background
          const speciesId = await getBaseSpeciesId(cachedPokemon.name, id)
          await loadAdditionalData(cachedPokemon, speciesId)

          // Cargar movimientos
          const moves = await loadMovesWithCache(cachedPokemon.moves)
          movesPokemon.value = moves

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
        useFallbackSprite.value = false

        let pokemonData = await getPokemon(id)
        pokemonData = applySprites(pokemonData)
        pokemon.value = pokemonData

        const speciesId = await getBaseSpeciesId(pokemonData.name, id)

        const [speciesForms, evolutionChain, moves] = await Promise.all([
          getSpecies(speciesId),
          getEvolutionChain(speciesId, pokemonData.name),
          loadMovesWithCache(pokemonData.moves),
        ])

        forms.value = speciesForms
        evolutions.value = evolutionChain
        movesPokemon.value = moves

        // Guardar en caché
        pokemonCache.setPokemon(id, pokemonData)
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
        useFallbackSprite.value = false

        // Verificar si la forma está en caché
        const formId = form.pokemon.url.split('/').filter(Boolean).pop()
        const cachedForm = pokemonCache.getPokemon(formId)

        if (cachedForm) {
          console.log(`📀 Cargando forma ${formId} desde caché`)
          loadingFromCache.value = true
          pokemon.value = cachedForm

          const speciesId = await getBaseSpeciesId(cachedForm.name, cachedForm.id)
          forms.value = await getSpecies(speciesId)
          const moves = await loadMovesWithCache(cachedForm.moves)
          movesPokemon.value = moves
        } else {
          const res = await fetch(form.pokemon.url)
          let data = await res.json()
          data = applySprites(data)
          pokemon.value = data

          // Guardar en caché
          pokemonCache.setPokemon(data.id, data)

          const speciesId = await getBaseSpeciesId(data.name, data.id)
          forms.value = await getSpecies(speciesId)

          const moves = await loadMovesWithCache(data.moves)
          movesPokemon.value = moves
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
      if (
        evolutionName === 'urshifu' ||
        evolutionName === 'urshifu-rapid-strike' ||
        evolutionName === 'urshifu-single-strike'
      ) {
        pokemonId = 892
      } else {
        const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${evolutionName}/`)
        const pokemonData = await pokemonRes.json()
        pokemonId = pokemonData.id
      }

      await loadPokemon(pokemonId)
    }

    const handleImageError = (e, notFoundImg) => {
      if (!useFallbackSprite.value && pokemon.value && shouldUseShowdown(pokemon.value.name)) {
        useFallbackSprite.value = true
      } else {
        e.target.src = notFoundImg
      }
    }

    const clearMovesCache = () => {
      movesCache.clear()
      console.log('Caché de movimientos limpiado')
    }

    const refreshPokemon = async () => {
      if (pokemon.value) {
        const id = pokemon.value.id
        // Eliminar de caché para forzar recarga
        pokemonCache.removePokemon(id)
        await loadPokemon(id)
      }
    }

    return {
      // state
      pokemon,
      forms,
      evolutions,
      movesPokemon,
      isLoading,
      useFallbackSprite,
      loadingFromCache,
      // getters
      stats,
      types,
      formattedTypes,
      currentSprite,
      filteredForms,
      uniqueMoveTypes,
      uniqueCategories,
      isFromCache,
      // actions
      loadPokemon,
      selectForm,
      goToEvolution,
      handleImageError,
      clearMovesCache,
      refreshPokemon,
    }
  },
  {
    persist: {
      key: 'pokemon-store',
      storage: localStorage,
      paths: ['useFallbackSprite'],
      // No persistir datos de Pokémon, solo usar caché separado
    },
  },
)
