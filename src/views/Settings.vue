<template>
  <div class="h-full flex flex-col bg-gray-50 overflow-hidden relative font-sans text-gray-800">
    
    <div class="bg-white px-6 py-5 border-b border-gray-200 shadow-sm z-10 shrink-0">
      <h2 class="text-2xl font-black text-gray-800 flex items-center"><i class="fa-solid fa-cogs text-primary mr-3"></i> ตั้งค่าและจัดการระบบ (Settings)</h2>
      <div class="flex gap-3 mt-5 overflow-x-auto no-scrollbar pb-1">
        <button @click="settingTab = 'menus'" :class="['px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap border-2', settingTab === 'menus' ? 'bg-gray-800 text-white border-gray-800 shadow-lg' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300']"><i class="fa-solid fa-burger mr-2"></i> เมนูอาหาร</button>
        <button @click="settingTab = 'inventory'" :class="['px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap border-2', settingTab === 'inventory' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300']"><i class="fa-solid fa-boxes-stacked mr-2"></i> คลังสินค้า</button>
        <button @click="settingTab = 'members'" :class="['px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap border-2', settingTab === 'members' ? 'bg-yellow-500 text-white border-yellow-500 shadow-lg shadow-yellow-500/30' : 'bg-white text-gray-500 border-gray-200 hover:border-yellow-300']"><i class="fa-solid fa-crown mr-2"></i> สมาชิกลูกค้า</button>
        <button @click="settingTab = 'tables'" :class="['px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap border-2', settingTab === 'tables' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/30' : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-300']"><i class="fa-solid fa-chair mr-2"></i> โต๊ะ</button>
        <button @click="settingTab = 'store'" :class="['px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap border-2', settingTab === 'store' ? 'bg-[#1a1a2e] text-white border-[#1a1a2e] shadow-lg' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400']"><i class="fa-solid fa-store mr-2"></i> ข้อมูลร้าน</button>
        <button @click="settingTab = 'users'" :class="['px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap border-2', settingTab === 'users' ? 'bg-[#1a1a2e] text-white border-[#1a1a2e] shadow-lg' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400']"><i class="fa-solid fa-users mr-2"></i> ผู้ใช้งาน</button>
        <button @click="settingTab = 'options'" :class="['px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap border-2', settingTab === 'options' ? 'bg-[#1a1a2e] text-white border-[#1a1a2e] shadow-lg' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400']"><i class="fa-solid fa-tags mr-2"></i> ตัวเลือก</button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-6 md:p-8 relative">
      <div v-if="isLoading" class="absolute inset-0 z-50 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
        <i class="fa-solid fa-circle-notch fa-spin text-5xl text-primary"></i>
      </div>

      <div v-if="settingTab === 'menus'" class="animate-[fadeIn_0.3s_ease-out] flex flex-col h-full">
        <div class="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6 shrink-0">
          <h3 class="text-xl font-black text-gray-800"><i class="fa-solid fa-burger text-primary mr-2"></i> จัดการเมนูอาหาร ({{ filteredMenus.length }})</h3>
          <div class="flex flex-wrap items-center gap-3">
            <div class="relative"><i class="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i><input v-model="searchMenuQuery" type="text" placeholder="ค้นหาชื่อเมนู..." class="pl-10 pr-4 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl outline-none focus:border-primary shadow-sm w-48 lg:w-64 transition-all"></div>
            <select v-model="filterMenuCategory" class="bg-white border border-gray-200 text-gray-600 font-bold px-4 py-2.5 rounded-xl outline-none focus:border-primary shadow-sm cursor-pointer">
              <option value="All">ทุกหมวดหมู่</option>
              <option v-for="cat in categoryOptions" :key="cat.id" :value="cat.option_value">{{ cat.option_value }}</option>
            </select>
            <button @click="openMenuModal('add')" class="bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all active:scale-95"><i class="fa-solid fa-plus mr-2"></i> เพิ่มเมนูใหม่</button>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
          <div class="flex-1 overflow-y-auto">
            <table class="w-full text-left border-collapse">
              <thead><tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100 sticky top-0 z-10"><th class="p-4 font-bold">รูปภาพ</th><th class="p-4 font-bold">ชื่อเมนู</th><th class="p-4 font-bold">หมวดหมู่</th><th class="p-4 font-bold text-center">ผูกสต๊อกคลัง</th><th class="p-4 font-bold text-right">ราคา (฿)</th><th class="p-4 font-bold text-center">สถานะ</th><th class="p-4 font-bold text-center">จัดการ</th></tr></thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-if="filteredMenus.length === 0"><td colspan="7" class="text-center py-10 text-gray-400 font-bold">ไม่พบเมนูที่ค้นหา</td></tr>
                <tr v-for="menu in paginatedMenus" :key="menu.id" class="hover:bg-gray-50 transition-colors">
                  <td class="p-4"><img v-if="menu.image_url" :src="menu.image_url" class="w-12 h-12 rounded-lg object-cover border border-gray-200"><div v-else class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"><i class="fa-solid fa-image"></i></div></td>
                  <td class="p-4 font-bold text-gray-800">{{ menu.menu_name }}</td>
                  <td class="p-4 text-sm text-gray-500 font-medium">{{ menu.category }}</td>
                  <td class="p-4 text-center">
                    <span v-if="menu.inventory_id" class="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full font-bold"><i class="fa-solid fa-link mr-1"></i> ผูกแล้ว</span>
                    <span v-else class="text-[10px] text-gray-400">-</span>
                  </td>
                  <td class="p-4 font-black text-primary text-right text-lg">{{ Number(menu.price).toLocaleString() }}</td>
                  <td class="p-4 text-center"><span :class="['px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider', menu.status === 'Available' ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-red-100 text-red-600 border border-red-200']">{{ menu.status === 'Available' ? 'พร้อมขาย' : 'ของหมด' }}</span></td>
                  <td class="p-4 text-center space-x-2"><button @click="openMenuModal('edit', menu)" class="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-500 hover:text-white transition-colors"><i class="fa-solid fa-pen"></i></button><button @click="deleteMenu(menu)" class="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white transition-colors"><i class="fa-solid fa-trash"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0"><span class="text-sm text-gray-500 font-bold">หน้า {{ currentPageMenu }} จาก {{ totalMenuPages }}</span><div class="flex gap-2"><button @click="currentPageMenu--" :disabled="currentPageMenu === 1" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50">ก่อนหน้า</button><button @click="currentPageMenu++" :disabled="currentPageMenu === totalMenuPages" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50">ถัดไป</button></div></div>
        </div>
      </div>

      <div v-if="settingTab === 'inventory'" class="animate-[fadeIn_0.3s_ease-out] flex flex-col h-full max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-6 shrink-0"><h3 class="text-xl font-black text-gray-800"><i class="fa-solid fa-boxes-stacked text-blue-600 mr-2"></i> คลังสินค้าและวัตถุดิบ ({{ inventoryList.length }})</h3><div class="flex items-center gap-3"><div class="relative"><i class="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i><input v-model="searchInventoryQuery" type="text" placeholder="ค้นหาสินค้า..." class="pl-10 pr-4 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl outline-none focus:border-blue-500 shadow-sm w-48 md:w-64 transition-all"></div><button @click="showLogModal = true" class="bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-95"><i class="fa-solid fa-clock-rotate-left mr-2"></i> ประวัติ Log</button><button @click="openInventoryModal('add')" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95"><i class="fa-solid fa-plus mr-2"></i> เพิ่มสินค้า</button></div></div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
          <div class="flex-1 overflow-y-auto">
            <table class="w-full text-left border-collapse">
              <thead><tr class="bg-blue-50 text-blue-800 text-xs uppercase tracking-wider border-b border-blue-100 sticky top-0 z-10"><th class="p-4 font-bold">ชื่อสินค้า / วัตถุดิบ</th><th class="p-4 font-bold text-center">คงเหลือ (จำนวน)</th><th class="p-4 font-bold text-center">แจ้งเตือน (Low Alert)</th><th class="p-4 font-bold text-center">จัดการ</th></tr></thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-if="paginatedInventory.length === 0"><td colspan="4" class="text-center py-10 text-gray-400 font-bold">ไม่พบข้อมูลคลังสินค้า</td></tr>
                <tr v-for="inv in paginatedInventory" :key="inv.id" class="hover:bg-blue-50/30 transition-colors">
                  <td class="p-4 font-bold text-gray-800">{{ inv.item_name }} <span class="text-[10px] font-mono text-gray-400 ml-2">ID: {{ inv.id }}</span></td>
                  <td class="p-4 text-center"><span :class="['px-3 py-1 rounded-lg font-black text-sm border', Number(inv.stock_qty) <= Number(inv.low_alert) ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-green-50 text-green-700 border-green-200']">{{ inv.stock_qty }} {{ inv.unit }}</span><p v-if="Number(inv.stock_qty) <= Number(inv.low_alert)" class="text-[10px] text-red-500 font-bold mt-1"><i class="fa-solid fa-triangle-exclamation"></i> ใกล้หมด!</p></td>
                  <td class="p-4 text-center text-gray-500 font-bold">{{ inv.low_alert }} {{ inv.unit }}</td>
                  <td class="p-4 text-center space-x-2"><button @click="openAddStockModal(inv)" class="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-colors" title="เติมสต๊อก"><i class="fa-solid fa-boxes-packing"></i></button><button @click="openInventoryModal('edit', inv)" class="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-600 hover:text-white transition-colors" title="แก้ไขข้อมูล"><i class="fa-solid fa-pen"></i></button><button @click="deleteInventory(inv)" class="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-colors" title="ลบ"><i class="fa-solid fa-trash"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0"><span class="text-sm text-gray-500 font-bold">หน้า {{ currentPageInv }} จาก {{ totalInvPages }}</span><div class="flex gap-2"><button @click="currentPageInv--" :disabled="currentPageInv === 1" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50">ก่อนหน้า</button><button @click="currentPageInv++" :disabled="currentPageInv === totalInvPages" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50">ถัดไป</button></div></div>
        </div>
      </div>

      <div v-if="settingTab === 'members'" class="animate-[fadeIn_0.3s_ease-out] flex flex-col h-full max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-6 shrink-0"><h3 class="text-xl font-black text-gray-800"><i class="fa-solid fa-crown text-yellow-500 mr-2"></i> รายชื่อสมาชิกลูกค้า ({{ membersList.length }})</h3><div class="flex items-center gap-3"><div class="relative"><i class="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i><input v-model="searchMemberQuery" type="text" placeholder="ค้นหาเบอร์ หรือ ชื่อ..." class="pl-10 pr-4 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl outline-none focus:border-yellow-500 shadow-sm w-56 transition-all"></div><button @click="openMemberModal('add')" class="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-yellow-500/30 transition-all active:scale-95"><i class="fa-solid fa-user-plus mr-2"></i> เพิ่มสมาชิก</button></div></div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden"><div class="flex-1 overflow-y-auto"><table class="w-full text-left border-collapse"><thead><tr class="bg-yellow-50 text-yellow-800 text-xs uppercase tracking-wider border-b border-yellow-100 sticky top-0 z-10"><th class="p-4 font-bold">เบอร์โทร/ชื่อ</th><th class="p-4 font-bold text-center">ระดับ</th><th class="p-4 font-bold text-right">แต้มสะสม</th><th class="p-4 font-bold text-center">วันหมดอายุสมาชิก</th><th class="p-4 font-bold text-center">จัดการ</th></tr></thead><tbody class="divide-y divide-gray-50"><tr v-if="paginatedMembers.length === 0"><td colspan="5" class="text-center py-10 text-gray-400 font-bold">ไม่พบข้อมูลสมาชิก</td></tr><tr v-for="m in paginatedMembers" :key="m.phone" class="hover:bg-yellow-50/30 transition-colors"><td class="p-4"><div class="font-black text-gray-800 text-lg tracking-wider">{{ m.phone }}</div><div class="font-bold text-gray-500 text-sm mt-0.5">{{ m.name }}</div></td><td class="p-4 text-center"><span v-if="m.tier === 'Gold'" class="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-[10px] font-black rounded-lg shadow-sm"><i class="fa-solid fa-crown mr-1"></i> GOLD</span><span v-else-if="m.tier === 'Silver'" class="px-3 py-1 bg-gradient-to-r from-gray-400 to-gray-600 text-white text-[10px] font-black rounded-lg shadow-sm"><i class="fa-solid fa-medal mr-1"></i> SILVER</span><span v-else class="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg border border-gray-200">MEMBER</span></td><td class="p-4 font-black text-blue-600 text-xl text-right">{{ Number(m.points).toLocaleString() }} <div class="text-[10px] font-bold text-gray-400 mt-1">หมดอายุ: {{ formatDate(m.points_expiry_date) }}</div></td><td class="p-4 text-center font-bold text-sm" :class="isExpired(m.expiry_date) ? 'text-red-500' : 'text-gray-600'">{{ formatDate(m.expiry_date) }}</td><td class="p-4 text-center space-x-2"><button @click="openMemberModal('edit', m)" class="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-500 hover:text-white transition-colors"><i class="fa-solid fa-pen"></i></button><button @click="deleteMember(m)" class="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white transition-colors"><i class="fa-solid fa-trash"></i></button></td></tr></tbody></table></div><div class="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0"><span class="text-sm text-gray-500 font-bold">หน้า {{ currentPageMember }} จาก {{ totalMemberPages }}</span><div class="flex gap-2"><button @click="currentPageMember--" :disabled="currentPageMember === 1" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50">ก่อนหน้า</button><button @click="currentPageMember++" :disabled="currentPageMember === totalMemberPages" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50">ถัดไป</button></div></div></div>
      </div>

      <div v-if="settingTab === 'tables'" class="animate-[fadeIn_0.3s_ease-out] flex flex-col h-full max-w-4xl mx-auto"><div class="flex justify-between items-center mb-6 shrink-0"><h3 class="text-xl font-black text-gray-800"><i class="fa-solid fa-chair text-emerald-600 mr-2"></i> จัดการข้อมูลโต๊ะ ({{ tablesList.length }})</h3><button @click="openTableModal('add')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95"><i class="fa-solid fa-plus mr-2"></i> เพิ่มโต๊ะใหม่</button></div><div class="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden"><div class="flex-1 overflow-y-auto"><table class="w-full text-left border-collapse"><thead><tr class="bg-emerald-50 text-emerald-800 text-xs uppercase tracking-wider border-b border-emerald-100 sticky top-0 z-10"><th class="p-4 font-bold">ชื่อโต๊ะ</th><th class="p-4 font-bold text-center">สถานะ</th><th class="p-4 font-bold text-center">จัดการ</th></tr></thead><tbody class="divide-y divide-gray-50"><tr v-for="t in paginatedTables" :key="t.id" class="hover:bg-emerald-50/30 transition-colors"><td class="p-4 font-black text-gray-800 text-lg">{{ t.table_name }} <span v-if="t.description" class="text-xs text-gray-400 font-medium ml-2 bg-gray-100 px-2 py-1 rounded-md">{{ t.description }}</span></td><td class="p-4 text-center"><span :class="t.status === 'Available' ? 'bg-green-100 text-green-600 border-green-200' : 'bg-orange-100 text-orange-600 border-orange-200'" class="px-3 py-1 rounded-full text-[10px] uppercase font-black border">{{ t.status === 'Available' ? 'ว่าง' : 'ไม่ว่าง' }}</span></td><td class="p-4 text-center space-x-2"><button @click="openTableModal('edit', t)" class="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-500 hover:text-white transition-colors"><i class="fa-solid fa-pen"></i></button><button @click="deleteTable(t)" class="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white transition-colors"><i class="fa-solid fa-trash"></i></button></td></tr></tbody></table></div><div class="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0"><span class="text-sm text-gray-500 font-bold">หน้า {{ currentPageTable }} จาก {{ totalTablePages }}</span><div class="flex gap-2"><button @click="currentPageTable--" :disabled="currentPageTable === 1" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50">ก่อนหน้า</button><button @click="currentPageTable++" :disabled="currentPageTable === totalTablePages" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50">ถัดไป</button></div></div></div></div>

      <div v-if="settingTab === 'store'" class="animate-[fadeIn_0.3s_ease-out] max-w-5xl mx-auto space-y-6">
        <form @submit.prevent="saveStoreSettings" class="space-y-6">
          
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h3 class="text-xl font-black text-gray-800 mb-6 flex items-center"><i class="fa-solid fa-store mr-3 text-[#1a1a2e]"></i> ข้อมูลพื้นฐานร้านค้า</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label class="block text-sm font-bold text-gray-500 mb-2">ชื่อร้าน</label><input v-model="editSettings.StoreName" type="text" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-800 font-bold text-gray-800 focus:bg-white transition-all"></div>
              <div><label class="block text-sm font-bold text-gray-500 mb-2">สาขา</label><input v-model="editSettings.Branch" type="text" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-800 font-bold text-gray-800 focus:bg-white transition-all"></div>
              <div class="md:col-span-2"><label class="block text-sm font-bold text-gray-500 mb-2">ที่อยู่</label><input v-model="editSettings.Address" type="text" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-800 font-bold text-gray-800 focus:bg-white transition-all"></div>
              <div><label class="block text-sm font-bold text-gray-500 mb-2">เบอร์โทรศัพท์</label><input v-model="editSettings.Phone" type="text" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-800 font-bold text-gray-800 focus:bg-white transition-all"></div>
              <div><label class="block text-sm font-bold text-gray-500 mb-2">เลขประจำตัวผู้เสียภาษี</label><input v-model="editSettings.TaxID" type="text" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-800 font-bold text-gray-800 focus:bg-white transition-all"></div>
              <div class="md:col-span-2"><label class="block text-sm font-bold text-gray-500 mb-2">ข้อความลงท้ายใบเสร็จ (Footer)</label><input v-model="editSettings.FooterText" type="text" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-800 font-bold text-gray-800 focus:bg-white transition-all"></div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h4 class="text-lg font-black text-gray-800 mb-5 flex items-center"><i class="fa-solid fa-money-check-dollar mr-2 text-blue-500"></i> ตั้งค่าระบบรับเงิน (QR)</h4>
              <div class="flex gap-3 mb-6">
                <label class="flex-1 cursor-pointer group"><input type="radio" v-model="editSettings.PaymentMode" value="PromptPay" class="peer sr-only"><div class="p-3 rounded-xl border-2 border-gray-200 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all text-center"><i class="fa-solid fa-qrcode text-xl mb-1 transition-colors" :class="editSettings.PaymentMode === 'PromptPay' ? 'text-blue-500' : 'text-gray-400'"></i><p class="font-bold text-sm" :class="editSettings.PaymentMode === 'PromptPay' ? 'text-blue-700' : 'text-gray-600'">พร้อมเพย์ (Auto)</p></div></label>
                <label class="flex-1 cursor-pointer group"><input type="radio" v-model="editSettings.PaymentMode" value="BankQR" class="peer sr-only"><div class="p-3 rounded-xl border-2 border-gray-200 peer-checked:border-purple-500 peer-checked:bg-purple-50 transition-all text-center"><i class="fa-solid fa-image text-xl mb-1 transition-colors" :class="editSettings.PaymentMode === 'BankQR' ? 'text-purple-500' : 'text-gray-400'"></i><p class="font-bold text-sm" :class="editSettings.PaymentMode === 'BankQR' ? 'text-purple-700' : 'text-gray-600'">ภาพนิ่ง (Manual)</p></div></label>
              </div>
              <div v-if="editSettings.PaymentMode === 'PromptPay'">
                <label class="block text-xs font-bold text-gray-500 mb-2">เบอร์โทร / เลขบัตร ปชช. (PromptPay)</label>
                <input v-model="editSettings.PromptPayID" type="text" class="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-black text-blue-700 text-lg tracking-wider">
              </div>
              <div v-else class="space-y-4">
                <div><label class="block text-xs font-bold text-gray-500 mb-1">ลิงก์รูปภาพ QR</label><input v-model="editSettings.BankQRImageURL" type="url" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-purple-500 font-medium text-sm"></div>
                <div><label class="block text-xs font-bold text-gray-500 mb-1">ชื่อบัญชี / ธนาคาร / เลขบัญชี</label><input v-model="editSettings.BankAccountName" type="text" placeholder="ระบุรายละเอียดบัญชี..." class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-purple-500 font-bold text-sm"></div>
              </div>
            </div>

            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h4 class="text-lg font-black text-gray-800 mb-5 flex items-center"><i class="fa-solid fa-crown mr-2 text-yellow-500"></i> ตั้งค่าสมาชิก (CRM)</h4>
              <div class="space-y-5">
                <div><label class="block text-sm font-bold text-gray-600 mb-2">ยอดซื้อขั้นต่ำเพื่อรับ 1 แต้ม (บาท)</label><input v-model="editSettings.PointEarnRate" type="number" class="w-full bg-yellow-50/50 border border-yellow-200 rounded-xl px-4 py-3 outline-none focus:border-yellow-500 font-black text-yellow-700 text-lg text-center"></div>
                <div class="grid grid-cols-2 gap-4">
                  <div><label class="block text-xs font-bold text-gray-500 mb-2">ยอดสะสมอัปเกรด <span class="text-gray-600">SILVER</span></label><input v-model="editSettings.TierSilverSpent" type="number" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none font-black text-gray-700 text-center"></div>
                  <div><label class="block text-xs font-bold text-gray-500 mb-2">ยอดสะสมอัปเกรด <span class="text-yellow-600">GOLD</span></label><input v-model="editSettings.TierGoldSpent" type="number" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none font-black text-yellow-600 text-center"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end mt-4">
            <button type="submit" class="bg-gray-800 hover:bg-black text-white px-10 py-4 rounded-xl font-black shadow-lg transition-all active:scale-95 text-lg"><i class="fa-solid fa-save mr-2"></i> บันทึกข้อมูลร้านและตั้งค่า</button>
          </div>
        </form>
      </div>

      <div v-if="settingTab === 'users'" class="animate-[fadeIn_0.3s_ease-out] flex flex-col h-full max-w-5xl mx-auto"><div class="flex justify-between items-center mb-6 shrink-0"><h3 class="text-xl font-black text-gray-800"><i class="fa-solid fa-users text-[#1a1a2e] mr-2"></i> บัญชีผู้ใช้งานระบบ ({{ usersList.length }})</h3><button @click="openUserModal('add')" class="bg-[#1a1a2e] hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95"><i class="fa-solid fa-user-plus mr-2"></i> เพิ่มผู้ใช้งาน</button></div><div class="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden"><div class="flex-1 overflow-y-auto"><table class="w-full text-left border-collapse"><thead><tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100 sticky top-0 z-10"><th class="p-4 font-bold">ชื่อผู้ใช้</th><th class="p-4 font-bold">ตำแหน่ง (Role)</th><th class="p-4 font-bold">สิทธิ์การเข้าถึง</th><th class="p-4 font-bold text-center">จัดการ</th></tr></thead><tbody class="divide-y divide-gray-50"><tr v-for="u in paginatedUsers" :key="u.id" class="hover:bg-gray-50 transition-colors"><td class="p-4 font-bold text-gray-800"><i class="fa-solid fa-circle-user text-gray-400 mr-2 text-lg"></i> {{ u.username }}</td><td class="p-4"><span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-200">{{ u.role }}</span></td><td class="p-4 text-xs font-bold text-gray-500 flex flex-wrap gap-1"><span v-for="page in (u.allowed_pages ? u.allowed_pages.split(',') : [])" :key="page" class="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">{{ page.toUpperCase() }}</span></td><td class="p-4 text-center space-x-2"><button @click="openUserModal('edit', u)" class="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-500 hover:text-white transition-colors"><i class="fa-solid fa-pen"></i></button><button @click="deleteUser(u)" class="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white transition-colors"><i class="fa-solid fa-trash"></i></button></td></tr></tbody></table></div><div class="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0"><span class="text-sm text-gray-500 font-bold">หน้า {{ currentPageUser }} จาก {{ totalUserPages }}</span><div class="flex gap-2"><button @click="currentPageUser--" :disabled="currentPageUser === 1" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50">ก่อนหน้า</button><button @click="currentPageUser++" :disabled="currentPageUser === totalUserPages" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50">ถัดไป</button></div></div></div></div>

      <div v-if="settingTab === 'options'" class="animate-[fadeIn_0.3s_ease-out] max-w-5xl mx-auto"><h3 class="text-xl font-black text-gray-800 mb-6"><i class="fa-solid fa-tags text-gray-500 mr-2"></i> จัดการข้อมูลตัวเลือก (Dropdown Options)</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-8"><div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]"><div class="bg-[#fff7ed] p-5 border-b border-[#ffedd5]"><h4 class="font-black text-[#ea580c] flex items-center mb-3"><i class="fa-solid fa-layer-group mr-2"></i> หมวดหมู่เมนู (Category)</h4><form @submit.prevent="addQuickOption('Category')" class="flex gap-2"><input v-model="quickCategory" type="text" placeholder="พิมพ์ชื่อหมวดหมู่ใหม่..." class="flex-1 px-4 py-2.5 rounded-xl border border-[#ffedd5] outline-none focus:ring-2 focus:ring-[#f97316]/20 text-sm font-bold"><button type="submit" :disabled="!quickCategory" class="bg-[#f97316] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#ea580c] disabled:bg-[#fdba74] transition-colors"><i class="fa-solid fa-plus"></i></button></form></div><div class="flex-1 overflow-y-auto p-5 space-y-2 bg-gray-50"><div v-if="categoryOptions.length === 0" class="text-center text-gray-400 py-6 text-sm font-bold">ไม่มีข้อมูล</div><div v-for="opt in categoryOptions" :key="opt.id" class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group"><span class="font-bold text-gray-700">{{ opt.option_value }}</span><button @click="deleteOption(opt)" class="w-8 h-8 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"><i class="fa-solid fa-trash-can"></i></button></div></div></div><div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]"><div class="bg-[#f0f9ff] p-5 border-b border-[#dbeafe]"><h4 class="font-black text-[#2563eb] flex items-center mb-3"><i class="fa-solid fa-id-badge mr-2"></i> ตำแหน่งพนักงาน (Role)</h4><form @submit.prevent="addQuickOption('Role')" class="flex gap-2"><input v-model="quickRole" type="text" placeholder="พิมพ์ชื่อตำแหน่งใหม่..." class="flex-1 px-4 py-2.5 rounded-xl border border-[#dbeafe] outline-none focus:ring-2 focus:ring-[#3b82f6]/20 text-sm font-bold"><button type="submit" :disabled="!quickRole" class="bg-[#3b82f6] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#2563eb] disabled:bg-[#93c5fd] transition-colors"><i class="fa-solid fa-plus"></i></button></form></div><div class="flex-1 overflow-y-auto p-5 space-y-2 bg-gray-50"><div v-if="roleOptions.length === 0" class="text-center text-gray-400 py-6 text-sm font-bold">ไม่มีข้อมูล</div><div v-for="opt in roleOptions" :key="opt.id" class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group"><span class="font-bold text-gray-700">{{ opt.option_value }}</span><button @click="deleteOption(opt)" class="w-8 h-8 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"><i class="fa-solid fa-trash-can"></i></button></div></div></div></div></div>

    </div>

    <div v-if="showMenuModal" class="absolute inset-0 bg-[#1f2937]/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-8 md:p-10 animate-[fadeIn_0.2s_ease-out]">
        <h2 class="text-3xl font-black text-gray-800 mb-6 flex items-center"><i class="fa-solid fa-burger text-primary mr-3"></i>{{ menuForm.action === 'add' ? 'เพิ่มเมนูใหม่' : 'แก้ไขข้อมูลเมนู' }}</h2>
        <form @submit.prevent="submitMenuForm" class="space-y-5">
          <div><label class="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">ชื่อเมนู</label><input v-model="menuForm.menu_name" type="text" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-primary focus:bg-white font-black text-gray-800 transition-all"></div>
          <div class="grid grid-cols-2 gap-5">
            <div><label class="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">หมวดหมู่ (Category)</label><select v-model="menuForm.category" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-primary focus:bg-white font-bold text-gray-800 cursor-pointer transition-all"><option value="" disabled>เลือกหมวดหมู่...</option><option v-for="cat in categoryOptions" :key="cat.id" :value="cat.option_value">{{ cat.option_value }}</option></select></div>
            <div><label class="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">ราคา (฿)</label><input v-model.number="menuForm.price" type="number" required class="w-full bg-orange-50 border border-orange-200 rounded-xl px-4 py-3.5 outline-none focus:border-primary font-black text-primary text-xl transition-all"></div>
          </div>
          <div class="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
            <label class="block text-sm font-black text-blue-700 mb-2 flex items-center"><i class="fa-solid fa-box-open mr-2"></i> ผูกระบบตัดสต๊อกอัตโนมัติ (ตัวเลือก)</label>
            <select v-model="menuForm.inventory_id" class="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold text-gray-700 cursor-pointer text-sm shadow-sm transition-all"><option value="">-- ไม่ต้องตัดสต๊อก --</option><option v-for="inv in inventoryList" :key="inv.id" :value="inv.id">{{ inv.item_name }} (คงเหลือ: {{ inv.stock_qty }} {{ inv.unit }})</option></select>
          </div>
          <div class="grid grid-cols-2 gap-5">
            <div><label class="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">ประเภท</label><select v-model="menuForm.type" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary font-bold text-gray-800 transition-all"><option value="Normal">A La Carte</option><option value="Buffet">Buffet</option></select></div>
            <div><label class="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">สถานะ</label><select v-model="menuForm.status" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary font-bold text-gray-800 transition-all" :class="menuForm.status === 'Available' ? 'text-green-600' : 'text-red-600'"><option value="Available">พร้อมขาย</option><option value="Out of Stock">ของหมด</option></select></div>
          </div>
          <div><label class="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">ลิงก์รูปภาพ (URL)</label><input v-model="menuForm.image_url" type="url" placeholder="https://..." class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary text-sm text-gray-600 transition-all"></div>
          <div class="flex gap-4 pt-4 mt-2 border-t border-gray-100"><button type="button" @click="showMenuModal = false" class="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-lg">ยกเลิก</button><button type="submit" class="flex-1 py-4 bg-primary text-white font-black rounded-xl shadow-lg shadow-orange-500/30 active:scale-95 transition-all text-lg"><i class="fa-solid fa-save mr-2"></i> บันทึกเมนู</button></div>
        </form>
      </div>
    </div>

    <div v-if="showMemberModal" class="absolute inset-0 bg-[#1f2937]/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 md:p-10 animate-[fadeIn_0.2s_ease-out]">
        <h2 class="text-3xl font-black text-gray-800 mb-6 flex items-center"><i class="fa-solid fa-crown text-yellow-500 mr-3"></i>{{ memberForm.action === 'add' ? 'เพิ่มสมาชิกใหม่' : 'แก้ไขสมาชิก' }}</h2>
        <form @submit.prevent="submitMemberForm" class="space-y-5">
          <div><label class="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">เบอร์โทรศัพท์ (ID)</label><input v-model="memberForm.phone" type="tel" required :disabled="memberForm.action === 'edit'" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-yellow-500 font-black text-gray-800 disabled:opacity-60 disabled:cursor-not-allowed tracking-wider text-lg transition-all" placeholder="08x-xxx-xxxx"></div>
          <div><label class="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">ชื่อลูกค้า</label><input v-model="memberForm.name" type="text" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-yellow-500 font-bold text-gray-800 transition-all"></div>
          
          <div v-if="memberForm.action === 'edit'" class="grid grid-cols-2 gap-4">
            <div><label class="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">แต้มสะสม</label><input v-model.number="memberForm.points" type="number" required class="w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-black text-blue-600 text-center text-xl transition-all"></div>
            <div><label class="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">ระดับสมาชิก</label><select v-model="memberForm.tier" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-yellow-500 font-bold text-gray-800 text-center transition-all"><option value="Member">Member</option><option value="Silver">Silver</option><option value="Gold">Gold</option></select></div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <div><label class="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">วันหมดอายุสมาชิก</label><input v-model="memberForm.expiry_date" type="date" class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-yellow-500 font-bold text-sm text-gray-700"></div>
            <div><label class="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">วันหมดอายุแต้ม</label><input v-model="memberForm.points_expiry_date" type="date" class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-bold text-sm text-blue-700"></div>
          </div>

          <div class="flex gap-4 pt-4 mt-2 border-t border-gray-100"><button type="button" @click="showMemberModal = false" class="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-lg">ยกเลิก</button><button type="submit" class="flex-1 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-black rounded-xl shadow-lg shadow-yellow-500/30 active:scale-95 transition-all text-lg"><i class="fa-solid fa-save mr-2"></i> บันทึก</button></div>
        </form>
      </div>
    </div>

    <div v-if="showUserModal" class="absolute inset-0 bg-[#1f2937]/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 md:p-10 animate-[fadeIn_0.2s_ease-out]">
        <h2 class="text-3xl font-black text-gray-800 mb-6 flex items-center"><i class="fa-solid fa-user-shield text-[#1a1a2e] mr-3"></i>{{ userForm.action === 'add' ? 'เพิ่มผู้ใช้งาน' : 'แก้ไขผู้ใช้งาน' }}</h2>
        <form @submit.prevent="submitUserForm" class="space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <div><label class="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Username</label><input v-model="userForm.username" type="text" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-800 font-bold text-gray-800 transition-all" :disabled="userForm.action === 'edit'"></div>
            <div><label class="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Password</label><input v-model="userForm.password" type="text" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-800 font-bold text-gray-800 transition-all"></div>
          </div>
          <div><label class="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">ตำแหน่ง (Role)</label><select v-model="userForm.role" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-800 font-bold text-gray-800 cursor-pointer transition-all"><option value="" disabled>เลือกตำแหน่ง</option><option v-for="r in roleOptions" :key="r.id" :value="r.option_value">{{ r.option_value }}</option></select></div>
          
          <div class="bg-gray-50 p-5 rounded-2xl border border-gray-200">
            <label class="block text-sm font-black text-gray-700 mb-3"><i class="fa-solid fa-lock-open mr-2 text-green-500"></i> สิทธิ์การเข้าถึงหน้าต่างๆ (Permissions)</label>
            <div class="grid grid-cols-2 gap-3 text-sm font-bold text-gray-600">
              <label class="flex items-center gap-2 cursor-pointer hover:text-gray-900"><input type="checkbox" v-model="userForm.allowed_pages" value="pos" class="w-4 h-4 accent-gray-800"> ระบบ POS</label>
              <label class="flex items-center gap-2 cursor-pointer hover:text-gray-900"><input type="checkbox" v-model="userForm.allowed_pages" value="tables" class="w-4 h-4 accent-gray-800"> ผังโต๊ะรวม</label>
              <label class="flex items-center gap-2 cursor-pointer hover:text-gray-900"><input type="checkbox" v-model="userForm.allowed_pages" value="kitchen" class="w-4 h-4 accent-gray-800"> ห้องครัว (KDS)</label>
              <label class="flex items-center gap-2 cursor-pointer hover:text-gray-900"><input type="checkbox" v-model="userForm.allowed_pages" value="history" class="w-4 h-4 accent-gray-800"> ประวัติบิล</label>
              <label class="flex items-center gap-2 cursor-pointer hover:text-gray-900"><input type="checkbox" v-model="userForm.allowed_pages" value="reports" class="w-4 h-4 accent-gray-800"> รายงานยอดขาย</label>
              <label class="flex items-center gap-2 cursor-pointer hover:text-gray-900"><input type="checkbox" v-model="userForm.allowed_pages" value="settings" class="w-4 h-4 accent-gray-800"> ตั้งค่าระบบ</label>
            </div>
          </div>

          <div class="flex gap-4 pt-4 mt-2 border-t border-gray-100"><button type="button" @click="showUserModal = false" class="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-lg">ยกเลิก</button><button type="submit" class="flex-1 py-4 bg-[#1a1a2e] hover:bg-black text-white font-black rounded-xl shadow-lg active:scale-95 transition-all text-lg"><i class="fa-solid fa-save mr-2"></i> บันทึกสิทธิ์</button></div>
        </form>
      </div>
    </div>

    <div v-if="showInventoryModal" class="absolute inset-0 bg-[#1f2937]/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"><div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 animate-[fadeIn_0.2s_ease-out]"><h2 class="text-2xl font-black text-gray-800 mb-6 flex items-center"><i class="fa-solid fa-box text-blue-500 mr-3"></i>{{ inventoryForm.action === 'add' ? 'เพิ่มสินค้าลงคลัง' : 'แก้ไขข้อมูลสินค้า' }}</h2><form @submit.prevent="submitInventoryForm" class="space-y-4"><div><label class="block text-xs font-bold text-gray-400 mb-1 uppercase">ชื่อสินค้า / วัตถุดิบ</label><input v-model="inventoryForm.item_name" type="text" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-blue-500 font-bold text-gray-800"></div><div v-if="inventoryForm.action === 'add'"><label class="block text-xs font-bold text-gray-400 mb-1 uppercase">จำนวนเริ่มต้น</label><input v-model="inventoryForm.stock_qty" type="number" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-blue-500 font-black text-blue-600 text-xl"></div><div class="grid grid-cols-2 gap-4"><div><label class="block text-xs font-bold text-gray-400 mb-1 uppercase">หน่วยนับ</label><input v-model="inventoryForm.unit" type="text" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-blue-500 font-bold text-gray-800 text-center"></div><div><label class="block text-[10px] font-bold text-red-500 mb-1 uppercase leading-tight">เตือนเมื่อต่ำกว่า</label><input v-model="inventoryForm.low_alert" type="number" required class="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-3.5 outline-none focus:border-red-500 font-black text-red-600 text-center text-lg"></div></div><div class="flex gap-3 pt-4 border-t border-gray-100 mt-4"><button type="button" @click="showInventoryModal = false" class="flex-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">ยกเลิก</button><button type="submit" class="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 active:scale-95 transition-all">บันทึก</button></div></form></div></div>
    <div v-if="showAddStockModal" class="absolute inset-0 bg-[#1f2937]/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"><div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 animate-[fadeIn_0.2s_ease-out] text-center"><div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"><i class="fa-solid fa-boxes-packing"></i></div><h2 class="text-2xl font-black text-gray-800 mb-1">เติมสต๊อกสินค้า</h2><p class="text-gray-500 font-bold mb-6 text-lg">{{ inventoryForm.item_name }}</p><div class="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6"><p class="text-sm font-bold text-gray-500">คงเหลือปัจจุบัน: <span class="text-xl font-black text-gray-800">{{ inventoryForm.stock_qty }}</span> {{ inventoryForm.unit }}</p></div><form @submit.prevent="submitAddStock" class="space-y-4"><div><label class="block text-xs font-bold text-green-600 mb-2 uppercase tracking-wide">ระบุจำนวนที่ต้องการเติม (+)</label><input v-model="inventoryForm.add_qty" type="number" required min="1" class="w-full bg-green-50 border border-green-200 rounded-xl px-4 py-4 outline-none focus:border-green-500 font-black text-green-700 text-center text-3xl"></div><div class="flex gap-3 pt-4"><button type="button" @click="showAddStockModal = false" class="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">ยกเลิก</button><button type="submit" class="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl shadow-lg shadow-green-500/30 active:scale-95 transition-all text-lg"><i class="fa-solid fa-plus mr-1"></i> เพิ่มสต๊อก</button></div></form></div></div>
    <div v-if="showLogModal" class="absolute inset-0 bg-[#1f2937]/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"><div class="bg-gray-50 rounded-[2.5rem] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]"><div class="bg-white p-6 flex justify-between items-center shadow-sm z-10"><h2 class="text-2xl font-black text-gray-800 flex items-center"><i class="fa-solid fa-clock-rotate-left text-gray-800 mr-3"></i> ประวัติเข้า-ออกคลังสินค้า</h2><button @click="showLogModal = false" class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-500 text-xl transition-colors"><i class="fa-solid fa-xmark"></i></button></div><div class="flex-1 overflow-y-auto p-6"><div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"><table class="w-full text-left border-collapse"><thead><tr class="bg-gray-800 text-white text-xs uppercase tracking-wider border-b border-gray-100 sticky top-0 z-10"><th class="p-4 font-bold">วัน-เวลา</th><th class="p-4 font-bold">ชื่อสินค้า</th><th class="p-4 font-bold">เหตุการณ์</th><th class="p-4 font-bold text-center">จำนวน</th><th class="p-4 font-bold text-center">คงเหลือ</th></tr></thead><tbody class="divide-y divide-gray-50"><tr v-if="inventoryLogs.length === 0"><td colspan="5" class="text-center py-10 text-gray-400 font-bold">ไม่มีประวัติการทำรายการ</td></tr><tr v-for="log in paginatedLogs" :key="log.id" class="hover:bg-gray-50 transition-colors text-sm"><td class="p-4 text-gray-500 font-medium">{{ new Date(log.created_at).toLocaleString('th-TH') }}</td><td class="p-4 font-bold text-gray-800">{{ log.item_name }}</td><td class="p-4 text-gray-600 font-bold">{{ log.action }}</td><td class="p-4 text-center font-black text-lg" :class="Number(log.qty_change) > 0 ? 'text-green-500' : (Number(log.qty_change) < 0 ? 'text-red-500' : 'text-gray-500')">{{ log.qty_change > 0 ? '+' : '' }}{{ log.qty_change }}</td><td class="p-4 text-center font-black text-blue-600">{{ log.remaining }}</td></tr></tbody></table></div></div><div class="p-4 border-t border-gray-100 bg-white flex items-center justify-between shrink-0"><span class="text-sm text-gray-500 font-bold">หน้า {{ currentPageLog }} จาก {{ totalLogPages }}</span><div class="flex gap-2"><button @click="currentPageLog--" :disabled="currentPageLog === 1" class="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50">ก่อนหน้า</button><button @click="currentPageLog++" :disabled="currentPageLog === totalLogPages" class="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50">ถัดไป</button></div></div></div></div>
    <div v-if="showTableModal" class="absolute inset-0 bg-[#1f2937]/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"><div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 animate-[fadeIn_0.2s_ease-out]"><h2 class="text-2xl font-black text-gray-800 mb-6 flex items-center"><i class="fa-solid fa-chair text-emerald-600 mr-3"></i>{{ tableForm.action === 'add' ? 'เพิ่มโต๊ะใหม่' : 'แก้ไขข้อมูลโต๊ะ' }}</h2><form @submit.prevent="submitTableForm" class="space-y-4"><div><label class="block text-xs font-bold text-gray-400 mb-2 uppercase">ระบุชื่อโต๊ะ</label><input v-model="tableForm.table_name" type="text" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 outline-none focus:border-emerald-500 font-black text-xl text-gray-800 text-center" placeholder="พิมพ์ชื่อโต๊ะ..."></div><div><label class="block text-xs font-bold text-gray-400 mb-2 uppercase">คำอธิบาย</label><input v-model="tableForm.description" type="text" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-medium text-sm text-gray-800 text-center" placeholder="เช่น ชั้น 2, ริมหน้าต่าง"></div><div class="flex gap-3 pt-4 border-t border-gray-100 mt-6"><button type="button" @click="showTableModal = false" class="flex-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">ยกเลิก</button><button type="submit" class="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 active:scale-95 transition-all">บันทึก</button></div></form></div></div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import Swal from 'sweetalert2'

