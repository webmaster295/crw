<template>
  <AdminLayout>
    <!-- LIST VIEW -->
    <div v-if="!showForm">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-900">จัดการคลังสื่อ</h2>
          <p class="text-sm text-gray-500 mt-0.5">ทั้งหมด {{ mediaList.length }} รายการ</p>
        </div>
        <div class="flex gap-2">
          <button @click="openCatModal" class="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
            🏷️ หมวดหมู่
          </button>
          <button @click="openSubjectModal" class="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all">
            📚 กลุ่มสาระ
          </button>
          <button @click="openGradeModal" class="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-green-300 hover:text-green-600 hover:bg-green-50 transition-all">
            🎓 ระดับชั้น
          </button>
          <button @click="openAdd" class="btn-primary flex items-center gap-2">
            <span class="text-lg leading-none">+</span> เพิ่มสื่อ
          </button>
        </div>
      </div>

      <!-- Filter -->
      <div class="bg-white rounded-2xl shadow-sm p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div class="flex-1 relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input v-model="searchQuery" type="text" placeholder="ค้นหาชื่อสื่อ..."
            class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select v-model="filterCategory" class="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">ทุกหมวดหมู่</option>
          <option v-for="c in categories" :key="c.id" :value="c.name">{{ c.name }}</option>
        </select>
        <select v-model="filterType" class="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">ทุกประเภท</option>
          <option value="embed">🔗 Embed</option>
          <option value="link">🌐 ลิงก์</option>
        </select>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div v-if="loading" class="text-center py-16 text-gray-400">
          <div class="text-4xl mb-2 animate-pulse">📚</div>
          <p class="text-sm">กำลังโหลด...</p>
        </div>
        <div v-else-if="!filteredMedia.length" class="text-center py-16 text-gray-400">
          <div class="text-4xl mb-2">📭</div>
          <p class="text-sm">ไม่พบรายการสื่อ</p>
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wide">
              <th class="py-3 px-4 w-16">ภาพ</th>
              <th class="py-3 px-4">ชื่อสื่อ</th>
              <th class="py-3 px-4 hidden md:table-cell w-28">หมวดหมู่</th>
              <th class="py-3 px-4 hidden xl:table-cell w-32">กลุ่มสาระ</th>
              <th class="py-3 px-4 hidden lg:table-cell w-28">ประเภท</th>
              <th class="py-3 px-4 hidden lg:table-cell w-32">วันที่สร้าง</th>
              <th class="py-3 px-4 w-28 text-center">สถานะ</th>
              <th class="py-3 px-4 w-20 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredMedia" :key="item.id"
              class="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
              <td class="py-2 px-4">
                <div class="w-12 h-9 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img v-if="item.thumbnail_url" :src="item.thumbnail_url" class="w-full h-full object-cover" />
                  <span v-else class="text-lg">{{ typeIcon(item) }}</span>
                </div>
              </td>
              <td class="py-2 px-4 max-w-[220px]">
                <div class="flex items-start gap-1.5">
                  <span v-if="item.is_featured" class="text-yellow-500 mt-0.5 flex-shrink-0">⭐</span>
                  <span class="font-medium text-gray-900 line-clamp-2 leading-snug">{{ item.title }}</span>
                </div>
              </td>
              <td class="py-2 px-4 hidden md:table-cell">
                <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{{ item.category }}</span>
              </td>
              <td class="py-2 px-4 hidden xl:table-cell">
                <span v-if="item.subject_area" class="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">{{ item.subject_area }}</span>
                <span v-else class="text-xs text-gray-300">—</span>
              </td>
              <td class="py-2 px-4 hidden lg:table-cell">
                <span :class="['px-2 py-0.5 rounded-full text-xs font-medium', typeStyle(item)]">
                  {{ typeLabel(item) }}
                </span>
              </td>
              <td class="py-2 px-4 hidden lg:table-cell text-gray-500 text-xs">{{ formatDate(item.created_at) }}</td>
              <td class="py-2 px-4 text-center">
                <button @click="togglePublish(item)"
                  :class="['px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                    item.is_published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200']">
                  {{ item.is_published ? '✅ เผยแพร่' : '📝 ร่าง' }}
                </button>
              </td>
              <td class="py-2 px-4">
                <div class="flex items-center justify-center gap-1">
                  <button @click="openEdit(item)" class="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">✏️</button>
                  <button @click="confirmDelete(item)" class="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- FORM VIEW -->
    <div v-else>
      <div class="flex items-center gap-3 mb-6">
        <button @click="showForm = false" class="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">←</button>
        <div>
          <h2 class="text-xl font-bold text-gray-900">{{ editId ? 'แก้ไขสื่อ' : 'เพิ่มสื่อใหม่' }}</h2>
          <p class="text-sm text-gray-500 mt-0.5">{{ form.title || 'ยังไม่มีชื่อ' }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main -->
        <div class="lg:col-span-2 space-y-5">
          <!-- Thumbnail — บนสุด -->
          <div class="bg-white rounded-2xl shadow-sm p-5">
            <h3 class="font-semibold text-gray-700 mb-3">🖼️ ภาพปก</h3>
            <ImageUploadCrop
              :key="formKey"
              v-model="form.thumbnail_url"
              bucket="school"
              :path="`media/thumb-${Date.now()}`"
              :aspect="16/9"
              placeholder="คลิกเพื่อเลือกภาพปก"
            />
          </div>

          <!-- Title + Description -->
          <div class="bg-white rounded-2xl shadow-sm p-5">
            <h3 class="font-semibold text-gray-700 mb-3">📝 ข้อมูลสื่อ</h3>
            <input v-model="form.title" type="text" placeholder="ชื่อสื่อ / หัวข้อ..."
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3" />
            <textarea v-model="form.description" rows="3"
              placeholder="คำอธิบายสั้นๆ (ไม่บังคับ)"
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"></textarea>
            <input v-model="form.author_name" type="text" placeholder="👤 ชื่อเจ้าของสื่อ / ผู้สร้าง (ไม่บังคับ)"
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <!-- External URL -->
          <div class="bg-white rounded-2xl shadow-sm p-5">
            <h3 class="font-semibold text-gray-700 mb-1">🔗 ลิงก์ภายนอก <span class="text-xs font-normal text-gray-400">(ไม่บังคับ)</span></h3>
            <p class="text-xs text-gray-400 mb-3">ถ้ากรอก — คลิกการ์ดจะเปิดลิงก์นี้ในแท็บใหม่ทันที ไม่ผ่านหน้าสื่อ</p>
            <input v-model="form.external_url" type="url" placeholder="https://..."
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <!-- Content -->
          <div class="bg-white rounded-2xl shadow-sm p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-700">📎 เนื้อหา</h3>
              <div class="flex bg-gray-100 rounded-xl p-1 gap-1">
                <button @click="form.media_type = 'embed'"
                  :class="['px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    form.media_type === 'embed' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700']">
                  🔗 Embed
                </button>
                <button @click="form.media_type = 'link'"
                  :class="['px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    form.media_type === 'link' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700']">
                  🌐 ลิงก์
                </button>
              </div>
            </div>

            <!-- คำแนะนำการแทรกสื่อ -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 text-xs text-blue-700">
              <p class="font-semibold text-blue-800 mb-1">💡 แนะนำการแทรกสื่อ</p>
              <p class="text-blue-600 leading-relaxed">
                เพื่อประหยัดพื้นที่จัดเก็บและเพิ่มความเร็วในการโหลดเว็บไซต์ แนะนำให้แทรกสื่อจากแหล่งภายนอก
                เช่น <b>YouTube, Google Drive, Google Slides</b> หรือ <b>Canva</b>
                โดยใช้ลิงก์หรือโค้ด Embed แทนการอัปโหลดไฟล์โดยตรง
                นอกจากนี้ สื่อยังได้รับการอัปเดตโดยอัตโนมัติเมื่อมีการแก้ไขที่แหล่งต้นฉบับอีกด้วย
              </p>
            </div>

            <!-- วิธีรับ code (embed เท่านั้น) -->
            <div v-if="form.media_type === 'embed'"
              class="bg-white border border-gray-100 rounded-xl px-4 py-3 mb-4 text-xs text-gray-600 space-y-0.5">
              <p class="font-semibold text-gray-700 mb-1">📎 วิธีรับ Embed Code / URL</p>
              <p>▶️ <b>YouTube</b> — copy URL จาก address bar</p>
              <p>📊 <b>Google Slides</b> — ไฟล์ → แชร์ → เผยแพร่บนเว็บ → แท็บ "ฝัง" → copy &lt;iframe&gt;</p>
              <p>📄 <b>PDF (Google Drive)</b> — แชร์ → ทุกคนที่มีลิงก์ → copy URL</p>
              <p>🎨 <b>Canva</b> — Share → Embed → copy &lt;iframe&gt;</p>
            </div>

            <!-- Multi-item list -->
            <div class="space-y-3">
              <div v-for="(item, idx) in mediaItems" :key="idx"
                class="border border-gray-200 rounded-xl p-4 bg-gray-50/60 relative">
                <!-- Header -->
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {{ form.media_type === 'embed' ? '🔗' : '🌐' }} สื่อที่ {{ idx + 1 }}
                  </span>
                  <button v-if="mediaItems.length > 1" @click="removeItem(idx)"
                    class="w-6 h-6 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 text-xs transition-colors">✕</button>
                </div>
                <!-- ชื่อสื่อ (label) -->
                <input v-model="item.label" type="text"
                  :placeholder="form.media_type === 'embed' ? 'ชื่อสื่อ เช่น บทที่ 1, แบบทดสอบ (ไม่บังคับ)' : 'ชื่อลิงก์ เช่น เอกสารประกอบการสอน (ไม่บังคับ)'"
                  class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2 bg-white" />
                <!-- URL / Embed code -->
                <div class="relative">
                  <textarea v-if="form.media_type === 'embed'" v-model="item.raw" rows="2"
                    placeholder="วาง URL หรือ <iframe ...> code ที่นี่..."
                    class="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-white" />
                  <input v-else v-model="item.raw" type="url" placeholder="https://..."
                    class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                  <!-- type badge -->
                  <span v-if="form.media_type === 'embed' && getItemInfo(item) && !getItemInfo(item).warning"
                    class="absolute right-2 top-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 pointer-events-none">
                    {{ getItemInfo(item).icon }} {{ getItemInfo(item).label }}
                  </span>
                </div>
                <!-- Canva warning -->
                <div v-if="form.media_type === 'embed' && getItemInfo(item)?.warning === 'canva_link'"
                  class="mt-1 text-xs text-orange-600 bg-orange-50 rounded-lg px-2 py-1.5">
                  ⚠️ canva.link ฝัง iframe ไม่ได้ — ใช้ Share → Embed → copy &lt;iframe&gt; แทน
                </div>
                <!-- Mini preview -->
                <div v-if="form.media_type === 'embed' && getItemInfo(item)?.src"
                  class="mt-2 rounded-lg overflow-hidden border border-gray-200"
                  :style="`position:relative; padding-top:${getItemInfo(item).ratio}`">
                  <iframe :src="getItemInfo(item).src"
                    style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"
                    allowfullscreen loading="lazy" />
                </div>
              </div>
            </div>

            <!-- Add item button -->
            <button @click="addItem"
              class="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-blue-300 text-blue-600 text-sm font-medium hover:bg-blue-50 hover:border-blue-400 transition-all">
              + เพิ่ม{{ form.media_type === 'embed' ? 'สื่อ Embed' : 'ลิงก์' }}
            </button>
          </div>

        </div>

        <!-- Sidebar -->
        <div class="space-y-5">
          <!-- Publish settings -->
          <div class="bg-white rounded-2xl shadow-sm p-5">
            <h3 class="font-semibold text-gray-700 mb-4">⚙️ การเผยแพร่</h3>
            <div class="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div class="text-sm font-medium text-gray-700">เผยแพร่</div>
                <div class="text-xs text-gray-400">แสดงบนเว็บไซต์</div>
              </div>
              <button @click="form.is_published = !form.is_published"
                :class="['w-12 h-6 rounded-full transition-colors relative', form.is_published ? 'bg-blue-600' : 'bg-gray-300']">
                <span :class="['absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all', form.is_published ? 'left-6' : 'left-0.5']"></span>
              </button>
            </div>
            <div class="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div class="text-sm font-medium text-gray-700">⭐ แนะนำ</div>
                <div class="text-xs text-gray-400">แสดงในหน้าแรก</div>
              </div>
              <button @click="form.is_featured = !form.is_featured"
                :class="['w-12 h-6 rounded-full transition-colors relative', form.is_featured ? 'bg-yellow-500' : 'bg-gray-300']">
                <span :class="['absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all', form.is_featured ? 'left-6' : 'left-0.5']"></span>
              </button>
            </div>
            <!-- แสดงภาพปก — เฉพาะเมื่อเป็น embed -->
            <div v-if="form.media_type === 'embed'" class="flex items-center justify-between py-3">
              <div>
                <div class="text-sm font-medium text-gray-700">🖼️ แสดงภาพปก</div>
                <div class="text-xs text-gray-400">ซ่อน/แสดงภาพเมื่อมีเนื้อหา embed</div>
              </div>
              <button @click="form.show_thumbnail = !form.show_thumbnail"
                :class="['w-12 h-6 rounded-full transition-colors relative', form.show_thumbnail ? 'bg-indigo-500' : 'bg-gray-300']">
                <span :class="['absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all', form.show_thumbnail ? 'left-6' : 'left-0.5']"></span>
              </button>
            </div>
          </div>

          <!-- Category -->
          <div class="bg-white rounded-2xl shadow-sm p-5">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold text-gray-700">🏷️ หมวดหมู่</h3>
              <button @click="openCatModal" class="text-xs text-blue-500 hover:text-blue-700 hover:underline">⚙️ จัดการ</button>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="c in categories" :key="c.id" @click="form.category = c.name"
                :class="['py-2 px-3 rounded-xl text-xs font-medium border transition-all text-center',
                  form.category === c.name ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600']">
                {{ c.name }}
              </button>
            </div>
          </div>

          <!-- Subject Area -->
          <div class="bg-white rounded-2xl shadow-sm p-5">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold text-gray-700">📚 กลุ่มสาระ</h3>
              <button @click="openSubjectModal" class="text-xs text-purple-500 hover:text-purple-700 hover:underline">⚙️ จัดการ</button>
            </div>
            <select v-model="form.subject_area"
              class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
              <option value="">— ไม่ระบุกลุ่มสาระ —</option>
              <option v-for="s in subjectAreas" :key="s.id" :value="s.name">{{ s.name }}</option>
            </select>
          </div>

          <!-- Grade Level -->
          <div class="bg-white rounded-2xl shadow-sm p-5">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold text-gray-700">🎓 ระดับชั้น</h3>
              <button @click="openGradeModal" class="text-xs text-green-500 hover:text-green-700 hover:underline">⚙️ จัดการ</button>
            </div>
            <select v-model="form.grade_level"
              class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="">— ไม่ระบุระดับชั้น —</option>
              <option v-for="g in gradeLevels" :key="g.id" :value="g.name">{{ g.name }}</option>
            </select>
          </div>

          <!-- Actions -->
          <div class="bg-white rounded-2xl shadow-sm p-5 space-y-2">
            <button @click="handleSave" :disabled="saving"
              class="w-full btn-primary py-3 flex items-center justify-center gap-2 text-sm">
              <span v-if="saving" class="animate-spin">⏳</span>
              {{ saving ? 'กำลังบันทึก...' : (editId ? '💾 บันทึกการแก้ไข' : '✅ บันทึกสื่อ') }}
            </button>
            <button @click="showForm = false"
              class="w-full py-3 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              ยกเลิก
            </button>
          </div>
          <div v-if="errorMsg" class="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            ❌ {{ errorMsg }}
          </div>
        </div>
      </div>
    </div>

    <!-- Category Modal -->
    <Teleport to="body">
      <Transition name="backdrop">
        <div v-if="showCatModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 class="text-base font-bold text-gray-900">🏷️ จัดการหมวดหมู่สื่อ</h3>
              <button @click="showCatModal = false" class="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 text-lg">✕</button>
            </div>
            <div class="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              <div v-if="!categories.length" class="text-center py-8 text-gray-400 text-sm">ยังไม่มีหมวดหมู่</div>
              <div v-for="cat in categories" :key="cat.id" class="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
                <div v-if="catEditing?.id !== cat.id && catDeleteTarget?.id !== cat.id"
                  class="flex items-center gap-3 px-4 py-3">
                  <span class="flex-1 font-medium text-gray-800 text-sm">{{ cat.name }}</span>
                  <span class="text-xs text-gray-400 bg-white border border-gray-100 rounded-full px-2 py-0.5">{{ cat.count ?? 0 }} รายการ</span>
                  <button @click="startEditCat(cat)" class="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-sm">✏️</button>
                  <button @click="confirmDeleteCat(cat)" class="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm">🗑️</button>
                </div>
                <div v-else-if="catEditing?.id === cat.id" class="flex items-center gap-2 px-4 py-3">
                  <input v-model="catEditing.name" @keyup.enter="saveEditCat" @keyup.esc="catEditing = null"
                    class="flex-1 border border-blue-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" autofocus />
                  <button @click="saveEditCat" :disabled="catSaving" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">{{ catSaving ? '...' : '💾' }}</button>
                  <button @click="catEditing = null" class="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50">✕</button>
                </div>
                <div v-else-if="catDeleteTarget?.id === cat.id" class="px-4 py-3">
                  <p class="text-sm font-medium text-red-700 mb-2">🗑️ ลบ "{{ cat.name }}" <span v-if="cat.count" class="text-orange-600">({{ cat.count }} รายการ)</span></p>
                  <div v-if="cat.count" class="mb-3">
                    <label class="text-xs text-gray-500 block mb-1">ย้ายไปหมวด:</label>
                    <select v-model="catMoveTarget" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option v-for="c in categories.filter(c => c.id !== cat.id)" :key="c.id" :value="c.name">{{ c.name }}</option>
                    </select>
                  </div>
                  <div class="flex gap-2">
                    <button @click="catDeleteTarget = null" class="flex-1 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50">ยกเลิก</button>
                    <button v-if="cat.count" @click="handleDeleteCat(true)" :disabled="catSaving" class="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-medium">{{ catSaving ? '...' : '↗️ ย้ายแล้วลบ' }}</button>
                    <button @click="handleDeleteCat(false)" :disabled="catSaving" class="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-medium">{{ catSaving ? '...' : '🗑️ ลบ' }}</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="px-6 py-4 border-t border-gray-100">
              <div class="flex gap-2">
                <input v-model="catNewName" @keyup.enter="addCategory" placeholder="ชื่อหมวดหมู่ใหม่..."
                  class="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button @click="addCategory" :disabled="catSaving || !catNewName.trim()"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium">
                  {{ catSaving ? '...' : '+ เพิ่ม' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirm -->
    <Teleport to="body">
      <Transition name="backdrop">
        <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div class="text-3xl mb-3 text-center">🗑️</div>
            <h3 class="text-lg font-bold text-gray-900 text-center mb-2">ยืนยันการลบ</h3>
            <p class="text-sm text-gray-500 text-center mb-6">
              ลบสื่อ <span class="font-medium text-gray-700">"{{ deleteTarget.title }}"</span><br>ไม่สามารถกู้คืนได้
            </p>
            <div class="flex gap-3">
              <button @click="deleteTarget = null" class="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">ยกเลิก</button>
              <button @click="handleDelete" :disabled="saving" class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium">
                {{ saving ? '...' : 'ลบ' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Subject Area Modal -->
    <Teleport to="body">
      <Transition name="backdrop">
        <div v-if="showSubjectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 class="text-base font-bold text-gray-900">📚 จัดการกลุ่มสาระ</h3>
              <button @click="showSubjectModal = false" class="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 text-lg">✕</button>
            </div>
            <div class="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              <div v-if="!subjectAreas.length" class="text-center py-8 text-gray-400 text-sm">ยังไม่มีกลุ่มสาระ</div>
              <div v-for="s in subjectAreas" :key="s.id" class="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
                <div v-if="subjectEditing?.id !== s.id"
                  class="flex items-center gap-3 px-4 py-3">
                  <span class="flex-1 font-medium text-gray-800 text-sm">{{ s.name }}</span>
                  <button @click="startEditSubject(s)" class="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-sm">✏️</button>
                  <button @click="deleteSubject(s)" class="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm">🗑️</button>
                </div>
                <div v-else class="flex items-center gap-2 px-4 py-3">
                  <input v-model="subjectEditing.name" @keyup.enter="saveEditSubject" @keyup.esc="subjectEditing = null"
                    class="flex-1 border border-purple-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" autofocus />
                  <button @click="saveEditSubject" :disabled="subjectSaving" class="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700">{{ subjectSaving ? '...' : '💾' }}</button>
                  <button @click="subjectEditing = null" class="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50">✕</button>
                </div>
              </div>
            </div>
            <div class="px-6 py-4 border-t border-gray-100">
              <div class="flex gap-2">
                <input v-model="subjectNewName" @keyup.enter="addSubject" placeholder="ชื่อกลุ่มสาระใหม่..."
                  class="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                <button @click="addSubject" :disabled="subjectSaving || !subjectNewName.trim()"
                  class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium">
                  {{ subjectSaving ? '...' : '+ เพิ่ม' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Grade Level Modal -->
    <Teleport to="body">
      <Transition name="backdrop">
        <div v-if="showGradeModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 class="text-base font-bold text-gray-900">🎓 จัดการระดับชั้น</h3>
              <button @click="showGradeModal = false" class="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 text-lg">✕</button>
            </div>
            <div class="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              <div v-if="!gradeLevels.length" class="text-center py-8 text-gray-400 text-sm">ยังไม่มีระดับชั้น</div>
              <div v-for="g in gradeLevels" :key="g.id" class="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
                <div v-if="gradeEditing?.id !== g.id" class="flex items-center gap-3 px-4 py-3">
                  <span class="flex-1 font-medium text-gray-800 text-sm">{{ g.name }}</span>
                  <button @click="startEditGrade(g)" class="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-sm">✏️</button>
                  <button @click="deleteGrade(g)" class="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm">🗑️</button>
                </div>
                <div v-else class="flex items-center gap-2 px-4 py-3">
                  <input v-model="gradeEditing.name" @keyup.enter="saveEditGrade" @keyup.esc="gradeEditing = null"
                    class="flex-1 border border-green-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" autofocus />
                  <button @click="saveEditGrade" :disabled="gradeSaving" class="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">{{ gradeSaving ? '...' : '💾' }}</button>
                  <button @click="gradeEditing = null" class="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50">✕</button>
                </div>
              </div>
            </div>
            <div class="px-6 py-4 border-t border-gray-100">
              <div class="flex gap-2">
                <input v-model="gradeNewName" @keyup.enter="addGrade" placeholder="ชื่อระดับชั้นใหม่ เช่น ป.1..."
                  class="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                <button @click="addGrade" :disabled="gradeSaving || !gradeNewName.trim()"
                  class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium">
                  {{ gradeSaving ? '...' : '+ เพิ่ม' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toast" class="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-medium whitespace-nowrap">
          {{ toast }}
        </div>
      </Transition>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import ImageUploadCrop from '../../components/admin/ImageUploadCrop.vue'
import { supabase } from '../../lib/supabase'

const mediaList      = ref([])
const loading        = ref(true)
const saving         = ref(false)
const showForm       = ref(false)
const editId         = ref(null)
const formKey        = ref(Date.now())
const deleteTarget   = ref(null)
const toast          = ref('')
const errorMsg       = ref('')
const searchQuery    = ref('')
const filterCategory = ref('all')
const filterType     = ref('all')

// Categories
const categories      = ref([])
const showCatModal    = ref(false)
const catSaving       = ref(false)
const catNewName      = ref('')
const catEditing      = ref(null)
const catDeleteTarget = ref(null)
const catMoveTarget   = ref('')

const defaultForm = () => ({
  title: '', description: '', content: '', media_type: 'embed',
  thumbnail_url: '', category: 'ทั่วไป',
  author_name: '', subject_area: '', grade_level: '',
  is_published: true, is_featured: false, show_thumbnail: true,
  external_url: '',
})
const form = ref(defaultForm())

// ============================================================
// Multi-item state
// ============================================================
const mediaItems = ref([{ raw: '', label: '' }])

function addItem() { mediaItems.value.push({ raw: '', label: '' }) }
function removeItem(idx) { mediaItems.value.splice(idx, 1) }

function parseMediaItems(content) {
  if (!content) return [{ raw: '', label: '' }]
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed) && parsed.length) return parsed
  } catch {}
  // backward compat: single raw string
  return [{ raw: content, label: '' }]
}

function serializeMediaItems() {
  const items = mediaItems.value.filter(i => i.raw?.trim())
  if (!items.length) return ''
  return JSON.stringify(items.map(i => ({ raw: i.raw.trim(), label: i.label?.trim() || '' })))
}

// ============================================================
// Embed detector
// ============================================================
function detectEmbedUrl(raw) {
  if (!raw?.trim()) return null
  const input = raw.trim()
  const iframeSrc = input.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1]
  const url = iframeSrc ?? input

  if (/docs\.google\.com\/presentation/i.test(url)) {
    if (/\/e\/[A-Za-z0-9_-]+\/pub/i.test(url)) return { icon: '📊', label: 'Google Slides', src: url, ratio: '56.25%' }
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (m) return { icon: '📊', label: 'Google Slides', src: `https://docs.google.com/presentation/d/${m[1]}/embed?start=false&loop=false&delayms=3000`, ratio: '56.25%' }
  }
  if (/drive\.google\.com\/file/i.test(url)) {
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (m) return { icon: '📄', label: 'Google Drive', src: `https://drive.google.com/file/d/${m[1]}/preview`, ratio: '130%' }
  }
  if (/canva\.(com|link)/i.test(url)) {
    if (/canva\.link/i.test(url)) return { icon: '🎨', label: 'Canva', src: '', ratio: '56.25%', warning: 'canva_link' }
    const s = url.replace(/\/(edit|present)(\/[^?]*)?(\?.*)?$/, '/view').replace(/\/view(\?.*)?$/, '/view?embed')
    return { icon: '🎨', label: 'Canva', src: s, ratio: '56.25%' }
  }
  const ytW = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (ytW) return { icon: '▶️', label: 'YouTube', src: `https://www.youtube.com/embed/${ytW[1]}`, ratio: '56.25%' }
  const ytS = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (ytS) return { icon: '▶️', label: 'YouTube', src: `https://www.youtube.com/embed/${ytS[1]}`, ratio: '56.25%' }
  return null
}

function getItemInfo(item) {
  return detectEmbedUrl(item.raw)
}

// ============================================================
// Type helpers
// ============================================================
function getEmbedType(item) {
  if (item.media_type === 'link') return 'link'
  // support JSON array — use first item's raw
  let raw = item.content || ''
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed[0]?.raw) raw = parsed[0].raw
  } catch {}
  const info = detectEmbedUrl(raw)
  if (!info) return 'embed'
  if (info.label === 'YouTube') return 'youtube'
  if (info.label === 'Google Slides') return 'slides'
  if (info.label === 'Google Drive') return 'pdf'
  if (info.label === 'Canva') return 'canva'
  return 'embed'
}
function typeIcon(item) {
  const t = getEmbedType(item)
  return { youtube: '▶️', slides: '📊', pdf: '📄', canva: '🎨', link: '🌐', embed: '🔗' }[t] || '🔗'
}
function typeLabel(item) {
  const t = getEmbedType(item)
  return { youtube: '▶️ YouTube', slides: '📊 Slides', pdf: '📄 PDF', canva: '🎨 Canva', link: '🌐 ลิงก์', embed: '🔗 Embed' }[t] || '🔗 Embed'
}
function typeStyle(item) {
  const t = getEmbedType(item)
  return {
    youtube: 'bg-red-50 text-red-700',
    slides:  'bg-green-50 text-green-700',
    pdf:     'bg-orange-50 text-orange-700',
    canva:   'bg-purple-50 text-purple-700',
    link:    'bg-blue-50 text-blue-700',
    embed:   'bg-gray-50 text-gray-700',
  }[t] || 'bg-gray-50 text-gray-700'
}

// ============================================================
// Filtered list
// ============================================================
const filteredMedia = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return mediaList.value.filter(m => {
    const matchQ    = !q || m.title.toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q)
    const matchCat  = filterCategory.value === 'all' || m.category === filterCategory.value
    const matchType = filterType.value === 'all' || m.media_type === filterType.value
    return matchQ && matchCat && matchType
  })
})

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
}

