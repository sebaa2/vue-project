<script setup>
import TopBar from '@/components/TopBar.vue'
import { useKonamiCode } from '@/composables/useKonamiCode.js'
import { useWoChien } from '@/composables/useWochien.js'

useKonamiCode()
useWoChien()
</script>

<template>
  <TopBar />
  <router-view></router-view>
</template>
<style scoped></style>
