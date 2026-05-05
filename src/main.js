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


router.beforeEach(async (to, from, next) => {
  const savedUser = localStorage.getItem('rmpro_user')
  const user = savedUser ? JSON.parse(savedUser) : null

  // 1. หน้าสาธารณะ
  if (to.path === '/login' || to.path === '/customer') return next()

  // 2. ตรวจสอบการ Login
  if (!user) return next('/login')

  // 3. ตรวจสอบแพ็กเกจและวันหมดอายุ (ดึงสดจาก Supabase เพื่อความชัวร์)
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('id', user.store_id)
    .single()

  if (!store || store.subscription_status === 'Expired' || new Date(store.expires_at) < new Date()) {
    // ถ้าหมดอายุ ให้แสดงแจ้งเตือน (หรือ redirect ไปหน้าชำระเงิน)
    if (to.path !== '/expired') {
      alert('ขออภัย แพ็กเกจของคุณหมดอายุแล้ว กรุณาติดต่อผู้ดูแลระบบ')
      return next(false) 
    }
  }

  // 4. ตรวจสอบสิทธิ์การเข้าถึงหน้า (Permissions) และสิทธิ์ตามแพ็กเกจ (Package Features)
  if (to.path !== '/login' && to.path !== '/customer') {
    const pageName = to.path.split('/')[1] || 'dashboard'
    const allowedPages = user.allowed_pages ? user.allowed_pages.split(',') : []
    
    // กำหนดหน้าเฉพาะของแพ็กเกจ Pro
    const proPages = ['kitchen', 'reports'] 
    const isProFeature = proPages.includes(pageName)

    // เงื่อนไข: ต้องมีสิทธิ์ใน User AND (ถ้าเป็นฟีเจอร์ Pro ร้านต้องเป็น Pro)
    const hasUserRight = allowedPages.includes(pageName)
    const hasPackageRight = isProFeature ? store.package_type === 'Pro' : true

    if (!hasUserRight || !hasPackageRight) {
      // บันทึก Log การพยายามเข้าถึง
      await supabase.from('security_logs').insert([{
        username: user.username,
        store_id: user.store_id,
        attempted_url: to.path,
        action: !hasPackageRight ? 'พยายามใช้ฟีเจอร์ Pro ในแพ็กเกจ Standard' : 'ไม่มีสิทธิ์เข้าถึง'
      }])
      
      return next('/' + (allowedPages[0] || 'dashboard'))
    }
  }

  next()
})

const app = createApp(App)
app.use(router)
app.mount('#app')