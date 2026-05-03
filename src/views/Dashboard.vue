<template>
  <div class="h-full flex flex-col bg-gray-50 overflow-y-auto relative font-sans text-gray-800">
    
    <div class="bg-white border-b border-gray-200 px-6 py-5 shadow-sm shrink-0 flex justify-between items-center z-10 sticky top-0">
      <div>
        <h2 class="text-2xl font-black text-gray-800 flex items-center">
          <i class="fa-solid fa-chart-pie mr-3 text-primary"></i> ภาพรวมสถิติร้าน (Dashboard)
        </h2>
        <p class="text-gray-500 mt-1 text-sm font-medium">สรุปยอดขาย การเติบโต และช่วงเวลาทอง</p>
      </div>
      <button @click="loadDashboard" class="w-11 h-11 bg-gray-100 text-gray-600 hover:bg-gray-800 hover:text-white rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-sm">
        <i class="fa-solid fa-rotate-right text-lg" :class="{'fa-spin text-white': isDashLoading}"></i>
      </button>
    </div>

    <div class="p-6 max-w-7xl mx-auto w-full space-y-6 relative">
      
      <div v-if="isDashLoading" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm h-screen rounded-3xl">
        <div class="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-4">
          <i class="fa-solid fa-circle-notch fa-spin text-4xl text-primary"></i>
        </div>
        <p class="font-black text-gray-800 text-lg">กำลังประมวลผลข้อมูลระดับ Big Data...</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 animate-[fadeIn_0.3s_ease-out]">
        
        <div class="bg-gradient-to-br from-[#22c55e] to-[#15803d] rounded-3xl p-6 text-white shadow-lg shadow-green-500/30 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <i class="fa-solid fa-coins absolute -bottom-4 -right-4 text-7xl text-white opacity-20 group-hover:scale-110 transition-transform duration-500"></i>
          <div class="flex justify-between items-start relative z-10">
            <p class="text-green-100 font-bold mb-2 uppercase tracking-widest text-xs">ยอดขายวันนี้ (Today)</p>
            <div class="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-black flex items-center shadow-sm" :class="dashStats.growthPercent >= 0 ? 'text-green-50' : 'text-red-100 bg-red-500/30'">
              <i class="fa-solid mr-1" :class="dashStats.growthPercent >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'"></i> 
              {{ dashStats.growthPercent >= 0 ? '+' : '' }}{{ (dashStats.growthPercent || 0).toFixed(1) }}%
            </div>
          </div>
          <h3 class="text-4xl font-black relative z-10 tracking-tight mt-2">฿{{ dashStats.todayRevenue.toLocaleString() }}</h3>
          <p class="text-green-100 text-[10px] mt-2 relative z-10 font-medium">เทียบกับเมื่อวาน (฿{{ dashStats.yesterdayRevenue.toLocaleString() }})</p>
        </div>

        <div class="bg-gradient-to-br from-[#a855f7] to-[#7e22ce] rounded-3xl p-6 text-white shadow-lg shadow-purple-500/30 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <i class="fa-solid fa-receipt absolute -bottom-4 -right-4 text-7xl text-white opacity-20 group-hover:scale-110 transition-transform duration-500"></i>
          <p class="text-purple-100 font-bold mb-2 uppercase tracking-widest text-xs relative z-10">ยอดใช้จ่ายเฉลี่ย/บิล (AOV)</p>
          <h3 class="text-4xl font-black relative z-10 tracking-tight mt-2">฿{{ Math.round(dashStats.todayAOV).toLocaleString() }}</h3>
          <p class="text-purple-100 text-[10px] mt-2 relative z-10 font-medium">คำนวณจาก {{ dashStats.todayBills }} บิลของวันนี้</p>
        </div>

        <div class="bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] rounded-3xl p-6 text-white shadow-lg shadow-blue-500/30 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <i class="fa-solid fa-sack-dollar absolute -bottom-4 -right-4 text-7xl text-white opacity-20 group-hover:scale-110 transition-transform duration-500"></i>
          <p class="text-blue-100 font-bold mb-2 uppercase tracking-widest text-xs relative z-10">ยอดขายสะสม (Total)</p>
          <h3 class="text-4xl font-black relative z-10 tracking-tight mt-2">฿{{ dashStats.totalRevenue.toLocaleString() }}</h3>
          <p class="text-blue-100 text-[10px] mt-2 relative z-10 font-medium">บิลที่ปิดแล้วทั้งหมด {{ dashStats.totalBills }} บิล</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-[fadeIn_0.5s_ease-out]">
        <div class="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col h-[380px]">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <h3 class="text-lg font-black text-gray-800"><i class="fa-solid fa-chart-area text-blue-500 mr-2"></i> แนวโน้มยอดขาย</h3>
            <div class="flex items-center gap-2">
              <div class="bg-gray-100 p-1 rounded-xl flex text-sm font-bold">
                <button @click="chartMode = 'daily'" :class="chartMode === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'" class="px-4 py-1.5 rounded-lg transition-all">14 วันล่าสุด</button>
                <button @click="chartMode = 'monthly'" :class="chartMode === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'" class="px-4 py-1.5 rounded-lg transition-all">รายเดือน</button>
              </div>
              <select v-if="chartMode === 'monthly' && dashStats.years.length > 0" v-model="selectedYear" class="bg-gray-100 border-none outline-none text-sm font-bold text-gray-700 px-3 py-2 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors">
                <option v-for="year in dashStats.years" :key="year" :value="year">ปี {{ year }}</option>
              </select>
            </div>
          </div>
          <div class="flex-1 relative w-full h-full"><canvas ref="revenueCanvas"></canvas></div>
        </div>

        <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col h-[380px]">
          <h3 class="text-lg font-black text-gray-800 mb-2"><i class="fa-solid fa-money-bill-transfer text-purple-500 mr-2"></i> สัดส่วนช่องทางชำระเงิน</h3>
          <p class="text-xs text-gray-400 font-bold mb-4 text-center">Cash vs QR Code</p>
          <div class="flex-1 relative w-full h-full flex justify-center pb-4"><canvas ref="paymentCanvas"></canvas></div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-[fadeIn_0.7s_ease-out]">
        
        <div class="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col h-[400px]">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-black text-gray-800"><i class="fa-solid fa-clock text-orange-500 mr-2"></i> ช่วงเวลาทอง (Peak Hours)</h3>
            <select v-model="peakDayFilter" class="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl text-xs font-bold border border-orange-100 outline-none cursor-pointer hover:bg-orange-100 transition-colors shadow-sm">
              <option value="All">รวมทุกวัน</option>
              <option value="1">วันจันทร์</option>
              <option value="2">วันอังคาร</option>
              <option value="3">วันพุธ</option>
              <option value="4">วันพฤหัสบดี</option>
              <option value="5">วันศุกร์</option>
              <option value="6">วันเสาร์</option>
              <option value="0">วันอาทิตย์</option>
            </select>
          </div>
          <div class="flex-1 relative w-full h-full"><canvas ref="peakCanvas"></canvas></div>
        </div>

        <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-[400px] overflow-hidden flex flex-col">
          <h3 class="text-lg font-black text-gray-800 mb-4 flex items-center"><i class="fa-solid fa-medal text-yellow-500 mr-2 text-xl"></i> 5 อันดับเมนูขายดี</h3>
          
          <div v-if="dashStats.topMenus.length === 0" class="flex-1 flex flex-col items-center justify-center text-gray-400 font-medium">
            <i class="fa-solid fa-box-open text-4xl mb-3"></i><p>ยังไม่มีข้อมูลการขาย</p>
          </div>

          <div v-else class="space-y-3 overflow-y-auto pr-2 no-scrollbar flex-1">
            <div v-for="(menu, index) in dashStats.topMenus" :key="index" class="flex items-center group bg-gray-50 p-3 rounded-2xl border border-gray-100 hover:border-orange-200 transition-colors">
              <div class="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-lg shadow-sm" 
                   :class="index === 0 ? 'bg-yellow-400 text-white' : index === 1 ? 'bg-gray-300 text-white' : index === 2 ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-500'">
                #{{ index + 1 }}
              </div>
              <div class="flex-1 min-w-0 ml-3">
                <h4 class="font-bold text-gray-800 truncate text-sm">{{ menu.name }}</h4>
                <p class="text-[11px] text-gray-500 font-medium mt-0.5">ยอดขาย: <span class="text-green-600 font-bold">฿{{ menu.revenue.toLocaleString() }}</span></p>
              </div>
              <div class="font-black text-lg text-primary shrink-0 ml-2 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">{{ menu.qty }}<span class="text-[10px] text-orange-400 font-bold ml-1">จาน</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { supabase } from '../supabase'
