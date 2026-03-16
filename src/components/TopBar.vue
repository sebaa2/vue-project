<script setup>
import { getSearchPoke } from '../helpers/getSearchPoke'
import { computed, reactive, toRefs, onMounted, watch } from 'vue'

const state = reactive({
  pokemons: [],
  name: '',
  showList: false,
  filterPokemon: computed(() => {
    return state.pokemons.filter((pokemon) => {
    const pokemonName = pokemon.name.toLowerCase().replace(/-/g, ' ')
    const search = state.name.toLowerCase()

    return pokemonName.includes(search)
  })
  }),
})
watch(state, () => {})
const { pokemons, name, filterPokemon } = toRefs(state)

onMounted(async () => {
  state.pokemons = await getSearchPoke()
})

function hideList() {
  setTimeout(() => {
    state.showList = false
  }, 200)
}

const paradoxPokemon = [
  'great-tusk',
  'scream-tail',
  'brute-bonnet',
  'flutter-mane',
  'slither-wing',
  'sandy-shocks',
  'roaring-moon',
  'walking-wake',
  'gouging-fire',
  'raging-bolt',
  'iron-treads',
  'iron-bundle',
  'iron-hands',
  'iron-jugulis',
  'iron-moth',
  'iron-thorns',
  'iron-valiant',
  'iron-leaves',
  'iron-boulder',
  'iron-crown',
]

function isParadoja(name) {
  return paradoxPokemon.includes(name)
}

function formatPoke(name) {
  if (isParadoja(name)) {
    return name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  const baseName = name.split('-')[0]
  return baseName.charAt(0).toUpperCase() + baseName.slice(1)
}
</script>

<template>
  <header class="bg-red-700 text-white mb-4 py-8 px-6">
    <h1 class="text-3xl font-bold text-center">Pokemon + vite</h1>
    <!-- barra de busqueda-->
    <div class="flex gap-4">
      <!-- Sidebar Pokémon -->
      <div class="w-64 flex-shrink-0">
        <div class="relative">
          <input
            type="text"
            v-model="state.name"
            placeholder="Buscar Pokémon..."
            @focus="state.showList = true"
            @blur="hideList"
            class="w-full pl-10 pr-3 py-2.5 bg-white text-gray-800 border border-gray-400 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
          />

          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"> 🔍 </span>
        </div>

        <ul
          v-if="state.showList"
          class="absolute center-0 bg-white overflow-y-auto max-h-50 border rounded shadow text-gray-800"
        >
          <li
            v-for="pokemon in filterPokemon"
            :key="pokemon.index"
            class="p-2 rounded hover:text-red-400 hover:bg-red-100"
          >
            <span class="text-sm font-normal text-gray-500 mr-3"> # {{ pokemon.index }} </span>

            <router-link :to="`/details/${pokemon.index}`">
              {{ formatPoke(pokemon.name) }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>
