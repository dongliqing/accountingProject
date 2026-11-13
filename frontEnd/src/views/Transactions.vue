<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useLedgerStore } from '@/stores/ledger'
import { useBillStore, type BillFilter } from '@/stores/bill'

const router = useRouter()
const ledgerStore = useLedgerStore()
const billStore = useBillStore()

const filters: Array<{ key: BillFilter; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'expense', label: '支出' },
  { key: 'income', label: '收入' },
]

const activeFilter = ref<BillFilter>('all')

const groups = computed(() => billStore.groupedByDay(activeFilter.value))
const summary = computed(() => billStore.monthSummary)
const monthLabel = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月`
})

function fmt(value: number) {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function isRelativeDay(label: string) {
  return label === '今天' || label === '昨天'
}

function notReady(label: string) {
  showToast(`${label}功能开发中`)
}
</script>

<template>
  <div class="page">
    <!-- 顶栏 -->
    <div class="topbar">
      <button class="book-chip" @click="ledgerStore.openSwitcher()">
        <i class="book-dot"></i>{{ ledgerStore.activeLedgerName }}
        <svg class="ico sm" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      <div class="top-actions">
        <button class="icon-btn" aria-label="搜索" @click="notReady('搜索')">
          <svg class="ico" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.2-3.2" />
          </svg>
        </button>
        <button class="icon-btn" aria-label="更多" @click="notReady('更多')">
          <svg class="ico" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 月度汇总 -->
    <section class="summary-card">
      <div class="blob b1"></div>
      <div class="blob b2"></div>
      <div class="summary-top">
        <button class="month-pick" @click="notReady('月份切换')">
          {{ monthLabel }}
          <svg class="ico sm" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <span class="summary-tag">本月</span>
      </div>
      <div class="summary-label">本月支出</div>
      <div class="summary-amount"><small>¥</small>{{ fmt(summary.expense) }}</div>
      <div class="summary-split">
        <div><span>收入</span><b>¥{{ fmt(summary.income) }}</b></div>
        <div><span>结余</span><b>¥{{ fmt(summary.balance) }}</b></div>
        <div><span>记账</span><b>{{ summary.count }} 笔</b></div>
      </div>
    </section>

    <!-- 筛选 -->
    <div class="filter-row">
      <div class="chips">
        <button
          v-for="item in filters"
          :key="item.key"
          class="chip"
          :class="{ active: activeFilter === item.key }"
          @click="activeFilter = item.key"
        >
          {{ item.label }}
        </button>
      </div>
      <button class="filter-btn" @click="notReady('筛选')">
        <svg class="ico sm" viewBox="0 0 24 24">
          <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
          <circle cx="15" cy="7" r="2" />
          <circle cx="8" cy="17" r="2" />
        </svg>
        筛选
      </button>
    </div>

    <!-- 按日明细 -->
    <template v-if="groups.length">
      <template v-for="group in groups" :key="group.date">
        <div class="day-head">
          <span>
            {{ group.label }}
            <em v-if="isRelativeDay(group.label)">{{ group.dateLabel }}</em>
          </span>
          <span v-if="group.expense > 0" class="day-total">支出 ¥{{ fmt(group.expense) }}</span>
          <span v-else class="day-total income">收入 ¥{{ fmt(group.income) }}</span>
        </div>
        <div class="txn-list">
          <div v-for="bill in group.items" :key="bill.id" class="txn">
            <div class="cat-ico" :style="`--tint:${bill.tint}`">{{ bill.icon }}</div>
            <div class="txn-main">
              <div class="txn-title">{{ bill.title }}</div>
              <div class="txn-sub">{{ bill.note }} · {{ bill.time }}</div>
            </div>
            <div class="txn-amt" :class="{ in: bill.type === 'income' }">
              {{ bill.type === 'income' ? '+' : '−' }}{{ fmt(bill.amount) }}
            </div>
          </div>
        </div>
      </template>
    </template>

    <div v-else class="empty-state">
      <div class="empty-emoji">🧾</div>
      <p>{{ ledgerStore.activeLedgerName }}还没有账单</p>
      <button class="empty-btn" @click="router.push('/add')">记一笔</button>
    </div>

    <!-- 记一笔 -->
    <button class="fab" aria-label="记一笔" @click="router.push('/add')">
      <svg class="ico" style="width: 24px; height: 24px" viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  </div>
</template>
