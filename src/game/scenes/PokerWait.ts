import { GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { gameStateManager } from '../GameStateManager';

export class PokerWait extends Scene {

    // 坐下買入視窗相關
    buyInWindow: GameObjects.Container;
    buyInSlider: { track: GameObjects.Rectangle, handle: GameObjects.Ellipse } | null = null;
    buyInValue: GameObjects.Text;
    buyInMinValue: number = 600;
    buyInMaxValue: number = 1000;
    currentBuyInValue: number = 600;
    selectedSeat: number = 0;

    // 離開按鈕
    exitButton: GameObjects.Image;

    // 離座按鈕
    leaveButton: GameObjects.Image;

    // 場景轉換標誌，防止重複轉換
    private isTransitioning: boolean = false;

    constructor() {
        super('PokerWait');
    }

    init() {
        // 重置轉換標誌
        this.isTransitioning = false;

        // 獲取當前遊戲的實際寬高
        const { width, height } = this.scale;
    
        // 使用實際的遊戲寬高來定位元素，而不是固定值
        this.add.image(width / 2, height / 2, 'background')
        .setDisplaySize(width, height); // 設置背景圖片大小為整個畫面
    
        // 顯示等待信息
        this.add.text(width / 2, height / 2, '等待其他玩家加入...', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
        align: 'center'
        }).setOrigin(0.5);

        console.log('PokerWait 場景初始化完成');
    }

    create () {
        // 獲取當前遊戲的實際寬高
        const { width, height } = this.scale;  
        // 顯示等待信息
        this.add.text(width / 2, height / 2, '等待其他玩家加入...', {

            fontFamily: 'Arial',
            fontSize: '24px',   
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // 連接到遊戲狀態
        this.connectToGameState();

        // 初始化買入範圍
        this.initBuyInValues();

        //入座買入籌碼
        if(gameStateManager.tableState.myNumber === 0) {
            this.createBuyInWindow();
        }

        // 創建返回按鈕
        this.createExitButton();

        // 創建離座按鈕
        this.createLeaveButton();

        // 檢查當前狀態，如果已經可以進入遊戲，直接轉換
        this.checkAndTransitionToGame();
        
    }

    // 檢查並轉換到遊戲場景
    checkAndTransitionToGame() {
        if (gameStateManager.tableState && gameStateManager.tableState.turboData.waitButton === false && !this.isTransitioning) {
            console.log('檢測到可以進入遊戲，準備轉換到 PokerGameTurbo 場景');
            this.isTransitioning = true;
            
            // 先停止當前場景的所有活動
            this.tweens.killAll();
            // EventBus.off('table-state-updated');
            
            // 延遲一下再轉換場景，確保資源釋放
            this.time.delayedCall(500, () => {
                if (this.scene && this.scene.isActive()) {
                    console.log('正在轉換到 PokerGameTurbo 場景');
                    
                    // 在轉換之前確保 GameStateManager 狀態正確
                    if (!gameStateManager.tableState || gameStateManager.tableState.turboData.waitButton !== true) {
                        console.log('狀態已變更，取消場景轉換');
                        this.isTransitioning = false;
                        return;
                    }
                    
                    // 使用 start 而不是 switch，確保正確初始化
                    this.scene.start('PokerGameTurbo');
                } else {
                    console.log('場景已不再活躍，取消轉換');
                    this.isTransitioning = false;
                }
            });
        }
    }


    // 連接到遊戲狀態
    connectToGameState() {
        // 監聽牌桌狀態更新
        EventBus.on('table-state-updated', (tableState: any) => {
            // 檢查是否已經坐下
            if(tableState && tableState.turboData.waitButton === false && !this.isTransitioning) {
                console.log('收到狀態更新，準備轉換到 PokerGameTurbo 場景');
                this.checkAndTransitionToGame(); // 使用同一個方法處理轉換
            }
        });
    }

    // 初始化買入範圍
    initBuyInValues() {
        // 從遊戲狀態獲取買入範圍
        if (gameStateManager.tableState) {
            const minBuyIn = gameStateManager.tableState.mainBuyIn;
            const maxBuyIn = gameStateManager.tableState.maxBuyIn;
            
            this.buyInMinValue = parseInt(minBuyIn);
            this.buyInMaxValue = parseInt(maxBuyIn);
            
            // 設置初始買入值為最小值
            this.currentBuyInValue = this.buyInMinValue;
        }
    }

    // 創建買入視窗
    createBuyInWindow() {
        const { width, height } = this.scale;
        
        // 創建一個容器來放置所有買入視窗元素
        this.buyInWindow = this.add.container(width / 2, height / 2);
        this.buyInWindow.setDepth(100);
        // 確保視窗是可見的
        this.buyInWindow.setVisible(true);
        
        // 背景面板
        const panel = this.add.rectangle(0, 0, 400, 300, 0x000000, 0.8);
        panel.setStrokeStyle(2, 0xffffff);
        
        // 標題
        const title = this.add.text(0, -120, '請選擇買入金額', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // 最小和最大值標籤
        const minLabel = this.add.text(-180, -50, `最小: ${this.buyInMinValue}`, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        
        const maxLabel = this.add.text(180, -50, `最大: ${this.buyInMaxValue}`, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(1, 0.5);
        
        // 當前值顯示
        this.buyInValue = this.add.text(0, 0, `${this.currentBuyInValue}`, {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffcc00',
            align: 'center'
        }).setOrigin(0.5);
        
        // 創建自定義滑動條
        const sliderTrack = this.add.rectangle(0, 50, 300, 10, 0x666666);
        const sliderHandle = this.add.circle(-150, 50, 15, 0xffffff)  // 初始位置在最左側
            .setInteractive({ draggable: true });
        
        // 滑動條邏輯
        sliderHandle.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number) => {
            // 限制在軌道範圍內
            const minX: number = -150;
            const maxX: number = 150;
            dragX = Phaser.Math.Clamp(dragX, minX, maxX);
            
            // 更新手柄位置
            sliderHandle.x = dragX;
            
            // 計算並更新買入值
            const percentage: number = (dragX - minX) / (maxX - minX);
            this.currentBuyInValue = Math.round(this.buyInMinValue + percentage * (this.buyInMaxValue - this.buyInMinValue));
            this.buyInValue.setText(`${this.currentBuyInValue}`);
        });
        
        // 確認和取消按鈕
        const confirmButton = this.add.rectangle(0, 100, 120, 40, 0x00aa00);
        const confirmText = this.add.text(0, 100, '確認', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // 設置按鈕交互
        confirmButton.setInteractive();
        
        confirmButton.on('pointerdown', () => {
            this.confirmBuyIn();
        });

        // 添加所有元素到容器
        this.buyInWindow.add([
            panel, title, minLabel, maxLabel, this.buyInValue,
            sliderTrack, sliderHandle, confirmButton, confirmText,
        ]);
    }

    // 確認買入
    confirmBuyIn() {
        // 這裡需要實現確認買入的邏輯
        console.log(`確認買入: ${this.currentBuyInValue}`);
        
        gameStateManager.sitDown(this.currentBuyInValue);
        
        // 隱藏買入視窗
        this.hideBuyInWindow();
    }

    // 隱藏買入視窗
    hideBuyInWindow() {
        if (this.buyInWindow) {
            this.buyInWindow.setVisible(false);
        }
    }

    // 創建返回按鈕
    createExitButton() {
        // 取得當前螢幕大小
        const { width, height } = this.scale;
        
        // 創建返回按鈕使用 btn-back 圖片
        this.exitButton = this.add.image(width * 0.15, height * 0.1, 'btn-back')
            .setDepth(100)
            .setInteractive();
        
        // 設置按鈕大小
        const buttonScale = 0.4; // 可以根據需要調整大小
        this.exitButton.setScale(buttonScale);
        
        // 設置按鈕交互
        this.exitButton.on('pointerover', () => {
            this.exitButton.setScale(buttonScale * 1.1); // 放大效果
            this.input.setDefaultCursor('pointer');
        });
        
        this.exitButton.on('pointerout', () => {
            this.exitButton.setScale(buttonScale); // 恢復原始大小
            this.input.setDefaultCursor('default');
        });
        
        this.exitButton.on('pointerdown', () => {
            this.exitButton.setScale(buttonScale * 0.9); // 按下效果
        });
        
        this.exitButton.on('pointerup', () => {
            this.exitButton.setScale(buttonScale * 1.1); // 恢復懸停大小
            this.exitToSelectTable();
        });
    }

    // 離開到選桌頁面
    exitToSelectTable() {
        try {
            // 延遲一下再跳轉，確保事件被處理
            this.time.delayedCall(100, () => {
                // 跳轉到選桌頁面
                window.location.href = '/game/select';
            });
        } catch (error) {
            console.error('離開牌桌時出錯:', error);
            // 如果出錯，仍然嘗試跳轉
            window.location.href = '/game/select';
        }
    }

    // 創建離座按鈕
    createLeaveButton() {
        const { width, height } = this.scale;
        const buttonWidth = 55;
        const buttonHeight = 55;
        const padding = 20;

        if(gameStateManager.tableState?.tournamentId === ""){
            // 創建按鈕，放在右上角
            this.leaveButton = this.add.image(width * 0.85, height * 0.09, 'leave')
                .setDisplaySize(buttonWidth, buttonHeight)
                .setDepth(20)  // 確保按鈕在最上層
                .setInteractive();

            
            // 設置按鈕交互
            this.leaveButton.on('pointerdown', () => {
                this.handleLeaveTable();
            });
        }else{
            // 創建按鈕，放在右上角
            this.leaveButton = this.add.image(width - buttonWidth/2 - padding, padding + buttonHeight/2, 'trophy')
                .setDisplaySize(buttonWidth, buttonHeight)
                .setDepth(20)  // 確保按鈕在最上層
                .setInteractive();
            
            // 設置按鈕交互
            this.leaveButton.on('pointerdown', () => {
                // 跳轉到錦標賽頁面
                window.location.href = '/game/tournament?id=' + gameStateManager.tableState?.tournamentId;
            });
        }
        
        
    }

    // 處理離開牌桌
    handleLeaveTable() {
        // console.log('玩家點擊離開按鈕');
        
        // 添加發亮效果
        this.tweens.add({
            targets: this.leaveButton,
            alpha: { from: 1, to: 0.5 },
            yoyo: true,
            duration: 150,
            repeat: 1,
            onComplete: () => {
                // 禁用按鈕，防止重複點擊
                this.leaveButton.setAlpha(0.5);
                this.leaveButton.disableInteractive();
                
                // 離開牌桌
                gameStateManager.leaveTableApi(gameStateManager.tableState?.tableId);

                if (gameStateManager.tableState.tableType === "turbo") {
                    window.location.href = '/game/select';
                }
            }
        });
    }


    update() {
        // 檢查是否已經有其他玩家加入
        // if (gameStateManager.tableState && gameStateManager.tableState.sitDownButton === true && !this.isTransitioning) {
        //     console.log('在 update 中檢測到可以進入遊戲');
        //     this.checkAndTransitionToGame(); // 使用同一個方法處理轉換
        // }
    }

    // 場景關閉時清理資源
    shutdown() {
        // 移除事件監聽器
        EventBus.off('table-state-updated');
        
        // 清理所有遊戲物件
        if (this.buyInWindow) this.buyInWindow.destroy();
        if (this.exitButton) this.exitButton.destroy();
        if (this.leaveButton) this.leaveButton.destroy();
        
        console.log('PokerWait 場景關閉');
    }
}
