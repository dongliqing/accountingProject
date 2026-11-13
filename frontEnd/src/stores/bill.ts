import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useLedgerStore } from './ledger'

export type BillType = 'expense' | 'income'
export type BillFilter = 'all' | BillType

export interface BillRecord {
  id: string
  ledgerId: string
  title: string
  note: string
  icon: string
  tint: string
  time: string
  /** YYYY-MM-DD */
  date: string
  amount: number
  type: BillType
}

export interface MonthStat {
  label: string
  income: number
  expense: number
}

export interface DayGroup {
  date: string
  label: string
  dateLabel: string
  income: number
  expense: number
  items: BillRecord[]
}

export interface NewBillInput {
  ledgerId: string
  title: string
  note: string
  icon: string
  tint: string
  amount: number
  type: BillType
  date: Date
}

const pad = (n: number) => String(n).padStart(2, '0')

function dateOffset(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() - offset)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function monthLabel(monthsAgo: number): string {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - monthsAgo)
  return `${d.getMonth() + 1}月`
}

function monthNumber(label: string): number {
  return Number(label.replace('月', '')) || 0
}

/** 设计稿「账单」页的历史月份数据（当月由账单明细实时汇总） */
const HISTORY: Record<string, Array<{ monthsAgo: number; income: number; expense: number }>> = {
  daily: [
    { monthsAgo: 1, income: 12800, expense: 4314.79 },
    { monthsAgo: 2, income: 21000, expense: 9260 },
    { monthsAgo: 3, income: 18600, expense: 6820.3 },
    { monthsAgo: 4, income: 16200, expense: 4980 },
    { monthsAgo: 5, income: 11860, expense: 5329.2 },
  ],
  travel: [
    { monthsAgo: 1, income: 6000, expense: 2860 },
    { monthsAgo: 2, income: 4000, expense: 3180 },
    { monthsAgo: 4, income: 8000, expense: 5600 },
    { monthsAgo: 6, income: 2000, expense: 1500 },
  ],
  renovation: [
    { monthsAgo: 2, income: 20000, expense: 12450 },
    { monthsAgo: 3, income: 15000, expense: 13907.7 },
    { monthsAgo: 5, income: 5000, expense: 5000 },
  ],
}

/** 设计稿「明细」页示例记录 */
const seedBills: BillRecord[] = [
  { id: 'd1', ledgerId: 'daily', title: '午餐', note: '公司楼下', icon: '🍱', tint: '#FFF1D6', time: '12:18', date: dateOffset(0), amount: 28, type: 'expense' },
  { id: 'd2', ledgerId: 'daily', title: '咖啡', note: '冰美式', icon: '☕', tint: '#EDE4D8', time: '09:40', date: dateOffset(0), amount: 22, type: 'expense' },
  { id: 'd3', ledgerId: 'daily', title: '地铁', note: '通勤', icon: '🚇', tint: '#E8F4FF', time: '08:12', date: dateOffset(0), amount: 6, type: 'expense' },
  { id: 'd4', ledgerId: 'daily', title: '超市采购', note: '牛奶水果', icon: '🛒', tint: '#EAF6EC', time: '19:52', date: dateOffset(0), amount: 72, type: 'expense' },

  { id: 'd5', ledgerId: 'daily', title: '晚餐', note: '朋友聚餐', icon: '🍲', tint: '#FFECEB', time: '19:30', date: dateOffset(1), amount: 68, type: 'expense' },
  { id: 'd6', ledgerId: 'daily', title: '打车', note: '回家', icon: '🚕', tint: '#F2ECFF', time: '21:10', date: dateOffset(1), amount: 34, type: 'expense' },
  { id: 'd7', ledgerId: 'daily', title: '电影票', note: '周末场', icon: '🎬', tint: '#FFF0D9', time: '19:00', date: dateOffset(1), amount: 84, type: 'expense' },
  { id: 'd8', ledgerId: 'daily', title: '电费', note: '上月账单', icon: '💡', tint: '#FFF6D6', time: '10:00', date: dateOffset(1), amount: 120, type: 'expense' },
  { id: 'd9', ledgerId: 'daily', title: '网购', note: '收纳盒', icon: '🛍️', tint: '#FFE9EF', time: '20:30', date: dateOffset(1), amount: 50, type: 'expense' },

  { id: 'd10', ledgerId: 'daily', title: '耳机', note: '降噪款', icon: '🎧', tint: '#EFEAFB', time: '15:20', date: dateOffset(3), amount: 899, type: 'expense' },
  { id: 'd11', ledgerId: 'daily', title: '洗衣液', note: '日常补货', icon: '🧴', tint: '#E9F7EF', time: '11:05', date: dateOffset(3), amount: 40, type: 'expense' },
  { id: 'd12', ledgerId: 'daily', title: '早餐', note: '面包咖啡', icon: '🥐', tint: '#FFF1D6', time: '08:30', date: dateOffset(3), amount: 12, type: 'expense' },
  { id: 'd13', ledgerId: 'daily', title: '健身卡', note: '月卡', icon: '🏋️', tint: '#FFE9DE', time: '18:00', date: dateOffset(3), amount: 348, type: 'expense' },

  { id: 'd14', ledgerId: 'daily', title: '兼职设计费', note: '客户 A', icon: '💼', tint: '#E9F7EF', time: '14:00', date: dateOffset(5), amount: 1200, type: 'income' },

  { id: 'd15', ledgerId: 'daily', title: '房租', note: '本月房租', icon: '🏠', tint: '#E9F7EF', time: '10:00', date: dateOffset(6), amount: 1500, type: 'expense' },
  { id: 'd16', ledgerId: 'daily', title: '水电费', note: '水电燃气', icon: '💡', tint: '#FFF6D6', time: '09:30', date: dateOffset(7), amount: 199.5, type: 'expense' },
  { id: 'd17', ledgerId: 'daily', title: '工资', note: '本月工资', icon: '💼', tint: '#E9F7EF', time: '09:00', date: dateOffset(12), amount: 8600, type: 'income' },
]

