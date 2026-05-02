<template>
  <div class="h-screen w-full font-sans bg-gray-50 flex">
    <div class="flex-1 flex items-center justify-center relative bg-gray-900 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1934&auto=format&fit=crop');">
      <div class="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"></div>
      
      <div class="bg-white rounded-3xl shadow-2xl p-8 md:p-10 w-[90%] max-w-md relative z-10 animate-[fadeIn_0.5s_ease-out]">
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 mx-auto mb-4 text-white text-4xl">
            <i class="fa-solid fa-utensils"></i>
          </div>
          <h1 class="text-3xl font-black text-gray-800">RM Pro</h1>
          <p class="text-gray-500 font-medium mt-1">ระบบบริหารจัดการร้านอาหาร</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">ชื่อผู้ใช้ (Username)</label>
            <input v-model="loginForm.username" type="text" required class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary outline-none transition-all font-medium" placeholder="กรอกชื่อผู้ใช้">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">รหัสผ่าน (Password)</label>
            <input v-model="loginForm.password" type="password" required class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary outline-none transition-all font-medium" placeholder="กรอกรหัสผ่าน">
          </div>
          <button type="submit" :disabled="isLoggingIn" class="w-full bg-primary hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all active:scale-95 flex justify-center items-center gap-2 mt-4 text-lg">
            {{ isLoggingIn ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import Swal from 'sweetalert2'

const router = useRouter()
const isLoggingIn = ref(false)
const loginForm = ref({ username: '', password: '' })

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) return
  isLoggingIn.value = true

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', loginForm.value.username)
      .eq('password', loginForm.value.password)
      .single()

    if (error || !data) {
      Swal.fire({ icon: 'error', title: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง!' })
    } else {
      // 🌟 บันทึกข้อมูลลง LocalStorage แล้วเปลี่ยนหน้าไปที่ POS
      localStorage.setItem('rmpro_user', JSON.stringify(data))
      Swal.fire({ icon: 'success', title: `ยินดีต้อนรับ ${data.username}`, toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
      router.push('/pos') 
    }
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้' })
  } finally {
    isLoggingIn.value = false
  }
}
</script>