// ============================================================
// CRUD
// ============================================================
async function fetchMedia() {
  loading.value = true
  const { data } = await supabase.from('media')
    .select('id,title,thumbnail_url,category,subject_area,grade_level,media_type,content,is_published,is_featured,created_at')
    .order('created_at', { ascending: false })
  mediaList.value = data || []
  loading.value = false
}

function openAdd() {
  editId.value = null
  formKey.value = Date.now()
  form.value = defaultForm()
  mediaItems.value = [{ raw: '', label: '' }]
  errorMsg.value = ''
  showForm.value = true
}

async function openEdit(item) {
  editId.value = item.id
  formKey.value = item.id
  errorMsg.value = ''
  showForm.value = true
  form.value = defaultForm()
  mediaItems.value = [{ raw: '', label: '' }]
  const { data } = await supabase.from('media').select('*').eq('id', item.id).maybeSingle()
  if (data) {
    form.value = { ...data }
    mediaItems.value = parseMediaItems(data.content)
  }
}

async function handleSave() {
  if (!form.value.title.trim()) { errorMsg.value = 'กรุณากรอกชื่อสื่อ'; return }
  saving.value = true
  errorMsg.value = ''
  const payload = {
    title:         form.value.title.trim(),
    description:   form.value.description?.trim() || '',
    content:       serializeMediaItems(),
    media_type:    form.value.media_type,
    thumbnail_url: form.value.thumbnail_url,
    category:      form.value.category,
    author_name:   form.value.author_name?.trim() || '',
    subject_area:  form.value.subject_area  || '',
    grade_level:   form.value.grade_level   || '',
    is_published:    form.value.is_published,
    is_featured:     form.value.is_featured,
    show_thumbnail:  form.value.show_thumbnail ?? true,
    updated_at:      new Date().toISOString(),
    external_url:    form.value.external_url?.trim() || '',
  }
  let error
  if (editId.value) {
    ;({ error } = await supabase.from('media').update(payload).eq('id', editId.value))
  } else {
    ;({ error } = await supabase.from('media').insert(payload))
  }
  saving.value = false
  if (error) { errorMsg.value = error.message; return }
  showToast(editId.value ? '✅ แก้ไขสื่อสำเร็จ' : '✅ เพิ่มสื่อสำเร็จ')
  showForm.value = false
  fetchMedia()
}

