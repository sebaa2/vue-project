<template>
  <main class="min-h-screen bg-gradient-to-b from-red-50 via-white to-white">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-8">
        <p class="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-red-600">
          Centro de análisis
        </p>
        <h1 class="text-3xl font-black text-gray-900 sm:text-4xl">Pokédex competitiva</h1>
        <p class="mt-2 max-w-3xl text-gray-600">
          Consulta estadísticas publicadas, sets y datos técnicos por formato. Los porcentajes
          conservan la base de cálculo de cada fuente.
        </p>
      </header>

      <section class="mb-6 rounded-2xl border border-red-100 bg-white p-4 shadow-sm sm:p-6">
        <div class="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(220px,1fr)_minmax(220px,1fr)]">
          <form class="flex flex-col gap-2" @submit.prevent="submitSearch">
            <label for="competitive-search" class="text-sm font-bold text-gray-700">
              Buscar Pokémon
            </label>
            <div class="flex gap-2">
              <input
                id="competitive-search"
                v-model="searchInput"
                list="competitive-pokemon-options"
                autocomplete="off"
                placeholder="Ej. Gholdengo"
                class="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
              <datalist id="competitive-pokemon-options">
                <option v-for="pokemon in pokemonOptions" :key="pokemon.name" :value="pokemon.name" />
              </datalist>
              <button
                type="submit"
                :disabled="isLoadingPokemon || !searchInput.trim()"
                class="rounded-xl bg-red-700 px-5 font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {{ isLoadingPokemon ? '...' : 'Buscar' }}
              </button>
            </div>
          </form>

          <label class="flex flex-col gap-2 text-sm font-bold text-gray-700">
            Formato
            <select
              v-model="selectedFormatId"
              class="rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
            >
              <option v-for="format in formats" :key="format.id" :value="format.id">
                {{ format.label }}
              </option>
            </select>
          </label>

          <label class="flex flex-col gap-2 text-sm font-bold text-gray-700">
            Comparar con
            <select
              v-model="comparisonFormatId"
              class="rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
            >
              <option
                v-for="format in formats"
                :key="format.id"
                :value="format.id"
                :disabled="format.id === selectedFormatId"
              >
                {{ format.label }}
              </option>
            </select>
          </label>
        </div>
        <p v-if="isLoadingFormats" class="mt-4 text-sm text-gray-500" role="status">
          Cargando estadísticas de ambos formatos...
        </p>
        <p v-if="formatError" class="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
          {{ formatError }}
        </p>
        <p v-if="pokemonError" class="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {{ pokemonError }}
        </p>
        <p v-if="localizationError" class="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
          {{ localizationError }}
        </p>
      </section>

      <template v-if="selectedPokemon && pokemonDetails">
        <section class="mb-6 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <article class="flex items-center gap-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <img
              :src="pokemonDetails.sprites.front_default"
              :alt="selectedPokemon.name"
              class="h-28 w-28 object-contain"
            />
            <div class="min-w-0">
              <p class="text-sm font-bold uppercase tracking-wider text-gray-400">
                #{{ String(pokemonDetails.id).padStart(3, '0') }}
              </p>
              <h2 class="truncate text-2xl font-black capitalize text-gray-900">
                {{ pokemonDetails.name.replace(/-/g, ' ') }}
              </h2>
              <div class="mt-2 flex flex-wrap gap-2">
                <span
                  v-for="type in pokemonDetails.types"
                  :key="type.type.name"
                  class="rounded-full bg-red-50 px-3 py-1 text-xs font-bold capitalize text-red-800"
                >
                  {{ getTipoEnEspanol(type.type.name) }}
                </span>
              </div>
              <p class="mt-3 text-sm text-gray-600">
                Uso en {{ selectedFormat?.label }}:
                <strong class="text-gray-900">{{ formatPercent(pokemonCompetitiveStats?.usage) }}</strong>
                <span v-if="comparisonPokemonStats">
                  · {{ comparisonFormat?.label }}:
                  <strong class="text-gray-900">{{ formatPercent(comparisonPokemonStats.usage) }}</strong>
                </span>
              </p>
            </div>
          </article>

          <article class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 class="mb-4 text-lg font-extrabold text-gray-900">Estadísticas base · PokéAPI</h2>
            <div class="space-y-3">
              <div v-for="stat in pokemonDetails.stats" :key="stat.stat.name" class="grid grid-cols-[7rem_2.5rem_1fr] items-center gap-3">
                <span class="text-sm capitalize text-gray-600">{{ statLabels[stat.stat.name] || stat.stat.name }}</span>
                <span class="text-right text-sm font-bold text-gray-900">{{ stat.base_stat }}</span>
                <div class="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    class="h-full rounded-full bg-red-500"
                    :style="{ width: `${Math.min(stat.base_stat / 2.55, 100)}%` }"
                  />
                </div>
              </div>
            </div>
          </article>
        </section>

        <p v-if="!pokemonCompetitiveStats && !isLoadingFormats" class="mb-6 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
          {{ selectedPokemon.name }} no aparece en los datos publicados de {{ selectedFormat?.label }}.
        </p>

        <section class="mb-6 grid gap-6 lg:grid-cols-2">
          <article class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 class="mb-4 text-lg font-extrabold text-gray-900">Movimientos más usados</h2>
            <div v-if="pokemonCompetitiveStats?.moves?.length" class="space-y-2">
              <button
                v-for="move in pokemonCompetitiveStats.moves.slice(0, 8)"
                :key="move.name"
                type="button"
                class="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-red-50"
                @click="loadMove(move.id || move.name)"
              >
                <span class="min-w-0 flex-1 truncate text-sm font-semibold text-gray-800">{{ move.name }}</span>
                <span class="text-sm font-bold text-red-700">{{ formatPercent(move.usage) }}</span>
              </button>
            </div>
            <p v-else class="text-sm text-gray-500">Sin datos de movimientos publicados para este Pokémon.</p>
          </article>

          <article class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 class="mb-4 text-lg font-extrabold text-gray-900">Objetos y habilidades</h2>
            <div class="grid gap-5 sm:grid-cols-2">
            <CompetitiveDistributionList title="Objetos" :entries="pokemonCompetitiveStats?.items" />
            <CompetitiveDistributionList title="Habilidades" :entries="pokemonCompetitiveStats?.abilities" />
            </div>
          </article>
        </section>

        <section class="mb-6 grid gap-6 lg:grid-cols-2">
          <article class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 class="mb-4 text-lg font-extrabold text-gray-900">Distribuciones de EV y naturalezas</h2>
            <div v-if="pokemonCompetitiveStats?.spreads?.length" class="grid gap-5 sm:grid-cols-2">
              <div>
                <h3 class="mb-2 text-sm font-bold text-gray-600">Naturalezas</h3>
                <CompetitiveDistributionList :entries="natureDistribution.slice(0, 6)" />
              </div>
              <div>
                <h3 class="mb-2 text-sm font-bold text-gray-600">EVs · naturaleza</h3>
                <div class="space-y-2">
                  <div v-for="spread in pokemonCompetitiveStats.spreads.slice(0, 6)" :key="`${spread.nature}-${JSON.stringify(spread.evs)}`" class="text-sm">
                    <div class="flex justify-between gap-2">
                      <span class="font-semibold text-gray-800">{{ spread.nature }} · {{ formatEVs(spread.evs) }}</span>
                      <span class="shrink-0 font-bold text-red-700">{{ formatPercent(spread.usage) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500">Sin distribuciones publicadas para este Pokémon.</p>
          </article>

          <article class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 class="mb-4 text-lg font-extrabold text-gray-900">Compañeros de equipo frecuentes</h2>
            <div v-if="pokemonCompetitiveStats?.teammates?.length" class="grid gap-x-6 sm:grid-cols-2">
              <div
                v-for="teammate in pokemonCompetitiveStats.teammates.slice(0, 10)"
                :key="teammate.name"
                class="flex items-center justify-between gap-3 border-b border-gray-100 py-2"
              >
                <button
                  type="button"
                  class="truncate text-left text-sm font-semibold capitalize text-gray-800 hover:text-red-700"
                  @click="selectPokemon(teammate.name)"
                >
                  {{ teammate.name }}
                </button>
                <span class="shrink-0 text-sm font-bold text-gray-600">{{ formatPercent(teammate.usage) }}</span>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500">Sin datos de compañeros para este Pokémon.</p>
          </article>
        </section>

        <section class="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 class="text-lg font-extrabold text-gray-900">Sets competitivos publicados</h2>
            <span class="text-xs font-semibold text-gray-500">data.pkmn.cc · datos de Smogon</span>
          </div>
          <p v-if="isLoadingSets" class="text-sm text-gray-500" role="status">Cargando sets...</p>
          <p v-else-if="setsError" class="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900" role="alert">
            {{ setsError }}
          </p>
          <p v-else-if="setsUnavailable" class="text-sm text-gray-500">
            La fuente no publica sets para este Pokémon y formato; no se generan combinaciones estimadas.
          </p>
          <div v-else class="grid gap-4 md:grid-cols-2">
            <article v-for="set in popularSets" :key="set.name" class="rounded-xl bg-gray-50 p-4">
              <h3 class="mb-3 font-bold text-gray-900">{{ set.name }}</h3>
              <p class="text-sm text-gray-700"><strong>Movimientos:</strong> {{ set.moves.map((options) => options.join(' / ')).join(' · ') || 'No especificados' }}</p>
              <p class="mt-1 text-sm text-gray-700"><strong>Objeto:</strong> {{ set.item.join(' / ') || 'No especificado' }}</p>
              <p class="mt-1 text-sm text-gray-700"><strong>Habilidad:</strong> {{ set.ability.join(' / ') || 'No especificada' }}</p>
              <p class="mt-1 text-sm text-gray-700"><strong>Naturaleza:</strong> {{ set.nature.join(' / ') || 'No especificada' }}</p>
              <p v-for="evs in set.evs" :key="JSON.stringify(evs)" class="mt-1 text-sm text-gray-700">
                <strong>EVs:</strong> {{ typeof evs === 'object' ? formatEVs(evs) : evs }}
              </p>
            </article>
          </div>
        </section>

        <section class="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 class="mb-4 text-lg font-extrabold text-gray-900">Comparación entre formatos</h2>
          <div class="mb-4 grid gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
            <p><span class="font-semibold text-gray-600">{{ selectedFormat?.label }}:</span> {{ primarySource || 'Sin datos' }}</p>
            <p><span class="font-semibold text-gray-600">{{ comparisonFormat?.label }}:</span> {{ comparisonSource || 'Sin datos' }}</p>
          </div>
          <div class="grid gap-5 lg:grid-cols-3">
            <article v-for="category in comparisonDistributions" :key="category.key">
              <h3 class="mb-2 text-sm font-bold text-gray-700">{{ category.label }}</h3>
              <div v-if="category.rows.length" class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                  <thead>
                    <tr class="border-b border-gray-200 text-xs text-gray-500">
                      <th class="py-2 pr-2 font-semibold">Dato</th>
                      <th class="px-2 py-2 text-right font-semibold">{{ selectedFormat?.label }}</th>
                      <th class="py-2 pl-2 text-right font-semibold">{{ comparisonFormat?.label }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in category.rows" :key="row.name" class="border-b border-gray-100">
                      <td class="py-2 pr-2 font-medium text-gray-800">{{ row.name }}</td>
                      <td class="px-2 py-2 text-right">{{ formatPercent(row.current) }}</td>
                      <td class="py-2 pl-2 text-right">{{ formatPercent(row.comparison) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p v-else class="text-sm text-gray-500">Sin datos comparables.</p>
            </article>
          </div>
        </section>
      </template>

      <section
        v-if="!selectedPokemon && !isLoadingFormats"
        class="rounded-2xl border border-dashed border-gray-300 bg-white/80 px-6 py-12 text-center"
      >
        <h2 class="text-xl font-bold text-gray-800">Busca un Pokémon para empezar</h2>
        <p class="mt-2 text-sm text-gray-600">
          Escribe un nombre y pulsa «Buscar» para consultar sus estadísticas competitivas.
        </p>
      </section>

      <section
        v-if="selectedMove || moveError || isLoadingMove"
        class="mb-6 rounded-2xl border border-red-100 bg-white p-5 shadow-sm"
        aria-live="polite"
      >
        <p v-if="isLoadingMove" class="text-sm text-gray-500">Consultando datos técnicos en Pokémon Showdown...</p>
        <p v-else-if="moveError" class="text-sm text-red-800" role="alert">{{ moveError }}</p>
        <div v-else-if="selectedMove">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-red-600">Pokémon Showdown</p>
              <h2 class="text-xl font-black text-gray-900">{{ selectedMove.name }}</h2>
            </div>
            <button type="button" class="rounded-lg px-3 py-1 text-gray-500 hover:bg-gray-100" aria-label="Cerrar detalles" @click="selectedMove = null">
              Cerrar
            </button>
          </div>
          <div class="mt-3 flex flex-wrap gap-2 text-sm">
            <span class="rounded-full bg-gray-100 px-3 py-1">{{ selectedMove.type }}</span>
            <span class="rounded-full bg-gray-100 px-3 py-1">{{ selectedMove.category }}</span>
            <span class="rounded-full bg-gray-100 px-3 py-1">Potencia: {{ selectedMove.power || '—' }}</span>
            <span class="rounded-full bg-gray-100 px-3 py-1">Precisión: {{ selectedMove.accuracy ?? '—' }}</span>
            <span class="rounded-full bg-gray-100 px-3 py-1">PP: {{ selectedMove.pp ?? '—' }}</span>
            <span class="rounded-full bg-gray-100 px-3 py-1">Prioridad: {{ selectedMove.priority }}</span>
          </div>
          <p v-if="selectedMove.description" class="mt-3 text-sm text-gray-600">{{ selectedMove.description }}</p>
        </div>
      </section>

      <footer class="rounded-xl bg-gray-50 px-4 py-3 text-xs leading-relaxed text-gray-500">
        Fuentes: PokéKit y data.pkmn.cc para estadísticas y sets; PokéAPI para datos base;
        Pokémon Showdown para la información técnica de movimientos. PokéKit y Smogon indican
        que sus porcentajes de movimientos, objetos, habilidades, compañeros y EV se calculan
        entre los usuarios de cada Pokémon.
      </footer>
    </div>
  </main>
</template>

<script setup>
import CompetitiveDistributionList from '@/components/competitive/DistributionList.vue'
import { useCompetitiveDex } from '@/composables/useCompetitiveDex.js'
import { getTipoEnEspanol } from '@/config/arrayTipo.js'

const {
  formats,
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
} = useCompetitiveDex()

const statLabels = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'At. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidad',
}

const evLabels = {
  hp: 'PS',
  atk: 'Atq',
  def: 'Def',
  spa: 'At. Esp.',
  spd: 'Def. Esp.',
  spe: 'Vel',
}

function formatPercent(value) {
  return Number.isFinite(value) ? `${value.toFixed(1)}%` : '—'
}

function formatEVs(evs) {
  if (!evs || typeof evs !== 'object') return 'No especificados'
  return Object.entries(evs)
    .filter(([, value]) => Number(value) > 0)
    .map(([stat, value]) => `${evLabels[stat] || stat} ${value}`)
    .join(' / ') || '0 EV'
}
</script>
