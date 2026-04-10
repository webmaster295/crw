<template>
  <div class="flex items-center gap-4 w-full">

    <!-- ════ Left line ════ -->
    <svg class="flex-1 min-w-0" :viewBox="`0 0 500 ${svgH}`"
         preserveAspectRatio="none" :style="`height:${svgH}px`"
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient :id="`gl-${uid}`" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="white" stop-opacity="0"/>
          <stop offset="20%"  stop-color="white" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="white" stop-opacity="1"/>
        </linearGradient>
        <mask :id="`ml-${uid}`">
          <rect width="500" :height="svgH" :fill="`url(#gl-${uid})`"/>
        </mask>
      </defs>
      <g :mask="`url(#ml-${uid})`">

        <!-- ▸ V1: Circuit — nodes, diamonds, branch ticks -->
        <template v-if="variant==='circuit'">
          <line x1="0" :y1="cy" x2="500" :y2="cy" :stroke="leafColor" stroke-width="5" opacity="0.22"/>
          <line x1="0" :y1="cy" x2="500" :y2="cy" :stroke="stemColor" stroke-width="2"/>
          <template v-for="x in [50,150,250,350,450]" :key="'cn'+x">
            <circle :cx="x" :cy="cy" r="5.5" :fill="leafColor" :stroke="stemColor" stroke-width="1.5"/>
            <circle :cx="x" :cy="cy" r="2.5" :fill="stemColor"/>
          </template>
          <rect v-for="x in [100,200,300,400]" :key="'dm'+x"
                :x="x-4" :y="cy-4" width="8" height="8" rx="0.5"
                :fill="stemColor" opacity="0.82" :transform="`rotate(45 ${x} ${cy})`"/>
          <template v-for="x in [75,175,275,375,475]" :key="'ut'+x">
            <line :x1="x" :y1="cy" :x2="x" y2="3" :stroke="stemColor" stroke-width="1.5" stroke-linecap="round"/>
            <rect :x="x-3" y="0" width="6" height="3.5" rx="0.5" :fill="leafColor" :stroke="stemColor" stroke-width="1"/>
          </template>
          <template v-for="x in [125,225,325,425]" :key="'dt'+x">
            <line :x1="x" :y1="cy" :x2="x" :y2="svgH-3" :stroke="stemColor" stroke-width="1.5" stroke-linecap="round"/>
            <rect :x="x-3" :y="svgH-3.5" width="6" height="3.5" rx="0.5" :fill="leafColor" :stroke="stemColor" stroke-width="1"/>
          </template>
        </template>

        <!-- ▸ V2: Wave — smooth sine with triangle markers -->
        <template v-else-if="variant==='wave'">
          <path :d="wavePath" fill="none" :stroke="leafColor" stroke-width="7" opacity="0.18"/>
          <path :d="wavePath" fill="none" :stroke="stemColor" stroke-width="2.5" stroke-linecap="round"/>
          <polygon v-for="x in [40,200,360]" :key="'pk'+x"
                   :points="`${x-7},${cy-1} ${x+7},${cy-1} ${x},${cy-11}`"
                   :fill="stemColor" opacity="0.75"/>
          <polygon v-for="x in [120,280,440]" :key="'tr'+x"
                   :points="`${x-7},${cy+1} ${x+7},${cy+1} ${x},${cy+11}`"
                   :fill="stemColor" opacity="0.75"/>
        </template>

        <!-- ▸ V3: Diamond chain — linked diamonds + small connectors -->
        <template v-else-if="variant==='diamond'">
          <line x1="0" :y1="cy" x2="500" :y2="cy" :stroke="stemColor" stroke-width="1.5" opacity="0.7"/>
          <rect v-for="x in [50,150,250,350,450]" :key="'fd'+x"
                :x="x-7" :y="cy-7" width="14" height="14" rx="1"
                :fill="stemColor" opacity="0.85" :transform="`rotate(45 ${x} ${cy})`"/>
          <rect v-for="x in [100,200,300,400]" :key="'hd'+x"
                :x="x-5" :y="cy-5" width="10" height="10" rx="0.5"
                fill="transparent" :stroke="stemColor" stroke-width="1.5"
                :transform="`rotate(45 ${x} ${cy})`"/>
          <rect v-for="x in [25,75,125,175,225,275,325,375,425,475]" :key="'sm'+x"
                :x="x-2.5" :y="cy-2.5" width="5" height="5" rx="0.5"
                :fill="leafColor" :transform="`rotate(45 ${x} ${cy})`"/>
        </template>

        <!-- ▸ V4: Minimal — double dashed lines with clean dots -->
        <template v-else-if="variant==='minimal'">
          <line x1="0" :y1="cy-3" x2="500" :y2="cy-3" :stroke="stemColor" stroke-width="1"
                opacity="0.35" stroke-dasharray="5 9"/>
          <line x1="0" :y1="cy+3" x2="500" :y2="cy+3" :stroke="stemColor" stroke-width="1"
                opacity="0.35" stroke-dasharray="5 9" stroke-dashoffset="7"/>
          <line x1="0" :y1="cy" x2="500" :y2="cy" :stroke="stemColor" stroke-width="1.5"
                stroke-dasharray="3 7" opacity="0.5"/>
          <circle v-for="x in [50,100,150,200,250,300,350,400,450]" :key="'do'+x"
                  :cx="x" :cy="cy" r="4.5" :fill="stemColor" opacity="0.9"/>
          <circle v-for="x in [50,100,150,200,250,300,350,400,450]" :key="'di'+x"
                  :cx="x" :cy="cy" r="2" fill="white" opacity="0.8"/>
        </template>

        <!-- ▸ V5: Chevron — arrow flow pointing toward center -->
        <template v-else-if="variant==='chevron'">
          <line x1="0" :y1="cy" x2="500" :y2="cy" :stroke="stemColor" stroke-width="1" opacity="0.25"/>
          <path v-for="i in 22" :key="'cv'+i"
                :d="`M${i*23-12},${cy-9} L${i*23},${cy} L${i*23-12},${cy+9}`"
                fill="none" :stroke="stemColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/>
        </template>

      </g>
    </svg>

    <!-- ════ Center frame ════ -->

    <!-- F1: Corner brackets (circuit) -->
    <div v-if="variant==='circuit'" class="shrink-0 relative">
      <div class="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-2 border-l-2" :style="{borderColor:stemColor}"/>
      <div class="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-2 border-r-2" :style="{borderColor:stemColor}"/>
      <div class="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-2 border-l-2" :style="{borderColor:stemColor}"/>
      <div class="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-2 border-r-2" :style="{borderColor:stemColor}"/>
      <div class="flex items-center gap-2.5 px-6 py-2.5"
           :style="{
             border:`1px solid ${stemColor}55`,
             background:`linear-gradient(135deg,${leafColor}28 0%,${leafColor}08 100%)`,
             boxShadow:`0 2px 14px ${stemColor}22`
           }">
        <slot/>
      </div>
    </div>

    <!-- F2: Pill capsule (wave) -->
    <div v-else-if="variant==='wave'" class="shrink-0">
      <div class="flex items-center gap-2.5 px-8 py-3 rounded-full"
           :style="{
             border:`2px solid ${stemColor}60`,
             background:`linear-gradient(135deg,${leafColor}38 0%,${leafColor}18 100%)`,
             boxShadow:`0 4px 20px ${stemColor}30,inset 0 1px 0 ${leafColor}60`
           }">
        <slot/>
      </div>
    </div>

    <!-- F3: Hexagon badge (diamond) -->
    <div v-else-if="variant==='diamond'" class="shrink-0 relative p-[2px]"
         :style="{
           background:stemColor,
           clipPath:'polygon(14px 0%,calc(100% - 14px) 0%,100% 50%,calc(100% - 14px) 100%,14px 100%,0% 50%)'
         }">
      <div class="flex items-center gap-2.5 px-8 py-2.5"
           :style="{
             background:`linear-gradient(135deg,${leafColor}30,white 80%)`,
             clipPath:'polygon(14px 0%,calc(100% - 14px) 0%,100% 50%,calc(100% - 14px) 100%,14px 100%,0% 50%)'
           }">
        <slot/>
      </div>
    </div>

    <!-- F4: Top-bottom bar only (minimal) -->
    <div v-else-if="variant==='minimal'" class="shrink-0 relative px-7 py-2.5"
         :style="{
           borderTop:`2.5px solid ${stemColor}`,
           borderBottom:`2.5px solid ${stemColor}`
         }">
      <div class="absolute -top-[3px] -left-2 w-4 h-1.5 rounded-sm" :style="{background:stemColor}"/>
      <div class="absolute -top-[3px] -right-2 w-4 h-1.5 rounded-sm" :style="{background:stemColor}"/>
      <div class="absolute -bottom-[3px] -left-2 w-4 h-1.5 rounded-sm" :style="{background:stemColor}"/>
      <div class="absolute -bottom-[3px] -right-2 w-4 h-1.5 rounded-sm" :style="{background:stemColor}"/>
      <div class="flex items-center gap-2.5">
        <slot/>
      </div>
    </div>

    <!-- F5: Ribbon banner (chevron) -->
    <div v-else-if="variant==='chevron'" class="shrink-0 relative flex items-stretch">
      <div class="w-4 self-stretch"
           :style="{
             background:`linear-gradient(to right,transparent,${stemColor}28)`,
             clipPath:'polygon(100% 0,100% 100%,0 50%)'
           }"/>
      <div class="flex items-center gap-2.5 px-5 py-2.5"
           :style="{
             borderTop:`2px solid ${stemColor}75`,
             borderBottom:`2px solid ${stemColor}75`,
             background:`linear-gradient(90deg,${leafColor}18,${leafColor}30,${leafColor}18)`
           }">
        <slot/>
      </div>
      <div class="w-4 self-stretch"
           :style="{
             background:`linear-gradient(to left,transparent,${stemColor}28)`,
             clipPath:'polygon(0 0,0 100%,100% 50%)'
           }"/>
    </div>

    <!-- ════ Right line (CSS-mirrored) ════ -->
    <svg class="flex-1 min-w-0" :viewBox="`0 0 500 ${svgH}`"
         preserveAspectRatio="none" :style="`height:${svgH}px;transform:scaleX(-1)`"
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient :id="`gr-${uid}`" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="white" stop-opacity="0"/>
          <stop offset="20%"  stop-color="white" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="white" stop-opacity="1"/>
        </linearGradient>
        <mask :id="`mr-${uid}`">
          <rect width="500" :height="svgH" :fill="`url(#gr-${uid})`"/>
        </mask>
      </defs>
      <g :mask="`url(#mr-${uid})`">

        <template v-if="variant==='circuit'">
          <line x1="0" :y1="cy" x2="500" :y2="cy" :stroke="leafColor" stroke-width="5" opacity="0.22"/>
          <line x1="0" :y1="cy" x2="500" :y2="cy" :stroke="stemColor" stroke-width="2"/>
          <template v-for="x in [50,150,250,350,450]" :key="'cn'+x">
            <circle :cx="x" :cy="cy" r="5.5" :fill="leafColor" :stroke="stemColor" stroke-width="1.5"/>
            <circle :cx="x" :cy="cy" r="2.5" :fill="stemColor"/>
          </template>
          <rect v-for="x in [100,200,300,400]" :key="'dm'+x"
                :x="x-4" :y="cy-4" width="8" height="8" rx="0.5"
                :fill="stemColor" opacity="0.82" :transform="`rotate(45 ${x} ${cy})`"/>
          <template v-for="x in [75,175,275,375,475]" :key="'ut'+x">
            <line :x1="x" :y1="cy" :x2="x" y2="3" :stroke="stemColor" stroke-width="1.5" stroke-linecap="round"/>
            <rect :x="x-3" y="0" width="6" height="3.5" rx="0.5" :fill="leafColor" :stroke="stemColor" stroke-width="1"/>
          </template>
          <template v-for="x in [125,225,325,425]" :key="'dt'+x">
            <line :x1="x" :y1="cy" :x2="x" :y2="svgH-3" :stroke="stemColor" stroke-width="1.5" stroke-linecap="round"/>
            <rect :x="x-3" :y="svgH-3.5" width="6" height="3.5" rx="0.5" :fill="leafColor" :stroke="stemColor" stroke-width="1"/>
          </template>
        </template>

        <template v-else-if="variant==='wave'">
          <path :d="wavePath" fill="none" :stroke="leafColor" stroke-width="7" opacity="0.18"/>
          <path :d="wavePath" fill="none" :stroke="stemColor" stroke-width="2.5" stroke-linecap="round"/>
          <polygon v-for="x in [40,200,360]" :key="'pk'+x"
                   :points="`${x-7},${cy-1} ${x+7},${cy-1} ${x},${cy-11}`"
                   :fill="stemColor" opacity="0.75"/>
          <polygon v-for="x in [120,280,440]" :key="'tr'+x"
                   :points="`${x-7},${cy+1} ${x+7},${cy+1} ${x},${cy+11}`"
                   :fill="stemColor" opacity="0.75"/>
        </template>

        <template v-else-if="variant==='diamond'">
          <line x1="0" :y1="cy" x2="500" :y2="cy" :stroke="stemColor" stroke-width="1.5" opacity="0.7"/>
          <rect v-for="x in [50,150,250,350,450]" :key="'fd'+x"
                :x="x-7" :y="cy-7" width="14" height="14" rx="1"
                :fill="stemColor" opacity="0.85" :transform="`rotate(45 ${x} ${cy})`"/>
          <rect v-for="x in [100,200,300,400]" :key="'hd'+x"
                :x="x-5" :y="cy-5" width="10" height="10" rx="0.5"
                fill="transparent" :stroke="stemColor" stroke-width="1.5"
                :transform="`rotate(45 ${x} ${cy})`"/>
          <rect v-for="x in [25,75,125,175,225,275,325,375,425,475]" :key="'sm'+x"
                :x="x-2.5" :y="cy-2.5" width="5" height="5" rx="0.5"
                :fill="leafColor" :transform="`rotate(45 ${x} ${cy})`"/>
        </template>

        <template v-else-if="variant==='minimal'">
          <line x1="0" :y1="cy-3" x2="500" :y2="cy-3" :stroke="stemColor" stroke-width="1"
                opacity="0.35" stroke-dasharray="5 9"/>
          <line x1="0" :y1="cy+3" x2="500" :y2="cy+3" :stroke="stemColor" stroke-width="1"
                opacity="0.35" stroke-dasharray="5 9" stroke-dashoffset="7"/>
          <line x1="0" :y1="cy" x2="500" :y2="cy" :stroke="stemColor" stroke-width="1.5"
                stroke-dasharray="3 7" opacity="0.5"/>
          <circle v-for="x in [50,100,150,200,250,300,350,400,450]" :key="'do'+x"
                  :cx="x" :cy="cy" r="4.5" :fill="stemColor" opacity="0.9"/>
          <circle v-for="x in [50,100,150,200,250,300,350,400,450]" :key="'di'+x"
                  :cx="x" :cy="cy" r="2" fill="white" opacity="0.8"/>
        </template>

        <template v-else-if="variant==='chevron'">
          <line x1="0" :y1="cy" x2="500" :y2="cy" :stroke="stemColor" stroke-width="1" opacity="0.25"/>
          <path v-for="i in 22" :key="'cv'+i"
                :d="`M${i*23-12},${cy-9} L${i*23},${cy} L${i*23-12},${cy+9}`"
                fill="none" :stroke="stemColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/>
        </template>

      </g>
    </svg>

  </div>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue'

