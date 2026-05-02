<template>
  <div class="h-full flex flex-col lg:flex-row overflow-hidden relative">
    
    <div class="flex-1 flex flex-col min-w-0 bg-gray-100">
      <div class="bg-white shadow-sm px-6 py-3 flex gap-4 overflow-x-auto no-scrollbar shrink-0">
        <button @click="selectedCategory = 'All'" :class="['px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all', selectedCategory === 'All' ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">ทั้งหมด</button>
        <button v-for="cat in availableCategories" :key="cat" @click="selectedCategory = cat" :class="['px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all', selectedCategory === cat ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">{{ cat }}</button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 relative">
        <div v-if="isLoadingMenus" class="absolute inset-0 flex flex-col items-center justify-center text-primary">
          <i class="fa-solid fa-circle-notch fa-spin text-4xl mb-2"></i><p class="font-bold">กำลังโหลดเมนู...</p>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          <div v-for="item in filteredMenus" :key="item.id" @click="addToCart(item)" class="bg-white rounded-2xl shadow-sm transition-all overflow-hidden border border-transparent flex flex-col group relative hover:shadow-xl hover:border-primary cursor-pointer active:scale-95">
            <div class="h-32 md:h-36 bg-gray-200 relative overflow-hidden shrink-0 w-full">
              <img v-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400"><i class="fa-solid fa-image text-3xl"></i></div>
              <div class="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-primary shadow-sm z-10">฿{{ item.price }}</div>
            </div>
            <div class="p-3 md:p-4 flex flex-col grow justify-between bg-white min-h-[85px]">
              <h3 class="font-bold text-gray-800 leading-tight mb-1 line-clamp-2 text-sm md:text-base">{{ item.menu_name }}</h3>
              <p class="text-xs text-gray-500">{{ item.category }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full lg:w-[420px] bg-white border-l border-gray-200 flex flex-col shadow-2xl z-10 shrink-0">
      
      <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
        <h2 class="text-xl font-bold flex items-center text-gray-800"><i class="fa-solid fa-clipboard-list mr-3 text-primary"></i> ออเดอร์</h2>
        <button @click="selectedTable = null; cart = []" v-if="selectedTable" class="text-xs text-red-500 font-bold hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"><i class="fa-solid fa-rotate-left mr-1"></i> ยกเลิกโต๊ะ</button>
      </div>
      
      <div class="p-4 border-b border-gray-100 bg-gray-50 flex gap-2">
        <button @click="openTableModal" class="flex-1 bg-white border-2 border-dashed border-gray-300 hover:border-primary hover:bg-orange-50 rounded-xl px-4 py-3 flex items-center justify-between transition-all group">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" :class="selectedTable ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 text-gray-500'">
              <i class="fa-solid fa-chair text-lg"></i>
            </div>
            <div class="text-left">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">โต๊ะที่เลือก</p>
              <p class="font-bold text-gray-800" :class="selectedTable ? 'text-base' : 'text-sm'">{{ selectedTable ? selectedTable.table_name : 'กดเลือกโต๊ะ' }}</p>
            </div>
          </div>
          <i class="fa-solid fa-chevron-right text-gray-300 group-hover:text-primary"></i>
        </button>

        <button @click="generateQR" :disabled="!selectedTable" class="w-16 bg-white border-2 border-dashed border-blue-200 hover:border-blue-500 hover:bg-blue-50 text-blue-500 disabled:opacity-50 disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-300 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 group shrink-0">
          <i class="fa-solid fa-qrcode text-xl group-hover:scale-110 transition-transform"></i>
          <span class="text-[10px] font-bold mt-1 uppercase">QR โต๊ะ</span>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-white relative">
        <div v-if="!selectedTable" class="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-gray-400">
          <i class="fa-solid fa-hand-pointer text-4xl mb-3"></i><p class="font-bold">กรุณาเลือกโต๊ะก่อนสั่งอาหาร</p>
        </div>

        <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400">
          <i class="fa-solid fa-basket-shopping text-4xl mb-3"></i><p class="font-bold">ยังไม่มีรายการใหม่</p>
        </div>

        <div v-else class="space-y-2">
          <div v-for="(item, index) in cart" :key="index" class="flex items-center gap-3 bg-white p-2 rounded-xl border border-orange-200 shadow-sm">
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-sm text-gray-800 truncate">{{ item.menu_name }}</h4>
              <p class="text-sm text-primary font-bold">฿{{ item.price * item.qty }}</p>
            </div>
            <div class="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 px-2 py-1 shrink-0">
              <button @click="updateQty(index, -1)" class="text-gray-500 hover:text-primary w-6 h-6 flex items-center justify-center rounded-md hover:bg-orange-100 transition-colors"><i class="fa-solid fa-minus text-xs"></i></button>
              <span class="font-bold w-4 text-center text-sm text-gray-800">{{ item.qty }}</span>
              <button @click="updateQty(index, 1)" class="text-gray-500 hover:text-primary w-6 h-6 flex items-center justify-center rounded-md hover:bg-orange-100 transition-colors"><i class="fa-solid fa-plus text-xs"></i></button>
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
        <div class="flex justify-between items-end mb-4">
          <span class="text-gray-500 font-medium">ยอดรวมตะกร้า</span>
          <span class="font-black text-3xl text-gray-800 tracking-tight">฿{{ cartTotal.toLocaleString() }}</span>
        </div>
        <button @click="sendOrderToKitchen" :disabled="!selectedTable || cart.length === 0 || isSubmitting" class="w-full bg-orange-500 disabled:bg-gray-300 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/30 transition-all active:scale-95 text-lg flex justify-center items-center gap-2">
          <i v-if="isSubmitting" class="fa-solid fa-circle-notch fa-spin"></i>
          <i v-else class="fa-solid fa-bell-concierge"></i>
          {{ isSubmitting ? 'กำลังส่ง...' : 'ส่งเข้าครัว' }}
        </button>
      </div>
    </div>

    <div v-if="showTableModal" class="absolute inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-10 animate-[fadeIn_0.2s_ease-out]">
      <div class="bg-gray-50 rounded-[2rem] shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden">
        <div class="bg-white p-6 flex justify-between items-center shadow-sm z-10">
          <h2 class="text-2xl font-black text-gray-800 flex items-center"><i class="fa-solid fa-chair text-primary mr-3"></i> เลือกโต๊ะรับออเดอร์</h2>
          <button @click="showTableModal = false" class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-500 text-xl transition-colors"><i class="fa-solid fa-xmark"></i></button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-8">
          <div v-if="isLoadingTables" class="text-center text-gray-400 py-10"><i class="fa-solid fa-circle-notch fa-spin text-4xl"></i></div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            <button v-for="t in tables" :key="t.id" @click="selectTable(t)" :class="['relative p-6 rounded-[2rem] border-2 flex flex-col items-center justify-center transition-all group shadow-sm cursor-pointer active:scale-95 hover:shadow-xl h-48', t.status === 'Available' ? 'bg-white border-green-200 hover:border-green-500' : 'bg-orange-50 border-orange-300 hover:border-orange-500']">
              <div :class="['w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors', t.status === 'Available' ? 'bg-green-50 text-green-500 group-hover:bg-green-600 group-hover:text-white' : 'bg-orange-200 text-orange-600 group-hover:bg-orange-500 group-hover:text-white']">
                <i class="fa-solid fa-utensils text-2xl"></i>
              </div>
              <h3 class="font-black text-lg" :class="t.status === 'Available' ? 'text-gray-800' : 'text-orange-900'">{{ t.table_name }}</h3>
              <div class="mt-2 text-xs font-bold px-3 py-1 rounded-full" :class="t.status === 'Available' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'">
                {{ t.status === 'Available' ? 'ว่าง' : 'มีลูกค้า' }}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import Swal from 'sweetalert2'

// ตัวแปร State
const menus = ref([])
const tables = ref([])
const cart = ref([])
const selectedCategory = ref('All')
const selectedTable = ref(null)

const isLoadingMenus = ref(true)
const isLoadingTables = ref(false)
const isSubmitting = ref(false)
const showTableModal = ref(false)

// Computed Properties
const availableCategories = computed(() => ['All', ...new Set(menus.value.map(item => item.category))])
const filteredMenus = computed(() => selectedCategory.value === 'All' ? menus.value : menus.value.filter(m => m.category === selectedCategory.value))
const cartTotal = computed(() => cart.value.reduce((sum, item) => sum + (item.price * item.qty), 0))

// 📡 ฟังก์ชันดึงข้อมูลจาก Supabase
const loadMenus = async () => {
  isLoadingMenus.value = true
  const { data, error } = await supabase.from('menus').select('*').eq('status', 'Available')
  if (!error && data) menus.value = data
  isLoadingMenus.value = false
}

const loadTables = async () => {
  isLoadingTables.value = true
  const { data, error } = await supabase.from('tables').select('*').order('table_name')
  if (!error && data) tables.value = data
  isLoadingTables.value = false
}

// 🛒 ฟังก์ชันตะกร้า & โต๊ะ
const addToCart = (item) => {
  if(!selectedTable.value) return Swal.fire({ icon: 'warning', title: 'เลือกโต๊ะก่อนสั่งนะครับ', toast: true, position: 'top', timer: 2000, showConfirmButton: false })
  const existing = cart.value.find(c => c.id === item.id)
  if (existing) existing.qty++
  else cart.value.push({ ...item, qty: 1 })
}

const updateQty = (index, val) => {
  cart.value[index].qty += val
  if (cart.value[index].qty <= 0) cart.value.splice(index, 1)
}

const openTableModal = () => {
  loadTables()
  showTableModal.value = true
}

const selectTable = (table) => {
  selectedTable.value = table
  showTableModal.value = false
}

// 🚀 ฐานข้อมูล: ฟังก์ชันบันทึกออเดอร์
const sendOrderToKitchen = async () => {
  if (!selectedTable.value || cart.value.length === 0) return

  isSubmitting.value = true
  try {
    let orderId;

    // 1. ตรวจสอบว่าโต๊ะนี้มีบิล (Order) ที่ยังเปิดอยู่ (Open) หรือไม่
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id, total_amount')
      .eq('table_id', selectedTable.value.id)
      .eq('status', 'Open')
      .maybeSingle() // หา 1 แถว หรือไม่มีเลยก็ได้

    if (existingOrder) {
      orderId = existingOrder.id
      // อัปเดตยอดรวมบิลเดิม
      await supabase.from('orders').update({
        total_amount: Number(existingOrder.total_amount) + cartTotal.value
      }).eq('id', orderId)
    } else {
      // สร้างบิลใหม่
      const { data: newOrder, error: insertOrderError } = await supabase.from('orders').insert({
        table_id: selectedTable.value.id,
        total_amount: cartTotal.value,
        status: 'Open'
      }).select().single()
      
      if (insertOrderError) throw insertOrderError
      orderId = newOrder.id

      // เปลี่ยนสถานะโต๊ะเป็น 'มีลูกค้า' (Occupied)
      await supabase.from('tables').update({ status: 'Occupied' }).eq('id', selectedTable.value.id)
    }

    // 2. บันทึกรายการอาหารเข้าครัว (Order Details)
    const detailsToInsert = cart.value.map(item => ({
      order_id: orderId,
      menu_id: item.id,
      menu_name: item.menu_name,
      price: item.price,
      quantity: item.qty,
      total_price: item.price * item.qty,
      kitchen_status: 'Pending'
    }))

    const { error: detailsError } = await supabase.from('order_details').insert(detailsToInsert)
    if (detailsError) throw detailsError

    // 3. สำเร็จ เคลียร์ตะกร้า
    Swal.fire({ icon: 'success', title: 'ส่งออเดอร์เข้าครัวแล้ว!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
    cart.value = []

  } catch (error) {
    console.error(error)
    Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถส่งออเดอร์ได้', 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 📱 ฟังก์ชันสร้างและแสดง QR Code
const generateQR = () => {
  if (!selectedTable.value) return

  // สร้าง URL สำหรับหน้าลูกค้า (อ้างอิงจาก Domain ปัจจุบัน)
  const baseUrl = window.location.origin
  const customerUrl = `${baseUrl}/customer?table_id=${selectedTable.value.id}&table_name=${encodeURIComponent(selectedTable.value.table_name)}`
  
  // ใช้ API สร้างรูป QR Code
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(customerUrl)}&margin=10`

  const htmlStr = `
    <div class="flex flex-col items-center justify-center p-2">
      <div class="w-full bg-orange-50 rounded-2xl p-4 mb-6 border border-orange-100 flex flex-col items-center justify-center">
        <p class="text-sm font-bold text-orange-500 uppercase tracking-widest mb-1">สั่งอาหาร (Mobile Order)</p>
        <h3 class="text-3xl font-black text-gray-800">${selectedTable.value.table_name}</h3>
        <p class="font-bold mt-1 text-sm text-blue-500">(สแกนเพื่อสั่งอาหาร)</p>
      </div>
      <div class="relative bg-white p-4 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 mb-6 group">
        <img src="${qrImageSrc}" class="w-56 h-56 object-contain rounded-xl mx-auto">
      </div>
      <div class="w-full flex gap-3 mt-4">
        <button id="btn-close-qr" class="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all active:scale-95 text-lg">ปิดหน้าต่าง</button>
      </div>
    </div>
  `

  Swal.fire({
    html: htmlStr,
    showConfirmButton: false,
    width: '450px',
    padding: '2rem',
    didOpen: () => {
      document.getElementById('btn-close-qr').addEventListener('click', () => {
        Swal.close()
      })
    }
  })
}

onMounted(() => {
  loadMenus()
})
</script>