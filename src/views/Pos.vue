<template>
  <div class="h-full flex flex-col lg:flex-row overflow-hidden relative bg-gray-50 font-sans text-gray-800">
    
    <div class="flex-1 flex flex-col min-w-0">
      <div class="bg-white shadow-sm px-6 py-3 flex gap-3 overflow-x-auto no-scrollbar shrink-0 z-10 border-b border-gray-100">
        <button v-for="cat in availableCategories" :key="cat" @click="selectedCategory = cat" 
          :class="['px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-all text-sm border', 
                   selectedCategory === cat ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-blue-50 hover:text-blue-600']">
          {{ cat }}
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 relative">
        <div v-if="isLoadingMenus" class="absolute inset-0 flex flex-col items-center justify-center text-blue-600">
          <i class="fa-solid fa-circle-notch fa-spin text-4xl mb-3"></i><p class="font-bold">กำลังโหลดข้อมูลเมนู...</p>
        </div>
        <div v-else class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          <div v-for="item in filteredMenus" :key="item.id" @click="addToCart(item)" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col cursor-pointer active:scale-95 transition-all group hover:shadow-lg hover:border-blue-500">
            <div class="h-36 bg-gray-100 relative overflow-hidden">
              <img v-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
              <div v-else class="w-full h-full flex items-center justify-center text-gray-300"><i class="fa-solid fa-image text-4xl"></i></div>
            </div>
            <div class="p-4 flex-1 flex flex-col justify-between">
              <h3 class="font-bold text-gray-800 text-sm line-clamp-2 leading-tight">{{ item.menu_name }}</h3>
              <p class="font-black text-blue-600 mt-2 text-lg">฿{{ Number(item.price).toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full lg:w-[400px] bg-white border-l border-gray-200 flex flex-col shadow-2xl z-20 shrink-0">
      
      <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
        <h2 class="text-xl font-black flex items-center text-gray-800"><i class="fa-solid fa-clipboard-list mr-2 text-blue-600"></i> บิลออเดอร์</h2>
        <button @click="clearTable" v-if="selectedTable" class="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center bg-gray-50 px-3 py-1.5 rounded-full"><i class="fa-solid fa-xmark mr-1"></i> พับบิล/ยกเลิก</button>
      </div>
      
      <div class="p-4 shrink-0 border-b border-gray-50 bg-white">
        <div class="flex gap-2">
          <button @click="openTableModal" class="flex-1 bg-white border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-2xl p-3 flex items-center justify-between transition-all group">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-colors" :class="selectedTable ? 'bg-emerald-500 shadow-md' : 'bg-gray-300'"><i class="fa-solid fa-chair text-lg"></i></div>
              <div class="text-left min-w-0">
                <p class="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">
                  {{ selectedTable ? (activeItems.length > 0 ? 'โต๊ะที่เลือก (มีลูกค้า)' : 'โต๊ะที่เลือก (เปิดบิลแล้ว)') : 'โต๊ะที่เลือก' }}
                </p>
                <p class="font-black text-gray-900 leading-none text-sm truncate">{{ selectedTable ? selectedTable.table_name : 'กดเลือกโต๊ะ' }}</p>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right text-gray-300 group-hover:text-blue-500"></i>
          </button>
          
          <button v-if="isProPlan" @click="generateQR" :disabled="!selectedTable" class="w-16 bg-white border-2 border-dashed border-blue-200 hover:border-blue-500 text-blue-600 disabled:opacity-50 disabled:bg-gray-50 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 shrink-0 shadow-sm" title="สร้าง QR Code ให้ลูกค้าสั่งอาหาร">
            <i class="fa-solid fa-qrcode text-lg mb-1"></i>
            <span class="text-[9px] font-black uppercase">QR โต๊ะ</span>
          </button>
          <button v-else disabled class="w-16 bg-gray-50 border-2 border-dashed border-gray-200 text-gray-400 rounded-2xl flex flex-col items-center justify-center shrink-0 cursor-not-allowed" title="แพ็กเกจ Standard ไม่สามารถสร้าง QR ได้">
            <i class="fa-solid fa-qrcode text-lg mb-1 opacity-50"></i>
            <span class="text-[9px] font-black uppercase opacity-50">PRO Only</span>
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto bg-white p-4 space-y-6 relative">
        <div v-if="activeItems.length > 0">
          <h3 class="text-xs font-black text-gray-400 mb-2 flex items-center uppercase tracking-widest"><i class="fa-solid fa-clock-rotate-left mr-1"></i> สั่งไปแล้ว</h3>
          <div class="space-y-2">
            <div v-for="item in activeItems" :key="item.id" class="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div class="flex-1 pr-2">
                <p class="font-bold text-sm text-gray-800 leading-tight">{{ item.menu_name }}</p>
                <p class="text-xs text-gray-500 font-bold mt-0.5">฿{{ Number(item.price).toLocaleString() }}</p>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <span class="font-black text-gray-700 text-sm bg-white px-2 py-1 rounded shadow-sm border border-gray-100">x{{ item.quantity }}</span>
                <button @click="voidItem(item)" class="text-gray-300 hover:text-red-500 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50"><i class="fa-solid fa-trash-can"></i></button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="cart.length > 0">
          <h3 class="text-xs font-black text-blue-600 mb-2 flex items-center uppercase tracking-widest"><i class="fa-solid fa-fire mr-1"></i> รายการใหม่</h3>
          <div class="space-y-2">
            <div v-for="(item, index) in cart" :key="index" class="bg-blue-50/50 border border-blue-200 p-3 rounded-xl shadow-sm">
              <p class="font-bold text-sm text-gray-900 leading-tight mb-3">{{ item.menu_name }}</p>
              <div class="flex justify-between items-center">
                <p class="text-sm font-black text-blue-600">฿{{ (item.price * item.qty).toLocaleString() }}</p>
                <div class="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
                  <button @click="updateQty(index, -1)" class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-md"><i class="fa-solid fa-minus text-xs"></i></button>
                  <span class="font-black w-8 text-center text-sm">{{ item.qty }}</span>
                  <button @click="updateQty(index, 1)" class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-md"><i class="fa-solid fa-plus text-xs"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!selectedTable" class="absolute inset-0 bg-white/80 backdrop-blur flex flex-col items-center justify-center text-gray-400 z-10">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3 shadow-inner"><i class="fa-solid fa-chair text-3xl text-gray-300"></i></div>
          <p class="font-bold text-sm">เลือกโต๊ะเพื่อเริ่มรับออเดอร์</p>
        </div>
      </div>

      <div class="p-5 bg-white border-t border-gray-100 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] shrink-0">
        <div class="flex justify-between items-end mb-4">
          <span class="text-sm font-bold text-gray-500 uppercase tracking-widest">ยอดรวมเบื้องต้น</span>
          <span class="font-black text-3xl text-gray-900 leading-none tracking-tight">฿{{ grandTotal.toLocaleString() }}</span>
        </div>
        
        <button v-if="cart.length > 0" @click="sendOrderToKitchen" :disabled="isSubmitting" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex justify-center items-center gap-2 text-lg">
          <i v-if="isSubmitting" class="fa-solid fa-circle-notch fa-spin"></i>
          <i v-else class="fa-solid fa-bell-concierge"></i> ยืนยัน / ส่งเข้าครัว
        </button>
        <button v-else-if="activeItems.length > 0" @click="openPayment" class="w-full bg-[#10b981] hover:bg-[#059669] text-white font-black py-4 rounded-xl shadow-lg shadow-green-500/30 transition-all active:scale-95 flex justify-center items-center gap-2 text-lg">
          <i class="fa-solid fa-cash-register"></i> ชำระเงิน (เช็คบิล)
        </button>
        <button v-else disabled class="w-full bg-gray-100 text-gray-400 font-black py-4 rounded-xl cursor-not-allowed border border-gray-200">เลือกรายการอาหารก่อน</button>
      </div>
    </div>

    <div v-if="showPaymentModal" class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div class="bg-gray-50 rounded-[2rem] shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        
        <div class="w-full md:w-1/2 bg-white p-6 md:p-8 flex flex-col border-r border-gray-100 overflow-y-auto no-scrollbar">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-black text-gray-800">ชำระเงิน</h2>
            <button @click="showPaymentModal = false" class="text-gray-400 hover:text-red-500 text-2xl"><i class="fa-solid fa-xmark"></i></button>
          </div>
          
          <div v-if="isProPlan" class="mb-5 bg-blue-50/50 p-5 rounded-2xl border border-blue-100 shadow-sm">
            <label class="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2 flex items-center"><i class="fa-solid fa-crown mr-2"></i> ระบบสมาชิกลูกค้า</label>
            <div class="flex gap-2 relative">
              <input type="tel" v-model="memberPhone" @keyup.enter="searchMember" placeholder="เบอร์โทรศัพท์..." class="flex-1 bg-white border border-blue-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold text-gray-700">
              <button @click="searchMember" class="bg-blue-600 hover:bg-blue-700 text-white w-12 rounded-xl font-bold shadow-sm transition-colors flex items-center justify-center"><i class="fa-solid fa-search"></i></button>
              <button @click="promptRegisterMember" class="bg-emerald-500 hover:bg-emerald-600 text-white w-12 rounded-xl font-bold shadow-sm transition-colors flex items-center justify-center" title="สมัครสมาชิกใหม่"><i class="fa-solid fa-user-plus"></i></button>
            </div>
            
            <div v-if="memberInfo" class="mt-3 bg-white p-4 rounded-xl border border-blue-200 flex flex-col gap-2 shadow-sm animate-[fadeIn_0.3s_ease-out]">
              <div class="flex justify-between items-center">
                <div>
                  <span class="font-black text-gray-800 text-lg">{{ memberInfo.name }}</span>
                  <span class="ml-2 px-2.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black rounded-lg shadow-sm border border-blue-200">MEMBER</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] text-gray-500 font-bold uppercase tracking-wide">แต้มสะสม</span>
                  <div class="font-black text-blue-600 text-xl leading-none">{{ memberInfo.points }} <span class="text-xs font-bold">Pts</span></div>
                </div>
              </div>
              <div class="flex items-center gap-2 mt-2 pt-3 border-t border-gray-100">
                <span class="text-[11px] font-bold text-gray-500 flex-1 leading-tight">ใช้แต้มแลกส่วนลด<br>(1 Pts = {{ storeSettings.PointDiscountValue || 1 }} ฿):</span>
                <input type="number" v-model.number="usePointsAmount" min="0" :max="memberInfo.points" class="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-center font-black text-lg outline-none focus:border-blue-500 text-orange-600" placeholder="0">
                <button @click="usePointsAmount = memberInfo.points" class="text-xs bg-blue-100 text-blue-600 px-3 py-2 rounded-lg font-bold hover:bg-blue-200 transition-colors">ใช้ทั้งหมด</button>
              </div>
            </div>
          </div>
          
          <div class="mb-5">
            <div class="flex justify-between items-end mb-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-widest"><i class="fa-solid fa-tags text-blue-500 mr-2"></i> ส่วนลดหน้าร้าน</label>
              <div class="flex bg-gray-100 p-1 rounded-lg">
                <button @click="discountType = 'amount'" :class="discountType === 'amount' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'" class="px-3 py-1 rounded-md text-[10px] font-bold transition-all">บาท (฿)</button>
                <button @click="discountType = 'percent'" :class="discountType === 'percent' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'" class="px-3 py-1 rounded-md text-[10px] font-bold transition-all">เปอร์เซ็นต์ (%)</button>
              </div>
            </div>
            <div class="relative">
              <input type="number" v-model.number="discountValue" class="w-full bg-white border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4 py-3 text-right font-black text-xl text-gray-800 transition-colors focus:outline-none shadow-sm" placeholder="0">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-sm">{{ discountType === 'amount' ? '฿' : '%' }}</div>
            </div>
          </div>

          <div class="bg-gray-900 rounded-2xl p-6 text-center mb-6 border border-gray-800 flex-1 flex flex-col justify-center shrink-0 shadow-lg relative overflow-hidden">
            <i class="fa-solid fa-receipt absolute -right-4 -bottom-4 text-8xl text-white/5"></i>
            <p class="text-gray-400 font-bold mb-1 uppercase tracking-widest text-xs relative z-10">ยอดชำระสุทธิ</p>
            <h1 class="text-5xl font-black text-white tracking-tight relative z-10">฿{{ netTotal.toLocaleString() }}</h1>
            <p v-if="calculatedDiscount > 0" class="text-xs text-orange-400 mt-2 font-bold relative z-10"><i class="fa-solid fa-tag"></i> หักส่วนลดแล้ว ฿{{ calculatedDiscount.toLocaleString() }}</p>
          </div>

          <div class="flex gap-2 bg-gray-100 p-1.5 rounded-xl mb-4 shrink-0">
            <button @click="paymentMethod = 'Cash'; numpadValue = ''" :class="['flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2', paymentMethod === 'Cash' ? 'bg-white text-blue-600 border-blue-500 shadow-md' : 'border-transparent text-gray-500 hover:text-gray-700']"><i class="fa-solid fa-coins text-yellow-500 mr-2"></i> เงินสด</button>
            <button @click="paymentMethod = 'QR'; numpadValue = netTotal.toString()" :class="['flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2', paymentMethod === 'QR' ? 'bg-white text-blue-600 border-blue-500 shadow-md' : 'border-transparent text-gray-500 hover:text-gray-700']"><i class="fa-solid fa-qrcode text-blue-500 mr-2"></i> โอนเงิน / สแกน</button>
          </div>

          <div v-if="paymentMethod === 'Cash'" class="flex flex-col mt-auto shrink-0 gap-3">
            <div class="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
              <span class="text-gray-500 font-bold text-sm">รับเงินมา</span>
              <span class="text-2xl font-black text-gray-800">฿{{ Number(numpadValue).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center px-4 py-4 rounded-xl border-2 shadow-sm transition-colors" :class="changeAmount >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'">
              <span :class="changeAmount >= 0 ? 'text-emerald-600' : 'text-red-600'" class="font-black text-lg">เงินทอน</span>
              <span class="text-4xl font-black tracking-tight" :class="changeAmount >= 0 ? 'text-emerald-500' : 'text-red-500'">฿{{ changeAmount >= 0 ? changeAmount.toLocaleString() : '0' }}</span>
            </div>
          </div>
        </div>

        <div class="w-full md:w-1/2 p-6 md:p-8 bg-gray-50 flex flex-col relative overflow-hidden border-l border-gray-200">
          
          <div v-if="paymentMethod === 'Cash'" class="flex-1 flex flex-col">
            <div class="grid grid-cols-3 gap-3 flex-1 mb-4">
              <button v-for="n in [7,8,9,4,5,6,1,2,3]" :key="n" @click="handleNumpad(n.toString())" class="bg-white rounded-2xl shadow-sm border border-gray-200 text-3xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors active:scale-95 flex items-center justify-center py-4">{{ n }}</button>
              <button @click="handleNumpad('C')" class="bg-red-50 rounded-2xl border border-red-100 text-2xl font-bold text-red-500 hover:bg-red-100 transition-colors active:scale-95 flex items-center justify-center py-4">C</button>
              <button @click="handleNumpad('0')" class="bg-white rounded-2xl shadow-sm border border-gray-200 text-3xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors active:scale-95 flex items-center justify-center py-4">0</button>
              <button @click="handleNumpad('DEL')" class="bg-gray-200 rounded-2xl border border-gray-300 text-2xl font-bold text-gray-600 hover:bg-gray-300 transition-colors active:scale-95 flex items-center justify-center py-4"><i class="fa-solid fa-delete-left"></i></button>
            </div>
            <div class="grid grid-cols-3 gap-3 mb-6">
              <button @click="numpadValue = '100'" class="bg-emerald-50 text-emerald-600 font-black text-xl rounded-2xl border border-emerald-200 py-3 hover:bg-emerald-100 active:scale-95 transition-all">100</button>
              <button @click="numpadValue = '500'" class="bg-purple-50 text-purple-600 font-black text-xl rounded-2xl border border-purple-200 py-3 hover:bg-purple-100 active:scale-95 transition-all">500</button>
              <button @click="numpadValue = '1000'" class="bg-blue-50 text-blue-600 font-black text-xl rounded-2xl border border-blue-200 py-3 hover:bg-blue-100 active:scale-95 transition-all">1,000</button>
            </div>
          </div>
          
          <div v-else class="flex-1 flex flex-col items-center justify-center text-center overflow-y-auto pb-4">
            <div class="flex flex-col items-center w-full">
              <div class="bg-white p-4 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-200 mb-6">
                <img :src="storeSettings.PaymentMode === 'BankQR' ? storeSettings.BankQRImageURL : promptPayImage" class="w-56 h-56 md:w-64 md:h-64 object-contain rounded-xl">
              </div>
              <p class="font-black text-blue-600 bg-blue-50 px-8 py-3 rounded-full text-xl shadow-sm border border-blue-200 mb-8">ยอดโอน ฿{{ netTotal.toLocaleString() }}</p>
            </div>
            <div class="mt-auto flex flex-col items-center">
              <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl mb-3 shadow-inner"><i class="fa-solid fa-money-bill-transfer"></i></div>
              <h3 class="font-black text-gray-800 text-lg mb-1">ตรวจสอบสลิปการโอนเงิน</h3>
              <p class="text-sm text-gray-500 font-bold">กรุณาตรวจสอบสลิปจากลูกค้าก่อนกดยืนยัน</p>
            </div>
          </div>

          <button @click="submitPayment" :disabled="!canCheckout || isSubmitting" class="w-full mt-4 bg-[#10b981] hover:bg-[#059669] disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/30 transition-all active:scale-[0.98] text-xl flex justify-center items-center gap-2">
            <i v-if="isSubmitting" class="fa-solid fa-circle-notch fa-spin"></i>
            <i v-else class="fa-solid fa-check-circle"></i>
            {{ isSubmitting ? 'กำลังประมวลผล...' : 'ยืนยันชำระเงิน (ปิดบิล)' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showSuccessModal" class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div class="bg-white rounded-[2.5rem] p-8 w-full max-w-[400px] flex flex-col items-center shadow-2xl">
        <div class="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center text-5xl mb-5 shadow-inner">
          <i class="fa-solid fa-check"></i>
        </div>
        <h2 class="text-3xl font-black text-gray-900 mb-1 tracking-tight">ปิดบิลสำเร็จ!</h2>
        <p class="text-sm font-bold text-gray-500 mb-6 text-center">บันทึกข้อมูลและเคลียร์โต๊ะเรียบร้อยแล้ว</p>
        
        <div class="w-full bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center mb-8 shadow-inner">
          <span class="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">เงินทอน (CHANGE)</span>
          <span class="text-6xl font-black text-emerald-500 tracking-tighter">฿{{ successChangeAmount.toLocaleString() }}</span>
        </div>

        <div class="flex gap-3 w-full">
          <button @click="showSuccessModal = false" class="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-2xl transition-all active:scale-95 text-lg">
            เสร็จสิ้น
          </button>
          <button @click="printReceipt" class="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95 text-lg">
            <i class="fa-solid fa-print"></i> พิมพ์ใบเสร็จ
          </button>
        </div>
      </div>
    </div>

    <div v-if="showTableModal" class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 md:p-8 animate-[fadeIn_0.2s_ease-out]">
      <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden border border-white/20">
        
        <div class="px-8 py-6 flex justify-between items-center bg-gray-50 border-b border-gray-200">
          <div>
            <h2 class="text-2xl font-black text-gray-800 flex items-center gap-3">
              <span class="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><i class="fa-solid fa-map-location-dot"></i></span>
              เลือกโต๊ะรับลูกค้า
            </h2>
            <p class="text-gray-500 font-bold ml-13 mt-1 text-sm">คลิกที่โต๊ะเพื่อดำเนินการต่อ | ทั้งหมด {{ tables.length }} โต๊ะ</p>
          </div>
          <button @click="showTableModal = false" class="w-12 h-12 bg-white border border-gray-200 hover:bg-red-50 text-gray-400 hover:text-red-500 hover:border-red-200 rounded-full transition-all flex items-center justify-center text-xl shadow-sm"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="flex-1 p-8 flex items-center justify-center bg-gray-100 overflow-y-auto">
          <div v-if="isLoadingTables" class="text-center">
            <i class="fa-solid fa-circle-notch fa-spin text-5xl text-blue-600 mb-4"></i>
            <p class="font-black text-gray-500 tracking-widest uppercase">กำลังดึงข้อมูลผังโต๊ะ...</p>
          </div>

          <div v-else class="grid w-full content-start gap-6" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
            <button v-for="t in tables" :key="t.id" @click="selectTable(t)" :class="['relative rounded-3xl border-2 transition-all duration-300 flex flex-col items-center justify-center p-5 h-48 group overflow-hidden', t.status === 'Available' ? 'bg-white border-gray-200 hover:border-emerald-500 hover:shadow-xl' : 'bg-orange-50 border-orange-200 hover:border-orange-500 hover:shadow-xl']">
              
              <div :class="['w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 mb-3 shadow-sm', t.status === 'Available' ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-200 text-orange-600']">
                <i class="fa-solid fa-utensils text-2xl group-hover:scale-110 transition-transform"></i>
              </div>

              <h3 class="font-black text-gray-800 text-xl">{{ t.table_name }}</h3>
              
              <div :class="['mt-3 px-4 py-1 rounded-full font-black uppercase tracking-widest text-[10px] shadow-sm', t.status === 'Available' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white']">
                {{ t.status === 'Available' ? 'ว่าง' : 'เปิดบิลแล้ว' }}
              </div>

              <div v-if="t.status !== 'Available'" class="absolute top-3 right-3">
                <span class="flex h-3 w-3 relative"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span></span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue' 
import { useRoute, useRouter } from 'vue-router' 
import { supabase } from '../supabase'
import Swal from 'sweetalert2'

const route = useRoute()   
const router = useRouter() 

// 🌟 ตัวแปรเก็บ Session และ สิทธิ์
const myStoreId = ref(null)
const isProPlan = ref(false)

const menus = ref([])
const tables = ref([])
const cart = ref([])
const activeItems = ref([])
const currentOrderId = ref(null)
const selectedCategory = ref('')
const selectedTable = ref(null)
const storeSettings = ref({})

const isLoadingMenus = ref(true)
const isLoadingTables = ref(false)
const isSubmitting = ref(false)
const showTableModal = ref(false)
const showPaymentModal = ref(false)
const showSuccessModal = ref(false)

const paymentMethod = ref('Cash')
const discountType = ref('amount')
const discountValue = ref('')
const numpadValue = ref('')
const memberPhone = ref('')
const memberInfo = ref(null)
const usePointsAmount = ref(0)
const successChangeAmount = ref(0)
const lastOrderForReceipt = ref(null) 

let posRealtimeChannel = null

// 🌟 ลบ "All" ออก ดึงเฉพาะที่มีอยู่จริง
const availableCategories = computed(() => [...new Set(menus.value.map(item => item.category))])
const filteredMenus = computed(() => selectedCategory.value ? menus.value.filter(m => m.category === selectedCategory.value) : menus.value)

const cartTotal = computed(() => cart.value.reduce((sum, item) => sum + (item.price * item.qty), 0))
const activeTotal = computed(() => activeItems.value.reduce((sum, item) => sum + Number(item.total_price), 0))
const grandTotal = computed(() => cartTotal.value + activeTotal.value)

const calculatedDiscount = computed(() => {
  const manualD = Number(discountValue.value) || 0
  const manualDiscount = discountType.value === 'percent' ? (grandTotal.value * manualD) / 100 : manualD
  const pointValue = Number(storeSettings.value.PointDiscountValue) || 1
  const pointDiscount = (Number(usePointsAmount.value) || 0) * pointValue
  return manualDiscount + pointDiscount
})

const netTotal = computed(() => Math.max(0, grandTotal.value - calculatedDiscount.value))

const changeAmount = computed(() => {
  if (paymentMethod.value === 'QR') return 0
  const received = Number(numpadValue.value) || 0
  return received - netTotal.value
})

const canCheckout = computed(() => {
  if (paymentMethod.value === 'QR') return true
  return changeAmount.value >= 0
})

const promptPayImage = computed(() => {
  const ppId = storeSettings.value.PromptPayID || '0000000000'
  return `https://promptpay.io/${ppId}/${netTotal.value}.png`
})

watch(memberInfo, () => { usePointsAmount.value = 0 })

const loadSettings = async () => {
  const { data } = await supabase.from('settings').select('*').eq('store_id', myStoreId.value)
  if (data) storeSettings.value = Object.fromEntries(data.map(item => [item.setting_key, item.setting_value]))
}

// 🌟 โหลดเมนู และตั้งค่า Category แรกให้อัตโนมัติ (แทน All)
const loadMenus = async () => {
  isLoadingMenus.value = true
  const { data } = await supabase.from('menus').select('*').eq('store_id', myStoreId.value).eq('status', 'Available')
  if (data) {
    menus.value = data
    if (availableCategories.value.length > 0) {
      selectedCategory.value = availableCategories.value[0]
    }
  }
  isLoadingMenus.value = false
}

// 🌟 โหลดผังโต๊ะ พร้อมจัดเรียงเลข 1, 2, 10 ให้ถูกต้อง (Natural Sort)
const loadTables = async () => {
  isLoadingTables.value = true
  const { data: tData } = await supabase.from('tables').select('*').eq('store_id', myStoreId.value)
  const { data: oData } = await supabase.from('orders').select('table_id').eq('store_id', myStoreId.value).eq('status', 'Open')
  
  if (tData) {
    tData.sort((a, b) => a.table_name.localeCompare(b.table_name, undefined, { numeric: true }))
    tables.value = tData.map(t => {
      const isOccupied = oData && oData.some(o => o.table_id === t.id)
      return { ...t, status: isOccupied ? 'Occupied' : t.status }
    })
  }
  isLoadingTables.value = false
}

const fetchTableOrder = async (tableId) => {
  activeItems.value = []
  currentOrderId.value = null
  const { data: order } = await supabase.from('orders').select('*').eq('store_id', myStoreId.value).eq('table_id', tableId).eq('status', 'Open').maybeSingle()
  if (order) {
    currentOrderId.value = order.id
    const { data: items } = await supabase.from('order_details').select('*').eq('order_id', order.id).neq('kitchen_status', 'Cancelled').neq('kitchen_status', 'Voided')
    if (items) activeItems.value = items
  }
}

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
const openTableModal = () => { loadTables(); showTableModal.value = true }
const selectTable = async (table) => { selectedTable.value = table; cart.value = []; await fetchTableOrder(table.id); showTableModal.value = false }

const clearTable = async () => {
  if (!selectedTable.value) return;

  if (selectedTable.value.status === 'Occupied' && activeItems.value.length === 0) {
    const res = await Swal.fire({
      title: 'ยังไม่มีรายการอาหาร',
      text: 'คุณต้องการ "ยกเลิกการเปิดโต๊ะ" และล้าง QR Code เดิมทิ้งหรือไม่?',
      icon: 'question', showCancelButton: true, confirmButtonText: 'คืนเป็นโต๊ะว่าง', cancelButtonText: 'แค่พับหน้าต่าง', confirmButtonColor: '#ef4444'
    });

    if (res.isConfirmed) {
      await supabase.from('tables').update({ status: 'Available', session_token: null, service_request: null }).eq('id', selectedTable.value.id);
      if (currentOrderId.value) await supabase.from('orders').update({ status: 'Voided' }).eq('id', currentOrderId.value);
      Swal.fire({ icon: 'success', title: 'คืนโต๊ะว่างเรียบร้อย', toast: true, position: 'top', timer: 1500, showConfirmButton: false });
    }
  }

  selectedTable.value = null; cart.value = []; activeItems.value = []; currentOrderId.value = null; loadTables();
}

const voidItem = async (item) => {
  const result = await Swal.fire({ title: 'ลบรายการนี้?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' })
  if (result.isConfirmed) {
    await supabase.from('order_details').update({ kitchen_status: 'Voided' }).eq('id', item.id)
    await fetchTableOrder(selectedTable.value.id)
  }
}

const printToIframe = (htmlContent) => {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  iframe.contentDocument.write(htmlContent);
  iframe.contentDocument.close();
  
  iframe.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => { document.body.removeChild(iframe); }, 1000); 
  };
}

const sendOrderToKitchen = async () => {
  if (!selectedTable.value || cart.value.length === 0) return
  isSubmitting.value = true
  try {
    let orderId = currentOrderId.value
    if (orderId) {
      await supabase.from('orders').update({ total_amount: grandTotal.value }).eq('id', orderId)
    } else {
      const { data: newOrder } = await supabase.from('orders').insert({ store_id: myStoreId.value, table_id: selectedTable.value.id, total_amount: grandTotal.value, status: 'Open' }).select().single()
      orderId = newOrder.id
    }
    
    await supabase.from('tables').update({ status: 'Occupied' }).eq('id', selectedTable.value.id)
    selectedTable.value.status = 'Occupied'

    const details = cart.value.map(item => ({ store_id: myStoreId.value, order_id: orderId, menu_id: item.id, menu_name: item.menu_name, price: item.price, quantity: item.qty, total_price: item.price * item.qty, kitchen_status: 'Pending' }))
    await supabase.from('order_details').insert(details)
    
    const itemsToPrint = [...cart.value]; 
    const tableNameToPrint = selectedTable.value.table_name;

    await fetchTableOrder(selectedTable.value.id)
    cart.value = []
    
    // แจ้งเตือนส่งเข้าครัว หรือ พิมพ์ใบ
    if (isProPlan.value) {
      Swal.fire({ 
        icon: 'success', title: 'ส่งเข้าครัวแล้ว!', text: 'ต้องการพิมพ์ใบสั่งอาหารสำหรับห้องครัวหรือไม่?',
        showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-print"></i> พิมพ์ใบสั่ง', cancelButtonText: 'ไม่พิมพ์', confirmButtonColor: '#2563eb'
      }).then((res) => { if (res.isConfirmed) printKitchenTicket(itemsToPrint, tableNameToPrint); });
    } else {
      Swal.fire({ icon: 'success', title: 'รับออเดอร์แล้ว!', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 })
    }

  } catch (error) { Swal.fire('ผิดพลาด', 'ไม่สามารถส่งออเดอร์ได้', 'error') } finally { isSubmitting.value = false }
}

const printKitchenTicket = (items, tableName) => {
  let itemsHtml = items.map(item => `
    <div style="display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 8px; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 4px;">
      <div>[ ] ${item.menu_name}</div><div style="font-size: 18px;">x${item.qty}</div>
    </div>
  `).join('');

  const html = `
    <html><head><title>Kitchen Ticket</title><style>@page { margin: 0; size: 80mm auto; } body { font-family: 'Prompt', sans-serif; width: 80mm; margin: 0 auto; padding: 10px; color: #000; box-sizing: border-box; } .text-center { text-align: center; }</style><link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;700;900&display=swap" rel="stylesheet"></head><body>
      <div class="text-center" style="margin-bottom: 10px;"><h2 style="margin:0; font-size: 24px;">ใบสั่งอาหาร (Kitchen)</h2><h1 style="margin:10px 0; font-size: 36px; border: 3px solid #000; padding: 5px; border-radius: 10px;">โต๊ะ: ${tableName}</h1><p style="margin:0; font-size: 14px; font-weight: bold;">เวลา: ${new Date().toLocaleString('th-TH')}</p></div>
      <div style="margin-bottom: 20px; margin-top: 15px;">${itemsHtml}</div>
      <div class="text-center" style="font-size: 12px; font-weight: bold; border-top: 2px dashed #000; padding-top: 10px;">--- สิ้นสุดรายการ ---</div>
    </body></html>
  `;
  printToIframe(html);
}

const openPayment = () => {
  paymentMethod.value = 'Cash'
  discountValue.value = ''
  numpadValue.value = ''
  memberPhone.value = ''
  memberInfo.value = null
  usePointsAmount.value = 0
  showPaymentModal.value = true
}

const handleNumpad = (val) => {
  if (val === 'C') numpadValue.value = ''
  else if (val === 'DEL') numpadValue.value = numpadValue.value.slice(0, -1)
  else numpadValue.value += val
}

const searchMember = async () => {
  if (!memberPhone.value) return
  const { data } = await supabase.from('members').select('*').eq('phone', memberPhone.value).eq('store_id', myStoreId.value).maybeSingle()
  if (data) memberInfo.value = data
  else Swal.fire({ icon: 'error', title: 'ไม่พบข้อมูลสมาชิก', toast: true, position: 'top', timer: 2000, showConfirmButton: false })
}

const promptRegisterMember = async () => {
  const { value: formValues } = await Swal.fire({
    title: 'สมัครสมาชิกใหม่',
    html: `<input id="swal-phone" class="swal2-input" placeholder="เบอร์โทรศัพท์" type="tel" value="${memberPhone.value}"><input id="swal-name" class="swal2-input" placeholder="ชื่อลูกค้า" type="text">`,
    focusConfirm: false, showCancelButton: true, confirmButtonText: 'บันทึก', cancelButtonText: 'ยกเลิก',
    preConfirm: () => { return { phone: document.getElementById('swal-phone').value, name: document.getElementById('swal-name').value } }
  })
  if (formValues && formValues.phone && formValues.name) {
    const { error } = await supabase.from('members').insert({ store_id: myStoreId.value, phone: formValues.phone, name: formValues.name, points: 0, total_spent: 0 })
    if (error) Swal.fire('ผิดพลาด', 'เบอร์นี้อาจมีในระบบแล้ว', 'error')
    else { memberPhone.value = formValues.phone; searchMember() }
  }
}

const submitPayment = async () => {
  if (!canCheckout.value || isSubmitting.value) return
  isSubmitting.value = true
  try {
    const finalReceived = paymentMethod.value === 'Cash' ? Number(numpadValue.value) : netTotal.value
    
    await supabase.from('orders').update({ status: 'Paid', total_amount: netTotal.value, payment_method: paymentMethod.value, received_amount: finalReceived, change_amount: changeAmount.value }).eq('id', currentOrderId.value)
    await supabase.from('tables').update({ status: 'Available', service_request: null, session_token: null }).eq('id', selectedTable.value.id)

    if (memberInfo.value && isProPlan.value) {
      const earnRate = Number(storeSettings.value.PointEarnRate) || 100
      const earnedPoints = Math.floor(netTotal.value / earnRate)
      const usedPoints = Number(usePointsAmount.value) || 0
      await supabase.from('members').update({ total_spent: Number(memberInfo.value.total_spent) + netTotal.value, points: Number(memberInfo.value.points) - usedPoints + earnedPoints }).eq('phone', memberInfo.value.phone).eq('store_id', myStoreId.value)
    }

    const { data: orderItems } = await supabase.from('order_details').select('quantity, menus(inventory_id)').eq('order_id', currentOrderId.value).neq('kitchen_status', 'Cancelled').neq('kitchen_status', 'Voided')
    if (orderItems) {
      const stockToDeduct = {}
      orderItems.forEach(item => { const invId = item.menus?.inventory_id; if (invId) stockToDeduct[invId] = (stockToDeduct[invId] || 0) + item.quantity })
      for (const [invId, qtyToDeduct] of Object.entries(stockToDeduct)) {
        const { data: invItem } = await supabase.from('inventory').select('item_name, stock_qty').eq('id', invId).single()
        if (invItem) {
          const newQty = Number(invItem.stock_qty) - qtyToDeduct
          await supabase.from('inventory').update({ stock_qty: newQty }).eq('id', invId)
          await supabase.from('inventory_logs').insert([{ store_id: myStoreId.value, item_name: invItem.item_name, action: `ขายหน้าร้าน (บิล #${currentOrderId.value.split('-')[0].toUpperCase()})`, qty_change: -qtyToDeduct, remaining: newQty }])
        }
      }
    }

    successChangeAmount.value = changeAmount.value
    lastOrderForReceipt.value = {
      id: currentOrderId.value, table_name: selectedTable.value.table_name, created_at: new Date().toISOString(), payment_method: paymentMethod.value,
      items: [...activeItems.value], total_amount: netTotal.value, received_amount: finalReceived, change_amount: changeAmount.value,
      discount: calculatedDiscount.value // เพิ่มส่วนลดให้ใบเสร็จ
    }

    showPaymentModal.value = false
    showSuccessModal.value = true
    clearTable()
  } catch (error) {
    Swal.fire('ผิดพลาด', 'ไม่สามารถปิดบิลได้ กรุณาตรวจสอบฐานข้อมูล', 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 🖨️ 🌟 พิมพ์ใบเสร็จลูกค้า (ดึงข้อมูลร้านค้าครบถ้วน) 🌟
const printReceipt = () => {
  if (!lastOrderForReceipt.value) return
  const order = lastOrderForReceipt.value
  
  // ดึงข้อมูลตั้งค่าจาก Database
  const storeName = storeSettings.value.StoreName || 'RM Pro POS'
  const branchName = storeSettings.value.Branch ? `สาขา ${storeSettings.value.Branch}` : ''
  const address = storeSettings.value.Address || ''
  const phone = storeSettings.value.Phone ? `โทร: ${storeSettings.value.Phone}` : ''
  const taxId = storeSettings.value.TaxID ? `TAX ID: ${storeSettings.value.TaxID}` : ''
  const footerText = storeSettings.value.FooterText || 'ขอขอบคุณที่ใช้บริการ'
  
  let itemsHtml = ''
  order.items.forEach(item => {
    itemsHtml += `
      <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 5px;">
        <div>${item.menu_name} <span style="color: #9ca3af; font-size: 12px; margin-left: 4px;">x${item.quantity}</span></div>
        <div style="font-family: monospace;">${Number(item.price * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
      </div>
    `
  })

  // แสดงส่วนลดในใบเสร็จ
  const discountHtml = order.discount > 0 ? `<div style="display: flex; justify-content: space-between; font-size: 12px; color: #ea580c; margin-bottom: 5px;"><span>ส่วนลด:</span><span>-${Number(order.discount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>` : '';

  const html = `
    <html><head><title>Print Receipt</title>
    <style>
      @page { margin: 0; size: 80mm auto; }
      body { font-family: 'Prompt', sans-serif; width: 80mm; margin: 0 auto; padding: 15px; color: #1f2937; box-sizing: border-box; }
      .text-center { text-align: center; }
      .font-black { font-weight: 900; }
      .font-bold { font-weight: bold; }
      .mb-5 { margin-bottom: 15px; }
      .border-dashed { border-top: 1.5px dashed #d1d5db; margin: 12px 0; }
      .text-dark { color: #111827; }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;700;900&display=swap" rel="stylesheet">
    </head><body>
      <div class="text-center mb-5">
        <div class="font-black text-xl text-dark">${storeName}</div>
        <div class="font-bold text-xs">${branchName}</div>
        <div class="text-[10px] mt-1 text-gray-600">${address}</div>
        <div class="text-[10px]">${phone}</div>
        <div class="text-[10px]">${taxId}</div>
      </div>
      <div class="text-center font-bold text-xs bg-gray-100 py-1 rounded">ใบเสร็จรับเงิน / Receipt</div>
      <div class="border-dashed"></div>
      <div class="text-xs font-bold mb-5 space-y-1">
        <div style="display: flex; justify-content: space-between;"><span>เลขที่:</span><span style="font-family: monospace;">INV-${order.id.split('-')[0].toUpperCase()}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>โต๊ะ:</span><span class="text-dark">${order.table_name}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>เวลา:</span><span class="text-dark">${new Date(order.created_at).toLocaleString('th-TH')}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>ชำระโดย:</span><span class="text-dark">${order.payment_method}</span></div>
      </div>
      <div class="border-dashed"></div>
      <div class="font-bold mb-5 min-h-[50px]">${itemsHtml}</div>
      <div class="border-dashed"></div>
      <div class="font-bold mb-5">
        ${discountHtml}
        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; color: #111827; margin-bottom: 8px;"><span>ยอดสุทธิ (฿):</span><span>${Number(order.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;"><span>รับเงินมา:</span><span style="font-family: monospace;">${Number(order.received_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
        <div style="display: flex; justify-content: space-between; font-size: 12px;"><span>เงินทอน:</span><span style="font-family: monospace;">${Number(order.change_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
      </div>
      <div class="border-dashed"></div>
      <div class="text-center text-[10px] font-bold mt-5 text-gray-500">${footerText}</div>
    </body></html>
  `
  printToIframe(html)
}

const printQR = (title, imgUrl) => {
  const html = `<html><head><title>Print QR</title><style>@page{margin:0;size:80mm auto;}body{font-family:'Prompt',sans-serif;width:80mm;margin:0 auto;padding:15px;text-align:center;color:#000;box-sizing:border-box;}h2{margin:0 0 5px 0;font-size:26px;font-weight:900;}p{margin:0 0 10px 0;font-size:16px;font-weight:bold;}.footer{margin-top:15px;border-top:2px dashed #000;padding-top:10px;font-size:14px;font-weight:bold;}</style><link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;700;900&display=swap" rel="stylesheet"></head><body><h2>RM Pro</h2><p>สั่งอาหารผ่านมือถือ</p><h2 style="font-size: 36px; border: 3px solid #000; padding: 5px; margin-top: 10px; border-radius: 10px;">${title}</h2><img src="${imgUrl}" style="width:220px;height:220px;margin:10px auto;display:block;" /><div class="footer">สแกนเพื่อสั่งอาหารด้วยตนเอง</div></body></html>`
  printToIframe(html)
}

const generateQR = async () => {
  if (!selectedTable.value || !isProPlan.value) return
  const newToken = Math.random().toString(36).substring(2, 10);
  await supabase.from('tables').update({ session_token: newToken, status: 'Occupied' }).eq('id', selectedTable.value.id);
  selectedTable.value.session_token = newToken;
  selectedTable.value.status = 'Occupied';

  const customerUrl = `${window.location.origin}/customer?table_id=${selectedTable.value.id}&token=${newToken}&table_name=${encodeURIComponent(selectedTable.value.table_name)}`
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(customerUrl)}&margin=10`
  
  const htmlStr = `
    <div class="flex flex-col items-center justify-center font-sans text-gray-800">
      <div class="w-full bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6 flex flex-col items-center justify-center shadow-sm">
        <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">สั่งอาหาร (MOBILE ORDER)</p>
        <h3 class="text-3xl font-black text-gray-900 leading-none">${selectedTable.value.table_name}</h3>
      </div>
      <div class="bg-white p-3 rounded-3xl border-2 border-dashed border-gray-200 mb-6 shadow-sm">
        <img src="${qrImageSrc}" class="w-56 h-56 object-contain rounded-xl mx-auto">
      </div>
      <div class="w-full flex gap-3 mt-2">
        <button id="btn-close-qr" class="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-xl transition-all active:scale-95 text-sm">ปิดหน้าต่าง</button>
        <button id="btn-print-qr" class="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all active:scale-95 text-sm shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2"><i class="fa-solid fa-print"></i> พิมพ์ QR</button>
      </div>
    </div>
  `

  Swal.fire({
    html: htmlStr, showConfirmButton: false, width: '400px', padding: '2rem', customClass: { popup: '!rounded-[2.5rem]' },
    didOpen: () => {
      document.getElementById('btn-close-qr').addEventListener('click', () => Swal.close())
      document.getElementById('btn-print-qr').addEventListener('click', () => printQR(selectedTable.value.table_name, qrImageSrc))
    }
  })
}

const setupPosRealtime = () => {
  posRealtimeChannel = supabase.channel(`pos_order_updates_${myStoreId.value}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'order_details', filter: `store_id=eq.${myStoreId.value}` }, payload => {
       if (currentOrderId.value && payload.new.order_id === currentOrderId.value) {
         const idx = activeItems.value.findIndex(item => item.id === payload.new.id)
         if (idx !== -1) activeItems.value[idx].kitchen_status = payload.new.kitchen_status
       }
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders', filter: `store_id=eq.${myStoreId.value}` }, payload => {
      if (selectedTable.value && payload.new.table_id === selectedTable.value.id) {
        currentOrderId.value = payload.new.id;
        fetchTableOrder(selectedTable.value.id);
        Swal.fire({ icon: 'info', title: 'โต๊ะนี้เปิดบิลสั่งอาหารแล้ว!', toast: true, position: 'top', timer: 2000, showConfirmButton: false })
      }
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_details', filter: `store_id=eq.${myStoreId.value}` }, async payload => {
       if (currentOrderId.value === payload.new.order_id) {
         fetchTableOrder(selectedTable.value.id)
         Swal.fire({ icon: 'info', title: 'มีออเดอร์ใหม่จากลูกค้าโต๊ะนี้!', toast: true, position: 'top', timer: 2000, showConfirmButton: false })
       } else if (selectedTable.value && !currentOrderId.value) {
         const { data: orderData } = await supabase.from('orders').select('table_id').eq('id', payload.new.order_id).single()
         if (orderData && orderData.table_id === selectedTable.value.id) {
           currentOrderId.value = payload.new.order_id
           fetchTableOrder(selectedTable.value.id)
           Swal.fire({ icon: 'info', title: 'มีออเดอร์ใหม่จากลูกค้าโต๊ะนี้!', toast: true, position: 'top', timer: 2000, showConfirmButton: false })
         }
       }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tables', filter: `store_id=eq.${myStoreId.value}` }, () => { loadTables() })
    .subscribe()
}

onMounted(async () => {
  const savedUser = JSON.parse(localStorage.getItem('rmpro_user'))
  if(savedUser && savedUser.store_id) {
    myStoreId.value = savedUser.store_id
    
    // ตรวจสอบแพ็กเกจ (Standard vs Pro)
    const { data: storeInfo } = await supabase.from('stores').select('package_type').eq('id', myStoreId.value).single()
    if(storeInfo) isProPlan.value = storeInfo.package_type === 'Pro'

    loadSettings()
    loadMenus()
    setupPosRealtime()

    if (route.query.table_id) {
      await loadTables()
      const t = tables.value.find(x => x.id == route.query.table_id)
      if (t) { await selectTable(t); router.replace('/pos') }
    }
  }
})

onUnmounted(() => {
  if (posRealtimeChannel) supabase.removeChannel(posRealtimeChannel)
})
</script>