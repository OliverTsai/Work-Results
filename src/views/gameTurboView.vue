<template>
  <div class="game-page">
    <div v-show="isVisible">
      <headView />
    </div>
    <div class="test">
      <button @click="test">
        測試
      </button>
    </div>
    <PhaserGame 
      v-if="dataReady"
      ref="gameRef"
      :gameId="currentHandId" 
      :tableName="tableName"
      :tableType="tableType"
      :playerToken="token"
      :tableId="tableId"
      :groupId="groupId"
      :tournamentId="tournamentId"
      :maxPlayers="maxPlayers"
      :currentPlayers="allPlayerData"
      :minBuyIn="minBuyIn"
      :maxBuyIn="maxBuyIn"
      :sitDownButton="sitDownButton"
      :seatButton="seatButton"
      :tableStatus="playStatus"
      :playHand="playHand"
      :myNumber="myNumber"
      :canDoAction="canDoActions"
      :showHoleCardsButton="showHoleCardsButton"
      :potAmountBox="potAmountBox"
      :potCollectBox="potCollectBox"
      :potSideBox="potSideBox"
      :potWinner="potWinner"
      :publicCard="publicCard"
      :call="call"
      :mainRaise="mainRaise"
      :maxRaise="maxRaise"
      :myHandCard="myHandCard"
      :allChipAdditionBox="allChipAdditionBox"
      :key="tableId"
      :seatTime="seatTime"
      :turboData="turboData"
    />
  </div>
</template>
  
<script setup lang="ts">
import HeadView from '@/components/HeadView.vue'
import { ref, computed, watch, onMounted, onUnmounted, onBeforeUnmount } from 'vue';
import { backendApi } from '@/composables/useApi';
import PhaserGame from '@/game/PhaserGame.vue';
import { useRoute, useRouter } from 'vue-router';
import { useWebSocketStore } from "@/store/websocketStore";

// 型別定義
interface Player {
  id: string;
  name: string;
  chips: number;
  avatar?: string;
  isActive: boolean;
  position: number;
}

interface GameState {
  pot: number;
  gamePhase: string;
  players: Player[];
  currentTurn: string;
  bigBlind?: number;
  currentBet?: number;
}

interface PhaserGameComponent {
  updateGameState: (state: GameState) => void;
  bet: (amount: number) => void;
  call: () => void;
  raise: (amount: number) => void;
  check: () => void;
  fold: () => void;
  allIn: () => void;
  destroyGame?: () => void; // 添加銷毀遊戲的方法
}

interface GameAction {
  act: string;        // 動作類型：'bet', 'raise', 'call', 'fold' 等
  amount: string;     // 預設金額
  minAmount?: string; // 最小金額（可選）
  maxAmount?: string; // 最大金額（可選）
  disabled?: boolean; // 是否禁用（可選）
}

interface WebSocketMessage {
  event: string;
  data: any;
  balance?: number;
  table?: {
    current_hand: string;
  };
}


const wsStore = useWebSocketStore();

const route = useRoute();
const router = useRouter();

const isVisible = ref(false);   //隱藏頂部

const token = ref<string>(localStorage.getItem("token") || "");
const tableId = ref(route.query.id as string);   // 桌子ID

const groupId = ref<string>(''); // 桌子群組ID

const tournamentId = ref<string>(''); // 錦標賽ID

const publicCard = ref<string[]>([]); // 公共牌
const allPlayerData = ref<{ 
  number: number; 
  playerStatus: string; 
  playerCharacter?: string;
  playerName: string; 
  playerChips?: string; 
  playerBetChips?: string;
  playerAmount?: string;
  playerReasonChips?: string;
  playerCardBest?: string; 
  playerCard?: string[];
  seatAction?: string;
  handShowCards?: number;
  playerAvatar: string; 
  timeLimitNumber: number;
  showCard?: boolean;
}[]>([]); // 所有玩家資料

const canDoActions = ref<string[]>([]); // 玩家可執行的動作

const dataReady = ref<boolean>(false); // 標記資料是否已準備好

const turboData = ref<any>({}); // 急速桌資料