function confirmDelete(item) { deleteTarget.value = item }

async function handleDelete() {
  saving.value = true
  await supabase.from('media').delete().eq('id', deleteTarget.value.id)
  saving.value = false
  deleteTarget.value = null
  showToast('🗑️ ลบสื่อสำเร็จ')
  fetchMedia()
}

async function togglePublish(item) {
  const { error } = await supabase.from('media').update({ is_published: !item.is_published }).eq('id', item.id)
  if (!error) { item.is_published = !item.is_published; showToast(item.is_published ? '✅ เผยแพร่แล้ว' : '📝 บันทึกเป็นร่าง') }
}

// ============================================================
// Category CRUD
// ============================================================
async function fetchCategories() {
  const { data } = await supabase.from('media_categories').select('id,name,sort_order').order('sort_order').order('name')
  categories.value = data || []
}

async function openCatModal() {
  showCatModal.value = true
  catSaving.value = false
  catEditing.value = null
  catDeleteTarget.value = null
  catNewName.value = ''
  catMoveTarget.value = ''
  const [{ data: cats }, { data: rows }] = await Promise.all([
    supabase.from('media_categories').select('id,name,sort_order').order('sort_order').order('name'),
    supabase.from('media').select('category'),
  ])
  const countMap = {}
  rows?.forEach(r => { countMap[r.category] = (countMap[r.category] || 0) + 1 })
  categories.value = (cats || []).map(c => ({ ...c, count: countMap[c.name] || 0 }))
}

