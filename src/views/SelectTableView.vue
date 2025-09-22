<template>
    <div class="select-table-wrapper">
        <transition name="fade" mode="out-in">
            <!-- 加入 v-show="isLoaded" -->
            <div class="mBgSelect" :style="{ backgroundImage: `url(${imagesData.bgSelectImage})` }">
                <div class="mBoxSelect">
                    <div class="header-fixed">
                        <HeadView />
                    </div>
                    <div class="header-spacer"></div>
                    <RouteLabel />
                    <div class="mTitleBg">
                        <img :src="imagesData.btnChatBg" class="mTitleBgImage">
                        <div class="mTitleBox">
                            <div @click="changeTableType('regular')" class="tab-button" :class="{ active: table_type === 'regular' }">
                                <img v-if="table_type === 'regular'" class="buttonImg" :src="imagesData.CategorySelectImage" />
                                <img v-else class="buttonImg" :src="imagesData.CategoryNoSelectImage">
                                <span class="buttonText">一般桌</span>
                            </div>
                            <div @click="changeTableType('turbo')" class="tab-button" :class="{ active: table_type === 'turbo' }">
                                <img v-if="table_type === 'turbo'" class="buttonImg" :src="imagesData.CategorySelectImage" />
                                <img v-else class="buttonImg" :src="imagesData.CategoryNoSelectImage">
                                <span class="buttonText">極速桌</span>
                            </div>
                            <div @click="changeTableType('short_deck')" class="tab-button" :class="{ active: table_type === 'short_deck' }">
                                <img v-if="table_type === 'short_deck'" class="buttonImg" :src="imagesData.CategorySelectImage" />
                                <img v-else class="buttonImg" :src="imagesData.CategoryNoSelectImage">
                                <span class="buttonText">短牌桌</span>
                            </div>
                            <div @click="changeTableType('omaha')" class="tab-button" :class="{ active: table_type === 'omaha' }">
                                <img v-if="table_type === 'omaha'" class="buttonImg" :src="imagesData.CategorySelectImage" />
                                <img v-else class="buttonImg" :src="imagesData.CategoryNoSelectImage">
                                <span class="buttonText">奧瑪哈</span>
                            </div>
                            <div @click="changeTableType('tournament')" class="tab-button" :class="{ active: table_type === 'tournament' }">
                                <img v-if="table_type === 'tournament'" class="buttonImg" :src="imagesData.CategorySelectImage" />
                                <img v-else class="buttonImg" :src="imagesData.CategoryNoSelectImage">
                                <span class="buttonText">錦標賽</span>
                            </div>
                            <!-- <div @click="changeTableType('regular')" :class="{ active: table_type === 'regular' }">一般桌</div>
                            <div @click="changeTableType('turbo')" :class="{ active: table_type === 'turbo' }">極速桌</div>
                            <div @click="changeTableType('short_deck')" :class="{ active: table_type === 'short_deck' }">短牌桌</div>
                            <div @click="changeTableType('omaha')" :class="{ active: table_type === 'omaha' }">奧瑪哈</div>
                            <div @click="changeTableType('tournament')" :class="{ active: table_type === 'tournament' }">錦標賽</div> -->
                        </div>
                    </div>
                    <div class="backBtnBox">
                        <router-link to="/hall" class="backBtn">
                            <img :src="imagesData.btnBackImage">
                        </router-link>
                    </div>
                    <div class="jackpotBg p-1">
                        <img class="jackpotBgImage" :src="imagesData.jackpotBgImage">
                        <div class="jackpotBox p-3">
                            <div>{{ numberDot(jackpot) }}</div>
                        </div>
                        <div class="jackpotButton">
                            <div class="imgButtonBox"><img :src="imagesData.btnEnterfastImage"></div>
                            <div class="imgButtonBox"><img :src="imagesData.btnCreateRoomImage"></div>
                        </div>
                    </div>
                    <div v-if="tournamentButton"  class="tableBox p-3">
                        <router-link 
                            v-for="table in allTournament" 
                            :key="table.base.id" 
                            :to="{ name: 'tournament', query: { id: table.base.id } }"
                            class="routerLink"
                        >
                            <div>
                                <div class="tableItem tournament">
                                    <img :src="imagesData.frameRegularImage" alt="框">
                                    <div class="tableName">{{ table.base.name }}</div>
                                    <div class="tableBody">
                                        <div class="tableBodyBox">
                                            <div>
                                                {{ getTournamentStatusName(table.base.status) }}
                                            </div>
                                            <div>
                                                {{ formatTime(table.base.register_start_time) }}
                                            </div>
                                        </div>
                                        
                                        <div class="tableBodyImg">
                                            <div class="imgSelectBox2">
                                                <img :src="imagesData.CategoryNoSelectImage">
                                                <span class="tournament">手續費</span>
                                            </div>
                                            <div class="fs-5 fw-bold">
                                                {{ table.base.pot_fee }}
                                            </div>
                                            <div class="imgSelectBox2">
                                                <img :src="imagesData.CategoryNoSelectImage">
                                                <span class="tournament">報名人數</span>
                                            </div>
                                            <div class="fs-5 fw-bold">
                                                {{ table.stats.current_players }}
                                            </div>
                                        </div>
                                        
                                        <!-- <div class="tableBodyBox">
                                            <div>總獎金</div>
                                            <div>{{ table.stats.total_pot }}</div>
                                        </div> -->
                                    </div>
                                    <div class="tableBonusBg">
                                        <div class="fs-5 text-light fw-bold text-center">
                                            {{ table.stats.total_pot }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </router-link>
                    </div>
                    <!-- <div v-else-if="table_type === 'turbo'" class="tableBox p-3">
                        <router-link 
                            v-for="table in all_table" 
                            :key="table.id" 
                            :to="{ name: 'gameTurbo', query: { id: table.id } }"
                            class="routerLink"
                        >
                            <div :class="'tableItem '" @click="setTable(table.id)">
                                <img :src="imagesData.frameRegularImage" alt="框">
                                <div class="tableName">{{ table.name }}</div>
                                <div class="tableMoney">
                                    <div class="imgSelectBox1">
                                        <img :src="imagesData.blindImage" alt="忙注" class="">
                                        <span class="player-count">{{ table.small_blind }}/{{ table.big_blind }}</span>
                                    </div>
                                    <div class="imgSelectBox2">
                                        <img :src="imagesData.playersImage">
                                        <span class="player-count">人數</span>
                                    </div>
                                    <div v-if="table.type === 'turbo'" class="imgSelectBox2">
                                        <img :src="imagesData.playersImage" alt="人數" class="">
                                        <span class="player-count">{{ table.max_players }}/{{ table.current_players }}</span>
                                    </div>
                                    <div v-else class="imgSelectBox2">
                                        <img :src="imagesData.playersImage" alt="人數" class="">
                                        <span class="player-count">{{ table.current_players }}/{{ table.max_players }}</span>
                                    </div>
                                </div>
                            </div>
                        </router-link>
                        <div id="messages">
                            <div v-for="(msg, index) in messages" :key="index" :class="`message ${msg.type}`">
                                <span v-html="msg.text"></span>
                            </div>
                        </div>
                    </div> -->
                    <div v-else class="tableBox p-3">
                        <router-link 
                            v-for="table in all_table" 
                            :key="table.id" 
                            :to="{ name: 'game' }"
                            class="routerLink"
                        >
                            <div :class="'tableItem '" @click="setTable(table.id)">
                                <!-- <div class="tableId">{{ table.number }}</div> -->
                                <img :src="imagesData.frameRegularImage" alt="框">
                                <div class="tableName">{{ table.name }}</div>
                                <div class="tableMoney">
                                    <!-- <div class="imgSelectBox1">
                                        <img :src="imagesData.blindImage2" alt="忙注" class="">
                                        <span class="player-count">盲注 {{ table.small_blind }}/{{ table.big_blind }}</span>
                                    </div> -->
                                    <div class="imgSelectBox2">
                                        <img :src="imagesData.CategoryNoSelectImage">
                                        <span class="player-count">大盲</span>
                                    </div>
                                    <div>
                                        <span class="fs-6 fw-bold">{{ table.big_blind }}</span>
                                    </div>
                                    <div class="imgSelectBox2">
                                        <img :src="imagesData.CategoryNoSelectImage">
                                        <span class="player-count">小盲</span>
                                    </div>
                                    <div>
                                        <span class="fs-6 fw-bold">{{ table.small_blind }}</span>
                                    </div>
                                    <div class="imgSelectBox2">
                                        <img :src="imagesData.CategoryNoSelectImage">
                                        <span class="player-count">人數</span>
                                    </div>
                                    <div v-if="table.type === 'turbo'" class="">
                                        <span class="fs-6 fw-bold">{{ table.max_players }}/{{ table.current_players }}</span>
                                    </div>
                                    <div v-else class="">
                                        <span class="fs-6 fw-bold">{{ table.current_players }}/{{ table.max_players }}</span>
                                    </div>
                                </div>
                            </div>
                        </router-link>
                        <div id="messages">
                            <div v-for="(msg, index) in messages" :key="index" :class="`message ${msg.type}`">
                                <span v-html="msg.text"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <div v-if="!isLoaded" class="loading-overlay">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
    </div>
</template>

<script setup lang="ts">

import HeadView from '@/components/HeadView.vue'
// import RouteLabel from '@/components/RouteLabel.vue';  
import RouteLabel from '@/components/RouteLabel3.vue';  // 使用新的 RouteLabel2.vue 

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { backendApi } from '@/composables/useApi';
import { useWebSocketStore } from "@/store/websocketStore";
import { useTableStore } from "@/store/tableStore";
import { imagesData } from "@/assets/picture/images";

// 引入圖片
import bgSelectImage from '@/assets/picture/bg_select.png';
import selectBgImage from '@/assets/picture/select-bg.png';
import jackpotBgImage from '@/assets/picture/jackpot-bg.png';
import btnBackImage from '@/assets/picture/btn-back.png';
import btnEnterfastImage from '@/assets/picture/btn-enterfast.png';
import btnCreateRoomImage from '@/assets/picture/btn-create-room.png';
import frameRegularImage from '@/assets/picture/框-一般.png';
import frameTurboImage from '@/assets/picture/框-急速.png';
import frameShortDeckImage from '@/assets/picture/框-短牌.png';
import frameOmahaImage from '@/assets/picture/框-奧馬哈.png';
import frameTournamentImage from '@/assets/picture/框-積分賽.png';
import blindImage from '@/assets/picture/忙注.png';
import playersImage from '@/assets/picture/人數.png';


const router = useRouter();

const jackpot = ref(51680000);

const all_table = ref<{ 
    id: string; 
    number: number; 
    group: string; 
    name: string; 
    small_blind: string; 
    big_blind: string; 
    current_players: number; 
    max_players: number; 
    type: string; 
}[]>([]);  //所有牌桌

const allTournament = ref<{ 
    base: { 
        id: string; 
        name: string; 
        status: string; 
        register_start_time: number; 
        pot_fee: number 
    }; 
    stats: { 
        current_players: number; 
        total_pot: number 
    } 
}[]>([])

const table_type = ref('regular');  //牌桌類型
const tournamentButton = ref(false);  //錦標賽類型
// const isRouteChanging = ref(false); // 添加路由轉換狀態

const token = ref(localStorage.getItem("token") || "");

const tableList = ref('')
const tournamentList = ref('')

//全域tableId
const tableStore = useTableStore(); // 使用新的 store

// 持續連接
const wsStore = useWebSocketStore();

// 使用 computed 來確保 `isConnected`,`messages` 是響應式的
const isConnected = computed(() => wsStore.isConnected);
const messages = computed(() => wsStore.messages);

const isLoaded = ref(false);

// 監聽 WebSocket 是否連線
watch(isConnected, (newVal) => {
  if (newVal) {
    console.log('WebSocket 已連線，開始訂閱');
    if (token.value) {
      wsStore.resubscribeToTableShow(tableList.value);
    } else {
      console.warn('沒有可用的 token，無法訂閱');
    }
  }
}, { immediate: true });


// 監聽 WebSocket 訊息
watch(messages, (msg) => {
  if (!msg) return;  // 避免 msg 為 null

  try {
    const data = msg;
    
    if (data.event === "table_show_update") {
    //   console.log(`玩家 [${data.playerId}] ${data.action} 了桌子 [${data.tableId}]`);
    //   console.log(`桌數：${data.tableId} 有 ${data.currentPlayers} 位玩家`);

      // 找到對應的桌子，更新人數
      const tableIndex = all_table.value.findIndex(table => table.id === data.table_id);
      if (tableIndex !== -1) {
        all_table.value[tableIndex].current_players = data.current_players;
      }

    }

    if (data.event === "base_info") {
        const tournamentIndex = allTournament.value.findIndex(tournament => tournament.base.id === data.tournament_id);
        if (tournamentIndex !== -1) {
            allTournament.value[tournamentIndex].base.status = data.status;
            allTournament.value[tournamentIndex].base.register_start_time = data.register_start_time;
            allTournament.value[tournamentIndex].base.pot_fee = data.pot_fee;
        }
    }

    if(data.event === "stats") {
        const tournamentIndex = allTournament.value.findIndex(tournament => tournament.base.id === data.tournament_id);
        if (tournamentIndex !== -1) {
            allTournament.value[tournamentIndex].stats.current_players = data.stats.current_players;
            allTournament.value[tournamentIndex].stats.total_pot = data.stats.total_pot;
        }
    }
  } catch (e) {
    console.error("解析 WebSocket 訊息時發生錯誤:", e);
  }
});

function setTable(id:string){
    tableStore.setTableId(id);
    // isRouteChanging.value = true; // 開始路由轉場動畫
    
    // 可以設置一個短暫的延遲，讓動畫有時間顯示
    setTimeout(() => {
        // 路由跳轉完成後會自動隱藏動畫
        // 由於路由鉤子無法直接在這裡使用，我們在全局路由守衛中處理
    }, 100); // 短暫延遲，確保動畫能夠顯示
}


// 切換牌桌類型
function changeTableType(type: string) {
    table_type.value = type;
    getTable();
}

// 根據狀態碼回傳狀態名稱
function getTournamentStatusName(status: string): string {
  const statusMap: Record<string, string> = {
    'draft': '創立中',
    'entry': '報名中',
    'ready': '準備中',
    'run_with_entry': '延遲報名',
    'run': '比賽進行中',
    'complete': '已完成',
    'paid': '已派發',
    'cancel': '已取消'
  };
  
  return statusMap[status] || status; // 如果找不到對應的狀態名稱，則返回原始狀態碼
}

// 將時間戳轉換為日期格式
function formatTime(timestamp: number): string {
  // 如果時間戳為 0 或無效，返回特定訊息
  if (!timestamp) {
    return '未設定';
  }
  
  // 將時間戳轉換為毫秒（如果已經是毫秒則不需要乘以1000）
  const date = new Date(timestamp * 1000);
  
  // 格式化日期和時間
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
//   const hours = String(date.getHours()).padStart(2, '0');
//   const minutes = String(date.getMinutes()).padStart(2, '0');
  
  // 返回格式化後的日期和時間
  return `${year}/${month}/${day}`;
}

// 取得牌桌資料並訂閱所有桌子ID
async function getTable() {
  isLoaded.value = false;

  tournamentButton.value = false;
  // 判斷是否為錦標賽類型
  if (table_type.value === 'tournament') {
    tournamentButton.value = true;
    getTournament();
    return;
  }

  const url = backendApi(`/api/v1/tables?type=${table_type.value}`);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (response.status === 401) {
      console.error('認證失敗，跳轉到登入頁面');
      router.push('/login_line');
      return;
    }

    const data = await response.json();
    all_table.value = data.data.tables.sort((a: { number: number }, b: { number: number }) => a.number - b.number);
    console.log('牌桌資料:', all_table.value);
    let tableListArray: string[] = [];

    // 針對每張桌子訂閱 WebSocket
    all_table.value.forEach(table => {
        tableListArray.push(table.id);
    });
    
    tableList.value = tableListArray.join(',');
    wsStore.resubscribeToTableShow(tableList.value);
    // tableButton(tableList);

    await preloadImages(images);  //確保所有圖片加載完成
    isLoaded.value = true;

  } catch (error) {
    console.error("獲取牌桌資料失敗:", error);
    isLoaded.value = true;
  }
}

