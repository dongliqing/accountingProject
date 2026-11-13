<script setup lang="ts">
import { showToast } from 'vant'
import { useLedgerStore } from '@/stores/ledger'

const ledgerStore = useLedgerStore()

function notReady(label: string) {
  showToast(`${label}功能开发中`)
}
</script>

<template>
  <template v-if="ledgerStore.switcherOpen">
    <div class="switcher-scrim" @click="ledgerStore.closeSwitcher()"></div>

    <div class="book-menu">
      <div class="bm-head">
        <b>切换账本</b>
        <span>记账只存入当前默认账本</span>
      </div>

      <button
        class="book-opt all"
        :class="{ active: ledgerStore.isAll }"
        @click="ledgerStore.selectLedger('all')"
      >
        <span class="opt-tile">Σ</span>
        <span class="opt-main">
          <b>全部账本</b>
          <small>仅查看跨账本汇总，不用于记账</small>
        </span>
        <span v-if="ledgerStore.isAll" class="opt-check">✓</span>
        <svg v-else class="ico sm chev" viewBox="0 0 24 24">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      <button
        v-for="ledger in ledgerStore.ledgers"
        :key="ledger.id"
        class="book-opt"
        :class="{ active: ledgerStore.activeLedgerId === ledger.id }"
        @click="ledgerStore.selectLedger(ledger.id)"
      >
        <span class="opt-tile" :style="`background:${ledger.color}`">{{ ledger.icon }}</span>
        <span class="opt-main">
          <b>{{ ledger.name }}</b>
          <small>{{ ledger.desc }}</small>
        </span>
        <span
          v-if="ledgerStore.activeLedgerId === ledger.id"
          class="opt-check"
        >✓</span>
        <svg v-else class="ico sm chev" viewBox="0 0 24 24">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      <div class="bm-foot">
        <button @click="notReady('新建账本')">＋ 新建账本</button>
        <button @click="notReady('管理账本')">管理账本</button>
      </div>
    </div>
  </template>
</template>
