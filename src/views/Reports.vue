<template>
  <div class="h-full flex flex-col bg-gray-50 overflow-hidden relative font-sans">
    
    <div class="bg-white px-6 py-5 border-b border-gray-200 shadow-sm z-10 shrink-0">
      <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 class="text-2xl font-black text-gray-800 flex items-center"><i class="fa-solid fa-chart-line text-primary mr-3"></i> รายงานและสถิติขั้นสูง (Reports)</h2>
          <p class="text-sm font-bold text-gray-400 mt-1">ออกรายงานยอดขายรายวัน/เดือน และพิมพ์เอกสาร A4</p>
        </div>
        
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200 shadow-inner">
            <input type="date" v-model="reportStartDate" class="bg-white px-3 py-2 rounded-lg text-sm font-bold text-gray-700 outline-none border-none shadow-sm cursor-pointer">
            <span class="text-gray-400 font-black">-</span>
            <input type="date" v-model="reportEndDate" class="bg-white px-3 py-2 rounded-lg text-sm font-bold text-gray-700 outline-none border-none shadow-sm cursor-pointer">
          </div>
          <button @click="generateReport" :disabled="isReportLoading" class="bg-primary hover:bg-orange-600 disabled:bg-orange-300 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all active:scale-95 flex items-center gap-2">
            <i class="fa-solid fa-bolt" :class="{'fa-beat-fade': isReportLoading}"></i> ประมวลผล
          </button>
          <button v-if="reportData" @click="printReport" class="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2">
            <i class="fa-solid fa-print"></i> พิมพ์ (A4)
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-6 md:p-8">
      
      <div v-if="isReportLoading" class="h-full flex flex-col items-center justify-center text-primary">
        <i class="fa-solid fa-circle-notch fa-spin text-6xl mb-4"></i>
        <h2 class="text-xl font-black">กำลังดึงข้อมูลระดับ Big Data...</h2>
      </div>

      <div v-else-if="!reportData" class="h-full flex flex-col items-center justify-center text-gray-400">
        <i class="fa-solid fa-chart-column text-6xl mb-4 opacity-50"></i>
        <h2 class="text-xl font-bold">เลือกช่วงวันที่และกด "ประมวลผล" เพื่อดูรายงาน</h2>
      </div>

      <div v-else class="max-w-7xl mx-auto space-y-6 animate-[fadeIn_0.3s_ease-out]">
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
            <i class="fa-solid fa-sack-dollar absolute -bottom-4 -right-4 text-7xl text-blue-50 opacity-50 group-hover:scale-110 transition-transform"></i>
            <p class="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1 relative z-10">ยอดขายสุทธิ (Net Revenue)</p>
            <h3 class="text-3xl font-black text-blue-600 relative z-10 tracking-tight">฿{{ reportData.summary.netRevenue.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</h3>
          </div>
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
            <i class="fa-solid fa-file-invoice absolute -bottom-4 -right-4 text-7xl text-gray-50 opacity-50 group-hover:scale-110 transition-transform"></i>
            <p class="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1 relative z-10">จำนวนบิลทั้งหมด (Total Bills)</p>
            <h3 class="text-3xl font-black text-gray-800 relative z-10 tracking-tight">{{ reportData.summary.totalBills }} <span class="text-sm text-gray-500 font-bold">บิล</span></h3>
          </div>
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
            <i class="fa-solid fa-coins absolute -bottom-4 -right-4 text-7xl text-green-50 opacity-50 group-hover:scale-110 transition-transform"></i>
            <p class="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1 relative z-10">รับเงินสด (Cash)</p>
            <h3 class="text-3xl font-black text-green-500 relative z-10 tracking-tight">฿{{ reportData.summary.cashTotal.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</h3>
          </div>
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
            <i class="fa-solid fa-qrcode absolute -bottom-4 -right-4 text-7xl text-purple-50 opacity-50 group-hover:scale-110 transition-transform"></i>
            <p class="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1 relative z-10">โอนเงิน (QR / Transfer)</p>
            <h3 class="text-3xl font-black text-purple-500 relative z-10 tracking-tight">฿{{ reportData.summary.qrTotal.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</h3>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
          <div class="flex bg-gray-50 border-b border-gray-100 overflow-x-auto no-scrollbar p-2 gap-2">
            <button @click="reportTab = 'summary'" :class="reportTab === 'summary' ? 'bg-white text-primary shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-200 border border-transparent'" class="px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap"><i class="fa-solid fa-chart-pie mr-2"></i> สัดส่วนยอดขาย</button>
            <button @click="reportTab = 'menus'" :class="reportTab === 'menus' ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-200 border border-transparent'" class="px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap"><i class="fa-solid fa-ranking-star mr-2"></i> อันดับเมนูขายดี</button>
            <button @click="reportTab = 'voids'" :class="reportTab === 'voids' ? 'bg-white text-red-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-200 border border-transparent'" class="px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap"><i class="fa-solid fa-ban mr-2"></i> ประวัติการยกเลิกบิล (Voids)</button>
          </div>

          <div class="flex-1 p-6 overflow-y-auto">
            
            <div v-if="reportTab === 'summary'" class="flex flex-col items-center justify-center h-full text-center py-10">
              <div class="w-56 h-56 rounded-full flex items-center justify-center mb-8 relative shadow-md" :style="donutChartStyle">
                <div class="w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center z-10 shadow-inner">
                  <span class="text-xs font-bold text-gray-400 uppercase">ยอดรวม</span>
                  <h3 class="text-2xl font-black text-gray-800">฿{{ reportData.summary.netRevenue.toLocaleString() }}</h3>
                </div>
              </div>
              <div class="flex gap-8">
                <div class="flex items-center gap-3"><span class="w-5 h-5 rounded-full bg-green-500 shadow-sm"></span><span class="font-bold text-gray-600 text-lg">เงินสด ({{ cashPercentage }}%)</span></div>
                <div class="flex items-center gap-3"><span class="w-5 h-5 rounded-full bg-purple-500 shadow-sm"></span><span class="font-bold text-gray-600 text-lg">โอนเงิน ({{ qrPercentage }}%)</span></div>
              </div>
            </div>

            <div v-if="reportTab === 'menus'">
              <table class="w-full text-left border-collapse">
                <thead><tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100"><th class="p-4 font-bold rounded-tl-xl w-16 text-center">อันดับ</th><th class="p-4 font-bold">ชื่อเมนู</th><th class="p-4 font-bold text-center">จำนวนที่ขายได้</th><th class="p-4 font-bold text-right rounded-tr-xl">ยอดขาย (฿)</th></tr></thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-if="reportData.topMenus.length === 0"><td colspan="4" class="text-center py-10 text-gray-400 font-bold">ไม่มีข้อมูลการขายในช่วงเวลานี้</td></tr>
                  <tr v-for="(m, index) in reportData.topMenus" :key="index" class="hover:bg-blue-50/50 transition-colors">
                    <td class="p-4 flex justify-center"><div class="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm" :class="index === 0 ? 'bg-yellow-100 text-yellow-600' : index === 1 ? 'bg-gray-200 text-gray-600' : index === 2 ? 'bg-orange-100 text-orange-600' : 'text-gray-400'">{{ index === 0 ? '🥇1' : index === 1 ? '🥈2' : index === 2 ? '🥉3' : index + 1 }}</div></td>
                    <td class="p-4 font-bold text-gray-800">{{ m.name }}</td>
                    <td class="p-4 text-center font-black text-blue-600">{{ m.qty }} <span class="text-xs font-medium text-gray-400">จาน</span></td>
                    <td class="p-4 text-right font-black text-gray-800">฿{{ m.revenue.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="reportTab === 'voids'">
              <table class="w-full text-left border-collapse">
                <thead><tr class="bg-red-50 text-red-800 text-xs uppercase tracking-wider border-b border-red-100"><th class="p-4 font-bold rounded-tl-xl">วัน-เวลาที่ยกเลิก</th><th class="p-4 font-bold">เลขที่บิล</th><th class="p-4 font-bold text-center">โต๊ะ</th><th class="p-4 font-bold text-right rounded-tr-xl">มูลค่าที่ยกเลิก (฿)</th></tr></thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-if="reportData.voidOrders.length === 0"><td colspan="4" class="text-center py-12 text-green-500 font-black"><i class="fa-solid fa-shield-check text-4xl mb-3 block"></i>ไม่มีการยกเลิกบิลในช่วงเวลานี้ ยอดเยี่ยมมาก!</td></tr>
                  <tr v-for="v in reportData.voidOrders" :key="v.id" class="hover:bg-red-50/30 transition-colors">
                    <td class="p-4 font-bold text-gray-600 text-sm">{{ new Date(v.created_at).toLocaleString('th-TH') }}</td>
                    <td class="p-4 font-mono font-bold text-red-600">#INV-{{ v.id.split('-')[0].toUpperCase() }}</td>
                    <td class="p-4 text-center font-bold text-gray-800">{{ v.tables?.table_name || 'ไม่ระบุ' }}</td>
                    <td class="p-4 text-right font-black text-red-500 text-lg">฿{{ Number(v.total_amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2}) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

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

const myStoreId = ref(null) // 🌟 เก็บ ID ร้านค้า

const getLocalYYYYMMDD = (date = new Date()) => {
  const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const reportStartDate = ref(getLocalYYYYMMDD())
const reportEndDate = ref(getLocalYYYYMMDD())
const isReportLoading = ref(false)
const reportData = ref(null)
const reportTab = ref('summary')
const storeSettings = ref({})

const cashPercentage = computed(() => {
  if (!reportData.value || reportData.value.summary.netRevenue === 0) return 0
  return Math.round((reportData.value.summary.cashTotal / reportData.value.summary.netRevenue) * 100)
})

const qrPercentage = computed(() => {
  if (!reportData.value || reportData.value.summary.netRevenue === 0) return 0
  return 100 - cashPercentage.value
})

const donutChartStyle = computed(() => {
  if (!reportData.value || reportData.value.summary.netRevenue === 0) return { background: '#e5e7eb' }
  return { background: `conic-gradient(#22c55e 0% ${cashPercentage.value}%, #a855f7 ${cashPercentage.value}% 100%)` }
})

const loadSettings = async () => {
  const { data } = await supabase.from('settings').select('*').eq('store_id', myStoreId.value)
  if (data) storeSettings.value = Object.fromEntries(data.map(item => [item.setting_key, item.setting_value]))
}

const generateReport = async () => {
  if (!myStoreId.value) return;
  if (!reportStartDate.value || !reportEndDate.value) { Swal.fire({ icon: 'warning', title: 'แจ้งเตือน', text: 'กรุณาเลือกช่วงวันที่ให้ครบถ้วน' }); return }
  if (reportStartDate.value > reportEndDate.value) { Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: 'วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด' }); return }

  isReportLoading.value = true
  const startOfDay = new Date(`${reportStartDate.value}T00:00:00`).toISOString()
  const endOfDay = new Date(`${reportEndDate.value}T23:59:59.999`).toISOString()

  try {
    // 🌟 ดึงข้อมูลบิลเฉพาะของร้านตัวเองเท่านั้น
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`*, tables(table_name)`)
      .eq('store_id', myStoreId.value)
      .in('status', ['Paid', 'Voided'])
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)

    if (ordersError) throw ordersError

    const paidOrders = ordersData.filter(o => o.status === 'Paid')
    const voidOrders = ordersData.filter(o => o.status === 'Voided')

    let netRevenue = 0; let cashTotal = 0; let qrTotal = 0; let totalDiscount = 0 
    const paidOrderIds = []

    paidOrders.forEach(order => {
      const amt = Number(order.total_amount) || 0
      netRevenue += amt
      if (order.payment_method === 'Cash') cashTotal += amt; else qrTotal += amt
      paidOrderIds.push(order.id)
    })

    let topMenus = []
    if (paidOrderIds.length > 0) {
      const { data: detailsData, error: detailsError } = await supabase
        .from('order_details')
        .select('*')
        .in('order_id', paidOrderIds)
        .eq('store_id', myStoreId.value) // 🌟 กันพลาด ซ้อนด้วย ID ร้าน
        .neq('kitchen_status', 'Cancelled')

      if (detailsError) throw detailsError

      const menuMap = {}
      detailsData.forEach(item => {
        if (!menuMap[item.menu_name]) menuMap[item.menu_name] = { name: item.menu_name, qty: 0, revenue: 0 }
        menuMap[item.menu_name].qty += Number(item.quantity)
        menuMap[item.menu_name].revenue += Number(item.total_price)
      })

      topMenus = Object.values(menuMap).sort((a, b) => b.qty - a.qty)
    }

    reportData.value = {
      period: { start: reportStartDate.value, end: reportEndDate.value },
      summary: { netRevenue, totalBills: paidOrders.length, cashTotal, qrTotal, totalDiscount },
      topMenus,
      voidOrders: voidOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    Swal.fire({ icon: 'success', title: 'สร้างรายงานสำเร็จ!', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 })
  } catch (err) { Swal.fire('ผิดพลาด', 'สร้างรายงานล้มเหลว', 'error') } finally { isReportLoading.value = false }
}

const printReport = () => {
  if (!reportData.value) return
  const printWindow = window.open('', '_blank')
  
  let totalMenuQty = 0; let totalMenuRevenue = 0
  let menusHtml = reportData.value.topMenus.map((m, i) => {
    totalMenuQty += m.qty; totalMenuRevenue += m.revenue
    let rank = (i === 0) ? '🥇 1' : (i === 1) ? '🥈 2' : (i === 2) ? '🥉 3' : (i + 1)
    return `<tr class="table-row"><td class="text-center font-bold">${rank}</td><td class="font-bold">${m.name}</td><td class="text-center bg-light font-bold">${m.qty}</td><td class="text-right font-bold text-primary">฿${m.revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>`
  }).join('')

  if (reportData.value.topMenus.length > 0) {
    menusHtml += `<tr style="background-color: #fff7ed; font-weight: 900; border-top: 2px solid var(--primary);"><td colspan="2" class="text-right text-primary" style="font-size: 13px;">รวมสินค้าขายดีทั้งหมด (Total)</td><td class="text-center text-primary" style="font-size: 14px;">${totalMenuQty}</td><td class="text-right text-primary" style="font-size: 14px;">฿${totalMenuRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>`
  }

  let totalVoidAmount = 0
  let voidsHtml = reportData.value.voidOrders.map(v => {
    let voidTotal = Number(v.total_amount || 0); totalVoidAmount += voidTotal
    return `<tr class="table-row void-row"><td class="text-sm">${new Date(v.created_at).toLocaleString('th-TH')}</td><td class="font-mono font-bold text-red">#INV-${v.id.split('-')[0].toUpperCase()}</td><td class="text-center font-bold">${v.tables?.table_name || 'ไม่ระบุ'}</td><td class="text-right font-bold text-red">฿${voidTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>`
  }).join('')

  if (reportData.value.voidOrders.length > 0) {
    voidsHtml += `<tr style="background-color: #fef2f2; font-weight: 900; border-top: 2px solid var(--red);"><td colspan="3" class="text-right text-red" style="font-size: 13px;">มูลค่ายกเลิกบิลรวม (Total Void)</td><td class="text-right text-red" style="font-size: 14px;">฿${totalVoidAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>`
  }

  const html = `<!DOCTYPE html><html><head><title>Sales Report: ${reportData.value.period.start} to ${reportData.value.period.end}</title><link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;700;900&display=swap" rel="stylesheet"><style>:root { --primary: #f97316; --blue: #3b82f6; --green: #10b981; --red: #ef4444; --dark: #1f2937; --light: #f3f4f6; } @media print { @page { size: landscape; margin: 10mm; } body { padding: 0; } .grid { border-spacing: 12px 0; margin-left: -12px; } } body { font-family: 'Kanit', sans-serif; padding: 20px; color: var(--dark); background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; } .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #e5e7eb; padding-bottom: 15px; } .header h1 { font-size: 24px; font-weight: 900; margin: 0 0 5px 0; color: var(--dark); } .header p { margin: 0; color: #6b7280; font-size: 13px; font-weight: bold; } .section-title { font-size: 15px; font-weight: 900; color: var(--dark); margin: 20px 0 10px 0; border-left: 4px solid var(--primary); padding-left: 8px; background: #fff7ed; display: inline-block; padding-right: 12px; border-radius: 0 6px 6px 0;} .grid { display: table; width: 100%; border-spacing: 12px 0; margin-left: -12px; margin-bottom: 12px; } .col { display: table-cell; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 15px; box-shadow: 0 2px 4px -1px rgba(0,0,0,0.05); width: 33.33%; } .col.half { width: 50%; } .card-title { font-size: 11px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; } .card-value { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; } .text-blue { color: var(--blue); } .text-green { color: var(--green); } .text-red { color: var(--red); } .text-primary { color: var(--primary); } .bg-light { background-color: #f8fafc; } table { width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; } th { background: var(--dark); color: #fff; padding: 8px 10px; font-weight: 700; font-size: 12px; letter-spacing: 0.05em; } td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; } .table-row:last-child td { border-bottom: none; } .table-row:nth-child(even) { background-color: #f9fafb; } .void-table th { background: var(--red); } .void-row td { background-color: #fef2f2; color: #991b1b; } .text-center { text-align: center; } .text-right { text-align: right; } .font-bold { font-weight: 700; } .font-mono { font-family: monospace; } .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; font-weight: bold; }</style></head><body>
      <div class="header"><h1>📊 สรุปยอดขาย (Sales Report)</h1><p><b>ร้าน:</b> ${storeSettings.value.StoreName || 'RM Pro'} | <b>รอบวันที่:</b> ${reportData.value.period.start} ถึง ${reportData.value.period.end}</p></div>
      <div class="section-title">1. สรุปภาพรวม (Executive Summary)</div>
      <div class="grid"><div class="col" style="border-top: 4px solid var(--blue); background: #eff6ff;"><div class="card-title text-blue">ยอดขายสุทธิ (Net)</div><div class="card-value text-blue">฿${reportData.value.summary.netRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</div></div><div class="col" style="border-top: 4px solid var(--dark);"><div class="card-title">จำนวนบิลทั้งหมด</div><div class="card-value">${reportData.value.summary.totalBills} <span style="font-size:13px; color:#6b7280;">บิล</span></div></div><div class="col" style="border-top: 4px solid var(--red); background: #fef2f2;"><div class="card-title text-red">ส่วนลดรวม (Discount)</div><div class="card-value text-red">฿${reportData.value.summary.totalDiscount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div></div></div>
      <div class="grid"><div class="col half" style="border-top: 4px solid var(--green); background: #f0fdf4;"><div class="card-title text-green">ชำระด้วยเงินสด (Cash)</div><div class="card-value text-green">฿${reportData.value.summary.cashTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</div></div><div class="col half" style="border-top: 4px solid #a855f7; background: #faf5ff;"><div class="card-title" style="color: #a855f7;">โอนเงิน (QR/Transfer)</div><div class="card-value" style="color: #a855f7;">฿${reportData.value.summary.qrTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</div></div></div>
      <div class="section-title">2. สินค้าขายดี (Top Sellers)</div>
      <table><thead><tr><th class="text-center" style="width: 10%;">อันดับ</th><th style="width: 50%;">ชื่อเมนู</th><th class="text-center" style="width: 20%;">จำนวน (จาน/แก้ว)</th><th class="text-right" style="width: 20%;">ยอดขาย (฿)</th></tr></thead><tbody>${menusHtml || '<tr><td colspan="4" class="text-center" style="padding: 20px; color:#6b7280; font-weight: bold;">ไม่มีข้อมูลการขายในช่วงเวลานี้</td></tr>'}</tbody></table>
      <div class="section-title" style="border-color: var(--red); color: var(--red); background: #fef2f2;">3. ประวัติบิลถูกยกเลิก (Voided)</div>
      <table class="void-table"><thead><tr><th style="width: 25%;">วัน-เวลาที่ยกเลิก</th><th style="width: 35%;">เลขที่บิล</th><th class="text-center" style="width: 20%;">โต๊ะ</th><th class="text-right" style="width: 20%;">มูลค่า (฿)</th></tr></thead><tbody>${voidsHtml || '<tr><td colspan="4" class="text-center font-bold" style="padding: 20px; color:var(--green); background: #f0fdf4;">ไม่มีการยกเลิกบิลในช่วงเวลานี้ ยอดเยี่ยมมาก! 🎉</td></tr>'}</tbody></table>
      <div class="footer">พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')} | พิมพ์โดยระบบบริหารจัดการร้านอาหาร RM Pro</div>
      <script>window.onload = function() { setTimeout(function(){ window.print(); }, 800); }<\/script>
    </body></html>`
  printWindow.document.write(html)
  printWindow.document.close()
}

onMounted(() => {
  const savedUser = JSON.parse(localStorage.getItem('rmpro_user'))
  if (savedUser && savedUser.store_id) {
    myStoreId.value = savedUser.store_id
    loadSettings()
    generateReport()
  }
})
</script>

<style scoped> .no-scrollbar::-webkit-scrollbar { display: none; } </style>