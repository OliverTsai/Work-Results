<template>
  <div class="websocket-tester">
    <h2>WebSocket 測試工具</h2>
    
    <div class="connection-controls">
      <div class="status" :class="{ connected: isConnected }">
        狀態: {{ isConnected ? '已連接' : '未連接' }}
      </div>
      <button @click="connectWebSocket" :disabled="isConnected">連接 WebSocket</button>
      <button @click="disconnectWebSocket" :disabled="!isConnected">斷開 WebSocket</button>
    </div>
    
    <div class="test-section">
      <h3>牌桌狀態測試</h3>
      <div class="button-group">
        <button @click="sendTableState('waiting')">等待狀態</button>
        <button @click="sendTableState('preflop')">翻牌前</button>
        <button @click="sendTableState('flop')">翻牌</button>
        <button @click="sendTableState('turn')">轉牌</button>
        <button @click="sendTableState('river')">河牌</button>
        <button @click="sendTableState('showdown')">攤牌</button>
      </div>
    </div>
    
    <div class="test-section">
      <h3>玩家動作測試</h3>
      <div class="button-group">
        <button @click="sendPlayerAction('fold')">棄牌</button>
        <button @click="sendPlayerAction('check')">過牌</button>
        <button @click="sendPlayerAction('call')">跟注</button>
        <button @click="sendPlayerAction('raise')">加注</button>
        <button @click="sendPlayerAction('allIn')">全下</button>
      </div>
    </div>
    
    <div class="test-section">
      <h3>特殊事件測試</h3>
      <div class="button-group">
        <button @click="sendSpecialEvent('playerJoined')">玩家加入</button>
        <button @click="sendSpecialEvent('playerLeft')">玩家離開</button>
        <button @click="sendSpecialEvent('handCompleted')">牌局結束</button>
        <button @click="sendSpecialEvent('tableShutdown')">牌桌關閉</button>
      </div>
    </div>
    
    <div class="test-section">
      <h3>錯誤測試</h3>
      <div class="button-group">
        <button @click="sendErrorEvent('authError')">認證錯誤</button>
        <button @click="sendErrorEvent('actionError')">動作錯誤</button>
        <button @click="sendErrorEvent('connectionError')">連接錯誤</button>
      </div>
    </div>
    
    <div class="log-section">
      <h3>事件日誌</h3>
      <div class="log-container">
        <div v-for="(log, index) in eventLogs" :key="index" class="log-entry" :class="log.type">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-type">[{{ log.type }}]</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
      <button @click="clearLogs" class="clear-button">清除日誌</button>
    </div>
  </div>
</template>

<script>
import { EventBus } from '../game/EventBus'
import { wsApi } from '../composables/useApi'
import { ref, onMounted, onUnmounted } from 'vue'

