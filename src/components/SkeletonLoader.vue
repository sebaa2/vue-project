<!-- src/components/SkeletonLoader.vue -->
<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    <div v-for="n in count" :key="n" class="animate-pulse">
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <!-- Imagen skeleton -->
        <div class="bg-gradient-to-br from-gray-200 to-gray-300 p-4 h-40 relative">
          <div class="w-full h-32 bg-gray-300 rounded-lg"></div>
          
          <!-- Badge skeleton -->
          <div class="absolute top-2 left-2">
            <div class="w-12 h-4 bg-gray-400 rounded"></div>
          </div>
          
          <div class="absolute top-2 right-2">
            <div class="w-10 h-4 bg-gray-400 rounded"></div>
          </div>
        </div>
        
        <!-- Texto skeleton -->
        <div class="p-3">
          <div class="h-5 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
          <div class="flex justify-center gap-1">
            <div class="w-14 h-5 bg-gray-300 rounded"></div>
            <div class="w-14 h-5 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    default: 24
  }
})
</script>