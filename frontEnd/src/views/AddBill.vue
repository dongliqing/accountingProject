<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useLedgerStore } from '@/stores/ledger'
import { useBillStore, type BillType } from '@/stores/bill'

interface Category {
  name: string
  icon: string
  tint: string
}

const router = useRouter()
const ledgerStore = useLedgerStore()
const billStore = useBillStore()

const EXPENSE_CATEGORIES: Category[] = [
  { name: '餐饮', icon: '🍚', tint: '#FFF1D6' },
  { name: '交通', icon: '🚌', tint: '#E8F4FF' },
  { name: '购物', icon: '🛍️', tint: '#FFE9EF' },
  { name: '娱乐', icon: '🎮', tint: '#F2ECFF' },
  { name: '居住', icon: '🏠', tint: '#E9F7EF' },
  { name: '医疗', icon: '💊', tint: '#FFECEB' },
  { name: '学习', icon: '📚', tint: '#E9F1FF' },
]

const INCOME_CATEGORIES: Category[] = [
  { name: '工资', icon: '💼', tint: '#E9F7EF' },
  { name: '红包', icon: '🧧', tint: '#FFECEB' },
  { name: '理财', icon: '📈', tint: '#E8F4FF' },
  { name: '其他', icon: '💰', tint: '#FFF6D6' },
]

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'] as const

const type = ref<BillType>('expense')
const raw = ref('0')
const note = ref('')
const noteDraft = ref('')
const showNotePopup = ref(false)
const showLedgerSheet = ref(false)
const showCalendar = ref(false)
const selectedDate = ref(new Date())
const selectedCategory = ref<Category>(EXPENSE_CATEGORIES[0])
const addLedgerId = ref(ledgerStore.addableLedger.id)

const categories = computed(() =>
  type.value === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES,
)

const addLedger = computed(
  () => ledgerStore.ledgers.find((item) => item.id === addLedgerId.value) ?? ledgerStore.defaultLedger,
)

const ledgerActions = computed(() =>
  ledgerStore.ledgers.map((item) => ({ name: item.name, subname: item.desc })),
)

const minDate = new Date(new Date().getFullYear() - 1, 0, 1)
const maxDate = new Date()

const dateChipLabel = computed(() => {
  const d = selectedDate.value
  const sameDay = d.toDateString() === new Date().toDateString()
  return sameDay ? '今天' : `${d.getMonth() + 1}月${d.getDate()}日`
})

const eyebrow = computed(() => {
  const d = selectedDate.value
  const dateLabel = `${d.getMonth() + 1}月${d.getDate()}日`
  return dateChipLabel.value === '今天' ? `今天 · ${dateLabel}` : dateLabel
})

const amountText = computed(() => formatAmount(raw.value))

watch(type, () => {
  selectedCategory.value = categories.value[0]
})

function formatAmount(value: string): string {
  if (!value) return '0.00'
  if (value === '.') return '0.'
  const [intPart = '0', decPart = ''] = value.split('.')
  return `${intPart || '0'}.${(decPart + '00').slice(0, 2)}`
}

function pressKey(key: string) {
  if (key === 'del') {
    raw.value = raw.value.length > 1 ? raw.value.slice(0, -1) : '0'
    return
  }
  if (key === '.') {
    if (!raw.value.includes('.')) raw.value = raw.value === '0' ? '0.' : `${raw.value}.`
    return
  }
  const parts = raw.value.split('.')
  const hasDecimal = parts.length > 1
  if (hasDecimal && parts[1].length >= 2) return
  if (!hasDecimal && parts[0].length >= 7) return
  raw.value = raw.value === '0' ? key : raw.value + key
}

function setType(next: BillType) {
  type.value = next
}

function selectCategory(category: Category) {
  selectedCategory.value = category
}

function openNote() {
  noteDraft.value = note.value
  showNotePopup.value = true
}

function confirmNote() {
  note.value = noteDraft.value.trim()
  showNotePopup.value = false
}

function onLedgerSelect(action: { name: string }) {
  const target = ledgerStore.ledgers.find((item) => item.name === action.name)
  if (target) addLedgerId.value = target.id
  showLedgerSheet.value = false
}

function onDateConfirm(value: Date | Date[]) {
  selectedDate.value = Array.isArray(value) ? value[0] : value
  showCalendar.value = false
}

