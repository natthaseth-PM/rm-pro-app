import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from './supabase'

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
    ]
  },
  // 🌟 ดักจับ URL ที่ไม่มีอยู่จริง (404 Catch-all) 🌟
  // ถ้าพิมพ์ URL ผิด ให้เด้งกลับไปที่ Root ('/') ซึ่งเดี๋ยว Route Guard จะเตะไปหน้าที่มีสิทธิ์เอง
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 🔐 ระบบ Route Guard (ตรวจสอบสิทธิ์ + บันทึก Log เงียบๆ)
router.beforeEach(async (to, from, next) => {
  const savedUser = localStorage.getItem('rmpro_user')
  const user = savedUser ? JSON.parse(savedUser) : null

  // 1. หน้าที่ไม่ต้อง Login
  if (to.path === '/login' || to.path === '/customer') {
    return next()
  }

  // 2. ถ้ายังไม่ Login
  if (!user) {
    return next('/login')
  }

  // 3. ตรวจสอบสิทธิ์ (Permissions)
  if (to.path !== '/login' && to.path !== '/customer') {
    const pageName = to.path.split('/')[1] || 'dashboard'
    const allowedPages = user.allowed_pages ? user.allowed_pages.split(',') : []
    
    if (!allowedPages.includes(pageName)) {
      
      // แอบบันทึก Log ลงฐานข้อมูลเงียบๆ 
      try {
        await supabase.from('security_logs').insert([{
          username: user.username,
          attempted_url: to.path,
          action: 'พยายามเข้าถึงหน้าที่ไม่มีสิทธิ์ หรือ URL ผิด'
        }])
      } catch (err) {
        console.error('Log failed') 
      }

      // ถ้าเขามีหน้าเก่าอยู่แล้ว ให้ยกเลิกการเปลี่ยนหน้า (อยู่หน้าเดิม)
      if (from.path && from.path !== '/' && from.path !== '/login') {
        return next(false) 
      } else {
        // เด้งไปหน้าแรกที่เขามีสิทธิ์
        return next('/' + (allowedPages[0] || 'dashboard'))
      }
    }
  }

  next()
})

const app = createApp(App)
app.use(router)
app.mount('#app')