async function addCategory() {
  const name = catNewName.value.trim()
  if (!name) return
  catSaving.value = true
  const { error } = await supabase.from('media_categories').insert({ name, sort_order: categories.value.length + 1 })
  catSaving.value = false
  if (error) { showToast(error.message.includes('unique') ? '⚠️ ชื่อนี้มีอยู่แล้ว' : '❌ ' + error.message); return }
  catNewName.value = ''
  showToast('✅ เพิ่มหมวดหมู่แล้ว')
  await openCatModal(); fetchCategories()
}

function startEditCat(cat) { catEditing.value = { id: cat.id, name: cat.name, original: cat.name }; catDeleteTarget.value = null }

async function saveEditCat() {
  const { id, name, original } = catEditing.value
  const newName = name.trim()
  if (!newName) return
  if (newName === original) { catEditing.value = null; return }
  catSaving.value = true
  const { error } = await supabase.from('media_categories').update({ name: newName }).eq('id', id)
  if (error) { showToast('❌ ' + error.message); catSaving.value = false; return }
  await supabase.from('media').update({ category: newName }).eq('category', original)
  catSaving.value = false; catEditing.value = null
  showToast(`✅ เปลี่ยนเป็น "${newName}" แล้ว`)
  await openCatModal(); fetchCategories()
}

