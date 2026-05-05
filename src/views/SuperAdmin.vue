<template>
  <div class="h-full flex flex-col bg-gray-50 font-sans text-gray-800">
    <header class="bg-[#0f172a] text-white px-8 py-6 flex justify-between items-center shrink-0 shadow-md z-10">
      <div>
        <h1 class="text-2xl font-black flex items-center gap-3"><i class="fa-solid fa-chess-king text-yellow-500"></i> Super Admin Dashboard</h1>
        <p class="text-gray-400 text-sm font-bold mt-1">ระบบบริหารจัดการร้านค้าเช่า (Tenants Management)</p>
      </div>
      <button @click="openStoreModal('add')" class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95"><i class="fa-solid fa-plus mr-2"></i> เปิดร้านค้าใหม่</button>
    </header>

    <main class="flex-1 overflow-y-auto p-6 md:p-8">
      <div class="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-gray-100 text-gray-600 text-[11px] uppercase tracking-widest border-b border-gray-200">
            <tr><th class="p-4 font-bold">ชื่อร้านค้า / ข้อมูลติดต่อ</th><th class="p-4 font-bold text-center">แพ็กเกจ</th><th class="p-4 font-bold text-center">วันหมดอายุ</th><th class="p-4 font-bold text-center">สถานะ</th><th class="p-4 font-bold text-center">จัดการร้าน</th><th class="p-4 font-bold text-center">พนักงาน</th></tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="isLoading" class="text-center py-10"><td colspan="6"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-gray-400 my-8"></i></td></tr>
            <tr v-else-if="stores.length === 0" class="text-center py-10"><td colspan="6" class="text-gray-400 font-bold my-8">ยังไม่มีร้านค้าในระบบ</td></tr>
            <tr v-for="store in stores" :key="store.id" class="hover:bg-gray-50 transition-colors">
              <td class="p-4">
                <div class="font-black text-gray-900 text-lg">{{ store.store_name }}</div>
                <div class="text-xs font-bold text-gray-500 mt-1"><i class="fa-solid fa-user text-gray-300 mr-1"></i> {{ store.contact_name || '-' }}</div>
                <div class="text-[10px] font-mono text-gray-400 mt-1 bg-gray-100 px-2 py-0.5 rounded w-fit border border-gray-200">ID: {{ store.id }}</div>
              </td>
              <td class="p-4 text-center"><span :class="store.package_type === 'Pro' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-600 border-gray-200'" class="px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider">{{ store.package_type }}</span></td>
              <td class="p-4 text-center">
                <div class="font-bold text-gray-800 text-sm">{{ formatDate(store.expires_at) }}</div>
                <div v-if="getDaysLeft(store.expires_at) <= 30 && getDaysLeft(store.expires_at) > 0" class="text-[10px] font-black text-orange-500 mt-1">เหลือ {{ getDaysLeft(store.expires_at) }} วัน</div>
                <div v-else-if="getDaysLeft(store.expires_at) <= 0" class="text-[10px] font-black text-red-500 mt-1">หมดอายุแล้ว</div>
              </td>
              <td class="p-4 text-center">
                <span v-if="store.is_active" class="text-green-500 font-black text-[11px] uppercase tracking-wider"><i class="fa-solid fa-circle-check"></i> Active</span>
                <span v-else class="text-red-500 font-black text-[11px] uppercase tracking-wider"><i class="fa-solid fa-ban"></i> Suspended</span>
              </td>
              <td class="p-4 text-center">
                <button @click="openStoreModal('edit', store)" class="w-10 h-10 bg-white border border-gray-200 hover:bg-blue-500 hover:border-blue-500 hover:text-blue-600 rounded-xl text-gray-500 transition-colors shadow-sm"><i class="fa-solid fa-pen"></i></button>
              </td>
              <td class="p-4 text-center">
                <button @click="openStoreUsers(store)" class="px-4 py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-sm"><i class="fa-solid fa-users mr-1"></i> พนักงาน</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <div v-if="showModal" class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8 animate-[fadeIn_0.2s_ease-out]">
        <h2 class="text-2xl font-black mb-6 flex items-center"><div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mr-3 text-lg"><i class="fa-solid fa-store"></i></div>{{ form.action === 'add' ? 'เปิดร้านค้าใหม่' : 'แก้ไขข้อมูลร้านค้า' }}</h2>
        <form @submit.prevent="submitStore" class="space-y-4">
          <div><label class="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-widest">ชื่อร้าน</label><input v-model="form.store_name" type="text" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white font-bold transition-all"></div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-widest">แพ็กเกจ</label><select v-model="form.package_type" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none font-bold cursor-pointer transition-all"><option value="Standard">Standard</option><option value="Pro">Pro</option></select></div>
            <div><label class="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-widest">สถานะระบบ</label><select v-model="form.is_active" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none font-bold cursor-pointer transition-all"><option :value="true">Active (เปิดใช้งาน)</option><option :value="false">Suspended (ระงับ)</option></select></div>
          </div>
          <div><label class="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-widest">วันหมดอายุ</label><input v-model="form.expires_at" type="date" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none font-bold cursor-pointer transition-all"></div>
          <div class="border-t border-gray-100 pt-4 mt-4">
            <h4 class="text-sm font-black mb-3 text-gray-700">ข้อมูลผู้ติดต่อ (Owner)</h4>
            <div class="space-y-3">
              <input v-model="form.contact_name" type="text" placeholder="ชื่อผู้ติดต่อ" class="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold text-sm shadow-inner">
              <input v-model="form.contact_phone" type="text" placeholder="เบอร์โทรศัพท์" class="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold text-sm shadow-inner">
            </div>
          </div>
          <div class="flex gap-3 pt-4"><button type="button" @click="showModal = false" class="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">ยกเลิก</button><button type="submit" :disabled="isSubmitting" class="flex-1 py-3 bg-blue-600 disabled:bg-blue-300 text-white rounded-xl font-black shadow-lg hover:bg-blue-700 transition-colors"><i v-if="isSubmitting" class="fa-solid fa-circle-notch fa-spin mr-2"></i> บันทึกข้อมูล</button></div>
        </form>
      </div>
    </div>

    <div v-if="showUsersModal" class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 class="text-xl font-black text-gray-800">พนักงานร้าน: <span class="text-blue-600">{{ selectedStoreForUsers?.store_name }}</span></h2>
            <p class="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Store ID: {{ selectedStoreForUsers?.id }}</p>
          </div>
          <button @click="showUsersModal = false" class="w-10 h-10 bg-white border border-gray-200 text-gray-500 hover:text-red-500 rounded-full transition-colors shadow-sm flex items-center justify-center"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div v-if="userView === 'list'" class="flex-1 overflow-y-auto p-6">
          <div class="flex justify-end mb-4"><button @click="openStoreUserForm('add')" class="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"><i class="fa-solid fa-user-plus mr-2"></i> สร้างบัญชีพนักงาน</button></div>
          <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table class="w-full text-left border-collapse">
              <thead><tr class="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-widest"><th class="p-4 font-bold">Username</th><th class="p-4 font-bold text-center">ตำแหน่ง</th><th class="p-4 font-bold">จัดการ</th></tr></thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="storeUsers.length === 0"><td colspan="3" class="text-center py-10 text-gray-400 font-bold">ยังไม่มีพนักงาน</td></tr>
                <tr v-for="u in storeUsers" :key="u.id" class="hover:bg-gray-50 text-sm">
                  <td class="p-4 font-black text-gray-800"><i class="fa-solid fa-circle-user text-gray-300 mr-2"></i>{{ u.username }}</td>
                  <td class="p-4 text-center"><span class="bg-gray-100 border border-gray-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{{ u.role }}</span></td>
                  <td class="p-4 text-center space-x-2">
                    <button @click="openStoreUserForm('edit', u)" class="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition-colors"><i class="fa-solid fa-pen"></i></button>
                    <button @click="deleteStoreUser(u.id)" class="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors"><i class="fa-solid fa-trash"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else class="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div class="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
            <h3 class="text-xl font-black mb-6 flex items-center"><div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mr-3 text-sm"><i class="fa-solid fa-user-shield"></i></div>{{ userForm.action === 'add' ? 'เพิ่มบัญชีใหม่' : 'แก้ไขบัญชี' }}</h3>
            <form @submit.prevent="submitStoreUser" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div><label class="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-widest">Username</label><input v-model="userForm.username" type="text" required :disabled="userForm.action === 'edit'" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:bg-white font-bold transition-all disabled:opacity-60"></div>
                <div><label class="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-widest">Password</label><input v-model="userForm.password" type="text" :required="userForm.action === 'add'" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:bg-white font-bold transition-all" :placeholder="userForm.action === 'edit' ? 'เว้นว่างถ้าไม่เปลี่ยน' : 'รหัสผ่านใหม่'"></div>
              </div>
              <div><label class="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-widest">ตำแหน่ง (Role)</label><input v-model="userForm.role" type="text" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none font-bold"></div>
              
              <div class="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                <label class="block text-sm font-black text-blue-800 mb-4 tracking-tight"><i class="fa-solid fa-lock-open mr-2"></i> สิทธิ์การเข้าถึงเมนู</label>
                <div class="grid grid-cols-2 gap-3 text-xs font-bold text-blue-900">
                  <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"><input type="checkbox" v-model="userForm.allowed_pages" value="dashboard" class="w-4 h-4 accent-blue-600"> Dashboard</label>
                  <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"><input type="checkbox" v-model="userForm.allowed_pages" value="pos" class="w-4 h-4 accent-blue-600"> ระบบ POS</label>
                  <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"><input type="checkbox" v-model="userForm.allowed_pages" value="tables" class="w-4 h-4 accent-blue-600"> ผังโต๊ะรวม</label>
                  <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"><input type="checkbox" v-model="userForm.allowed_pages" value="kitchen" class="w-4 h-4 accent-blue-600"> ห้องครัว (KDS)</label>
                  <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"><input type="checkbox" v-model="userForm.allowed_pages" value="history" class="w-4 h-4 accent-blue-600"> ประวัติบิล</label>
                  <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"><input type="checkbox" v-model="userForm.allowed_pages" value="reports" class="w-4 h-4 accent-blue-600"> รายงานยอดขาย</label>
                  <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"><input type="checkbox" v-model="userForm.allowed_pages" value="settings" class="w-4 h-4 accent-blue-600"> ตั้งค่าระบบ</label>
                </div>
              </div>

              <div class="flex gap-3 pt-4 border-t border-gray-100"><button type="button" @click="userView = 'list'" class="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">ยกเลิก</button><button type="submit" :disabled="isSubmittingUser" class="flex-1 py-3 bg-gray-900 disabled:bg-gray-400 text-white font-black rounded-xl shadow-lg active:scale-95 transition-all"><i v-if="isSubmittingUser" class="fa-solid fa-circle-notch fa-spin mr-2"></i> บันทึกบัญชี</button></div>
            </form>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import Swal from 'sweetalert2'

