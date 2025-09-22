<template>
  <div class="game-page">
    <div v-show="isVisible">
      <headView />
    </div>
    <div class="game-Debugger">
      <ErudaDebugger buttonText="Debug" />
      <!-- <button @click="test">
        測試
      </button> -->
      <!-- <button @click="test2">
        測試2
      </button> -->
    </div>
    <!-- <ErudaDebugger buttonText="Debug" /> -->
    <!-- <div class="test">
      <button @click="test">
        測試
      </button>
    </div> -->
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
      :allSeats="allSeats"
      :minBuyIn="minBuyIn"
      :maxBuyIn="maxBuyIn"
      :sitDownButton="sitDownButton"
      :seatButton="seatButton"
      :tableStatus="playStatus"
      :playHand="playHand"
      :showHoleCardsButton="showHoleCardsButton"
      :potAmountBox="potAmountBox"
      :potCollectBox="potCollectBox"
      :potSideBox="potSideBox"
      :potWinner="potWinner"
      :betSwitch="betSwitch"
      :publicCard="publicCard"
      :myHandCard="myHandCard"
      :allChipAdditionBox="allChipAdditionBox"
      :key="tableId"
      :seatTime="seatTime"

      :canDoAction="canDoActions"
      :call="call"
      :maxRaise="maxRaise"
      :mainRaise="mainRaise"
      :myNumber="myNumber"   
      
      :mySeatList="mySeatList"
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
import { useTableStore } from "@/store/tableStore";
import ErudaDebugger from '@/components/ErudaDebugger.vue';

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

interface mySeatData {
  tableId: string;
  tableName: string;
  status: string;
  seatNumber: number;
  playerName: string;
  character: string;
  chips: string;
  avatar: string;
  canDoActions?: string[];
  betChips?: string;
  call?: string;
  showHoleCards?:number;
  mainRaise?: string;
  maxRaise?: string;
  myHandCard?: string[];
  myCardBestRank?: string; 
}

