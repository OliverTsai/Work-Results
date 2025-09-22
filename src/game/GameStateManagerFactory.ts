import { GameStateManager } from './GameStateManager';

/**
 * 遊戲狀態管理器工廠 - 負責創建和管理多個 GameStateManager 實例
 */
export class GameStateManagerFactory {
  private static managers: Map<string, GameStateManager> = new Map();
  private static apiBaseUrl: string = import.meta.env.VITE_API_BASE_URL || '';

  /**
   * 獲取指定牌桌的 GameStateManager 實例
   * 如果不存在則創建新實例
   */
  public static getManager(tableId: string): GameStateManager {
    if (!this.managers.has(tableId)) {
      const manager = new GameStateManager(this.apiBaseUrl, tableId);
      this.managers.set(tableId, manager);
    }
    return this.managers.get(tableId)!;
  }

  /**
   * 移除指定牌桌的 GameStateManager 實例
   */
  public static removeManager(tableId: string): void {
    const manager = this.managers.get(tableId);
    if (manager) {
      manager.disconnect();
      this.managers.delete(tableId);
    }
  }

  /**
   * 獲取所有活動的 GameStateManager 實例
   */
  public static getAllManagers(): Map<string, GameStateManager> {
    return this.managers;
  }

  /**
   * 斷開所有連接
   */
  public static disconnectAll(): void {
    this.managers.forEach(manager => {
      manager.disconnect();
    });
    this.managers.clear();
  }
}