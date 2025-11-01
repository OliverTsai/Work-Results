<template>
  <div class="desktop-frame">
    <dHead />
    <main class="content">
      <slot></slot>
    </main>
    <dFoot />
  </div>
</template>

<script setup lang="ts">
import dHead from '@/components/d/dHead.vue';
import dFoot from '@/components/d/dFoot.vue';
</script>

<style lang="scss" scoped>
.desktop-frame {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  
  .content {
    flex: 1;
    padding-top: 80px; // 為頂部導航欄留出空間
    padding-bottom: 60px; // 為底部導航欄留出空間
  }
}
</style>