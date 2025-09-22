<template>
    <div class="route-label-container">
        <div class="table-links-wrapper">
            <div class="table-links">
                <router-link 
                    v-for="(id, index) in idList" 
                    :key="index" 
                    :to="{ name: 'game', query: { id: id } }"
                    class="table-link"
                >
                    第{{ index + 1 }}桌
                </router-link>
            </div>
        </div>
    </div>
</template>
  
<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useWebSocketStore } from "@/store/websocketStore";
import { backendApi } from '@/composables/useApi';

const name = ref(localStorage.getItem("name") || "");
const token = ref(localStorage.getItem("token") || "");

const wsStore = useWebSocketStore();
const messages = computed(() => wsStore.messages);
const idList = ref<string[]>([]);

// 初始化獲取桌子列表
async function getTable() {

    const url = backendApi(`/api/v1/tables?player=${name.value}`);
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token.value}`,
            }
        });

        const data = await response.json();

        data.tables.forEach((item: { id: string }) => {
            // 檢查 idList 中是否已存在 item.table_id，如果不存在則添加
            if (!idList.value.includes(item.id)) {
                idList.value.push(item.id);
            }
        });
        console.log("獲取桌子列表:", data);
    } 
    catch (error) {
        console.error("獲取桌子列表時發生錯誤:", error);
    }
}

watch(messages, (msg) => {
    if (!msg) return;

    try {
        const data = msg;

        if (data.event === "user_join_leave") {
        // 檢查 idList 中是否已存在 data.table_id，如果不存在則添加
        if (!idList.value.includes(data.table_id)) {
            idList.value.push(data.table_id);
        }
        }
    } catch (e) {
        console.error("解析 WebSocket 訊息時發生錯誤:", e);
    }
});

// 組件掛載時初始化
onMounted(() => {
    getTable();
});
</script>

<style scoped>
.route-label-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: rgba(245, 245, 245, 0.9);
    padding: 12px 0;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
}

.table-links-wrapper {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch; /* 為 iOS 提供平滑滾動 */
    scrollbar-width: thin; /* Firefox 的細滾動條 */
    padding: 0 20px;
}

.table-links-wrapper::-webkit-scrollbar {
    height: 4px; /* 水平滾動條的高度 */
}

.table-links-wrapper::-webkit-scrollbar-thumb {
    background-color: #c1c1c1;
    border-radius: 4px;
}

.table-links {
    display: flex;
    flex-wrap: nowrap; /* 關鍵：不換行 */
    gap: 15px;
    padding-bottom: 5px; /* 為滾動條留出空間 */
}

.table-link {
    display: inline-block;
    padding: 8px 15px;
    background-color: #4a6fa5;
    color: white;
    text-decoration: none;
    border-radius: 20px;
    font-weight: 500;
    transition: all 0.3s ease;
    flex-shrink: 0; /* 防止元素被壓縮 */
}

.table-link:hover {
    background-color: #3a5a8c;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>