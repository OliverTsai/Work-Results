import { defineStore } from "pinia";
import { ref,computed, onUnmounted,onMounted } from "vue";
import { wsApi } from "@/composables/useApi";
import { useTableStore } from "@/store/tableStore";
import { useRouter, useRoute } from "vue-router";

// 定義消息類型
interface WebSocketMessage {
  event: string;
  type?: string;
  user_token?: string;
  table_id?: string;
  [key: string]: any; // 允許其他屬性
}

// 定義 WebSocket 事件數據類型
interface WebSocketEventData {
  event: string;
  [key: string]: any; // 允許其他屬性
}

export const useWebSocketStore = defineStore("websocket", () => {
  const ws = ref<WebSocket | null>(null);  // WebSocket 連線物件
  const messages = ref<WebSocketEventData | null>(null);  // 存儲最新訊息
  const isConnected = ref<boolean>(false);  // 是否已連接
  let reconnectAttempts = 0; // 追蹤重試次數
  const maxReconnectAttempts = 5; // 最大重連次數
  const reconnectTimeout = ref<number | null>(null); // 記錄重連的 timeout
  const isSubscribing = ref<boolean>(false); // 是否正在訂閱中，避免重複訂閱
  const networkOnline = ref<boolean>(true); // 網路連線狀態
  const heartbeatInterval = ref<number | null>(null); // 心跳檢測間隔
  const lastUserToken = ref<string>(''); // 存儲最後一次使用的用戶令牌，用於重連後重新訂閱
  const heartbeatTimeout = ref<number | null>(null); // 心跳回應超時計時器
  const heartbeatResponseReceived = ref<boolean>(false); // 是否收到心跳回應

  const tableStore = useTableStore();
  const tableId = computed(() => tableStore.currentTableId);
  const route = useRoute(); // 獲取當前路由
  

  // 使用環境變數獲取 WebSocket URL
  const url = wsApi('');

  // 判斷是否在遊戲桌頁面
  const isInGameTable = computed(() => {
    // 這裡根據您的路由結構進行判斷，假設遊戲桌頁面的路由路徑包含 '/game' 或 '/table'
    return route.path.includes('/game') || route.path.includes('/table');
  });

  /**
   * 建立 WebSocket 連線
   */
  function connect(): void {
    if (ws.value && ws.value.readyState !== WebSocket.CLOSED) {
      console.log("WebSocket 已經連接");
      return;
    }

    // 如果已經在嘗試連接中，則不再重複連接
    if (isSubscribing.value) {
      console.log("WebSocket 正在連接中...");
      return;
    }

    // 如果網路離線，則不嘗試連接
    if (!networkOnline.value) {
      console.log("網路離線，無法建立 WebSocket 連線");
      return;
    }

    isSubscribing.value = true;
    console.log("嘗試建立 WebSocket 連線...");
    
    try {
      ws.value = new WebSocket(url);

      ws.value.onopen = () => {
        console.log("WebSocket 連線成功 ✅");
        isConnected.value = true;
        reconnectAttempts = 0; // 連線成功時重置重試次數
        isSubscribing.value = false;

        // 連接成功後，如果有之前的用戶令牌，自動重新訂閱
        if (lastUserToken.value) {
          resubscribeToUser(lastUserToken.value);
        }

        //連接成功後，如果在遊戲頁面並且有桌子ID，自動重新訂閱
        if(isInGameTable && tableId.value){
          console.log("檢測到在遊戲桌頁面，自動訂閱桌子:", tableId.value);
          resubscribeToTablePlay(tableId.value);
        }
        
        // 啟動心跳檢測
        startHeartbeat();
      };

      ws.value.onmessage = (event: MessageEvent) => {
        try {
          const data: WebSocketEventData = JSON.parse(event.data);
          messages.value = data; // 存儲最新消息
          
          // 檢查是否是心跳回應
          if (data.event === "heartbeat" && data.status === "ok") {
            // console.log("收到心跳回應:", data);
            heartbeatResponseReceived.value = true;
            
            // 清除心跳超時計時器
            if (heartbeatTimeout.value !== null) {
              window.clearTimeout(heartbeatTimeout.value);
              heartbeatTimeout.value = null;
            }
          }
          
          // console.log("收到 WebSocket 消息:", data);
        } catch (error) {
          console.error("解析 WebSocket 訊息失敗:", error);
        }
      };

      ws.value.onclose = (event) => {
        console.log(`WebSocket 連線已關閉 ❌ 代碼: ${event.code}, 原因: ${event.reason}`);
        isConnected.value = false;
        isSubscribing.value = false;
        
        // 清除心跳超時計時器
        if (heartbeatTimeout.value !== null) {
          window.clearTimeout(heartbeatTimeout.value);
          heartbeatTimeout.value = null;
        }
        
        // 只有在非正常關閉時才嘗試重連
        if (event.code !== 1000 && event.code !== 1001 && networkOnline.value) {
          attemptReconnect(); // 觸發自動重連
        }
      };

      ws.value.onerror = (error: Event) => {
        console.error("WebSocket 錯誤:", error);
        isSubscribing.value = false;
        // 不在這裡關閉連線，讓 onclose 事件處理
      };
    } catch (error) {
      console.error("建立 WebSocket 連線失敗:", error);
      isSubscribing.value = false;
      if (networkOnline.value) {
        attemptReconnect();
      }
    }
  }

  /**
   * 重連機制
   */
  function attemptReconnect(): void {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.warn(`已達最大重連次數 (${maxReconnectAttempts})，停止重試`);
      return;
    }

    if (reconnectTimeout.value !== null) {
      window.clearTimeout(reconnectTimeout.value);
      reconnectTimeout.value = null;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // 退避機制 (1s, 2s, 4s, 最多 30s)
    reconnectAttempts++;
    console.log(`嘗試在 ${delay / 1000} 秒後重新連線... (第 ${reconnectAttempts} 次)`);

    // 使用 window.setTimeout 並明確類型
    reconnectTimeout.value = window.setTimeout(() => {
      if (!ws.value || ws.value.readyState === WebSocket.CLOSED || ws.value.readyState === WebSocket.CLOSING) {
        connect();
      }
    }, delay);
  }

  /**
   * 網路狀態變化處理
   */
  function handleNetworkChange(): void {
    networkOnline.value = navigator.onLine;
    
    if (networkOnline.value) {
      console.log("網路已恢復，嘗試重新連接 WebSocket");
      // 如果網路恢復且 WebSocket 未連接，則嘗試重新連接
      if (!isConnected.value && (!ws.value || ws.value.readyState === WebSocket.CLOSED)) {
        reconnectAttempts = 0; // 網路恢復時重置重試次數
        connect();
      }
    } else {
      console.log("網路已斷開，WebSocket 可能會斷開連接");
      // 網路斷開時不需要特別處理，WebSocket 會自動斷開並觸發 onclose 事件
    }
  }

  /**
   * 啟動心跳檢測
   */
  function startHeartbeat(): void {
    // 每 30 秒發送一次心跳檢測
    if (heartbeatInterval.value === null) {
      heartbeatInterval.value = window.setInterval(() => {
        checkConnection();
      }, 30000);
    }
  }

  /**
   * 停止心跳檢測
   */
  function stopHeartbeat(): void {
    if (heartbeatInterval.value !== null) {
      window.clearInterval(heartbeatInterval.value);
      heartbeatInterval.value = null;
    }
    
    if (heartbeatTimeout.value !== null) {
      window.clearTimeout(heartbeatTimeout.value);
      heartbeatTimeout.value = null;
    }
  }

  /**
   * 檢查連接狀態
   */
  function checkConnection(): void {
    // 如果網路在線但 WebSocket 未連接或已關閉，嘗試重新連接
    if (networkOnline.value && (!isConnected.value || !ws.value || ws.value.readyState === WebSocket.CLOSED)) {
      console.log("檢測到 WebSocket 未連接，嘗試重新連接");
      reconnectAttempts = 0; // 重置重試次數
      connect();
      return;
    }
    
    // 如果 WebSocket 處於已連接狀態，發送心跳包
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      // 重置心跳回應狀態
      heartbeatResponseReceived.value = false;
      
      const heartbeatMessage: WebSocketMessage = { event: "heartbeat" };
      try {
        ws.value.send(JSON.stringify(heartbeatMessage));
        // console.log("發送心跳包");
        
        // 設置心跳回應超時檢測
        if (heartbeatTimeout.value !== null) {
          window.clearTimeout(heartbeatTimeout.value);
        }
        
        // 如果 5 秒內沒有收到回應，則認為連接已斷開
        heartbeatTimeout.value = window.setTimeout(() => {
          if (!heartbeatResponseReceived.value) {
            console.warn("心跳包無回應，連接可能已斷開，嘗試重新連接");
            isConnected.value = false;
            
            // 強制關閉當前連接
            if (ws.value) {
              try {
                ws.value.close();
              } catch (error) {
                console.error("關閉失效的 WebSocket 連接時出錯:", error);
              }
              ws.value = null;
            }
            
            // 嘗試重新連接
            reconnectAttempts = 0; // 重置重試次數
            connect();
          }
        }, 5000);
        
      } catch (error) {
        console.error("發送心跳包失敗:", error);
        // 如果發送失敗，可能連接已經斷開但狀態未更新，嘗試重新連接
        isConnected.value = false;
        attemptReconnect();
      }
    }
  }

  /**
   * 發送訊息
   * @param message - 要發送的消息對象
   */
  function sendMessage(message: WebSocketMessage): void {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket 未連線，無法發送訊息");
      // 如果未連線，先嘗試連線
      if (!isConnected.value) {
        connect();
      }
    }
  }

  /**
   * 關閉 WebSocket 連線
   */
  function disconnect(): void {
    if (ws.value) {
      if (reconnectTimeout.value !== null) {
        window.clearTimeout(reconnectTimeout.value);
        reconnectTimeout.value = null;
      }

      // 停止心跳檢測
      stopHeartbeat();
      
      // 正常關閉連線，使用代碼 1000
      ws.value.close(1000, "用戶主動關閉連線");
      reconnectAttempts = 0; // 重置重試次數
      ws.value = null;
      isConnected.value = false;
    }
  }

    /**
   * 強制重新連接
   */
  function forceReconnect(): void {
    console.log("強制重新連接 WebSocket");
    // 先斷開現有連接
    if (ws.value) {
      ws.value.close(1000, "強制重新連接");
      ws.value = null;
    }
    
    isConnected.value = false;
    reconnectAttempts = 0; // 重置重試次數
    
    // 然後嘗試重新連接
    if (networkOnline.value) {
      connect();
    }
  }

  // 當組件卸載時，關閉 WebSocket 連線（可選）
  onUnmounted(() => {
    if (reconnectTimeout.value !== null) {
      window.clearTimeout(reconnectTimeout.value);
      reconnectTimeout.value = null;
    }

    // 移除網路狀態事件監聽器
    window.removeEventListener('online', handleNetworkChange);
    window.removeEventListener('offline', handleNetworkChange);

    // 停止心跳檢測
    stopHeartbeat();

    disconnect();
  });

  // 當組件掛載時，添加網路狀態事件監聽器
  onMounted(() => {
    // 初始化網路狀態
    networkOnline.value = navigator.onLine;
    
    // 添加網路狀態事件監聽器
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
  });

  // ========== 用戶訂閱控制 ==========
  /**
   * 訂閱用戶
   * @param token - 用戶令牌
   */
  function subscribeToUser(token: string): void {
    if (!token) {
      console.log("請輸入有效的使用者 Token!", "error");
      return;
    }

    // 確保 WebSocket 已連線
    if (!isConnected.value) {
      connect();
      // 等待連線成功後再訂閱
      const checkInterval = setInterval(() => {
        if (isConnected.value) {
          clearInterval(checkInterval);
          const message: WebSocketMessage = { event: "subscribe", type: "user", user_token: token };
          sendMessage(message);
        }
      }, 100);
      return;
    }
    const message: WebSocketMessage = { event: "subscribe", type: "user", user_token: token };
    sendMessage(message);
  }

  /**
   * 取消訂閱用戶
   * @param token - 用戶令牌
   */
  function unsubscribeFromUser(token: string): void {
    if (!token) return;

    // 清除存儲的用戶令牌
    if (lastUserToken.value === token) {
      lastUserToken.value = '';
    }

    if (isConnected.value) {
      const message: WebSocketMessage = { event: "unsubscribe", type: "user", user_token: token };
      sendMessage(message);
    }
  }

  /**
   * 重新訂閱用戶
   * @param token - 用戶令牌
   */
  function resubscribeToUser(token: string): void {
    if (!token) return;

    // 存儲用戶令牌，用於網路恢復時重新訂閱
    lastUserToken.value = token;

    // 確保 WebSocket 已連線
    if (!isConnected.value) {
      connect();
      // 等待連線成功後再訂閱
      const checkInterval = setInterval(() => {
        if (isConnected.value) {
          clearInterval(checkInterval);
          const message: WebSocketMessage = { event: "resubscribe", type: "user", user_token: token };
          sendMessage(message);
          console.log('身分訂閱成功');
        }
      }, 100);
      return;
    }

    const message: WebSocketMessage = { event: "resubscribe", type: "user", user_token: token };
    sendMessage(message);
    console.log('身分訂閱成功');
  }

  // ========== 聊天室訂閱控制 ==========
  /**
   * 聊天室訂閱
   * @param token - 用戶令牌
   */
  function subscribeChat(token: string, msg_types:string): void {
    if (!token) {
      console.log("請輸入有效的使用者 Token!", "error");
      return;
    }

    // 確保 WebSocket 已連線
    if (!isConnected.value) {
      connect();
      // 等待連線成功後再訂閱
      const checkInterval = setInterval(() => {
        if (isConnected.value) {
          clearInterval(checkInterval);
          const message: WebSocketMessage = { event: "subscribe", type: "chat", user_token: token, msg_types:msg_types };
          sendMessage(message);
        }
      }, 100);
      return;
    }
    const message: WebSocketMessage = { event: "subscribe", type: "chat", user_token: token, msg_types:msg_types };
    sendMessage(message);
  }

  /**
   * 取消訂閱聊天室
   * @param token - 用戶令牌
   */
  function unsubscribeChat(token: string, msg_types:string): void {
    if (!token) return;

    if (isConnected.value) {
      const message: WebSocketMessage = { event: "unsubscribe", type: "chat", user_token: token, msg_types:msg_types };
      sendMessage(message);
    }
  }

  /**
   * 重新訂閱聊天室
   * @param token - 用戶令牌
   */
  function resubscribeChat(token: string, msg_types:string): void {
    if (!token) return;

    // 確保 WebSocket 已連線
    if (!isConnected.value) {
      connect();
      // 等待連線成功後再訂閱
      const checkInterval = setInterval(() => {
        if (isConnected.value) {
          clearInterval(checkInterval);
          const message: WebSocketMessage = { event: "resubscribe", type: "chat", user_token: token, msg_types:msg_types };
          sendMessage(message);
          console.log('聊天室訂閱成功');
        }
      }, 100);
      return;
    }

    const message: WebSocketMessage = { event: "resubscribe", type: "chat", user_token: token, msg_types:msg_types };
    sendMessage(message);
    console.log('聊天室訂閱成功');
  }

  // ========== 桌子顯示訂閱控制 ==========
  /**
   * 訂閱桌子顯示
   * @param tableId - 桌子ID
   */
  function subscribeToTableShow(tableId: string): void {
    if (!tableId) {
      console.log("請輸入有效的桌子 ID!", "error");
      return;
    }

    // 確保 WebSocket 已連線
    if (!isConnected.value) {
      connect();
      // 等待連線成功後再訂閱
      const checkInterval = setInterval(() => {
        if (isConnected.value) {
          clearInterval(checkInterval);
          const message: WebSocketMessage = { event: "subscribe", type: "table_show", table_id: tableId };
          sendMessage(message);
        }
      }, 100);
      return;
    }

    const message: WebSocketMessage = { event: "subscribe", type: "table_show", table_id: tableId };
    sendMessage(message);
  }

  /**
   * 取消訂閱桌子顯示
   * @param tableId - 桌子ID
   */
  function unsubscribeFromTableShow(tableId: string): void {
    if (!tableId) return;

    if (isConnected.value) {
      const message: WebSocketMessage = { event: "unsubscribe", type: "table_show", table_id: tableId };
      sendMessage(message);
    }
  }

  /**
   * 重新訂閱桌子顯示
   * @param tableId - 桌子ID
   */
  function resubscribeToTableShow(tableId: string): void {
    if (!tableId) return;

    // 確保 WebSocket 已連線
    if (!isConnected.value) {
      connect();
      // 等待連線成功後再訂閱
      const checkInterval = setInterval(() => {
        if (isConnected.value) {
          clearInterval(checkInterval);
          const message: WebSocketMessage = { event: "resubscribe", type: "table_show", table_id: tableId };
          sendMessage(message);
        }
      }, 100);
      return;
    }

    const message: WebSocketMessage = { event: "resubscribe", type: "table_show", table_id: tableId };
    sendMessage(message);
  }

  // ========== 錦標賽顯示訂閱控制 ==========
  /**
   * 訂閱錦標賽顯示
   * @param tournamentId - 錦標賽ID
   */
  function subscribeToTournamentShow(tournamentId: string): void {
    if (!tournamentId) {
      console.log("請輸入有效的錦標賽 ID!", "error");
      return;
    }

    // 確保 WebSocket 已連線
    if (!isConnected.value) {
      connect();
      // 等待連線成功後再訂閱
      const checkInterval = setInterval(() => {
        if (isConnected.value) {
          clearInterval(checkInterval);
          const message: WebSocketMessage = { event: "subscribe", type: "tournament", tournament_ids: tournamentId };
          sendMessage(message);
        }
      }, 100);
      return;
    }

    const message: WebSocketMessage = { event: "subscribe", type: "tournament", tournament_ids: tournamentId };
    sendMessage(message);
  }

  /**
   * 取消訂閱錦標賽顯示
   * @param tournamentId - 錦標賽ID
   */
  function unsubscribeFromTournamentShow(tournamentId: string): void {
    if (!tournamentId) return;

    if (isConnected.value) {
      const message: WebSocketMessage = { event: "unsubscribe", type: "tournament", tournament_ids: tournamentId };
      sendMessage(message);
    }
  }

  /**
   * 重新訂閱錦標賽顯示
   * @param tournamentId - 錦標賽ID
   */
  function resubscribeToTournamentShow(tournamentId: string): void {
    if (!tournamentId) return;

    // 確保 WebSocket 已連線
    if (!isConnected.value) {
      connect();
      // 等待連線成功後再訂閱
      const checkInterval = setInterval(() => {
        if (isConnected.value) {
          clearInterval(checkInterval);
          const message: WebSocketMessage = { event: "resubscribe", type: "tournament", tournament_ids: tournamentId };
          sendMessage(message);
        }
      }, 100);
      return;
    }

    const message: WebSocketMessage = { event: "resubscribe", type: "tournament", tournament_ids: tournamentId };
    sendMessage(message);
  }

  // ========== 桌子遊戲訂閱控制 ==========
  /**
   * 訂閱桌子遊戲
   * @param tableId - 桌子ID
   */
  function subscribeToTablePlay(tableId: string): void {
    if (!tableId) {
      console.log("請輸入有效的桌子 ID!", "error");
      return;
    }

    // 確保 WebSocket 已連線
    if (!isConnected.value) {
      connect();
      // 等待連線成功後再訂閱
      const checkInterval = setInterval(() => {
        if (isConnected.value) {
          clearInterval(checkInterval);
          const message: WebSocketMessage = { event: "subscribe", type: "table_play", table_id: tableId };
          sendMessage(message);
        }
      }, 100);
      return;
    }

    const message: WebSocketMessage = { event: "subscribe", type: "table_play", table_id: tableId };
    sendMessage(message);
  }

  /**
   * 取消訂閱桌子遊戲
   * @param tableId - 桌子ID
   */
  function unsubscribeFromTablePlay(tableId: string): void {
    if (!tableId) return;

    if (isConnected.value) {
      const message: WebSocketMessage = { event: "unsubscribe", type: "table_play", table_id: tableId };
      sendMessage(message);
    }
  }

  /**
   * 重新訂閱桌子遊戲
   * @param tableId - 桌子ID
   */
  function resubscribeToTablePlay(tableId: string): void {
    if (!tableId) return;

    // 確保 WebSocket 已連線
    if (!isConnected.value) {
      connect();
      // 等待連線成功後再訂閱
      const checkInterval = setInterval(() => {
        if (isConnected.value) {
          clearInterval(checkInterval);
          const message: WebSocketMessage = { event: "resubscribe", type: "table_play", table_id: tableId };
          sendMessage(message);
        }
      }, 100);
      return;
    }

    const message: WebSocketMessage = { event: "resubscribe", type: "table_play", table_id: tableId };
    sendMessage(message);
  }
  return {
    ws,
    messages,
    isConnected,
    connect,
    sendMessage,
    disconnect,
    attemptReconnect,
    forceReconnect,
    checkConnection,

    subscribeToUser,
    unsubscribeFromUser,
    resubscribeToUser,

    subscribeToTableShow,
    unsubscribeFromTableShow,
    resubscribeToTableShow,

    subscribeToTablePlay,
    unsubscribeFromTablePlay,
    resubscribeToTablePlay,

    subscribeToTournamentShow,
    unsubscribeFromTournamentShow,
    resubscribeToTournamentShow,

    subscribeChat,
    unsubscribeChat,
    resubscribeChat,
  };
});