// 🔐 ฟังก์ชันเข้ารหัสผ่าน 
const hashPassword = async (password) => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const stores = ref([])
const isLoading = ref(true)
const isSubmitting = ref(false)
const showModal = ref(false)
const form = ref({})

// จัดการ Users ของร้าน
const showUsersModal = ref(false)
const selectedStoreForUsers = ref(null)
const storeUsers = ref([])
const userView = ref('list') 
const userForm = ref({})
const isSubmittingUser = ref(false)

const loadStores = async () => {
  isLoading.value = true
  const { data, error } = await supabase.from('stores').select('*').order('created_at', { ascending: false })
  if (error) {
    Swal.fire('Error', 'ดึงข้อมูลไม่สำเร็จ', 'error')
  } else {
    stores.value = data
  }
  isLoading.value = false
}

const formatDate = (date) => new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
const getDaysLeft = (date) => Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))

const openStoreModal = (action, store = null) => {
  if(action === 'add') {
    let next15Days = new Date(); next15Days.setDate(next15Days.getDate() + 15);
    form.value = { store_name: '', package_type: 'Standard', is_active: true, expires_at: next15Days.toISOString().split('T')[0], contact_name: '', contact_phone: '', action: 'add' }
  } else {
    form.value = { ...store, expires_at: new Date(store.expires_at).toISOString().split('T')[0], action: 'edit' }
  }
  showModal.value = true
}

