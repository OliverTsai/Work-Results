<template>
  <div class="mobile-frame">
    <mHead />
    <main class="content">
      <slot></slot>
    </main>
    <mFoot />
  </div>
</template>

<script setup lang="ts">
import mHead from '@/components/m/mHead.vue';
import mFoot from '@/components/m/mFoot.vue';
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
  }
}
</style>