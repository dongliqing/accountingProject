<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { login } from '@/api/modules/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  username: '',
  password: '',
})

const loading = ref(false)

async function handleLogin() {
  if (!form.username || !form.password) {
    showToast('请输入用户名和密码')
    return
  }

  loading.value = true

  try {
    const res = await login(form.username, form.password)
    const { token, user } = res.data

    userStore.setToken(token)
    userStore.setUser({
      id: user.id,
      name: user.username,
      avatar: user.avatar ?? '',
      email: user.email,
    })

    localStorage.setItem('userId', user.id)
    if (user.phone) {
      localStorage.setItem('phone', user.phone)
    }

    router.replace('/')
  } catch (err: any) {
    showToast(err.message || '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-logo">¥</div>

    <div class="login-head">
      <h1>多账单记账助手</h1>
      <p>多账本 · 多账单 · 智能记账</p>
    </div>

    <div class="login-card">
      <van-field
        v-model="form.username"
        label="用户名"
        placeholder="请输入用户名"
        autocomplete="username"
      />
      <van-field
        v-model="form.password"
        type="password"
        label="密码"
        placeholder="请输入密码"
        autocomplete="current-password"
      />

      <van-button
        block
        round
        color="#FEDA44"
        class="login-btn"
        :loading="loading"
        loading-text="登录中..."
        @click="handleLogin"
      >
        登 录
      </van-button>
    </div>

    <p class="login-foot">© 2025 多账单记账助手 · 账号由管理员预置</p>
  </div>
</template>