function confirmDeleteCat(cat) { catDeleteTarget.value = cat; catEditing.value = null; catMoveTarget.value = categories.value.find(c => c.id !== cat.id)?.name || '' }

async function handleDeleteCat(moveItems) {
  const target = catDeleteTarget.value
  catSaving.value = true
  if (moveItems && catMoveTarget.value) await supabase.from('media').update({ category: catMoveTarget.value }).eq('category', target.name)
  await supabase.from('media_categories').delete().eq('id', target.id)
  catSaving.value = false; catDeleteTarget.value = null
  showToast(`🗑️ ลบ "${target.name}" แล้ว`)
  catMoveTarget.value = ''
  await openCatModal(); fetchCategories()
}

let toastTimer = null
function showToast(msg, ms = 3000) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, ms)
}

// ============================================================
// Subject Areas CRUD
// ============================================================
const subjectAreas    = ref([])
const showSubjectModal = ref(false)
const subjectSaving   = ref(false)
const subjectNewName  = ref('')
const subjectEditing  = ref(null)

async function fetchSubjectAreas() {
  const { data } = await supabase.from('subject_areas').select('id,name,sort_order').order('sort_order').order('name')
  subjectAreas.value = data || []
}

async function openSubjectModal() {
  showSubjectModal.value = true
  subjectEditing.value = null
  subjectNewName.value = ''
  await fetchSubjectAreas()
}

