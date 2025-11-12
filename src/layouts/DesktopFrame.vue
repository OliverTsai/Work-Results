<template>
  <div class="desktop-frame">
    <dHead v-if="showDeskHeader" />
    <main class="content">
      <slot></slot>
    </main>
    <dFoot v-if="showDeskFooter" />
  </div>
</template>

<script setup lang="ts">
import dHead from '@/components/d/dHead.vue';
import dFoot from '@/components/d/dFoot.vue';

// 新增 props 來控制是否顯示頂部和底部導航欄
defineProps({
  showDeskFooter: {
    type: Boolean,
    default: true
  },
  showDeskHeader: {
    type: Boolean,
    default: true
  }
});
</script>

<style lang="scss" scoped>
.desktop-frame {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 20px;
  min-height: 100vh;
  padding-top: 10rem;
  
  .content {
    flex: 1;
    padding-top: 15rem; // 為頂部導航欄留出空間
    padding-bottom: 25rem; // 為底部導航欄留出空間

    overflow-y: auto;
    position: relative;
    z-index: 1; /* 確保內容在適當的層級 */
  }
}
</style>