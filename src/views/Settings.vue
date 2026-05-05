<template>
  <div class="h-full flex flex-col bg-gray-50 overflow-hidden font-sans text-gray-800">
    
    <div class="bg-white px-8 py-5 border-b border-gray-200 shadow-sm shrink-0 flex justify-between items-center z-10">
      <div>
        <h2 class="text-2xl font-black text-gray-800 flex items-center tracking-tight"><i class="fa-solid fa-sliders text-gray-400 mr-3"></i> ตั้งค่าระบบ (Settings)</h2>
        <p class="text-xs font-bold text-gray-400 mt-1">จัดการข้อมูลร้าน, พนักงาน, คลังสินค้า และเมนูอาหาร</p>
      </div>
      <div v-if="storeInfo" class="text-right hidden md:block">
        <span class="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200 text-gray-600">{{ storeInfo.package_type }} PLAN</span>
        <div class="text-xs font-bold mt-1" :class="getDaysLeft() <= 30 ? 'text-red-500' : 'text-gray-500'">หมดอายุ: {{ formatDate(storeInfo.expires_at) }}</div>
      </div>
    </div>

    <div class="flex-1 overflow-hidden flex relative">
      
      <div class="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto no-scrollbar shrink-0 flex flex-col gap-1 z-10 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2 mt-2">จัดการร้าน (Store)</p>
        <button @click="settingTab = 'store'" :class="['flex items-center w-full px-4 py-3 rounded-xl font-bold text-sm transition-all', settingTab === 'store' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100']"><i class="fa-solid fa-store w-6"></i> ข้อมูลร้าน</button>
        <button @click="settingTab = 'tables'" :class="['flex items-center w-full px-4 py-3 rounded-xl font-bold text-sm transition-all', settingTab === 'tables' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100']"><i class="fa-solid fa-chair w-6"></i> ผังโต๊ะ</button>
        <button @click="settingTab = 'users'" :class="['flex items-center w-full px-4 py-3 rounded-xl font-bold text-sm transition-all', settingTab === 'users' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100']"><i class="fa-solid fa-users w-6"></i> พนักงาน</button>
        <button @click="settingTab = 'options'" :class="['flex items-center w-full px-4 py-3 rounded-xl font-bold text-sm transition-all', settingTab === 'options' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100']"><i class="fa-solid fa-tags w-6"></i> หมวดหมู่ & ตำแหน่ง</button>
        
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2 mt-4">สินค้า (Product)</p>
        <button @click="settingTab = 'menus'" :class="['flex items-center w-full px-4 py-3 rounded-xl font-bold text-sm transition-all', settingTab === 'menus' ? 'bg-primary text-white shadow-md shadow-orange-500/30' : 'text-gray-600 hover:bg-orange-50']"><i class="fa-solid fa-burger w-6"></i> เมนูอาหาร</button>
        <button @click="settingTab = 'inventory'" :class="['flex items-center w-full px-4 py-3 rounded-xl font-bold text-sm transition-all', settingTab === 'inventory' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'text-gray-600 hover:bg-blue-50']"><i class="fa-solid fa-boxes-stacked w-6"></i> คลังวัตถุดิบ</button>
        
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2 mt-4">ลูกค้า (CRM)</p>
        <button @click="settingTab = 'members'" :class="['flex items-center w-full px-4 py-3 rounded-xl font-bold text-sm transition-all', settingTab === 'members' ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/30' : 'text-gray-600 hover:bg-yellow-50']"><i class="fa-solid fa-crown w-6"></i> สมาชิกลูกค้า</button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50 relative">
        <div v-if="isLoading" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm"><i class="fa-solid fa-circle-notch fa-spin text-4xl text-primary mb-3"></i><p class="font-bold text-gray-500">กำลังโหลดข้อมูล...</p></div>

        <div v-if="settingTab === 'store'" class="max-w-4xl mx-auto space-y-6 animate-[fadeIn_0.2s_ease-out]">
          <form @submit.prevent="saveStoreSettings" class="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-6 border-b border-gray-100 bg-gray-50/50"><h3 class="text-xl font-black text-gray-800"><i class="fa-solid fa-store text-gray-400 mr-2"></i> ข้อมูลพื้นฐานร้านค้า</h3></div>
            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label class="block text-xs font-bold text-gray-500 mb-1">ชื่อร้าน</label><input v-model="editSettings.StoreName" type="text" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-gray-800 font-bold text-sm"></div>
              <div><label class="block text-xs font-bold text-gray-500 mb-1">สาขา</label><input v-model="editSettings.Branch" type="text" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-gray-800 font-bold text-sm"></div>
              <div class="md:col-span-2"><label class="block text-xs font-bold text-gray-500 mb-1">ที่อยู่</label><input v-model="editSettings.Address" type="text" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-gray-800 font-bold text-sm"></div>
              <div><label class="block text-xs font-bold text-gray-500 mb-1">เบอร์โทรศัพท์</label><input v-model="editSettings.Phone" type="text" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-gray-800 font-bold text-sm"></div>
              <div><label class="block text-xs font-bold text-gray-500 mb-1">เลขผู้เสียภาษี</label><input v-model="editSettings.TaxID" type="text" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-gray-800 font-bold text-sm"></div>
              <div class="md:col-span-2"><label class="block text-xs font-bold text-gray-500 mb-1">ข้อความลงท้ายใบเสร็จ</label><input v-model="editSettings.FooterText" type="text" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-gray-800 font-bold text-sm"></div>
            </div>
            
            <div class="p-6 border-y border-gray-100 bg-gray-50/50"><h3 class="text-xl font-black text-gray-800"><i class="fa-solid fa-money-check-dollar text-blue-500 mr-2"></i> ระบบรับเงิน (QR)</h3></div>
            <div class="p-6">
              <div class="flex gap-3 mb-5">
                <label class="flex-1 cursor-pointer"><input type="radio" v-model="editSettings.PaymentMode" value="PromptPay" class="peer sr-only"><div class="p-3 rounded-xl border border-gray-200 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all text-center"><i class="fa-solid fa-qrcode text-xl mb-1" :class="editSettings.PaymentMode === 'PromptPay' ? 'text-blue-500' : 'text-gray-400'"></i><p class="font-bold text-xs" :class="editSettings.PaymentMode === 'PromptPay' ? 'text-blue-700' : 'text-gray-500'">พร้อมเพย์ (Auto)</p></div></label>
                <label class="flex-1 cursor-pointer"><input type="radio" v-model="editSettings.PaymentMode" value="BankQR" class="peer sr-only"><div class="p-3 rounded-xl border border-gray-200 peer-checked:border-purple-500 peer-checked:bg-purple-50 transition-all text-center"><i class="fa-solid fa-image text-xl mb-1" :class="editSettings.PaymentMode === 'BankQR' ? 'text-purple-500' : 'text-gray-400'"></i><p class="font-bold text-xs" :class="editSettings.PaymentMode === 'BankQR' ? 'text-purple-700' : 'text-gray-500'">ภาพนิ่ง (Manual)</p></div></label>
              </div>
              <div v-if="editSettings.PaymentMode === 'PromptPay'"><label class="block text-xs font-bold text-gray-500 mb-1">เบอร์ / เลขบัตร ปชช. (PromptPay)</label><input v-model="editSettings.PromptPayID" type="text" class="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 font-bold text-blue-700"></div>
              <div v-else class="space-y-4">
                <div><label class="block text-xs font-bold text-gray-500 mb-1">ลิงก์รูปภาพ QR</label><input v-model="editSettings.BankQRImageURL" type="url" class="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 font-bold text-sm"></div>
                <div><label class="block text-xs font-bold text-gray-500 mb-1">ชื่อบัญชี / ธนาคาร</label><input v-model="editSettings.BankAccountName" type="text" class="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 font-bold text-sm"></div>
              </div>
            </div>

            <div class="p-6 border-y border-gray-100 bg-gray-50/50"><h3 class="text-xl font-black text-gray-800"><i class="fa-solid fa-crown text-yellow-500 mr-2"></i> ตั้งค่าสมาชิก (CRM)</h3></div>
            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="md:col-span-2"><label class="block text-xs font-bold text-gray-500 mb-1">ยอดซื้อขั้นต่ำรับ 1 แต้ม (บาท)</label><input v-model="editSettings.PointEarnRate" type="number" class="w-full bg-white border border-yellow-200 rounded-xl px-4 py-2.5 outline-none focus:border-yellow-500 font-black text-yellow-600"></div>
              <div><label class="block text-[10px] font-bold text-gray-500 mb-1">ยอดสะสมอัปเกรด SILVER</label><input v-model="editSettings.TierSilverSpent" type="number" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none font-bold text-sm"></div>
              <div><label class="block text-[10px] font-bold text-gray-500 mb-1">ยอดสะสมอัปเกรด GOLD</label><input v-model="editSettings.TierGoldSpent" type="number" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none font-bold text-sm"></div>
            </div>

            <div class="p-6 bg-gray-50 border-t border-gray-200 flex justify-end"><button type="submit" class="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all active:scale-95"><i class="fa-solid fa-save mr-2"></i> บันทึกการตั้งค่า</button></div>
          </form>
        </div>

        <div v-else-if="settingTab === 'menus'" class="animate-[fadeIn_0.2s_ease-out] flex flex-col h-full max-w-6xl mx-auto">
           <div class="flex justify-between items-center mb-4 shrink-0"><h3 class="text-xl font-black text-gray-800">จัดการเมนูอาหาร <span class="text-primary text-sm">({{ filteredMenus?.length || 0 }})</span></h3><div class="flex gap-2"><select v-model="filterMenuCategory" class="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold outline-none cursor-pointer hidden md:block"><option value="All">ทุกหมวดหมู่</option><option v-for="cat in categoryOptions" :key="cat.id" :value="cat.option_value">{{ cat.option_value }}</option></select><input v-model="searchMenuQuery" type="text" placeholder="ค้นหาเมนู..." class="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold w-40 md:w-48 outline-none"><button @click="openMenuModal('add')" class="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm active:scale-95"><i class="fa-solid fa-plus"></i><span class="hidden md:inline ml-2">เพิ่มเมนู</span></button></div></div>
           <div class="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden"><div class="flex-1 overflow-y-auto"><table class="w-full text-left border-collapse"><thead><tr class="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-200 sticky top-0 z-10"><th class="p-3 font-bold w-12 text-center">รูป</th><th class="p-3 font-bold">ชื่อเมนู</th><th class="p-3 font-bold text-center">หมวดหมู่</th><th class="p-3 font-bold text-right">ราคา</th><th class="p-3 font-bold text-center">สถานะ</th><th class="p-3 font-bold text-center">จัดการ</th></tr></thead><tbody class="divide-y divide-gray-100"><tr v-if="paginatedMenus.length === 0"><td colspan="6" class="text-center py-10 text-gray-400 font-bold">ไม่พบข้อมูล</td></tr><tr v-for="m in paginatedMenus" :key="m.id" class="hover:bg-gray-50 text-sm"><td class="p-2 text-center"><img v-if="m.image_url" :src="m.image_url" class="w-10 h-10 rounded-lg object-cover border border-gray-200 mx-auto"><div v-else class="w-10 h-10 bg-gray-100 rounded-lg mx-auto flex items-center justify-center text-gray-400"><i class="fa-solid fa-image"></i></div></td><td class="p-3 font-black text-gray-800">{{ m.menu_name }}</td><td class="p-3 text-center text-gray-500 text-xs">{{ m.category }}</td><td class="p-3 text-right font-black text-primary">฿{{ Number(m.price).toLocaleString() }}</td><td class="p-3 text-center"><span :class="m.status === 'Available' ? 'text-green-500 bg-green-50 border-green-200' : 'text-red-500 bg-red-50 border-red-200'" class="px-2 py-0.5 rounded text-[9px] font-bold border tracking-wider">{{ m.status === 'Available' ? 'พร้อมขาย' : 'ของหมด' }}</span></td><td class="p-3 text-center"><button @click="openMenuModal('edit', m)" class="text-blue-500 hover:text-blue-700 mr-4 transition-colors"><i class="fa-solid fa-pen"></i></button><button @click="deleteMenu(m)" class="text-red-500 hover:text-red-700 transition-colors"><i class="fa-solid fa-trash"></i></button></td></tr></tbody></table></div><div class="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0"><span class="text-xs text-gray-500 font-bold">หน้า {{ currentPageMenu }} จาก {{ totalMenuPages }}</span><div class="flex gap-2"><button @click="currentPageMenu--" :disabled="currentPageMenu === 1" class="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold disabled:opacity-50">ก่อนหน้า</button><button @click="currentPageMenu++" :disabled="currentPageMenu === totalMenuPages" class="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold disabled:opacity-50">ถัดไป</button></div></div></div>
        </div>

        <div v-else-if="settingTab === 'inventory'" class="animate-[fadeIn_0.2s_ease-out] flex flex-col h-full max-w-6xl mx-auto">
          <div class="flex justify-between items-center mb-4 shrink-0"><h3 class="text-xl font-black text-gray-800">คลังสินค้า <span class="text-blue-600 text-sm">({{ filteredInventory?.length || 0 }})</span></h3><div class="flex gap-2"><input v-model="searchInventoryQuery" type="text" placeholder="ค้นหาสินค้า..." class="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold w-40 md:w-48 outline-none"><button @click="showLogModal = true" class="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg font-bold shadow-sm"><i class="fa-solid fa-clock-rotate-left"></i></button><button @click="openInventoryModal('add')" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm active:scale-95"><i class="fa-solid fa-plus"></i><span class="hidden md:inline ml-2">เพิ่มสินค้า</span></button></div></div>
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden"><div class="flex-1 overflow-y-auto"><table class="w-full text-left border-collapse"><thead><tr class="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-200 sticky top-0 z-10"><th class="p-3 font-bold">ชื่อสินค้า</th><th class="p-3 font-bold text-center">คงเหลือ</th><th class="p-3 font-bold text-center">แจ้งเตือน</th><th class="p-3 font-bold text-center">จัดการ</th></tr></thead><tbody class="divide-y divide-gray-100"><tr v-if="paginatedInventory.length === 0"><td colspan="4" class="text-center py-10 text-gray-400 font-bold">ไม่พบข้อมูล</td></tr><tr v-for="inv in paginatedInventory" :key="inv.id" class="hover:bg-gray-50 text-sm"><td class="p-3 font-black text-gray-800">{{ inv.item_name }}</td><td class="p-3 text-center"><span :class="Number(inv.stock_qty) <= Number(inv.low_alert) ? 'text-red-600 font-black animate-pulse' : 'text-green-600 font-bold'">{{ inv.stock_qty }} {{ inv.unit }}</span></td><td class="p-3 text-center text-gray-400 text-xs">{{ inv.low_alert }} {{ inv.unit }}</td><td class="p-3 text-center"><button @click="openAddStockModal(inv)" class="text-green-500 hover:text-green-700 mr-3" title="เติมสต๊อก"><i class="fa-solid fa-boxes-packing"></i></button><button @click="openInventoryModal('edit', inv)" class="text-blue-500 hover:text-blue-700 mr-3"><i class="fa-solid fa-pen"></i></button><button @click="deleteInventory(inv)" class="text-red-500 hover:text-red-700"><i class="fa-solid fa-trash"></i></button></td></tr></tbody></table></div><div class="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0"><span class="text-xs text-gray-500 font-bold">หน้า {{ currentPageInv }} จาก {{ totalInvPages }}</span><div class="flex gap-2"><button @click="currentPageInv--" :disabled="currentPageInv === 1" class="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold disabled:opacity-50">ก่อนหน้า</button><button @click="currentPageInv++" :disabled="currentPageInv === totalInvPages" class="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold disabled:opacity-50">ถัดไป</button></div></div></div>
        </div>

        <div v-else-if="settingTab === 'members'" class="animate-[fadeIn_0.2s_ease-out] flex flex-col h-full max-w-6xl mx-auto">
          <div class="flex justify-between items-center mb-4 shrink-0"><h3 class="text-xl font-black text-gray-800">สมาชิกลูกค้า <span class="text-yellow-500 text-sm">({{ filteredMembers?.length || 0 }})</span></h3><div class="flex gap-2"><input v-model="searchMemberQuery" type="text" placeholder="เบอร์/ชื่อ..." class="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold w-40 md:w-48 outline-none"><button @click="openMemberModal('add')" class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm active:scale-95"><i class="fa-solid fa-user-plus"></i><span class="hidden md:inline ml-2">เพิ่มสมาชิก</span></button></div></div>
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden"><div class="flex-1 overflow-y-auto"><table class="w-full text-left border-collapse"><thead><tr class="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-200 sticky top-0 z-10"><th class="p-3 font-bold">เบอร์ / ชื่อ</th><th class="p-3 font-bold text-center">ระดับ</th><th class="p-3 font-bold text-right">แต้มสะสม</th><th class="p-3 font-bold text-center">หมดอายุ</th><th class="p-3 font-bold text-center">จัดการ</th></tr></thead><tbody class="divide-y divide-gray-100"><tr v-if="paginatedMembers.length === 0"><td colspan="5" class="text-center py-10 text-gray-400 font-bold">ไม่พบข้อมูล</td></tr><tr v-for="m in paginatedMembers" :key="m.phone" class="hover:bg-gray-50 text-sm"><td class="p-3"><div class="font-black text-gray-800">{{ m.phone }}</div><div class="text-xs text-gray-500">{{ m.name }}</div></td><td class="p-3 text-center"><span class="px-2 py-0.5 rounded text-[9px] font-bold bg-gray-100 border">{{ m.tier }}</span></td><td class="p-3 text-right font-black text-blue-600">{{ Number(m.points).toLocaleString() }}</td><td class="p-3 text-center text-xs text-gray-500">{{ formatDate(m.expiry_date) }}</td><td class="p-3 text-center"><button @click="openMemberModal('edit', m)" class="text-blue-500 hover:text-blue-700 mr-3"><i class="fa-solid fa-pen"></i></button><button @click="deleteMember(m)" class="text-red-500 hover:text-red-700"><i class="fa-solid fa-trash"></i></button></td></tr></tbody></table></div><div class="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0"><span class="text-xs text-gray-500 font-bold">หน้า {{ currentPageMember }} จาก {{ totalMemberPages }}</span><div class="flex gap-2"><button @click="currentPageMember--" :disabled="currentPageMember === 1" class="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold disabled:opacity-50">ก่อนหน้า</button><button @click="currentPageMember++" :disabled="currentPageMember === totalMemberPages" class="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold disabled:opacity-50">ถัดไป</button></div></div></div>
        </div>

        <div v-else-if="settingTab === 'tables'" class="animate-[fadeIn_0.2s_ease-out] flex flex-col h-full max-w-4xl mx-auto">
          <div class="flex justify-between items-center mb-4 shrink-0"><h3 class="text-xl font-black text-gray-800">จัดการผังโต๊ะ <span class="text-gray-400 text-sm">({{ tablesList?.length || 0 }})</span></h3><button @click="openTableModal('add')" class="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg font-bold shadow-sm active:scale-95"><i class="fa-solid fa-plus mr-1"></i> เพิ่มโต๊ะ</button></div>
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden"><div class="flex-1 overflow-y-auto"><table class="w-full text-left border-collapse"><thead><tr class="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-200 sticky top-0 z-10"><th class="p-3 font-bold">ชื่อโต๊ะ</th><th class="p-3 font-bold">โซน/รายละเอียด</th><th class="p-3 font-bold text-center">จัดการ</th></tr></thead><tbody class="divide-y divide-gray-100"><tr v-if="paginatedTables.length === 0"><td colspan="3" class="text-center py-10 text-gray-400 font-bold">ไม่พบข้อมูล</td></tr><tr v-for="t in paginatedTables" :key="t.id" class="hover:bg-gray-50 text-sm"><td class="p-3 font-black text-gray-800"><i class="fa-solid fa-chair text-gray-400 mr-2"></i>{{ t.table_name }}</td><td class="p-3 text-gray-500">{{ t.description || '-' }}</td><td class="p-3 text-center"><button @click="openTableModal('edit', t)" class="text-blue-500 hover:text-blue-700 mr-4"><i class="fa-solid fa-pen"></i></button><button @click="deleteTable(t)" class="text-red-500 hover:text-red-700"><i class="fa-solid fa-trash"></i></button></td></tr></tbody></table></div><div class="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0"><span class="text-xs text-gray-500 font-bold">หน้า {{ currentPageTable }} จาก {{ totalTablePages }}</span><div class="flex gap-2"><button @click="currentPageTable--" :disabled="currentPageTable === 1" class="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold disabled:opacity-50">ก่อนหน้า</button><button @click="currentPageTable++" :disabled="currentPageTable === totalTablePages" class="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold disabled:opacity-50">ถัดไป</button></div></div></div>
        </div>

        <div v-else-if="settingTab === 'users'" class="animate-[fadeIn_0.2s_ease-out] flex flex-col h-full max-w-5xl mx-auto">
          <div class="flex justify-between items-center mb-4 shrink-0"><h3 class="text-xl font-black text-gray-800">ผู้ใช้งานระบบ <span class="text-gray-400 text-sm">({{ usersList?.length || 0 }})</span></h3><button @click="openUserModal('add')" class="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg font-bold shadow-sm active:scale-95"><i class="fa-solid fa-user-plus mr-1"></i> เพิ่มพนักงาน</button></div>
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden"><div class="flex-1 overflow-y-auto"><table class="w-full text-left border-collapse"><thead><tr class="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-200 sticky top-0 z-10"><th class="p-3 font-bold">Username</th><th class="p-3 font-bold text-center">ตำแหน่ง</th><th class="p-3 font-bold">สิทธิ์การเข้าถึง</th><th class="p-3 font-bold text-center">จัดการ</th></tr></thead><tbody class="divide-y divide-gray-100"><tr v-if="paginatedUsers.length === 0"><td colspan="4" class="text-center py-10 text-gray-400 font-bold">ไม่พบข้อมูล</td></tr><tr v-for="u in paginatedUsers" :key="u.id" class="hover:bg-gray-50 text-sm"><td class="p-3 font-black text-gray-800"><i class="fa-solid fa-circle-user text-gray-400 mr-2"></i>{{ u.username }}</td><td class="p-3 text-center"><span class="px-2 py-0.5 bg-gray-100 border rounded text-[9px] font-bold">{{ u.role }}</span></td><td class="p-3"><div class="flex flex-wrap gap-1"><span v-for="page in (u.allowed_pages ? u.allowed_pages.split(',') : [])" :key="page" class="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded uppercase">{{ page }}</span></div></td><td class="p-3 text-center"><button @click="openUserModal('edit', u)" class="text-blue-500 hover:text-blue-700 mr-4"><i class="fa-solid fa-pen"></i></button><button @click="deleteUser(u)" class="text-red-500 hover:text-red-700"><i class="fa-solid fa-trash"></i></button></td></tr></tbody></table></div><div class="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0"><span class="text-xs text-gray-500 font-bold">หน้า {{ currentPageUser }} จาก {{ totalUserPages }}</span><div class="flex gap-2"><button @click="currentPageUser--" :disabled="currentPageUser === 1" class="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold disabled:opacity-50">ก่อนหน้า</button><button @click="currentPageUser++" :disabled="currentPageUser === totalUserPages" class="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold disabled:opacity-50">ถัดไป</button></div></div></div>
        </div>

        <div v-else-if="settingTab === 'options'" class="animate-[fadeIn_0.2s_ease-out] max-w-4xl mx-auto h-full overflow-hidden flex flex-col">
          <h3 class="text-xl font-black text-gray-800 mb-4 shrink-0">หมวดหมู่ & ตำแหน่งพนักงาน</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden"><div class="p-4 bg-orange-50 border-b border-orange-100"><h4 class="font-black text-orange-600 mb-3"><i class="fa-solid fa-layer-group"></i> หมวดหมู่เมนู</h4><form @submit.prevent="addQuickOption('Category')" class="flex gap-2"><input v-model="quickCategory" type="text" placeholder="เพิ่มหมวดหมู่..." class="flex-1 px-3 py-2 rounded-lg border border-orange-200 text-sm font-bold outline-none"><button type="submit" :disabled="!quickCategory" class="bg-orange-500 text-white px-3 rounded-lg"><i class="fa-solid fa-plus"></i></button></form></div><div class="flex-1 overflow-y-auto p-4 space-y-2"><div v-for="opt in categoryOptions" :key="opt.id" class="flex justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"><span class="font-bold text-sm">{{ opt.option_value }}</span><button @click="deleteOption(opt)" class="text-red-400 hover:text-red-600"><i class="fa-solid fa-trash"></i></button></div></div></div>
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden"><div class="p-4 bg-blue-50 border-b border-blue-100"><h4 class="font-black text-blue-600 mb-3"><i class="fa-solid fa-id-badge"></i> ตำแหน่ง (Role)</h4><form @submit.prevent="addQuickOption('Role')" class="flex gap-2"><input v-model="quickRole" type="text" placeholder="เพิ่มตำแหน่ง..." class="flex-1 px-3 py-2 rounded-lg border border-blue-200 text-sm font-bold outline-none"><button type="submit" :disabled="!quickRole" class="bg-blue-500 text-white px-3 rounded-lg"><i class="fa-solid fa-plus"></i></button></form></div><div class="flex-1 overflow-y-auto p-4 space-y-2"><div v-for="opt in roleOptions" :key="opt.id" class="flex justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"><span class="font-bold text-sm">{{ opt.option_value }}</span><button @click="deleteOption(opt)" class="text-red-400 hover:text-red-600"><i class="fa-solid fa-trash"></i></button></div></div></div>
          </div>
        </div>

      </div>
    </div>

    <div v-if="showMenuModal" class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-[fadeIn_0.2s_ease-out]">
        <h2 class="text-xl font-black mb-4">{{ menuForm.action === 'add' ? 'เพิ่มเมนู' : 'แก้ไขเมนู' }}</h2>
        <form @submit.prevent="submitMenuForm" class="space-y-3 text-sm">
          <div><label class="block font-bold text-gray-500 mb-1">ชื่อเมนู</label><input v-model="menuForm.menu_name" required class="w-full bg-gray-50 border rounded-lg px-3 py-2 outline-none font-bold"></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="block font-bold text-gray-500 mb-1">หมวดหมู่</label><select v-model="menuForm.category" required class="w-full bg-gray-50 border rounded-lg px-3 py-2 outline-none font-bold"><option v-for="c in categoryOptions" :key="c.id" :value="c.option_value">{{ c.option_value }}</option></select></div>
            <div><label class="block font-bold text-gray-500 mb-1">ราคา</label><input v-model.number="menuForm.price" type="number" required class="w-full bg-gray-50 border rounded-lg px-3 py-2 outline-none font-bold"></div>
          </div>
          <div><label class="block font-bold text-gray-500 mb-1">ผูกสต๊อกคลัง</label><select v-model="menuForm.inventory_id" class="w-full bg-gray-50 border rounded-lg px-3 py-2 outline-none"><option value="">- ไม่ผูก -</option><option v-for="i in inventoryList" :key="i.id" :value="i.id">{{ i.item_name }}</option></select></div>
          <div><label class="block font-bold text-gray-500 mb-1">สถานะ</label><select v-model="menuForm.status" class="w-full bg-gray-50 border rounded-lg px-3 py-2 outline-none font-bold"><option value="Available">พร้อมขาย</option><option value="Out of Stock">ของหมด</option></select></div>
          <div><label class="block font-bold text-gray-500 mb-1">รูปภาพ URL</label><input v-model="menuForm.image_url" class="w-full bg-gray-50 border rounded-lg px-3 py-2 outline-none"></div>
          <div class="flex gap-2 pt-3"><button type="button" @click="showMenuModal=false" class="flex-1 py-2 bg-gray-100 rounded-lg font-bold">ยกเลิก</button><button type="submit" class="flex-1 py-2 bg-primary text-white rounded-lg font-bold">บันทึก</button></div>
        </form>
      </div>
    </div>

    <div v-if="showInventoryModal" class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"><div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6"><h2 class="text-xl font-black mb-4">{{ inventoryForm.action === 'add' ? 'เพิ่มสินค้าคลัง' : 'แก้ไข' }}</h2><form @submit.prevent="submitInventoryForm" class="space-y-3 text-sm"><div><label class="block font-bold text-gray-500 mb-1">ชื่อสินค้า</label><input v-model="inventoryForm.item_name" required class="w-full border rounded-lg px-3 py-2 font-bold"></div><div v-if="inventoryForm.action === 'add'"><label class="block font-bold text-gray-500 mb-1">จำนวนเริ่มต้น</label><input v-model.number="inventoryForm.stock_qty" required type="number" class="w-full border rounded-lg px-3 py-2 font-bold"></div><div class="grid grid-cols-2 gap-3"><div><label class="block font-bold text-gray-500 mb-1">หน่วยนับ</label><input v-model="inventoryForm.unit" required class="w-full border rounded-lg px-3 py-2"></div><div><label class="block font-bold text-gray-500 mb-1">เตือนเมื่อต่ำกว่า</label><input v-model.number="inventoryForm.low_alert" type="number" required class="w-full border rounded-lg px-3 py-2"></div></div><div class="flex gap-2 pt-3"><button type="button" @click="showInventoryModal=false" class="flex-1 py-2 bg-gray-100 rounded-lg font-bold">ยกเลิก</button><button type="submit" class="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold">บันทึก</button></div></form></div></div>
    <div v-if="showAddStockModal" class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"><div class="bg-white rounded-3xl shadow-2xl w-full max-w-xs p-6 text-center"><h2 class="text-xl font-black mb-2">เติมสต๊อก</h2><p class="font-bold text-gray-500 mb-4">{{ inventoryForm.item_name }} (มี {{ inventoryForm.stock_qty }})</p><form @submit.prevent="submitAddStock"><div><input v-model.number="inventoryForm.add_qty" type="number" min="1" required placeholder="+ จำนวน" class="w-full border rounded-xl px-4 py-3 text-center text-xl font-black mb-4 focus:border-green-500 outline-none"></div><div class="flex gap-2"><button type="button" @click="showAddStockModal=false" class="flex-1 py-2 bg-gray-100 rounded-lg font-bold">ยกเลิก</button><button type="submit" class="flex-1 py-2 bg-green-500 text-white rounded-lg font-bold">เพิ่มสต๊อก</button></div></form></div></div>
    <div v-if="showLogModal" class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"><div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col overflow-hidden"><div class="p-4 border-b flex justify-between items-center"><h2 class="font-black text-lg">ประวัติคลัง</h2><button @click="showLogModal=false" class="text-gray-400 hover:text-red-500"><i class="fa-solid fa-xmark"></i></button></div><div class="flex-1 overflow-y-auto p-4"><table class="w-full text-left text-sm border-collapse"><thead><tr class="bg-gray-100"><th class="p-2">เวลา</th><th class="p-2">สินค้า</th><th class="p-2">เหตุการณ์</th><th class="p-2 text-center">จำนวน</th></tr></thead><tbody class="divide-y"><tr v-for="l in paginatedLogs" :key="l.id"> <td class="p-2 text-xs">{{ new Date(l.created_at).toLocaleString('th-TH') }}</td> <td class="p-2 font-bold">{{ l.item_name }}</td> <td class="p-2 text-xs">{{ l.action }}</td> <td class="p-2 text-center font-black" :class="l.qty_change > 0 ? 'text-green-500' : 'text-red-500'">{{ l.qty_change }}</td> </tr></tbody></table></div><div class="p-4 border-t flex justify-between bg-gray-50"><button @click="currentPageLog--" :disabled="currentPageLog===1" class="px-3 py-1 bg-white border rounded">ก่อนหน้า</button><button @click="currentPageLog++" :disabled="currentPageLog===totalLogPages" class="px-3 py-1 bg-white border rounded">ถัดไป</button></div></div></div>
    
    <div v-if="showMemberModal" class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"><div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6"><h2 class="text-xl font-black mb-4">{{ memberForm.action === 'add' ? 'เพิ่มสมาชิก' : 'แก้ไขสมาชิก' }}</h2><form @submit.prevent="submitMemberForm" class="space-y-3 text-sm"><div><label class="block font-bold text-gray-500 mb-1">เบอร์โทร</label><input v-model="memberForm.phone" required :disabled="memberForm.action === 'edit'" class="w-full border rounded-lg px-3 py-2 font-bold"></div><div><label class="block font-bold text-gray-500 mb-1">ชื่อ</label><input v-model="memberForm.name" required class="w-full border rounded-lg px-3 py-2 font-bold"></div><div v-if="memberForm.action === 'edit'" class="grid grid-cols-2 gap-3"><div><label class="block font-bold text-gray-500 mb-1">แต้ม</label><input v-model.number="memberForm.points" type="number" required class="w-full border rounded-lg px-3 py-2 font-bold"></div><div><label class="block font-bold text-gray-500 mb-1">ระดับ</label><select v-model="memberForm.tier" class="w-full border rounded-lg px-3 py-2"><option value="Member">Member</option><option value="Silver">Silver</option><option value="Gold">Gold</option></select></div></div><div class="flex gap-2 pt-3"><button type="button" @click="showMemberModal=false" class="flex-1 py-2 bg-gray-100 rounded-lg font-bold">ยกเลิก</button><button type="submit" class="flex-1 py-2 bg-yellow-500 text-white rounded-lg font-bold">บันทึก</button></div></form></div></div>
    
    <div v-if="showTableModal" class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"><div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6"><h2 class="text-xl font-black mb-4">{{ tableForm.action === 'add' ? 'เพิ่มโต๊ะ' : 'แก้ไข' }}</h2><form @submit.prevent="submitTableForm" class="space-y-3 text-sm"><div><label class="block font-bold text-gray-500 mb-1">ชื่อโต๊ะ</label><input v-model="tableForm.table_name" required class="w-full border rounded-lg px-3 py-2 font-bold"></div><div><label class="block font-bold text-gray-500 mb-1">คำอธิบาย</label><input v-model="tableForm.description" class="w-full border rounded-lg px-3 py-2"></div><div class="flex gap-2 pt-3"><button type="button" @click="showTableModal=false" class="flex-1 py-2 bg-gray-100 rounded-lg font-bold">ยกเลิก</button><button type="submit" class="flex-1 py-2 bg-gray-900 text-white rounded-lg font-bold">บันทึก</button></div></form></div></div>
    <div v-if="showUserModal" class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <h2 class="text-xl font-black mb-4 flex items-center"><div class="w-10 h-10 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center mr-3 text-sm"><i class="fa-solid fa-user-gear"></i></div>{{ userForm.action === 'add' ? 'เพิ่มพนักงาน' : 'แก้ไขสิทธิ์' }}</h2>
        <form @submit.prevent="submitUserForm" class="space-y-3 text-sm">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-500 mb-1 uppercase text-[10px]">Username</label>
              <input v-model="userForm.username" required :disabled="userForm.action === 'edit'" class="w-full bg-gray-50 border rounded-lg px-3 py-2 font-bold outline-none focus:border-gray-900">
            </div>
            <div>
              <label class="block font-bold text-gray-500 mb-1 uppercase text-[10px]">Password</label>
              <input v-model="userForm.password" :required="userForm.action === 'add'" :placeholder="userForm.action === 'edit' ? 'เว้นว่างถ้าไม่เปลี่ยน' : 'รหัสผ่านใหม่'" class="w-full bg-gray-50 border rounded-lg px-3 py-2 font-bold outline-none focus:border-gray-900">
            </div>
          </div>
          <div><label class="block font-bold text-gray-500 mb-1 uppercase text-[10px]">ตำแหน่ง (Role)</label><select v-model="userForm.role" required class="w-full bg-gray-50 border rounded-lg px-3 py-2 font-bold outline-none focus:border-gray-900"><option v-for="r in roleOptions" :key="r.id" :value="r.option_value">{{ r.option_value }}</option></select></div>
          <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <label class="block font-black text-blue-800 mb-2 uppercase text-[10px]">สิทธิ์การเข้าถึงหน้า</label>
            <div class="grid grid-cols-2 gap-2 text-blue-900 font-bold">
              <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" v-model="userForm.allowed_pages" value="dashboard" class="accent-blue-600"> Dashboard</label>
              <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" v-model="userForm.allowed_pages" value="pos" class="accent-blue-600"> POS</label>
              <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" v-model="userForm.allowed_pages" value="tables" class="accent-blue-600"> ผังโต๊ะ</label>
              <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" v-model="userForm.allowed_pages" value="kitchen" class="accent-blue-600"> ห้องครัว</label>
              <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" v-model="userForm.allowed_pages" value="history" class="accent-blue-600"> บิล</label>
              <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" v-model="userForm.allowed_pages" value="reports" class="accent-blue-600"> รายงาน</label>
              <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" v-model="userForm.allowed_pages" value="settings" class="accent-blue-600"> ตั้งค่า</label>
            </div>
          </div>
          <div class="flex gap-2 pt-3"><button type="button" @click="showUserModal=false" class="flex-1 py-2 bg-gray-100 rounded-lg font-bold">ยกเลิก</button><button type="submit" class="flex-1 py-2 bg-gray-900 text-white rounded-lg font-black shadow-lg active:scale-95 transition-all">บันทึกสิทธิ์</button></div>
        </form>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import Swal from 'sweetalert2'