async function addSubject() {
  const name = subjectNewName.value.trim()
  if (!name) return
  subjectSaving.value = true
  const { error } = await supabase.from('subject_areas').insert({ name, sort_order: subjectAreas.value.length + 1 })
  subjectSaving.value = false
  if (error) { showToast(error.message.includes('unique') ? '⚠️ ชื่อนี้มีอยู่แล้ว' : '❌ ' + error.message); return }
  subjectNewName.value = ''
  showToast('✅ เพิ่มกลุ่มสาระแล้ว')
  await fetchSubjectAreas()
}

function startEditSubject(s) { subjectEditing.value = { id: s.id, name: s.name, original: s.name } }

async function saveEditSubject() {
  const { id, name, original } = subjectEditing.value
  const newName = name.trim()
  if (!newName || newName === original) { subjectEditing.value = null; return }
  subjectSaving.value = true
  const { error } = await supabase.from('subject_areas').update({ name: newName }).eq('id', id)
  if (!error) await supabase.from('media').update({ subject_area: newName }).eq('subject_area', original)
  subjectSaving.value = false
  subjectEditing.value = null
  showToast(error ? '❌ ' + error.message : `✅ เปลี่ยนเป็น "${newName}" แล้ว`)
  await fetchSubjectAreas()
}

async function deleteSubject(s) {
  if (!confirm(`ลบกลุ่มสาระ "${s.name}" ?\n(สื่อที่อยู่ในกลุ่มนี้จะไม่มีกลุ่มสาระ)`)) return
  subjectSaving.value = true
  await supabase.from('subject_areas').delete().eq('id', s.id)
  subjectSaving.value = false
  showToast(`🗑️ ลบ "${s.name}" แล้ว`)
  await fetchSubjectAreas()
}

