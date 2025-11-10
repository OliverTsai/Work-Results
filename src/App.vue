<script setup lang="ts">
import { useWebSocketStore } from "@/store/websocketStore";
import { onMounted, onUnmounted, provide, computed } from 'vue';
import { useRoute } from 'vue-router'
import MainFrame from './layouts/MainFrame.vue';

const wsStore = useWebSocketStore();
const route = useRoute();

provide("messages", wsStore.messages);
provide("isConnected", wsStore.isConnected);

// 使用 computed 屬性來監聽路由變化
const showFooter = computed(() => route.meta.showFooter !== false);
const showHeader = computed(() => route.meta.showHeader !== false);
console.log("Footer visibility:", showFooter.value);
console.log("Header visibility:", showHeader.value);

onMounted(() => {
    // wsStore.connect(); // 啟動 WebSocket 連線
});

onUnmounted(() => {
    // wsStore.disconnect();
});
</script>

<template>
    <MainFrame :showFooter="showFooter" :showHeader="showHeader">
        <router-view />
    </MainFrame>
</template>

<style>
#app {
    min-height: 100vh;
    background-color: #f5f5f5; /* 更改為較淺的背景色 */
    z-index: -3;
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
}

/* 全局基本樣式 */
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 0;
}

/* 移除所有連結的預設樣式 */
a {
    text-decoration: none;
}
</style>