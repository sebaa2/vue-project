<script setup>
import { computed, reactive, toRefs } from 'vue'

const state = reactive({
  pokemons: [],
  name: '',
  filterPokemon: computed(() => searchPokemon()),
})

function searchPokemon() {
  return state.pokemons.filter((pokemon) => pokemon.name.includes(state.name.toLowerCase()))
}
const { pokemons, name, filterPokemon } = toRefs(state)

fetch('https://pokeapi.co/api/v2/pokemon?limit=1025')
  .then((res) => res.json())
  .then((data) => {
    data.results.forEach((element, index) => {
      const pokemon = {
        ...element,
        index: index + 1,
      }
      state.pokemons.push(pokemon)
    })
  })
</script>

<template>
  <div>
    <div class="grid grid-cols-1 lg:grid-cols-6 gap-4">
      <!-- Sidebar Pokémon -->
      <div class="lg:col-span-1">
        <input
          type="text"
          class="mb-3 p-2 border-black border-2 w-full rounded"
          placeholder="Nombre del pokemon"
          v-model="name"
        />

        <ul class="overflow-y-auto max-h-96">
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

      <!-- Contenido principal -->
      <div class="lg:col-span-5">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