const submitStore = async () => {
  isSubmitting.value = true
  try {
    const expiryDate = new Date(form.value.expires_at)
    expiryDate.setHours(23, 59, 59, 999)

    const payload = { 
      store_name: form.value.store_name, 
      package_type: form.value.package_type, 
      is_active: form.value.is_active, 
      subscription_status: form.value.is_active ? (expiryDate < new Date() ? 'Expired' : 'Active') : 'Suspended',
      expires_at: expiryDate.toISOString(), 
      contact_name: form.value.contact_name || '', 
      contact_phone: form.value.contact_phone || ''
    }
    
    let response;
    if (form.value.action === 'add') {
      payload.id = crypto.randomUUID() 
      response = await supabase.from('stores').insert([payload])
    } else {
      // 🌟 บังคับตรวจสอบว่า id ต้องไม่ใช่ค่าว่าง 🌟
      if (!form.value.id) throw new Error("ID ร้านค้าไม่ถูกต้อง")
      response = await supabase.from('stores').update(payload).eq('id', form.value.id)
    }

    if (response.error) throw response.error

    showModal.value = false
    Swal.fire({ icon: 'success', title: 'บันทึกข้อมูลร้านค้าสำเร็จ', timer: 1500, showConfirmButton: false })
    loadStores()
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'บันทึกไม่สำเร็จ', text: err.message })
  } finally {
    isSubmitting.value = false
  }
}