const gameRef = ref<PhaserGameComponent | null>(null);
const currentHandId = ref<string>('');     // 牌局ID
const tableType = ref<string>(''); // 牌桌類型
const balance = ref<number | null>(null); // 玩家籌碼
const potAmountBox = ref<string>('0');   // 總籌碼池
const potCollectBox = ref<string>('0'); // 玩家下注的籌碼
const potSideBox = ref<any>({}); // 所有邊池的籌碼
const potWinner = ref<any>({});    // 獲勝者與各池籌碼
let potWinnerData: Record<number, { reason:string;players: any[]; amount: number }> = {};  // 紀錄的物件

const tableName = ref<string>('');          // 桌子名稱
const playStatus = ref<string>('');        // 牌桌狀態
const playHand = ref<string>('');        // 牌局狀態
const maxPlayers = ref<number>(0);         // 最大人數
const minBuyIn = ref<string>('');          // 入座最小買入
const maxBuyIn = ref<string>('');          // 入座最大買入
const seatButton = ref<number>(0);          // 座位按鈕

const sitDownButton = ref<boolean>(false); // 玩家是否已經坐下
const myChips = ref<string>('0');         // 玩家籌碼
const myNumber = ref<number>(0);         // 玩家座位號碼
const myHandCard = ref<string[]>([]); // 玩家手牌
const showHoleCardsButton = ref<boolean>(false); // 是否顯示手牌按鈕

const call = ref<string>('0'); // 跟注的金額
const mainRaise = ref<string>('0'); //自己最小加注、下注
const maxRaise = ref<string>('0'); //自己最大加注、下注
const mainRaiseCount = ref<string>('0'); //用來送出的加注下注值
const allChipAdditionBox = ref<{ [key: string]: any }[]>([]); //所有玩家的加注金額
const seatTime = ref<{seatNumber:number;timeLimit:number}>({ seatNumber: 0, timeLimit: 0 }); //座位倒數
// 使用 computed 來確保 `isConnected`,`messages` 是響應式的
const isConnected = computed(() => wsStore.isConnected);
const messages = computed(() => wsStore.messages);

const test = () => {
  console.log('測試按鈕被點擊');
  dataReady.value = false;
  // getTable(); // 獲取牌桌資料
  // wsStore.resubscribeToTablePlay(tableId.value);
};

// 監聽 WebSocket 是否連線
watch(isConnected, (newVal) => {
  if (newVal) {
    console.log('WebSocket 已連線，開始訂閱');
    if (token.value) {
      wsStore.resubscribeToTablePlay(tableId.value);
    } else {
      console.warn('沒有可用的 token，無法訂閱');
    }
  }
}, { immediate: true });

// 監聽路由變化，確保在切換桌時重置狀態
watch(() => route.query.id, (newId, oldId) => {
  if (newId !== oldId) {
    // 如果桌子 ID 變化，先取消舊桌子的訂閱
    // if (oldId) {
    //   wsStore.unsubscribeFromTablePlay(oldId as string);
    // }
    console.log('路由變化，舊的路由:', oldId);
    console.log('路由變化，新的路由:', newId);
    
    // 確保遊戲實例被正確銷毀
    if (gameRef.value && typeof gameRef.value.destroyGame === 'function') {
      gameRef.value.destroyGame();
    }

    // 更新 tableId
    tableId.value = newId as string;
    
    // 重置遊戲狀態
    resetGameState();
    getTable();
    
    // 獲取新桌子的資料
    if (newId) {
      console.log('重新訂閱新桌子 ID:', newId);
      // 重置遊戲狀態
      // resetGameState();
      
      wsStore.resubscribeToTablePlay(newId as string);
      console.log('重新訂閱新桌子名稱:', tableName.value);
      getTable();
    }
  }
}, { immediate: true });

