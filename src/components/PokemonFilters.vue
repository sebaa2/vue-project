<!-- src/components/PokemonFilters.vue -->
<template>
  <div class="bg-white rounded-xl shadow-md p-4 mb-8">
    <div class="flex flex-col gap-4">
      <!-- Búsqueda -->
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1 relative">
          <input
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            type="text"
            placeholder="🔍 Buscar Pokémon por nombre o número..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <button
            v-if="searchQuery"
            @click="$emit('update:searchQuery', '')"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Tipo Principal -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"> Tipo Principal </label>
          <select
            :value="primaryType"
            @change="$emit('update:primaryType', $event.target.value)"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          >
            <option value="all">Todos los tipos</option>
            <option v-for="type in pokemonTypes" :key="type" :value="type">
              {{ formatTipo(type) }}
            </option>
          </select>
        </div>

        <!-- Tipo Secundario -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"> Tipo Secundario </label>
          <select
            :value="secondaryType"
            @change="$emit('update:secondaryType', $event.target.value)"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          >
            <option value="all">Todos los tipos</option>
            <option value="none">Sin segundo tipo</option>
            <option v-for="type in pokemonTypes" :key="type" :value="type">
              {{ formatTipo(type) }}
            </option>
          </select>
        </div>

        <!-- Generación -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"> Generación </label>
          <select
            :value="generation"
            @change="$emit('update:generation', $event.target.value)"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          >
            <option value="all">Todas las generaciones</option>
            <option v-for="gen in generationOptions" :key="gen.id" :value="gen.id">
              {{ gen.name }} ({{ gen.range[0] }}-{{ gen.range[1] }})
            </option>
          </select>
        </div>

        <!-- Megas Toggle -->
        <div
          class="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-200"
        >
          <span class="text-sm font-semibold text-gray-800"> Solo Mega Evoluciones </span>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              :checked="showMegas"
              @change="$emit('update:showMegas', $event.target.checked)"
              class="sr-only peer"
            />
            <div
              class="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-purple-600 transition-colors duration-300"
            ></div>
            <div
              class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 peer-checked:translate-x-5"
            ></div>
          </label>
        </div>
      </div>

      <!-- Barra de acciones -->
      <div class="flex justify-between items-center">
        <button
          @click="$emit('reset')"
          class="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          🗑️ Limpiar filtros
        </button>

        <div class="text-sm text-gray-500">
          <span v-if="isFiltering">Filtrando...</span>
          <span v-else>{{ totalResults }} Pokémon encontrados</span>
        </div>
      </div>

      <!-- Filtros activos -->
      <ActiveFilters
        v-if="hasActiveFilters"
        :search-query="searchQuery"
        :primary-type="primaryType"
        :secondary-type="secondaryType"
        :generation="generation"
        :show-megas="showMegas"
        @remove="$emit('removeFilter', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { usePokemonUtils } from '../composables/usePokemonUtils.js'
import ActiveFilters from './ActiveFilters.vue'

const { formatTipo } = usePokemonUtils()

defineProps({
  searchQuery: String,
  primaryType: String,
  secondaryType: String,
  generation: [String, Number],
  showMegas: Boolean,
  pokemonTypes: Array,
  generationOptions: Array,
  hasActiveFilters: Boolean,
  totalResults: Number,
  isFiltering: Boolean,
})

defineEmits([
  'update:searchQuery',
  'update:primaryType',
  'update:secondaryType',
  'update:generation',
  'update:showMegas',
  'reset',
  'removeFilter',
])
</script>