// --- ระบบพนักงานร้าน (Store Users) ---
const openStoreUsers = async (store) => {
  // 🌟 บังคับตรวจสอบว่ามี ID ร้านค้าที่ส่งมา 🌟
  if (!store || !store.id) {
    Swal.fire('Error', 'ไม่พบรหัสร้านค้า', 'error')
    return
  }
  selectedStoreForUsers.value = store
  showUsersModal.value = true
  userView.value = 'list'
  loadStoreUsers()
}

const loadStoreUsers = async () => {
  if (!selectedStoreForUsers.value?.id) return
  const { data } = await supabase.from('users').select('*').eq('store_id', selectedStoreForUsers.value.id).order('id')
  if (data) storeUsers.value = data
}

const openStoreUserForm = (action, user = null) => {
  if (action === 'add') {
    userForm.value = { username: '', password: '', role: 'Admin', allowed_pages: ['dashboard','pos','tables','kitchen','history','reports','settings'], action: 'add' }
  } else {
    userForm.value = { ...user, password: '', allowed_pages: user.allowed_pages ? user.allowed_pages.split(',') : [], action: 'edit' }
  }
  userView.value = action
}

const submitStoreUser = async () => {
  isSubmittingUser.value = true
  try {
    // 🌟 บังคับตรวจสอบรหัสร้านค้า 🌟
    if (!selectedStoreForUsers.value?.id) throw new Error("ไม่พบรหัสร้านค้า")

    const payload = { 
      store_id: selectedStoreForUsers.value.id, 
      username: userForm.value.username, 
      role: userForm.value.role, 
      allowed_pages: userForm.value.allowed_pages.join(',') 
    }
    
    if (userForm.value.password) {
      payload.password = await hashPassword(userForm.value.password)
    }

    let response;
    if (userForm.value.action === 'add') {
      response = await supabase.from('users').insert([payload])
    } else {
      if (!userForm.value.id) throw new Error("รหัสพนักงานไม่ถูกต้อง")
      response = await supabase.from('users').update(payload).eq('id', userForm.value.id)
    }

    if (response.error) throw response.error

    userView.value = 'list'
    Swal.fire({ icon: 'success', title: 'บันทึกบัญชีสำเร็จ', timer: 1500, showConfirmButton: false })
    loadStoreUsers()
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'บันทึกบัญชีไม่สำเร็จ', text: err.message })
  } finally {
    isSubmittingUser.value = false
  }
}

const deleteStoreUser = async (userId) => {
  const res = await Swal.fire({ title: 'ลบผู้ใช้นี้?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' })
  if (res.isConfirmed) {
    await supabase.from('users').delete().eq('id', userId)
    loadStoreUsers()
  }
}

onMounted(() => loadStores())
</script>