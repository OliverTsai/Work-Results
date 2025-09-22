<template>
    <div class="route-label-container" :class="{ 'dropdown-style': isDropdownStyle }">
        <!-- 原始水平滾動樣式 -->
        <div v-if="!isDropdownStyle" class="table-links-wrapper">
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

        <!-- 新增的下拉選單樣式 -->
        <div v-else class="dropdown-container">
            <div class="dropdown-trigger" @click="toggleDropdown">
                <span>選擇桌子</span>
                <img src="@/assets/picture/btn-expand.png" alt="展開" class="dropdown-icon" :class="{ 'rotated': isDropdownOpen }">
            </div>
            <div v-if="isDropdownOpen" class="dropdown-menu">
                <router-link 
                    v-for="(id, index) in idList" 
                    :key="index" 
                    :to="{ name: 'game', query: { id: id } }"
                    class="dropdown-item"
                    @click="closeDropdown"
                >
                    第{{ index + 1 }}桌
                </router-link>
            </div>
        </div>
    </div>
</template>
  
<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useWebSocketStore } from "@/store/websocketStore";
import { backendApi } from '@/composables/useApi';

const name = ref(localStorage.getItem("name") || "");
const token = ref(localStorage.getItem("token") || "");

const wsStore = useWebSocketStore();
const messages = computed(() => wsStore.messages);
const idList = ref<string[]>([]);

// 新增：控制是否使用下拉選單樣式
const isDropdownStyle = ref(true); // 設為 true 以預設使用下拉選單樣式
const isDropdownOpen = ref(false);

// 切換下拉選單的開關狀態
function toggleDropdown() {
    isDropdownOpen.value = !isDropdownOpen.value;
}

// 關閉下拉選單
function closeDropdown() {
    isDropdownOpen.value = false;
}

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

// 新增：點擊外部時關閉下拉選單
function handleClickOutside(event: MouseEvent) {
    const dropdownContainer = document.querySelector('.dropdown-container');
    if (isDropdownOpen.value && dropdownContainer && !dropdownContainer.contains(event.target as Node)) {
        isDropdownOpen.value = false;
    }
}

// 組件掛載時初始化
onMounted(() => {
    getTable();
    // 添加點擊外部關閉下拉選單的事件監聽
    document.addEventListener('click', handleClickOutside);
});

// 組件卸載時移除事件監聽
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
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

/* 原始水平滾動樣式 */
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

/* 新增的下拉選單樣式 */
.dropdown-style {
    display: flex;
    justify-content: center;
    padding: 0 20px;
}

.dropdown-container {
    position: relative;
    width: 180px;
}

.dropdown-trigger {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background-color: #4a6fa5;
    color: white;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.dropdown-trigger:hover {
    background-color: #3a5a8c;
}

.dropdown-icon {
    width: 16px;
    height: 16px;
    transition: transform 0.3s ease;
}

.dropdown-icon.rotated {
    transform: rotate(180deg);
}

.dropdown-menu {
    position: absolute;
    bottom: 100%;
    left: 0;
    width: 100%;
    margin-bottom: 8px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    z-index: 1001;
    max-height: 300px;
    overflow-y: auto;
}

.dropdown-item {
    display: block;
    padding: 12px 15px;
    color: #333;
    text-decoration: none;
    transition: background-color 0.2s ease;
}

.dropdown-item:hover {
    background-color: #f5f5f5;
}
</style>