// 模擬不同遊戲階段的數據
const mockGameStates = {
  // 等待開始階段
  waiting: {
    tableId: 'table-123',
    maxPlayers: 8,
    currentPlayers: [
      { id: 'player1', name: '玩家1', chips: 1000, position: 1, isActive: true },
      { id: 'player2', name: '玩家2', chips: 1500, position: 3, isActive: true }
    ],
    minBuyIn: '600',
    maxBuyIn: '2000',
    gamePhase: 'waiting',
    canDoAction: []
  },
  
  // 翻牌前階段
  preflop: {
    tableId: 'table-123',
    handId: 'hand-456',
    maxPlayers: 8,
    currentPlayers: [
      { id: 'player1', name: '玩家1', chips: 900, position: 1, isActive: true, bet: 100 },
      { id: 'player2', name: '玩家2', chips: 1400, position: 3, isActive: true, bet: 100 }
    ],
    minBuyIn: '600',
    maxBuyIn: '2000',
    gamePhase: 'preflop',
    potAmountBox: '200',
    myHandCard: [
      { id: 'mycard1', suit: 'hearts', value: 'A', isVisible: true },
      { id: 'mycard2', suit: 'hearts', value: 'K', isVisible: true }
    ],
    publicCard: [],
    canDoAction: ['fold', 'check', 'raise'],
    call: '0',
    mainRaise: '100',
    maxRaise: '900'
  },
  
  // 翻牌階段
  flop: {
    tableId: 'table-123',
    handId: 'hand-456',
    maxPlayers: 8,
    currentPlayers: [
      { id: 'player1', name: '玩家1', chips: 900, position: 1, isActive: true, bet: 0 },
      { id: 'player2', name: '玩家2', chips: 1400, position: 3, isActive: true, bet: 0 }
    ],
    minBuyIn: '600',
    maxBuyIn: '2000',
    gamePhase: 'flop',
    potAmountBox: '200',
    myHandCard: [
      { id: 'mycard1', suit: 'hearts', value: 'A', isVisible: true },
      { id: 'mycard2', suit: 'hearts', value: 'K', isVisible: true }
    ],
    publicCard: [
      { id: 'card1', suit: 'hearts', value: 'Q', isVisible: true },
      { id: 'card2', suit: 'hearts', value: 'J', isVisible: true },
      { id: 'card3', suit: 'hearts', value: '10', isVisible: true }
    ],
    canDoAction: ['fold', 'check', 'raise'],
    call: '0',
    mainRaise: '100',
    maxRaise: '900'
  },
  
  // 轉牌階段
  turn: {
    tableId: 'table-123',
    handId: 'hand-456',
    maxPlayers: 8,
    currentPlayers: [
      { id: 'player1', name: '玩家1', chips: 700, position: 1, isActive: true, bet: 200 },
      { id: 'player2', name: '玩家2', chips: 1200, position: 3, isActive: true, bet: 200 }
    ],
    minBuyIn: '600',
    maxBuyIn: '2000',
    gamePhase: 'turn',
    potAmountBox: '600',
    myHandCard: [
      { id: 'mycard1', suit: 'hearts', value: 'A', isVisible: true },
      { id: 'mycard2', suit: 'hearts', value: 'K', isVisible: true }
    ],
    publicCard: [
      { id: 'card1', suit: 'hearts', value: 'Q', isVisible: true },
      { id: 'card2', suit: 'hearts', value: 'J', isVisible: true },
      { id: 'card3', suit: 'hearts', value: '10', isVisible: true },
      { id: 'card4', suit: 'diamonds', value: '9', isVisible: true }
    ],
    canDoAction: ['fold', 'check', 'raise'],
    call: '0',
    mainRaise: '100',
    maxRaise: '700'
  },
  
  // 河牌階段
  river: {
    tableId: 'table-123',
    handId: 'hand-456',
    maxPlayers: 8,
    currentPlayers: [
      { id: 'player1', name: '玩家1', chips: 500, position: 1, isActive: true, bet: 200 },
      { id: 'player2', name: '玩家2', chips: 1000, position: 3, isActive: true, bet: 200 }
    ],
    minBuyIn: '600',
    maxBuyIn: '2000',
    gamePhase: 'river',
    potAmountBox: '1000',
    myHandCard: [
      { id: 'mycard1', suit: 'hearts', value: 'A', isVisible: true },
      { id: 'mycard2', suit: 'hearts', value: 'K', isVisible: true }
    ],
    publicCard: [
      { id: 'card1', suit: 'hearts', value: 'Q', isVisible: true },
      { id: 'card2', suit: 'hearts', value: 'J', isVisible: true },
      { id: 'card3', suit: 'hearts', value: '10', isVisible: true },
      { id: 'card4', suit: 'diamonds', value: '9', isVisible: true },
      { id: 'card5', suit: 'clubs', value: '8', isVisible: true }
    ],
    canDoAction: ['fold', 'check', 'raise'],
    call: '0',
    mainRaise: '100',
    maxRaise: '500'
  },
  
  // 攤牌階段
  showdown: {
    tableId: 'table-123',
    handId: 'hand-456',
    maxPlayers: 8,
    currentPlayers: [
      { id: 'player1', name: '玩家1', chips: 1500, position: 1, isActive: true, bet: 0 },
      { id: 'player2', name: '玩家2', chips: 1000, position: 3, isActive: true, bet: 0 }
    ],
    minBuyIn: '600',
    maxBuyIn: '2000',
    gamePhase: 'showdown',
    potAmountBox: '0',
    myHandCard: [
      { id: 'mycard1', suit: 'hearts', value: 'A', isVisible: true },
      { id: 'mycard2', suit: 'hearts', value: 'K', isVisible: true }
    ],
    publicCard: [
      { id: 'card1', suit: 'hearts', value: 'Q', isVisible: true },
      { id: 'card2', suit: 'hearts', value: 'J', isVisible: true },
      { id: 'card3', suit: 'hearts', value: '10', isVisible: true },
      { id: 'card4', suit: 'diamonds', value: '9', isVisible: true },
      { id: 'card5', suit: 'clubs', value: '8', isVisible: true }
    ],
    canDoAction: [],
    potWinner: {
      winners: [
        { name: '玩家1', seatNumber: 1 }
      ],
      amount: '1000'
    }
  }
}

