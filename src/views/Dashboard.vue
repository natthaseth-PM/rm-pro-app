<template>
  <div class="h-full flex flex-col bg-gray-50 overflow-hidden font-sans text-gray-800">
    
    <header class="bg-white px-8 py-6 flex justify-between items-center shrink-0 border-b border-gray-200 shadow-sm z-10">
      <div>
        <h1 class="text-2xl font-black flex items-center gap-3">
          <span class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl shadow-inner">
            <i class="fa-solid fa-chart-pie"></i>
          </span>
          Dashboard (ภาพรวมระบบ)
        </h1>
        <p class="text-gray-500 font-bold text-sm ml-[3.5rem] mt-1">สรุปยอดขายและสถิติร้านค้าประจำวัน</p>
      </div>
      <div class="flex items-center gap-3 hidden md:flex">
        <span class="text-sm font-black text-blue-600 bg-blue-50 border border-blue-100 px-5 py-2.5 rounded-xl shadow-sm"><i class="fa-solid fa-calendar-day mr-2"></i>{{ currentDate }}</span>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-6 md:p-8 relative">
      <div v-if="isLoading" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm">
        <i class="fa-solid fa-circle-notch fa-spin text-5xl text-blue-600 mb-4"></i>
        <p class="font-black text-gray-500 tracking-widest uppercase">กำลังประมวลผลข้อมูล...</p>
      </div>

      <div v-else class="max-w-7xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out]">
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/30 relative overflow-hidden transform transition-transform hover:-translate-y-1">
            <i class="fa-solid fa-wallet absolute -right-4 -bottom-4 text-7xl text-white/10"></i>
            <div class="relative z-10">
              <p class="text-blue-100 font-bold text-sm uppercase tracking-widest mb-1">ยอดขายวันนี้ (บาท)</p>
              <h3 class="text-4xl font-black tracking-tight">฿{{ todaySales.toLocaleString() }}</h3>
              <p class="text-xs font-medium mt-3 text-blue-200"><i class="fa-solid fa-arrow-trend-up mr-1"></i> อัปเดตล่าสุด</p>
            </div>
          </div>

          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden transform transition-transform hover:-translate-y-1">
            <i class="fa-solid fa-receipt absolute -right-4 -bottom-4 text-7xl text-gray-50"></i>
            <div class="relative z-10">
              <p class="text-gray-400 font-bold text-sm uppercase tracking-widest mb-1">จำนวนบิลทั้งหมด</p>
              <h3 class="text-4xl font-black text-gray-800 tracking-tight">{{ todayOrders }}</h3>
              <p class="text-xs font-bold mt-3 text-emerald-500"><i class="fa-solid fa-check-circle mr-1"></i> สำเร็จแล้ว {{ paidOrders }} บิล</p>
            </div>
          </div>

          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden transform transition-transform hover:-translate-y-1">
            <i class="fa-solid fa-users absolute -right-4 -bottom-4 text-7xl text-gray-50"></i>
            <div class="relative z-10">
              <p class="text-gray-400 font-bold text-sm uppercase tracking-widest mb-1">ลูกค้าเฉลี่ย / บิล (บาท)</p>
              <h3 class="text-4xl font-black text-gray-800 tracking-tight">฿{{ avgOrderValue.toLocaleString() }}</h3>
              <p class="text-xs font-bold mt-3 text-purple-500"><i class="fa-solid fa-calculator mr-1"></i> ยอดใช้จ่ายต่อบิล</p>
            </div>
          </div>

          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden transform transition-transform hover:-translate-y-1">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-gray-400 font-bold text-sm uppercase tracking-widest mb-1">สถานะโต๊ะ</p>
                <div class="flex gap-4 mt-2">
                  <div>
                    <p class="text-[10px] font-black text-emerald-500 uppercase">ว่าง</p>
                    <p class="text-2xl font-black text-gray-800">{{ availableTables }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] font-black text-orange-500 uppercase">ไม่ว่าง</p>
                    <p class="text-2xl font-black text-gray-800">{{ occupiedTables }}</p>
                  </div>
                </div>
              </div>
              <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 text-xl"><i class="fa-solid fa-chair"></i></div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[400px]">
            <div class="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
              <h3 class="text-lg font-black text-gray-800 flex items-center"><i class="fa-solid fa-fire text-orange-500 mr-2"></i> 5 อันดับเมนูขายดีวันนี้</h3>
            </div>
            <div class="flex-1 overflow-y-auto p-6">
              <div v-if="topSellingItems.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400">
                <i class="fa-solid fa-utensils text-4xl mb-3 opacity-30"></i>
                <p class="font-bold">ยังไม่มีข้อมูลการขาย</p>
              </div>
              <div v-else class="space-y-4">
                <div v-for="(item, index) in topSellingItems" :key="item.menu_name" class="flex items-center bg-gray-50 p-3 rounded-2xl border border-gray-100 transition-colors hover:bg-white hover:shadow-sm">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-inner mr-4" :class="index === 0 ? 'bg-yellow-100 text-yellow-600' : index === 1 ? 'bg-gray-200 text-gray-600' : index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-white text-gray-400 border border-gray-200'">{{ index + 1 }}</div>
                  <div class="flex-1">
                    <p class="font-black text-gray-800">{{ item.menu_name }}</p>
                    <p class="text-xs font-bold text-gray-500">{{ item.quantity }} จาน / แก้ว</p>
                  </div>
                  <div class="text-right">
                    <p class="font-black text-blue-600 text-lg">฿{{ item.total.toLocaleString() }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[400px]">
            <div class="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
              <h3 class="text-lg font-black text-gray-800 flex items-center"><i class="fa-solid fa-triangle-exclamation text-red-500 mr-2"></i> สินค้าใกล้หมดสต๊อก</h3>
              <router-link to="/settings" class="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">เติมคลัง</router-link>
            </div>
            <div class="flex-1 overflow-y-auto p-6">
              <div v-if="lowStockItems.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400">
                <i class="fa-solid fa-boxes-stacked text-4xl mb-3 opacity-30"></i>
                <p class="font-bold">สต๊อกสินค้ายังปลอดภัย</p>
              </div>
              <div v-else class="space-y-3">
                <div v-for="item in lowStockItems" :key="item.id" class="flex justify-between items-center p-4 bg-red-50 rounded-2xl border border-red-100">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm"><i class="fa-solid fa-box"></i></div>
                    <div>
                      <p class="font-black text-gray-800">{{ item.item_name }}</p>
                      <p class="text-xs font-bold text-red-500 mt-0.5">แจ้งเตือนเมื่อต่ำกว่า {{ item.low_alert }} {{ item.unit }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="px-3 py-1.5 bg-red-500 text-white font-black rounded-lg text-sm shadow-sm">{{ item.stock_qty }} {{ item.unit }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const myStoreId = ref(null)

const isLoading = ref(true)
const currentDate = ref(new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))

// สถิติวันนี้
const todaySales = ref(0)
const todayOrders = ref(0)
const paidOrders = ref(0)
const avgOrderValue = ref(0)

// ข้อมูลอื่นๆ
const availableTables = ref(0)
const occupiedTables = ref(0)
const topSellingItems = ref([])
const lowStockItems = ref([])

const loadDashboardData = async () => {
  if (!myStoreId.value) return;
  isLoading.value = true
  
  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

  try {
    // 1. ดึงยอดขายและออเดอร์ของวันนี้ (ใช้ store_id SaaS)
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*, order_details(*)')
      .eq('store_id', myStoreId.value)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)

    if (ordersData) {
      todayOrders.value = ordersData.length
      const paid = ordersData.filter(o => o.status === 'Paid')
      paidOrders.value = paid.length
      todaySales.value = paid.reduce((sum, order) => sum + Number(order.total_amount), 0)
      avgOrderValue.value = paid.length > 0 ? Math.round(todaySales.value / paid.length) : 0

      // คำนวณเมนูขายดี
      const itemCounts = {}
      paid.forEach(order => {
        if (order.order_details) {
          order.order_details.forEach(item => {
            if (item.kitchen_status !== 'Cancelled' && item.kitchen_status !== 'Voided') {
              if (!itemCounts[item.menu_name]) {
                itemCounts[item.menu_name] = { quantity: 0, total: 0 }
              }
              itemCounts[item.menu_name].quantity += Number(item.quantity)
              itemCounts[item.menu_name].total += Number(item.total_price)
            }
          })
        }
      })

      topSellingItems.value = Object.keys(itemCounts)
        .map(name => ({ menu_name: name, ...itemCounts[name] }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)
    }

    // 2. ดึงสถานะโต๊ะ
    const { data: tablesData } = await supabase.from('tables').select('status').eq('store_id', myStoreId.value)
    if (tablesData) {
      availableTables.value = tablesData.filter(t => t.status === 'Available').length
      occupiedTables.value = tablesData.filter(t => t.status !== 'Available').length
    }

    // 3. ดึงสินค้าใกล้หมด
    const { data: inventoryData } = await supabase.from('inventory').select('*').eq('store_id', myStoreId.value)
    if (inventoryData) {
      lowStockItems.value = inventoryData.filter(item => Number(item.stock_qty) <= Number(item.low_alert))
    }

  } catch (error) {
    console.error("Dashboard Load Error:", error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  const savedUser = JSON.parse(localStorage.getItem('rmpro_user'))
  if (savedUser && savedUser.store_id) {
    myStoreId.value = savedUser.store_id
    loadDashboardData()
  } else if (savedUser && savedUser.role === 'SuperAdmin') {
    router.push('/superadmin')
  } else {
    router.push('/login')
  }
})
</script>
<style scoped> .no-scrollbar::-webkit-scrollbar { display: none; } </style>