const sumBy = (list: BillRecord[], type: BillType) =>
  list.filter((item) => item.type === type).reduce((total, item) => total + item.amount, 0)

/**
 * 账单数据 — 对应设计稿「01 明细」「02 账单」
 * 骨架阶段全部为本地 mock，添加账单后当月汇总会实时变化
 */
export const useBillStore = defineStore('bill', () => {
  const ledgerStore = useLedgerStore()
  const bills = ref<BillRecord[]>(seedBills)

  const currentMonth = new Date().getMonth() + 1
  const currentMonthLabel = `${currentMonth}月`

  /** 当前账本（含「全部账本」）下的账单 */
  const scopedBills = computed(() => {
    const ledgerId = ledgerStore.activeLedgerId
    return bills.value.filter((bill) => ledgerId === 'all' || bill.ledgerId === ledgerId)
  })

  function dayLabel(date: string): string {
    if (date === dateOffset(0)) return '今天'
    if (date === dateOffset(1)) return '昨天'
    return dayDateLabel(date)
  }

  function dayDateLabel(date: string): string {
    const [, month, day] = date.split('-')
    return `${Number(month)}月${Number(day)}日`
  }

  /** 按日倒序分组，支持全部 / 支出 / 收入筛选 */
  function groupedByDay(filter: BillFilter): DayGroup[] {
    const list = scopedBills.value
      .filter((bill) => filter === 'all' || bill.type === filter)
      .slice()
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))

    const groups = new Map<string, DayGroup>()
    for (const bill of list) {
      let group = groups.get(bill.date)
      if (!group) {
        group = {
          date: bill.date,
          label: dayLabel(bill.date),
          dateLabel: dayDateLabel(bill.date),
          income: 0,
          expense: 0,
          items: [],
        }
        groups.set(bill.date, group)
      }
      group.items.push(bill)
      if (bill.type === 'income') group.income += bill.amount
      else group.expense += bill.amount
    }
    return [...groups.values()]
  }

  /** 某账本当月按明细统计 */
  function currentMonthStat(ledgerId: string): MonthStat | null {
    const list = bills.value.filter(
      (bill) => bill.ledgerId === ledgerId && Number(bill.date.slice(5, 7)) === currentMonth,
    )
    if (list.length === 0) return null
    return {
      label: currentMonthLabel,
      income: sumBy(list, 'income'),
      expense: sumBy(list, 'expense'),
    }
  }

  /** 某账本的月度数据：当月实时 + 设计稿历史月份 */
  function monthsFor(ledgerId: string): MonthStat[] {
    const history = (HISTORY[ledgerId] ?? []).map((item) => ({
      label: monthLabel(item.monthsAgo),
      income: item.income,
      expense: item.expense,
    }))
    const current = currentMonthStat(ledgerId)
    const months = current ? [current, ...history] : history
    return months.sort((a, b) => monthNumber(b.label) - monthNumber(a.label))
  }

  /** 当前账本（或全部账本汇总）的月度数据 */
  const billsMonths = computed<MonthStat[]>(() => {
    const ledgerId = ledgerStore.activeLedgerId
    if (ledgerId !== 'all') return monthsFor(ledgerId)

    const merged = new Map<string, MonthStat>()
    for (const ledger of ledgerStore.ledgers) {
      for (const item of monthsFor(ledger.id)) {
        const acc = merged.get(item.label) ?? { label: item.label, income: 0, expense: 0 }
        acc.income += item.income
        acc.expense += item.expense
        merged.set(item.label, acc)
      }
    }
    return [...merged.values()].sort((a, b) => monthNumber(b.label) - monthNumber(a.label))
  })

  /** 年度收入 / 支出 / 结余 */
  const billsTotals = computed(() => {
    const income = billsMonths.value.reduce((total, item) => total + item.income, 0)
    const expense = billsMonths.value.reduce((total, item) => total + item.expense, 0)
    return { income, expense, balance: income - expense }
  })

  /** 明细页顶部汇总卡 */
  const monthSummary = computed(() => {
    const month = billsMonths.value.find((item) => item.label === currentMonthLabel)
    const income = month?.income ?? 0
    const expense = month?.expense ?? 0
    const count = scopedBills.value.filter(
      (bill) => Number(bill.date.slice(5, 7)) === currentMonth,
    ).length
    return { income, expense, balance: income - expense, count }
  })

  /** 我的页统计 */
  const totalStats = computed(() => ({
    count: bills.value.length,
    expense: bills.value.filter((bill) => bill.type === 'expense').reduce((t, b) => t + b.amount, 0),
  }))

  function addBill(input: NewBillInput) {
    const d = input.date
    bills.value.unshift({
      id: `bill-${Date.now()}`,
      ledgerId: input.ledgerId,
      title: input.title,
      note: input.note || '未备注',
      icon: input.icon,
      tint: input.tint,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      amount: input.amount,
      type: input.type,
    })
  }

  return {
    bills,
    scopedBills,
    groupedByDay,
    billsMonths,
    billsTotals,
    monthSummary,
    totalStats,
    addBill,
  }
})
