<template>
  <div class="h-full flex flex-col bg-gray-100 overflow-hidden font-sans text-gray-800">
    
    <header class="bg-white px-8 py-5 flex justify-between items-center shrink-0 border-b border-gray-200 shadow-sm z-10">
      <div>
        <h1 class="text-2xl font-black flex items-center gap-3 text-gray-800">
          <span class="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-xl shadow-inner">
            <i class="fa-solid fa-fire-burner"></i>
          </span>
          ระบบห้องครัว (Kitchen Display)
        </h1>
        <p class="text-gray-500 font-bold text-sm ml-[3.5rem] mt-1">จัดการออเดอร์และสถานะอาหารแบบ Real-time</p>
      </div>
      <div class="flex gap-3">
        <div class="bg-red-50 border border-red-100 px-5 py-2 rounded-xl text-center shadow-sm">
          <span class="text-red-500 font-bold text-[10px] uppercase block leading-none mb-1 tracking-widest">รอดำเนินการ</span>
          <span class="text-red-600 font-black text-xl leading-none">{{ pendingCount }}</span>
        </div>
        <div class="bg-blue-50 border border-blue-100 px-5 py-2 rounded-xl text-center shadow-sm">
          <span class="text-blue-500 font-bold text-[10px] uppercase block leading-none mb-1 tracking-widest">กำลังทำ</span>
          <span class="text-blue-600 font-black text-xl leading-none">{{ preparingCount }}</span>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-x-auto overflow-y-hidden p-6 md:p-8">
      
      <div v-if="isLoading" class="h-full flex flex-col items-center justify-center text-orange-500">
        <i class="fa-solid fa-circle-notch fa-spin text-5xl mb-4"></i>
        <p class="font-black text-gray-500 tracking-widest uppercase">กำลังโหลดออเดอร์...</p>
      </div>

      <div v-else-if="Object.keys(groupedOrders).length === 0" class="h-full flex flex-col items-center justify-center text-gray-400">
        <div class="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
          <i class="fa-solid fa-check-double text-5xl text-emerald-400"></i>
        </div>
        <h2 class="text-2xl font-black text-gray-600">ไม่มีออเดอร์ค้าง</h2>
        <p class="font-bold text-sm mt-2">ออเดอร์ทั้งหมดถูกจัดการเรียบร้อยแล้ว</p>
      </div>

      <div v-else class="flex gap-6 h-full items-start pb-4">
        
        <div v-for="(order, orderId) in groupedOrders" :key="orderId" class="w-[350px] min-w-[350px] bg-white rounded-[2rem] shadow-md border border-gray-200 flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out] shrink-0 max-h-full">
          
          <div class="p-5 border-b border-gray-100 relative overflow-hidden" :class="order.hasPending ? 'bg-red-50' : 'bg-blue-50'">
            <div class="relative z-10 flex justify-between items-start">
              <div>
                <span class="px-3 py-1 bg-white rounded-full text-[10px] font-black tracking-widest uppercase mb-2 inline-block shadow-sm" :class="order.hasPending ? 'text-red-600' : 'text-blue-600'">
                  INV-{{ orderId.substring(0, 4).toUpperCase() }}
                </span>
                <h3 class="text-2xl font-black text-gray-900 leading-tight">โต๊ะ: {{ order.tableName }}</h3>
              </div>
              <div class="text-right">
                <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">เวลาสั่ง</p>
                <p class="font-black text-gray-800">{{ formatTime(order.createdAt) }}</p>
              </div>
            </div>
            <i class="fa-solid fa-receipt absolute -right-4 -bottom-4 text-6xl opacity-5"></i>
          </div>

          <div class="flex-1 overflow-y-auto p-2">
            <div v-for="item in order.items" :key="item.id" class="p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors rounded-xl">
              
              <div class="flex justify-between items-start mb-3">
                <div class="flex-1 pr-3">
                  <h4 class="font-black text-gray-800 text-lg leading-tight">{{ item.menu_name }}</h4>
                  <p v-if="item.note" class="text-xs font-bold text-red-500 mt-1"><i class="fa-solid fa-comment-dots"></i> {{ item.note }}</p>
                </div>
                <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-xl text-gray-800 shadow-inner shrink-0">
                  x{{ item.quantity }}
                </div>
              </div>

              <div class="flex gap-2">
                <button v-if="item.kitchen_status === 'Pending'" @click="updateStatus(item.id, 'Preparing')" class="flex-1 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-bold text-xs transition-colors shadow-sm">
                  <i class="fa-solid fa-fire-burner mr-1"></i> เริ่มทำ
                </button>
                <button v-if="item.kitchen_status === 'Preparing'" @click="updateStatus(item.id, 'Done')" class="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs transition-all shadow-md active:scale-95">
                  <i class="fa-solid fa-check mr-1"></i> เสร็จแล้ว
                </button>
                <button v-if="item.kitchen_status === 'Pending'" @click="updateStatus(item.id, 'Cancelled')" class="px-4 py-2.5 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-xl font-bold text-xs transition-colors">
                  ยกเลิก
                </button>
              </div>

            </div>
          </div>
          
          <div class="p-4 bg-gray-50 border-t border-gray-100 shrink-0">
            <button v-if="order.hasPending" @click="updateAllStatus(order.items, 'Preparing')" class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-lg shadow-blue-500/30 transition-all active:scale-95 text-sm mb-2">
              ทำทุกรายการในบิลนี้
            </button>
            <button v-else-if="order.hasPreparing" @click="updateAllStatus(order.items, 'Done')" class="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-500/30 transition-all active:scale-95 text-sm">
              <i class="fa-solid fa-check-double mr-1"></i> เสร็จทุกรายการ
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

