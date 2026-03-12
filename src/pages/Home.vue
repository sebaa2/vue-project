<template>
  <div class="flex gap-4">
    <!-- Contenido principal -->
    <div class="grid grid-cols-1 md:grid-cols-0 lg:grid-cols-0 w-1/2 mx-auto">
      <!-- w-1/3, w-2/3, w-3/4, etc. -->
      <!-- <div class="grid grid-cols-1 lg:grid-cols-0 xl:grid-cols-0"> -->
      <router-view></router-view>
    </div>
  </div>
</template>
