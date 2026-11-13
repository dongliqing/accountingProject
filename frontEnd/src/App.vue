<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import MobileLayout from '@/layouts/MobileLayout.vue'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')
</script>

<template>
  <RouterView v-if="isLoginPage" />
  <MobileLayout v-else />
</template>
