<template>
  <div class="h-screen w-full font-sans bg-gray-50 flex flex-col overflow-hidden text-gray-800 relative">
    
    <header class="bg-white px-5 py-4 shadow-sm z-20 shrink-0 flex justify-between items-center sticky top-0">
      <div>
        <p class="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">Welcome to</p>
        <h1 class="text-xl font-black text-gray-900 leading-none">{{ storeSettings.StoreName || 'RM Pro' }}</h1>
        <p class="text-xs font-bold text-gray-500 mt-1 flex items-center"><i class="fa-solid fa-map-pin mr-1"></i> โต๊ะ: {{ tableName || 'ไม่ระบุโต๊ะ' }}</p>
      </div>
      <div class="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center shadow-inner text-xl">
        <i class="fa-solid fa-utensils"></i>
      </div>
    </header>

    <main class="flex-1 overflow-hidden relative bg-gray-50">
      
      <section v-show="currentTab === 'menu'" class="h-full flex flex-col animate-[fadeIn_0.3s_ease-out]">
        
        <div class="px-5 py-4 flex gap-2 overflow-x-auto no-scrollbar shrink-0 bg-gray-50">
          <button v-for="cat in availableCategories" :key="cat" @click="selectedCategory = cat" :class="['px-5 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-colors border shadow-sm', selectedCategory === cat ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary']">{{ cat }}</button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 pb-48">
          <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 text-primary">
            <i class="fa-solid fa-circle-notch fa-spin text-5xl mb-4"></i><p class="font-black tracking-widest text-gray-400 uppercase">กำลังโหลดเมนู...</p>
          </div>
          
          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="item in filteredMenus" :key="item.id" class="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col relative group">
              <div class="aspect-square bg-gray-100 relative overflow-hidden">
                <img v-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                <div v-else class="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50"><i class="fa-solid fa-utensils text-4xl opacity-50"></i></div>
                <div class="absolute top-2 right-2 bg-gray-900/80 backdrop-blur-md px-3 py-1 rounded-xl text-sm font-black text-white shadow-md">฿{{ Number(item.price).toLocaleString() }}</div>
              </div>
              <div class="p-4 flex-1 flex flex-col justify-between gap-3">
                <h3 class="font-black text-gray-800 text-sm leading-tight line-clamp-2">{{ item.menu_name }}</h3>
                <div v-if="getItemQty(item.id) > 0" class="flex items-center justify-between bg-orange-50 rounded-xl p-1.5 border border-orange-200 shadow-inner">
                  <button @click="updateCart(item, -1)" class="w-8 h-8 bg-white text-orange-500 hover:bg-orange-100 rounded-lg shadow-sm font-black transition-colors"><i class="fa-solid fa-minus text-xs"></i></button>
                  <span class="font-black text-orange-600 w-8 text-center text-lg">{{ getItemQty(item.id) }}</span>
                  <button @click="updateCart(item, 1)" class="w-8 h-8 bg-primary hover:bg-orange-600 text-white rounded-lg shadow-sm font-black transition-colors"><i class="fa-solid fa-plus text-xs"></i></button>
                </div>
                <button v-else @click="updateCart(item, 1)" class="w-full py-3 bg-gray-50 hover:bg-gray-100 text-primary border border-gray-200 rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2">
                  <i class="fa-solid fa-plus"></i> เพิ่ม
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-show="currentTab === 'history'" class="h-full overflow-y-auto p-5 pb-32 animate-[fadeIn_0.3s_ease-out] bg-gray-100">
        <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 min-h-[300px] relative">
          <div class="absolute top-0 left-0 w-full h-3 bg-[radial-gradient(circle,transparent_50%,#f3f4f6_50%)] bg-[length:12px_12px] -mt-1.5"></div>
          <h2 class="text-xl font-black text-gray-800 mb-6 flex items-center pb-4 border-b border-dashed border-gray-300">
            <div class="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mr-3"><i class="fa-solid fa-receipt"></i></div> รายการที่สั่งไปแล้ว
          </h2>
          <div v-if="isHistoryLoading" class="text-center py-12 text-gray-400"><i class="fa-solid fa-circle-notch fa-spin text-4xl"></i></div>
          <div v-else-if="historyItems.length === 0" class="text-center py-12 text-gray-400 font-bold flex flex-col items-center"><i class="fa-regular fa-face-frown-open text-5xl mb-3 opacity-30"></i> ยังไม่มีรายการสั่งอาหาร</div>
          <div v-else class="space-y-4">
            <div v-for="(item, idx) in historyItems" :key="idx" class="flex justify-between items-start pb-4 border-b border-gray-50 last:border-0">
              <div class="flex-1 pr-4">
                <p class="font-black text-gray-800 text-base leading-tight mb-1">{{ item.menu_name }} <span class="text-xs font-bold text-gray-400 ml-1">x{{ item.quantity }}</span></p>
                <span :class="getStatusStyle(item.kitchen_status).class" class="text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider inline-flex items-center"><i :class="getStatusStyle(item.kitchen_status).icon" class="mr-1"></i> {{ getStatusStyle(item.kitchen_status).text }}</span>
              </div>
              <div class="font-black text-gray-800 text-lg">฿{{ Number(item.total_price).toLocaleString() }}</div>
            </div>
            <div class="mt-8 bg-gray-900 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
               <i class="fa-solid fa-coins absolute -bottom-4 -right-2 text-6xl opacity-10"></i>
              <div class="flex justify-between items-center relative z-10"><span class="font-bold text-sm text-gray-300 uppercase tracking-widest">ยอดรวมบิลนี้</span><span class="text-3xl font-black text-primary">฿{{ Number(historyTotal).toLocaleString() }}</span></div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <div v-if="cartCount > 0 && currentTab === 'menu'" class="fixed bottom-24 left-5 right-5 z-[80] animate-[slideUp_0.3s_ease-out]">
      <button @click="showCartSummary = true" class="w-full bg-gray-900 text-white p-4 rounded-2xl shadow-2xl shadow-gray-900/40 flex justify-between items-center active:scale-95 transition-all border border-gray-700">
        <div class="flex items-center gap-4">
          <div class="relative w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-xl text-primary border border-gray-700">
            <i class="fa-solid fa-basket-shopping"></i><div class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-sm animate-bounce">{{ cartCount }}</div>
          </div>
          <div class="text-left"><p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">ตะกร้าของคุณ</p><p class="font-black text-2xl leading-none">฿{{ cartTotal.toLocaleString() }}</p></div>
        </div>
        <div class="bg-primary text-white px-5 py-3 rounded-xl font-black text-sm flex items-center shadow-md">ตรวจสอบ <i class="fa-solid fa-arrow-right ml-2 text-xs"></i></div>
      </button>
    </div>

    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-[72px] z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
      <button @click="currentTab = 'menu'" :class="currentTab === 'menu' ? 'text-primary scale-110' : 'text-gray-400 hover:text-gray-600'" class="flex-1 flex flex-col items-center transition-all duration-200"><i class="fa-solid fa-utensils text-2xl mb-1"></i><span class="text-[10px] font-black uppercase tracking-wider">สั่งอาหาร</span></button>
      <button @click="requestService('ต้องการพนักงาน')" class="flex-1 flex flex-col items-center text-gray-400 hover:text-orange-500 transition-colors group relative">
        <div class="absolute -top-8 bg-white border border-gray-200 shadow-md rounded-full w-14 h-14 flex items-center justify-center group-hover:-translate-y-1 transition-transform"><i class="fa-solid fa-bell text-2xl text-orange-400 group-hover:animate-ring"></i></div>
        <span class="text-[10px] font-black uppercase tracking-wider mt-6">เรียกพนักงาน</span>
      </button>
      <button @click="openHistoryTab" :class="currentTab === 'history' ? 'text-primary scale-110' : 'text-gray-400 hover:text-gray-600'" class="flex-1 flex flex-col items-center transition-all duration-200 relative"><i class="fa-solid fa-receipt text-2xl mb-1"></i><span class="text-[10px] font-black uppercase tracking-wider">เช็คบิล</span><span v-if="historyItems.length > 0" class="absolute top-0 right-1/4 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span></button>
    </nav>

    <div v-if="showCartSummary" class="fixed inset-0 z-[100] flex flex-col justify-end">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="showCartSummary = false"></div>
      <div class="bg-white w-full rounded-t-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] relative z-10 animate-[slideUp_0.3s_ease-out]">
        <div class="p-6 flex justify-between items-center border-b border-gray-100">
          <h2 class="text-2xl font-black text-gray-800 flex items-center"><div class="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mr-3 text-lg"><i class="fa-solid fa-list-check"></i></div>ยืนยันออเดอร์</h2>
          <button @click="showCartSummary = false" class="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center transition-colors"><i class="fa-solid fa-xmark text-lg"></i></button>
        </div>
        <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          <div v-for="item in cart" :key="item.id" class="flex gap-4 bg-white p-4 rounded-2xl border border-gray-100 items-center shadow-sm">
            <div class="flex-1 min-w-0"><h4 class="font-black text-base text-gray-800 mb-1">{{ item.menu_name }}</h4><p class="text-lg font-black text-primary leading-none">฿{{ Number(item.price * item.qty).toLocaleString() }}</p></div>
            <div class="flex items-center gap-1 bg-gray-50 rounded-xl p-1 shrink-0 border border-gray-200">
              <button @click="updateCart(item, -1)" class="w-10 h-10 bg-white text-gray-500 rounded-lg shadow-sm font-black hover:bg-gray-100 transition-colors"><i class="fa-solid fa-minus text-sm"></i></button>
              <span class="font-black text-gray-800 w-8 text-center text-lg">{{ item.qty }}</span>
              <button @click="updateCart(item, 1)" class="w-10 h-10 bg-white text-primary rounded-lg shadow-sm font-black hover:bg-gray-100 transition-colors"><i class="fa-solid fa-plus text-sm"></i></button>
            </div>
          </div>
        </div>
        <div class="p-6 bg-white border-t border-gray-100 pb-10">
          <div class="flex justify-between items-end mb-6 bg-orange-50 p-4 rounded-2xl border border-orange-100">
            <span class="text-orange-600 font-bold uppercase tracking-widest text-xs">ยอดรวมออเดอร์นี้</span>
            <span class="font-black text-4xl text-primary tracking-tight">฿{{ cartTotal.toLocaleString() }}</span>
          </div>
          <button @click="submitOrder" :disabled="isSubmitting" class="w-full bg-gray-900 disabled:bg-gray-300 text-white font-black py-5 rounded-2xl shadow-xl shadow-gray-900/30 active:scale-95 transition-all text-xl flex justify-center items-center gap-3">
            <i v-if="isSubmitting" class="fa-solid fa-circle-notch fa-spin"></i><i v-else class="fa-solid fa-bell-concierge text-primary"></i>
            {{ isSubmitting ? 'กำลังส่งเข้าครัว...' : 'ยืนยันสั่งอาหาร' }}
          </button>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../supabase'
