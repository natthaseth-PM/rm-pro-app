<template>
  <div class="h-screen w-full bg-[#0f172a] text-gray-100 flex flex-col font-sans overflow-hidden">
    <header class="bg-[#1e293b] px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 border-b border-gray-800 shadow-md gap-4">
      <div class="flex items-center gap-4"><div class="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-red-500/20 text-white"><i class="fa-solid fa-fire-burner"></i></div><div><h1 class="text-2xl md:text-3xl font-black tracking-wide text-white">KDS (Kitchen Display)</h1><p class="text-xs text-gray-400 font-bold mt-1"><i class="fa-solid fa-circle text-green-500 text-[8px] animate-pulse mr-1"></i> เชื่อมต่อออเดอร์เรียลไทม์ พร้อมเสียงแจ้งเตือน</p></div></div>
      <div class="flex bg-gray-900 p-1.5 rounded-2xl w-full md:w-auto">
        <button @click="station = 'Kitchen'" :class="station === 'Kitchen' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-400 hover:text-white'" class="flex-1 md:flex-none px-6 py-3 rounded-xl font-black md:text-lg transition-all flex items-center justify-center gap-2"><i class="fa-solid fa-fire"></i> โซนอาหาร</button>
        <button @click="station = 'Bar'" :class="station === 'Bar' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'" class="flex-1 md:flex-none px-6 py-3 rounded-xl font-black md:text-lg transition-all flex items-center justify-center gap-2"><i class="fa-solid fa-martini-glass-citrus"></i> บาร์น้ำ</button>
      </div>
    </header>

    <main class="flex-1 overflow-x-auto overflow-y-hidden p-6 flex gap-6 no-scrollbar bg-[#0f172a]">
      <div class="w-[380px] shrink-0 flex flex-col bg-[#1e293b] rounded-[2rem] border border-gray-800 max-h-full shadow-2xl relative overflow-hidden">
        <div class="bg-gradient-to-r from-red-500/20 to-transparent border-b border-red-500/20 p-5 flex justify-between items-center"><h2 class="text-red-400 font-black text-xl flex items-center"><i class="fa-solid fa-bell text-red-500 mr-3 animate-ring text-2xl"></i> รอทำ (New)</h2><span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-black shadow-lg shadow-red-500/30">{{ pendingItems.length }}</span></div>
        <div class="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          <div v-if="pendingItems.length === 0" class="text-center text-gray-600 font-bold py-10 mt-10"><i class="fa-solid fa-mug-hot text-6xl block mb-4 opacity-50"></i>ไม่มีออเดอร์ใหม่</div>
          <div v-for="item in pendingItems" :key="item.id" class="bg-[#2a374a] rounded-2xl border border-gray-700 p-5 relative overflow-hidden shadow-lg animate-[fadeIn_0.3s_ease-out]">
            <div class="absolute left-0 top-0 bottom-0 w-2 bg-red-500"></div>
            <div class="flex justify-between items-start mb-4 pl-2"><div><h3 class="font-black text-xl text-white leading-tight mb-1">{{ item.menu_name }}</h3><span class="inline-flex items-center text-xs font-black text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-md border border-orange-500/20 uppercase tracking-widest mb-1"><i class="fa-solid fa-map-pin mr-1"></i> โต๊ะ: {{ getTableName(item.order_id) }}</span><div class="flex items-center gap-1 mt-1"><span :class="getWaitTimeClass(item.created_at)" class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm"><i class="fa-regular fa-clock mr-1"></i> รอมา {{ getWaitTime(item.created_at) }}</span></div></div><div class="bg-red-500/20 text-red-400 font-black text-2xl w-14 h-14 rounded-2xl flex items-center justify-center border border-red-500/30 shadow-inner shrink-0">x{{ item.quantity }}</div></div>
            <div class="flex gap-2 pl-2"><button @click="updateStatus(item.id, 'Cooking')" class="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black transition-all active:scale-95 text-lg shadow-lg shadow-blue-500/30"><i class="fa-solid fa-fire-burner mr-2"></i> เริ่มทำ</button><button @click="cancelItem(item.id)" class="w-14 bg-gray-700 hover:bg-red-600 text-gray-400 hover:text-white rounded-xl font-black transition-all text-xl"><i class="fa-solid fa-xmark"></i></button></div>
          </div>
        </div>
      </div>

      <div class="w-[380px] shrink-0 flex flex-col bg-[#1e293b] rounded-[2rem] border border-gray-800 max-h-full shadow-2xl relative overflow-hidden">
        <div class="bg-gradient-to-r from-blue-500/20 to-transparent border-b border-blue-500/20 p-5 flex justify-between items-center"><h2 class="text-blue-400 font-black text-xl flex items-center"><i class="fa-solid fa-fire text-blue-500 mr-3 text-2xl"></i> กำลังปรุง (Cooking)</h2><span class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-black shadow-lg shadow-blue-500/30">{{ cookingItems.length }}</span></div>
        <div class="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          <div v-if="cookingItems.length === 0" class="text-center text-gray-600 font-bold py-10 mt-10"><i class="fa-solid fa-fire-burner text-6xl block mb-4 opacity-50"></i>ยังไม่มีรายการที่กำลังทำ</div>
          <div v-for="item in cookingItems" :key="item.id" class="bg-[#2a374a] rounded-2xl border border-blue-500/30 p-5 relative overflow-hidden shadow-lg shadow-blue-900/20 animate-[fadeIn_0.3s_ease-out]">
            <div class="absolute left-0 top-0 bottom-0 w-2 bg-blue-500"></div>
            <div class="flex justify-between items-start mb-4 pl-2"><div><h3 class="font-black text-xl text-white leading-tight mb-1">{{ item.menu_name }}</h3><span class="inline-flex items-center text-xs font-black text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-md border border-orange-500/20 uppercase tracking-widest mb-1"><i class="fa-solid fa-map-pin mr-1"></i> โต๊ะ: {{ getTableName(item.order_id) }}</span><div class="flex items-center gap-1 mt-1"><span :class="getWaitTimeClass(item.created_at)" class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm"><i class="fa-solid fa-stopwatch mr-1"></i> ทำมาแล้ว {{ getWaitTime(item.created_at) }}</span></div></div><div class="bg-blue-500/20 text-blue-400 font-black text-2xl w-14 h-14 rounded-2xl flex items-center justify-center border border-blue-500/30 shadow-inner shrink-0">x{{ item.quantity }}</div></div>
            <div class="pl-2"><button @click="updateStatus(item.id, 'Served')" class="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-5 rounded-xl font-black transition-all active:scale-95 text-xl shadow-lg shadow-emerald-500/30"><i class="fa-solid fa-bell-concierge mr-2"></i> เสิร์ฟแล้ว</button></div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '../supabase'
