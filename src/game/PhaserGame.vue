<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { EventBus } from './EventBus';
import StartGame from './main';
import Phaser from 'phaser';
import { gameStateManager } from './GameStateManager';
import type { GameState } from './types';
// import { backendApi } from '@/composables/useApi';

// 保存當前場景實例
const scene = ref<Phaser.Scene>();
const game = ref<Phaser.Game>();
const gameState = ref<GameState | null>(null);

// const token = ref<string>(localStorage.getItem("token") || "");

const props = defineProps<{
  gameId?: string;        // 這局ID
  tableName?: string;     // 牌桌名稱
  tableType?: string;     // 牌桌類型
  playerToken?: string;   //玩家身分碼
  tableId?: string;       // 牌桌ID
  groupId?: string;      // 玩家組ID
  tournamentId?: string;  //錦標賽ID
  maxPlayers?: number;    // 牌桌玩家數量
  currentPlayers?: any[]; // 現有玩家列表
  allSeats?: { [key: number]: any }; // 所有座位資料
  minBuyIn?: string;     // 最小買入金額
  maxBuyIn?: string;      // 最大買入金額
  sitDownButton?: boolean; // 是否顯示坐下按鈕
  seatButton?:number;     //按鈕位
  tableStatus?: string; // 牌桌狀態
  myNumber?: number; // 玩家座位號碼
  canDoAction?: string[]; // 可以做的動作
  showHoleCardsButton?: boolean; // 是否顯示手牌
  potAmountBox?: string; // 底池籌碼
  potCollectBox?: string; // 下注池籌碼
  potSideBox?: Record<number,string>; // 邊池籌碼
  potWinner?: Record<number, any>; // 獲勝者
  betSwitch?: boolean;
  publicCard?: string[]; // 公共牌
  call?: string; // 跟注金額
  mainRaise?: string; // 自己最小加注、下注
  maxRaise?: string; // 自己最大加注、下注
  playHand?: string; // 牌局進度
  myHandCard?: string[]; // 玩家手牌
  allChipAdditionBox?: { [key: string]: any }[]; // 總籌碼數量
  seatTime?:{seatNumber:number;timeLimit:number}; //時間倒數

  mySeatList?: { [key: string]: any }; // 玩家座位列表
}>();

// 牌桌數據
const mockTableData = {
  maxPlayers: props.maxPlayers,
  currentPlayers: props.currentPlayers || [],
  tableId: props.tableId || 'table-1',
  tournamentId:props.tournamentId || '',
  tableName: props.tableName || 'Poker Table',
  minBet: props.minBuyIn || '600',
  maxBet: props.maxBuyIn || '1000',
  sitDownButton: props.sitDownButton || false,
};

const emit = defineEmits(['current-active-scene', 'game-state-update']);