// 🌟 ตัวช่วยแจ้งเตือน (Toast) แบบสวยงามพรีเมียม 🌟
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

// State
const settingTab = ref('menus')
const isLoading = ref(true)

const menus = ref([])
const tablesList = ref([])
const membersList = ref([])
const inventoryList = ref([])
const inventoryLogs = ref([])
const usersList = ref([])
const optionsList = ref([])

const storeSettings = ref({})
const editSettings = ref({
  StoreName: '', Branch: '', Address: '', Phone: '', TaxID: '', FooterText: '', 
  PromptPayID: '', PaymentMode: 'PromptPay', BankQRImageURL: '', BankName: '', BankAccountNo: '', BankAccountName: '', 
  PointEarnRate: '100', TierSilverSpent: '5000', TierGoldSpent: '20000'
})

// Search & Filter state
const searchMenuQuery = ref('')
const filterMenuCategory = ref('All')
const filterMenuType = ref('All')
const searchInventoryQuery = ref('')
const searchMemberQuery = ref('')

// Pagination
const currentPageMenu = ref(1)
const itemsPerPageMenu = 10
const currentPageInv = ref(1)
const itemsPerPageInv = 15 // 🌟 โชว์ 15 รายการตามต้องการ
const currentPageMember = ref(1)
const itemsPerPageMember = 10
const currentPageTable = ref(1)
const itemsPerPageTable = 10
const currentPageUser = ref(1)
const itemsPerPageUser = 10
const currentPageLog = ref(1)
const itemsPerPageLog = 15

