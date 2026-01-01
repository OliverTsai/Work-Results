<template>
  <div class="mobile-frame">
    <mHead v-if="showHeader" />
    <div class="aspect-container">
      <main class="content" :class="{ 
        'no-footer': !showFooter,
        'no-header': !showHeader 
      }">
        <slot></slot>
      </main>
    </div>
    <mFoot v-if="showFooter" />
  </div>
</template>

<script setup lang="ts">
import mHead from '@/components/m/mHead.vue';
import mFoot from '@/components/m/mFoot.vue';

// 新增 props 來控制是否顯示頂部和底部導航欄
defineProps({
  showFooter: {
    type: Boolean,
    default: true
  },
  showHeader: {
    type: Boolean,
    default: true
  }
});
</script>

<style lang="scss" scoped>
.mobile-frame {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  
  .aspect-container {
    width: 100%; // 使用 100% 的寬度
    aspect-ratio: 9 / 16; // 直接固定為手機常見的 9:16 比例 (直向)
    max-width: 100%;
    margin: 0 auto; // 水平置中
    position: relative;
    overflow: hidden; // 避免內容溢出
  }
  
  .content {
    position: relative;
    width: 100%;
    height: 100%;
    flex: 1;
    padding-top: 60px; // 為頂部導航欄留出空間
    padding-bottom: 50px; // 為底部導航欄留出空間
    
    &.no-footer {
      padding-bottom: 0; // 當不顯示底部導航欄時，移除底部padding
    }
    
    &.no-header {
      padding-top: 0; // 當不顯示頂部導航欄時，移除頂部padding
    }
  }
}
</style>