<template>
  <div class="h-screen w-full font-sans bg-gray-50 flex flex-col">
    <div class="flex-1 flex items-center justify-center relative bg-gray-900 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1934&auto=format&fit=crop');">
      <div class="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"></div>
      
      <div class="bg-white rounded-3xl shadow-2xl p-8 md:p-10 w-[90%] max-w-md relative z-10 animate-[fadeIn_0.5s_ease-out]">
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 mx-auto mb-4 text-white text-4xl"><i class="fa-solid fa-utensils"></i></div>
          <h1 class="text-3xl font-black text-gray-800">RM Pro</h1>
          <p class="text-gray-500 font-bold mt-1 text-sm tracking-wide">Enterprise SaaS POS System</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div><label class="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Username</label><input v-model="loginForm.username" type="text" required class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary outline-none transition-all font-bold"></div>
          <div><label class="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Password</label><input v-model="loginForm.password" type="password" required class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary outline-none transition-all font-bold"></div>
          <button type="submit" :disabled="isLoggingIn" class="w-full bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 mt-4 text-lg">
            <i v-if="isLoggingIn" class="fa-solid fa-circle-notch fa-spin"></i>
            {{ isLoggingIn ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ' }}
          </button>
        </form>
      </div>
    </div>
    <div class="bg-gray-900 py-3 text-center text-xs font-medium text-gray-400 shrink-0 z-20 border-t border-gray-800">
      &copy; 2026 Suwonp. All rights reserved. | SaaS Multi-tenant
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

// 🔐 ฟังก์ชันเข้ารหัส SHA-256 (Pure JS - ทำงานได้ทั้ง HTTP และ HTTPS)
const hashPassword = async (ascii) => {
  function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
  const mathPow = Math.pow; const maxWord = mathPow(2, 32); let result = '', words = [], asciiBitLength = ascii.length * 8;
  const hash = [], k = []; let primeCounter = 0, isPrime = [false]; let i = 2;
  while (primeCounter < 64) {
    if (!isPrime[i]) {
      for (let j = i << 1; j < 311; j += i) isPrime[j] = true;
      if (primeCounter < 8) hash[primeCounter] = (mathPow(i, 1 / 2) * maxWord) | 0;
      k[primeCounter] = (mathPow(i, 1 / 3) * maxWord) | 0; primeCounter++;
    }
    i++;
  }
  ascii += '\x80';
  while (ascii.length % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    const j = ascii.charCodeAt(i);
    if (j >> 8) return; words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words.length] = ((asciiBitLength / maxWord) | 0); words[words.length] = (asciiBitLength | 0);
  for (let j = 0; j < words.length; j += 16) {
    const w = words.slice(j, j + 16); let oldHash = hash.slice(0);
    for (i = 0; i < 64; i++) {
      if (i >= 16) {
        const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const s0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const s1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const t1 = hash[7] + s1 + ch + k[i] + w[i]; const t2 = s0 + maj;
      hash[7] = hash[6]; hash[6] = hash[5]; hash[5] = hash[4]; hash[4] = (hash[3] + t1) | 0;
      hash[3] = hash[2]; hash[2] = hash[1]; hash[1] = hash[0]; hash[0] = (t1 + t2) | 0;
    }
    for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  for (i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) return
  isLoggingIn.value = true

  try {
    const hashedPassword = await hashPassword(loginForm.value.password)
    
    // 🌟 select ข้อมูลแบบระบุความสัมพันธ์ผ่าน store_id ให้ชัดเจน
    let { data: user, error } = await supabase
      .from('users')
      .select('*, stores:store_id(*)') 
      .eq('username', loginForm.value.username)
      .eq('password', hashedPassword)
      .maybeSingle()

    // Auto-Migrate สำหรับข้อมูลเก่า
    if (!user && !error) {
      const { data: oldUser } = await supabase
        .from('users')
        .select('*, stores:store_id(*)')
        .eq('username', loginForm.value.username)
        .eq('password', loginForm.value.password)
        .maybeSingle()
      
      if (oldUser) {
        await supabase.from('users').update({ password: hashedPassword }).eq('id', oldUser.id)
        user = oldUser
      }
    }

    if (!user) {
      Swal.fire({ icon: 'error', title: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง!' })
      isLoggingIn.value = false; return
    }

    // ตรวจสอบสถานะร้านค้า (ยกเว้น SuperAdmin)
    if (user.role !== 'SuperAdmin') {
      const store = user.stores
      if (!store) {
        Swal.fire({ icon: 'error', title: 'บัญชีนี้ไม่มีร้านค้าผูกอยู่' }); isLoggingIn.value = false; return
      }
      const expiresAt = new Date(store.expires_at)
      if (!store.is_active || expiresAt < new Date()) {
        Swal.fire({ icon: 'warning', title: 'แพ็กเกจหมดอายุ / ถูกระงับ', text: 'กรุณาติดต่อ คุณสุวรรณ (Suwonp) เพื่อต่ออายุ' });
        isLoggingIn.value = false; return
      }
    }

    localStorage.setItem('rmpro_user', JSON.stringify(user))
    
    if (user.role === 'SuperAdmin') router.push('/superadmin')
    else router.push('/dashboard')

  } catch (err) {
    console.error("Login detail:", err)
    Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
  } finally {
    isLoggingIn.value = false
  }
}
</script>