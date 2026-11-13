import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vant from 'vant'
import 'vant/lib/index.css'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia() // 创建一个 Pinia 实例

app.use(pinia) // 使用同一个 Pinia 实例
app.use(router)
app.use(Vant)

app.mount('#app')