// 監聽 WebSocket 消息
watch(messages, (msg) => {
  if (!msg) return;  // 避免 msg 為 null
  try {
    dataReady.value = false;
    const data = msg;

    //急速桌跳轉並訂閱
    if(data.event === "user_into_pool"){
      turboData.value = {waitButton:true};
      // router.push(`/game?id=${data.main_table_id}`);
      tableId.value = data.main_table_id; // 更新桌子ID
      // wsStore.resubscribeToTablePlay(data.main_table_id); // 重新訂閱新的桌子
      // getTable(); // 獲取牌桌資料
    }

    //我自己的移動事件
    if(data.event === "user_move"){
      groupId.value = data.to_table_group || ''; // 更新桌子群組ID

      turboData.value = {waitButton:false};

      getTable();

      if(!data.tournament_id){
        turboData.value = {waitButton:false};
      }

      if(data.to_table_id !== tableId.value){

        // router.push(`/game?id=${data.to_table_id}`);
        // tableId.value = data.to_table_id; // 更新桌子ID
        // wsStore.resubscribeToTablePlay(data.to_table_id); // 重新訂閱新的桌子
        

      }else{

        getTable();
        console.log('user_move觸發而重新GET資料:',tableName.value)
        console.log('user_move觸發而重新GET資料:',tableId.value)

      }
      
    }

    // 確保桌子ID正確
    // if(data.table_id !== tableId.value){
    //   return; // 如果不是自己的桌子，則不處理
    // }

    //座位的籌碼
    if(data.event === "seat_chips"){

      if(data.table_id !== tableId.value){
        return; // 如果不是自己的桌子，則不處理
      }

      const key = data.seat_number - 1; 

      allPlayerData.value[key].playerChips = data.chips; // 玩家籌碼
      allPlayerData.value[key].playerReasonChips = data.reason; // 玩家籌碼來源
      allPlayerData.value[key].playerAmount = data.amount; // 玩家籌碼數量

      if(data.bet_chips === '0'){
        allPlayerData.value[key].playerBetChips = '0'; // 玩家下注籌碼
      }else{
        allPlayerData.value[key].playerBetChips = data.bet_chips; // 玩家下注籌碼
      }
    }

    //座位狀況
    if(data.event === "seat_status"){

      if(data.table_id !== tableId.value){
        return; // 如果不是自己的桌子，則不處理
      }

      const key = data.seat_number - 1; //座位號碼

      if(data.old_status === "playing" && data.status === "folded"){
        allPlayerData.value[key].seatAction = 'folded'; // 棄牌狀態
      }

      if(data.old_status === "folded" && data.status === "waiting"){
        allPlayerData.value[key].seatAction = data.status; // 玩家狀態
      }
    
    }

    //玩家入座
    if(data.event === "seat_join_leave"){

      if(data.table_id !== tableId.value){
        return; // 如果不是自己的桌子，則不處理
      }

      const key = data.seat_number - 1; 
      const seatNumber = data.seat_number; //座位號碼

      // 確保索引有效
      if (key >= 0 && key < allPlayerData.value.length) {
        // 創建一個新的玩家數據對象，保留原有數據
        const playerData = { ...allPlayerData.value[key] };

        // 更新玩家數據
        playerData.number = seatNumber; // 確保座位號碼正確
        playerData.playerStatus = data.status; // 更新玩家狀態
        playerData.playerName = data.nickname || ''; // 更新玩家名稱
        playerData.playerAvatar = data.avatar || ''; // 更新玩家頭像
        playerData.timeLimitNumber = 0; // 更新玩家倒數時間
        playerData.playerCharacter = data.character || ''; // 更新玩家角色

        // 替換整個對象以確保響應式更新
        allPlayerData.value[key] = playerData;
      }

      if(data.action === "leave"){
        allPlayerData.value[key].playerChips = "0"; // 玩家離開時，將籌碼設置為0
        allPlayerData.value[key].playerName = ""; // 玩家離開時，將名稱設置為空
      }
    }

    //玩家的代幣
    if(data.event === "balance_deduct"){
      balance.value = data.balance;
    }

    //彩池的資料
    if(data.event === "pot"){

      if(data.table_id !== tableId.value){
        return; // 如果不是自己的桌子，則不處理
      }

      potAmountBox.value = data.total_pot_amount;  //底池

      //玩家下注籌碼收到下注池
      if(data.reason === "collect"){
        const chipsAmount = Number(data.pot.amount); //玩家下注的籌碼
        const chipsOrder = data.pot.order; //玩家下注的順序

        if(chipsOrder === 0){
          potCollectBox.value = data.pot.amount; //玩家下注的籌碼
        }else{
          potSideBox.value[chipsOrder] = data.pot.amount; //所有邊池的籌碼
        }

        potWinnerData[chipsOrder] = {reason:data.reason,amount: chipsAmount, players: []}; //將玩家的籌碼加入到彩池中

        potWinner.value = { ...potWinnerData }; //將玩家的籌碼加入到彩池中
      }

      if(data.reason === "clear"){
        potWinnerData = {};
        potWinner.value = {};
        potAmountBox.value = '0'; // 重置籌碼池
        potCollectBox.value = '0'; // 重置玩家下注的籌碼
        potSideBox.value = {}; // 重置所有邊池的籌碼
      }

      if(data.winners){
        const seats = Object.keys(data.winners);
        const chipsOrder = data.pot.order
        const centerChipBox = Number(data.pot.amount)
        
        // 修改這裡，為每個贏家創建包含名稱和座位號碼的對象
        const winners = seats.map(seat => ({
          name: data.winners[seat],
          seatNumber: parseInt(seat, 10) // 將座位號碼轉換為數字
        }));

        potWinnerData[chipsOrder] = {
          reason:data.reason,
          amount: centerChipBox,
          players: winners,
        }

        potWinner.value = { ...potWinnerData }; //將玩家的籌碼加入到彩池中
      }else{
        // potWinner.value = {}; 
      }
    }

    

    //自己的變動資料
    if(data.event === "user_join_leave"){

      if(data.table_id !== tableId.value){
        return; // 如果不是自己的桌子，則不處理
      }
      
      const key = data.seat_number - 1; //座位號碼
      myNumber.value = data.seat_number; // 玩家座位號碼

      if(data.action === "join"){

        // if(data.table_id !== tableId.value){
        //   getTable(); // 確保獲取正確的牌桌資料
        // }

        if(data.table_group === 'TUR'){
          console.log('急速桌主桌不跳轉')
        }else{
          sitDownButton.value = true; // 玩家已經入座
        }
        
        myHandCard.value = []; // 玩家手牌設置為空
        allPlayerData.value[key].playerStatus = data.status;
      }

      if(data.action === "leave"){

        if(data.table_id !== tableId.value || data.seat_number !== myNumber.value){
          console.log('不是当前玩家的离开事件，忽略');
          return; // 如果不是自己的桌子，則不處理
        }else{
          console.log('确认玩家离开事件:', data);
          sitDownButton.value = false; // 玩家已經離開
          myHandCard.value = []; // 玩家手牌設置為空
          allPlayerData.value[key].playerStatus = data.status;
          potWinner.value = {}; // 重置籌碼池
          potAmountBox.value = '0'; // 重置籌碼池
          console.log('即時資料玩家離開觸發離座動畫:',tableName.value)
        }

        
      }
    }

    //秀手牌的資料
    if(data.event === "show_hole_cards"){
      const key = data.seat_num - 1; //座位號碼

      const playerData = { ...allPlayerData.value[key] };

      playerData.playerCard = data.hole_cards;
      playerData.handShowCards = data.show_hole_cards; // 玩家手牌狀態
      playerData.playerCardBest = cardBestRankCode(data.best_rank_code);

      // 替換整個對象以確保響應式更新
      allPlayerData.value[key] = playerData;
    }

    // 當牌局狀態發生更新時觸發此事件
    if (data.event === "table_play_hand_update"){
      playHand.value = getPhaseText(data.hand.hand_phase);
      publicCard.value = data.hand.community_cards; //公共牌
    }

    //牌局倒數時間
    if(data.event === "table_play_actor_update"){
      console.log('收到倒计时更新:', data);

      const newSeatTime = {
        seatNumber: data.actor_seat || 0,
        timeLimit: data.time_limit || 0
      };

      console.log('更新座位时间:', newSeatTime);
      seatTime.value = newSeatTime; 
    }

    if (data.event === "table_play_update") {
      currentHandId.value = data.table.current_hand;  //牌局ID
      playStatus.value = data.table.status;            //遊戲狀態
      seatButton.value = data.table.button_seat; //按鈕位
    }

    //我個人的資料
    if(data.event === "user_can_do_actions_update"){

      // sitDownButton.value = true; // 玩家已經坐下
      myNumber.value = data.seat_num;
      canDoActions.value = data.can_do_actions; // 玩家可執行的動作

      call.value = data.can_bet;
      mainRaise.value = data.can_bet_min;
      maxRaise.value = data.can_bet_max;
      mainRaiseCount.value = data.can_bet_min; // 用來送出的加注下注值

      //應出籌碼的%數
      const chipKeys = ['33%', '50%', '75%'];
      allChipAdditionBox.value = chipKeys
        .filter(key => data.can_bet_pot_percents?.[key] !== undefined)
        .reverse()
        .map(key => ({ [key]: data.can_bet_pot_percents[key] }));

      if(data.can_do_actions){
        showHoleCardsButton.value = data.can_do_actions.includes("show_cards");
      }
    }

    // 當玩家的手牌更新時觸發此事件
    if (data.event === "user_hole_cards_update") {
      myHandCard.value = data.hole_cards;
    }

    dataReady.value = true; // 資料獲取完成，標記為準備好

  } catch (e) {
    console.error("解析 WebSocket 訊息時發生錯誤:", e);
  }
});