// Modals State
const showMenuModal = ref(false)
const showInventoryModal = ref(false)
const showAddStockModal = ref(false)
const showLogModal = ref(false)
const showMemberModal = ref(false)
const showTableModal = ref(false)
const showUserModal = ref(false)

const menuForm = ref({})
const inventoryForm = ref({})
const memberForm = ref({})
const tableForm = ref({})
const userForm = ref({})

const quickCategory = ref('')
const quickRole = ref('')

// Computed (Options)
const categoryOptions = computed(() => optionsList.value.filter(o => o.option_type === 'Category'))
const roleOptions = computed(() => optionsList.value.filter(o => o.option_type === 'Role'))

// Computed (Filtered Lists & Pagination)
const filteredMenus = computed(() => {
  let list = menus.value
  if (filterMenuType.value !== 'All') list = list.filter(m => m.type === filterMenuType.value)
  if (filterMenuCategory.value !== 'All') list = list.filter(m => m.category === filterMenuCategory.value)
  if (searchMenuQuery.value) {
    const q = searchMenuQuery.value.toLowerCase()
    list = list.filter(m => m.menu_name.toLowerCase().includes(q))
  }
  return list
})
const paginatedMenus = computed(() => filteredMenus.value.slice((currentPageMenu.value - 1) * itemsPerPageMenu, currentPageMenu.value * itemsPerPageMenu))
const totalMenuPages = computed(() => Math.ceil(filteredMenus.value.length / itemsPerPageMenu) || 1)