import Chart from 'chart.js/auto'
import Swal from 'sweetalert2'

// ตั้งค่าฟอนต์มาตรฐานให้กราฟทั้งหมด
Chart.defaults.font.family = "'Kanit', sans-serif"

// DOM Elements สำหรับวาดกราฟ
const revenueCanvas = ref(null)
const paymentCanvas = ref(null)
const peakCanvas = ref(null)

// ตัวแปรเก็บกราฟ (เอาไว้ทำลายทิ้งเวลาวาดใหม่)
let myRevenueChart = null
let myPaymentChart = null
let myPeakChart = null

// State
const isDashLoading = ref(true)
const chartMode = ref('daily')
const selectedYear = ref(new Date().getFullYear().toString())
const peakDayFilter = ref('All')

const dashStats = ref({
  totalRevenue: 0, todayRevenue: 0, yesterdayRevenue: 0, growthPercent: 0, 
  todayAOV: 0, totalBills: 0, todayBills: 0,
  topMenus: [], paymentStats: { Cash: 0, QR: 0 },
  hourlyStats: { "All": {} }, daily: {}, monthly: {}, years: []
})

// จับตาดูการเปลี่ยนโหมด แล้ววาดกราฟใหม่
watch([chartMode, selectedYear, peakDayFilter], () => {
  nextTick(() => renderCharts())
})

