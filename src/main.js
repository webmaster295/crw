import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { initAuth } from './composables/useAuth'

// ต้องเรียก initAuth() ก่อน mount เพื่อให้ onAuthStateChange พร้อมก่อน router guard วิ่ง
initAuth()

const app = createApp(App)
app.use(router)
app.mount('#app')
