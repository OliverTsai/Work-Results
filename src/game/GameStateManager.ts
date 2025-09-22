import { GameObjects, Scene } from 'phaser';
import { EventBus } from './EventBus';
import type { PlayerAction } from './types';
import { backendApi } from '@/composables/useApi';

/**
 * 遊戲狀態管理器 - 負責處理玩家動作和遊戲事件
 * 簡化版：不再負責WebSocket連接，只處理玩家動作和遊戲事件
 */
export class GameStateManager {
  private apiBaseUrl: string;
  private token: string = '';
  private handId: string = '';

  // 添加一個專門的屬性來存儲玩家座位號
  public playerSeatNumber: number = 0;
  
  // 牌桌狀態，從外部設置
  public tableState: any = {
    maxPlayers: 8,
    currentPlayers: [],
    minBuyIn: '600',
    maxBuyIn: '2000',
    myNumber: 0, // 確保這個屬性存在並初始化為0
    // 其他牌桌狀態屬性
  };

  // 玩家可執行的動作列表
  public userActionList: { [key: string]: any } = {};

  // 遊戲狀態
  public gameState: any = null;
  
  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
    // 從本地存儲獲取令牌
    this.token = localStorage.getItem('token') || '';
  }

  /**
   * 設置玩家座位號 - 新增這個方法
   */
  public setPlayerSeatNumber(seatNumber: number): void {
    // console.log(`設置玩家座位號: ${seatNumber}`);
    
    // 更新專門的屬性
    this.playerSeatNumber = seatNumber;
    
    // 同時更新 tableState 中的 myNumber
    this.tableState.myNumber = seatNumber;
  }

  /**
   * 獲取玩家座位號 - 新增這個方法
   */
  public getPlayerSeatNumber(): number {
    return this.playerSeatNumber || this.tableState.myNumber || 0;
  }


  /**
   * 初始化遊戲狀態
   * @param tableId 牌桌ID
   * @param playerSeat 玩家座位號
   */
  public initGameState(tableId: string, playerSeat: number): void {
    try {
      // console.log(`初始化遊戲狀態，牌桌ID: ${tableId}, 座位號: ${playerSeat}`);
      
      // 更新牌桌狀態
      this.tableState = {
        ...this.tableState,
        tableId,
        myNumber: playerSeat
      };
      
      // 初始化遊戲狀態
      this.gameState = {
        players: [],
        communityCards: [],
        pot: 0,
        gamePhase: 'waiting',
        currentPlayer: null,
        availableActions: []
      };
      
      // 發出事件通知
      // EventBus.emit('game-state-updated', this.gameState);
      
    } catch (error) {
      console.error('初始化遊戲狀態時出錯:', error);
    }
  }

  /**
   * 設置當前牌局ID
   */
  public setHandId(handId: string): void {
    this.handId = handId;
    // console.log(`設置當前手牌ID: ${handId}`);
  }

  /**
   * 更新牌桌狀態
   */
  public updateTableState(state: any): void {
    try {
      console.log('更新牌桌狀態:', state);
      
      // 合併狀態
      this.tableState = {
        ...this.tableState,
        ...state
      };
      
      // 使用 setTimeout 確保在下一個事件循環中發出事件
      // 這可以避免在場景初始化過程中過早觸發事件
      setTimeout(() => {
        try {
          console.log('發出表格狀態更新事件:', this.tableState);
          const gameContainer = document.getElementById('game-container');
          if (!gameContainer || gameContainer.children.length === 0) {
            console.log('遊戲容器不存在或為空，不發送事件');
            return;
          }
          EventBus.emit('table-state-updated', this.tableState);
        } catch (error) {
          console.error('發出表格狀態更新事件時出錯:', error);
        }
      }, 0);
      
    } catch (error) {
      console.error('更新牌桌狀態時出錯:', error);
    }
  }

  // 清理所有事件監聽器
  clearAllEventListeners() {
    EventBus.off('table-state-updated');
    EventBus.off('current-scene-ready');
    // 清理其他可能的事件監聽器
    console.log('GameStateManager: 所有事件監聽器已清除');
  }

  /**
   * 入座發送API請求
   */
  public sitDownApi(buyInAmount: string ,seatNumber?: number): Promise<any> {
    try {
      // 獲取 token 和 tableId
      const token = localStorage.getItem('token') || ''; // 假設 token 存在 localStorage 中
      const tableId = this.tableState?.tableId || '';
      
      if (!token || !tableId) {
        console.error('缺少必要參數：token 或 tableId');
        return Promise.reject('缺少必要參數：token 或 tableId');
      }
      
      // 構建 API URL
      const url = backendApi(`/api/v1/tables/${tableId}/join`);
      
      // 準備請求體
      const requestBody: any = {
        buy_in: buyInAmount
      };

      // 如果提供了座位號，則添加到請求體中
      if (seatNumber !== undefined) {
        requestBody.seat_number = seatNumber;
      }
      // console.log(`發送入座請求到 ${url}，座位號: ${seatNumber}, 買入金額: ${buyInAmount}`);
      
      // 發送請求
      return fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      .then(response => {
        if (response.status === 401) {
          // 如果是 401 錯誤，跳轉到登入頁面
          console.error('認證失敗，需要重新登入');
        } else if (!response.ok) {
          // 處理其他 HTTP 錯誤
          throw new Error(`HTTP 錯誤: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('加入牌桌成功', data);
        // 更新 tableState 中的 sitDownButton 為 true
        if (this.tableState) {
          // this.tableState.sitDownButton = true;
        }
      })
      .catch(error => {
        console.error('加入牌桌失敗:', error);
        // 通知錯誤
        throw error;
      });
    } catch (error) {
      console.error('發送入座請求時出錯:', error);
      return Promise.reject(error);
    }
  }

  /**
   * 離座發送API請求
   */
  public leaveTableApi(id:string): Promise<any> {
    try {
      // 獲取 token 和 tableId
      const token = localStorage.getItem('token') || ''; // 假設 token 存在 localStorage 中
      const tableId = this.tableState?.tableId || '';
      
      if (!token || !tableId) {
        console.error('缺少必要參數：token 或 tableId');
        return Promise.reject('缺少必要參數：token 或 tableId');
      }
      
      // 構建 API URL
      const url = backendApi(`/api/v1/tables/${id}/leave`);
      // 發送請求
      return fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })
      .then(response => {
        if (response.status === 401) { 
          // 如果是 401 錯誤，跳轉到登入頁面
          console.error('認證失敗，需要重新登入');
        }
        else if (!response.ok) {
          // 處理其他 HTTP 錯誤
          throw new Error(`HTTP 錯誤: ${response.status}`);
        }
        return response.json();
        })
      .then(data => {
        console.log('離開牌桌成功', data);

        return { success: true, data };
        
      })
      .catch(error => {
        console.error('離開牌桌失敗:', error);
        // 通知錯誤
        return { success: false, error };

      });
    } catch (error) {
      console.error('發送離開牌桌請求時出錯:', error);
      return Promise.reject(error);
    }
  }

  /**
   * 行動發送API請求
   */
  public myAction(params: string, chips: string) {
    try {
      // 獲取 token 和 tableId
      const token = localStorage.getItem('token') || ''; // 假設 token 存在 localStorage 中
      const handId = this.tableState?.handId || '';

      if (!token || !handId) {
        console.error('缺少必要參數：token 或 handId');
        return Promise.reject('缺少必要參數：token 或 tableId');
      }

      const url = backendApi(`/api/v1/hands/${handId}/action`);

      // 發送請求
      return fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: params,
          amount:chips,
        })
      })
      .then(response => {
        if (response.status === 401) {
          // 如果是 401 錯誤，跳轉到登入頁面
          console.error('認證失敗，需要重新登入');
        } else if (!response.ok) {
          // 處理其他 HTTP 錯誤
          throw new Error(`HTTP 錯誤: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // console.log('行動成功', data);
        // 更新內部狀態
      }).catch(error => {
        console.error('行動失敗:', error);

      });

    }catch (error) {
      console.error('發送行動請求時出錯:', error);
      return Promise.reject(error);
    }

  }

    /**
   * 秀手牌API請求
   */
  public async showHandApi(cardIndex: number) {
    try {
      // 獲取 token 和 tableId
      const token = localStorage.getItem('token') || ''; // 假設 token 存在 localStorage 中
      const tableId = this.tableState?.tableId || '';
      const url = backendApi(`/api/v1/tables/${tableId}/show-cards`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          card_index: cardIndex,
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    
      // console.log('秀手牌成功');
      
    }catch (error) {

    }

  }
    /**
   * 坐下方法，由 UI 調用
   */
  public sitDown(buyInAmount: number,seatNumber?: number): Promise<any> {
    try {
      // console.log(`嘗試坐下在座位 ${seatNumber}，買入金額: ${buyInAmount}`);
      
      // 轉換買入金額為字符串
      const buyInAmountStr = buyInAmount.toString();
      
      // 調用 API
      return this.sitDownApi(buyInAmountStr,seatNumber);
    } catch (error) {
      console.error('坐下操作失敗:', error);
      return Promise.reject(error);
    }
  }

  /**
 * 獲取當前牌桌狀態
 */
  public getTableState(): any {
    return this.tableState;
  }

  /**
   * 獲取當前玩家列表
   */
  public getCurrentPlayers(): any[] {
    return this.tableState.currentPlayers || [];
  }

  /**
   * 發送玩家操作到後端
   */
  public sendPlayerAction(action: PlayerAction): Promise<void> {
    if (!this.handId) {
      console.error('未設置手牌ID，無法發送玩家操作');
      return Promise.reject(new Error('未設置手牌ID，無法發送玩家操作'));
    }

    // console.log(`發送玩家操作:`, action);
    
    return fetch(`${this.apiBaseUrl}/api/v1/hands/${this.handId}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(action),
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.message || '發送玩家操作失敗');
        });
      }
      return response.json();
    })
    .then(data => {
      // console.log('玩家操作發送成功:', data);
    })
    .catch(error => {
      console.error('發送玩家操作失敗:', error);
    });
  }

  // 清除所有事件監聽器
  clearEventListeners() {
    try {
      // 使用 EventBus 移除所有與此管理器相關的事件
      // EventBus.off('table-state-updated');
      EventBus.off('game-state-updated');
      // 添加其他您可能在 GameStateManager 中使用的事件
      
      console.log('GameStateManager: 所有事件監聽器已清除');
    } catch (error) {
      console.error('清除事件監聽器時出錯:', error);
    }
  }

  // 重置狀態
  resetState() {
    try {
      // 重置所有狀態
      this.tableState = {
        maxPlayers: 0,
        currentPlayers: [],
        handId: '',
        tableId: '',
        tournamentId: '',
        tableName: '',
        mainBuyIn: '',
        maxBuyIn: '',
        sitDownButton: false,
        tableStatus: '',
        playHand: '',
        myNumber: 0,
        canDoAction: [],
        call: '0',
        mainRaise: '0',
        maxRaise: '0',
        myHandCard: [],
        allChipAdditionBox: [],
        potAmountBox: '0',
        potWinner: {},
        publicCard: [],
      };
      
      // 重置玩家座位號
      this.setPlayerSeatNumber(0);
      
      // console.log('GameStateManager: 狀態已重置');
    } catch (error) {
      console.error('重置狀態時出錯:', error);
    }
  }
}

// 創建單例實例
export const gameStateManager = new GameStateManager(import.meta.env.VITE_API_BASE_URL || '');