const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2500, timerProgressBar: true })

// 🌟 Store ID สำหรับ SaaS
const myStoreId = ref(null)
const settingTab = ref('store')
const isLoading = ref(true)

const menus = ref([]); const tablesList = ref([]); const membersList = ref([]); const inventoryList = ref([]); const inventoryLogs = ref([]); const usersList = ref([]); const optionsList = ref([]);
const storeInfo = ref(null)
const storeSettings = ref({})
const editSettings = ref({ StoreName: '', Branch: '', Address: '', Phone: '', TaxID: '', FooterText: '', PromptPayID: '', PaymentMode: 'PromptPay', BankQRImageURL: '', BankAccountName: '', PointEarnRate: '100', TierSilverSpent: '5000', TierGoldSpent: '20000' })

// Search / Filter
const searchMenuQuery = ref(''); const filterMenuCategory = ref('All'); 
const searchInventoryQuery = ref(''); const searchMemberQuery = ref('');

// Pagination
const currentPageMenu = ref(1); const itemsPerPageMenu = 10; 
const currentPageInv = ref(1); const itemsPerPageInv = 15; 
const currentPageMember = ref(1); const itemsPerPageMember = 10; 
const currentPageTable = ref(1); const itemsPerPageTable = 10; 
const currentPageUser = ref(1); const itemsPerPageUser = 10; 
const currentPageLog = ref(1); const itemsPerPageLog = 15;

