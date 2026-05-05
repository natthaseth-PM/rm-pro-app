import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from './supabase'

// Imports Views ทั้งหมดของคุณ (Dashboard, Pos, Tables, Kitchen, History, Reports, Settings, SuperAdmin, Customer, Login)
import Login from './views/Login.vue'
import Layout from './views/Layout.vue'
import Dashboard from './views/Dashboard.vue'
import Pos from './views/Pos.vue'
import Tables from './views/Tables.vue'
import Kitchen from './views/Kitchen.vue'
import History from './views/History.vue'
import Reports from './views/Reports.vue'
import Settings from './views/Settings.vue'
import SuperAdmin from './views/SuperAdmin.vue'
import Customer from './views/Customer.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/customer', name: 'Customer', component: Customer },
  { 
    path: '/', 
    component: Layout,
    children: [
      { path: '', redirect: '/dashboard' }, 
      { path: 'dashboard', component: Dashboard },
      { path: 'pos', component: Pos },
      { path: 'tables', component: Tables },
      { path: 'kitchen', component: Kitchen },
      { path: 'history', component: History },
      { path: 'reports', component: Reports },
      { path: 'settings', component: Settings },
      { path: 'superadmin', component: SuperAdmin },
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to) => {
  const u = localStorage.getItem('rmpro_user') ? JSON.parse(localStorage.getItem('rmpro_user')) : null

  if (to.path === '/login' || to.path === '/customer') return true
  if (!u) return '/login'

  // 👑 กรณี Super Admin
  if (u.role === 'SuperAdmin') {
    if (to.path === '/superadmin') return true
    return '/superadmin'
  }

  // 👤 กรณีร้านค้า
  if (!u.store_id) return '/login'
  
  // เช็ควันหมดอายุสดจาก DB
  const { data: s } = await supabase.from('stores').select('expires_at, is_active').eq('id', u.store_id).single()
  if (!s || !s.is_active || new Date(s.expires_at) < new Date()) {
    localStorage.removeItem('rmpro_user')
    return '/login'
  }

  return true
})

createApp(App).use(router).mount('#app')