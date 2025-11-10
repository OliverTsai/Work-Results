<template>
  <MobileFrame v-if="isMobile" :showFooter="showFooter" :showHeader="showHeader">
    <slot></slot>
  </MobileFrame>
  <DesktopFrame v-else>
    <slot></slot>
  </DesktopFrame>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import MobileFrame from './MobileFrame.vue';
import DesktopFrame from './DesktopFrame.vue';

const isMobile = ref(false);

// 新增 props 來控制是否顯示頂部和底部導航欄
const props = defineProps({
  showFooter: {
    type: Boolean,
    default: true
  },
  showHeader: {
    type: Boolean,
    default: true
  }
});

// 檢測設備類型
const checkDevice = () => {
  isMobile.value = window.innerWidth < 768; // 768px 以下視為手機
};

onMounted(() => {
  checkDevice();
  window.addEventListener('resize', checkDevice);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkDevice);
});
</script>