// Modals
const showMenuModal = ref(false); const showInventoryModal = ref(false); const showAddStockModal = ref(false); const showLogModal = ref(false); const showMemberModal = ref(false); const showTableModal = ref(false); const showUserModal = ref(false);
const menuForm = ref({}); const inventoryForm = ref({}); const memberForm = ref({}); const tableForm = ref({}); const userForm = ref({});
const quickCategory = ref(''); const quickRole = ref('');

// Computed
const categoryOptions = computed(() => (optionsList.value || []).filter(o => o?.option_type === 'Category'))
const roleOptions = computed(() => (optionsList.value || []).filter(o => o?.option_type === 'Role'))

const filteredMenus = computed(() => { let list = menus.value || []; if (filterMenuCategory.value !== 'All') list = list.filter(m => m?.category === filterMenuCategory.value); if (searchMenuQuery.value) { const q = searchMenuQuery.value.toLowerCase(); list = list.filter(m => m?.menu_name?.toLowerCase().includes(q)) } return list })
const paginatedMenus = computed(() => filteredMenus.value.slice((currentPageMenu.value - 1) * itemsPerPageMenu, currentPageMenu.value * itemsPerPageMenu))
const totalMenuPages = computed(() => Math.ceil(filteredMenus.value.length / itemsPerPageMenu) || 1)

