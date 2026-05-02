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

// กำหนดเส้นทาง (Routes)
const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/customer', name: 'Customer', component: Customer },
  { 
    path: '/', 
    component: Layout,
    children: [
      { path: '', redirect: '/pos' }, // ถ้าเข้าหน้าแรก ให้เด้งไป /pos เลย
      { path: 'pos', name: 'Pos', component: Pos },
      { path: 'tables', name: 'Tables', component: Tables },
      { path: 'kitchen', name: 'Kitchen', component: Kitchen }
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