import Swal from 'sweetalert2'

const route = useRoute()
const Toast = Swal.mixin({ toast: true, position: 'top', showConfirmButton: false, timer: 3000, timerProgressBar: true })

const tableId = ref(null)
const tableName = ref('')
const storeSettings = ref({})
const currentTab = ref('menu')
const selectedCategory = ref('')
const menus = ref([])
const cart = ref([])
const historyItems = ref([])
const historyTotal = ref(0)
const isLoading = ref(true)
const isHistoryLoading = ref(false)
const isSubmitting = ref(false)
const showCartSummary = ref(false)
let realtimeChannel = null

const availableCategories = computed(() => [...new Set(menus.value.map(item => item.category))])
const filteredMenus = computed(() => selectedCategory.value ? menus.value.filter(m => m.category === selectedCategory.value) : menus.value)
const cartCount = computed(() => cart.value.reduce((sum, item) => sum + item.qty, 0))
const cartTotal = computed(() => cart.value.reduce((sum, item) => sum + (item.price * item.qty), 0))

const loadInitialData = async () => {
  tableId.value = Number(route.query.table_id)
  tableName.value = route.query.table_name || 'ลูกค้าสั่งเอง'
  const token = route.query.token

  const { data: tableData } = await supabase.from('tables').select('session_token, status').eq('id', tableId.value).single()
  
  if (!tableData || tableData.session_token !== token || tableData.status === 'Available') {
    Swal.fire({ icon: 'error', title: 'QR Code หมดอายุ หรือโต๊ะยังไม่เปิด', text: 'กรุณาแจ้งพนักงานเพื่อเปิดโต๊ะหรือขอ QR Code ใหม่อีกครั้งครับ', confirmButtonColor: '#f97316', allowOutsideClick: false, showConfirmButton: false })
    isLoading.value = false
    return
  }

  const { data: sData } = await supabase.from('settings').select('*')
  if (sData) storeSettings.value = Object.fromEntries(sData.map(item => [item.setting_key, item.setting_value]))

  fetchMenus()
  if (currentTab.value === 'history') openHistoryTab()
}