const myStoreId = ref(null)
const orderItems = ref([])
const isLoading = ref(true)
let realtimeChannel = null

const loadKitchenOrders = async () => {
  if (!myStoreId.value) return
  isLoading.value = true
  
  try {
    const { data, error } = await supabase
      .from('order_details')
      .select('*, orders!inner(id, table_id, created_at, tables(table_name))')
      .eq('store_id', myStoreId.value)
      .in('kitchen_status', ['Pending', 'Preparing'])
      .order('created_at', { ascending: true })

    if (error) throw error
    if (data) orderItems.value = data
  } catch (err) {
    console.error("Load Kitchen Error:", err)
  } finally {
    isLoading.value = false
  }
}

// 🌟 จัดกลุ่มข้อมูลแยกตามบิล (Order) เพื่อแสดงเป็นการ์ด
const groupedOrders = computed(() => {
  const groups = {}
  orderItems.value.forEach(item => {
    const orderId = item.orders?.id
    if (!orderId) return

    if (!groups[orderId]) {
      groups[orderId] = {
        tableName: item.orders?.tables?.table_name || 'ไม่ระบุโต๊ะ',
        createdAt: item.orders?.created_at,
        items: [],
        hasPending: false,
        hasPreparing: false
      }
    }
    groups[orderId].items.push(item)
    if (item.kitchen_status === 'Pending') groups[orderId].hasPending = true
    if (item.kitchen_status === 'Preparing') groups[orderId].hasPreparing = true
  })
  return groups
})

const pendingCount = computed(() => orderItems.value.filter(i => i.kitchen_status === 'Pending').length)
const preparingCount = computed(() => orderItems.value.filter(i => i.kitchen_status === 'Preparing').length)

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return new Date(timeStr).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

// อัปเดตสถานะทีละรายการ
const updateStatus = async (itemId, status) => {
  try {
    // อัปเดต UI ทันทีเพื่อความลื่นไหล
    const index = orderItems.value.findIndex(i => i.id === itemId)
    if (index !== -1) orderItems.value[index].kitchen_status = status

    await supabase.from('order_details').update({ kitchen_status: status }).eq('id', itemId)
    
    if (status === 'Done' || status === 'Cancelled') {
      setTimeout(() => { loadKitchenOrders() }, 500) // รีเฟรชข้อมูลเบื้องหลัง
    }
  } catch (err) {
    console.error("Update Error:", err)
  }
}

// อัปเดตสถานะทั้งบิล (เหมา)
const updateAllStatus = async (items, targetStatus) => {
  const itemIds = items.filter(i => i.kitchen_status !== 'Done' && i.kitchen_status !== 'Cancelled').map(i => i.id)
  if (itemIds.length === 0) return

  try {
    // อัปเดต UI ทันที
    items.forEach(i => { i.kitchen_status = targetStatus })
    
    await supabase.from('order_details').update({ kitchen_status: targetStatus }).in('id', itemIds)
    
    if (targetStatus === 'Done') {
      setTimeout(() => { loadKitchenOrders() }, 500)
    }
  } catch (err) {
    console.error("Update All Error:", err)
  }
}

// 📡 ระบบ Real-time
const setupRealtime = () => {
  realtimeChannel = supabase.channel(`kitchen_updates_${myStoreId.value}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'order_details', filter: `store_id=eq.${myStoreId.value}` }, () => {
      loadKitchenOrders()
    })
    .subscribe()
}

onMounted(() => {
  const savedUser = JSON.parse(localStorage.getItem('rmpro_user'))
  if (savedUser && savedUser.store_id) {
    myStoreId.value = savedUser.store_id
    loadKitchenOrders()
    setupRealtime()
  }
})

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>