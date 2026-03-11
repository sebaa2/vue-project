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

fetch('https://pokeapi.co/api/v2/pokemon?limit=1000')
  .then((res) => res.json())
  .then((data) => {
    console.log(data)
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
    <div class="grid grid-cols-6 gap-1">
      <div class="col-span-1">
        <input
          type="text"
          class="mb-3 p-2 border-black-500 border-2 w-75"
          placeholder="Nombre del pokemon"
          v-model="name"
        />
        {{}}
        <ul class="overflow-y-auto max-h-96">
          <li
            v-for="pokemon in filterPokemon"
            :key="pokemon.index"
            class="p-2 rounded hover:text-red-400 hover:bg-red-100"
          >
            <span class="text-sm front-normal text-gray-500 mr-3"> # {{ pokemon.index }} </span>
            <router-link :to="`/details/${pokemon.index}`">
              {{ pokemon.name }}
            </router-link>
          </li>
        </ul>
      </div>
      <div class="col-span-5">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
