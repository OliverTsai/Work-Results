import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GameStateManagerFactory } from '../GameStateManagerFactory';
import { gameStateManager } from '../GameStateManager';

export class PokerGameTurboOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    gameOverText: Phaser.GameObjects.Text;
    nextScene: string = 'PokerWait'; // 預設下一個場景
    tableId: string = '';
    isTurboTable: boolean = false;
    background: Phaser.GameObjects.Rectangle;

    constructor ()
    {
        super('PokerGameTurboOver');
    }

    init(data: any)
    {
        // 可以從前一個場景接收要跳轉的目標場景和牌桌ID
        if (data) {
            if (data.nextScene) {
                this.nextScene = data.nextScene;
            }
            if (data.tableId) {
                this.tableId = data.tableId;
            }
        }

        // 檢查是否為急速桌
        this.isTurboTable = gameStateManager.tableState?.tableType === "turbo";
        
        // 重置遊戲狀態
        this.resetGameState();

    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000); // 黑色背景
        
        const { width, height } = this.scale;

        // 創建一個全屏黑色背景，確保不會出現白畫面
        this.background = this.add.rectangle(0, 0, width * 2, height * 2, 0x000000)
            .setOrigin(0)
            .setDepth(0);

        // 創建過渡動畫
        this.gameOverText = this.add.text(width / 2, height / 2, '離座中...', {
            fontFamily: 'Arial', 
            fontSize: 32, 
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        // 添加載入動畫
        this.tweens.add({
            targets: this.gameOverText,
            alpha: { from: 0.2, to: 1 },
            duration: 500,
            ease: 'Power2',
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                // 動畫結束後切換場景
                this.handleTransition();
            }
        });
        
        // 確保這個場景保持活躍，直到明確停止它
        this.events.on('shutdown', this.onShutdown, this);
        this.events.on('destroy', this.onDestroy, this);
        
        EventBus.emit('current-scene-ready', this);
    }

    // 處理過渡
    handleTransition() {
        if (this.isTurboTable) {
            // 急速桌直接跳轉到選桌頁面
            console.log('急速桌，準備跳轉到選桌頁面');
            // 先顯示一個訊息，然後再跳轉
            this.gameOverText.setText('即將返回選桌頁面...');
            
            // 延遲一下再跳轉，確保用戶能看到訊息
            this.time.delayedCall(1000, () => {
                window.location.href = '/game/select';
            });
        } else {
            // 一般桌切換到等待場景
            console.log(`準備切換到場景: ${this.nextScene}`);
            this.changeScene();
        }
    }

    // 重置遊戲狀態
    resetGameState() {
        // console.log('正在重置遊戲狀態...');
        
        // 使用 GameStateManagerFactory 移除對應牌桌的管理器
        if (this.tableId) {
            GameStateManagerFactory.removeManager(this.tableId);
            console.log(`已移除牌桌 ${this.tableId} 的 GameStateManager`);
        }
        
        // 清除所有相關事件監聽
        EventBus.removeAllListeners('game-state-updated');
        EventBus.removeAllListeners('table-state-updated');
        EventBus.removeAllListeners('player-turn');

        // 停止所有可能存在的動畫
        if (this.tweens) {
            this.tweens.killAll();
        }
        
        // console.log('遊戲狀態已重置');
    }

    changeScene() {
        console.log(`切換到場景: ${this.nextScene}`);
        this.scene.start(this.nextScene);
    }

    // 場景關閉時的處理
    onShutdown() {
        console.log('PokerGameOver 場景關閉');
    }

    // 場景銷毀時的處理
    onDestroy() {
        console.log('PokerGameOver 場景銷毀');
        // 確保清理所有事件監聽器
        this.events.off('shutdown', this.onShutdown, this);
        this.events.off('destroy', this.onDestroy, this);
    }
}