// 取得牌桌資料
async function getTable() {
  dataReady.value = false; // 開始獲取資料，設置為未準備好

  tableId.value = route.query.id as string;

  const url = backendApi(`/api/v1/tables/${tableId.value}`);
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
    console.log('獲取牌桌資料', data);

    tableName.value = data.name;          // 桌子名稱
    tableType.value = data.type;          // 桌子類型
    maxPlayers.value = data.max_players; // 最大人數
    minBuyIn.value = data.min_buy_in;    // 最小買入
    maxBuyIn.value = data.max_buy_in;    // 最大買入
    currentHandId.value = data.current_hand;  // 當前牌局ID
    playStatus.value = data.status;      // 牌桌狀態
    seatButton.value = data.button_seat; // 座位號碼

    groupId.value = data.group || ''; // 桌子群組ID

    if (data.my_seat){
      call.value = data.my_seat?.can_bet;
      mainRaise.value = data.my_seat?.can_bet_min;
      maxRaise.value = data.my_seat?.can_bet_max;
      sitDownButton.value = true; // 玩家已經坐下
      myHandCard.value = data.my_seat?.hole_cards || []; // 玩家手牌
      myNumber.value = data.my_seat.number; // 玩家座位號碼
      canDoActions.value = data.my_seat.can_do_actions; // 玩家可執行的動作
    }else{
      sitDownButton.value = false; // 玩家尚未坐下
      console.log('API沒有個人資料觸發玩家離座動畫');
    }

    if(data.tournament_id){
      tournamentId.value = data.tournament_id;
    }

    // 清空現有的玩家數據，避免重複添加
    allPlayerData.value = [];
    
    for (const key of Object.keys(data.seats)) {
      //座位號碼
      const number = data.seats[key].number as number;
      const playerCharacter = data.seats[key].player?.character || '' as string;
      const playerName = data.seats[key].player?.nickname || '' as string;
      const playerChips = data.seats[key].chips || '' as string;
      const playerBetChips = data.seats[key].bet_chips || '' as string;
      const playerStatus = data.seats[key].status as string;
      const playerCardBest = data.seats[key].seat_hand?.best_rank || '' as string;
      const playerCard = data.seats[key].seat_hand?.hole_cards || '' as string;
      const handShowCards = data.seats[key].show_hole_cards || 0 as number;      
      const playerAvatar = data.seats[key].player?.avatar || '' as string;
      const timeLimitNumber = 0 as number;

      allPlayerData.value.push({ number, playerCharacter, playerStatus, playerName, playerChips, playerBetChips, playerCardBest, handShowCards, playerCard, playerAvatar,timeLimitNumber });
    }

    // console.log('所有玩家資料', allPlayerData.value);

    if(playStatus.value === 'playing' && currentHandId.value && data.group !== 'TUR'){
      getHand(); // 獲取牌局遊戲資料
    }

    // 資料獲取完成，標記為準備好
    dataReady.value = true;

  } catch (error) {
    console.error("獲取牌桌資料失敗:", error);
  }
}