// 📡 ประมวลผลข้อมูล Data อัจฉริยะ 
const loadDashboard = async () => {
  isDashLoading.value = true
  try {
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const startOfYesterday = new Date(startOfToday)
    startOfYesterday.setDate(startOfYesterday.getDate() - 1)

    // รีเซ็ตค่า
    let stats = {
      totalRevenue: 0, todayRevenue: 0, yesterdayRevenue: 0,
      totalBills: 0, todayBills: 0,
      paymentStats: { Cash: 0, QR: 0 },
      hourlyStats: { "All": {} }, daily: {}, monthly: {}, years: new Set()
    }

    const paidOrderIds = []

    // 1. ดึงบิลที่จ่ายแล้วทั้งหมด
    const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*').eq('status', 'Paid')
    if (ordersError) throw ordersError

    // คำนวณภาพรวม และเตรียม Data กราฟ
    ordersData.forEach(o => {
      const date = new Date(o.created_at)
      const amt = Number(o.total_amount) || 0
      
      stats.totalRevenue += amt
      stats.totalBills++
      paidOrderIds.push(o.id)

      // คำนวณยอดวันนี้/เมื่อวาน
      if (date >= startOfToday) { 
        stats.todayRevenue += amt; stats.todayBills++ 
      } else if (date >= startOfYesterday && date < startOfToday) { 
        stats.yesterdayRevenue += amt 
      }

      // สัดส่วนช่องทาง
      if (o.payment_method === 'Cash') stats.paymentStats.Cash += amt
      else stats.paymentStats.QR += amt

      // จัดกลุ่มรายวัน (Daily) - YYYY-MM-DD
      const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
      stats.daily[dateStr] = (stats.daily[dateStr] || 0) + amt

      // จัดกลุ่มรายเดือน (Monthly) - YYYY -> MM
      const yearStr = String(date.getFullYear())
      const monthStr = String(date.getMonth()+1).padStart(2,'0')
      stats.years.add(yearStr)
      if (!stats.monthly[yearStr]) stats.monthly[yearStr] = {}
      stats.monthly[yearStr][monthStr] = (stats.monthly[yearStr][monthStr] || 0) + amt

      // จัดกลุ่มเวลาทอง (Hourly)
      const dayOfWeek = String(date.getDay()) // 0=Sun, 1=Mon...
      const hour = String(date.getHours()).padStart(2,'0')
      
      stats.hourlyStats['All'][hour] = (stats.hourlyStats['All'][hour] || 0) + 1
      if (!stats.hourlyStats[dayOfWeek]) stats.hourlyStats[dayOfWeek] = {}
      stats.hourlyStats[dayOfWeek][hour] = (stats.hourlyStats[dayOfWeek][hour] || 0) + 1
    })

    // คำนวณ AOV & Growth %
    stats.todayAOV = stats.todayBills > 0 ? (stats.todayRevenue / stats.todayBills) : 0
    stats.growthPercent = stats.yesterdayRevenue > 0 
      ? ((stats.todayRevenue - stats.yesterdayRevenue) / stats.yesterdayRevenue) * 100 
      : (stats.todayRevenue > 0 ? 100 : 0)

    // แปลง Set เป็น Array เรียงปี
    stats.years = Array.from(stats.years).sort((a,b) => b - a)
    if (!stats.years.includes(selectedYear.value) && stats.years.length > 0) {
      selectedYear.value = stats.years[0]
    }

    // 2. ดึง Order Details เฉพาะบิลที่ Paid เพื่อหา 5 อันดับแรก
    let topMenus = []
    if (paidOrderIds.length > 0) {
      const { data: detailsData } = await supabase.from('order_details').select('*').in('order_id', paidOrderIds).neq('kitchen_status', 'Cancelled')
      
      const menuMap = {}
      if(detailsData) {
        detailsData.forEach(item => {
          if (!menuMap[item.menu_name]) menuMap[item.menu_name] = { name: item.menu_name, qty: 0, revenue: 0 }
          menuMap[item.menu_name].qty += Number(item.quantity)
          menuMap[item.menu_name].revenue += Number(item.total_price)
        })
      }
      topMenus = Object.values(menuMap).sort((a, b) => b.qty - a.qty).slice(0, 5) // เอาแค่ Top 5
    }

    stats.topMenus = topMenus
    dashStats.value = stats

    // วาดกราฟ
    nextTick(() => renderCharts())

  } catch (err) {
    Swal.fire('ผิดพลาด', 'โหลดข้อมูลล้มเหลว', 'error')
  } finally {
    isDashLoading.value = false
  }
}

