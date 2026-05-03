<template>
  <div class="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
    
    <aside class="w-20 lg:w-64 bg-dark text-white flex flex-col transition-all duration-300 shadow-xl z-20 shrink-0">
      <div class="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-700 shrink-0">
        <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30"><i class="fa-solid fa-utensils text-white text-xl"></i></div>
        <span class="ml-3 font-bold text-xl hidden lg:block tracking-wide">RM Pro</span>
      </div>
      
      <nav class="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto">

        <router-link to="/dashboard" class="flex items-center p-3 rounded-xl transition-all duration-200 w-full text-gray-400 hover:bg-gray-700 hover:text-white" active-class="bg-primary text-white shadow-md !text-white">
          <i class="fa-solid fa-chart-pie w-6 text-center text-lg"></i>
          <span class="ml-3 font-medium hidden lg:block text-left flex-1">ภาพรวมสถิติ (Dashboard)</span>
        </router-link>
        
        <router-link to="/pos" class="flex items-center p-3 rounded-xl transition-all duration-200 w-full text-gray-400 hover:bg-gray-700 hover:text-white" active-class="bg-primary text-white shadow-md !text-white">
          <i class="fa-solid fa-cash-register w-6 text-center text-lg"></i>
          <span class="ml-3 font-medium hidden lg:block text-left flex-1">POS (รับออเดอร์)</span>
        </router-link>

        <router-link to="/tables" class="flex items-center p-3 rounded-xl transition-all duration-200 w-full text-gray-400 hover:bg-gray-700 hover:text-white" active-class="bg-primary text-white shadow-md !text-white">
          <i class="fa-solid fa-border-all w-6 text-center text-lg"></i>
          <span class="ml-3 font-medium hidden lg:block text-left flex-1">ผังโต๊ะรวม</span>
        </router-link>

        <router-link to="/kitchen" class="flex items-center p-3 rounded-xl transition-all duration-200 w-full text-gray-400 hover:bg-gray-700 hover:text-white" active-class="bg-primary text-white shadow-md !text-white">
          <i class="fa-solid fa-fire-burner w-6 text-center text-lg"></i>
          <span class="ml-3 font-medium hidden lg:block text-left flex-1">Kitchen (ห้องครัว)</span>
        </router-link>

        <router-link to="/history" class="flex items-center p-3 rounded-xl transition-all duration-200 w-full text-gray-400 hover:bg-gray-700 hover:text-white" active-class="bg-primary text-white shadow-md !text-white">
          <i class="fa-solid fa-clock-rotate-left w-6 text-center text-lg"></i>
          <span class="ml-3 font-medium hidden lg:block text-left flex-1">ประวัติบิล (History)</span>
        </router-link>

        <router-link to="/reports" class="flex items-center p-3 rounded-xl transition-all duration-200 w-full text-gray-400 hover:bg-gray-700 hover:text-white" active-class="bg-primary text-white shadow-md !text-white">
          <i class="fa-solid fa-chart-line w-6 text-center text-lg"></i>
          <span class="ml-3 font-medium hidden lg:block text-left flex-1">รายงาน (Reports)</span>
        </router-link>

        <router-link to="/settings" class="flex items-center p-3 rounded-xl transition-all duration-200 w-full text-gray-400 hover:bg-gray-700 hover:text-white" active-class="bg-primary text-white shadow-md !text-white">
          <i class="fa-solid fa-cogs w-6 text-center text-lg"></i>
          <span class="ml-3 font-medium hidden lg:block text-left flex-1">ตั้งค่าระบบ (Settings)</span>
        </router-link>

      </nav>
      
      <div class="p-4 border-t border-gray-700 flex items-center justify-between shrink-0">
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold uppercase">{{ user?.username.charAt(0) || 'U' }}</div>
          <div class="ml-3 hidden lg:block text-sm">
            <p class="font-bold text-white capitalize">{{ user?.username || 'Guest' }}</p>
            <p class="text-primary text-xs font-bold">{{ user?.role || 'Unknown' }}</p>
          </div>
        </div>
        <button @click="handleLogout" class="hidden lg:flex w-8 h-8 rounded-lg bg-gray-800 hover:bg-red-500 hover:text-white items-center justify-center text-gray-400 transition-colors ml-auto"><i class="fa-solid fa-power-off"></i></button>
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

onMounted(() => {
  // ดึงข้อมูลผู้ใช้ตอนโหลดหน้า
  const savedUser = localStorage.getItem('rmpro_user')
  if (savedUser) {
    user.value = JSON.parse(savedUser)
  } else {
    // ถ้าไม่มีข้อมูล ให้เด้งกลับไปหน้า Login
    router.push('/login')
  }
})

const handleLogout = () => {
  Swal.fire({
    title: 'ออกจากระบบ?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ออกจากระบบ',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#ef4444'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('rmpro_user')
      router.push('/login')
    }
  })
}
</script>