//取得牌局遊戲資料
async function getHand() {
  const url = backendApi(`/api/v1/tables/${tableId.value}/hand`);
  try{
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      }
    });

    if (response.status === 401) {
      console.error('認證失敗，跳轉到登入頁面');
      router.push('/login');
      return;
    }

    // 檢查響應狀態
    if (!response.ok) {
      console.error(`伺服器返回錯誤狀態: ${response.status}`);
      
      if (response.status === 404) {
        console.log('當前沒有活躍的牌局');
        // 可以在這裡設置一些默認值
        playStatus.value = 'waiting';
        publicCard.value = [];
      }

      return;
    }

    const data = await response.json();
    console.log('獲取牌桌遊戲資料', data);

    playHand.value = getPhaseText(data.hand_phase);
    // console.log('遊戲階段', playHand.value);
    publicCard.value = data.community_cards;
    // potAmountBox.value = data.pots ? data.pots.reduce((sum: number, pot: { amount: string; }) => sum + parseInt(pot.amount, 10), 0).toString() : "0";


  }catch (error) {
    console.error("獲取牌桌遊戲資料失敗:", error);
  }
}

// 將遊戲階段轉換為可讀文字
function getPhaseText(phase: string) {
  const phaseMap = {
    "init":"洗牌及切牌",
    "blind_bet":"小盲注和大盲注",
    "deal":"發牌",
    "preflop_bet":"翻牌前下注圈",
    "flop":"翻牌",
    "flop_bet":"翻牌圈下注",
    "turn":"轉牌",
    "turn_bet":"轉牌圈下注",
    "river":"河牌",
    "river_bet":"河牌圈下注",
    "bet_end":"下注結束",
    "showdown":"攤牌",
    "complete":"牌局結束",
  };
  return phaseMap[phase as keyof typeof phaseMap] || phase;
}