const filteredInventory = computed(() => { let list = inventoryList.value || []; if (searchInventoryQuery.value) list = list.filter(i => i?.item_name?.toLowerCase().includes(searchInventoryQuery.value.toLowerCase())); return list })
const paginatedInventory = computed(() => filteredInventory.value.slice((currentPageInv.value - 1) * itemsPerPageInv, currentPageInv.value * itemsPerPageInv))
const totalInvPages = computed(() => Math.ceil(filteredInventory.value.length / itemsPerPageInv) || 1)

const paginatedLogs = computed(() => (inventoryLogs.value || []).slice((currentPageLog.value - 1) * itemsPerPageLog, currentPageLog.value * itemsPerPageLog))
const totalLogPages = computed(() => Math.ceil((inventoryLogs.value || []).length / itemsPerPageLog) || 1)

const filteredMembers = computed(() => { let list = membersList.value || []; if (searchMemberQuery.value) list = list.filter(m => m?.phone?.includes(searchMemberQuery.value) || m?.name?.toLowerCase().includes(searchMemberQuery.value.toLowerCase())); return list })
const paginatedMembers = computed(() => filteredMembers.value.slice((currentPageMember.value - 1) * itemsPerPageMember, currentPageMember.value * itemsPerPageMember))
const totalMemberPages = computed(() => Math.ceil(filteredMembers.value.length / itemsPerPageMember) || 1)

