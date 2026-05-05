<template>
  <div class="flex flex-col h-screen w-full bg-gray-50 overflow-hidden font-sans">
    
    <div v-if="isNearExpiry && user?.role !== 'SuperAdmin'" class="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-center text-xs font-black tracking-wide shadow-md z-[100] shrink-0 flex items-center justify-center gap-2">
      <i class="fa-solid fa-triangle-exclamation animate-bounce"></i>
      แพ็กเกจของคุณจะหมดอายุในอีก {{ daysLeft }} วัน กรุณาต่ออายุเพื่อใช้งานอย่างต่อเนื่อง
    </div>

    <div class="flex flex-1 overflow-hidden">
      <aside :class="['bg-[#111827] text-white flex flex-col transition-all duration-300 shadow-xl z-20 shrink-0 relative', isCollapsed ? 'w-20' : 'w-64']">
        
        <button @click="isCollapsed = !isCollapsed" class="hidden lg:flex absolute -right-3 top-8 bg-blue-600 text-white w-6 h-6 rounded-full items-center justify-center shadow-md z-[100] hover:scale-110 transition-transform">
          <i class="fa-solid text-[10px]" :class="isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
        </button>

        <div class="h-[72px] flex items-center justify-center lg:justify-start px-0 lg:px-6 border-b border-gray-800 shrink-0">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
            <i class="fa-solid fa-utensils text-white text-xl"></i>
          </div>
          <div :class="['ml-3 transition-opacity duration-200 truncate', isCollapsed ? 'hidden' : 'hidden lg:block']">
            <h1 class="font-black text-lg tracking-wide leading-tight">RM Pro</h1>
            <p class="text-[10px] text-blue-400 font-bold uppercase tracking-widest truncate">{{ storeInfo?.store_name || 'Enterprise POS' }}</p>
          </div>
        </div>
        
        <nav class="flex-1 py-6 flex flex-col gap-1 px-3 overflow-y-auto no-scrollbar">
          <router-link v-for="menu in visibleMenus" :key="menu.path" :to="menu.path" class="flex items-center p-3 rounded-xl transition-all duration-200 w-full text-gray-400 hover:bg-gray-800 hover:text-white group" active-class="bg-blue-600 text-white shadow-md !text-white" :title="isCollapsed ? menu.title : ''">
            <i :class="menu.icon" class="w-6 text-center text-lg group-hover:scale-110 transition-transform"></i>
            <span :class="['ml-3 font-medium text-left flex-1 truncate transition-opacity', isCollapsed ? 'hidden' : 'hidden lg:block']">{{ menu.title }}</span>
          </router-link>
        </nav>
        
        <div class="p-4 border-t border-gray-800 shrink-0">
          <div class="flex items-center mb-4 justify-center lg:justify-start">
            <div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-black uppercase shrink-0 border-2 border-gray-600 shadow-inner">
              {{ user?.username?.charAt(0) || 'U' }}
            </div>
            <div :class="['ml-3 text-sm truncate', isCollapsed ? 'hidden' : 'hidden lg:block']">
              <p class="font-bold text-white capitalize">{{ user?.username || 'Guest' }}</p>
              <p v-if="user?.role === 'SuperAdmin'" class="text-yellow-400 text-[10px] font-black uppercase tracking-wider">SYSTEM ADMIN</p>
              <p v-else class="text-blue-400 text-[10px] font-black uppercase tracking-wider">{{ storeInfo?.package_type || 'STANDARD' }} PLAN</p>
            </div>
          </div>
          <button @click="handleLogout" :class="['w-full flex items-center justify-center p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold text-sm', isCollapsed ? 'p-2' : '']" title="ออกจากระบบ">
            <i class="fa-solid fa-power-off"></i>
            <span :class="['ml-2', isCollapsed ? 'hidden' : 'hidden lg:inline']">ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      <main class="flex-1 bg-gray-50 h-full overflow-hidden flex flex-col relative">
        <router-view class="flex-1"></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import Swal from 'sweetalert2'

const router = useRouter()
const user = ref(null)
const storeInfo = ref(null)
const isCollapsed = ref(false)

const allMenus = [
  { path: '/dashboard', title: 'Dashboard', icon: 'fa-solid fa-chart-pie', permission: 'dashboard' },
  { path: '/pos', title: 'รับออเดอร์', icon: 'fa-solid fa-cash-register', permission: 'pos' },
  { path: '/tables', title: 'ผังโต๊ะรวม', icon: 'fa-solid fa-border-all', permission: 'tables' },
  { path: '/kitchen', title: 'ห้องครัว (KDS)', icon: 'fa-solid fa-fire-burner', permission: 'kitchen' },
  { path: '/history', title: 'ประวัติบิล', icon: 'fa-solid fa-clock-rotate-left', permission: 'history' },
  { path: '/reports', title: 'รายงานยอดขาย', icon: 'fa-solid fa-chart-line', permission: 'reports' },
  { path: '/settings', title: 'ตั้งค่าระบบ', icon: 'fa-solid fa-cogs', permission: 'settings' },
  { path: '/superadmin', title: 'จัดการลูกค้าเช่า', icon: 'fa-solid fa-chess-king', permission: 'superadmin' }
]

// 🌟 ตัวกรองสิทธิ์: Standard Plan จะไม่เห็นเมนู "ห้องครัว"
const visibleMenus = computed(() => {
  if (user.value?.role === 'SuperAdmin') {
    return [{ path: '/superadmin', title: 'Super Admin', icon: 'fa-solid fa-chess-king', permission: 'superadmin' }]
  }
  return allMenus.filter(m => hasAccess(m.permission))
})

const daysLeft = computed(() => {
  if (!storeInfo.value?.expires_at) return 999;
  return Math.ceil((new Date(storeInfo.value.expires_at) - new Date()) / (1000 * 60 * 60 * 24))
})
const isNearExpiry = computed(() => daysLeft.value <= 30 && daysLeft.value > 0)

onMounted(async () => {
  const savedUser = localStorage.getItem('rmpro_user')
  if (savedUser) {
    user.value = JSON.parse(savedUser)
    if (user.value.store_id) {
      const { data } = await supabase.from('stores').select('*').eq('id', user.value.store_id).single()
      if (data) storeInfo.value = data
    }
  } else {
    router.push('/login')
  }
})

const hasAccess = (permission) => {
  if (!user.value || !storeInfo.value) return false
  const userHasRight = user.value.allowed_pages?.split(',').includes(permission)
  
  // 🌟 ล็อกสิทธิ์แพ็กเกจ: ถ้าเป็น Standard จะใช้ KDS และ Reports ไม่ได้ (ตามที่คุณกำหนด)
  const proFeatures = ['kitchen']
  const packageHasRight = proFeatures.includes(permission) ? storeInfo.value.package_type === 'Pro' : true
  
  return userHasRight && packageHasRight
}

const handleLogout = () => {
  Swal.fire({ title: 'ออกจากระบบ?', icon: 'warning', showCancelButton: true, confirmButtonText: 'ออกจากระบบ', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#ef4444' }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('rmpro_user')
      router.push('/login')
    }
  })
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>