<template>
  <div v-if="mostVisitedPokemon" class="mt-3 max-w-sm mx-auto">
    <div
      class="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-md px-4 py-2 cursor-pointer hover:scale-105 transition-transform duration-300 flex items-center gap-3"
      @click="goToPokemonDetails"
    >
      <span class="text-2xl">🏆</span>
      <img
        :src="mostVisitedPokemon.sprite"
        :alt="mostVisitedPokemon.name"
        class="w-10 h-10 object-contain bg-white rounded-full p-1"
        @error="handleImageError"
      />
      <div class="flex-1 min-w-0">
        <p class="text-xs font-semibold text-yellow-100 uppercase tracking-wide">
          Pokémon más buscado
        </p>
        <p class="text-sm font-bold text-white capitalize truncate">
          {{ formatName(mostVisitedPokemon.name) }}
        </p>
        <p class="text-xs text-yellow-100">
          {{ mostVisitedPokemon.count }}
          {{ mostVisitedPokemon.count === 1 ? 'visita' : 'visitas' }}
        </p>
      </div>
      <span class="text-white text-xl">→</span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import notFound from '../assets/images/no_found.png'

const props = defineProps({
  mostVisitedPokemon: {
    type: Object,
    default: null,
  },
})

const router = useRouter()

const formatName = (name) => {
  return name.split('-')[0].charAt(0).toUpperCase() + name.split('-')[0].slice(1)
}

const handleImageError = (e) => {
  e.target.src = notFound
}

const goToPokemonDetails = () => {
  if (props.mostVisitedPokemon) {
    router.push(`/details/${props.mostVisitedPokemon.id}`)
  }
}
</script>