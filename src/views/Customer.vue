<template>
  <div class="h-screen w-full font-sans bg-gray-50 flex flex-col overflow-hidden text-gray-800">
    
    <header class="bg-white px-4 py-4 shadow-sm z-10 shrink-0 flex justify-between items-center">
      <div>
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ยินดีต้อนรับสู่ RM Pro</p>
        <h1 class="text-xl font-black text-primary leading-none">{{ tableName || 'กำลังโหลด...' }}</h1>
      </div>
      <div class="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center shadow-inner">
        <i class="fa-solid fa-utensils"></i>
      </div>
    </header>

    <div class="bg-white px-4 py-1 flex gap-2 overflow-x-auto no-scrollbar shrink-0 border-t border-gray-50 shadow-sm">
      <button @click="currentTab = 'menu'" :class="['px-5 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap', currentTab === 'menu' ? 'text-primary' : 'text-gray-400']">
        <i class="fa-solid fa-bowl-food mr-2"></i>เมนูอาหาร
      </button>
      <button @click="openHistoryTab" :class="['px-5 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap', currentTab === 'history' ? 'text-primary' : 'text-gray-400']">
        <i class="fa-solid fa-receipt mr-2"></i>บิลของฉัน
      </button>
    </div>

    <main class="flex-1 overflow-hidden relative">
      <section v-show="currentTab === 'menu'" class="h-full flex flex-col">
        <div class="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button @click="selectedCategory = 'All'" :class="['px-4 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-colors border', selectedCategory === 'All' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200']">ทั้งหมด</button>
          <button v-for="cat in availableCategories" :key="cat" @click="selectedCategory = cat" :class="['px-4 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-colors border', selectedCategory === cat ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200']">{{ cat }}</button>
        </div>

        <div class="flex-1 overflow-y-auto px-4 pb-40">
          <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 text-primary">
            <i class="fa-solid fa-circle-notch fa-spin text-4xl mb-3"></i><p class="font-bold text-gray-400">กำลังโหลดเมนู...</p>
          </div>
          <div v-else class="grid grid-cols-2 gap-3 pb-20">
            <div v-for="item in filteredMenus" :key="item.id" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative">
              <div class="aspect-square bg-gray-100 relative overflow-hidden">
                <img v-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover">
                <div v-else class="w-full h-full flex items-center justify-center text-gray-300"><i class="fa-solid fa-image text-3xl"></i></div>
                <div class="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-lg text-sm font-black text-primary">฿{{ item.price }}</div>
              </div>
              <div class="p-3 flex-1 flex flex-col justify-between gap-2">
                <h3 class="font-bold text-gray-800 text-sm leading-tight line-clamp-2">{{ item.menu_name }}</h3>
                <div v-if="getItemQty(item.id) > 0" class="flex items-center justify-between bg-orange-50 rounded-xl p-1 border border-orange-100">
                  <button @click="updateCart(item, -1)" class="w-8 h-8 bg-white text-orange-500 rounded-lg shadow-sm font-bold"><i class="fa-solid fa-minus text-xs"></i></button>
                  <span class="font-black text-orange-600 w-6 text-center text-sm">{{ getItemQty(item.id) }}</span>
                  <button @click="updateCart(item, 1)" class="w-8 h-8 bg-primary text-white rounded-lg shadow-sm font-bold"><i class="fa-solid fa-plus text-xs"></i></button>
                </div>
                <button v-else @click="updateCart(item, 1)" class="w-full py-2 bg-gray-50 text-primary border border-gray-200 rounded-xl font-bold text-sm">เพิ่ม</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-show="currentTab === 'history'" class="h-full overflow-y-auto p-4 pb-40">
        <div class="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 min-h-[200px]">
          <h2 class="text-lg font-black text-gray-800 mb-4 flex items-center"><i class="fa-solid fa-receipt text-primary mr-2"></i> รายการที่สั่งไปแล้ว</h2>
          <div v-if="isHistoryLoading" class="text-center py-10 text-gray-400"><i class="fa-solid fa-circle-notch fa-spin text-3xl"></i></div>
          <div v-else-if="historyItems.length === 0" class="text-center py-10 text-gray-400">ยังไม่มีรายการสั่ง</div>
          <div v-else class="space-y-4">
            <div v-for="(item, idx) in historyItems" :key="idx" class="flex items-center justify-between border-b border-gray-50 pb-3">
              <div class="flex-1 pr-3">
                <p class="font-bold text-gray-800 text-sm">{{ item.menu_name }} x{{ item.quantity }}</p>
                <span :class="getStatusClass(item.kitchen_status)" class="text-[9px] font-black px-2 py-0.5 rounded-full uppercase">{{ item.kitchen_status }}</span>
              </div>
              <div class="font-black text-gray-800 text-sm">฿{{ item.total_price }}</div>
            </div>
            <div class="mt-6 bg-orange-50 p-4 rounded-2xl">
              <div class="flex justify-between items-center">
                <span class="text-orange-600 font-bold text-sm">ยอดรวมทั้งหมด</span>
                <span class="text-2xl font-black text-primary">฿{{ historyTotal.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <div v-if="cartCount > 0 && currentTab === 'menu'" class="fixed bottom-20 left-4 right-4 z-[80]">
      <button @click="showCartSummary = true" class="w-full bg-primary text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center active:scale-95 transition-all border-2 border-white/20">
        <div class="flex items-center gap-3">
          <div class="relative w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-lg">
            <i class="fa-solid fa-basket-shopping"></i>
            <div class="absolute -top-2 -right-2 bg-red-500 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-primary shadow-sm">{{ cartCount }}</div>
          </div>
          <div class="text-left">
            <p class="text-[10px] font-bold opacity-80 uppercase leading-none mb-1">รายการในตะกร้า</p>
            <p class="font-black text-xl leading-none">฿{{ cartTotal.toLocaleString() }}</p>
          </div>
        </div>
        <div class="bg-white text-primary px-4 py-2 rounded-xl font-black text-sm">ตรวจสอบ & สั่ง</div>
      </button>
    </div>

    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-16 z-50 shadow-inner">
      <button @click="currentTab = 'menu'" :class="currentTab === 'menu' ? 'text-primary' : 'text-gray-400'" class="flex-1 flex flex-col items-center"><i class="fa-solid fa-utensils text-xl"></i><span class="text-[10px] font-bold">เมนู</span></button>
      <button @click="requestService('Staff')" class="flex-1 flex flex-col items-center text-gray-400"><i class="fa-solid fa-bell text-xl"></i><span class="text-[10px] font-bold">เรียกพนักงาน</span></button>
      <button @click="openHistoryTab" :class="currentTab === 'history' ? 'text-primary' : 'text-gray-400'" class="flex-1 flex flex-col items-center"><i class="fa-solid fa-receipt text-xl"></i><span class="text-[10px] font-bold">บิล</span></button>
    </nav>

    <div v-if="showCartSummary" class="fixed inset-0 z-[100] flex flex-col justify-end">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showCartSummary = false"></div>
      <div class="bg-white w-full rounded-t-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] relative z-10 animate-[slideUp_0.3s_ease-out]">
        <div class="p-6 flex justify-between items-center border-b border-gray-50">
          <h2 class="text-xl font-black text-gray-800">ยืนยันการสั่งอาหาร</h2>
          <button @click="showCartSummary = false" class="w-10 h-10 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="flex-1 overflow-y-auto p-6 space-y-3">
          <div v-for="item in cart" :key="item.id" class="flex gap-4 bg-white p-3 rounded-2xl border border-gray-100 items-center">
            <div class="flex-1 min-w-0"><h4 class="font-bold text-sm text-gray-800">{{ item.menu_name }}</h4><p class="text-sm font-black text-primary">฿{{ item.price * item.qty }}</p></div>
            <div class="flex items-center gap-2 bg-gray-50 rounded-xl p-1 shrink-0">
              <button @click="updateCart(item, -1)" class="w-8 h-8 bg-white text-gray-500 rounded-lg shadow-sm font-bold"><i class="fa-solid fa-minus text-xs"></i></button>
              <span class="font-black text-gray-800 w-5 text-center">{{ item.qty }}</span>
              <button @click="updateCart(item, 1)" class="w-8 h-8 bg-white text-primary rounded-lg shadow-sm font-bold"><i class="fa-solid fa-plus text-xs"></i></button>
            </div>
          </div>
        </div>
        <div class="p-6 bg-white border-t border-gray-100 pb-10">
          <div class="flex justify-between items-end mb-6">
            <span class="text-gray-500 font-bold uppercase">ยอดรวมทั้งหมด</span>
            <span class="font-black text-3xl text-gray-800">฿{{ cartTotal.toLocaleString() }}</span>
          </div>
          <button @click="submitOrder" :disabled="isSubmitting" class="w-full bg-primary disabled:bg-gray-300 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 text-lg">
            {{ isSubmitting ? 'กำลังส่งออเดอร์...' : 'ยืนยันส่งเข้าครัว' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../supabase'
import Swal from 'sweetalert2'

const route = useRoute()
const tableId = ref(null)
const tableName = ref('')
const currentTab = ref('menu')
const selectedCategory = ref('All')
const menus = ref([])
const cart = ref([])
const historyItems = ref([])
const historyTotal = ref(0)
const isLoading = ref(true)
const isHistoryLoading = ref(false)
const isSubmitting = ref(false)
const showCartSummary = ref(false)

const availableCategories = computed(() => [...new Set(menus.value.map(item => item.category))])
const filteredMenus = computed(() => selectedCategory.value === 'All' ? menus.value : menus.value.filter(m => m.category === selectedCategory.value))
const cartCount = computed(() => cart.value.reduce((sum, item) => sum + item.qty, 0))
const cartTotal = computed(() => cart.value.reduce((sum, item) => sum + (item.price * item.qty), 0))

const loadInitialData = async () => {
  // 🌟 บังคับ Type เป็น Number เพื่อความแม่นยำในการ Query
  tableId.value = Number(route.query.table_id)
  tableName.value = route.query.table_name || 'ลูกค้าสั่งเอง'

  if (!tableId.value) {
    Swal.fire({ icon: 'error', title: 'ไม่พบรหัสโต๊ะ', text: 'กรุณาสแกน QR Code ใหม่อีกครั้ง' })
    return
  }
  fetchMenus()
}

const fetchMenus = async () => {
  isLoading.value = true
  const { data } = await supabase.from('menus').select('*').eq('status', 'Available')
  if (data) menus.value = data
  isLoading.value = false
}

const getItemQty = (id) => cart.value.find(c => c.id === id)?.qty || 0

const updateCart = (menu, val) => {
  const index = cart.value.findIndex(c => c.id === menu.id)
  if (index !== -1) {
    cart.value[index].qty += val
    if (cart.value[index].qty <= 0) {
      cart.value.splice(index, 1)
      if (cart.value.length === 0) showCartSummary.value = false
    }
  } else if (val > 0) {
    cart.value.push({ ...menu, qty: 1 })
  }
}

const submitOrder = async () => {
  if (cart.value.length === 0 || isSubmitting.value) return
  isSubmitting.value = true

  try {
    // 1. หา Order ที่ยังเปิดอยู่
    const { data: activeOrder } = await supabase
      .from('orders')
      .select('id, total_amount')
      .eq('table_id', tableId.value)
      .eq('status', 'Open')
      .maybeSingle()

    let orderId;
    if (activeOrder) {
      orderId = activeOrder.id
      await supabase.from('orders').update({ total_amount: Number(activeOrder.total_amount) + cartTotal.value }).eq('id', orderId)
    } else {
      const { data: newOrder, error: insertError } = await supabase.from('orders').insert({
        table_id: tableId.value,
        total_amount: cartTotal.value,
        status: 'Open'
      }).select().single()
      if (insertError) throw insertError
      orderId = newOrder.id
      await supabase.from('tables').update({ status: 'Occupied' }).eq('id', tableId.value)
    }

    // 2. บันทึกรายการอาหาร
    const details = cart.value.map(item => ({
      order_id: orderId,
      menu_id: item.id,
      menu_name: item.menu_name,
      price: item.price,
      quantity: item.qty,
      total_price: item.price * item.qty,
      kitchen_status: 'Pending'
    }))

    await supabase.from('order_details').insert(details)
    
    cart.value = []
    showCartSummary.value = false
    Swal.fire({ icon: 'success', title: 'ส่งออเดอร์เรียบร้อย!', timer: 2000, showConfirmButton: false })
    openHistoryTab()

  } catch (error) {
    console.error(error)
    Swal.fire('ผิดพลาด', 'ไม่สามารถสั่งอาหารได้', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const openHistoryTab = async () => {
  currentTab.value = 'history'
  isHistoryLoading.value = true
  const { data: order } = await supabase.from('orders').select('id, total_amount').eq('table_id', tableId.value).eq('status', 'Open').maybeSingle()
  if (order) {
    const { data: items } = await supabase.from('order_details').select('*').eq('order_id', order.id).order('created_at', { ascending: false })
    historyItems.value = items || []
    historyTotal.value = order.total_amount
  }
  isHistoryLoading.value = false
}

const requestService = async (type) => {
  await supabase.from('tables').update({ service_request: type }).eq('id', tableId.value)
  Swal.fire({ icon: 'success', title: 'แจ้งพนักงานแล้วครับ', timer: 1500, showConfirmButton: false })
}

const getStatusClass = (s) => {
  if (s === 'Pending') return 'text-orange-500 border-orange-200 bg-orange-50'
  if (s === 'Served') return 'text-green-500 border-green-200 bg-green-50'
  return 'text-blue-500 border-blue-200 bg-blue-50'
}

onMounted(() => { loadInitialData() })
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>