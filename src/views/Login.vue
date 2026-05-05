<template>
  <div class="h-screen w-full font-sans bg-gray-50 flex flex-col">
    <div class="flex-1 flex items-center justify-center relative bg-gray-900 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1934&auto=format&fit=crop');">
      <div class="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"></div>
      
      <div class="bg-white rounded-3xl shadow-2xl p-8 md:p-10 w-[90%] max-w-md relative z-10 animate-[fadeIn_0.5s_ease-out]">
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 mx-auto mb-4 text-white text-4xl"><i class="fa-solid fa-utensils"></i></div>
          <h1 class="text-3xl font-black text-gray-800">RM Pro</h1>
          <p class="text-gray-500 font-bold mt-1 text-sm tracking-wide">Restaurant Management System</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div><label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">ชื่อผู้ใช้ (Username)</label><input v-model="loginForm.username" type="text" required class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary outline-none transition-all font-bold"></div>
          <div><label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">รหัสผ่าน (Password)</label><input v-model="loginForm.password" type="password" required class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary outline-none transition-all font-bold"></div>
          <button type="submit" :disabled="isLoggingIn" class="w-full bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 mt-4 text-lg">
            <i v-if="isLoggingIn" class="fa-solid fa-circle-notch fa-spin"></i>
            {{ isLoggingIn ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ' }}
          </button>
        </form>
      </div>
    </div>
    
    <div class="bg-gray-900 py-3 text-center text-xs font-medium text-gray-400 shrink-0 z-20 border-t border-gray-800">
      &copy; 2026 Suwonp. All rights reserved. | Enterprise SaaS POS
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

// 🔐 ฟังก์ชันเข้ารหัสผ่านแบบ SHA-256 
const hashPassword = async (password) => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) return
  isLoggingIn.value = true

  try {
    const hashedPassword = await hashPassword(loginForm.value.password)
    
    // 🌟 ปรับตรง .select() ให้ระบุความสัมพันธ์ผ่าน store_id ให้ชัดเจน 🌟
    let { data: user, error } = await supabase
      .from('users')
      .select('*, stores:store_id(*)') 
      .eq('username', loginForm.value.username)
      .eq('password', hashedPassword)
      .maybeSingle()

    // ระบบ Auto-Migrate สำหรับรหัสผ่านเก่า (Plain Text)
    if (!user) {
      const { data: fallbackUser } = await supabase
        .from('users')
        .select('*, stores:store_id(*)')
        .eq('username', loginForm.value.username)
        .eq('password', loginForm.value.password)
        .maybeSingle()
      
      if (fallbackUser) {
        await supabase.from('users').update({ password: hashedPassword }).eq('id', fallbackUser.id)
        user = fallbackUser
      }
    }

    if (!user) {
      Swal.fire({ icon: 'error', title: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง!' })
      isLoggingIn.value = false
      return
    }

    // ตรวจสอบสถานะร้านค้า (ยกเว้น SuperAdmin)
    if (user.role !== 'SuperAdmin') {
      // 🌟 ใช้ user.stores เพราะเราตั้งชื่อ alias ไว้ด้านบน 🌟
      const store = user.stores 
      if (!store) {
        Swal.fire({ icon: 'error', title: 'บัญชีนี้ไม่ได้เชื่อมโยงกับร้านค้า' })
        isLoggingIn.value = false
        return
      }

      const expiresAt = new Date(store.expires_at)
      if (!store.is_active || expiresAt < new Date()) {
        Swal.fire({
          icon: 'warning',
          title: 'แพ็กเกจหมดอายุ / ถูกระงับ',
          html: '<p class="text-sm font-bold text-gray-600 mt-2">ระบบของคุณหมดอายุหรือถูกระงับการใช้งาน<br>กรุณาติดต่อ <b>คุณสุวรรณ (Suwonp)</b></p>',
          confirmButtonText: 'รับทราบ',
          confirmButtonColor: '#f97316'
        })
        isLoggingIn.value = false
        return
      }
    }

    localStorage.setItem('rmpro_user', JSON.stringify(user))
    Swal.fire({ icon: 'success', title: `ยินดีต้อนรับ ${user.username}`, toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 })
    
    if(user.role === 'SuperAdmin') router.push('/superadmin')
    else router.push('/dashboard') 

  } catch (err) {
    console.error("Login Error:", err)
    Swal.fire({ icon: 'error', title: 'ไม่สามารถเชื่อมต่อระบบได้' })
  } finally {
    isLoggingIn.value = false
  }
}
</script>