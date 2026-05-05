<template>
  <div class="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
    
    <aside :class="['bg-dark text-white flex flex-col transition-all duration-300 shadow-xl z-20 shrink-0 relative', isCollapsed ? 'w-20' : 'w-20 lg:w-64']">
      
      <button @click="isCollapsed = !isCollapsed" class="hidden lg:flex absolute -right-3 top-8 bg-primary text-white w-6 h-6 rounded-full items-center justify-center shadow-md z-[100] hover:scale-110 transition-transform">
        <i class="fa-solid text-[10px]" :class="isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
      </button>

      <div class="h-16 flex items-center justify-center lg:justify-start px-0 lg:px-6 border-b border-gray-700 shrink-0">
        <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 shrink-0"><i class="fa-solid fa-utensils text-white text-xl"></i></div>
        <span :class="['ml-3 font-bold text-xl tracking-wide truncate transition-opacity duration-200', isCollapsed ? 'hidden' : 'hidden lg:block']">RM Pro</span>
      </div>
      
      <nav class="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto no-scrollbar">
        <template v-for="menu in menuItems" :key="menu.path">
          <router-link 
            v-if="hasAccess(menu.permission)"
            :to="menu.path" 
            class="flex items-center p-3 rounded-xl transition-all duration-200 w-full text-gray-400 hover:bg-gray-700 hover:text-white" 
            active-class="bg-primary text-white shadow-md !text-white"
            :title="isCollapsed ? menu.title : ''"
          >
            <i :class="menu.icon" class="w-6 text-center text-lg shrink-0"></i>
            <span :class="['ml-3 font-medium text-left flex-1 truncate transition-opacity', isCollapsed ? 'hidden' : 'hidden lg:block']">{{ menu.title }}</span>
          </router-link>
        </template>
      </nav>
      
      <div class="p-4 border-t border-gray-700 flex items-center justify-center lg:justify-between shrink-0">
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold uppercase shrink-0">{{ user?.username?.charAt(0) || 'U' }}</div>
          <div :class="['ml-3 text-sm truncate', isCollapsed ? 'hidden' : 'hidden lg:block']">
            <p class="font-bold text-white capitalize">{{ user?.username || 'Guest' }}</p>
            <p class="text-primary text-xs font-bold">{{ user?.role || 'Unknown' }}</p>
          </div>
        </div>
        <button @click="handleLogout" :class="['w-8 h-8 rounded-lg bg-gray-800 hover:bg-red-500 hover:text-white items-center justify-center text-gray-400 transition-colors shrink-0', isCollapsed ? 'hidden' : 'hidden lg:flex']" title="ออกจากระบบ"><i class="fa-solid fa-power-off"></i></button>
      </div>
    </aside>

    <main class="flex-1 bg-gray-100 h-full overflow-hidden relative">
      <router-view></router-view>
    </main>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()
const user = ref(null)
const isCollapsed = ref(false) // 🌟 ตัวแปรเก็บสถานะการย่อเมนู

const menuItems = [
  { path: '/dashboard', title: 'Dashboard', icon: 'fa-solid fa-chart-pie', permission: 'dashboard' },
  { path: '/pos', title: 'POS (รับออเดอร์)', icon: 'fa-solid fa-cash-register', permission: 'pos' },
  { path: '/tables', title: 'ผังโต๊ะรวม', icon: 'fa-solid fa-border-all', permission: 'tables' },
  { path: '/kitchen', title: 'ห้องครัว', icon: 'fa-solid fa-fire-burner', permission: 'kitchen' },
  { path: '/history', title: 'ประวัติบิล', icon: 'fa-solid fa-clock-rotate-left', permission: 'history' },
  { path: '/reports', title: 'รายงาน', icon: 'fa-solid fa-chart-line', permission: 'reports' },
  { path: '/settings', title: 'ตั้งค่าระบบ', icon: 'fa-solid fa-cogs', permission: 'settings' },
]

const storeInfo = ref(null)

onMounted(async () => {
  const savedUser = localStorage.getItem('rmpro_user')
  if (savedUser) {
    user.value = JSON.parse(savedUser)
    // โหลดข้อมูลร้านเพื่อดูแพ็กเกจ
    const { data } = await supabase.from('stores').select('*').eq('id', user.value.store_id).single()
    storeInfo.value = data
  } else {
    router.push('/login')
  }
})

const hasAccess = (permission) => {
  if (!user.value || !storeInfo.value) return false
  
  // 1. เช็คสิทธิ์รายบุคคล
  const userHasRight = user.value.allowed_pages.split(',').includes(permission)
  
  // 2. เช็คสิทธิ์ตามแพ็กเกจ
  const proFeatures = ['kitchen', 'reports']
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