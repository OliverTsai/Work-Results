<template>
    <div class="mPlayLogBg">
        <!-- <HeadView /> -->
        <div class="backLogBtnBox">
            <router-link to="/select" class="backBtn">
                <img src="@/assets/picture/btn-back.png">
            </router-link>
        </div>
        <div class="mLogBg">
            <!-- <h2>遊戲紀錄</h2> -->
            <!-- <div class="summary">
                <p>總下注額：{{ allPlayLogs.total_bets }}</p>
                <p>總贏取額：{{ allPlayLogs.total_wins }}</p>
                <p>淨賺淨賠：{{ allPlayLogs.net_profit }}</p>
                <p>贏牌局數：{{ allPlayLogs.winning_hands }}</p>
                <p>勝率：{{ allPlayLogs.win_rate }}</p>
            </div> -->
            <!-- <div class="straight-line mt-3"></div> -->
            <div class="playLogTitle">遊戲紀錄</div>
            <div class="straight-line"></div>

            <div class="playLogTable">
                <!-- <div v-for="hand in playLogs" :key="hand.hand_id">
                    <div class="logRaw">
                        <div>{{ hand.hand_name }}</div>
                        <div>{{ formatTimestamp(hand.hand_start_time) }}</div>
                    </div>
                </div> -->
                <div v-for="hand in playLogs" :key="hand.hand_id">
                    <div class="logRaw" @click="Details(hand)">
                        <div>{{ hand.hand_name }}</div>
                        <div>{{ formatTimestamp(hand.hand_start_time) }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 模擬視窗 -->
        <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
            <div class="modal-container">
                <div class="modal-header">
                    <h3>{{ selectedHand?.table_name }} ({{ selectedHand?.hand_name }})</h3>
                    <span class="close-button" @click="closeModal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="modal-info">
                        <p>牌局時間: {{ selectedHand ? formatTimestamp(selectedHand.hand_start_time) : '' }}</p>
                    </div>
                    <div class="records-container">
                        <div class="record-item" v-for="record in selectedHand?.records" :key="record.id">
                            <div class="record-header">
                                <span class="record-type">{{ hand_status(record.type) }}</span>
                                <span class="record-amount">{{ record.amount }}</span>
                            </div>
                            <div class="record-cards">
                                <div class="hole-cards" v-if="record.hole_cards && record.hole_cards.length > 0">
                                    <p>手牌:</p>
                                    <div class="cards-display">
                                        <img v-for="card in record.hole_cards" :key="card" 
                                             :src="getCardImagePath(card)" 
                                             class="card-image">
                                    </div>
                                </div>
                                <div class="community-cards" v-if="record.community_cards && record.community_cards.length > 0">
                                    <p>公牌:</p>
                                    <div class="cards-display">
                                        <img v-for="card in record.community_cards" :key="card" 
                                             :src="getCardImagePath(card)" 
                                             class="card-image">
                                    </div>
                                </div>
                            </div>
                            <div class="record-best-rank" v-if="record.best_rank">
                                <p>玩家: {{ record.nickname }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <img class="mPlayLogBackground" src="@/assets/picture/store-background.png">
        <img class="mPlayLogBackground" src="@/assets/picture/frame.png">
    </div>
</template>
  
<script setup lang="ts">

import { ref, onMounted } from 'vue';
import HeadView from '@/components/HeadView.vue'
import { backendApi } from '@/composables/useApi';

const token = ref(localStorage.getItem("token") || "");

interface PlayLogRecord {
    id: string;
    created_at: number;
    hand_phase: string;
    community_cards: string[];
    hole_cards: string[];
    best_rank: string;
    type: string;
    amount: string;
    pot_order: number;
    nickname:string;
}

interface PlayLog {
    table_id: string;
    table_name: string;
    table_type: string;
    tournament_id: string;
    hand_id: string;
    hand_name: string;
    hand_start_time: number;
    username: string;
    nickname:string;
    seat_number: number;
    total_net: string;
    last_record_time: number;
    records: PlayLogRecord[];
}

interface StatsData {
    total_bets: string;
    total_wins: string;
    net_profit: string;
    winning_hands: number;
    win_rate: number;
}

const playLogs = ref<PlayLog[]>([]);
const allPlayLogs = ref<StatsData>({
    total_bets: "0",
    total_wins: "0",
    net_profit: "0",
    winning_hands: 0,
    win_rate: 0
});

const expandedHandId = ref<string | null>(null);
const showModal = ref(false);
const selectedHand = ref<PlayLog | null>(null);

const toggleExpand = (handId: string) => {
    expandedHandId.value = expandedHandId.value === handId ? null : handId;
};

// 打開模擬視窗顯示詳細資訊
const Details = (hand: PlayLog) => {
    selectedHand.value = hand;
    showModal.value = true;
};

// 關閉模擬視窗
const closeModal = () => {
    showModal.value = false;
    selectedHand.value = null;
};

// 正確處理卡片圖片路徑
function getCardImagePath(card: string): string {
    // 檢查卡片是否為空
    if (!card || card.trim() === '**') {
        // 返回牌背圖片路徑
        return new URL(`../assets/picture/POKER/XX.jpg`, import.meta.url).href;
    }

    return new URL(`../assets/picture/POKER/${card}.png`, import.meta.url).href;
}

//根據時間戳轉成字串
function formatTimestamp(timestamp: number): string {
  // 檢查時間戳是否為有效數字
  if (!timestamp) return '無效時間';
  
  // 將秒轉換為毫秒 (JavaScript Date 使用毫秒)
  const date = new Date(timestamp * 1000);
  
  // 格式化日期和時間
//   const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份從0開始，需要+1
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  // 返回格式化後的日期時間字串
  return `${month}/${day} ${hours}:${minutes}`;
}


async function getPlayLog() {
    try {
        const url = backendApi("/api/v1/bet-histories");
        const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token.value}`,
            "Content-Type": "application/json",
        },
        });
        if (response.ok) {

        const data = await response.json();
        // allPlayLogs.value = data.data.stats;
        playLogs.value = data.data.histories;
        console.log('遊戲紀錄資料',data);
        
        } else {
        console.error('無法取得遊戲紀錄');
        }
    } catch (error) {
        console.error('無法取得遊戲紀錄', error);
    }
}

type StatusKey = 'starting_chips' | 'small_blind' | 'big_blind' | 'blind_bet' | 'bet' | 'call' | 'raise' | 'all-in' | 'check' | 'fold' | 'leave' | 'win';

function hand_status(status: string) {
    const statusBox: Record<StatusKey, string> = {
        'starting_chips':'入座買入',
        'small_blind': '小盲',
        'big_blind': '大盲',
        'blind_bet': '下盲注',
        'bet': '下注',
        'call': '跟注',
        'raise': '加注',
        'all-in': '全下',
        'check': '過牌',
        'fold': '棄牌',
        'leave': '離開',
        'win': '贏',
    };
    return statusBox[status as StatusKey] || '未知';
}

// 第一次連接
onMounted(async () => {
  getPlayLog();
})
</script>

<style lang="scss">

.mPlayLogBg {
    height: 100%;
    width: 100%;
    overflow-y: auto;
    position: relative;
    
}

.mPlayLogBackground{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 0;
    object-fit: cover;
}

.mLogBg {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #4A3226;
    height: 100%;
    font-size: 1rem;
    padding: 1rem 3rem 1rem 3rem;
    z-index: 1;
}

.summary p {
    margin: 0.5rem 0;
}

.straight-line {
    width: 100%;
    height: 2px;
    background-color: #4A3226;
    margin: 1rem 0;
}

.playLogTable{
    display: flex;
    flex-direction:column;
    width: 100%;
    height: 55vh; /* 固定高度為視窗高度的 50%，您可以根據需要調整 */
    max-height: 50rem; /* 最大高度限制 */
    overflow-y: auto;
    gap: 0.5rem;

    .logRaw{
        display: flex;
        justify-content:space-between;
    }
}

.playLogTitle{
    margin-top: 7rem;
    font-size: 2rem;
}

/* 模擬視窗樣式 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-container {
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #4A3226;
    color: white;
    
    h3 {
        margin: 0;
        font-size: 1.2rem;
    }
    
    .close-button {
        font-size: 1.5rem;
        cursor: pointer;
        line-height: 1;
        
        &:hover {
            opacity: 0.8;
        }
    }
}

.modal-body {
    padding: 1rem;
    overflow-y: auto;
    max-height: calc(80vh - 60px);
    
    /* 美化滾動條 */
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05);
        border-radius: 10px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #4A3226;
        border-radius: 10px;
    }
}

.modal-info {
    background-color: rgba(74, 50, 38, 0.1);
    padding: 0.8rem;
    border-radius: 5px;
    margin-bottom: 1rem;
    
    p {
        margin: 0.3rem 0;
        font-size: 0.9rem;
    }
}

.records-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.record-item {
    border: 1px solid rgba(74, 50, 38, 0.2);
    border-radius: 5px;
    padding: 0.8rem;
    background-color: white;
}

.record-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-weight: bold;
    
    .record-type {
        color: #4A3226;
    }
    
    .record-amount {
        color: #e63946;
    }
}

.record-cards {
    display: flex;
    justify-content:space-between;
    // flex-direction: column;
    gap: 0.5rem;
    
    p {
        margin: 0;
        font-size: 0.8rem;
        color: #666;
    }
}

.cards-display {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
}

.card-image {
    width: 30px;
    height: auto;
    border-radius: 3px;
}

.record-best-rank {
    margin-top: 0.5rem;
    font-style: italic;
    color: #4A3226;
    font-size: 0.9rem;
}

@keyframes clickAnimation {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(0.95);
    }
    100% {
        transform: scale(1);
    }
}


.cards-cell {
    display: flex;
    justify-content: center;
    gap: 5px;
}

.card-image {
    width: 30px;
    height: auto;
}

.filtered-logs {
    margin-top: 1rem;
    width: 100%;
}

.backLogBtnBox{
    position: fixed;
    top: 1rem;
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
}
</style>