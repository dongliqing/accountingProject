<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { useLedgerStore } from '@/stores/ledger'
import { useBillStore } from '@/stores/bill'

const router = useRouter()
const userStore = useUserStore()
const ledgerStore = useLedgerStore()
const billStore = useBillStore()

const displayName = computed(() => userStore.user?.name || '记账用户')
const avatarText = computed(() => displayName.value.charAt(0).toUpperCase())
const subtitle = computed(() => userStore.user?.email || '多账本 · 多账单 · 智能记账')

const stats = computed(() => {
  const total = billStore.totalStats
  const expense = total.expense >= 1000 ? `¥${(total.expense / 1000).toFixed(1)}k` : `¥${total.expense.toFixed(2)}`
  return {
    ledgers: ledgerStore.ledgers.length,
    count: total.count,
    expense,
  }
})

function notReady(label: string) {
  showToast(`${label}功能开发中`)
}

function logout() {
  userStore.logout()
  router.replace('/login')
}
</script>

<template>
  <div class="page">
    <!-- 顶栏 -->
    <div class="topbar">
      <h1 class="page-title">我的</h1>
      <button class="icon-btn" aria-label="设置" @click="notReady('设置')">
        <svg class="ico" viewBox="0 0 24 24">
          <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
          <circle cx="15" cy="7" r="2" />
          <circle cx="8" cy="17" r="2" />
        </svg>
      </button>
    </div>

    <!-- 个人信息 -->
    <section class="profile-card">
      <div class="avatar">{{ avatarText }}</div>
      <div class="profile-main">
        <h2>{{ displayName }}</h2>
        <p>{{ subtitle }}</p>
      </div>
      <span class="streak">本月 {{ billStore.monthSummary.count }} 笔</span>
    </section>

    <!-- 统计 -->
    <div class="stat-card">
      <div><b>{{ stats.ledgers }}<span>/10</span></b><small>账本</small></div>
      <div><b>{{ stats.count }}</b><small>累计记账</small></div>
      <div><b>{{ stats.expense }}</b><small>累计支出</small></div>
    </div>

    <div class="isolation-card">🛡️ 多账本数据隔离，账单与分类互不污染</div>

    <div class="menu-group">
      <button class="mrow" @click="notReady('账本管理')">
        <span class="m-ico" style="--tint: #fff3bf">📚</span>
        <span class="m-label">账本管理</span>
        <span class="m-meta">{{ stats.ledgers }} / 10</span>
        <svg class="ico sm chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
      </button>
      <button class="mrow" @click="notReady('分类管理')">
        <span class="m-ico" style="--tint: #e9f1ff">🏷️</span>
        <span class="m-label">分类管理</span>
        <span class="m-meta">自定义名称与图标</span>
        <svg class="ico sm chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
      </button>
      <button class="mrow" @click="notReady('回收站')">
        <span class="m-ico" style="--tint: #ffeceb">🗑️</span>
        <span class="m-label">回收站</span>
        <span class="m-tag">30 天</span>
        <svg class="ico sm chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>

    <div class="menu-group">
      <button class="mrow" @click="notReady('记账提醒')">
        <span class="m-ico" style="--tint: #f2ecff">🔔</span>
        <span class="m-label">记账提醒</span>
        <span class="m-meta">每晚 21:00</span>
        <svg class="ico sm chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
      </button>
      <button class="mrow disabled" disabled>
        <span class="m-ico" style="--tint: #e9f7ef">📤</span>
        <span class="m-label">数据导出</span>
        <span class="m-tag">二期</span>
        <svg class="ico sm chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
      </button>
      <button class="mrow" @click="notReady('帮助与反馈')">
        <span class="m-ico" style="--tint: #fff1d6">💬</span>
        <span class="m-label">帮助与反馈</span>
        <svg class="ico sm chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>

    <div class="menu-group">
      <button class="mrow" @click="notReady('设置')">
        <span class="m-ico" style="--tint: #f4f1e8">⚙️</span>
        <span class="m-label">设置</span>
        <svg class="ico sm chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
      </button>
      <button class="mrow danger" @click="logout">
        <span class="m-ico" style="--tint: #ffeceb">🚪</span>
        <span class="m-label">退出登录</span>
        <svg class="ico sm chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>

    <p class="menu-foot">多账单记账助手 · V1.0</p>
  </div>
</template>
