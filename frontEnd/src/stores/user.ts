import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserInfo {
  id: string
  name: string
  avatar: string
  email: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<UserInfo | null>(null)
  const token = ref<string>(localStorage.getItem('token') || '')

  const isLoggedIn = computed(() => !!token.value)

  function setToken(val: string) {
    token.value = val
    localStorage.setItem('token', val)
  }

  function setUser(info: UserInfo) {
    user.value = info
    localStorage.setItem('userId', info.id)
  }

  /** 从 localStorage 恢复用户信息 */
  function restoreFromStorage() {
    const userId = localStorage.getItem('userId')
    const phone = localStorage.getItem('phone')
    if (userId) {
      user.value = {
        id: userId,
        name: localStorage.getItem('userName') || '',
        avatar: localStorage.getItem('userAvatar') || '',
        email: localStorage.getItem('userEmail') || '',
      }
    }
    return { userId, phone }
  }

  function logout() {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('phone')
    localStorage.removeItem('userName')
    localStorage.removeItem('userAvatar')
    localStorage.removeItem('userEmail')
  }

  return { user, token, isLoggedIn, setToken, setUser, restoreFromStorage, logout }
})