const fetchMenus = async () => {
  isLoading.value = true
  const { data } = await supabase.from('menus').select('*').eq('status', 'Available')
  if (data) {
    menus.value = data
    if (availableCategories.value.length > 0) selectedCategory.value = availableCategories.value[0] 
  }
  isLoading.value = false
}

const setupRealtime = () => {
  realtimeChannel = supabase.channel(`customer_updates_table_${tableId.value}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'order_details' }, payload => {
       const idx = historyItems.value.findIndex(item => item.id === payload.new.id)
       if (idx !== -1) {
         historyItems.value[idx].kitchen_status = payload.new.kitchen_status
         if(payload.new.kitchen_status === 'Served') {
            Toast.fire({ icon: 'success', title: `เย้! ${payload.new.menu_name} เสิร์ฟแล้วครับ 🍽️` })
         }
       }
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tables', filter: `id=eq.${tableId.value}` }, payload => {
       if (payload.new.status === 'Available' || !payload.new.session_token) {
         Swal.fire({
           icon: 'info',
           title: 'ชำระเงินเรียบร้อยแล้ว!',
           text: 'ขอบคุณที่ใช้บริการครับ โอกาสหน้าเชิญใหม่นะครับ 🙏',
           confirmButtonColor: '#10b981',
           allowOutsideClick: false
         }).then(() => {
           window.location.href = '/customer'
         })
       }
    })
    .subscribe()
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
  } else if (val > 0) cart.value.push({ ...menu, qty: 1 })
}

const submitOrder = async () => {
  if (cart.value.length === 0 || isSubmitting.value || !tableId.value) return
  isSubmitting.value = true

  try {
    const { data: activeOrder } = await supabase.from('orders').select('id, total_amount').eq('table_id', tableId.value).eq('status', 'Open').maybeSingle()
    let orderId;
    if (activeOrder) {
      orderId = activeOrder.id
      await supabase.from('orders').update({ total_amount: Number(activeOrder.total_amount) + cartTotal.value }).eq('id', orderId)
    } else {
      const { data: newOrder, error: insertError } = await supabase.from('orders').insert({ table_id: tableId.value, total_amount: cartTotal.value, status: 'Open' }).select().single()
      if (insertError) throw insertError
      orderId = newOrder.id
      await supabase.from('tables').update({ status: 'Occupied' }).eq('id', tableId.value)
    }

    const details = cart.value.map(item => ({ order_id: orderId, menu_id: item.id, menu_name: item.menu_name, price: item.price, quantity: item.qty, total_price: item.price * item.qty, kitchen_status: 'Pending' }))
    const { error: detailsError } = await supabase.from('order_details').insert(details)
    if (detailsError) throw detailsError
    
    cart.value = []
    showCartSummary.value = false
    Swal.fire({ icon: 'success', title: 'ส่งออเดอร์เข้าครัวแล้ว!', text: 'กรุณารอสักครู่ พนักงานกำลังเตรียมอาหารให้คุณครับ', timer: 3000, showConfirmButton: false, backdrop: `rgba(0,0,0,0.8)` })
    openHistoryTab()
  } catch (error) {
    Swal.fire('ขออภัย', 'ไม่สามารถส่งออเดอร์ได้ กรุณาเรียกพนักงาน', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const openHistoryTab = async () => {
  currentTab.value = 'history'
  if(!tableId.value) return
  isHistoryLoading.value = true
  const { data: order } = await supabase.from('orders').select('id, total_amount').eq('table_id', tableId.value).eq('status', 'Open').maybeSingle()
  
  if (order) {
    const { data: items } = await supabase.from('order_details').select('*').eq('order_id', order.id).order('created_at', { ascending: false })
    historyItems.value = items || []
    historyTotal.value = order.total_amount
  } else { historyItems.value = []; historyTotal.value = 0 }
  isHistoryLoading.value = false
}

const requestService = async (type) => {
  if(!tableId.value) return
  await supabase.from('tables').update({ service_request: type }).eq('id', tableId.value)
  Toast.fire({ icon: 'success', title: 'แจ้งพนักงานให้แล้วครับ 🏃‍♂️' })
}

const getStatusStyle = (status) => {
  switch (status) {
    case 'Pending': return { class: 'text-orange-500 bg-orange-100', icon: 'fa-solid fa-clock', text: 'รอทำ' }
    case 'Cooking': return { class: 'text-blue-600 bg-blue-100 animate-pulse', icon: 'fa-solid fa-fire', text: 'กำลังปรุง' }
    case 'Served': return { class: 'text-green-600 bg-green-100', icon: 'fa-solid fa-check-double', text: 'เสิร์ฟแล้ว' }
    case 'Cancelled': return { class: 'text-red-500 bg-red-100 line-through', icon: 'fa-solid fa-xmark', text: 'ยกเลิก' }
    case 'Voided': return { class: 'text-gray-400 bg-gray-100 line-through', icon: 'fa-solid fa-ban', text: 'คืนเงิน' }
    default: return { class: 'text-gray-500 bg-gray-100', icon: 'fa-solid fa-question', text: status }
  }
}

onMounted(() => { 
  loadInitialData() 
  setupRealtime() 
})

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel) 
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes ring { 0%, 50%, 100% { transform: rotate(0); } 10% { transform: rotate(15deg); } 20% { transform: rotate(-10deg); } 30% { transform: rotate(5deg); } 40% { transform: rotate(-5deg); } }
.animate-ring { animation: ring 1s ease-in-out infinite; }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
</style>