import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'

// นำเข้า Component หน้าต่างๆ
import Login from './views/Login.vue'
import Layout from './views/Layout.vue'
import Pos from './views/Pos.vue'
import Customer from './views/Customer.vue'
import Kitchen from './views/Kitchen.vue'
import Tables from './views/Tables.vue'
import History from './views/History.vue'
import Reports from './views/Reports.vue'
import Dashboard from './views/Dashboard.vue'
import Settings from './views/Settings.vue'

// กำหนดเส้นทาง (Routes)
const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/customer', name: 'Customer', component: Customer },
  { path: '/history', name: 'History', component: History },
  { 
    path: '/', 
    component: Layout,
    children: [
      { path: '', redirect: '/dashboard' }, // 🌟 2. เปลี่ยนหน้าแรกให้เด้งมา Dashboard เลย (ให้ผู้จัดการดูยอดก่อน)
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'pos', name: 'Pos', component: Pos },
      { path: 'tables', name: 'Tables', component: Tables },
      { path: 'kitchen', name: 'Kitchen', component: Kitchen },
      { path: 'history', name: 'History', component: History },
      { path: 'reports', name: 'Reports', component: Reports },
      { path: 'settings', name: 'Settings', component: Settings },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')