import Swal from 'sweetalert2'

const myStoreId = ref(null) // 🌟 เก็บ ID ร้านค้า
const station = ref('Kitchen') 
const rawDetails = ref([])
const tablesMap = ref({})
let realtimeChannel = null
const now = ref(new Date())
let timerInterval = null

const alertSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

const fetchKitchenData = async () => {
  if(!myStoreId.value) return;

  // 🌟 ดึงข้อมูลเฉพาะร้านเรา
  const { data: tData } = await supabase.from('tables').select('id, table_name').eq('store_id', myStoreId.value)
  if (tData) {
    tablesMap.value = tData.reduce((acc, curr) => {
      acc[curr.id] = curr.table_name
      return acc
    }, {})
  }

  // 🌟 ดึงออเดอร์เฉพาะร้านเรา
  const { data: detailsData } = await supabase
    .from('order_details')
    .select(`*, orders!inner(table_id), menus!inner(category)`)
    .eq('store_id', myStoreId.value)
    .in('kitchen_status', ['Pending', 'Cooking'])
    .order('created_at', { ascending: true })

  rawDetails.value = detailsData || []
}

const stationItems = computed(() => {
  if (station.value === 'Bar') return rawDetails.value.filter(item => item.menus?.category === 'เครื่องดื่ม')
  else return rawDetails.value.filter(item => item.menus?.category !== 'เครื่องดื่ม')
})
const pendingItems = computed(() => stationItems.value.filter(item => item.kitchen_status === 'Pending'))
const cookingItems = computed(() => stationItems.value.filter(item => item.kitchen_status === 'Cooking'))