interface mySeatList {
  [key: string]: mySeatData;
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
const tableStore = useTableStore(); // 使用新的 store

const route = useRoute();
const router = useRouter();

const isVisible = ref(false);   //隱藏頂部

const token = ref<string>(localStorage.getItem("token") || "");
const name = ref(localStorage.getItem("name") || "");

// const tableId = ref(route.query.id as string);   // 桌子ID
const tableId = computed(() => tableStore.currentTableId);

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

const allSeats = ref<{ [key: number]: any }>({}); // 所有座位資料

const mySeatList = ref<mySeatList>({}); // 我的座位資料

const canDoActions = ref<string[]>([]); // 玩家可執行的動作

const dataReady = ref<boolean>(false); // 標記資料是否已準備好

const gameRef = ref<PhaserGameComponent | null>(null);
const currentHandId = ref<string>('');     // 牌局ID
const tableType = ref<string>(''); // 牌桌類型
const balance = ref<number | null>(null); // 玩家籌碼
const potAmountBox = ref<string>('0');   // 總籌碼池
const potCollectBox = ref<string>('0'); // 玩家下注的籌碼
const potSideBox = ref<any>({}); // 所有邊池的籌碼
const potWinner = ref<any>({});    // 獲勝者與各池籌碼
const betSwitch = ref<boolean>(false)
let potWinnerData: Record<number, { reason:string;players: any[]; amount: number }> = {};  // 紀錄的物件

const tableName = ref<string>('');          // 桌子名稱
const playStatus = ref<string>('');        // 牌桌狀態
const playHand = ref<string>('');        // 牌局狀態
const maxPlayers = ref<number>(0);         // 最大人數
const minBuyIn = ref<string>('');          // 入座最小買入
const maxBuyIn = ref<string>('');          // 入座最大買入
const seatButton = ref<number>(0);          // 座位按鈕

const sitDownButton = ref<boolean>(false); // 玩家是否已經坐下
const myNumber = ref<number>(0);         // 玩家座位號碼
const myHandCard = ref<string[]>([]); // 玩家手牌
const showHoleCardsButton = ref<boolean>(false); // 是否顯示手牌按鈕

const call = ref<string>('0'); // 跟注的金額
const mainRaise = ref<string>('0'); //自己最小加注、下注
const maxRaise = ref<string>('0'); //自己最大加注、下注
const mainRaiseCount = ref<string>('0'); //用來送出的加注下注值
const allChipAdditionBox = ref<{ [key: string]: any }[]>([]); //所有玩家的加注金額
const seatTime = ref<{
  seatNumber:number;
  startTime:number;
  endTime:number;
  timeLimit:number
}>({ seatNumber: 0, startTime: 0, endTime: 0, timeLimit: 0 }); //座位倒數

// 使用 computed 來確保 `isConnected`,`messages` 是響應式的
const isConnected = computed(() => wsStore.isConnected);
const messages = computed(() => wsStore.messages);

const test = () => {
  console.log('測試按鈕被點擊');
  dataReady.value = false;

  //現在的時間
  // const newTime = Date.now();

  // const newSeatTime = {
  //   startTime: newTime / 1000,
  //   endTime: (newTime + 15000) / 1000,
  //   seatNumber: 5,
  //   timeLimit: 0
  // };

  // seatTime.value = newSeatTime; 

  // allSeats.value[1].bet_chips = "500";
  // allSeats.value[5].status = 'folded';
  allSeats.value[7].player.character = '祭司';

  // wsStore.unsubscribeFromTablePlay(tableId.value);
  // tableStore.setTableId('7bbea4f0-70d3-498d-b4a9-0be53c2bf18b')
  // getTable(); 
  
  // wsStore.resubscribeToTablePlay(tableId.value);
  dataReady.value = true; // 模擬資料準備完成
};

const test2 = () => {
  console.log('測試按鈕被點擊');
  dataReady.value = false;

  allSeats.value[1].bet_chips = "0";
  // betSwitch.value = true;

  //現在的時間
  const newTime = Date.now();

  const newSeatTime = {
    startTime: newTime / 1000,
    endTime: (newTime + 15000) / 1000,
    seatNumber: 4,
    timeLimit: 0
  };

  seatTime.value = newSeatTime; 

  // wsStore.resubscribeToTablePlay(tableId.value);
  // tableStore.setTableId('7bbea4f0-70d3-498d-b4a9-0be53c2bf18b')
  // getTable(); 
  
  // wsStore.resubscribeToTablePlay(tableId.value);
  dataReady.value = true; // 模擬資料準備完成
};

//監聽桌子ID的變化
watch(() => tableStore.currentTableId, (newId, oldId) => {
  if (newId !== oldId) {
    console.log('監聽到桌子ID變更:',newId)
    dataReady.value = false;

    // 如果 gameRef 存在并且有 destroyGame 方法，则调用它
    if (gameRef.value && typeof gameRef.value.destroyGame === 'function') {
      gameRef.value.destroyGame();
    }

    resetGameState();
    // getTable()
    
    if (newId) {
      // 先获取桌子数据，然后再订阅 WebSocket
      getTable().then(() => {
        getMySeat().then(() => {
          // 数据准备好后再订阅 WebSocket
          wsStore.resubscribeToTablePlay(newId);
          dataReady.value = true;
        });
      });
    } else {
      dataReady.value = true;
    }
  }
});

// 監聽 WebSocket 是否連線
watch(isConnected, (newVal) => {
  if (newVal) {
    console.log('WebSocket 已連線，開始訂閱');
    if (token.value) {
      getTable();
      getMySeat();
      wsStore.resubscribeToTablePlay(tableId.value);
    } else {
      console.warn('沒有可用的 token，無法訂閱');
    }
  }
}, { immediate: true });

// 監聽路由變化，確保在切換桌時重置狀態
// watch(() => route.query.id, (newId, oldId) => {
//   if (newId !== oldId) {

//     dataReady.value = false;

//     // 如果 gameRef 存在並且有 destroyGame 方法，則調用它
//     if (gameRef.value && typeof gameRef.value.destroyGame === 'function') {
//       gameRef.value.destroyGame();
//     }

//     resetGameState();
    
//     // 更新 tableId 並獲取新數據
//     if (newId) {
//       // tableId.value = newId as string;
//       tableStore.setTableId(newId as string)
      
//       // 先獲取桌子數據，然後再訂閱 WebSocket
//       getTable().then(() => {
//         getMySeat().then(() => {
//           // 數據準備好後再訂閱 WebSocket
//           wsStore.resubscribeToTablePlay(newId as string);
//           dataReady.value = true;
//         });
//       });
//     } else {
//       dataReady.value = true;
//     }
//   }
// }, { immediate: true });

// 監聽 WebSocket 消息
watch(messages, (msg) => {
  if (!msg) return;  // 避免 msg 為 null
  try {
    
    const data = msg;

    //我自己的移動事件
    if(data.event === "user_move"){
      dataReady.value = false;
      
      groupId.value = data.to_table_group || ''; // 更新桌子群組ID
      // tableId.value = data.to_table_id || ''; // 更新桌子ID
      tournamentId.value = data.tournament_id || ''; // 更新錦標賽ID
      tableStore.setTableId(data.to_table_id)

      dataReady.value = true;
      return;
    }

    if(data.table_id){

      if(data.table_id !== tableId.value){
        console.log('WebSocket 消息中的 table_id 與當前 tableId 不匹配:', data.table_id, tableId.value);
        dataReady.value = true;
        return; // 如果消息中的 table_id 與當前的 tableId 不匹配，則忽略此消息
      }
    }

    //座位的籌碼
    if(data.event === "seat_chips"){

      dataReady.value = false;

      const key = data.seat_number - 1; 

      if(data.amount !== '0' && data.bet_chips === '0'){
        betSwitch.value === true
      }else{
        betSwitch.value === false
      }

      allPlayerData.value[key].playerChips = data.chips; // 玩家籌碼
      allPlayerData.value[key].playerReasonChips = data.reason; // 玩家籌碼來源
      allPlayerData.value[key].playerAmount = data.amount; // 玩家籌碼數量

      if(tableId.value === data.table_id){
        allSeats.value[data.seat_number].chips = data.chips; // 更新座位的籌碼
        allSeats.value[data.seat_number].bet_chips = data.bet_chips
      }

      if(data.bet_chips === '0'){
        allPlayerData.value[key].playerBetChips = '0'; // 玩家下注籌碼
      }else{
        allPlayerData.value[key].playerBetChips = data.bet_chips; // 玩家下注籌碼
      }

      // 如果這是當前玩家的座位，更新 mySeatList
      if(mySeatList.value[data.table_id] && data.seat_number === mySeatList.value[data.table_id].seatNumber) {
        mySeatList.value[data.table_id] = {
          ...mySeatList.value[data.table_id],
          chips: data.chips || '0',
          betChips: data.bet_chips || '0',
        };
      }

      dataReady.value = true;
      return;
    }

    //座位狀況
    if(data.event === "seat_status"){

      dataReady.value = false;

      const key = data.seat_number - 1; //座位號碼

      if(data.status === "away"){
        dataReady.value = true
        return; // 如果狀態是離開，則不處理
      }

      if(tableId.value === data.table_id){
        allSeats.value[data.seat_number].status = data.status; // 座位狀態
      }


      if(mySeatList.value[data.table_id] && data.seat_number === mySeatList.value[data.table_id].seatNumber) {
        mySeatList.value[data.table_id] = {
          ...mySeatList.value[data.table_id], 
          status: data.status, // 更新座位狀態為棄牌
          // chips:data.chips,
        }
      }

      if (allPlayerData.value[key]) {
        if(data.old_status === "playing" && data.status === "folded"){
          allPlayerData.value[key].seatAction = 'folded'; // 棄牌狀態     
        }

        if(data.old_status === "folded" && data.status === "waiting"){
          allPlayerData.value[key].seatAction = data.status; // 玩家狀態
        }

        allPlayerData.value[key].seatAction = data.status;
        allPlayerData.value[key].playerStatus = data.status; // 更新玩家狀態
      }

      dataReady.value = true;
      return;
    }

    //玩家入座
    if(data.event === "seat_join_leave"){

      dataReady.value = false;

      const key = data.seat_number - 1; 
      const seatNumber = data.seat_number; //座位號碼

      if(!allSeats.value[seatNumber].player) {
        allSeats.value[seatNumber].player = {};
      }

      if(tableId.value === data.table_id){
        allSeats.value[seatNumber].status = data.status; // 座位狀態
        allSeats.value[seatNumber].player.avatar = data?.avatar; // 座位玩家頭像
        allSeats.value[seatNumber].player.character = data?.character; // 座位玩家角色
        allSeats.value[seatNumber].player.nickname = data?.nickname; // 座位玩家名稱
        allSeats.value[seatNumber].player.username = data?.username; // 座位玩家ID
      }

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

      dataReady.value = true;
      return;
    }

    //玩家的代幣
    if(data.event === "balance_deduct"){
      dataReady.value = false;

      balance.value = data.balance;

      dataReady.value = true;
      return;
    }

    //彩池的資料
    if(data.event === "pot"){

      dataReady.value = false;

      potAmountBox.value = data.total_pot_amount;  //底池

      
      if(data.reason === "bet"){
        betSwitch.value = false;
      }

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

        betSwitch.value = true;
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
          name: data.winners[seat].nickname,
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

      dataReady.value = true;
      return;
    }

    

    //自己的變動資料
    if(data.event === "user_join_leave"){

      dataReady.value = false;
      
      const key = data.seat_number - 1; //座位號碼
      

      if(data.action === "join"){

        sitDownButton.value = true;
        
        myHandCard.value = []; // 玩家手牌設置為空
        myNumber.value = data.seat_number; // 玩家座位號碼
        allPlayerData.value[key].playerStatus = data.status;

        getTable();

        //替換合併資料
        mySeatList.value[data.table_id] = {
          ...mySeatList.value[data.table_id], // 保留原有數據
          tableId: data.table_id,
          tableName: data.table_name || '',
          status: data.status,
          seatNumber: data.seat_number,
          playerName: data.nickname || '',
          character: data.character || '',
          // chips: data.chips || '0',
          avatar: data.avatar || '',
        };
      }

      if(data.action === "leave"){

        sitDownButton.value = false; // 玩家已經離開
        myHandCard.value = []; // 玩家手牌設置為空
        allPlayerData.value[key].playerStatus = data.status;
        potWinner.value = {}; // 重置籌碼池
        potAmountBox.value = '0'; // 重置籌碼池
        myNumber.value = 0; // 玩家座位號碼設置為0
        console.log('即時資料玩家離開觸發離座動畫:',tableName.value)

        //刪除mySeatList內相同桌子ID的資料
        if(mySeatList.value[data.table_id]){
          delete mySeatList.value[data.table_id];
        }

      }
      
      //自己陷入斷線狀態就重新訂閱
      if(data.action === "away"){
        console.log('自己畫面斷線')
        wsStore.resubscribeToTablePlay(tableId.value)
      }

      dataReady.value = true;
      return;
    }

    //秀手牌的資料
    if(data.event === "show_hole_cards"){
      dataReady.value = false;

      allSeats.value[data.seat_num].show_hole_cards = data.show_hole_cards
      allSeats.value[data.seat_num].hole_cards = data.hole_cards
      allSeats.value[data.seat_num].seat_hand.best_rank = data.best_rank_code
      allSeats.value[data.seat_num].seat_hand.best_community_cards = data.best_community_cards
      allSeats.value[data.seat_num].seat_hand.best_hole_cards = data.best_hole_cards

      const key = data.seat_num - 1; //座位號碼

      const playerData = { ...allPlayerData.value[key] };

      playerData.playerCard = data.hole_cards;
      playerData.handShowCards = data.show_hole_cards; // 玩家手牌狀態
      playerData.playerCardBest = cardBestRankCode(data.best_rank_code);

      // 替換整個對象以確保響應式更新
      allPlayerData.value[key] = playerData;

      if(mySeatList.value[data.table_id] && data.seat_num === mySeatList.value[data.table_id].seatNumber){
        mySeatList.value[data.table_id] = {
          ...mySeatList.value[data.table_id],
          showHoleCards:data.show_hole_cards || 0,
          myCardBestRank: cardBestRankCode(data.best_rank_code) || '',
        };
      }

      dataReady.value = true;
      return;
    }

    // 當牌局狀態發生更新時觸發此事件
    if (data.event === "table_play_hand_update"){
      dataReady.value = false;

      playHand.value = getPhaseText(data.hand.hand_phase);
      publicCard.value = data.hand.community_cards; //公共牌

      dataReady.value = true;
      return;
    }

    //牌局倒數時間
    if(data.event === "table_play_actor_update"){

      dataReady.value = false;

      const newSeatTime = {
        startTime: data.start_time || 0,
        endTime: data.end_time || 0,
        seatNumber: data.actor_seat || 0,
        timeLimit: data.time_limit || 0
      };

      seatTime.value = newSeatTime; 

      dataReady.value = true;
      return;
    }

    if (data.event === "table_play_update") {
      dataReady.value = false;

      currentHandId.value = data.table.current_hand;  //牌局ID
      playStatus.value = data.table.status;            //遊戲狀態
      seatButton.value = data.table.button_seat; //按鈕位

      if(data.table.stats === "waiting") {
        // 處理等待中的狀態
        playStatus.value = "";
        publicCard.value = [];
      }

      dataReady.value = true;
      return;
    }

    //我個人的資料
    if(data.event === "user_can_do_actions_update"){

      dataReady.value = false;

      if(data.table_id !== tableId.value){
        console.warn('WebSocket 消息中的 table_id 與當前 tableId 不匹配:', data.table_id, tableId.value);
        return; // 如果消息中的 table_id 與當前的 tableId 不匹配，則忽略此消息
      }

      myNumber.value = data.seat_num;
      canDoActions.value = data.can_do_actions; // 玩家可執行的動作

      call.value = data.can_bet;
      mainRaise.value = data.can_bet_min;
      maxRaise.value = data.can_bet_max;
      mainRaiseCount.value = data.can_bet_min; // 用來送出的加注下注值

      // 更新 mySeatList 中對應 table_id 的數據
      if(mySeatList.value[data.table_id]) {
        mySeatList.value[data.table_id] = {
          ...mySeatList.value[data.table_id],  // 保留原有數據
          canDoActions: data.can_do_actions || [],
          call: data.can_bet || '0',
          mainRaise: data.can_bet_min || '0',
          maxRaise: data.can_bet_max || '0',
        };
      }

      //應出籌碼的%數
      const chipKeys = ['33%', '50%', '75%'];
      allChipAdditionBox.value = chipKeys
        .filter(key => data.can_bet_pot_percents?.[key] !== undefined)
        .reverse()
        .map(key => ({ [key]: data.can_bet_pot_percents[key] }));

      if(data.can_do_actions){
        showHoleCardsButton.value = data.can_do_actions.includes("show_cards");
      }

      dataReady.value = true;
      return;
    }

    // 當玩家的手牌更新時觸發此事件
    if (data.event === "user_hole_cards_update") {

      dataReady.value = false;

      if(data.table_id !== tableId.value){
        console.warn('WebSocket 消息中的 table_id 與當前 tableId 不匹配:', data.table_id, tableId.value);
        return; // 如果消息中的 table_id 與當前的 tableId 不匹配，則忽略此消息
      }

      myHandCard.value = data.hole_cards;

      // 更新 mySeatList 中的手牌數據
      if(mySeatList.value[data.table_id]) {
        mySeatList.value[data.table_id] = {
          ...mySeatList.value[data.table_id],
          myHandCard: data.hole_cards || [],
        };
      }

      dataReady.value = true;
      return;

    }

  } catch (e) {
    console.error("解析 WebSocket 訊息時發生錯誤:", e);
  }
});

// 取得牌桌資料
async function getTable() {
  dataReady.value = false; // 開始獲取資料，設置為未準備好
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

    tableName.value = data.data.name;          // 桌子名稱
    tableType.value = data.data.type;          // 桌子類型
    maxPlayers.value = data.data.max_players; // 最大人數
    minBuyIn.value = data.data.min_buy_in;    // 最小買入
    maxBuyIn.value = data.data.max_buy_in;    // 最大買入
    currentHandId.value = data.data.current_hand;  // 當前牌局ID
    playStatus.value = data.data.status;      // 牌桌狀態
    seatButton.value = data.data.button_seat; // 按鈕位號碼

    groupId.value = data.data.group || ''; // 桌子群組ID

    if(data.data.tournament_id){
      tournamentId.value = data.data.tournament_id;
    }else{
      tournamentId.value = '';
    }

    allSeats.value = data.data.seats; // 所有座位資料

    // 清空現有的玩家數據，避免重複添加
    allPlayerData.value = [];
    
    for (const key of Object.keys(data.data.seats)) {
      //座位號碼
      const number = data.data.seats[key].number as number;
      const playerCharacter = data.data.seats[key].player?.character || '' as string;
      const playerName = data.data.seats[key].player?.nickname || '' as string;
      const playerChips = data.data.seats[key].chips || '' as string;
      const playerBetChips = data.data.seats[key].bet_chips || '' as string;
      const playerStatus = data.data.seats[key].status as string;
      const playerCardBest = data.data.seats[key].seat_hand?.best_rank || '' as string;
      const playerCard = data.data.seats[key].seat_hand?.hole_cards || '' as string;
      const handShowCards = data.data.seats[key].show_hole_cards || 0 as number;      
      const playerAvatar = data.data.seats[key].player?.avatar || '' as string;
      const timeLimitNumber = 0 as number;

      allPlayerData.value.push({ number, playerCharacter, playerStatus, playerName, playerChips, playerBetChips, playerCardBest, handShowCards, playerCard, playerAvatar,timeLimitNumber });
    }

    //我的資料
    if (data.data.my_seat){
      call.value = data.data.my_seat?.can_bet;
      mainRaise.value = data.data.my_seat?.can_bet_min;
      maxRaise.value = data.data.my_seat?.can_bet_max;
      sitDownButton.value = true; // 玩家已經坐下
      myHandCard.value = data.data.my_seat?.hole_cards || []; // 玩家手牌
      myNumber.value = data.data.my_seat.number; // 玩家座位號碼
      canDoActions.value = data.data.my_seat.can_do_actions; // 玩家可執行的動作

      // 從 allPlayerData 中刪除屬於自己的數據
      // const mySeatIndex = allPlayerData.value.findIndex(player => player.number === myNumber.value);
      // if (mySeatIndex !== -1) {
      //   allPlayerData.value.splice(mySeatIndex, 1);
      // }

      mySeatList.value[data.data.id] = {
        tableId: data.data.id,
        tableName: data.data.name || '',
        status: data.data.status,
        seatNumber: data.data.my_seat.number,
        playerName: data.data.my_seat.player.nickname || '',
        character: data.data.my_seat.player.character || '',
        chips: data.data.my_seat.chips || '0',
        avatar: data.data.my_seat.player.avatar || '',
        canDoActions: data.data.my_seat.can_do_actions || [],
        betChips: data.data.my_seat.bet_chips || '0',
        call: data.data.my_seat.can_bet || '0',
        mainRaise: data.data.my_seat.can_bet_min || '0',
        maxRaise: data.data.my_seat.can_bet_max || '0',
        myHandCard: data.data.my_seat.hole_cards || [],
        showHoleCards:data.data.my_seat.show_hole_cards || 0,
        myCardBestRank: cardBestRankCode(data.data.my_seat.seat_hand?.best_rank) || '',
      };
    }else{
      sitDownButton.value = false; // 玩家尚未坐下
      console.log('API沒有個人資料觸發玩家離座動畫');
    }

    // console.log('所有玩家資料', allPlayerData.value);

    if(playStatus.value === 'playing'){
      getHand(); // 獲取牌局遊戲資料
    }

    // 資料獲取完成，標記為準備好
    dataReady.value = true;

  } catch (error) {
    console.error("獲取牌桌資料失敗:", error);
    dataReady.value = true;
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
      router.push('/login_line');
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

    playHand.value = getPhaseText(data.data.hand_phase);
    // console.log('遊戲階段', playHand.value);
    publicCard.value = data.data.community_cards;
    // potAmountBox.value = data.data.pots ? data.data.pots.reduce((sum: number, pot: { amount: string; }) => sum + parseInt(pot.amount, 10), 0).toString() : "0";


  }catch (error) {
    console.error("獲取牌桌遊戲資料失敗:", error);
  }
}