const paginatedTables = computed(() => (tablesList.value || []).slice((currentPageTable.value - 1) * itemsPerPageTable, currentPageTable.value * itemsPerPageTable))
const totalTablePages = computed(() => Math.ceil((tablesList.value || []).length / itemsPerPageTable) || 1)

const paginatedUsers = computed(() => (usersList.value || []).slice((currentPageUser.value - 1) * itemsPerPageUser, currentPageUser.value * itemsPerPageUser))
const totalUserPages = computed(() => Math.ceil((usersList.value || []).length / itemsPerPageUser) || 1)

const formatDate = (dateStr) => { if (!dateStr) return '-'; return new Date(dateStr).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }) }
const getDaysLeft = () => { if(!storeInfo.value?.expires_at) return 999; return Math.ceil((new Date(storeInfo.value.expires_at) - new Date()) / (1000 * 60 * 60 * 24)) }

// 📡 Load Data (SaaS)
const loadAllData = async () => {
  if (!myStoreId.value) return;
  isLoading.value = true
  try {
    const { data: sInfo } = await supabase.from('stores').select('*').eq('id', myStoreId.value).single()
    if(sInfo) storeInfo.value = sInfo

    const [ resMenus, resTables, resMembers, resInv, resLogs, resUsers, resOptions, resSettings ] = await Promise.all([
      supabase.from('menus').select('*').eq('store_id', myStoreId.value).order('id', { ascending: false }),
      supabase.from('tables').select('*').eq('store_id', myStoreId.value).order('table_name'),
      supabase.from('members').select('*').eq('store_id', myStoreId.value).order('created_at', { ascending: false }),
      supabase.from('inventory').select('*').eq('store_id', myStoreId.value).order('item_name'),
      supabase.from('inventory_logs').select('*').eq('store_id', myStoreId.value).order('created_at', { ascending: false }).limit(50),
      supabase.from('users').select('*').eq('store_id', myStoreId.value).order('id'),
      supabase.from('options').select('*').eq('store_id', myStoreId.value),
      supabase.from('settings').select('*').eq('store_id', myStoreId.value)
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
  } catch (error) { console.log(error) } finally { isLoading.value = false }
}

const saveStoreSettings = async () => {
  isLoading.value = true
  const { data: existingSettings } = await supabase.from('settings').select('setting_key').eq('store_id', myStoreId.value)
  const existingKeys = existingSettings ? existingSettings.map(s => s.setting_key) : []

  for (const [key, value] of Object.entries(editSettings.value)) {
    if (existingKeys.includes(key)) await supabase.from('settings').update({ setting_value: String(value) }).eq('store_id', myStoreId.value).eq('setting_key', key)
    else await supabase.from('settings').insert([{ store_id: myStoreId.value, setting_key: key, setting_value: String(value) }])
  }
  
  isLoading.value = false
  Toast.fire({ icon: 'success', title: 'บันทึกสำเร็จ!' })
  loadAllData()
}

// --- CRUD Operations (SaaS Ready) ---
const openMenuModal = (action, menu = null) => { menuForm.value = action === 'add' ? { menu_name: '', category: '', price: 0, type: 'Normal', inventory_id: '', image_url: '', status: 'Available', action: 'add' } : { ...menu, action: 'edit' }; showMenuModal.value = true }
const submitMenuForm = async () => {
  const payload = { store_id: myStoreId.value, menu_name: menuForm.value.menu_name, category: menuForm.value.category, price: menuForm.value.price, type: menuForm.value.type, inventory_id: menuForm.value.inventory_id || null, image_url: menuForm.value.image_url, status: menuForm.value.status }
  let error; if (menuForm.value.action === 'add') { const res = await supabase.from('menus').insert([payload]); error = res.error } else { const res = await supabase.from('menus').update(payload).eq('id', menuForm.value.id); error = res.error }
  showMenuModal.value = false; if (error) Toast.fire({ icon: 'error', title: error.message }); else { Toast.fire({ icon: 'success', title: 'สำเร็จ' }); loadAllData() }
}
const deleteMenu = async (menu) => { const res = await Swal.fire({ title: 'ลบเมนู?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' }); if (res.isConfirmed) { await supabase.from('menus').delete().eq('id', menu.id); Toast.fire({ icon: 'success', title: 'ลบสำเร็จ' }); loadAllData() } }

const openInventoryModal = (action, inv = null) => { inventoryForm.value = action === 'add' ? { item_name: '', stock_qty: '', low_alert: '', unit: '', action: 'add' } : { ...inv, action: 'edit' }; showInventoryModal.value = true }
const submitInventoryForm = async () => {
  const payload = { store_id: myStoreId.value, item_name: inventoryForm.value.item_name, stock_qty: inventoryForm.value.stock_qty, low_alert: inventoryForm.value.low_alert, unit: inventoryForm.value.unit }
  let error; if(inventoryForm.value.action === 'add') { const res = await supabase.from('inventory').insert([payload]); error = res.error } else { const res = await supabase.from('inventory').update(payload).eq('id', inventoryForm.value.id); error = res.error }
  showInventoryModal.value = false; if (error) Toast.fire({ icon: 'error', title: error.message }); else { Toast.fire({ icon: 'success', title: 'สำเร็จ' }); loadAllData() }
}
const deleteInventory = async (inv) => { const res = await Swal.fire({ title: 'ลบสินค้า?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' }); if (res.isConfirmed) { await supabase.from('inventory').delete().eq('id', inv.id); Toast.fire({ icon: 'success', title: 'ลบสำเร็จ' }); loadAllData() } }
const openAddStockModal = (inv) => { inventoryForm.value = { ...inv, add_qty: '', action: 'addStock' }; showAddStockModal.value = true }
const submitAddStock = async () => {
  const newQty = Number(inventoryForm.value.stock_qty) + Number(inventoryForm.value.add_qty)
  await supabase.from('inventory').update({ stock_qty: newQty }).eq('id', inventoryForm.value.id)
  await supabase.from('inventory_logs').insert([{ store_id: myStoreId.value, item_name: inventoryForm.value.item_name, action: 'เติมสต๊อก', qty_change: inventoryForm.value.add_qty, remaining: newQty }])
  showAddStockModal.value = false; Toast.fire({ icon: 'success', title: 'เติมสต๊อกสำเร็จ' }); loadAllData()
}

const openMemberModal = (action, member = null) => { memberForm.value = action === 'add' ? { phone: '', name: '', points: 0, tier: 'Member', expiry_date: '', points_expiry_date: '', action: 'add' } : { ...member, action: 'edit' }; showMemberModal.value = true }
const submitMemberForm = async () => {
  const payload = { store_id: myStoreId.value, phone: memberForm.value.phone, name: memberForm.value.name, points: memberForm.value.points, tier: memberForm.value.tier, expiry_date: memberForm.value.expiry_date || null, points_expiry_date: memberForm.value.points_expiry_date || null }
  let error; if(memberForm.value.action === 'add') { const res = await supabase.from('members').insert([payload]); error = res.error } else { const res = await supabase.from('members').update(payload).eq('phone', memberForm.value.phone).eq('store_id', myStoreId.value); error = res.error }
  showMemberModal.value = false; if (error) Toast.fire({ icon: 'error', title: error.message }); else { Toast.fire({ icon: 'success', title: 'สำเร็จ' }); loadAllData() }
}
const deleteMember = async (member) => { const res = await Swal.fire({ title: 'ลบสมาชิก?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' }); if (res.isConfirmed) { await supabase.from('members').delete().eq('phone', member.phone).eq('store_id', myStoreId.value); Toast.fire({ icon: 'success', title: 'ลบสำเร็จ' }); loadAllData() } }

const openTableModal = (action, table = null) => { tableForm.value = action === 'add' ? { table_name: '', description: '', action: 'add' } : { ...table, action: 'edit' }; showTableModal.value = true }
const submitTableForm = async () => {
  const payload = { store_id: myStoreId.value, table_name: tableForm.value.table_name, description: tableForm.value.description }
  if(tableForm.value.action === 'add') await supabase.from('tables').insert([payload]); else await supabase.from('tables').update(payload).eq('id', tableForm.value.id)
  showTableModal.value = false; Toast.fire({ icon: 'success', title: 'สำเร็จ' }); loadAllData()
}
const deleteTable = async (table) => { if (table.status !== 'Available') return Toast.fire({ icon: 'error', title: 'ลบไม่ได้ มีลูกค้าอยู่' }); const res = await Swal.fire({ title: 'ลบโต๊ะ?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' }); if (res.isConfirmed) { await supabase.from('tables').delete().eq('id', table.id); Toast.fire({ icon: 'success', title: 'ลบสำเร็จ' }); loadAllData() } }

const openUserModal = (action, user = null) => { userForm.value = action === 'add' ? { username: '', password: '', role: '', allowed_pages: [], action: 'add' } : { ...user, allowed_pages: user.allowed_pages ? user.allowed_pages.split(',') : [], action: 'edit' }; showUserModal.value = true }
// 🔐 เพิ่มฟังก์ชันเข้ารหัส (ใส่ไว้บนๆ ใน <script setup>)
const hashPassword = async (password) => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const openUserModal = (action, user = null) => { 
  userForm.value = action === 'add' 
    ? { username: '', password: '', role: '', allowed_pages: [], action: 'add' } 
    : { ...user, password: '', allowed_pages: user.allowed_pages ? user.allowed_pages.split(',') : [], action: 'edit' }; 
  showUserModal.value = true 
}

const submitUserForm = async () => {
  const payload = { 
    store_id: myStoreId.value, 
    username: userForm.value.username, 
    role: userForm.value.role, 
    allowed_pages: userForm.value.allowed_pages.join(',') 
  }
  
  // 🔐 เข้ารหัสรหัสผ่านก่อนบันทึก
  if (userForm.value.password) {
    payload.password = await hashPassword(userForm.value.password)
  }

  let error; 
  if(userForm.value.action === 'add') { 
    const res = await supabase.from('users').insert([payload]); error = res.error 
  } else { 
    const res = await supabase.from('users').update(payload).eq('id', userForm.value.id); error = res.error 
  }
  showUserModal.value = false; 
  if(error) Toast.fire({ icon: 'error', title: error.message }); 
  else { Toast.fire({ icon: 'success', title: 'บันทึกสำเร็จ' }); loadAllData() }
}

const deleteUser = async (user) => { const res = await Swal.fire({ title: 'ลบพนักงาน?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' }); if (res.isConfirmed) { await supabase.from('users').delete().eq('id', user.id); Toast.fire({ icon: 'success', title: 'ลบสำเร็จ' }); loadAllData() } }

const addQuickOption = async (type) => {
  const val = type === 'Category' ? quickCategory.value : quickRole.value
  if (!val) return
  await supabase.from('options').insert([{ store_id: myStoreId.value, option_type: type, option_value: val }])
  quickCategory.value = ''; quickRole.value = ''; Toast.fire({ icon: 'success', title: 'เพิ่มสำเร็จ' }); loadAllData()
}
const deleteOption = async (opt) => { const res = await Swal.fire({ title: 'ลบตัวเลือก?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' }); if (res.isConfirmed) { await supabase.from('options').delete().eq('id', opt.id); Toast.fire({ icon: 'success', title: 'ลบสำเร็จ' }); loadAllData() } }

onMounted(() => {
  const savedUser = JSON.parse(localStorage.getItem('rmpro_user'))
  if (savedUser && savedUser.store_id) { myStoreId.value = savedUser.store_id; loadAllData() }
})
</script>

<style scoped> .no-scrollbar::-webkit-scrollbar { display: none; } </style>