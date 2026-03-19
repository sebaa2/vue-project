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
      return forms.value.filter(
        (form) =>
          !form.pokemon.name.includes('koraidon') && !form.pokemon.name.includes('miraidon'),
      )
    })

    // ==================== HELPERS ====================
    const applySprites = (pokemonData) => {
      const pokemonName = pokemonData.name
      console.log(pokemonData.name)
      /*
    condicion especial para traer el sprite de cherrim
    (R: su forma solo se activa en batalla + sol)
    */
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

    // ==================== ACTIONS ====================
    const loadPokemon = async (id) => {
      isLoading.value = true
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
          getEvolutionChain(speciesId),
          getMoves(pokemonData.moves),
        ])

        forms.value = speciesForms
        evolutions.value = evolutionChain
        movesPokemon.value = moves
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
      pokemon.value = null

      Swal.fire({
        title: 'Cargando forma...',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      })

      try {
        useFallbackSprite.value = false

        const res = await fetch(form.pokemon.url)
        let data = await res.json()
        data = applySprites(data)
        pokemon.value = data

        const speciesId = await getBaseSpeciesId(data.name, data.id)
        forms.value = await getSpecies(speciesId)
      } catch (error) {
        console.error('Error cargando forma:', error)
      } finally {
        isLoading.value = false
        Swal.close()
      }
    }

    const goToEvolution = async (evolutionName) => {
      let pokemonId
      // condiciones especiales para urshifu
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

    return {
      // state
      pokemon,
      forms,
      evolutions,
      movesPokemon,
      isLoading,
      useFallbackSprite,
      // getters
      stats,
      types,
      formattedTypes,
      currentSprite,
      filteredForms,
      // actions
      loadPokemon,
      selectForm,
      goToEvolution,
      handleImageError,
    }
  },
  {
    persist: true,
  },
)