//取得個人入桌資料
async function getMySeat() {
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

      data.data.tables.forEach((item: { id: string,name:string,status:string,my_seat?:any }) => {
        mySeatList.value[item.id] = {
          tableId: item.id,
          tableName: item.name || '',
          status: item.status,
          seatNumber: item.my_seat?.number || 0,
          playerName: item.my_seat?.player?.nickname || '',
          character: item.my_seat?.player?.character || '',
          chips: item.my_seat?.chips || '0',
          avatar: item.my_seat?.player?.avatar || '',
          canDoActions: item.my_seat?.can_do_actions || [],
          betChips: item.my_seat?.bet_chips || '0',
          call: item.my_seat?.can_bet || '0',
          mainRaise: item.my_seat?.can_bet_min || '0',
          maxRaise: item.my_seat?.can_bet_max || '0',
          myHandCard: item.my_seat?.hole_cards || [],
          showHoleCards:item.my_seat.show_hole_cards || 0,
          myCardBestRank: cardBestRankCode(item.my_seat.seat_hand?.best_rank) || '',
        };
      });
      console.log("獲取入座桌子列表成功:", mySeatList.value);
    } else {
      console.warn("獲取桌子列表返回格式不符合預期:", data);
    }
  } 
  catch (error) {
      console.error("獲取桌子列表時發生錯誤:", error);
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

  // 不要完全清空 mySeatList，只移除當前桌子的數據
  if (tableId.value && mySeatList.value[tableId.value]) {
    delete mySeatList.value[tableId.value];
  }
}


// 第一次連接
onMounted(async () => {
  console.log('tableId:',tableId.value)
  resetGameState();
  getTable();
  getMySeat();
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

.game-Debugger{
  position: fixed;
  top: 7rem;
  right: 5%;
  /* transform: translateX(-50%); */
  z-index: 1000;
}
</style>