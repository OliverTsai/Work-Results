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


// 生命週期鉤子
onMounted(async () => {
    
});

onUnmounted(() => {

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