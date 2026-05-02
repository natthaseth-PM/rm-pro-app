<template>
  <div class="h-full flex flex-col bg-gray-900 text-white overflow-hidden">
    <header class="bg-gray-800 px-6 py-4 flex justify-between items-center shrink-0 border-b border-gray-700 shadow-md">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-red-500/30">
          <i class="fa-solid fa-fire-burner"></i>
        </div>
        <div>
          <h1 class="text-2xl font-black tracking-wide">Kitchen Display System</h1>
          <p class="text-xs text-gray-400 font-bold"><i class="fa-solid fa-circle text-green-500 text-[8px] animate-pulse mr-1"></i> ระบบเชื่อมต่อ Real-time ทำงานปกติ</p>
        </div>
      </div>
      <div class="flex gap-2 bg-gray-700 p-1.5 rounded-xl">
        <button @click="filter = 'All'" :class="filter === 'All' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-white'" class="px-4 py-2 rounded-lg font-bold text-sm transition-all">ทั้งหมด</button>
        <button @click="filter = 'Pending'" :class="filter === 'Pending' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'" class="px-4 py-2 rounded-lg font-bold text-sm transition-all">รอดำเนินการ</button>
        <button @click="filter = 'Cooking'" :class="filter === 'Cooking' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'" class="px-4 py-2 rounded-lg font-bold text-sm transition-all">กำลังปรุง</button>
      </div>
    </header>

    <main class="flex-1 overflow-x-auto overflow-y-hidden p-6 no-scrollbar">
      <div v-if="isLoading" class="h-full flex flex-col items-center justify-center text-gray-500">
        <i class="fa-solid fa-circle-notch fa-spin text-5xl mb-4"></i>
        <p class="font-bold text-xl">กำลังโหลดรายการอาหาร...</p>
      </div>

      <div v-else-if="groupedOrders.length === 0" class="h-full flex flex-col items-center justify-center text-gray-600">
        <i class="fa-solid fa-check-double text-6xl mb-4"></i>
        <h2 class="text-3xl font-black">ไม่มีออเดอร์ค้าง</h2>
        <p class="font-medium mt-2">ยอดเยี่ยมมาก! ห้องครัวเคลียร์ออเดอร์หมดแล้ว</p>
      </div>

      <div v-else class="flex gap-6 h-full items-start">
        <div v-for="order in groupedOrders" :key="order.order_id" class="w-80 shrink-0 bg-gray-800 rounded-2xl flex flex-col max-h-full border border-gray-700 shadow-xl overflow-hidden animate-[fadeIn_0.3s_ease-out]">
          
          <div class="p-4 bg-gray-700 flex justify-between items-center border-b border-gray-600">
            <div>
              <h3 class="font-black text-xl text-white">{{ order.table_name }}</h3>
              <p class="text-xs text-gray-400 font-bold mt-0.5"><i class="fa-regular fa-clock mr-1"></i> {{ formatTime(order.created_at) }}</p>
            </div>
            <div class="text-center bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-600">
              <span class="text-xs text-gray-400 block font-bold leading-none mb-1">จำนวน</span>
              <span class="font-black text-lg text-white leading-none">{{ order.items.length }}</span>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
            <div v-for="item in order.items" :key="item.id" class="bg-gray-900 p-4 rounded-xl border border-gray-700 relative overflow-hidden group transition-all">
              <div class="absolute left-0 top-0 bottom-0 w-1.5" :class="item.kitchen_status === 'Pending' ? 'bg-orange-500' : 'bg-blue-500'"></div>
              
              <div class="flex justify-between items-start mb-3 pl-2">
                <h4 class="font-bold text-lg leading-tight pr-2">{{ item.menu_name }}</h4>
                <div class="font-black text-xl bg-gray-800 w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 border border-gray-700 shadow-inner">
                  x{{ item.quantity }}
                </div>
              </div>

              <div class="flex gap-2 pl-2">
                <button v-if="item.kitchen_status === 'Pending'" @click="updateStatus(item.id, 'Cooking')" class="flex-1 bg-blue-600/20 text-blue-400 border border-blue-600/50 hover:bg-blue-500 hover:text-white py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95">
                  <i class="fa-solid fa-fire mr-1"></i> เริ่มทำ
                </button>
                <button v-if="item.kitchen_status === 'Cooking'" @click="updateStatus(item.id, 'Served')" class="flex-1 bg-green-600/20 text-green-400 border border-green-600/50 hover:bg-green-500 hover:text-white py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95">
                  <i class="fa-solid fa-bell-concierge mr-1"></i> เสิร์ฟแล้ว
                </button>
                <button @click="cancelItem(item.id)" class="w-10 bg-gray-800 text-gray-500 hover:text-red-500 hover:bg-red-500/20 py-2.5 rounded-lg font-bold transition-all shrink-0">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="p-3 bg-gray-800 border-t border-gray-700 mt-auto">
            <button @click="serveAll(order.items)" class="w-full bg-gray-700 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
               <i class="fa-solid fa-check-double"></i> เสิร์ฟทั้งโต๊ะ
            </button>
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

