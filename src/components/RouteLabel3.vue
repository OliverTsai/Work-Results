<template>
    <div class="route-label-container">
        <!-- 右上角按鈕 -->
        <div class="dropdown-container" ref="dropdownRef">
            <div class="dropdown-trigger" @click.stop="toggleDropdown">
                <img src="@/assets/picture/btn-expand.png" alt="展開" class="dropdown-icon" :class="{ 'rotated': isDropdownOpen }">
            </div>
        </div>

        <!-- 中央彈出選單 -->
        <transition name="fade">
            <div v-show="isDropdownOpen" class="center-modal-overlay" @click.self="closeDropdown">
                <div class="center-modal">
                    <div class="modal-header">
                        <div class="modal-title">入座桌子列表</div>
                        <div class="modal-close" @click="closeDropdown">×</div>
                    </div>
                    <div class="modal-body">
                        <div v-if="idList.length > 0" class="table-list">
                            <router-link 
                                v-for="(id, index) in idList" 
                                :key="index" 
                                :to="{ name: 'game' }"
                                class="table-item"
                                @click="closeMove(id.id)"
                            >
                                <div class="table-number">{{ index + 1 }}</div>
                                <div class="table-id"> {{ id.name }}</div>
                            </router-link>
                        </div>
                        <div v-else class="no-tables">
                            <img src="@/assets/picture/btn-expand.png" alt="無桌子" class="empty-icon">
                            <p>暫無可用桌子</p>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        
        <!-- 顯示調試信息 -->
        <div v-if="showDebug" class="debug-info">
            <p>下拉狀態: {{ isDropdownOpen ? '開啟' : '關閉' }}</p>
            <p>桌子數量: {{ idList.length }}</p>
            <button @click="forceRefresh">強制刷新</button>
        </div>
    </div>
</template>
  
<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useWebSocketStore } from "@/store/websocketStore";
import { backendApi } from '@/composables/useApi';
import { useTableStore } from "@/store/tableStore";

interface dataList {
    id: string,
    name: string,
}

const name = ref(localStorage.getItem("name") || "");
const token = ref(localStorage.getItem("token") || "");

const wsStore = useWebSocketStore();
const messages = computed(() => wsStore.messages);
const idList = ref<dataList[]>([]);
const dropdownRef = ref<HTMLElement | null>(null);

//全域tableId
const tableStore = useTableStore();

// 控制下拉選單的開關狀態
const isDropdownOpen = ref(false);
// 調試模式開關 (設為 false 可關閉調試信息)
const showDebug = ref(false);

// 切換下拉選單的開關狀態
function toggleDropdown() {
    console.log("觸發下拉選單切換");
    isDropdownOpen.value = !isDropdownOpen.value;
    
    // 如果選單打開，立即檢查是否有數據，如果沒有則重新獲取
    if (isDropdownOpen.value && idList.value.length === 0) {
        getTable();
    }
}

// 關閉下拉選單
function closeDropdown() {
    isDropdownOpen.value = false;
}

//關閉並傳送

function closeMove(id:string){
    isDropdownOpen.value = false;
    tableStore.setTableId(id)
}

// 強制刷新桌子列表
function forceRefresh() {
    idList.value = [];
    getTable();
}

// 初始化獲取桌子列表
async function getTable() {
    console.log("開始獲取桌子列表");
    const url = backendApi(`/api/v1/tables?player=${name.value}`);
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token.value}`,
            }
        });

        const data = await response.json();

        console.log("獲取桌子列表返回數據:", data);

        if (data.data.tables && Array.isArray(data.data.tables)) {
            // 清空現有列表，重新添加
            idList.value = [];

            data.data.tables.forEach((item: { id: string,name:string }) => {
                idList.value.push({id:item.id,name:item.name});
            });
            
            console.log("獲取桌子列表成功:", idList.value);
        } else {
            console.warn("獲取桌子列表返回格式不符合預期:", data);
        }
    } 
    catch (error) {
        console.error("獲取桌子列表時發生錯誤:", error);
    }
}

// watch(messages, (msg) => {
//     if (!msg) return;

//     try {
//         const data = msg;

//         if (data.event === "user_join_leave") {
//             // 檢查 idList 中是否已存在 data.table_id，如果不存在則添加
//             if (!idList.value.includes(data.table_id)) {
//                 idList.value.push(data.table_id);
//                 console.log("新增桌子ID:", data.table_id);
//             }
//         }
//     } catch (e) {
//         console.error("解析 WebSocket 訊息時發生錯誤:", e);
//     }
// });

// 點擊外部時關閉下拉選單 (使用 ref 而非 querySelector)
function handleClickOutside(event: MouseEvent) {
    // 這裡不再需要這個函數，因為我們使用了遮罩層的點擊事件來關閉選單
    // 但保留這個函數以防需要額外的處理
}

// 組件掛載時初始化
onMounted(() => {
    getTable();
    console.log("RouteLabel3 組件已掛載");
});

// 組件卸載時移除事件監聽
onUnmounted(() => {
    // 不再需要移除事件監聽器
});
</script>

<style lang="scss">
.route-label-container {
    position: fixed;
    top: 7rem;
    right: 0;
    z-index: 9999;
    padding: 15px;
    pointer-events: auto;
    display: block;
}

/* 下拉按鈕樣式 */
.dropdown-container {
    position: relative;
}

.dropdown-trigger {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 50px;
    background-color: rgba(245, 245, 245, 0.9);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    border: 2px solid white;
    
    img{
        width: 100%;
        height: 100%;
    }
}

.dropdown-trigger:hover {
    background-color: rgba(230, 230, 230, 0.9);
    transform: scale(1.05);
}

.dropdown-icon {
    width: 24px;
    height: 24px;
    transition: transform 0.3s ease;
}

.dropdown-icon.rotated {
    transform: rotate(180deg);
}

/* 中央彈出選單樣式 */
.center-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
}

.center-modal {
    width: 80%;
    max-width: 400px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    animation: modal-in 0.3s ease;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background-color: #4a6fa5;
    color: white;
    border-bottom: 1px solid #eaeaea;
}

.modal-title {
    font-size: 18px;
    font-weight: bold;
}

.modal-close {
    font-size: 24px;
    cursor: pointer;
    line-height: 1;
}

.modal-body {
    padding: 20px;
    max-height: 60vh;
    overflow-y: auto;
}

.table-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.table-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 8px;
    text-decoration: none;
    color: #333;
    transition: all 0.2s ease;
    border: 1px solid #eaeaea;
}

.table-item:hover {
    background-color: #eef5ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-color: #4a6fa5;
}

.table-number {
    font-size: 16px;
    font-weight: bold;
    color: #4a6fa5;
}

.table-id {
    font-size: 12px;
    color: #888;
}

.no-tables {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 0;
    color: #999;
    text-align: center;
}

.empty-icon {
    width: 40px;
    height: 40px;
    opacity: 0.5;
    margin-bottom: 15px;
}

/* 動畫效果 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@keyframes modal-in {
    from {
        transform: translateY(20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* 調試信息樣式 */
.debug-info {
    position: absolute;
    top: 60px;
    right: 0;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px;
    border-radius: 5px;
    font-size: 12px;
    z-index: 10001;
}

.debug-info p {
    margin: 5px 0;
}

.debug-info button {
    background-color: #4a6fa5;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
}
</style>