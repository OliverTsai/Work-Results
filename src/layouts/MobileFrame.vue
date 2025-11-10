<template>
  <div class="mobile-frame">
    <mHead v-if="showHeader" />
    <main class="content" :class="{ 
      'no-footer': !showFooter,
      'no-header': !showHeader 
    }">
      <slot></slot>
    </main>
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
  min-height: 100vh;
  
  .content {
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