// 🎨 ฟังก์ชันวาดกราฟ Chart.js สุดพรีเมียม
const renderCharts = () => {
  if (myRevenueChart) myRevenueChart.destroy()
  if (myPaymentChart) myPaymentChart.destroy()
  if (myPeakChart) myPeakChart.destroy()

  const ctxRev = revenueCanvas.value?.getContext('2d')
  const ctxPay = paymentCanvas.value?.getContext('2d')
  const ctxPeak = peakCanvas.value?.getContext('2d')

  if (!ctxRev || !ctxPay || !ctxPeak) return

  // 📈 กราฟแนวโน้มยอดขาย (Line Chart)
  let labelsRev = [], dataRev = []
  if (chartMode.value === 'daily') {
    for (let i = 13; i >= 0; i--) {
      let d = new Date()
      d.setDate(d.getDate() - i)
      let yy = d.getFullYear(), mm = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0')
      labelsRev.push(`${dd}/${mm}`)
      dataRev.push(dashStats.value.daily[`${yy}-${mm}-${dd}`] || 0)
    }
  } else {
    labelsRev = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
    let yearData = dashStats.value.monthly[selectedYear.value] || {}
    for (let i = 1; i <= 12; i++) dataRev.push(yearData[String(i).padStart(2,'0')] || 0)
  }

  let gradRev = ctxRev.createLinearGradient(0, 0, 0, 300)
  gradRev.addColorStop(0, 'rgba(59, 130, 246, 0.5)')
  gradRev.addColorStop(1, 'rgba(59, 130, 246, 0)')

  myRevenueChart = new Chart(ctxRev, {
    type: 'line',
    data: { 
      labels: labelsRev, 
      datasets: [{ data: dataRev, borderColor: '#3b82f6', backgroundColor: gradRev, borderWidth: 3, fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 6 }] 
    },
    options: { 
      responsive: true, maintainAspectRatio: false, 
      plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(31,41,55,0.9)', padding: 12, cornerRadius: 8, callbacks: { label: (ctx) => ' ฿' + ctx.parsed.y.toLocaleString() } } },
      scales: { y: { beginAtZero: true, grid: { borderDash: [4, 4], color: '#f3f4f6' }, border: { display: false } }, x: { grid: { display: false }, border: { display: false } } }
    }
  })

  // 🍩 กราฟช่องทางชำระเงิน (Doughnut Chart)
  myPaymentChart = new Chart(ctxPay, {
    type: 'doughnut',
    data: { 
      labels: ['เงินสด (Cash)', 'โอนเงิน (QR)'], 
      datasets: [{ data: [dashStats.value.paymentStats.Cash || 0, dashStats.value.paymentStats.QR || 0], backgroundColor: ['#22c55e', '#a855f7'], borderWidth: 0, hoverOffset: 5 }] 
    },
    options: { 
      responsive: true, maintainAspectRatio: false, cutout: '75%', 
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }, tooltip: { backgroundColor: 'rgba(31,41,55,0.9)', callbacks: { label: (ctx) => ' ฿' + ctx.parsed.toLocaleString() } } }
    }
  })

  // 📊 กราฟแท่งช่วงเวลาทอง (Bar Chart)
  let labelsPeak = [], dataPeak = []
  let selectedHourlyStats = dashStats.value.hourlyStats[peakDayFilter.value] || {}
  
  for(let i = 0; i < 24; i++) {
    let h = i.toString().padStart(2, '0')
    labelsPeak.push(h + ':00')
    dataPeak.push(selectedHourlyStats[h] || 0)
  }

  let gradPeak = ctxPeak.createLinearGradient(0, 0, 0, 300)
  gradPeak.addColorStop(0, 'rgba(249, 115, 22, 0.8)')
  gradPeak.addColorStop(1, 'rgba(249, 115, 22, 0.1)')

  myPeakChart = new Chart(ctxPeak, {
    type: 'bar',
    data: { 
      labels: labelsPeak, 
      datasets: [{ data: dataPeak, backgroundColor: gradPeak, borderRadius: { topLeft: 6, topRight: 6 } }] 
    },
    options: { 
      responsive: true, maintainAspectRatio: false, 
      plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(31,41,55,0.9)', padding: 12, callbacks: { title: (ctx) => 'เวลา: ' + ctx[0].label, label: (ctx) => ctx.parsed.y + ' บิล' } } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { borderDash: [4, 4], color: '#f3f4f6' }, border: { display: false } }, x: { grid: { display: false }, border: { display: false }, ticks: { maxRotation: 45, minRotation: 45, font: { size: 10 } } } }
    }
  })
}

onMounted(() => {
  loadDashboard()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>