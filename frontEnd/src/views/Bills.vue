<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useLedgerStore } from '@/stores/ledger'
import { useBillStore } from '@/stores/bill'

const router = useRouter()
const ledgerStore = useLedgerStore()
const billStore = useBillStore()

const year = new Date().getFullYear()
const months = computed(() => billStore.billsMonths)
const totals = computed(() => billStore.billsTotals)

function fmt(value: number) {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function openMonth(label: string) {
  showToast(`${label}明细开发中`)
}
</script>

<template>
  <div class="page">
    <!-- 顶栏 -->
    <div class="topbar bills-topbar">
      <button class="back-btn" aria-label="返回" @click="router.push('/')">
        <svg class="ico" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <div class="bills-title">我的账单</div>
      <span class="bills-spacer"></span>
    </div>

    <div class="bills-ledger-row">
      <button class="book-chip" @click="ledgerStore.openSwitcher()">
        <i class="book-dot"></i><span>{{ ledgerStore.activeLedgerName }}</span>
        <svg class="ico sm" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
      </button>
    </div>

    <!-- 年度汇总 -->
    <section class="bills-summary">
      <div class="blob b1"></div>
      <div class="blob b2"></div>
      <button class="bills-year" @click="showToast('年份切换开发中')">
        <span>{{ year }}年</span>
        <svg class="ico sm" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      <div class="bills-label">结余</div>
      <div class="bills-amount"><small>¥</small><span>{{ fmt(totals.balance) }}</span></div>
      <div class="bills-foot">
        <div><span>收入</span><b>¥{{ fmt(totals.income) }}</b></div>
        <div><span>支出</span><b>¥{{ fmt(totals.expense) }}</b></div>
      </div>
    </section>

    <!-- 月度卡片 -->
    <div class="bills-months">
      <button
        v-for="month in months"
        :key="month.label"
        class="month-card"
        @click="openMonth(month.label)"
      >
        <div class="month-head">
          <b>{{ month.label }}</b>
          <svg class="ico sm chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
        </div>
        <div class="month-stats">
          <div><b>¥{{ fmt(month.income) }}</b><span>收入</span></div>
          <div><b>¥{{ fmt(month.expense) }}</b><span>支出</span></div>
          <div><b>¥{{ fmt(month.income - month.expense) }}</b><span>结余</span></div>
        </div>
      </button>

      <div v-if="months.length === 0" class="empty-state">
        <div class="empty-emoji">📄</div>
        <p>这个账本还没有月度账单</p>
      </div>
    </div>
  </div>
</template>
