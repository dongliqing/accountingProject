import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface Ledger {
  id: string
  name: string
  desc: string
  icon: string
  color: string
  isDefault?: boolean
}

/**
 * 账本状态 — 对应设计稿「04 账本切换」
 * 骨架阶段使用本地数据，后续接入 /api/ledgers 后替换初始化逻辑即可
 */
export const useLedgerStore = defineStore('ledger', () => {
  const ledgers = ref<Ledger[]>([
    {
      id: 'daily',
      name: '日常账本',
      desc: '默认账本 · 日常收支',
      icon: '🏠',
      color: '#FFF3BF',
      isDefault: true,
    },
    {
      id: 'travel',
      name: '旅行账本',
      desc: '出行与度假支出',
      icon: '✈️',
      color: '#E2F5F2',
    },
    {
      id: 'renovation',
      name: '装修账本',
      desc: '装修与家居采购',
      icon: '🛠️',
      color: '#FFEDD9',
    },
  ])

  /** 'all' 表示全部账本（仅查看汇总） */
  const activeLedgerId = ref('daily')
  const switcherOpen = ref(false)

  const activeLedger = computed<Ledger | undefined>(() =>
    ledgers.value.find((item) => item.id === activeLedgerId.value),
  )

  const isAll = computed(() => activeLedgerId.value === 'all')

  const activeLedgerName = computed(() =>
    isAll.value ? '全部账本' : activeLedger.value?.name ?? '全部账本',
  )

  const defaultLedger = computed<Ledger>(
    () => ledgers.value.find((item) => item.isDefault) ?? ledgers.value[0],
  )

  /** 记账时使用的账本：查看「全部账本」时落默认账本 */
  const addableLedger = computed<Ledger>(() => activeLedger.value ?? defaultLedger.value)

  function selectLedger(id: string) {
    activeLedgerId.value = id
    switcherOpen.value = false
  }

  function openSwitcher() {
    switcherOpen.value = true
  }

  function closeSwitcher() {
    switcherOpen.value = false
  }

  return {
    ledgers,
    activeLedgerId,
    activeLedger,
    activeLedgerName,
    isAll,
    defaultLedger,
    addableLedger,
    switcherOpen,
    selectLedger,
    openSwitcher,
    closeSwitcher,
  }
})
