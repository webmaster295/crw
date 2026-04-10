<template>
  <div class="relative group">
    <!-- Simple link -->
    <RouterLink v-if="!item.children" :to="item.to"
      class="relative px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center gap-1 group"
    >
      {{ item.label }}
      <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300 rounded-full"></span>
    </RouterLink>

    <!-- Dropdown -->
    <button v-else
      class="relative px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center gap-1 group"
    >
      {{ item.label }}
      <svg class="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
      <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300 rounded-full"></span>
    </button>

    <!-- Dropdown Menu -->
    <div v-if="item.children"
      class="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top scale-95 group-hover:scale-100 z-50"
    >
      <div class="p-2">
        <template v-for="child in item.children" :key="child.href || child.to">
          <!-- External link -->
          <a v-if="child.href"
            :href="child.href" target="_blank" rel="noopener noreferrer"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors no-underline"
          >
            <span class="text-base flex-shrink-0">{{ child.icon }}</span>
            <span class="flex-1">{{ child.label }}</span>
            <svg class="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
          <!-- Internal link -->
          <RouterLink v-else :to="child.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <span class="text-base">{{ child.icon }}</span>
            {{ child.label }}
          </RouterLink>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ item: Object })
</script>
