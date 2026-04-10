<template>
  <AdminLayout>
    <!-- ===== LIST VIEW ===== -->
    <div v-if="!showForm">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-900">จัดการข่าวประชาสัมพันธ์</h2>
          <p class="text-sm text-gray-500 mt-0.5">ทั้งหมด {{ newsList.length }} รายการ</p>
        </div>
        <div class="flex gap-2">
          <button @click="openCatModal"
            class="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
            🏷️ หมวดหมู่
          </button>
          <button @click="openAdd" class="btn-primary flex items-center gap-2">
            <span class="text-lg leading-none">+</span> เพิ่มข่าว
          </button>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="bg-white rounded-2xl shadow-sm p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div class="flex-1 relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input v-model="searchQuery" type="text" placeholder="ค้นหาชื่อข่าว..."
            class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select v-model="filterCategory" class="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">ทุกหมวดหมู่</option>
          <option v-for="c in categories" :key="c.id" :value="c.name">{{ c.name }}</option>
        </select>
        <select v-model="filterStatus" class="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">ทุกสถานะ</option>
          <option value="published">เผยแพร่</option>
          <option value="draft">ร่าง</option>
        </select>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div v-if="loading" class="p-10 text-center text-gray-400">
          <div class="text-3xl mb-2 animate-spin">⏳</div>กำลังโหลด...
        </div>
        <div v-else-if="!filteredNews.length" class="p-10 text-center text-gray-400">
          <div class="text-4xl mb-2">📰</div><p>ไม่พบข่าว</p>
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wide">
              <th class="py-3 px-4 w-16">ภาพ</th>
              <th class="py-3 px-4">หัวข้อข่าว</th>
              <th class="py-3 px-4 hidden md:table-cell w-28">หมวดหมู่</th>
              <th class="py-3 px-4 hidden lg:table-cell w-36">วันที่สร้าง</th>
              <th class="py-3 px-4 hidden lg:table-cell w-14 text-center">วิว</th>
              <th class="py-3 px-4 w-28 text-center">สถานะ</th>
              <th class="py-3 px-4 w-20 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredNews" :key="item.id"
              class="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
              <td class="py-2 px-4">
                <div class="w-12 h-9 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img v-if="item.cover_image_url" :src="item.cover_image_url" class="w-full h-full object-cover" />
                  <span v-else class="text-lg">📰</span>
                </div>
              </td>
              <td class="py-2 px-4 max-w-[220px]">
                <div class="flex items-start gap-1.5">
                  <span v-if="item.is_pinned" class="text-yellow-500 mt-0.5 flex-shrink-0">📌</span>
                  <span class="font-medium text-gray-900 line-clamp-2 leading-snug">{{ item.title }}</span>
                </div>
              </td>
              <td class="py-2 px-4 hidden md:table-cell">
                <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{{ item.category }}</span>
              </td>
              <td class="py-2 px-4 hidden lg:table-cell text-gray-500 text-xs">{{ formatDate(item.created_at) }}</td>
              <td class="py-2 px-4 hidden lg:table-cell text-center text-gray-500 text-xs">{{ item.views || 0 }}</td>
              <td class="py-2 px-4 text-center">
                <button @click="togglePublish(item)"
                  :class="['px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                    item.is_published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200']">
                  {{ item.is_published ? '✅ เผยแพร่' : '📝 ร่าง' }}
                </button>
              </td>
              <td class="py-2 px-4">
                <div class="flex items-center justify-center gap-1">
                  <button @click="openEdit(item)" class="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="แก้ไข">✏️</button>
                  <button @click="confirmDelete(item)" class="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="ลบ">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===== FORM VIEW ===== -->
    <div v-else>
      <div class="flex items-center gap-3 mb-6">
        <button @click="showForm = false"
          class="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700">
          ← กลับ
        </button>
        <div>
          <h2 class="text-xl font-bold text-gray-900">{{ editId ? 'แก้ไขข่าว' : 'เพิ่มข่าวใหม่' }}</h2>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Main -->
        <div class="lg:col-span-2 space-y-5">
          <!-- Cover Image -->
          <div class="bg-white rounded-2xl shadow-sm p-5">
            <h3 class="font-semibold text-gray-700 mb-3">📸 ภาพปกข่าว</h3>
            <ImageUploadCrop
              v-model="form.cover_image_url"
              bucket="school"
              :storage-path="`news/cover-${formKey}.jpg`"
              :aspect-ratio="4/3"
              :output-width="800"
              format="jpeg"
              :quality="0.8"
              placeholder="คลิกเพื่อเลือกภาพปก"
              hint="สัดส่วน 4:3 · 800×600px · ≤ 2MB"
            />
          </div>

          <!-- Title & Excerpt -->
          <div class="bg-white rounded-2xl shadow-sm p-5">
            <h3 class="font-semibold text-gray-700 mb-3">📝 หัวข้อข่าว</h3>
            <input v-model="form.title" type="text" placeholder="หัวข้อข่าว..."
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3" />
            <textarea v-model="form.excerpt" rows="2"
              placeholder="สรุปสั้นๆ สำหรับแสดงในการ์ด (ถ้าไม่กรอก จะตัดจากเนื้อหาอัตโนมัติ)"
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
          </div>

          <!-- External URL -->
          <div class="bg-white rounded-2xl shadow-sm p-5">
            <h3 class="font-semibold text-gray-700 mb-1">🔗 ลิงก์ภายนอก <span class="text-xs font-normal text-gray-400">(ไม่บังคับ)</span></h3>
            <p class="text-xs text-gray-400 mb-3">ถ้ากรอก — คลิกการ์ดจะเปิดลิงก์นี้ในแท็บใหม่ทันที ไม่ผ่านหน้าข่าว</p>
            <input v-model="form.external_url" type="url" placeholder="https://..."
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <!-- Content -->
          <div class="bg-white rounded-2xl shadow-sm p-5">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold text-gray-700">📄 เนื้อหา</h3>
              <div class="flex bg-gray-100 rounded-xl p-1 gap-1">
                <button @click="form.content_type = 'text'"
                  :class="['px-3 py-1 text-xs rounded-lg transition-colors font-medium',
                    form.content_type === 'text' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700']">
                  ✏️ ข้อความ
                </button>
                <button @click="form.content_type = 'html'"
                  :class="['px-3 py-1 text-xs rounded-lg transition-colors font-medium',
                    form.content_type === 'html' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700']">
                  &lt;/&gt; HTML
                </button>
                <button @click="form.content_type = 'embed'"
                  :class="['px-3 py-1 text-xs rounded-lg transition-colors font-medium',
                    form.content_type === 'embed' ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-700']">
                  🔗 Embed
                </button>
              </div>
            </div>

            <!-- Embed — หลายไฟล์/วิดีโอ -->
            <div v-if="form.content_type === 'embed'">
              <!-- คำแนะนำ -->
              <div class="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 mb-4 text-xs text-purple-700 space-y-1.5">
                <p class="font-semibold text-purple-800">📎 วิธีรับ Embed Code / URL</p>
                <p>📊 <b>Google Slides</b> — ไฟล์ → แชร์ → เผยแพร่บนเว็บ → แท็บ <b>"ฝัง"</b> → copy &lt;iframe&gt;</p>
                <p>📄 <b>PDF Drive</b> — แชร์ → ทุกคนที่มีลิงก์ → copy URL</p>
                <p>🎨 <b>Canva</b> — Share → Embed → copy &lt;iframe&gt; <span class="text-orange-600">(ห้ามใช้ canva.link)</span></p>
                <p>▶️ <b>YouTube</b> — copy URL จาก browser</p>
                <p class="text-blue-600 font-medium">💡 วางได้ทั้ง URL และ &lt;iframe&gt; code — เพิ่มได้หลายรายการ</p>
              </div>

              <!-- embed items -->
              <div v-for="(item, i) in embedItems" :key="i"
                class="mb-3 border border-gray-200 rounded-xl p-4 bg-gray-50/40">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">ไฟล์ที่ {{ i + 1 }}</span>
                  <button v-if="embedItems.length > 1" @click="removeEmbedItem(i)"
                    class="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors">
                    🗑️ ลบ
                  </button>
                </div>
                <!-- label -->
                <input v-model="item.label" placeholder="ชื่อหัวข้อ (ไม่บังคับ) เช่น วิดีโอแนะนำ, สไลด์ประกอบ"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white" />
                <!-- URL / iframe input -->
                <div class="relative">
                  <textarea v-model="item.raw" rows="2"
                    placeholder="วาง URL หรือ <iframe ...> code..."
                    class="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none bg-white" />
                  <span v-if="getEmbedInfo(item.raw) && !getEmbedInfo(item.raw)?.warning"
                    class="absolute right-2 top-2 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 pointer-events-none">
                    {{ getEmbedInfo(item.raw).icon }} {{ getEmbedInfo(item.raw).label }}
                  </span>
                </div>
                <!-- canva.link warning -->
                <p v-if="getEmbedInfo(item.raw)?.warning === 'canva_link'"
                  class="mt-2 text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2">
                  ⚠️ canva.link ฝัง iframe ไม่ได้ — ใช้ Share → Embed → copy &lt;iframe&gt; แทน
                </p>
                <!-- mini preview -->
                <div v-else-if="getEmbedInfo(item.raw)?.src" class="mt-3 rounded-xl overflow-hidden border border-gray-200"
                  :style="`position:relative; padding-top:${getEmbedInfo(item.raw).ratio};`">
                  <iframe :src="getEmbedInfo(item.raw).src"
                    style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"
                    allowfullscreen loading="lazy" />
                </div>
                <p v-else-if="item.raw?.trim()" class="mt-2 text-xs text-red-400">⚠️ ไม่รู้จัก URL นี้</p>
              </div>

              <!-- add button -->
              <button @click="addEmbedItem"
                class="w-full py-3 border-2 border-dashed border-purple-200 text-purple-600 rounded-xl text-sm font-medium hover:border-purple-400 hover:bg-purple-50 transition-all">
                + เพิ่มไฟล์ / วิดีโอ
              </button>
            </div>

            <!-- Text / HTML textarea -->
            <textarea v-else v-model="form.content" rows="14"
              :placeholder="form.content_type === 'html'
                ? '<h2>หัวข้อย่อย</h2>\n<p>เนื้อหาข่าว...</p>\n<ul><li>รายการ</li></ul>'
                : 'เนื้อหาข่าว...'"
              :class="['w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors',
                form.content_type === 'html' ? 'font-mono text-xs bg-gray-50' : '']">
            </textarea>

            <!-- HTML Preview -->
            <div v-if="form.content_type === 'html' && form.content" class="mt-4 border-t border-gray-100 pt-4">
              <p class="text-xs text-gray-400 font-medium mb-3">📺 ตัวอย่างการแสดงผล</p>
              <iframe :srcdoc="iframePreview"
                class="w-full rounded-xl border border-gray-200"
                style="height:360px; border:none;"
                sandbox="allow-same-origin"></iframe>
            </div>
          </div>

          <!-- Links -->
          <div class="bg-white rounded-2xl shadow-sm p-5">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold text-gray-700">🔗 ลิงก์ที่เกี่ยวข้อง</h3>
              <button @click="addLink"
                class="text-xs text-blue-600 hover:text-blue-800 px-3 py-1.5 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">
                + เพิ่มลิงก์
              </button>
            </div>
            <p v-if="!form.links.length" class="text-sm text-gray-400 text-center py-4">ยังไม่มีลิงก์ — รองรับลิงก์ Google Drive</p>
            <div v-for="(link, i) in form.links" :key="i" class="flex gap-2 mb-2">
              <input v-model="link.label" placeholder="ชื่อลิงก์ เช่น ดาวน์โหลดเอกสาร"
                class="w-36 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0" />
              <input v-model="link.url" placeholder="https://drive.google.com/..."
                class="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button @click="form.links.splice(i, 1)"
                class="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0">🗑️</button>
            </div>
          </div>

          <!-- Extra Images -->
          <div class="bg-white rounded-2xl shadow-sm p-5">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold text-gray-700">🖼️ ภาพประกอบเพิ่มเติม</h3>
              <button @click="addExtraImage"
                class="text-xs text-blue-600 hover:text-blue-800 px-3 py-1.5 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">
                + เพิ่มภาพ
              </button>
            </div>
            <p v-if="!form.extra_images.length" class="text-sm text-gray-400 text-center py-4">ยังไม่มีภาพประกอบ</p>
            <div v-for="(img, i) in form.extra_images" :key="i" class="mb-4 border border-gray-100 rounded-xl p-4">
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-gray-600">ภาพที่ {{ i + 1 }}</span>
                <button @click="removeExtraImage(i)"
                  class="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">ลบ</button>
              </div>
              <ImageUploadCrop
                v-model="img.url"
                bucket="school"
                :storage-path="`news/extra-${formKey}-${i}.jpg`"
                :aspect-ratio="4/3"
                :output-width="800"
                format="jpeg"
                :quality="0.8"
                placeholder="คลิกเลือกภาพประกอบ"
              />
              <input v-model="img.caption" placeholder="คำบรรยายภาพ (ไม่บังคับ)"
                class="w-full mt-2 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <!-- Right: Settings -->
        <div class="space-y-5">
          <!-- Publish Settings -->
          <div class="bg-white rounded-2xl shadow-sm p-5">
            <h3 class="font-semibold text-gray-700 mb-4">⚙️ การเผยแพร่</h3>

            <div class="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div class="text-sm font-medium text-gray-700">เผยแพร่</div>
                <div class="text-xs text-gray-400">แสดงบนเว็บไซต์ทันที</div>
              </div>
              <button @click="form.is_published = !form.is_published"
                :class="['relative w-11 h-6 rounded-full transition-colors flex-shrink-0', form.is_published ? 'bg-green-500' : 'bg-gray-300']">
                <span :class="['absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', form.is_published ? 'translate-x-5' : '']"></span>
              </button>
            </div>

            <div class="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div class="text-sm font-medium text-gray-700">📌 ปักหมุด</div>
                <div class="text-xs text-gray-400">แสดงอยู่บนสุดเสมอ</div>
              </div>
              <button @click="form.is_pinned = !form.is_pinned"
                :class="['relative w-11 h-6 rounded-full transition-colors flex-shrink-0', form.is_pinned ? 'bg-yellow-400' : 'bg-gray-300']">
                <span :class="['absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', form.is_pinned ? 'translate-x-5' : '']"></span>
              </button>
            </div>

            <div class="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div class="text-sm font-medium text-gray-700">🖼️ แสดงภาพปก</div>
                <div class="text-xs text-gray-400">แสดงภาพปกในหน้าเนื้อหา</div>
              </div>
              <button @click="form.show_cover = !form.show_cover"
                :class="['relative w-11 h-6 rounded-full transition-colors flex-shrink-0', form.show_cover ? 'bg-blue-500' : 'bg-gray-300']">
                <span :class="['absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', form.show_cover ? 'translate-x-5' : '']"></span>
              </button>
            </div>

            <div class="pt-3">
              <label class="text-sm font-medium text-gray-700 block mb-1.5">📅 วันที่โพสต์</label>
              <input v-model="form.published_at" type="datetime-local"
                class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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

          <!-- Actions -->
          <div class="bg-white rounded-2xl shadow-sm p-5 space-y-2">
            <button @click="handleSave" :disabled="saving"
              class="w-full btn-primary py-3 flex items-center justify-center gap-2 text-sm">
              <span v-if="saving" class="animate-spin">⏳</span>
              {{ saving ? 'กำลังบันทึก...' : (editId ? '💾 บันทึกการแก้ไข' : '✅ บันทึกข่าว') }}
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

    <!-- Category Manager Modal -->
    <Teleport to="body">
      <Transition name="backdrop">
        <div v-if="showCatModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col">

            <!-- header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 class="text-base font-bold text-gray-900">🏷️ จัดการหมวดหมู่</h3>
              <button @click="showCatModal = false" class="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 text-lg">✕</button>
            </div>

            <!-- list -->
            <div class="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              <div v-if="!categories.length" class="text-center py-8 text-gray-400 text-sm">ยังไม่มีหมวดหมู่</div>

              <div v-for="cat in categories" :key="cat.id"
                class="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">

                <!-- normal row -->
                <div v-if="catEditing?.id !== cat.id && catDeleteTarget?.id !== cat.id"
                  class="flex items-center gap-3 px-4 py-3">
                  <span class="flex-1 font-medium text-gray-800 text-sm">{{ cat.name }}</span>
                  <span class="text-xs text-gray-400 bg-white border border-gray-100 rounded-full px-2 py-0.5">
                    {{ cat.count ?? 0 }} ข่าว
                  </span>
                  <button @click="startEditCat(cat)"
                    class="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm">✏️</button>
                  <button @click="confirmDeleteCat(cat)"
                    class="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm">🗑️</button>
                </div>

                <!-- edit row -->
                <div v-else-if="catEditing?.id === cat.id"
                  class="flex items-center gap-2 px-4 py-3">
                  <input v-model="catEditing.name" @keyup.enter="saveEditCat" @keyup.esc="catEditing = null"
                    class="flex-1 border border-blue-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    autofocus />
                  <button @click="saveEditCat" :disabled="catSaving"
                    class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                    {{ catSaving ? '...' : '💾' }}
                  </button>
                  <button @click="catEditing = null"
                    class="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-colors">✕</button>
                </div>

                <!-- delete confirm row -->
                <div v-else-if="catDeleteTarget?.id === cat.id" class="px-4 py-3">
                  <p class="text-sm font-medium text-red-700 mb-2">
                    🗑️ ลบ "{{ cat.name }}"
                    <span v-if="cat.count" class="text-orange-600"> — มีข่าว {{ cat.count }} รายการ</span>
                  </p>
                  <!-- ถ้ามีข่าวใช้อยู่ → ให้เลือกย้าย -->
                  <div v-if="cat.count" class="mb-3">
                    <label class="text-xs text-gray-500 block mb-1">ย้ายข่าวทั้งหมดไปหมวด:</label>
                    <select v-model="catMoveTarget"
                      class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option v-for="c in categories.filter(c => c.id !== cat.id)" :key="c.id" :value="c.name">
                        {{ c.name }}
                      </option>
                    </select>
                  </div>
                  <div class="flex gap-2">
                    <button @click="catDeleteTarget = null"
                      class="flex-1 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 transition-colors">ยกเลิก</button>
                    <button v-if="cat.count" @click="handleDeleteCat(true)" :disabled="catSaving"
                      class="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-medium transition-colors">
                      {{ catSaving ? '...' : '↗️ ย้ายแล้วลบ' }}
                    </button>
                    <button @click="handleDeleteCat(false)" :disabled="catSaving"
                      class="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-medium transition-colors">
                      {{ catSaving ? '...' : cat.count ? '🗑️ ลบเลย' : '🗑️ ลบ' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- add new -->
            <div class="px-6 py-4 border-t border-gray-100">
              <div class="flex gap-2">
                <input v-model="catNewName" @keyup.enter="addCategory"
                  placeholder="ชื่อหมวดหมู่ใหม่..."
                  class="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button @click="addCategory" :disabled="catSaving || !catNewName.trim()"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors">
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
              ลบข่าว <span class="font-medium text-gray-700">"{{ deleteTarget.title }}"</span><br>ไม่สามารถกู้คืนได้
            </p>
            <div class="flex gap-3">
              <button @click="deleteTarget = null" class="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">ยกเลิก</button>
              <button @click="handleDelete" :disabled="saving"
                class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors">
                {{ saving ? '...' : 'ลบ' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toast"
          class="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-medium whitespace-nowrap">
          {{ toast }}
        </div>
      </Transition>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AdminLayout from '../../layouts/AdminLayout.vue'
import ImageUploadCrop from '../../components/admin/ImageUploadCrop.vue'
import { supabase } from '../../lib/supabase'

const newsList    = ref([])
const loading     = ref(true)
const saving      = ref(false)
const showForm    = ref(false)
const editId      = ref(null)
const formKey     = ref(Date.now())
const deleteTarget = ref(null)
const toast       = ref('')
const errorMsg    = ref('')
const searchQuery = ref('')
const filterCategory = ref('all')
const filterStatus   = ref('all')
const deletedImages  = ref([])
const embedItems     = ref([{ raw: '', label: '' }])

// ===== หมวดหมู่ dynamic =====
const categories      = ref([])
const showCatModal    = ref(false)
const catSaving       = ref(false)
const catNewName      = ref('')
const catEditing      = ref(null)   // { id, name, original }
const catDeleteTarget = ref(null)   // { id, name, count }
const catMoveTarget   = ref('')

const defaultForm = () => ({
  title: '', excerpt: '', content: '', content_type: 'text',
  cover_image_url: '', category: 'ทั่วไป',
  links: [], extra_images: [],
  is_published: true, is_pinned: false, show_cover: true,
  published_at: new Date().toISOString().slice(0, 16),
  external_url: '',
})
const form = ref(defaultForm())

// ============================================================
// Embed detector — รองรับ URL และ <iframe> embed code
// ============================================================
function detectEmbedUrl(raw) {
  if (!raw?.trim()) return null
  const input = raw.trim()

  // ถ้าวาง <iframe ...> code มาเลย → ดึง src ออกมาใช้
  const iframeSrc = input.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1]
  const url = iframeSrc ?? input

  // Google Slides
  if (/docs\.google\.com\/presentation/i.test(url)) {
    // URL จาก "แท็บฝัง" หรือ embed code → /e/XXXX/pub?...  ใช้ตรงๆ
    if (/\/e\/[A-Za-z0-9_-]+\/pub/i.test(url)) {
      return { icon: '📊', label: 'Google Slides', src: url, ratio: '56.25%' }
    }
    // URL ปกติ /d/ID/edit → แปลงเป็น /embed
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (m) return { icon: '📊', label: 'Google Slides', src: `https://docs.google.com/presentation/d/${m[1]}/embed?start=false&loop=false&delayms=3000`, ratio: '56.25%' }
  }

  // Google Drive file (PDF)
  if (/drive\.google\.com\/file/i.test(url)) {
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (m) return { icon: '📄', label: 'Google Drive', src: `https://drive.google.com/file/d/${m[1]}/preview`, ratio: '130%' }
  }

  // Canva — รองรับ canva.com และ canva.link (short URL)
  if (/canva\.(com|link)/i.test(url)) {
    if (/canva\.link/i.test(url)) {
      // short URL ฝัง iframe โดยตรงไม่ได้ → แจ้งให้ใช้ embed code
      return { icon: '🎨', label: 'Canva', src: '', ratio: '56.25%', warning: 'canva_link' }
    }
    // canva.com/design/... → เปลี่ยนเป็น embed format
    const canvaSrc = url.replace(/\/(edit|present)(\/[^?]*)?(\?.*)?$/, '/view').replace(/\/view(\?.*)?$/, '/view?embed')
    return { icon: '🎨', label: 'Canva', src: canvaSrc, ratio: '56.25%' }
  }

  // YouTube
  const ytW = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (ytW) return { icon: '▶️', label: 'YouTube', src: `https://www.youtube.com/embed/${ytW[1]}`, ratio: '56.25%' }
  const ytS = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (ytS) return { icon: '▶️', label: 'YouTube', src: `https://www.youtube.com/embed/${ytS[1]}`, ratio: '56.25%' }

  return null
}

// alias ใช้ใน template ได้สะดวก
const getEmbedInfo = (raw) => detectEmbedUrl(raw)
function addEmbedItem()      { embedItems.value.push({ raw: '', label: '' }) }
function removeEmbedItem(i)  { embedItems.value.splice(i, 1) }

// iframe preview — isolate CSS จาก admin UI
const iframePreview = computed(() => `<!DOCTYPE html>
<html lang="th"><head><meta charset="UTF-8">
<style>
  body { font-family: 'Sarabun', sans-serif; font-size: 15px; line-height: 1.8; padding: 16px; color: #374151; }
  h1,h2,h3 { color: #111827; margin: 1em 0 0.5em; }
  p { margin: 0 0 1em; }
  ul,ol { padding-left: 1.5em; margin: 0 0 1em; }
  a { color: #2563eb; }
  img { max-width: 100%; border-radius: 8px; }
  table { border-collapse: collapse; width: 100%; }
  th,td { border: 1px solid #e5e7eb; padding: 8px 12px; }
</style></head>
<body>${form.value.content}</body></html>`)

// ฟังก์ชัน strip HTML/CSS/Script สำหรับ excerpt
function htmlToPlainText(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const filteredNews = computed(() => newsList.value.filter(n => {
  const q = searchQuery.value.toLowerCase()
  const matchSearch = !q || n.title.toLowerCase().includes(q)
  const matchCat = filterCategory.value === 'all' || n.category === filterCategory.value
  const matchStatus = filterStatus.value === 'all'
    || (filterStatus.value === 'published' ? n.is_published : !n.is_published)
  return matchSearch && matchCat && matchStatus
}))

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
}

async function fetchNews() {
  loading.value = true
  const { data } = await supabase.from('news')
    .select('id,title,cover_image_url,category,created_at,published_at,is_published,is_pinned,views')
    .order('created_at', { ascending: false })
  newsList.value = data || []
  loading.value = false
}

function openAdd() {
  editId.value = null
  formKey.value = Date.now()
  form.value = defaultForm()
  errorMsg.value = ''
  deletedImages.value = []
  embedItems.value = [{ raw: '', label: '' }]
  showForm.value = true
}

async function openEdit(item) {
  editId.value = item.id
  formKey.value = item.id
  errorMsg.value = ''
  showForm.value = true
  form.value = defaultForm()
  const { data } = await supabase.from('news').select('*').eq('id', item.id).maybeSingle()
  if (data) {
    form.value = {
      ...data,
      links: Array.isArray(data.links) ? data.links : [],
      extra_images: Array.isArray(data.extra_images) ? data.extra_images : [],
      published_at: data.published_at
        ? new Date(data.published_at).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
    }
    // parse embedItems จาก content
    if (data.content_type === 'embed' && data.content) {
      try {
        const parsed = JSON.parse(data.content)
        embedItems.value = Array.isArray(parsed) ? parsed : [{ raw: data.content, label: '' }]
      } catch {
        embedItems.value = [{ raw: data.content, label: '' }]
      }
    } else {
      embedItems.value = [{ raw: '', label: '' }]
    }
  }
}

function addLink() { form.value.links.push({ label: '', url: '' }) }
function addExtraImage() { form.value.extra_images.push({ url: '', caption: '' }) }

function removeExtraImage(i) {
  const img = form.value.extra_images[i]
  if (img?.url) deletedImages.value.push(img.url)
  form.value.extra_images.splice(i, 1)
}

function getStoragePath(url) {
  // ดึง path จาก Supabase Storage URL เช่น .../storage/v1/object/public/school/news/extra-xxx.jpg
  try {
    const match = url.match(/\/storage\/v1\/object\/public\/school\/(.+?)(\?|$)/)
    return match ? match[1] : null
  } catch { return null }
}

async function deleteStorageFiles(urls) {
  for (const url of urls) {
    const path = getStoragePath(url)
    if (path) await supabase.storage.from('school').remove([path]).catch(() => {})
  }
}

async function togglePublish(item) {
  const { error } = await supabase.from('news').update({ is_published: !item.is_published }).eq('id', item.id)
  if (!error) { item.is_published = !item.is_published; showToast(item.is_published ? '✅ เผยแพร่แล้ว' : '📝 บันทึกเป็นร่าง') }
}

async function handleSave() {
  if (!form.value.title.trim()) { errorMsg.value = 'กรุณากรอกหัวข้อข่าว'; return }
  saving.value = true
  errorMsg.value = ''

  // serialize embedItems → form.content
  if (form.value.content_type === 'embed') {
    const validItems = embedItems.value.filter(i => i.raw?.trim())
    form.value.content = validItems.length ? JSON.stringify(validItems) : ''
  }

  const rawContent = htmlToPlainText(form.value.content).slice(0, 200)
  const payload = {
    title:           form.value.title.trim(),
    excerpt:         form.value.excerpt.trim() || rawContent,
    content:         form.value.content,
    content_type:    form.value.content_type,
    cover_image_url: form.value.cover_image_url,
    category:        form.value.category,
    links:           form.value.links.filter(l => l.url?.trim()),
    extra_images:    form.value.extra_images.filter(i => i.url?.trim()),
    is_published:    form.value.is_published,
    is_pinned:       form.value.is_pinned,
    show_cover:      form.value.show_cover,
    published_at:    new Date(form.value.published_at).toISOString(),
    updated_at:      new Date().toISOString(),
    external_url:    form.value.external_url?.trim() || '',
  }

  let error
  if (editId.value) {
    ;({ error } = await supabase.from('news').update(payload).eq('id', editId.value))
  } else {
    ;({ error } = await supabase.from('news').insert(payload))
  }
  saving.value = false

  if (error) { errorMsg.value = error.message; return }

  // ลบไฟล์ที่ถูก remove ออกจาก storage
  if (deletedImages.value.length) {
    await deleteStorageFiles(deletedImages.value)
    deletedImages.value = []
  }

  showToast(editId.value ? '✅ แก้ไขข่าวสำเร็จ' : '✅ เพิ่มข่าวสำเร็จ')
  showForm.value = false
  fetchNews()
}

function confirmDelete(item) { deleteTarget.value = item }
async function handleDelete() {
  if (!deleteTarget.value) return
  saving.value = true

  // โหลดข้อมูลครบก่อนลบ เพื่อเอา URL รูปทั้งหมด
  const { data: full } = await supabase
    .from('news').select('cover_image_url, extra_images').eq('id', deleteTarget.value.id).maybeSingle()

  // รวม URL ทุกภาพที่ต้องลบ
  const urlsToDelete = []
  if (full?.cover_image_url) urlsToDelete.push(full.cover_image_url)
  if (Array.isArray(full?.extra_images)) {
    full.extra_images.forEach(img => { if (img?.url) urlsToDelete.push(img.url) })
  }

  // ลบ record ก่อน
  await supabase.from('news').delete().eq('id', deleteTarget.value.id)

  // ลบรูปจาก Storage
  if (urlsToDelete.length) await deleteStorageFiles(urlsToDelete)

  saving.value = false
  deleteTarget.value = null
  showToast(`🗑️ ลบข่าวสำเร็จ${urlsToDelete.length ? ` (ลบรูป ${urlsToDelete.length} ไฟล์)` : ''}`)
  fetchNews()
}

let toastTimer = null
function showToast(msg, ms = 3000) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, ms)
}

// ============================================================
// Category CRUD
// ============================================================
async function fetchCategories() {
  const { data } = await supabase
    .from('news_categories').select('id,name,sort_order')
    .order('sort_order').order('name')
  categories.value = data || []
}

async function openCatModal() {
  showCatModal.value = true
  catSaving.value = false
  catEditing.value = null
  catDeleteTarget.value = null
  catNewName.value = ''
  catMoveTarget.value = ''
  // ดึง categories + นับจำนวนข่าว
  const [{ data: cats }, { data: newsRows }] = await Promise.all([
    supabase.from('news_categories').select('id,name,sort_order').order('sort_order').order('name'),
    supabase.from('news').select('category'),
  ])
  const countMap = {}
  newsRows?.forEach(n => { countMap[n.category] = (countMap[n.category] || 0) + 1 })
  categories.value = (cats || []).map(c => ({ ...c, count: countMap[c.name] || 0 }))
}

async function addCategory() {
  const name = catNewName.value.trim()
  if (!name) return
  catSaving.value = true
  const { error } = await supabase.from('news_categories')
    .insert({ name, sort_order: categories.value.length + 1 })
  catSaving.value = false
  if (error) {
    showToast(error.message.includes('unique') ? '⚠️ ชื่อนี้มีอยู่แล้ว' : '❌ ' + error.message)
    return
  }
  catNewName.value = ''
  showToast('✅ เพิ่มหมวดหมู่แล้ว')
  await openCatModal()
  fetchCategories()
}

function startEditCat(cat) {
  catEditing.value = { id: cat.id, name: cat.name, original: cat.name }
  catDeleteTarget.value = null
}

async function saveEditCat() {
  const { id, name, original } = catEditing.value
  const newName = name.trim()
  if (!newName) return
  if (newName === original) { catEditing.value = null; return }
  catSaving.value = true
  const { error } = await supabase.from('news_categories').update({ name: newName }).eq('id', id)
  if (error) { showToast('❌ ' + error.message); catSaving.value = false; return }
  // อัปเดตข่าวทั้งหมดที่ใช้ชื่อเก่า
  await supabase.from('news').update({ category: newName }).eq('category', original)
  catSaving.value = false
  catEditing.value = null
  showToast(`✅ เปลี่ยนเป็น "${newName}" แล้ว (อัปเดตข่าวทั้งหมด)`)
  await openCatModal()
  fetchCategories()
}

function confirmDeleteCat(cat) {
  catDeleteTarget.value = cat
  catEditing.value = null
  catMoveTarget.value = categories.value.find(c => c.id !== cat.id)?.name || ''
}

async function handleDeleteCat(moveNews) {
  const target = catDeleteTarget.value
  catSaving.value = true
  if (moveNews && catMoveTarget.value) {
    await supabase.from('news').update({ category: catMoveTarget.value }).eq('category', target.name)
  }
  await supabase.from('news_categories').delete().eq('id', target.id)
  catSaving.value = false
  catDeleteTarget.value = null
  showToast(`🗑️ ลบ "${target.name}" แล้ว${moveNews ? ` (ย้ายข่าวไป "${catMoveTarget.value}")` : ''}`)
  catMoveTarget.value = ''
  await openCatModal()
  fetchCategories()
}

fetchNews()
fetchCategories()
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.35s cubic-bezier(.4,0,.2,1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, -16px) scale(0.95); }
.backdrop-enter-active, .backdrop-leave-active { transition: opacity 0.2s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }
</style>
