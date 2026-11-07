<template>
  <div>
    <h3 v-if="title" class="mb-2 text-sm font-bold text-gray-600">{{ title }}</h3>
    <div v-if="entries.length" class="space-y-2">
      <div
        v-for="entry in entries.slice(0, 6)"
        :key="entry.name"
        class="flex items-center justify-between gap-2 text-sm"
      >
        <span class="truncate text-gray-700">{{ entry.name }}</span>
        <span class="shrink-0 font-bold text-red-700">{{ entry.usage.toFixed(1) }}%</span>
      </div>
    </div>
    <p v-else class="text-sm text-gray-500">Sin datos publicados.</p>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  entries: { type: Array, default: () => [] },
})
</script>