//牌型顯示
function cardBestRankCode(act:string):string{
  const cardBest:Record<string,string> = {
    'none': '無牌型',
    'high_card': '高牌',
    'pair': '對子',
    'two_pair': '兩對',
    'three_of_a_kind': '三條',
    'straight': '順子',
    'flush':'同花',
    'full_house': '葫蘆',
    'four_of_a_kind': '四條',
    'straight_flush': '同花順',
    'royal_flush': '皇家同花順',
  }
  return cardBest[act] || act;
}

// 重置遊戲狀態的函數
function resetGameState() {
  allPlayerData.value = []; // 清空所有玩家資料
  publicCard.value = []; // 清空公共牌
  canDoActions.value = []; // 清空可執行動作
  potAmountBox.value = '0'; // 重置籌碼池
  potWinner.value = {}; // 重置獲勝者
  potWinnerData = {}; // 重置獲勝者資料
  myHandCard.value = []; // 清空手牌
  call.value = '0'; // 重置跟注金額
  mainRaise.value = '0'; // 重置加注金額
  maxRaise.value = '0'; // 重置最大加注金額
  allChipAdditionBox.value = []; // 清空加注金額
}


// 第一次連接
onMounted(async () => {
  resetGameState();
  getTable();
});

// 在組件卸載前清理遊戲
onBeforeUnmount(() => {
  // 如果 gameRef 存在並且有 destroyGame 方法，則調用它
  if (gameRef.value && typeof gameRef.value.destroyGame === 'function') {
    gameRef.value.destroyGame();
  }
});

onUnmounted(() => {
  wsStore.unsubscribeFromTablePlay(tableId.value);
});
</script>

<style scoped>
.game-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
}

.game-actions {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  z-index: 100;
}

.game-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #4CAF50;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.game-actions button:hover {
  background-color: #45a049;
}

.bet-controls {
  display: flex;
  align-items: center;
  gap: 5px;
}

.bet-controls input {
  width: 80px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.game-status {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px;
  border-radius: 8px;
  z-index: 100;
}

.players {
  margin-top: 10px;
}

.current-player {
  color: #4CAF50;
  font-weight: bold;
}

.active-player {
  color: #FFC107;
  font-weight: bold;
}
</style>