// 安全地初始化 gameStateManager
function safelyUpdateGameState() {
  try {
    // 桌子資料確保有值時才更新
    const tableData = {
      maxPlayers: props.maxPlayers !== undefined ? props.maxPlayers : mockTableData.maxPlayers,
      currentPlayers: props.currentPlayers || mockTableData.currentPlayers,
      allSeats: props.allSeats || {},
      handId: props.gameId || '', // 新增牌局ID
      tableId: props.tableId || mockTableData.tableId,
      groupId: props.groupId || '', // 新增玩家組ID
      tournamentId: props.tournamentId || '',
      tableName: props.tableName || mockTableData.tableName,
      tableType: props.tableType || "regular", // 新增牌桌類型
      mainBuyIn: props.minBuyIn || mockTableData.minBet,
      maxBuyIn: props.maxBuyIn || mockTableData.maxBet,
      sitDownButton: props.sitDownButton !== undefined ? props.sitDownButton : mockTableData.sitDownButton,
      tableStatus: props.tableStatus, // 新增牌桌狀態
      playHand: props.playHand, // 新增牌局進度
      myNumber: props.myNumber, // 新增玩家座位號碼
      showHoleCardsButton: props.showHoleCardsButton, // 我能否顯示手牌
      seatButton: props.seatButton, // 新增按鈕位
      seatTime:props.seatTime, //新增時間倒數

      canDoAction: processActions(props.canDoAction || []), // 新增可以做的動作
      call: props.call, // 新增跟注金額
      mainRaise: props.mainRaise, // 新增自己最小加注、下注
      maxRaise: props.maxRaise, // 新增自己最大加注、下注
      myHandCard: props.myHandCard, // 新增自己的手牌
      allChipAdditionBox: props.allChipAdditionBox, // 新增玩家的籌碼%數值

      potAmountBox: props.potAmountBox, // 新增底池總籌碼數量
      potCollectBox: props.potCollectBox, // 新增下注池籌碼數量
      potSideBox: props.potSideBox, // 新增邊池籌碼數量
      potWinner: props.potWinner, // 新增獲勝者與對應籌碼
      publicCard: props.publicCard, // 新增公共牌
      betSwitch:props.betSwitch,
      mySeatList: props.mySeatList || {}, // 新增玩家座位列表
    };

    // if (props.mySeatList && props.tableId && props.mySeatList[props.tableId]) {
    //   console.log('玩家目前座位列表:', props.mySeatList);
    // }

    // const key = props.tableId || '';

    // if (!props.mySeatList || !props.mySeatList[key]) {
    //   console.log('沒有玩家座位列表~~~~~~~~~~~~~~~~~~');
    // }

    //如果有目前牌桌資料，刪除多餘的資料
    if (tableData.mySeatList) {

      const cleanedSeatList = { ...props.mySeatList };

      if ('undefined' in cleanedSeatList) {
        delete cleanedSeatList['undefined'];
      }
      tableData.mySeatList = cleanedSeatList;
    }
    
    // console.log('更新牌桌狀態:', tableData);
    gameStateManager.updateTableState(tableData);
    
    if (props.gameId) {
      gameStateManager.setHandId(props.gameId);
    }
  } catch (error) {
    console.error('更新遊戲狀態時出錯:', error);
  }
}

// 監聽 props 變化
watch(() => props, (newProps) => {

  // 使用 nextTick 確保在 DOM 更新後再更新遊戲狀態
  nextTick(() => {
    // console.log('props 變化:', newProps);
    safelyUpdateGameState();

    if (newProps.currentPlayers) {
      gameStateManager.updateTableState(gameState.value);
    }
  });

}, { immediate: true , deep: true});

// 更新遊戲狀態的方法 - 由父組件調用
const updateGameState = (state: GameState) => {
  try {
    gameState.value = state;
    EventBus.emit('game-state-updated', state);
  } catch (error) {
    console.error('更新遊戲狀態時出錯:', error);
  }
};

// 更新牌桌狀態的方法 - 由父組件調用
const updateTableState = (state: any) => {
  try {
    gameStateManager.updateTableState(state);
  } catch (error) {
    console.error('更新牌桌狀態時出錯:', error);
  }
};

// 移除所有事件監聽器
const removeAllEventListeners = () => {
  try {
    // 移除 EventBus 上的所有事件監聽器
    EventBus.off('current-scene-ready');
    EventBus.off('game-state-updated');
    EventBus.off('table-state-updated');
    
    // 從 gameStateManager 中移除事件監聽器
    if (gameStateManager && typeof gameStateManager.clearEventListeners === 'function') {
      gameStateManager.clearEventListeners();
    }
    
    console.log('所有事件監聽器已移除');
  } catch (error) {
    console.error('移除事件監聽器時出錯:', error);
  }
};

// 在 PhaserGame.vue 中添加 destroyGame 方法
const destroyGame = () => {
  if (game.value) {
    try {
      removeAllEventListeners();
      // 停止所有場景
      game.value.scene.scenes.forEach(scene => {
        if (scene.scene && typeof scene.scene.isActive === 'function' && scene.scene.isActive()) {
          scene.scene.stop();
        }
      });

      // 銷毀遊戲實例
      game.value.destroy(true);
      
      // 正確地將 game.value 設置為 undefined (而不是 null)
      game.value = undefined;
      
      console.log('遊戲已成功銷毀');
    } catch (error) {
      console.error('銷毀遊戲時出錯:', error);
    }
  }
};

