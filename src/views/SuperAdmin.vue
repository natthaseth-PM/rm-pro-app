<template>
  <div class="h-full flex flex-col bg-gray-50 font-sans text-gray-800">
    <header class="bg-[#0f172a] text-white px-8 py-6 flex justify-between items-center shrink-0 shadow-md">
      <div>
        <h1 class="text-2xl font-black flex items-center gap-3"><i class="fa-solid fa-chess-king text-yellow-500"></i> Super Admin Dashboard</h1>
        <p class="text-gray-400 text-sm font-bold mt-1">ระบบบริหารจัดการร้านค้าเช่า (Tenants Management)</p>
      </div>
      <button @click="openStoreModal('add')" class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95"><i class="fa-solid fa-plus mr-2"></i> เปิดร้านค้าใหม่</button>
    </header>

    <main class="flex-1 overflow-y-auto p-8">
      <div class="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-gray-100 text-gray-600 text-xs uppercase tracking-widest border-b border-gray-200">
            <tr><th class="p-5 font-bold">ชื่อร้านค้า / ผู้ติดต่อ</th><th class="p-5 font-bold text-center">แพ็กเกจ</th><th class="p-5 font-bold text-center">วันหมดอายุ</th><th class="p-5 font-bold text-center">สถานะ</th><th class="p-5 font-bold text-center">จัดการ</th></tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="isLoading" class="text-center py-10"><td colspan="5"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-gray-400"></i></td></tr>
            <tr v-else-if="stores.length === 0" class="text-center py-10"><td colspan="5" class="text-gray-400 font-bold">ยังไม่มีร้านค้าในระบบ</td></tr>
            <tr v-for="store in stores" :key="store.id" class="hover:bg-gray-50 transition-colors">
              <td class="p-5">
                <div class="font-black text-gray-900 text-lg">{{ store.store_name }}</div>
                <div class="text-sm font-bold text-gray-500 mt-1"><i class="fa-solid fa-user mr-1"></i> {{ store.contact_name || '-' }} | <i class="fa-solid fa-phone mr-1"></i> {{ store.contact_phone || '-' }}</div>
              </td>
              <td class="p-5 text-center"><span :class="store.package_type === 'Pro' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-600 border-gray-200'" class="px-3 py-1 rounded-full text-xs font-black uppercase border tracking-wider">{{ store.package_type }}</span></td>
              <td class="p-5 text-center">
                <div class="font-bold text-gray-800">{{ formatDate(store.expires_at) }}</div>
                <div v-if="getDaysLeft(store.expires_at) <= 30 && getDaysLeft(store.expires_at) > 0" class="text-[10px] font-black text-orange-500 mt-1">เหลือ {{ getDaysLeft(store.expires_at) }} วัน</div>
                <div v-else-if="getDaysLeft(store.expires_at) <= 0" class="text-[10px] font-black text-red-500 mt-1">หมดอายุแล้ว</div>
              </td>
              <td class="p-5 text-center">
                <span v-if="store.is_active" class="text-green-500 font-black text-xs"><i class="fa-solid fa-circle-check"></i> Active</span>
                <span v-else class="text-red-500 font-black text-xs"><i class="fa-solid fa-ban"></i> Suspended</span>
              </td>
              <td class="p-5 text-center">
                <button @click="openStoreModal('edit', store)" class="w-10 h-10 bg-gray-100 hover:bg-blue-500 hover:text-white rounded-xl text-gray-600 transition-colors shadow-sm"><i class="fa-solid fa-pen"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <div v-if="showModal" class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-[fadeIn_0.2s_ease-out]">
        <h2 class="text-2xl font-black mb-6">{{ form.action === 'add' ? 'เปิดร้านค้าใหม่' : 'แก้ไขข้อมูลร้านค้า' }}</h2>
        <form @submit.prevent="submitStore" class="space-y-4">
          <div><label class="block text-xs font-bold text-gray-500 mb-1 uppercase">ชื่อร้าน</label><input v-model="form.store_name" type="text" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold"></div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="block text-xs font-bold text-gray-500 mb-1 uppercase">แพ็กเกจ</label><select v-model="form.package_type" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none font-bold"><option value="Standard">Standard</option><option value="Pro">Pro</option></select></div>
            <div><label class="block text-xs font-bold text-gray-500 mb-1 uppercase">สถานะระบบ</label><select v-model="form.is_active" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none font-bold"><option :value="true">Active (เปิดใช้งาน)</option><option :value="false">Suspended (ระงับ)</option></select></div>
          </div>
          <div><label class="block text-xs font-bold text-gray-500 mb-1 uppercase">วันหมดอายุ (Expiry Date)</label><input v-model="form.expires_at" type="date" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none font-bold"></div>
          <div class="border-t border-gray-100 pt-4 mt-4">
            <h4 class="text-sm font-black mb-3">ข้อมูลผู้ติดต่อ (Owner)</h4>
            <div class="space-y-3">
              <input v-model="form.contact_name" type="text" placeholder="ชื่อผู้ติดต่อ" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none font-bold text-sm">
              <input v-model="form.contact_phone" type="text" placeholder="เบอร์โทร" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none font-bold text-sm">
            </div>
          </div>
          <div class="flex gap-3 pt-4"><button type="button" @click="showModal = false" class="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">ยกเลิก</button><button type="submit" class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg hover:bg-blue-700 transition-colors"><i class="fa-solid fa-save mr-2"></i> บันทึก</button></div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import Swal from 'sweetalert2'

const stores = ref([])
const isLoading = ref(true)
const showModal = ref(false)
const form = ref({})

const loadStores = async () => {
  isLoading.value = true
  const { data } = await supabase.from('stores').select('*').order('created_at', { ascending: false })
  if (data) stores.value = data
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
  const payload = { store_name: form.value.store_name, package_type: form.value.package_type, is_active: form.value.is_active, expires_at: form.value.expires_at, contact_name: form.value.contact_name, contact_phone: form.value.contact_phone }
  if (form.value.action === 'add') await supabase.from('stores').insert([payload])
  else await supabase.from('stores').update(payload).eq('id', form.value.id)
  showModal.value = false
  Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', timer: 1500, showConfirmButton: false })
  loadStores()
}

onMounted(() => loadStores())
</script>