function close() {
  if (window.history.length > 1) router.back()
  else router.replace('/')
}

function save() {
  const value = Number(raw.value)
  if (!(value > 0)) {
    showToast('请先输入金额')
    return
  }

  const category = selectedCategory.value
  billStore.addBill({
    ledgerId: addLedger.value.id,
    title: category.name,
    note: note.value,
    icon: category.icon,
    tint: category.tint,
    amount: Math.round(value * 100) / 100,
    type: type.value,
    date: selectedDate.value,
  })

  showToast({ message: `✓ 记账成功 · 已存入${addLedger.value.name}`, position: 'top' })
  window.setTimeout(() => router.replace('/'), 700)
}
</script>

<template>
  <div class="add-page">
    <div class="add-backdrop">
      <div class="bd-card"></div>
      <div class="bd-scrim"></div>
    </div>

    <div class="sheet">
      <div class="grabber"></div>

      <div class="sheet-head">
        <div>
          <p class="sheet-eyebrow">{{ eyebrow }}</p>
          <h2>记一笔</h2>
        </div>
        <button class="sheet-close" aria-label="关闭" @click="close">×</button>
      </div>

      <div class="segment">
        <button class="seg" :class="{ active: type === 'expense' }" @click="setType('expense')">支出</button>
        <button class="seg" :class="{ active: type === 'income' }" @click="setType('income')">收入</button>
      </div>

      <div class="meta-row">
        <button class="meta-chip" @click="showLedgerSheet = true">
          <i class="mini-dot"></i>{{ addLedger.name }}
          <svg class="ico sm" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <button class="meta-chip" @click="showCalendar = true">
          📅 {{ dateChipLabel }}
          <svg class="ico sm" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
        </button>
      </div>

      <div class="sheet-body">
        <div class="amount-box">
          <span class="amount-label">金额</span>
          <div class="amount-value">
            <span class="yen">¥</span><span>{{ amountText }}</span><span class="caret"></span>
          </div>
        </div>

        <div class="cat-grid">
          <button
            v-for="category in categories"
            :key="category.name"
            class="cat"
            :class="{ sel: selectedCategory.name === category.name }"
            @click="selectCategory(category)"
          >
            <span class="cat-emoji" :style="`--tint:${category.tint}`">{{ category.icon }}</span>
            {{ category.name }}
          </button>
          <button class="cat" @click="showToast('分类管理开发中')">
            <span class="cat-emoji" style="--tint: #f4f1e8">＋</span>
            更多
          </button>
        </div>

        <button class="note-row" @click="openNote">
          <span>💬</span>
          <span class="note-ph">{{ note || '点击添加备注（支持历史提示）' }}</span>
          <svg class="ico sm chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>

      <div class="keypad">
        <button
          v-for="key in KEYS"
          :key="key"
          class="key"
          :class="{ 'key-del': key === 'del' }"
          :aria-label="key === 'del' ? '删除' : key"
          @click="pressKey(key)"
        >
          <svg v-if="key === 'del'" class="ico" viewBox="0 0 24 24">
            <path d="M20 6H9l-5 6 5 6h11a1 1 0 001-1V7a1 1 0 00-1-1z" />
            <path d="M13.5 9.5l4 5M17.5 9.5l-4 5" />
          </svg>
          <template v-else>{{ key }}</template>
        </button>
      </div>

      <button class="save-btn" @click="save">保存 · ¥{{ amountText }}</button>
    </div>

    <!-- 账本选择 -->
    <van-action-sheet
      v-model:show="showLedgerSheet"
      :actions="ledgerActions"
      cancel-text="取消"
      close-on-click-action
      @select="onLedgerSelect"
    />

    <!-- 日期选择 -->
    <van-calendar
      v-model:show="showCalendar"
      :min-date="minDate"
      :max-date="maxDate"
      :default-date="selectedDate"
      color="#FEDA44"
      @confirm="onDateConfirm"
    />

    <!-- 备注输入 -->
    <van-popup v-model:show="showNotePopup" position="bottom" round>
      <div class="note-popup">
        <van-field
          v-model="noteDraft"
          label="备注"
          placeholder="给这笔账单加个备注"
          maxlength="30"
          show-word-limit
        />
        <van-button block round color="#FEDA44" class="note-confirm" @click="confirmNote">
          确定
        </van-button>
      </div>
    </van-popup>
  </div>
</template>