const filteredInventory = computed(() => {
  let list = inventoryList.value
  if (searchInventoryQuery.value) list = list.filter(i => i.item_name.toLowerCase().includes(searchInventoryQuery.value.toLowerCase()))
  return list
})
const paginatedInventory = computed(() => filteredInventory.value.slice((currentPageInv.value - 1) * itemsPerPageInv, currentPageInv.value * itemsPerPageInv))
const totalInvPages = computed(() => Math.ceil(filteredInventory.value.length / itemsPerPageInv) || 1)

const paginatedLogs = computed(() => inventoryLogs.value.slice((currentPageLog.value - 1) * itemsPerPageLog, currentPageLog.value * itemsPerPageLog))
const totalLogPages = computed(() => Math.ceil(inventoryLogs.value.length / itemsPerPageLog) || 1)

const filteredMembers = computed(() => {
  let list = membersList.value
  if (searchMemberQuery.value) list = list.filter(m => m.phone.includes(searchMemberQuery.value) || m.name.toLowerCase().includes(searchMemberQuery.value.toLowerCase()))
  return list
})
const paginatedMembers = computed(() => filteredMembers.value.slice((currentPageMember.value - 1) * itemsPerPageMember, currentPageMember.value * itemsPerPageMember))
const totalMemberPages = computed(() => Math.ceil(filteredMembers.value.length / itemsPerPageMember) || 1)

