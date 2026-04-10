<template>
  <AdminLayout>
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-bold text-gray-900">จัดการนักเรียน</h2>
        <button class="btn-primary flex items-center gap-2">📥 นำเข้าจาก DMC</button>
      </div>
      <div class="text-center py-20 text-gray-400 bg-white rounded-2xl">
        <div class="text-5xl mb-3">🎓</div>
        <p>ระบบนำเข้าข้อมูลนักเรียนจาก DMC กำลังพัฒนา</p>
      </div>
    </div>
  </AdminLayout>
</template>
<script setup>
import AdminLayout from '../../layouts/AdminLayout.vue'
</script>
