import { computed, onMounted, ref, watch } from 'vue'
import { pkmnDataService } from '@/services/competitive/pkmnDataService.js'
import { pokemonShowdownService } from '@/services/competitive/pokemonShowdownService.js'
import { pokeApiService } from '@/services/competitive/pokeApiService.js'
import { pokeKitService } from '@/services/competitive/pokeKitService.js'
import { smogonStatsService } from '@/services/competitive/smogonStatsService.js'
import {
  DEFAULT_COMPARISON_FORMAT_ID,
  DEFAULT_FORMAT_ID,
  COMPETITIVE_FORMATS,
  getFormatById,
} from '@/services/competitive/formats.js'
import {
  normalizeFormatStats,
  normalizePokeKitStats,
  normalizePopularSets,
  toPokemonId,
} from '@/services/competitive/normalizers.js'
import { getTipoEnEspanol } from '@/config/arrayTipo.js'

function getDisplayEntries(stats, category, resource) {
  return (stats?.[category] ?? []).map((entry) => ({
    ...entry,
    resource,
  }))
}

async function localizeEntries(entries) {
  let failures = 0
  const localized = await Promise.all(
    entries.map(async (entry) => {
      try {
        const result = await pokeApiService.getLocalizedName(entry.resource, entry.id || entry.name)
        return { ...entry, name: result.name }
      } catch {
        failures += 1
        return entry
      }
    }),
  )

  return { entries: localized, failures }
}

async function localizeStats(stats) {
  if (!stats) return { stats: null, failures: 0 }

  const [moves, items, abilities] = await Promise.all([
    localizeEntries(getDisplayEntries(stats, 'moves', 'move')),
    localizeEntries(getDisplayEntries(stats, 'items', 'item')),
    localizeEntries(getDisplayEntries(stats, 'abilities', 'ability')),
  ])

  return {
    stats: { ...stats, moves: moves.entries, items: items.entries, abilities: abilities.entries },
    failures: moves.failures + items.failures + abilities.failures,
  }
}

async function localizeOptions(options, resource) {
  let failures = 0
  const localized = await Promise.all(
    options.map(async (name) => {
      try {
        return (await pokeApiService.getLocalizedName(resource, name)).name
      } catch {
        failures += 1
        return name
      }
    }),
  )

  return { values: localized, failures }
}

async function localizeSets(sets) {
  let failures = 0
  const localizedSets = await Promise.all(
    sets.map(async (set) => {
      const localizedMoves = await Promise.all(
        set.moves.map(async (options) => {
          const result = await localizeOptions(options, 'move')
          failures += result.failures
          return result.values
        }),
      )
      const [items, abilities] = await Promise.all([
        localizeOptions(set.item, 'item'),
        localizeOptions(set.ability, 'ability'),
      ])
      failures += items.failures + abilities.failures

      return {
        ...set,
        moves: localizedMoves,
        item: items.values,
        ability: abilities.values,
      }
    }),
  )

  return { sets: localizedSets, failures }
}

async function loadFormatStats(format) {
  const errors = []

  if (format.pokeKitId) {
    try {
      const dataset = await pokeKitService.getUsage(format.pokeKitId)
      const moveNames = await pokemonShowdownService.getMoveNames()
      return {
        data: normalizePokeKitStats(dataset, moveNames),
        source: `PokéKit · ${dataset.label} · ${dataset.month}`,
      }
    } catch (error) {
      errors.push(error)
    }
  }

  try {
    const stats = await pkmnDataService.getStats(format.pkmnId)
    return {
      data: normalizeFormatStats(stats),
      source: 'data.pkmn.cc · estadísticas de Smogon',
    }
  } catch (pkmnError) {
    errors.push(pkmnError)
    try {
      const snapshot = await smogonStatsService.getLatestFormatStats(format.smogonId)
      return {
        data: normalizeFormatStats(snapshot.data),
        source: `Smogon Stats · ${snapshot.month}`,
      }
    } catch (smogonError) {
      errors.push(smogonError)
      throw new AggregateError(errors, `No se pudieron cargar las estadísticas de ${format.label}.`)
    }
  }
}