const getTableName = (orderId) => {
  const item = rawDetails.value.find(i => i.order_id === orderId)
  return item && item.orders ? (tablesMap.value[item.orders.table_id] || 'ไม่ระบุ') : 'ไม่ระบุ'
}

const getWaitTime = (createdAt) => {
  const diffMins = Math.floor((now.value - new Date(createdAt)) / 60000)
  if (diffMins < 1) return 'เพิ่งสั่ง'
  if (diffMins >= 60) return `${Math.floor(diffMins/60)} ชม. ${diffMins%60} น.`
  return `${diffMins} นาที`
}

const getWaitTimeClass = (createdAt) => {
  const diffMins = Math.floor((now.value - new Date(createdAt)) / 60000)
  if (diffMins >= 15) return 'bg-red-500 text-white animate-pulse' 
  if (diffMins >= 10) return 'bg-orange-500 text-white' 
  return 'bg-green-600/30 text-green-400 border border-green-600/50' 
}

const updateStatus = async (id, newStatus) => {
  const { error } = await supabase.from('order_details').update({ kitchen_status: newStatus }).eq('id', id)
  if (!error) {
    const idx = rawDetails.value.findIndex(o => o.id === id)
    if (idx > -1) {
       if (newStatus === 'Served' || newStatus === 'Cancelled') rawDetails.value.splice(idx, 1)
       else rawDetails.value[idx].kitchen_status = newStatus
    }
  }
}

const cancelItem = async (id) => {
  const result = await Swal.fire({ title: 'ยกเลิกออเดอร์นี้?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' })
  if (result.isConfirmed) updateStatus(id, 'Cancelled')
}

const playAudioAlert = () => {
  try {
    alertSound.currentTime = 0;
    const playPromise = alertSound.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => { console.log('Autoplay blocked:', error); });
    }
  } catch (err) {}
}

const setupRealtime = () => {
  // 🌟 แยกร้านใน Real-time Channel ด้วย!
  realtimeChannel = supabase.channel(`kitchen_kds_${myStoreId.value}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_details', filter: `store_id=eq.${myStoreId.value}` }, (payload) => {
       playAudioAlert() 
       fetchKitchenData()
       Swal.fire({ title: '🔔 ออเดอร์ใหม่เข้า!', text: payload.new.menu_name, toast: true, position: 'top-end', timer: 4000, showConfirmButton: false, background: '#ef4444', color: '#fff' })
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'order_details', filter: `store_id=eq.${myStoreId.value}` }, () => fetchKitchenData())
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'order_details', filter: `store_id=eq.${myStoreId.value}` }, () => fetchKitchenData())
    .subscribe()
}

onMounted(() => { 
  const savedUser = JSON.parse(localStorage.getItem('rmpro_user'))
  if(savedUser && savedUser.store_id) {
    myStoreId.value = savedUser.store_id
    fetchKitchenData()
    setupRealtime()
    timerInterval = setInterval(() => { now.value = new Date() }, 30000)
    
    Swal.fire({ title: 'KDS พร้อมใช้งาน', text: 'คลิกที่ปุ่ม "ตกลง" เพื่อเปิดระบบเสียงแจ้งเตือนออเดอร์', icon: 'success', confirmButtonText: 'ตกลง', confirmButtonColor: '#10b981', allowOutsideClick: false }).then(() => {
      alertSound.volume = 0;
      alertSound.play().then(() => { alertSound.pause(); alertSound.currentTime = 0; alertSound.volume = 1; }).catch(e => console.log('Silent play blocked', e));
    });
  }
})

onUnmounted(() => { 
  if (realtimeChannel) supabase.removeChannel(realtimeChannel) 
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
@keyframes ring { 0%, 50%, 100% { transform: rotate(0); } 10% { transform: rotate(15deg); } 20% { transform: rotate(-10deg); } 30% { transform: rotate(5deg); } 40% { transform: rotate(-5deg); } }
.animate-ring { animation: ring 1s ease-in-out infinite; }
</style>