<script setup>
import { getSearchPoke } from '../helpers/getSearchPoke'
import { computed, reactive, toRefs, onMounted, watch } from 'vue'

const state = reactive({
  pokemons: [],
  name: '',
  showList: false,
  filterPokemon: computed(() => {
    return state.pokemons.filter((pokemon) => pokemon.name.includes(state.name.toLowerCase()))
  }),
})
watch(state, () => {
  console.log(name)
})
const { pokemons, name, filterPokemon } = toRefs(state)

onMounted(async () => {
  state.pokemons = await getSearchPoke()
})

function hideList() {
  setTimeout(() => {
    state.showList = false
  }, 200)
}
</script>

<template>
  <header class="bg-red-700 text-white mb-4 py-8 px-6">
    <h1 class="text-3xl font-bold text-center">Pokemon + vite</h1>
    <div class="flex gap-4">
      <!-- Sidebar Pokémon -->
      <div class="w-64 flex-shrink-0">
        <input
          type="text"
          class="mb-3 p-2 border-black border-2 w-full rounded"
          placeholder="Nombre del pokemon"
          v-model="state.name"
          @focus="state.showList = true"
          @blur="hideList"
        />

        <ul v-if="state.showList" class="bg-white overflow-y-auto max-h-50 border rounded shadow text-gray-800">
          <li
            v-for="pokemon in filterPokemon"
            :key="pokemon.index"
            class="p-2 rounded hover:text-red-400 hover:bg-red-100"
          >
            <span class="text-sm font-normal text-gray-500 mr-3"> # {{ pokemon.index }} </span>

            <router-link :to="`/details/${pokemon.index}`">
              {{ pokemon.name }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>