// 模擬玩家動作
const mockPlayerActions = {
  fold: { 
    action: 'fold', 
    playerId: 'player1', 
    tableId: 'table-123', 
    handId: 'hand-456' 
  },
  check: { 
    action: 'check', 
    playerId: 'player1', 
    tableId: 'table-123', 
    handId: 'hand-456' 
  },
  call: { 
    action: 'call', 
    playerId: 'player1', 
    tableId: 'table-123', 
    handId: 'hand-456',
    amount: '100' 
  },
  raise: { 
    action: 'raise', 
    playerId: 'player1', 
    tableId: 'table-123', 
    handId: 'hand-456',
    amount: '200' 
  },
  allIn: { 
    action: 'all_in', 
    playerId: 'player1', 
    tableId: 'table-123', 
    handId: 'hand-456',
    amount: '900' 
  }
}

// 模擬特殊事件
const mockSpecialEvents = {
  playerJoined: {
    event: 'player-joined',
    data: {
      playerId: 'player3',
      name: '新玩家',
      chips: 1200,
      position: 5,
      isActive: true
    }
  },
  playerLeft: {
    event: 'player-left',
    data: {
      playerId: 'player2',
      position: 3
    }
  },
  handCompleted: {
    event: 'hand-completed',
    data: {
      handId: 'hand-456',
      winners: [
        { playerId: 'player1', amount: '1000', hand: 'Royal Flush' }
      ]
    }
  },
  tableShutdown: {
    event: 'table-shutdown',
    data: {
      tableId: 'table-123',
      reason: '牌桌維護'
    }
  }
}

// 模擬錯誤事件
const mockErrorEvents = {
  authError: {
    event: 'error',
    data: {
      code: 401,
      message: '認證失敗，請重新登入'
    }
  },
  actionError: {
    event: 'error',
    data: {
      code: 400,
      message: '無效的操作，不是您的回合'
    }
  },
  connectionError: {
    event: 'error',
    data: {
      code: 500,
      message: '連接服務器失敗，請稍後再試'
    }
  }
}