//獲取錦標賽列表
async function getTournament() {
    isLoaded.value = false;
    const url = backendApi(`/api/v1/tournaments`);
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token.value}`,
            }
        });

        if (response.status === 401) {
            console.error('認證失敗，跳轉到登入頁面');
            router.push('/login_line');
            return;
        }

        const data = await response.json();
        console.log('錦標賽資料:', data);

        allTournament.value = data.data.tournaments

        let tournamentListArray: string[] = [];

        // 針對每個賽事記錄ID
        allTournament.value.forEach(table => {
            tournamentListArray.push(table.base.id);
        });

        tournamentList.value = tournamentListArray.join(',');
        wsStore.resubscribeToTournamentShow(tournamentList.value);
            
        isLoaded.value = true;

    } catch (error) {
        console.error("獲取錦標賽資料失敗:", error);
        isLoaded.value = true;
    }
}

// 數字加逗號
function numberDot(num: number | string): string { 

    if(num=='-'){
        return '-';
    }

    const numValue = typeof num === 'number' ? num : parseFloat(num as string) || 0;

    // 如果數字接近0，則返回0
    if (Math.abs(numValue) < 0.001) {
        return '0';
    }
    
    // 將數字轉換為字符串並添加千位分隔符
    return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 預先載入圖片方法
function preloadImages(imageArray: any[]) {
    return Promise.all(
        imageArray.map(src => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = resolve;
                img.onerror = resolve; // 確保即使某些圖片載入失敗，也不會影響流程
            });
        })
    );
}

// 預先載入圖片
const images = [
    bgSelectImage,
    selectBgImage,
    jackpotBgImage,
    btnBackImage,
    btnEnterfastImage,
    btnCreateRoomImage,
    frameRegularImage,
    frameTurboImage,
    frameShortDeckImage,
    frameOmahaImage,
    frameTournamentImage,
    blindImage,
    playersImage,
];



// 第一次連接
onMounted(async () => {
    console.log('選桌開始');
    getTable();

    // console.log("開始預載圖片...");
    // await preloadImages(images);
    // console.log("所有圖片已載入完成");
    isLoaded.value = true;
})

onUnmounted(() => {
    wsStore.unsubscribeFromTableShow(tableList.value);
});

</script>

<style lang="scss">

.select-table-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto; /* 這裡是關鍵 */
  z-index: 1; /* 確保它在其他元素之上 */
}

/* 新增：固定 HeadView 在頂部的樣式 */
.header-fixed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000; /* 確保頭部在最上層 */
  background-color: transparent; /* 或根據需要設置背景色 */
}

/* 新增：為固定頭部創建空間 */
.header-spacer {
  height: 48px; /* 根據 HeadView 的實際高度調整 */
}

.mBgSelect{
    position: fixed; /* 改為 fixed 定位，使背景固定 */
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    // background-image: url('@/assets/picture/bg_select.png');
    height: 100vh; /* 固定高度為視窗高度 */
    width: 100%;
    background-size: cover; /* 背景自動縮放填滿 */
    background-position: center; /* 背景居中 */
    background-repeat: no-repeat; /* 背景不重複 */
    z-index: -1; /* 確保背景在內容後面 */
    overflow-y: auto;
}

.mBoxSelect{
    position: relative;
    // background-image: url('@/assets/picture/bg_select.png');
    min-height: 100vh;
    width: 100%;
    overflow-y: auto;
    // background-size: cover; /* 背景自動縮放填滿 */
    // background-position: center -0.6rem; /* 背景居中 */
    // background-repeat: no-repeat; /* 背景不重複 */
}

.mTitleBg{
    position: fixed;
    // background-image: url('@/assets/picture/btn-chat-bg.png');
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    color: white;
    width: 100%;
    z-index: 10;
    // background-size: cover; /* 背景自動縮放填滿 */
    // background-position: center -0.6rem; /* 背景居中 */
    // background-repeat: no-repeat; /* 背景不重複 */
    .mTitleBgImage{
        position: absolute;
        top: 230%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 95%;
    }

    .mTitleBox{
        position: absolute;
        top: 215%;
        left: 37%;
        transform: translate(-50%, -50%);
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
        margin-left: 1rem;
        width: 55%;

        .tab-button {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }

        .buttonImg{
            position:relative;
            width: 3rem;
        }

        .buttonText {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 12px;
            text-align: center;
            width: 100%;
            pointer-events: none; /* 防止文字影響點擊事件 */
        }

        .active .buttonImg {
            /* 可以在這裡添加選中狀態的樣式 */
            filter: brightness(1.2);
        }

        div {
            cursor: pointer;
            transition: all 0.3s ease;
        }

        div.active {
            color: #ffcc00; /* 選中時的顏色 */
            font-weight: bold;
            transform: scale(1.1); /* 稍微放大 */
            text-shadow: 0 0 5px rgba(255, 204, 0, 0.7); /* 添加發光效果 */
        }
    }
}

.backBtnBox{
    position: fixed;
    top: 7rem;
    left: 0;
    padding: 15px;
    z-index: 1000;

    .backBtn{
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
        animation-duration: 0.3s;
        animation-timing-function: ease;

        &:active {
            animation-name: clickAnimation;
        }

        img{
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
    }

    
    // width: 50px;
    // height: 50px;
    // img{
    //     width: 100%;
    //     height: 100%;
    // }
}

@keyframes clickAnimation {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.jackpotBg{
    position: relative;
    // background-image: url('@/assets/picture/jackpot-bg.png');
    width: 100%;
    height: 16rem;
    // background-size: cover; /* 背景自動縮放填滿 */
    // background-position: center 0.2rem; /* 背景居中 */
    // background-repeat: no-repeat; /* 背景不重複 */

    .jackpotBgImage{
        position: relative;
        top: 30%;
        left: 0;
        width: 100%;
        object-fit: cover; /* 確保背景圖片覆蓋整個區域 */
    }
    

    .jackpotBox{
        position: absolute;
        top: 50%;
        left: 20%;
        color: rgb(0, 0, 0);
        font-size: 2.5rem;
    }

    .jackpotButton{
        position: absolute;
        top: 105%;
        display: flex;
        justify-content: space-around;
        gap:1rem;
        // z-index: 10;

        .imgButtonBox{
            display: flex;
            justify-content: center;

            img{
                width: 100%;
            }
        }
    }   
}

.tableBox{
    display: flex;
    flex-direction:column;
    gap: 1rem;
    margin-top: 5rem;

    .tableItem{
        position: relative;
        width: 100%;
        height: 8rem;
        display: flex;
        justify-content: center;
        // background-image: url('@/assets/picture/框-一般.png');
        background-size: cover; /* 背景自動縮放填滿 */
        background-position: center -0.6rem; /* 背景居中 */
        background-repeat: no-repeat; /* 背景不重複 */
        animation-duration: 0.3s;
        animation-timing-function: ease;

        &:active {
            animation-name: clickAnimation;
        }

        .tableId{
            position: absolute;
            top: 0.5rem;
            left: 2rem;
            font-size: 1.5rem;
            color: rgb(0, 0, 0);
        }

        .tableName{
            position: absolute;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 4rem;
            top: 2rem;
            // left: 1rem;
            text-align: center;
            font-size: 1.5rem;
            font-weight: bold;
            color: rgb(0, 0, 0);
        }

        .tableMoney{
            position: absolute;
            display: flex;
            justify-content: center;
            top: 65%;
            width: 100%;
            gap: 0.5rem;
            // display: flex;
            // justify-content: center;
            height: 1.5rem;
            // padding-top: 5px;
            // padding-left: 8.5rem;
            text-align: left;
            font-size: 1.2rem;
            color: rgb(0, 0, 0);
        }
    }
    //不一樣的底圖
    .tableItem.regular{
        // background-image: url('@/assets/picture/框-一般.png');
    }
    .tableItem.turbo{
        background-image: url('@/assets/picture/框-急速.png');
    }
    .tableItem.short_deck{
        background-image: url('@/assets/picture/框-短牌.png');
    }
    .tableItem.omaha{
        background-image: url('@/assets/picture/框-奧馬哈.png');
    }
    .tableItem.tournament{
        .tableName{
            position: absolute;
            display: flex;
            justify-content: center;
            width: 40%;
            top: 2rem;
            left: 0;
            text-align: center;
            font-size: 1.2rem;
            color: rgb(0, 0, 0);
        }

        .tableBody{
            top: 65%;
            width: 100%;
            position: absolute;
            display: flex;
            justify-content: space-around;
            gap:0.5rem;
            color: #000000;
            font-size: 0.7rem;
            z-index: 10;
        }

        .tableBodyImg{
            position: absolute;
            display: flex;
            top: 60%;
            left: 7rem;
            z-index: -1;
            height: 1.9rem;
            width: 100%;
            gap: 0.3rem;
        }

        .tableBodyBox{
            position: absolute;
            left: 2.5rem;
            display: flex;
            flex-direction:column;
            align-items: center;
            justify-content: center;
        }

        .tableBodyBox.left{
            margin-left: 4rem;
        }

        .tableBonusBg{
            position: absolute;
            top: 37%;
            right: 2rem;
            width: 9rem;
            background-image: url('@/assets/picture/F2_Official_bag 1.png');
            background-size: cover; /* 背景自動縮放填滿 */
            background-position: center; /* 背景居中 */
            background-repeat: no-repeat; /* 背景不重複 */
        }
    }
}

.imgSelectBox1{
    position: relative;
    width: 8rem;
    height: 2.5rem;
    // right: 20%;
    text-align: center;

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .player-count {
        position: absolute;
        top: 36%;
        left: 50%;
        width: 100%;
        transform: translate(-50%, -50%);
        color: rgb(0, 0, 0);
        font-size: 1rem;
        z-index: 1;
        padding-left: 0.5rem; /* 微調文字位置，可根據需要調整 */
    }
}

.imgSelectBox2{
    position: relative;
    // right: 20%;
    text-align: center;
    max-width: 50px;

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .player-count {
        position: absolute;
        top: 65%;
        left: 40%;
        width: 100%;
        transform: translate(-50%, -50%);
        color: rgb(255, 255, 255);
        font-size: 0.8rem;
        z-index: 1;
        padding-left: 0.5rem; /* 微調文字位置，可根據需要調整 */
    }

    .tournament{
        position: absolute;
        top: 50%;
        left: 45%;
        width: 100%;
        transform: translate(-50%, -50%);
        color: rgb(255, 255, 255);
        font-size: 0.8rem;
        z-index: 1;
        padding-left: 0.5rem;
    }
}

.routerLink{
    text-decoration: none;
}

.loading-screen {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    color: white;
    background-color: black;
}

// 載入畫面
.loading-box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* 可以根據實際需要調整 */
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #09f;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 🚀 過渡動畫 (避免閃爍) */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* 🚀 遮罩 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
//   color: white;
}



</style>