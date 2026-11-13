<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppTabbar from '@/components/AppTabbar.vue'
import LedgerSwitcher from '@/components/LedgerSwitcher.vue'

const route = useRoute()
const showTabbar = computed(() => route.meta.tabbar !== false)
const fullscreen = computed(() => route.meta.fullscreen === true)
</script>

<template>
  <div class="app-shell">
    <div class="app-screen" :class="{ 'has-tabbar': showTabbar }">
      <div class="app-scroll" :class="{ 'is-fullscreen': fullscreen }">
        <RouterView />
      </div>
      <AppTabbar v-if="showTabbar" />
      <LedgerSwitcher />
    </div>
  </div>
</template>