const paginatedTables = computed(() => tablesList.value.slice((currentPageTable.value - 1) * itemsPerPageTable, currentPageTable.value * itemsPerPageTable))
const totalTablePages = computed(() => Math.ceil(tablesList.value.length / itemsPerPageTable) || 1)

const paginatedUsers = computed(() => usersList.value.slice((currentPageUser.value - 1) * itemsPerPageUser, currentPageUser.value * itemsPerPageUser))
const totalUserPages = computed(() => Math.ceil(usersList.value.length / itemsPerPageUser) || 1)

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })
}
const isExpired = (dateStr) => {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

// 📡 Load Everything
const loadAllData = async () => {
  isLoading.value = true
  try {
    const [ resMenus, resTables, resMembers, resInv, resLogs, resUsers, resOptions, resSettings ] = await Promise.all([
      supabase.from('menus').select('*').order('id', { ascending: false }),
      supabase.from('tables').select('*').order('table_name'),
      supabase.from('members').select('*').order('created_at', { ascending: false }),
      supabase.from('inventory').select('*').order('item_name'),
      supabase.from('inventory_logs').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('users').select('*').order('id'),
      supabase.from('options').select('*'),
      supabase.from('settings').select('*')
    ])

    if (resMenus.data) menus.value = resMenus.data
    if (resTables.data) tablesList.value = resTables.data
    if (resMembers.data) membersList.value = resMembers.data
    if (resInv.data) inventoryList.value = resInv.data
    if (resLogs.data) inventoryLogs.value = resLogs.data
    if (resUsers.data) usersList.value = resUsers.data
    if (resOptions.data) optionsList.value = resOptions.data
    
    if (resSettings.data) {
      const s = Object.fromEntries(resSettings.data.map(item => [item.setting_key, item.setting_value]))
      storeSettings.value = s
      editSettings.value = { ...editSettings.value, ...s } 
    }
  } catch (error) {
    Toast.fire({ icon: 'error', title: 'ไม่สามารถโหลดข้อมูลระบบได้' })
  } finally {
    isLoading.value = false
  }
}

// 💾 Save Store Settings
const saveStoreSettings = async () => {
  isLoading.value = true
  const updates = Object.keys(editSettings.value).map(key => ({
    setting_key: key,
    setting_value: String(editSettings.value[key])
  }))

  const { error } = await supabase.from('settings').upsert(updates)
  isLoading.value = false
  
  if (error) Toast.fire({ icon: 'error', title: 'ไม่สามารถบันทึกได้' })
  else {
    Toast.fire({ icon: 'success', title: 'บันทึกตั้งค่าร้านสำเร็จ!' })
    loadAllData()
  }
}

// --- Menus ---
const openMenuModal = (action, menu = null) => {
  menuForm.value = action === 'add' 
    ? { menu_name: '', category: '', price: 0, type: 'Normal', inventory_id: '', image_url: '', status: 'Available', action: 'add' }
    : { ...menu, action: 'edit' }
  showMenuModal.value = true
}
const submitMenuForm = async () => {
  isLoading.value = true
  const payload = { 
    menu_name: menuForm.value.menu_name, category: menuForm.value.category, price: menuForm.value.price, 
    type: menuForm.value.type, inventory_id: menuForm.value.inventory_id || null, image_url: menuForm.value.image_url, status: menuForm.value.status 
  }
  
  let error
  if (menuForm.value.action === 'add') {
    const res = await supabase.from('menus').insert([payload])
    error = res.error
  } else {
    const res = await supabase.from('menus').update(payload).eq('id', menuForm.value.id)
    error = res.error
  }
  
  showMenuModal.value = false
  if (error) Toast.fire({ icon: 'error', title: error.message })
  else { Toast.fire({ icon: 'success', title: 'บันทึกเมนูสำเร็จ' }); loadAllData() }
}
const deleteMenu = async (menu) => {
  const res = await Swal.fire({ title: 'ลบเมนู?', text: `ลบ ${menu.menu_name} ใช่หรือไม่?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' })
  if (res.isConfirmed) {
    isLoading.value = true
    await supabase.from('menus').delete().eq('id', menu.id)
    Toast.fire({ icon: 'success', title: 'ลบสำเร็จ' })
    loadAllData()
  }
}

// --- Inventory ---
const openInventoryModal = (action, inv = null) => {
  inventoryForm.value = action === 'add' ? { item_name: '', stock_qty: '', low_alert: '', unit: '', action: 'add' } : { ...inv, action: 'edit' }
  showInventoryModal.value = true
}
const submitInventoryForm = async () => {
  isLoading.value = true
  const payload = { item_name: inventoryForm.value.item_name, stock_qty: inventoryForm.value.stock_qty, low_alert: inventoryForm.value.low_alert, unit: inventoryForm.value.unit }
  let error
  if(inventoryForm.value.action === 'add') {
    const res = await supabase.from('inventory').insert([payload])
    error = res.error
  } else {
    const res = await supabase.from('inventory').update(payload).eq('id', inventoryForm.value.id)
    error = res.error
  }
  showInventoryModal.value = false
  if (error) Toast.fire({ icon: 'error', title: error.message })
  else { Toast.fire({ icon: 'success', title: 'บันทึกคลังสำเร็จ' }); loadAllData() }
}
const deleteInventory = async (inv) => {
  const res = await Swal.fire({ title: 'ลบสินค้า?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' })
  if (res.isConfirmed) {
    isLoading.value = true; await supabase.from('inventory').delete().eq('id', inv.id); 
    Toast.fire({ icon: 'success', title: 'ลบสำเร็จ' })
    loadAllData()
  }
}
const openAddStockModal = (inv) => {
  inventoryForm.value = { ...inv, add_qty: '', action: 'addStock' }
  showAddStockModal.value = true
}
const submitAddStock = async () => {
  isLoading.value = true
  const newQty = Number(inventoryForm.value.stock_qty) + Number(inventoryForm.value.add_qty)
  
  await supabase.from('inventory').update({ stock_qty: newQty }).eq('id', inventoryForm.value.id)
  await supabase.from('inventory_logs').insert([{ item_name: inventoryForm.value.item_name, action: 'เติมสต๊อก', qty_change: inventoryForm.value.add_qty, remaining: newQty }])
  
  showAddStockModal.value = false
  Toast.fire({ icon: 'success', title: 'เติมสต๊อกสำเร็จ' })
  loadAllData()
}

// --- Members ---
const openMemberModal = (action, member = null) => {
  memberForm.value = action === 'add' 
    ? { phone: '', name: '', points: 0, tier: 'Member', expiry_date: '', points_expiry_date: '', action: 'add' } 
    : { ...member, action: 'edit' }
  showMemberModal.value = true
}
const submitMemberForm = async () => {
  isLoading.value = true
  const payload = { 
    phone: memberForm.value.phone, name: memberForm.value.name, points: memberForm.value.points, tier: memberForm.value.tier,
    expiry_date: memberForm.value.expiry_date || null, points_expiry_date: memberForm.value.points_expiry_date || null 
  }
  let error
  if(memberForm.value.action === 'add') {
    const res = await supabase.from('members').insert([payload])
    error = res.error
  } else {
    const res = await supabase.from('members').update(payload).eq('phone', memberForm.value.phone)
    error = res.error
  }
  showMemberModal.value = false
  if (error) Toast.fire({ icon: 'error', title: error.message })
  else { Toast.fire({ icon: 'success', title: 'บันทึกสมาชิกสำเร็จ' }); loadAllData() }
}
const deleteMember = async (member) => {
  const res = await Swal.fire({ title: 'ลบสมาชิก?', text: 'แต้มสะสมจะหายทั้งหมด', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' })
  if (res.isConfirmed) { isLoading.value = true; await supabase.from('members').delete().eq('phone', member.phone); Toast.fire({ icon: 'success', title: 'ลบสำเร็จ' }); loadAllData() }
}

// --- Tables ---
const openTableModal = (action, table = null) => {
  tableForm.value = action === 'add' ? { table_name: '', description: '', action: 'add' } : { ...table, action: 'edit' }
  showTableModal.value = true
}
const submitTableForm = async () => {
  isLoading.value = true
  const payload = { table_name: tableForm.value.table_name, description: tableForm.value.description }
  if(tableForm.value.action === 'add') await supabase.from('tables').insert([payload])
  else await supabase.from('tables').update(payload).eq('id', tableForm.value.id)
  showTableModal.value = false
  Toast.fire({ icon: 'success', title: 'บันทึกสำเร็จ' })
  loadAllData()
}
const deleteTable = async (table) => {
  if (table.status !== 'Available') return Toast.fire({ icon: 'error', title: 'ลบไม่ได้ โต๊ะนี้มีลูกค้าอยู่' })
  const res = await Swal.fire({ title: 'ลบโต๊ะ?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' })
  if (res.isConfirmed) { isLoading.value = true; await supabase.from('tables').delete().eq('id', table.id); Toast.fire({ icon: 'success', title: 'ลบสำเร็จ' }); loadAllData() }
}

// --- Users (Permissions) ---
const openUserModal = (action, user = null) => {
  userForm.value = action === 'add' 
    ? { username: '', password: '', role: '', allowed_pages: [], action: 'add' } 
    : { ...user, allowed_pages: user.allowed_pages ? user.allowed_pages.split(',') : [], action: 'edit' }
  showUserModal.value = true
}
const submitUserForm = async () => {
  isLoading.value = true
  const payload = { 
    username: userForm.value.username, password: userForm.value.password, 
    role: userForm.value.role, allowed_pages: userForm.value.allowed_pages.join(',') 
  }
  if(userForm.value.action === 'add') await supabase.from('users').insert([payload])
  else await supabase.from('users').update(payload).eq('id', userForm.value.id)
  
  showUserModal.value = false
  Toast.fire({ icon: 'success', title: 'บันทึกผู้ใช้สำเร็จ' })
  loadAllData()
}
const deleteUser = async (user) => {
  const res = await Swal.fire({ title: 'ลบผู้ใช้?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' })
  if (res.isConfirmed) { isLoading.value = true; await supabase.from('users').delete().eq('id', user.id); Toast.fire({ icon: 'success', title: 'ลบสำเร็จ' }); loadAllData() }
}

// --- Options ---
const addQuickOption = async (type) => {
  const val = type === 'Category' ? quickCategory.value : quickRole.value
  if (!val) return
  isLoading.value = true
  await supabase.from('options').insert([{ option_type: type, option_value: val }])
  quickCategory.value = ''; quickRole.value = ''
  Toast.fire({ icon: 'success', title: 'เพิ่มตัวเลือกสำเร็จ' })
  loadAllData()
}
const deleteOption = async (opt) => {
  const res = await Swal.fire({ title: 'ลบตัวเลือก?', text: opt.option_value, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' })
  if (res.isConfirmed) { isLoading.value = true; await supabase.from('options').delete().eq('id', opt.id); Toast.fire({ icon: 'success', title: 'ลบสำเร็จ' }); loadAllData() }
}

onMounted(() => {
  loadAllData()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>