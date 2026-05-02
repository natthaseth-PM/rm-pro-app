<template>
  <div class="h-full flex flex-col bg-gray-50 overflow-hidden font-sans text-gray-800">
    
    <header class="bg-white px-8 py-5 flex justify-between items-center shrink-0 border-b border-gray-100 shadow-sm z-10">
      <div>
        <h1 class="text-2xl font-black flex items-center gap-3 text-gray-800">
          <span class="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl">
            <i class="fa-solid fa-border-all"></i>
          </span>
          ผังโต๊ะรวม (Table Layout)
        </h1>
        <p class="text-gray-400 font-bold text-sm ml-13 mt-1">ดูภาพรวมร้าน อัปเดตสถานะแบบ Real-time</p>
      </div>
      
      <div class="flex gap-4">
        <div class="bg-emerald-50 border border-emerald-100 px-5 py-2 rounded-2xl text-center shadow-sm">
          <span class="text-emerald-500 font-bold text-[10px] uppercase block leading-none mb-1">โต๊ะว่าง</span>
          <span class="text-emerald-600 font-black text-2xl leading-none">{{ availableCount }}</span>
        </div>
        <div class="bg-orange-50 border border-orange-100 px-5 py-2 rounded-2xl text-center shadow-sm">
          <span class="text-orange-500 font-bold text-[10px] uppercase block leading-none mb-1">มีลูกค้า</span>
          <span class="text-orange-600 font-black text-2xl leading-none">{{ occupiedCount }}</span>
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-8">
      <div v-if="isLoading" class="h-full flex flex-col items-center justify-center text-primary">
        <i class="fa-solid fa-circle-notch fa-spin text-5xl mb-4"></i>
        <p class="font-bold text-xl">กำลังดึงผังโต๊ะ...</p>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        
        <div v-for="t in mergedTables" :key="t.id" 
          :class="[
            'relative rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center justify-center p-6 h-56 bg-white',
            t.status === 'Available' ? 'border-emerald-100 shadow-sm' : 'border-orange-200 bg-orange-50/30 shadow-md'
          ]">
          
          <div v-if="t.status !== 'Available'" class="absolute -top-3 -right-3 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white z-10">
            <i class="fa-solid fa-receipt text-xs"></i>
          </div>

          <div :class="[
            'w-16 h-16 rounded-full flex items-center justify-center mb-3',
            t.status === 'Available' ? 'bg-emerald-50 text-emerald-400' : 'bg-orange-200 text-orange-500'
          ]">
            <i class="fa-solid fa-utensils text-2xl"></i>
          </div>

          <h3 class="font-black text-xl text-gray-800">{{ t.table_name }}</h3>
          
          <div v-if="t.description" class="mt-1 px-3 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold line-clamp-1">
            {{ t.description }}
          </div>

          <div v-if="t.status === 'Available'" class="mt-auto font-black text-emerald-500 text-sm">
            ว่าง
          </div>

          <div v-else class="mt-auto flex flex-col items-center w-full">
            <span class="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black mb-1 flex items-center">
              <i class="fa-solid fa-utensils mr-1"></i> {{ t.order_mode || 'สั่งปกติ' }}
            </span>
            <span class="font-black text-gray-900 text-lg">฿{{ t.total_amount ? t.total_amount.toLocaleString() : '0' }}</span>
          </div>

        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router' // 🌟 นำเข้า useRouter
import { supabase } from '../supabase'

const router = useRouter() // 🌟 เรียกใช้งาน router
const tables = ref([])
const activeOrders = ref([])
const isLoading = ref(true)
let realtimeChannel = null

// โหลดข้อมูลโต๊ะ และบิลที่เปิดอยู่
const fetchData = async () => {
  const { data: tData } = await supabase.from('tables').select('*').order('table_name')
  if (tData) tables.value = tData

  const { data: oData } = await supabase.from('orders').select('*').eq('status', 'Open')
  if (oData) activeOrders.value = oData

  isLoading.value = false
}

// นำข้อมูลโต๊ะ กับ บิล มารวมกัน
const mergedTables = computed(() => {
  return tables.value.map(table => {
    const order = activeOrders.value.find(o => o.table_id === table.id)
    return { ...table, total_amount: order ? order.total_amount : 0, order_mode: order ? order.order_mode : '' }
  })
})

const availableCount = computed(() => tables.value.filter(t => t.status === 'Available').length)
const occupiedCount = computed(() => tables.value.filter(t => t.status !== 'Available').length)

// 🌟 ฟังก์ชันเมื่อกดเลือกโต๊ะจากผังรวม
const selectTable = (table) => {
  // สั่งให้เปลี่ยนหน้าไปที่ POS พร้อมแนบ table_id ไปที่ URL
  router.push({ path: '/pos', query: { table_id: table.id } })
}

// ระบบ Real-time
const setupRealtime = () => {
  realtimeChannel = supabase.channel('table_layout_updates')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, () => fetchData())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchData())
    .subscribe()
}

onMounted(() => {
  fetchData()
  setupRealtime()
})

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
