import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from './supabase'

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
import SuperAdmin from './views/SuperAdmin.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/customer', name: 'Customer', component: Customer },
  { 
    path: '/', 
    component: Layout,
    children: [
      { path: '', redirect: '/dashboard' }, 
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'pos', name: 'Pos', component: Pos },
      { path: 'tables', name: 'Tables', component: Tables },
      { path: 'kitchen', name: 'Kitchen', component: Kitchen },
      { path: 'history', name: 'History', component: History },
      { path: 'reports', name: 'Reports', component: Reports },
      { path: 'settings', name: 'Settings', component: Settings },
      { path: 'superadmin', name: 'SuperAdmin', component: SuperAdmin },
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 🌟 อัปเดต Vue Router ใหม่ เลิกใช้ next() แล้วเปลี่ยนเป็น return แทน 🌟
router.beforeEach(async (to, from) => {
  const savedUser = localStorage.getItem('rmpro_user')
  const user = savedUser ? JSON.parse(savedUser) : null

  if (to.path === '/login' || to.path === '/customer') return true
  if (!user) return '/login'

  // 👑 1. กรณี Super Admin: บังคับให้อยู่แค่หน้า Super Admin และไม่ต้องเช็ค store_id
  if (user.role === 'SuperAdmin') {
    if (to.path === '/superadmin') return true
    return '/superadmin'
  }

  // 👤 2. กรณี User ร้านค้า: ถ้าไม่มี store_id ให้เตะออก
  if (!user.store_id) return '/login'

  const { data: store } = await supabase.from('stores').select('*').eq('id', user.store_id).single()
  
  if (to.path !== '/login' && to.path !== '/customer') {
    if (!store || store.subscription_status === 'Expired' || new Date(store.expires_at) < new Date()) {
      alert('ขออภัย แพ็กเกจของร้านคุณหมดอายุแล้ว กรุณาติดต่อแอดมินเพื่อต่ออายุครับ')
      localStorage.removeItem('rmpro_user')
      return '/login'
    }

    const pageName = to.path.split('/')[1] || 'dashboard'
    const allowedPages = user.allowed_pages ? user.allowed_pages.split(',') : []
    const proFeatures = ['kitchen', 'reports']
    const isProPage = proFeatures.includes(pageName)
    const hasPackageRight = isProPage ? store.package_type === 'Pro' : true
    const hasUserRight = allowedPages.includes(pageName)
    
    if (!hasUserRight || !hasPackageRight) {
      try {
        await supabase.from('security_logs').insert([{
          store_id: user.store_id,
          username: user.username,
          attempted_url: to.path,
          action: !hasPackageRight ? `ร้าน Standard พยายามเข้า ${pageName}` : 'พยายามเข้าถึงหน้าที่ไม่มีสิทธิ์'
        }])
      } catch (err) {}

      if (from.path && from.path !== '/' && from.path !== '/login') return false 
      else return '/' + (allowedPages[0] || 'dashboard')
    }
  }

  return true
})

const app = createApp(App)
app.use(router)
app.mount('#app')