<template>
    <div class="tournamentBg">
        <HeadView />
        
        <!-- 主視圖區域 - 使用動態組件 -->
        <component 
        :is="currentView" 
        :tournamentData="tournamentData"
        @view-details="showDetails"
        @view-players="showPlayers"
        @view-prizes="showPrizes"
        @view-blind="showBlind"
        @view-rank="showRank"
        @back-to-main="showMain"
        @register="handleRegister"
        ></component>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, shallowRef, onMounted, onUnmounted, markRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { backendApi } from '@/composables/useApi';
import { useWebSocketStore } from "@/store/websocketStore";

// 導入所有子組件
import HeadView from '@/components/HeadView.vue';
import TournamentMainView from '@/components/Tournament/TournamentMainView.vue';
import TournamentPlayersView from '@/components/Tournament/TournamentPlayersView.vue';//   
import TournamentDetailsView from '@/components/Tournament/TournamentDetailsView.vue';
import TournamentPrizesView from '@/components/Tournament/TournamentPrizesView.vue';
import TournamentBlindView from '@/components/Tournament/TournamentBlindView.vue';
import TournamentRankView from '@/components/Tournament/TournamentRankView.vue';

const route = useRoute();
const router = useRouter();

const wsStore = useWebSocketStore();

const token = ref<string>(localStorage.getItem("token") || "");

const tournamentId = route.query.id as string;

const tournamentData = ref<any>(null);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);

const isConnected = computed(() => wsStore.isConnected);
const messages = computed(() => wsStore.messages);

// 監聽 WebSocket 是否連線
watch(isConnected, (newVal) => {
  if (newVal) {
    console.log('WebSocket 已連線，開始訂閱錦標賽');
    if (token.value) {
      wsStore.resubscribeToTournamentShow(tournamentId);
    } else {
      console.warn('沒有可用的 token，無法訂閱');
    }
  }
}, { immediate: true });

// 監聽 WebSocket 消息
watch(messages, (msg) => {
  if (!msg) return;  // 避免 msg 為 null
  try {
    const data = msg;

    if(data.event === "base_info"){

        tournamentData.value.tournament.base.status = data.status;
        tournamentData.value.tournament.base.register_start_time = data.register_start_time
        tournamentData.value.tournament.base.pot_fee = data.pot_fee;
        tournamentData.value.tournament.base.max_players = data.max_players;
        tournamentData.value.tournament.base.register_start_time = data.register_start_time;
        tournamentData.value.tournament.base.register_end_time = data.register_end_time;
        tournamentData.value.tournament.base.service_fee = data.service_fee;
        tournamentData.value.tournament.base.starting_chips = data.starting_chips;
        tournamentData.value.tournament.base.blind_levels = data.blind_levels;
    }

    if(data.event === "stats") {
        tournamentData.value.tournament.stats.current_players = data.stats.current_players;
        tournamentData.value.tournament.stats.total_pot = data.stats.total_pot;
    }

    if(data.event === "blind_level") {
        tournamentData.value.tournament.blind_state.big_blind = data.big_blind;
        tournamentData.value.tournament.blind_state.small_blind = data.small_blind;
    }
  } catch (error) {
    console.error('解析 WebSocket 消息時出錯:', error);
  }
});

// 使用 shallowRef 來存儲當前視圖組件，提高性能
const currentView = shallowRef<any>(markRaw(TournamentMainView));

// 視圖切換函數
function showMain() {
    currentView.value = markRaw(TournamentMainView);
}

function showDetails() {
    currentView.value = markRaw(TournamentDetailsView);
}

function showPlayers() {
    currentView.value = markRaw(TournamentPlayersView);
}

function showBlind() {
    currentView.value = markRaw(TournamentBlindView);
}

function showPrizes() {
    currentView.value = markRaw(TournamentPrizesView);
}

function showRank() {
    currentView.value = markRaw(TournamentRankView);
}

// 處理報名操作
async function handleRegister() {
    // 實現報名邏輯
    try {
        const url = backendApi(`/api/v1/tournaments/${tournamentId}/register`);
        const res = await fetch(url, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.value}`
            }
        });
        
        if (!res.ok) {
            throw new Error(`API 請求失敗: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('報名成功:', data);
        alert('報名成功！');
        // 可以在此處添加成功報名後的處理邏輯

        // 重新獲取錦標賽資訊以更新狀態
        await getTournamentInfo();
    } catch (err) {
        console.error('報名時出錯:', err);
        error.value = err instanceof Error ? err.message : '未知錯誤';
    }
}

// 取得錦標賽資訊
async function getTournamentInfo() {
    loading.value = true;
    try {
        const url = backendApi(`/api/v1/tournaments/${tournamentId}`);
        const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.value}`
        }
        });
        
        if (!res.ok) {
        throw new Error(`API 請求失敗: ${res.status}`);
        }
        
        const data = await res.json();
        tournamentData.value = data.data;
        console.log('錦標賽資料:', data);
    } catch (err) {
        console.error('獲取錦標賽資料時出錯:', err);
        error.value = err instanceof Error ? err.message : '未知錯誤';
    } finally {
        loading.value = false;
    }
}

// 生命週期鉤子
onMounted(async () => {
    await getTournamentInfo();
});

onUnmounted(() => {
// 清除連接或訂閱
    wsStore.unsubscribeFromTournamentShow(tournamentId);
});
</script>

<style lang="scss">
.tournamentBg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #1a1a2e;
    color: rgb(87, 65, 5);
    background-image: url('@/assets/picture/bg_select.png');
    background-size: cover; /* 背景自動縮放填滿 */
    background-position: center; /* 背景居中 */
    background-repeat: no-repeat; /* 背景不重複 */
}
</style>