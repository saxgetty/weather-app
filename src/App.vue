<template>
  <!-- <div>
    <ul>
      <li>
        <router-link :to="{ name: 'home' }">Weather Application</router-link>
      </li>
    </ul>
  </div> -->
  <router-view />
</template>

<script setup>
import { RouterView, RouterLink } from "vue-router"
</script>