const rawOrders = ref([])
const tables = ref([])
const filter = ref('All')
const isLoading = ref(true)
let realtimeChannel = null

// 📡 ดึงข้อมูลเริ่มต้น
const fetchKitchenData = async () => {
  // ดึงโต๊ะมาทำ Map ชื่อโต๊ะ
  const { data: tablesData } = await supabase.from('tables').select('id, table_name')
  tables.value = tablesData || []

  // ดึง Order Details ที่ยังไม่เสร็จ (Pending, Cooking) และเชื่อมหา Order ID
  const { data: detailsData } = await supabase
    .from('order_details')
    .select(`*, orders (table_id)`)
    .in('kitchen_status', ['Pending', 'Cooking'])
    .order('created_at', { ascending: true })

  rawOrders.value = detailsData || []
  isLoading.value = false
}

// 📦 จัดกลุ่มออเดอร์ตามบิลและเรียงคิว
const groupedOrders = computed(() => {
  let list = rawOrders.value
  
  if (filter.value !== 'All') {
    list = list.filter(item => item.kitchen_status === filter.value)
  }

  const group = {}
  list.forEach(item => {
    if (!group[item.order_id]) {
      const tId = item.orders?.table_id
      const tableObj = tables.value.find(t => t.id === tId)
      group[item.order_id] = {
        order_id: item.order_id,
        table_name: tableObj ? tableObj.table_name : 'ไม่ระบุโต๊ะ',
        created_at: item.created_at,
        items: []
      }
    }
    group[item.order_id].items.push(item)
  })

  return Object.values(group).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
})

// 🔧 ฟังก์ชันอัปเดตสถานะ
const updateStatus = async (id, newStatus) => {
  const { error } = await supabase.from('order_details').update({ kitchen_status: newStatus }).eq('id', id)
  if (error) {
    Swal.fire({ icon: 'error', title: 'อัปเดตล้มเหลว', toast: true, position: 'top', timer: 2000 })
  } else {
    // อัปเดตใน UI ทันทีไม่ต้องรอ Realtime เพื่อความลื่นไหล
    const idx = rawOrders.value.findIndex(o => o.id === id)
    if (idx > -1) {
       if (newStatus === 'Served' || newStatus === 'Cancelled') {
           rawOrders.value.splice(idx, 1)
       } else {
           rawOrders.value[idx].kitchen_status = newStatus
       }
    }
  }
}

const serveAll = async (items) => {
  const ids = items.map(i => i.id)
  await supabase.from('order_details').update({ kitchen_status: 'Served' }).in('id', ids)
  rawOrders.value = rawOrders.value.filter(o => !ids.includes(o.id))
  Swal.fire({ icon: 'success', title: 'เสิร์ฟเรียบร้อย', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 })
}

const cancelItem = async (id) => {
  const result = await Swal.fire({ title: 'ยกเลิกรายการนี้?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' })
  if (result.isConfirmed) updateStatus(id, 'Cancelled')
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const d = new Date(timeStr)
  return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

// ⚡ เปิดระบบ Real-time (รอรับออเดอร์แบบเด้งสดๆ)
const setupRealtime = () => {
  realtimeChannel = supabase
    .channel('kitchen_updates')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'order_details' }, payload => {
       // ถ้ามีการเปลี่ยนแปลงใน Database ให้โหลดข้อมูลใหม่ทันที
       fetchKitchenData()
    })
    .subscribe()
}

onMounted(() => {
  fetchKitchenData()
  setupRealtime()
})

onUnmounted(() => {
  // ปิดการรับข้อมูลเมื่อเปลี่ยนหน้า
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})
</script>