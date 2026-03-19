<script setup>
import TopBar from '@/components/TopBar.vue'
import { useKonamiCode } from '@/composables/useKonamiCode.js'

useKonamiCode()
</script>

<template>
  <TopBar />
  <router-view></router-view>
</template>
<style scoped></style>