export function useCompetitiveDex() {
  const selectedFormatId = ref(DEFAULT_FORMAT_ID)
  const comparisonFormatId = ref(DEFAULT_COMPARISON_FORMAT_ID)
  const searchInput = ref('')
  const selectedPokemon = ref(null)
  const pokemonDetails = ref(null)
  const primaryStats = ref({})
  const comparisonStats = ref({})
  const primarySource = ref('')
  const comparisonSource = ref('')
  const popularSets = ref([])
  const setsUnavailable = ref(false)
  const selectedMove = ref(null)
  const localizationError = ref('')
  const isLoadingFormats = ref(false)
  const isLoadingPokemon = ref(false)
  const isLoadingSets = ref(false)
  const isLoadingMove = ref(false)
  const formatError = ref('')
  const pokemonError = ref('')
  const setsError = ref('')
  const moveError = ref('')
  let formatRequestId = 0
  let pokemonRequestId = 0

  const selectedFormat = computed(() => getFormatById(selectedFormatId.value))
  const comparisonFormat = computed(() => getFormatById(comparisonFormatId.value))
  const pokemonId = computed(() => toPokemonId(selectedPokemon.value?.name))
  const localizedPrimaryStats = ref(null)
  const localizedComparisonStats = ref(null)
  const pokemonCompetitiveStats = computed(
    () => localizedPrimaryStats.value ?? primaryStats.value[pokemonId.value] ?? null,
  )
  const comparisonPokemonStats = computed(
    () => localizedComparisonStats.value ?? comparisonStats.value[pokemonId.value] ?? null,
  )
  const pokemonOptions = computed(() => {
    const needle = toPokemonId(searchInput.value)
    const entries = Object.values(primaryStats.value)
    const comparisonEntries = Object.values(comparisonStats.value)
    const byId = new Map([...entries, ...comparisonEntries].map((pokemon) => [toPokemonId(pokemon.name), pokemon]))

    return [...byId.values()]
      .filter((pokemon) => !needle || toPokemonId(pokemon.name).includes(needle))
      .sort((left, right) => right.usage - left.usage)
      .slice(0, 12)
  })

  const natureDistribution = computed(() => {
    const totals = new Map()
    for (const spread of pokemonCompetitiveStats.value?.spreads ?? []) {
      totals.set(spread.nature, (totals.get(spread.nature) ?? 0) + spread.usage)
    }
    return [...totals.entries()]
      .map(([name, usage]) => ({ name, usage }))
      .sort((left, right) => right.usage - left.usage)
  })

  const comparisonDistributions = computed(() => {
    const categories = [
      { key: 'moves', label: 'Movimientos' },
      { key: 'items', label: 'Objetos' },
      { key: 'abilities', label: 'Habilidades' },
    ]

    return categories.map((category) => {
      const current = new Map(
        (pokemonCompetitiveStats.value?.[category.key] ?? []).map((entry) => [
          entry.id || toPokemonId(entry.name),
          entry,
        ]),
      )
      const comparison = new Map(
        (comparisonPokemonStats.value?.[category.key] ?? []).map((entry) => [
          entry.id || toPokemonId(entry.name),
          entry,
        ]),
      )
      const names = new Set([...current.keys(), ...comparison.keys()])
      const rows = [...names]
        .map((id) => ({
          name: current.get(id)?.name ?? comparison.get(id)?.name ?? id,
          current: current.get(id)?.usage ?? 0,
          comparison: comparison.get(id)?.usage ?? 0,
        }))
        .sort(
          (left, right) =>
            right.current + right.comparison - (left.current + left.comparison),
        )
        .slice(0, 5)

      return { ...category, rows }
    })
  })

  const selectPokemon = async (name) => {
    const requestedName = name.trim()
    if (!requestedName) return

    const requestId = ++pokemonRequestId
    isLoadingPokemon.value = true
    pokemonError.value = ''
    localizationError.value = ''
    setsError.value = ''
    setsUnavailable.value = false
    popularSets.value = []

    try {
      const details = await pokeApiService.getPokemon(requestedName)
      if (requestId !== pokemonRequestId) return

      selectedPokemon.value = details
      pokemonDetails.value = details
      selectedMove.value = null
      localizedPrimaryStats.value = null
      localizedComparisonStats.value = null

      if (!selectedFormat.value) return
      const [primary, comparison] = await Promise.all([
        localizeStats(primaryStats.value[toPokemonId(details.name)]),
        localizeStats(comparisonStats.value[toPokemonId(details.name)]),
      ])
      if (requestId === pokemonRequestId) {
        localizedPrimaryStats.value = primary.stats
        localizedComparisonStats.value = comparison.stats
        if (primary.failures + comparison.failures) {
          localizationError.value = 'Algunos nombres no se pudieron traducir y se muestran en el idioma de la fuente.'
        }
      }
      isLoadingSets.value = true
      try {
        const sets = await pkmnDataService.getSets(selectedFormat.value.pkmnId)
        if (requestId === pokemonRequestId) {
          const normalizedSets = normalizePopularSets(sets, details.name)
          const localized = await localizeSets(normalizedSets)
          if (requestId !== pokemonRequestId) return
          popularSets.value = localized.sets
          if (localized.failures) localizationError.value = 'Algunos nombres no se pudieron traducir y se muestran en el idioma de la fuente.'
          setsUnavailable.value = popularSets.value.length === 0
        }
      } catch (error) {
        if (requestId === pokemonRequestId) {
          if (error.status === 404) setsUnavailable.value = true
          else setsError.value = error.message
        }
      } finally {
        if (requestId === pokemonRequestId) isLoadingSets.value = false
      }
    } catch (error) {
      if (requestId === pokemonRequestId) pokemonError.value = error.message
    } finally {
      if (requestId === pokemonRequestId) isLoadingPokemon.value = false
    }
  }

  const loadFormats = async () => {
    const requestId = ++formatRequestId
    const primaryFormat = selectedFormat.value
    const secondaryFormat = comparisonFormat.value
    if (!primaryFormat || !secondaryFormat) return

    isLoadingFormats.value = true
    formatError.value = ''
    localizedPrimaryStats.value = null
    localizedComparisonStats.value = null

    const [primaryResult, comparisonResult] = await Promise.allSettled([
      loadFormatStats(primaryFormat),
      loadFormatStats(secondaryFormat),
    ])

    if (requestId !== formatRequestId) return

    if (primaryResult.status === 'fulfilled') {
      primaryStats.value = primaryResult.value.data
      primarySource.value = primaryResult.value.source
    } else {
      primaryStats.value = {}
      primarySource.value = ''
      formatError.value = primaryResult.reason.message
    }

    if (comparisonResult.status === 'fulfilled') {
      comparisonStats.value = comparisonResult.value.data
      comparisonSource.value = comparisonResult.value.source
    } else {
      comparisonStats.value = {}
      comparisonSource.value = ''
      formatError.value = [formatError.value, comparisonResult.reason.message].filter(Boolean).join(' ')
    }

    isLoadingFormats.value = false

    if (selectedPokemon.value) {
      await selectPokemon(selectedPokemon.value.name)
    }
  }

  const loadMove = async (name) => {
    isLoadingMove.value = true
    moveError.value = ''
    selectedMove.value = null
    try {
      const move = await pokemonShowdownService.getMove(name)
      let localizedName = move.name
      try {
        const translation = await pokeApiService.getLocalizedName('move', name)
        localizedName = translation.name
        if (!translation.translated) {
          localizationError.value = 'El movimiento no está disponible en español; se muestra el nombre de la fuente.'
        }
      } catch {
        localizationError.value = 'No se pudo consultar la traducción del movimiento; se muestra el nombre de la fuente.'
      }

      selectedMove.value = {
        ...move,
        name: localizedName,
        type: getTipoEnEspanol(move.type),
        category: { Physical: 'Físico', Special: 'Especial', Status: 'Estado' }[move.category] ?? move.category,
      }
    } catch (error) {
      moveError.value = error.message
    } finally {
      isLoadingMove.value = false
    }
  }

  const submitSearch = () => {
    const exactMatch = pokemonOptions.value.find(
      (pokemon) => toPokemonId(pokemon.name) === toPokemonId(searchInput.value),
    )
    selectPokemon(exactMatch?.name ?? searchInput.value)
  }

  watch([selectedFormatId, comparisonFormatId], loadFormats)
  onMounted(loadFormats)

  return {
    formats: COMPETITIVE_FORMATS,
    selectedFormatId,
    comparisonFormatId,
    selectedFormat,
    comparisonFormat,
    searchInput,
    pokemonOptions,
    selectedPokemon,
    pokemonDetails,
    pokemonCompetitiveStats,
    comparisonPokemonStats,
    localizedPrimaryStats,
    localizedComparisonStats,
    localizationError,
    primarySource,
    comparisonSource,
    popularSets,
    setsUnavailable,
    selectedMove,
    natureDistribution,
    comparisonDistributions,
    isLoadingFormats,
    isLoadingPokemon,
    isLoadingSets,
    isLoadingMove,
    formatError,
    pokemonError,
    setsError,
    moveError,
    submitSearch,
    selectPokemon,
    loadMove,
  }
}