// 暴露方法和屬性給父組件
defineExpose({ 
  scene, 
  game,
  gameState,
  updateGameState,
  updateTableState,
  destroyGame,
  // 提供遊戲操作方法
  sendPlayerAction: (action: any) => {
    return gameStateManager.sendPlayerAction(action);
  },
});

// 處理動作的函數
function processActions(actions: string[]): string[] {
  // 如果第一個動作是 "blind_bet"，回傳空陣列
  if (actions[0] === "blind_bet") {
    return [];
  }

  // 過濾掉 "blind_bet" 和 "all-in"
  const filteredActions = actions.filter(action => action !== "blind_bet");

  // 檢查是否包含 ALL-IN
  const hasAllIn = filteredActions.includes("all-in");
  const hasBetRaiseCheckCall = ["bet", "raise"].some(action => filteredActions.includes(action));

  // 預設順序
  let sortedActions: string[] = [];

  // 保證 "fold"（棄牌）永遠在前面
  if (filteredActions.includes("fold")) {
    sortedActions.push("fold");
  }

  // 加入 "call" 或 "check"（只會有其一，放第二位）
  if (filteredActions.includes("call")) {
    sortedActions.push("call");
  } else if (filteredActions.includes("check")) {
    sortedActions.push("check");
  }

  // 加入 "bet" 或 "raise"（只會有其一，放最後面）
  if (filteredActions.includes("bet")) {
    sortedActions.push("bet");
  } else if (filteredActions.includes("raise")) {
    sortedActions.push("raise");
  }

  // 如果有 ALL-IN，且沒有 bet、raise、check、call，則加入 "all-in"
  if (hasAllIn && !hasBetRaiseCheckCall) {
    sortedActions.push("all-in");
  }

  return sortedActions;
}


onMounted(() => {
  // 初始化 Phaser 遊戲
  const container = document.getElementById('game-container');

  if (container) {
    container.innerHTML = '';
  }

  // 然後創建遊戲
  game.value = StartGame('game-container');
    
  // 監聽場景準備好的事件
  EventBus.on('current-scene-ready', (scene_instance: Phaser.Scene) => {
    emit('current-active-scene', scene_instance);
    scene.value = scene_instance;

    // console.log('場景準備好了:', scene.value);

    // 在場景準備好後，安全地更新遊戲狀態
    nextTick(() => {
      // 先初始化 gameStateManager
      safelyUpdateGameState();
    });
    
    // 如果場景已經準備好，確保它有最新的牌桌數據
    if (props.maxPlayers !== undefined) {
      gameStateManager.updateTableState({
        maxPlayers: props.maxPlayers,
        currentPlayers: props.currentPlayers || [],
        tableId: props.tableId
      });
    }
  });

  // 監聽遊戲狀態更新 - 現在由父組件傳入
  EventBus.on('game-state-updated', (state: GameState) => {
    gameState.value = state;
    // 將遊戲狀態傳遞給Phaser場景
    if (scene.value && 'updateGameState' in scene.value) {
      (scene.value as any).updateGameState(state);
    }
    emit('game-state-update', state);
  });
});

onUnmounted(() => {
  // 清理遊戲實例
  destroyGame();
  
  // 移除事件監聽
  EventBus.off('current-scene-ready');
  EventBus.off('game-state-updated');
});

</script>

<template>
  <div class="phaser-game-container">
    <div id="game-container"></div>
    <!-- 可以添加遊戲控制UI -->
    <!-- <div v-if="props.sitDownButton === false" class="game-controls">
      <div class="game-phase">{{ props.tableStatus }}</div>
    </div> -->
  </div>
</template>

<style scoped>
.phaser-game-container {
  position: relative;
  width: 100%;
  height: 100%;
}

#game-container {
  width: 100%;
  height: 100%;
}

.game-controls {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
}

.game-phase {
  color: white;
  font-weight: bold;
  padding: 5px 10px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
}
</style>