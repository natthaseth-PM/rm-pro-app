<template>
  <div class="flex flex-col h-screen w-full bg-gray-50 font-sans overflow-hidden">
    <div v-if="daysLeft <= 30 && daysLeft > 0 && user?.role !== 'SuperAdmin'" class="bg-red-500 text-white py-2 text-center text-[10px] font-black tracking-widest z-[100] uppercase shadow-md">
      ⚠️ แพ็กเกจจะหมดอายุใน {{ daysLeft }} วัน กรุณาติดต่อ Suwonp เพื่อต่ออายุ
    </div>

    <div class="flex flex-1 overflow-hidden">
      <aside :class="['bg-dark text-white flex flex-col transition-all duration-300 z-20 shrink-0 relative', isCollapsed ? 'w-20' : 'w-64']">
        <div class="h-16 flex items-center px-6 border-b border-gray-700">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-orange-500/20"><i class="fa-solid fa-utensils"></i></div>
          <span v-if="!isCollapsed" class="font-bold text-lg tracking-tight">RM Pro</span>
        </div>
        
        <nav class="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto no-scrollbar">
          <router-link v-for="menu in visibleMenus" :key="menu.path" :to="menu.path" class="flex items-center p-3 rounded-xl text-gray-400 hover:bg-gray-700 hover:text-white transition-all group" active-class="bg-primary text-white shadow-lg">
            <i :class="menu.icon" class="w-6 text-center text-lg"></i>
            <span v-if="!isCollapsed" class="ml-3 font-medium">{{ menu.title }}</span>
          </router-link>
        </nav>

        <div class="p-4 border-t border-gray-700 bg-gray-900/50">
          <div class="flex items-center mb-4" v-if="!isCollapsed">
            <div class="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-[10px] font-bold border border-gray-500 uppercase">{{ user?.username?.charAt(0) }}</div>
            <div class="ml-3">
              <p class="font-bold text-xs truncate w-32">{{ user?.username }}</p>
              <p class="text-[9px] font-black text-primary uppercase">{{ user?.role }}</p>
            </div>
          </div>
          <button @click="logout" class="w-full flex items-center justify-center p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20">
            <i class="fa-solid fa-power-off"></i>
            <span v-if="!isCollapsed" class="ml-2 font-bold text-xs">LOGOUT</span>
          </button>
        </div>
      </aside>

      <main class="flex-1 overflow-hidden relative bg-gray-100 flex flex-col">
        <router-view class="flex-1"></router-view>
        <footer class="bg-white border-t border-gray-200 py-1.5 text-center text-[10px] font-bold text-gray-400 shrink-0">
          &copy; 2026 Suwonp. All rights reserved.
        </footer>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('rmpro_user')))
const isCollapsed = ref(false)

const allMenus = [
  { path: '/dashboard', title: 'Dashboard', icon: 'fa-solid fa-chart-pie', roles: ['Admin', 'Cashier'] },
  { path: '/pos', title: 'POS (รับออเดอร์)', icon: 'fa-solid fa-cash-register', roles: ['Admin', 'Cashier'] },
  { path: '/tables', title: 'ผังโต๊ะรวม', icon: 'fa-solid fa-border-all', roles: ['Admin', 'Cashier'] },
  { path: '/kitchen', title: 'ห้องครัว (KDS)', icon: 'fa-solid fa-fire-burner', roles: ['Admin', 'Chef'] },
  { path: '/history', title: 'ประวัติบิล', icon: 'fa-solid fa-clock-rotate-left', roles: ['Admin', 'Cashier'] },
  { path: '/reports', title: 'รายงาน', icon: 'fa-solid fa-chart-line', roles: ['Admin'] },
  { path: '/settings', title: 'ตั้งค่าระบบ', icon: 'fa-solid fa-cog', roles: ['Admin'] },
  { path: '/superadmin', title: 'จัดการผู้เช่า', icon: 'fa-solid fa-user-shield', roles: ['SuperAdmin'] }
]

const visibleMenus = computed(() => allMenus.filter(m => m.roles.includes(user.value?.role)))

const daysLeft = computed(() => {
  const exp = user.value?.store_info?.expires_at
  if (!exp) return 999
  return Math.ceil((new Date(exp) - new Date()) / (1000 * 60 * 60 * 24))
})

const logout = () => { localStorage.removeItem('rmpro_user'); router.push('/login') }
</script>