const props = defineProps({
  /**
   * Line & frame style:
   *   'circuit'  — circuit board nodes + corner bracket frame
   *   'wave'     — sine wave + pill capsule frame
   *   'diamond'  — diamond chain + hexagon badge frame
   *   'minimal'  — double-dash dots + top/bottom bar frame
   *   'chevron'  — arrow flow + ribbon banner frame
   */
  variant:   { type: String, default: 'circuit' },
  stemColor: { type: String, default: '#3b82f6' },
  leafColor: { type: String, default: '#93c5fd' }
})

const uid   = getCurrentInstance()?.uid ?? Math.random().toString(36).slice(2, 8)
const svgH  = computed(() => props.variant === 'wave' ? 28 : 24)
const cy    = computed(() => svgH.value / 2)

// Smooth sine wave path (V2) — amplitude ±12, period 160px
const wavePath = computed(() => {
  const c = cy.value, a = 12
  return `M0,${c} C26,${c-a} 54,${c-a} 80,${c} C106,${c+a} 134,${c+a} 160,${c} ` +
         `C186,${c-a} 214,${c-a} 240,${c} C266,${c+a} 294,${c+a} 320,${c} ` +
         `C346,${c-a} 374,${c-a} 400,${c} C426,${c+a} 454,${c+a} 480,${c} L500,${c}`
})
</script>
