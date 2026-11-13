<script setup lang="ts">
// 底部导航 — 对应设计稿 tabbar（明细 / 账单 / 我的）
</script>

<template>
  <van-tabbar
    route
    replace
    :fixed="false"
    :border="false"
    class="app-tabbar"
    active-color="#1E1C16"
    inactive-color="#9A947F"
  >
    <van-tabbar-item to="/">
      <template #icon="{ active }">
        <span class="tab-ico" :class="{ active }">
          <svg viewBox="0 0 24 24">
            <path d="M6 3h12a1 1 0 011 1v17l-3-2-3 2-3-2-3 2V4a1 1 0 011-1z" />
            <path d="M9 8h6M9 12h6" />
          </svg>
        </span>
      </template>
      明细
    </van-tabbar-item>

    <van-tabbar-item to="/bills">
      <template #icon="{ active }">
        <span class="tab-ico" :class="{ active }">
          <svg viewBox="0 0 24 24">
            <path d="M4 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
            <path d="M4 10h16" />
            <circle cx="16.5" cy="14" r="1.2" fill="currentColor" stroke="none" />
          </svg>
        </span>
      </template>
      账单
    </van-tabbar-item>

    <van-tabbar-item to="/me">
      <template #icon="{ active }">
        <span class="tab-ico" :class="{ active }">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="3.4" />
            <path d="M5 20c.8-3.6 3.6-5.4 7-5.4s6.2 1.8 7 5.4" />
          </svg>
        </span>
      </template>
      我的
    </van-tabbar-item>
  </van-tabbar>
</template>
