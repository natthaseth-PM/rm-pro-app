<template>
  <div class="h-full flex flex-col bg-gray-50 overflow-hidden relative font-sans text-gray-800">
    
    <div class="bg-white px-6 py-5 border-b border-gray-200 shadow-sm z-10 shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-2xl font-black text-gray-800 flex items-center"><i class="fa-solid fa-receipt text-primary mr-3"></i> ประวัติบิลขาย (Bill History)</h2>
        <p class="text-sm font-bold text-gray-400 mt-1">ดูประวัติย้อนหลัง พิมพ์ใบเสร็จซ้ำ หรือกดยกเลิกบิล</p>
      </div>
      
      <div class="flex items-center gap-3 w-full md:w-auto">
        <input 
          type="date" 
          v-model="filterDate" 
          class="w-full md:w-auto bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
        >
        <button @click="loadBillHistory" class="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-bold transition-colors shadow-sm active:scale-95 flex items-center whitespace-nowrap">
          <i class="fa-solid fa-rotate-right mr-2"></i>รีเฟรช
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-6 md:p-8 relative">
      <div class="max-w-7xl mx-auto flex flex-col h-full">
        
        <div class="flex justify-between items-center mb-6 shrink-0">
          <div class="relative">
            <i class="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input v-model="searchBillQuery" type="text" placeholder="ค้นหาเลขบิล หรือ ชื่อโต๊ะ..." class="pl-10 pr-4 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl outline-none focus:border-primary shadow-sm w-64 md:w-80 transition-all">
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
          <div class="flex-1 overflow-y-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100 sticky top-0 z-10">
                  <th class="p-4 font-bold">วันที่-เวลา</th>
                  <th class="p-4 font-bold">เลขที่บิล (Order ID)</th>
                  <th class="p-4 font-bold">โต๊ะ</th>
                  <th class="p-4 font-bold text-right"><i class="fa-solid fa-tag text-gray-400 mr-1"></i>ยอดสุทธิ (฿)</th>
                  <th class="p-4 font-bold text-center">สถานะ</th>
                  <th class="p-4 font-bold text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-if="isLoading">
                  <td colspan="6" class="text-center py-10 text-primary font-bold"><i class="fa-solid fa-circle-notch fa-spin mr-2"></i>กำลังโหลดข้อมูล...</td>
                </tr>
                <tr v-else-if="paginatedBills.length === 0">
                  <td colspan="6" class="text-center py-10 text-gray-400 font-bold">
                    <i class="fa-regular fa-calendar-xmark text-4xl mb-3 block opacity-50"></i>
                    ไม่พบประวัติบิลของวันที่เลือก
                  </td>
                </tr>
                <tr v-for="bill in paginatedBills" :key="bill.id" class="hover:bg-gray-50 transition-colors" :class="{'opacity-60 bg-gray-50': bill.status === 'Voided'}">
                  <td class="p-4 font-bold text-gray-500 text-sm whitespace-nowrap">{{ new Date(bill.created_at).toLocaleString('th-TH') }}</td>
                  <td class="p-4 font-mono font-bold text-gray-800 whitespace-nowrap">#INV-{{ bill.id.split('-')[0].toUpperCase() }}</td>
                  <td class="p-4 font-black text-gray-700 whitespace-nowrap">{{ bill.tables?.table_name || 'ไม่ระบุ' }}</td>
                  <td class="p-4 font-black text-primary text-xl text-right whitespace-nowrap" :class="{'line-through text-gray-400': bill.status === 'Voided'}">
                    {{ Number(bill.total_amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}
                  </td>
                  <td class="p-4 text-center">
                    <span v-if="bill.status === 'Paid'" class="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600 border border-green-200 whitespace-nowrap"><i class="fa-solid fa-check mr-1"></i> จ่ายแล้ว</span>
                    <span v-else-if="bill.status === 'Voided'" class="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200 whitespace-nowrap"><i class="fa-solid fa-ban mr-1"></i> ยกเลิก (Void)</span>
                  </td>
                  <td class="p-4 text-center whitespace-nowrap">
                    <button @click="openBillDetail(bill)" class="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-800 hover:text-white font-bold transition-colors shadow-sm text-sm"><i class="fa-solid fa-file-invoice mr-1"></i> เปิดดู</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
            <span class="text-sm text-gray-500 font-bold">หน้า {{ currentPageBill }} จาก {{ totalBillPages }}</span>
            <div class="flex gap-2">
              <button @click="currentPageBill--" :disabled="currentPageBill === 1" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50 active:scale-95 transition-all">ก่อนหน้า</button>
              <button @click="currentPageBill++" :disabled="currentPageBill === totalBillPages" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50 active:scale-95 transition-all">ถัดไป</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showBillDetailModal" class="absolute inset-0 bg-[#40434e]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
      
      <div class="w-full max-w-sm flex justify-end mb-4">
        <button @click="showBillDetailModal = false" class="w-10 h-10 bg-gray-600/50 hover:bg-gray-500 text-white rounded-full flex items-center justify-center border border-gray-400 transition-all shadow-lg active:scale-90">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <div class="w-full max-w-sm bg-white rounded-2xl shadow-2xl relative overflow-hidden" style="background-image: radial-gradient(circle, #e5e7eb 2px, transparent 2px); background-size: 20px 20px; background-position: -10px -10px;">
        
        <div v-if="selectedBillDetail.status === 'Voided'" class="border-4 border-red-500 text-red-500 font-black text-3xl py-2 mb-6 inline-block px-5 rotate-[-12deg] opacity-80 uppercase tracking-widest absolute top-10 left-1/2 -translate-x-1/2 z-10 shadow-lg bg-white/90 rounded-sm pointer-events-none">Voided</div>
        
        <div class="p-6 md:p-8">
          <div class="text-center mb-6">
            <h3 class="font-black text-2xl text-[#1a1a2e] mb-1">{{ storeSettings.StoreName || 'บริษัท ร้านอาหาร จำกัด' }}</h3>
            <p class="text-xs font-bold text-gray-500">ใบเสร็จรับเงิน (สำเนา)</p>
          </div>
          
          <hr class="border-t-2 border-dotted border-gray-200 mb-5">
          
          <div class="space-y-2 text-sm font-bold text-[#4a4a5a] mb-5">
            <div class="flex justify-between gap-3"><span>เลขที่:</span><span class="font-mono">INV-{{ selectedBillDetail.id.split('-')[0].toUpperCase() }}</span></div>
            <div class="flex justify-between gap-3"><span>โต๊ะ:</span><span class="text-[#1a1a2e]">{{ selectedBillDetail.tables?.table_name || 'ไม่ระบุ' }}</span></div>
            <div class="flex justify-between gap-3"><span>เวลาจ่าย:</span><span class="text-[#1a1a2e]">{{ new Date(selectedBillDetail.created_at).toLocaleString('th-TH') }}</span></div>
            <div class="flex justify-between gap-3"><span>ชำระโดย:</span><span class="text-[#1a1a2e]">{{ selectedBillDetail.payment_method || 'Cash' }}</span></div>
          </div>

          <hr class="border-t-2 border-dotted border-gray-200 mb-5">

          <div class="space-y-3 mb-5 min-h-[100px]">
            <div v-if="isDetailLoading" class="text-center py-4 text-gray-400"><i class="fa-solid fa-circle-notch fa-spin"></i></div>
            <div v-else v-for="item in selectedBillItems" :key="item.id" class="flex justify-between items-start text-sm font-bold text-[#4a4a5a]">
              <div class="pr-2 leading-tight">
                {{ item.menu_name }} <span class="text-gray-400 text-xs ml-1 font-medium">x{{ item.quantity }}</span>
              </div>
              <div class="font-mono shrink-0">{{ Number(item.price * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2}) }}</div>
            </div>
          </div>

          <hr class="border-t-2 border-gray-800 mb-5">

          <div class="space-y-2 mb-6">
            <div class="flex justify-between items-end mb-3">
              <span class="font-black text-xl text-[#1a1a2e]">ยอดสุทธิ (฿):</span>
              <span class="font-black text-xl text-[#1a1a2e]">{{ Number(selectedBillDetail.total_amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
            </div>
            
            <div class="flex justify-between text-xs font-bold text-gray-500">
              <span>รับเงินมา:</span>
              <span class="font-mono">{{ Number(selectedBillDetail.received_amount || selectedBillDetail.total_amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
            </div>
            <div class="flex justify-between text-xs font-bold text-orange-600">
              <span>เงินทอน:</span>
              <span class="font-mono">{{ Number(selectedBillDetail.change_amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
            </div>
          </div>

          <hr class="border-t-2 border-dotted border-gray-200 mb-5">
          
          <div class="text-center text-xs font-bold text-gray-400">
            {{ storeSettings.FooterText || 'ขอขอบคุณที่ใช้บริการ' }}
          </div>
        </div>
      </div>

      <button v-if="selectedBillDetail && selectedBillDetail.status === 'Paid'" @click="confirmVoidBill(selectedBillDetail.id)" class="mt-6 py-3 px-8 bg-[#2a2a35] border border-red-500/50 hover:border-red-500 text-red-400 hover:bg-red-500 hover:text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 active:scale-95 shadow-lg w-full max-w-[200px]">
        <i class="fa-solid fa-ban text-xs"></i> ยกเลิกบิล (Void)
      </button>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../supabase'
import Swal from 'sweetalert2'

// 🌟 ฟังก์ชันแปลงเวลาเป็น Format YYYY-MM-DD แบบตามเวลาเครื่อง (Local) ให้แม่นยำ
const getLocalYYYYMMDD = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// State
const orders = ref([])
const isLoading = ref(true)
const searchBillQuery = ref('')
const currentPageBill = ref(1)
const itemsPerPage = 10
const filterDate = ref(getLocalYYYYMMDD()) // 🌟 กำหนดค่าเริ่มต้นเป็นวันปัจจุบัน

const storeSettings = ref({})
const showBillDetailModal = ref(false)
const selectedBillDetail = ref(null)
const selectedBillItems = ref([])
const isDetailLoading = ref(false)

// 📡 Load Settings
const loadSettings = async () => {
  const { data } = await supabase.from('settings').select('*')
  if (data) {
    storeSettings.value = Object.fromEntries(data.map(item => [item.setting_key, item.setting_value]))
  }
}

// 📡 Load Orders ตามวันที่เลือก
const loadBillHistory = async () => {
  isLoading.value = true
  
  // 🌟 คำนวณขอบเขตของ "วันที่เลือก" (ตั้งแต่ 00:00:00 ถึง 23:59:59 ใน Timezone เครื่อง)
  const startOfDay = new Date(`${filterDate.value}T00:00:00`).toISOString()
  const endOfDay = new Date(`${filterDate.value}T23:59:59.999`).toISOString()

  const { data, error } = await supabase
    .from('orders')
    .select(`*, tables (table_name)`)
    .in('status', ['Paid', 'Voided'])
    .gte('created_at', startOfDay) // ดึงบิลที่สร้างตั้งแต่วินาทีแรกของวัน
    .lte('created_at', endOfDay)   // ดึงบิลที่สร้างไม่เกินวินาทีสุดท้ายของวัน
    .order('created_at', { ascending: false })
  
  if (data) orders.value = data
  isLoading.value = false
}

// 🌟 ดักจับถ้าผู้ใช้เปลี่ยน Date Picker ให้ไปโหลดข้อมูลใหม่มาทันที
watch(filterDate, () => {
  currentPageBill.value = 1
  loadBillHistory()
})

// 🔍 Search & Pagination Logic
const filteredBills = computed(() => {
  if (!searchBillQuery.value) return orders.value
  const q = searchBillQuery.value.toLowerCase()
  return orders.value.filter(o => 
    o.id.toLowerCase().includes(q) || 
    (o.tables?.table_name || '').toLowerCase().includes(q)
  )
})

const totalBillPages = computed(() => Math.ceil(filteredBills.value.length / itemsPerPage) || 1)

const paginatedBills = computed(() => {
  const start = (currentPageBill.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredBills.value.slice(start, end)
})

watch(searchBillQuery, () => {
  currentPageBill.value = 1 
})

// 📄 Bill Details
const openBillDetail = async (bill) => {
  selectedBillDetail.value = bill
  showBillDetailModal.value = true
  isDetailLoading.value = true
  
  const { data } = await supabase
    .from('order_details')
    .select('*')
    .eq('order_id', bill.id)
  
  if (data) selectedBillItems.value = data
  isDetailLoading.value = false
}

// 🛑 ฟังก์ชันยกเลิกบิล (Void) และคืนสต๊อก
const confirmVoidBill = async (orderId) => {
  const res = await Swal.fire({
    title: 'ยกเลิกบิลนี้?',
    text: 'ยอดเงินจะถูกหักออก และระบบจะคืนสต๊อกสินค้าให้อัตโนมัติ',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'ยืนยันยกเลิก',
    cancelButtonText: 'ปิด'
  })

  if (res.isConfirmed) {
    // 1. เปลี่ยนสถานะบิลเป็น Voided
    await supabase.from('orders').update({ status: 'Voided' }).eq('id', orderId)
    
    // 📦 2. ระบบคืนสต๊อกอัตโนมัติ (Auto Inventory Refund)
    const { data: orderItems } = await supabase
      .from('order_details')
      .select('quantity, menus(inventory_id)')
      .eq('order_id', orderId)
      .neq('kitchen_status', 'Cancelled')
      .neq('kitchen_status', 'Voided')
      
    if (orderItems) {
      const stockToRefund = {}
      orderItems.forEach(item => {
        const invId = item.menus?.inventory_id
        if (invId) stockToRefund[invId] = (stockToRefund[invId] || 0) + item.quantity
      })

      // ทำการบวกคืนคลังและบันทึก Log
      for (const [invId, qtyToRefund] of Object.entries(stockToRefund)) {
        const { data: invItem } = await supabase.from('inventory').select('item_name, stock_qty').eq('id', invId).single()
        if (invItem) {
          const newQty = Number(invItem.stock_qty) + qtyToRefund
          
          await supabase.from('inventory').update({ stock_qty: newQty }).eq('id', invId)
          await supabase.from('inventory_logs').insert([{
            item_name: invItem.item_name,
            action: `ยกเลิกบิล (Void #${orderId.split('-')[0].toUpperCase()})`,
            qty_change: qtyToRefund,
            remaining: newQty
          }])
        }
      }
    }

    Swal.fire({ icon: 'success', title: 'ยกเลิกบิลสำเร็จ พร้อมคืนสต๊อกแล้ว', timer: 2500, showConfirmButton: false })
    showBillDetailModal.value = false
    loadBillHistory()
  }
}

onMounted(() => {
  loadSettings()
  loadBillHistory()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>