// ============================================================
// Grade Levels CRUD
// ============================================================
const gradeLevels    = ref([])
const showGradeModal = ref(false)
const gradeSaving    = ref(false)
const gradeNewName   = ref('')
const gradeEditing   = ref(null)

async function fetchGradeLevels() {
  const { data } = await supabase.from('grade_levels').select('id,name,sort_order').order('sort_order').order('name')
  gradeLevels.value = data || []
}

async function openGradeModal() {
  showGradeModal.value = true
  gradeEditing.value   = null
  gradeNewName.value   = ''
  await fetchGradeLevels()
}

async function addGrade() {
  const name = gradeNewName.value.trim()
  if (!name) return
  gradeSaving.value = true
  const { error } = await supabase.from('grade_levels').insert({ name, sort_order: gradeLevels.value.length + 1 })
  gradeSaving.value = false
  if (error) { showToast(error.message.includes('unique') ? '⚠️ ชื่อนี้มีอยู่แล้ว' : '❌ ' + error.message); return }
  gradeNewName.value = ''
  showToast('✅ เพิ่มระดับชั้นแล้ว')
  await fetchGradeLevels()
}

function startEditGrade(g) { gradeEditing.value = { id: g.id, name: g.name, original: g.name } }

async function saveEditGrade() {
  const { id, name, original } = gradeEditing.value
  const newName = name.trim()
  if (!newName || newName === original) { gradeEditing.value = null; return }
  gradeSaving.value = true
  const { error } = await supabase.from('grade_levels').update({ name: newName }).eq('id', id)
  if (!error) await supabase.from('media').update({ grade_level: newName }).eq('grade_level', original)
  gradeSaving.value = false
  gradeEditing.value = null
  showToast(error ? '❌ ' + error.message : `✅ เปลี่ยนเป็น "${newName}" แล้ว`)
  await fetchGradeLevels()
}

async function deleteGrade(g) {
  if (!confirm(`ลบระดับชั้น "${g.name}" ?\n(สื่อที่อยู่ในระดับนี้จะไม่มีระดับชั้น)`)) return
  gradeSaving.value = true
  await supabase.from('grade_levels').delete().eq('id', g.id)
  gradeSaving.value = false
  showToast(`🗑️ ลบ "${g.name}" แล้ว`)
  await fetchGradeLevels()
}

fetchMedia()
fetchCategories()
fetchSubjectAreas()
fetchGradeLevels()
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.35s cubic-bezier(.4,0,.2,1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, -16px) scale(0.95); }
.backdrop-enter-active, .backdrop-leave-active { transition: opacity 0.2s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }
</style>