export default {
  name: 'WebSocketTester',
  
  setup() {
    const isConnected = ref(false)
    const eventLogs = ref([])
    
    // 記錄事件日誌
    const logEvent = (type, message) => {
      const time = new Date().toLocaleTimeString()
      eventLogs.value.unshift({ type, message, time })
      
      // 限制日誌數量
      if (eventLogs.value.length > 100) {
        eventLogs.value.pop()
      }
    }
    
    // 清除日誌
    const clearLogs = () => {
      eventLogs.value = []
    }
    
    // 連接 WebSocket
    const connectWebSocket = () => {
      try {
        isConnected.value = true
        logEvent('info', '已連接到模擬 WebSocket')
      } catch (error) {
        logEvent('error', `連接失敗: ${error.message}`)
      }
    }
    
    // 斷開 WebSocket
    const disconnectWebSocket = () => {
      isConnected.value = false
      logEvent('info', '已斷開 WebSocket 連接')
    }
    
    // 發送牌桌狀態
    const sendTableState = (phase) => {
      if (!isConnected.value) {
        logEvent('warning', '未連接 WebSocket，無法發送數據')
        return
      }
      
      const state = mockGameStates[phase]
      if (state) {
        // 使用 EventBus 發送事件
        EventBus.emit('table-state-updated', state)
        logEvent('sent', `發送牌桌狀態: ${phase}`)
        
        // 同時更新 gameStateManager 的狀態
        if (window.gameStateManager) {
          window.gameStateManager.updateTableState(state)
        }
      }
    }
    
    // 發送玩家動作
    const sendPlayerAction = (action) => {
      if (!isConnected.value) {
        logEvent('warning', '未連接 WebSocket，無法發送數據')
        return
      }
      
      const actionData = mockPlayerActions[action]
      if (actionData) {
        // 使用 EventBus 發送事件
        EventBus.emit('player-action', actionData)
        logEvent('sent', `發送玩家動作: ${action}`)
      }
    }
    
    // 發送特殊事件
    const sendSpecialEvent = (eventType) => {
      if (!isConnected.value) {
        logEvent('warning', '未連接 WebSocket，無法發送數據')
        return
      }
      
      const eventData = mockSpecialEvents[eventType]
      if (eventData) {
        // 使用 EventBus 發送事件
        EventBus.emit(eventData.event, eventData.data)
        logEvent('sent', `發送特殊事件: ${eventType}`)
      }
    }
    
    // 發送錯誤事件
    const sendErrorEvent = (errorType) => {
      if (!isConnected.value) {
        logEvent('warning', '未連接 WebSocket，無法發送數據')
        return
      }
      
      const errorData = mockErrorEvents[errorType]
      if (errorData) {
        // 使用 EventBus 發送事件
        EventBus.emit(errorData.event, errorData.data)
        logEvent('sent', `發送錯誤事件: ${errorType}`)
      }
    }
    
    // 監聽 EventBus 事件，記錄日誌
    const setupEventListeners = () => {
      EventBus.on('table-state-updated', (data) => {
        logEvent('received', '接收到牌桌狀態更新')
      })
      
      EventBus.on('player-action', (data) => {
        logEvent('received', `接收到玩家動作: ${data.action}`)
      })
      
      EventBus.on('error', (data) => {
        logEvent('error', `接收到錯誤: ${data.message}`)
      })
      
      // 添加其他事件監聽
    }
    
    // 清理事件監聽
    const cleanupEventListeners = () => {
      EventBus.off('table-state-updated')
      EventBus.off('player-action')
      EventBus.off('error')
      // 清理其他事件監聽
    }
    
    onMounted(() => {
      setupEventListeners()
    })
    
    onUnmounted(() => {
      cleanupEventListeners()
      if (isConnected.value) {
        disconnectWebSocket()
      }
    })
    
    return {
      isConnected,
      eventLogs,
      connectWebSocket,
      disconnectWebSocket,
      sendTableState,
      sendPlayerAction,
      sendSpecialEvent,
      sendErrorEvent,
      clearLogs
    }
  }
}
</script>

<style scoped>
.websocket-tester {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h2, h3 {
  color: #333;
}

.connection-controls {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.status {
  padding: 8px 12px;
  border-radius: 4px;
  background-color: #f44336;
  color: white;
  margin-right: 10px;
}

.status.connected {
  background-color: #4CAF50;
}

button {
  padding: 8px 12px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  background-color: #2196F3;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0b7dda;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.test-section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
}

.log-section {
  margin-top: 30px;
}

.log-container {
  height: 100px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  background-color: #f9f9f9;
}

.log-entry {
  padding: 5px;
  border-bottom: 1px solid #eee;
  font-family: monospace;
}

.log-time {
  color: #888;
  margin-right: 10px;
}

.log-type {
  font-weight: bold;
  margin-right: 10px;
}

.log-entry.info .log-type {
  color: #2196F3;
}

.log-entry.sent .log-type {
  color: #4CAF50;
}

.log-entry.received .log-type {
  color: #9C27B0;
}

.log-entry.warning .log-type {
  color: #FF9800;
}

.log-entry.error .log-type {
  color: #f44336;
}

.clear-button {
  margin-top: 10px;
  background-color: #f44336;
}

.clear-button:hover {
  background-color: #d32f2f;
}
</style>