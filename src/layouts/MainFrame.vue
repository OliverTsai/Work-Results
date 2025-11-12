<template>
  <MobileFrame v-if="isMobile" :showFooter="showFooter" :showHeader="showHeader">
    <slot></slot>
  </MobileFrame>
  <DesktopFrame v-else :showDeskFooter="showDeskFooter" :showDeskHeader="showDeskHeader">
    <slot></slot>
  </DesktopFrame>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import MobileFrame from './MobileFrame.vue';
import DesktopFrame from './DesktopFrame.vue';

const route = useRoute();
const isMobile = ref(false);

// 從路由 meta 獲取顯示設置，如果沒有設置則使用默認值
const showFooter = computed(() => {
  return route.meta.showFooter === false ? false : true;
});

const showHeader = computed(() => {
  return route.meta.showHeader === false ? false : true;
});

const showDeskFooter = computed(() => {
  return route.meta.showDeskFooter === false ? false : true;
});

const showDeskHeader = computed(() => {
  return route.meta.showDeskHeader === false ? false : true;
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