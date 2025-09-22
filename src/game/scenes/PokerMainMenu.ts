import { GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { gameStateManager } from '../GameStateManager';
import { SeatManager } from '../utils/SeatManager2';     // 引入玩家座位排序
import { ChipsManager } from '../utils/ChipsManager';
import { PotManager } from '../utils/PotManager';
import { ChipAnimations } from '../utils/ChipAnimations';
import { Seat } from '../utils/Seat';
import { Chips } from '../utils/Chips'

export class PokerMainMenu extends Scene
{
    background: GameObjects.Image;
    Table:GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;

    // 牌桌ID
    private tableId: string = '';

    // 標記場景是否已經初始化完成
    private sceneReady: boolean = false;

    // 添加 SeatManager 實例
    private seatManager: SeatManager | null = null;

    // 添加 ChipsManager 實例
    private ChipsManager: ChipsManager | null = null;

    // 所有玩家的座位
    private seats: any[] = [];

    //所有玩家的籌碼
    private chips: any[] = [];
    private copyChips:any[] = [];

    // FPS顯示文本
    private fpsText: GameObjects.Text | null = null;

    // 新增倒數計時特效
    // private countdownEffect: CountdownEffect | null = null;
    // private activeCountdownSeat: number | null = null;

    // 公共牌區
    communityCards: GameObjects.Image[] = [];
    communityCardsList: GameObjects.Image[] = [];

    // 牌桌相關
    tableImage: GameObjects.Image;
    playerSeats: GameObjects.Image[] = [];
    playerAvatars: GameObjects.Image[] = [];
    playerNames: GameObjects.Text[] = [];
    playerSeatButton: (GameObjects.Image | null)[] = []; // 添加座位按鈕數組

    //玩家相關
    playerBetChips: (GameObjects.Text | null)[] = [];
    playerBetChipImages: (GameObjects.Image | null)[] = []; // 玩家籌碼圖片
    playerCards: (GameObjects.Image | GameObjects.Text | null)[][] = []; // 玩家手牌
    showHoleCards:(GameObjects.Image | null)[] = [];

    // 坐下買入視窗相關
    buyInWindow: GameObjects.Container;
    buyInSlider: { track: GameObjects.Rectangle, handle: GameObjects.Ellipse } | null = null;
    buyInValue: GameObjects.Text;
    buyInMinValue: number = 600;
    buyInMaxValue: number = 1000;
    currentBuyInValue: number = 600;
    selectedSeat: number = 0;

    // 籌碼相關
    potText: GameObjects.Text | null;
    potIcon: GameObjects.Image | null;
    winnerTexts : (GameObjects.Text | GameObjects.Image | null)[] = [];
    chipSprites: (GameObjects.Shape | GameObjects.Text)[] = [];

    private potManager: PotManager; // 底池管理器
    private chipAnimations: ChipAnimations; // 新增籌碼動畫管理器

    // 玩家座位號
    playerSeat: number = gameStateManager.tableState?.myNumber || 0;

    // 離開按鈕
    exitButton: GameObjects.Image;

    //錦標賽按鈕
    tournamentButton: GameObjects.Image;

    // 初始化標記 - 用於確保只初始化一次
    private initialized: boolean = false;

    // 牌桌狀態更新處理函數
    private tableStateUpdateHandler?: ((tableState: any) => void) | null = null;

    constructor ()
    {
        super('PokerMainMenu');
    }

    init(data: any) {
        // 從場景初始化參數中獲取牌桌ID
        try {
            // 重置場景狀態
            this.sceneReady = false;

            // console.log('初始化 PokerMainMenu 場景', data);

            // 移除任何現有的事件監聽器，避免重複
            // this.removeEventListeners();

            if(gameStateManager.tableState && gameStateManager.tableState.sitDownButton === true) {
                this.time.delayedCall(500, () => {
                    this.scene.start('PokerGame');
                });
                return;
            }

            // 從場景初始化參數中獲取牌桌ID
            if (data && data.tableId) {
                this.tableId = data.tableId;
                // console.log(`初始化牌桌場景，牌桌ID: ${this.tableId}`);
            }

            // 清空座位數組，避免重複
            this.playerSeats = [];
            this.playerAvatars = [];
            this.playerNames = [];
            this.communityCards = [];
            this.playerBetChips = [];
            this.winnerTexts = [];
            this.chipSprites = [];
            this.playerSeatButton = [];

            // 初始化 SeatManager
            this.seatManager = new SeatManager(this);

        } catch (error) {
            console.error('初始化牌桌場景時出錯:', error);
        }
    }

    create ()
    {
        try {

            // 取得當前螢幕大小
            const { width, height } = this.scale;

            // 初始化籌碼動畫管理器
            this.chipAnimations = new ChipAnimations(this);

            // 初始化底池管理器
            this.potManager = new PotManager(this, this.chipAnimations);

            // 添加背景圖片
            this.background = this.add.image(width / 2, height / 2, 'background')
                .setDisplaySize(width, height); // 設定寬高以適應螢幕

            // 添加背景2
            this.Table = this.add.image(width/2, height/2 + 20, 'Table')
                .setScale(0.9);

            //fps
            this.fpsText = this.add.text(10, 10, "FPS: 0", {
                fontSize: "24px",
                color: "#ffffff",
            });

            // 創建離開按鈕
            this.createExitButton();

            // 創建錦標賽按鈕
            this.createTournamentButton();

            // 連接到遊戲狀態管理器，獲取最新的牌桌數據
            this.connectToGameState();

            // 主動從 gameStateManager 獲取最新數據
            this.updateFromGameState();

            // 確保 SeatManager 已初始化
            if (!this.seatManager) {
                this.seatManager = new SeatManager(this);
            }

            // 創建公共牌區域
            this.createCommunityCardArea();

            // 創建玩家座位
            this.createPlayerSeats();

            //創建玩家籌碼
            this.createPlayerChips();

            // 創建底池顯示
            this.createPotText();

            // 預先創建買入視窗(隱藏狀態)
            this.createBuyInWindow();

            // 設置場景已準備好
            this.sceneReady = true;
            this.initialized = true;

            EventBus.emit('current-scene-ready', this);
            // console.log('MainMenu scene ready')

            this.checkSceneStatus();

        } catch (error) {
            console.error('創建牌桌場景時出錯:', error);
        }
    }

    // 在場景的 update 方法或任何需要檢查的地方添加
    checkSceneStatus() {
        // console.log('場景狀態檢查:');
        // console.log('場景名稱:', this.scene.key);
        // console.log('場景是否活躍:', this.scene.isActive());
        // console.log('場景是否可見:', this.scene.isVisible());
        // console.log('場景是否正在運行:', this.scene.isRunning());
        // console.log('場景是否已啟動:', this.scene.settings.active);
        // console.log('場景是否已暫停:', this.scene.isPaused());
    }

    // 從 gameStateManager 獲取最新數據
    updateFromGameState() {
        try {
            
            // 檢查 gameStateManager 是否有牌桌狀態
            if (gameStateManager.tableState) {
                // console.log('GameStateManager 中的牌桌狀態:', gameStateManager.tableState);

            } else {
                // console.log('GameStateManager 中沒有牌桌狀態');
                // 請求牌桌狀態
                gameStateManager.getTableState();
            }
        } catch (error) {
            console.error('從 GameStateManager 獲取數據時出錯:', error);
        }
    }

    // 創建底池顯示
    createPotText() {
        // 使用 PotManager 創建底池顯示
        this.potManager.createPotText(gameStateManager.tableState, this.playerBetChips);
        
        // 更新引用
        this.potText = this.potManager.potText;
        this.winnerTexts = this.potManager.winnerTexts;
        this.chipSprites = this.potManager.chipSprites;
    }

    // 創建離開按鈕
    createExitButton() {
        // 取得當前螢幕大小
        const { width, height } = this.scale;
        
        // 創建返回按鈕使用 btn-back 圖片
        this.exitButton = this.add.image(width * 0.15, height * 0.1, 'btn-back')
            .setDepth(100)
            .setInteractive();
        
        // 設置按鈕大小
        const buttonScale = 1; // 可以根據需要調整大小
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

    // 創建錦標賽按鈕
    createTournamentButton() {
        // 取得當前螢幕大小
        const { width, height } = this.scale;
        const buttonWidth = 100;
        const buttonHeight = 100;
        const padding = 20;

        if(gameStateManager.tableState?.tournamentId){
            this.tournamentButton = this.add.image(width * 0.9, height * 0.1, 'trophy')
                .setScale(0.15)
                .setDepth(20)  // 確保按鈕在最上層
                .setInteractive();
            
            // 設置按鈕交互
            this.tournamentButton.on('pointerdown', () => {
                // 跳轉到錦標賽頁面
                window.location.href = '/game/tournament?id=' + gameStateManager.tableState?.tournamentId;
            });
        }
    }

    // 創建公共牌區域
    createCommunityCardArea() {

        const { width, height } = this.scale;
        // const cardWidth = 35;
        // const cardSpacing = 10;
        // const offsetRight = 20; // 向右偏移的像素值，可以根據需要調整
        // const startX = width / 2 - (cardWidth * 2.5 + cardSpacing * 2) + offsetRight;
        // const y = height / 2 - 40;

        const cards = gameStateManager.tableState?.publicCard || [];

        const amount = 5; // 最多顯示5張牌
        const cardsUpWard = 50; // 公共牌向上偏移的像素值
        const cardSize = 0.12; // 卡牌的縮放比例

        // 清除之前的公共牌
        this.communityCards.forEach(card => {
            if (card && card.destroy) card.destroy();
        });
        this.communityCards = [];

        const line = new Phaser.Geom.Line(width*0.32, height/2 - cardsUpWard, width*0.75, height/2 - cardsUpWard);
        for (let i = 0; i < amount; i++) {
            
            if(cards[i]){
                const cardData = this.add.image(0, 0, cards[i]).setScale(cardSize).setDepth(10);
                this.communityCards.push(cardData);
            }else{
                const cardBack = this.add.image(0, 0, 'XX').setScale(cardSize).setDepth(10);
                this.communityCards.push(cardBack);
            }
        }
        Phaser.Actions.PlaceOnLine(this.communityCards, line);
         
    }

    // 離開到選桌頁面
    exitToSelectTable() {
        try {
            // console.log('離開牌桌，返回選桌頁面');
            
            // 發送事件通知 Vue 組件
            // EventBus.emit('exit-table', {
            //     tableId: this.tableId
            // });
            
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

    // 創建買入視窗
    createBuyInWindow() {
        const { width, height } = this.scale;
        
        // 創建一個容器來放置所有買入視窗元素
        this.buyInWindow = this.add.container(width / 2, height / 2);
        this.buyInWindow.setDepth(100);
        this.buyInWindow.setVisible(false); // 初始隱藏
        
        // 背景面板（使用 Graphics 畫圓角矩形）
        const panelGraphics = this.add.graphics();
        panelGraphics.fillStyle(0x000000, 0.8);
        panelGraphics.lineStyle(5, 0xffcc00);
        panelGraphics.fillRoundedRect(-350, -200, 700, 400, 60);
        panelGraphics.strokeRoundedRect(-350, -200, 700, 400, 60);
        // 用 graphics 代替 rectangle
        const panel = panelGraphics;
        
        // 標題
        const title = this.add.text(0, -130, '請選擇買入金額', {
            fontFamily: 'Arial',
            fontSize: '90px',
            color: '#ffcc00',
            align: 'center'
        }).setOrigin(0.5).setScale(0.5);
        
        // 最小和最大值標籤
        const minLabel = this.add.text(-270, -50, `最小: ${this.buyInMinValue}`, {
            fontFamily: 'Arial',
            fontSize: '72px',
            color: '#ffcc00'
        }).setOrigin(0, 0.5).setScale(0.5);
        
        const maxLabel = this.add.text(270, -50, `最大: ${this.buyInMaxValue}`, {
            fontFamily: 'Arial',
            fontSize: '72px',
            color: '#ffcc00'
        }).setOrigin(1, 0.5).setScale(0.5);
        
        // 當前值顯示
        this.buyInValue = this.add.text(0, -20, `${this.currentBuyInValue}`, {
            fontFamily: 'Arial',
            fontSize: '128px',
            color: '#ffcc00',
            align: 'center'
        }).setOrigin(0.5).setScale(0.5);
        
        // 創建自定義滑動條
        const sliderTrack = this.add.rectangle(0, 50, 500, 20, 0x666666);
        const sliderHandle = this.add.circle(0, 50, 30, 0xffffff)
            .setInteractive({ draggable: true });
        
        // 滑動條邏輯
        sliderHandle.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number) => {
            // 限制在軌道範圍內
            const minX: number = -250;
            const maxX: number = 250;
            dragX = Phaser.Math.Clamp(dragX, minX, maxX);
            
            // 更新手柄位置
            sliderHandle.x = dragX;
            
            // 計算並更新買入值
            const percentage: number = (dragX - minX) / (maxX - minX);
            this.currentBuyInValue = Math.round(this.buyInMinValue + percentage * (this.buyInMaxValue - this.buyInMinValue));
            this.buyInValue.setText(`${this.currentBuyInValue}`);
        });
        
        // 確認和取消按鈕
        const confirmButton = this.add.image(100, 140, '確認');
        
        const cancelButton = this.add.image(-100, 140, '取消');
        
        // 設置按鈕交互
        confirmButton.setInteractive();
        cancelButton.setInteractive();
        
        confirmButton.on('pointerdown', () => {
            this.confirmBuyIn();
        });
        
        cancelButton.on('pointerdown', () => {
            this.hideBuyInWindow();
        });
        
        // 添加所有元素到容器
        this.buyInWindow.add([
            panel, title, minLabel, maxLabel, this.buyInValue,
            sliderTrack, sliderHandle, confirmButton,
            cancelButton
        ]);
    }

    // 顯示買入視窗
    showBuyInWindow(seatNumber: number, minBuyIn: string, maxBuyIn: string) {
        this.selectedSeat = seatNumber;
        
        // 更新買入範圍
        this.buyInMinValue = parseInt(minBuyIn);
        this.buyInMaxValue = parseInt(maxBuyIn);
        this.currentBuyInValue = this.buyInMinValue;
        
        // 更新UI顯示
        if (this.buyInWindow) {
            // 更新最小最大值標籤
            const minLabel = this.buyInWindow.getAt(2) as GameObjects.Text;
            const maxLabel = this.buyInWindow.getAt(3) as GameObjects.Text;
            
            minLabel.setText(`最小: ${this.buyInMinValue}`);
            maxLabel.setText(`最大: ${this.buyInMaxValue}`);
            
            // 更新當前值
            this.buyInValue.setText(`${this.currentBuyInValue}`);
            
            // 重置滑動條位置
            const sliderHandle = this.buyInWindow.getAt(6) as GameObjects.Shape;
            sliderHandle.x = -250; // 最左側位置
            
            // 顯示視窗
            this.buyInWindow.setVisible(true);
        }
    }

    // 確認買入並坐下
    confirmBuyIn() {
        
        const seat = Number(this.selectedSeat);
        const buyIn = Number(this.currentBuyInValue);

        if(buyIn > 0 && seat > 0){
            // 隱藏買入視窗
            this.hideBuyInWindow();

            // 直接設置座位號，這樣在場景切換後也能訪問
            gameStateManager.setPlayerSeatNumber(seat);

            // 執行坐下動畫
            this.mainSitDown(buyIn,seat);

            //延遲3秒
            this.time.delayedCall(500, () => {
                // 這裡添加您的入座邏輯，例如通過 gameStateManager 發送請求
                gameStateManager.sitDown(buyIn,seat)
                    .then(() => {
                        // 成功坐下後，開始遊戲
                        this.scene.start('PokerGame');
                        this.scene.stop('PokerMainMenu');
                    })
                    .catch((error) => {
                        // console.error('坐下的錯誤:', error);
                    });
            });
        }
        
    }
    
    // 隱藏買入視窗
    hideBuyInWindow() {
        if (this.buyInWindow) {
            this.buyInWindow.setVisible(false);
        }
        this.selectedSeat = 0;
    }

    //創建玩家下注籌碼
    createPlayerChips() {
        try {
            // 確保 gameStateManager.tableState 存在
            const tableState = gameStateManager.tableState;

            const { width, height } = this.scale;
            const centerX = width / 2;
            const centerY = height / 2;

            //確認玩家人數
            const maxPlayer  = tableState.maxPlayers

            //玩家資料
            const playerChips = tableState.allSeats

            // 定義一個異步函數來處理動畫和後續操作
            const processChips = async () => {
                // 清除舊的籌碼對象（但如果需要移動到中心，則保留它們用於動畫）
                if (!tableState.betSwitch) {
                    this.chips.forEach(chip => {
                        if (chip && chip.destroy) {
                            chip.destroy();
                        }
                    });
                    this.chips = [];
                }

                // 定義一個橢圓形路徑來放置籌碼
                const ellipse = new Phaser.Geom.Ellipse(centerX, centerY, 300, 600);

                // 創建新的籌碼
                const chipObj = new Chips(this);
                let newChips = [];
                for (let i = 1; i <= maxPlayer; i++) {
                    let chipAmount: String = '0';
                    if (playerChips[i] && playerChips[i].bet_chips) {
                        chipAmount = playerChips[i].bet_chips;
                    }
                    
                    const container = chipObj.createChips(this, chipAmount);
                    if (container) {
                        newChips.push(container);
                    }
                }

                // 設置新籌碼
                this.chips = newChips;

                // 將籌碼放置在橢圓形路徑上
                Phaser.Actions.PlaceOnEllipse(this.chips, ellipse);

                // 如果需要移動籌碼到中心
                if (tableState.betSwitch === true) {
                    // 保存當前籌碼為舊籌碼，用於移動動畫
                    this.copyChips = this.chips;

                    // 使用 Promise 等待動畫完成
                    await new Promise<void>((resolve) => {
                        this.chipsMoveToCenter(resolve);
                    });
                    console.log('籌碼移動到中心動畫完成');
                    
                    // 清除舊的籌碼對象
                    this.copyChips.forEach(chip => {
                        if (chip && chip.destroy) {
                            chip.destroy();
                        }
                    });
                    this.copyChips = [];
                } else {
                    // 直接設置新籌碼
                    this.chips = newChips;
                }
            };

            // 執行異步處理
            processChips();

        } catch (error) {
            console.error('創建玩家籌碼時出錯:', error);
        }
    }

    // 籌碼移動到中心的方法
    chipsMoveToCenter(callback:any) {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // 確保有籌碼可以移動
        if (!this.copyChips || this.copyChips.length === 0) {
            if (callback) callback();
            return;
        }

        let completedTweens = 0;
        const totalTweens = this.copyChips.length;
        
        this.copyChips.forEach(chip => {
            if (chip && chip.x !== undefined && chip.y !== undefined) {
                this.tweens.add({
                    targets: chip,
                    x: centerX,
                    y: centerY,
                    duration: 500,
                    ease: 'Power2',
                    onComplete: () => {
                        completedTweens++;
                        if (completedTweens === totalTweens && callback) {
                            callback();
                        }
                    }
                });
            } else {
                completedTweens++;
                if (completedTweens === totalTweens && callback) {
                    callback();
                }
            }
        });
    }

    // 創建玩家座位
    createPlayerSeats() {

        // 確保 SeatManager 已初始化
        if (!this.seatManager) {
            // console.log('SeatManager 未初始化，正在創建新實例');
            console.log('SeatManager 未初始化，正在創建新實例');
            this.seatManager = new SeatManager(this);
        }

        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2;

        // 定義一個橢圓形路徑來放置座位
        // const ellipse = new Phaser.Geom.Ellipse(centerX, centerY, 500, 900);
        
        // 使用 SeatManager 創建座位
        this.seatManager.createPlayerManagerSeats(
            gameStateManager.tableState, 
            (seatNumber, minBuyIn, maxBuyIn) => {
                // 座位點擊回調函數
                this.showBuyInWindow(seatNumber, minBuyIn, maxBuyIn);
            }
        );

        // 更新座位數組
        // if (result) {
        //     this.playerSeats = result.playerSeats;
        //     this.playerAvatars = result.playerAvatars;
        //     this.playerNames = result.playerNames;
        //     this.playerBetChips = result?.playerBetChips ?? [];
        //     this.playerBetChipImages = result?.playerBetChipImages ?? [];
        //     this.playerCards = result?.playerCards ?? [];
        //     this.showHo-leCards = result?.showHoleCards ?? [];
        //     this.playerSeatButton = result?.playerSeatButton ?? [];
        // }
        // this.seats = result.seats;
        this.seats = this.seatManager.seats; // 更新 seats 屬性

        // Phaser.Actions.PlaceOnEllipse(this.seats, ellipse);
    }

    // 清空座位
    clearSeats() {
        if (this.seatManager) {
            this.seatManager.clearSeats();
        }
        this.playerSeats = [];
        this.playerAvatars = [];
        this.playerNames = [];
    }

     // 玩家坐下的處理函數
     mainSitDown(buyInAmount: number = 0, seatNumber: number ) {
        
        // 檢查場景是否還活著
        if (!this.scene || typeof this.scene.isActive !== 'function' || !this.scene.isActive()) {
            console.log('場景已被銷毀，無法執行坐下動畫');
            return;
        }
        
        // 這裡可以添加坐下的動畫或效果
        // 計算所有座位的位置
        const { width, height } = this.scale;
        const tableWidth = width * 0.9;
        const tableHeight = height * 0.6;
        const centerX = width / 2;
        const centerY = height / 2;
        // const maxPlayers = gameStateManager.tableState?.maxPlayers || 8;
        // const seatSize = 80;
        
        // 目標位置是牌桌底部的位置（通常是5號位置，但取決於maxPlayers）
        // 假設牌桌+-底部位置索引為 maxPlayers / 2
        // const bottomSeatIndex = Math.floor(maxPlayers / 2);
        
        // 計算需要旋轉的角度，使選中的座位移動到底部位置
        // const selectedIndex = seatNumber - 1; // 轉換為從0開始的索引
        // const rotationSteps = (bottomSeatIndex - selectedIndex + maxPlayers) % maxPlayers;

        // 找到選中座位的位置
        // const angle = (Math.PI * 2 / maxPlayers) * selectedIndex - Math.PI / 2;
        // const selectedSeatX = centerX + Math.cos(angle) * (tableWidth * 0.4);
        // const selectedSeatY = centerY + Math.sin(angle) * (tableHeight * 0.5);
        
        // 創建一個數組存儲所有座位的當前位置和對象
        const seatObjects: { index: number; originalIndex: number; object: GameObjects.Image; nameText: GameObjects.Text | undefined; chipsText: GameObjects.Text | null; x: number; y: number; isSelected: boolean; }[] = [];

        // 確保 seatManager 存在
        if (!this.seatManager) {
            console.log('SeatManager 不存在，無法執行坐下動畫');
            return;
        }
        
        // 獲取座位數組的引用
        const seats = this.seats;

        if (!seats || seats.length === 0) {
            console.log('座位數組為空，無法執行坐下動畫');
            return;
        }
    
        // 創建橢圓路徑
        const ellipse = new Phaser.Geom.Ellipse(centerX, centerY, 500, 900);
        
        // 收集所有可顯示對象
        const displayObjects = [];
        for (let i = 0; i < seats.length; i++) {
            const seat = seats[i];
            if (seat instanceof Seat) {
                const container = seat.getContainer();
                if (container) {
                    displayObjects.push({
                        object: container,
                        seatNumber: i + 1,
                        isSelected: (i + 1 === seatNumber),
                        isSeat: true,
                        seat: seat
                    });
                }
            } else if (seat && typeof seat.setPosition === 'function') {
                // 如果是空座位按鈕
                displayObjects.push({
                    object: seat,
                    seatNumber: i + 1,
                    isSelected: (i + 1 === seatNumber),
                    isSeat: false,
                    seat: null
                });
            }
        }

        // 找到選中的座位對象
        const selectedObj = displayObjects.find(obj => obj.isSelected);
        if (!selectedObj) {
            console.log('未找到選中的座位');
            return;
        }
        
        // 計算需要旋轉的角度
        const maxPlayers = seats.length;
        const bottomSeatIndex = Math.floor(maxPlayers / 2); // 底部位置索引
        const selectedIndex = seatNumber - 1; // 轉換為從0開始的索引
        const rotationSteps = (bottomSeatIndex - selectedIndex + maxPlayers) % maxPlayers;
        
        // 計算旋轉角度（度數）
        const rotationAngle = (360 / maxPlayers) * rotationSteps;
        
        // 創建一個新的橢圓用於動畫
        const animEllipse = new Phaser.Geom.Ellipse(centerX, centerY, 500, 900);
        // animEllipse.angle = 0; // 初始角度
        
        // 保存原始對象，用於動畫完成後恢復
        const originalObjects = displayObjects.map(obj => obj.object);
        
        // 創建旋轉動畫
        this.tweens.add({
            targets: animEllipse,
            angle: rotationAngle, // 旋轉到目標位置
            duration: 2000, // 2秒完成旋轉
            ease: 'Power2',
            onUpdate: () => {
                // 更新所有座位的位置
                Phaser.Actions.PlaceOnEllipse(
                    originalObjects, 
                    animEllipse
                );
            },
            onComplete: () => {
                // 旋轉完成後，將選中的座位移動到左下角
                const leftBottomX = width * 0.2;
                const leftBottomY = height * 0.8;
                
                // 創建移動動畫
                this.tweens.add({
                    targets: selectedObj.object,
                    x: leftBottomX,
                    y: leftBottomY,
                    duration: 500,
                    ease: 'Power2',
                    onComplete: () => {
                        // 添加閃爍效果表示等待中
                        this.tweens.add({
                            targets: selectedObj.object,
                            alpha: { from: 1, to: 0.3 },
                            duration: 1000,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });
                        
                        // 如果是座位容器，可能需要調整內部元素
                        if (selectedObj.isSeat && selectedObj.seat) {
                            // 可以在這裡調整座位內部元素
                            // 例如更新玩家信息或添加特效
                        }
                    }
                });
            }
        });

        // 收集所有現有的座位對象（包括玩家頭像和空座位）
        // for (let i = 0; i < maxPlayers; i++) {
        //     const angle = (Math.PI * 2 / maxPlayers) * i - Math.PI / 2;
        //     const seatX = centerX + Math.cos(angle) * (tableWidth * 0.4);
        //     const seatY = centerY + Math.sin(angle) * (tableHeight * 0.5);

        //     // 座位號碼從1開始
        //     const currentSeatNumber = i + 1;
        //     const isSelected = (currentSeatNumber === seatNumber);
            
        //     // 查找這個位置的座位對象（可能是玩家頭像或空座位按鈕）
        //     let seatObject = null;
            
        //     // 先檢查是否有玩家頭像
        //     const avatarIndex = this.playerAvatars.findIndex(avatar => 
        //         Math.abs(avatar.x - seatX) < 15 && Math.abs(avatar.y - seatY) < 15
        //     );
            
        //     if (avatarIndex >= 0) {
        //         seatObject = this.playerAvatars[avatarIndex];
        //          // 查找與此頭像相關的所有文本對象（名稱和籌碼）
        //          const relatedTexts = this.playerNames.filter(text => 
        //             Math.abs(text.x - seatX) < 40 && text.y > seatY
        //         );
        //         // 同時獲取對應的玩家名稱文本
        //         const nameText = relatedTexts[0];
        //         const chipsText = relatedTexts[1];
        //         seatObjects.push({
        //             index: i,
        //             originalIndex: i,
        //             object: seatObject,
        //             nameText: nameText,
        //             chipsText: chipsText,
        //             x: seatX,
        //             y: seatY,
        //             isSelected: isSelected
        //         });
        //     } else {
        //         // 檢查是否有空座位按鈕
        //         const seatIndex = this.playerSeats.findIndex(seat => 
        //             Math.abs(seat.x - seatX) < 15 && Math.abs(seat.y - seatY) < 15
        //         );
                
        //         if (seatIndex >= 0) {
        //             seatObject = this.playerSeats[seatIndex];
        //             // 可能有對應的座位文本
        //             const seatText = this.playerNames.find(text => 
        //                 Math.abs(text.x - seatX) < 15 && Math.abs(text.y - seatY) < 15
        //             );
                    
        //             seatObjects.push({
        //                 index: i,
        //                 originalIndex: i,
        //                 object: seatObject,
        //                 nameText: seatText,
        //                 chipsText: null,
        //                 x: seatX,
        //                 y: seatY,
        //                 isSelected: isSelected
        //             });
        //         }
        //     }
        // }
        
        // // 如果沒有找到任何座位對象，直接返回
        // if (seatObjects.length === 0) {
        //     console.warn('未找到任何座位對象');
        //     return;
        // }
        
        // // 找到被選中的座位對象
        // let selectedSeat = seatObjects.find(seat => seat.isSelected);
        
        // if (!selectedSeat) {
        //     console.warn(`未找到選中的座位 ${seatNumber}`);
            
        //     // 嘗試手動創建一個座位對象
        //     // console.log('嘗試手動創建座位對象');
            
        //     // 創建玩家頭像
        //     const avatarTexture = 'player'; // 使用默認的 'player' 紋理
        //     const avatar = this.add.image(selectedSeatX, selectedSeatY, avatarTexture)
        //         .setScale(1)
        //         .setDepth(10);
                
        //     const nameText = this.add.text(selectedSeatX, selectedSeatY + seatSize/2 + 10, `玩家 ${seatNumber}`, {
        //         fontFamily: 'Arial',
        //         fontSize: '56px',
        //         color: '#ffffff',
        //         stroke: '#000000',
        //         strokeThickness: 1,
        //         align: 'center'
        //     }).setOrigin(0.5).setDepth(10).setScale(0.25);
    
        //     // 文字顯示玩家籌碼
        //     const chipsText = this.add.text(selectedSeatX, selectedSeatY + seatSize/2 + 35, `${buyInAmount}`, {
        //         fontFamily: 'Arial',
        //         fontSize: '56px',
        //         color: '#ffcc00',
        //         stroke: '#000000',
        //         strokeThickness: 1,
        //         align: 'center'
        //     }).setOrigin(0.5).setDepth(10).setScale(0.25);
            
        //     // 添加到數組
        //     this.playerAvatars.push(avatar);
        //     this.playerNames.push(nameText);
        //     this.playerNames.push(chipsText);
            
        //     // 創建選中座位對象
        //     selectedSeat = {
        //         index: selectedIndex,
        //         originalIndex: selectedIndex,
        //         object: avatar,
        //         nameText: nameText,
        //         chipsText: chipsText,
        //         x: selectedSeatX,
        //         y: selectedSeatY,
        //         isSelected: true
        //     };
            
        //     // 添加到座位對象數組
        //     seatObjects.push(selectedSeat);
        // }
        
        // // 開始旋轉動畫
        // let currentRotation = 0;
        // const rotationSpeed = 0.01; // 每幀旋轉的角度
        // const maxRotation = (Math.PI * 2 / maxPlayers) * rotationSteps; // 需要旋轉的總角度

        // // 創建一個動畫更新函數
        // const rotateSeats = () => {

        //     // 檢查場景是否還活著
        //     if (!this.scene || typeof this.scene.isActive !== 'function' || !this.scene.isActive()) {
        //         if (rotationTimer) {
        //             this.time.removeEvent(rotationTimer);
        //         }
        //         return;
        //     }

        //     // 增加當前旋轉角度
        //     currentRotation += rotationSpeed;
            
        //     // 如果達到目標旋轉角度，停止動畫
        //     if (currentRotation >= maxRotation) {
        //         currentRotation = maxRotation;
        //         this.time.removeEvent(rotationTimer);
                
        //         // 旋轉完成後，將選中的座位移動到牌桌外的左下角
        //         const leftBottomX = width * 0.2;
        //         const leftBottomY = height * 0.8;

        //         // 收集所有需要移動的對象
        //         const objectsToMove = [
        //             selectedSeat.object, 
        //             selectedSeat.nameText, 
        //             selectedSeat.chipsText
        //         ].filter(Boolean); // 過濾掉可能為null的對象
                
        //         // 創建移動動畫
        //         this.tweens.add({
        //             targets: objectsToMove,
        //             x: leftBottomX,
        //             y: leftBottomY,
        //             duration: 500,
        //             ease: 'Power2',
        //             onComplete: () => {
        //                 // 檢查場景是否還活著
        //                 if (!this.scene || typeof this.scene.isActive !== 'function' || !this.scene.isActive()) {
        //                     return;
        //                 }

        //                 // 調整文本的Y位置，確保它們不會重疊
        //                 if (selectedSeat.nameText) {
        //                     selectedSeat.nameText.y = leftBottomY + seatSize/2 + 10;
        //                 }
                        
        //                 if (selectedSeat.chipsText) {
        //                     selectedSeat.chipsText.y = leftBottomY + seatSize/2 + 35;
        //                 }

        //                 // 創建旋轉等待標誌
        //                 // 只對頭像應用旋轉動畫
        //                 // const avatar = this.add.image(selectedSeat.x, selectedSeat.y, 'player');
        //                 const avatar = selectedSeat.object;                        

        //                 // 創建旋轉動畫
        //                 this.tweens.add({
        //                     targets: avatar,
        //                     alpha: { from: 1, to: 0.3 },  // 從完全不透明到70%透明
        //                     duration: 1000,
        //                     yoyo: true,     // 來回淡入淡出
        //                     repeat: -1,     // 無限重複
        //                     ease: 'Sine.easeInOut',  // 使用正弦曲線讓效果更平滑
        //                 });
                        
        //             }
        //         });
        //     }
            
        //     // 更新所有座位的位置
        //     seatObjects.forEach(seat => {
        //         // 計算新的角度
        //         const originalAngle = (Math.PI * 2 / maxPlayers) * seat.originalIndex - Math.PI / 2;
        //         const newAngle = originalAngle + currentRotation;
                
        //         // 計算新的位置
        //         const newX = centerX + Math.cos(newAngle) * (tableWidth * 0.42);
        //         const newY = centerY + Math.sin(newAngle) * (tableHeight * 0.45);
                
        //         // 更新位置
        //         if (seat.object) {
        //             seat.object.setPosition(newX, newY);
        //         }
                
        //         // 更新名稱文本位置
        //         if (seat.nameText) {
        //             seat.nameText.setPosition(newX, newY + seatSize/2 + 10);
        //         }

        //         // 更新籌碼文本位置
        //         if (seat.chipsText) {
        //             seat.chipsText.setPosition(newX, newY + seatSize/2 + 35);
        //         }
        //     });
        // };
        
        // // 創建定時器來執行旋轉動畫
        // const rotationTimer = this.time.addEvent({
        //     delay: 2, // 約60fps
        //     callback: rotateSeats,
        //     callbackScope: this,
        //     loop: true
        // });

        
    }
    
    // 連接到遊戲狀態管理器
    connectToGameState() {

        this.tableStateUpdateHandler = (tableState: any) => {
            // 首先檢查場景是否存在且活躍
            if (!this.scene || !this.scene.isActive || typeof this.scene.isActive !== 'function') {
                console.log('場景已被銷毀，忽略更新');
                return;
            }

            // 檢查場景是否活躍
            if (!this.scene.isActive()) {
                console.log('場景不活躍，忽略更新');
                return;
            }

            // 檢查 this.add 是否可用
            if (!this.add) {
                console.log('this.add 不可用，忽略更新');
                return;
            }

            // 檢查場景是否準備好
            if (!this.sceneReady) {
                console.log('場景未準備好，忽略更新');
                return;
            }

            //創建座位
            if (tableState.allSeats) {
                this.createPlayerSeats();
                this.createPlayerChips();
            }

            if(tableState.betSwitch === true){
                this.createPlayerChips();
            }

            // 公共牌
            if(tableState.publicCard){
                this.createCommunityCardArea();
            }

            // 底池和贏家信息
            if(tableState.potAmountBox){
                this.createPotText();
            }

            // 贏家列表
            if(Object.keys(tableState.potWinner).length > 0){
                this.createPotText();
            }
            
            // 安全地檢查場景是否活躍
            let isSceneActive = false;
            try {
                isSceneActive = this.scene && this.scene.isActive && typeof this.scene.isActive === 'function' && this.scene.isActive();
            } catch (e) {
                return; // 如果檢查出錯，直接返回
            }

            // 如果場景不活躍，不創建座位
            if (isSceneActive && this.sceneReady) {
                this.createPlayerSeats(); // 重新創建座位顯示
                this.createCommunityCardArea(); // 重新創建公共牌區域
                this.createPotText(); // 重新創建底池顯示
            } else {
                console.log('場景未準備好或不活躍，忽略更新');
            }
        }

        // 使用具名函數註冊事件
        EventBus.on('table-state-updated', this.tableStateUpdateHandler);
        
    }

    // 更新遊戲狀態
    updateGameState(state: any) {
        // console.log('PokerMainMenu 收到遊戲狀態更新:', state);
        
        // 更新 GameStateManager 中的牌桌狀態
        if (state && state.table) {
            gameStateManager.updateTableState({
                maxPlayers: state.table.maxPlayers || 6,
                currentPlayers: state.table.players || [],
                // 其他牌桌相關數據
            });
        }
        
        // 安全地檢查場景是否活躍
        let isSceneActive = false;
        try {
            isSceneActive = this.scene && this.scene.isActive && typeof this.scene.isActive === 'function' && this.scene.isActive();
        } catch (e) {
            // console.log('檢查場景活躍狀態時出錯:', e);
            return; // 如果檢查出錯，直接返回
        }

        // 如果場景不活躍，不創建座位
        if (isSceneActive && this.sceneReady) {
            this.createPlayerSeats(); // 重新創建座位
        } else {
            console.log('場景未準備好或不活躍，忽略更新');
        }
    }

    update() {
        // 更新FPS顯示
        if (this.fpsText) {
            this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
        }
    }

    // 在場景關閉時清理資源
    shutdown() {
        try {
            // 標記場景未準備好
            this.sceneReady = false;
            
            // 移除事件監聽器 - 使用具名函數確保正確移除
            if (this.tableStateUpdateHandler) {
                EventBus.off('table-state-updated', this.tableStateUpdateHandler);
            }
            
            // 清空座位
            this.clearSeats();

            // 清理底池相關對象
            this.clearPotObjects();
            
            // Perform any additional cleanup logic here if needed
            // this.scene.stop('PokerMainMenu'); // 停止場景
            this.sceneReady = true;
        } catch (error) {
            console.error('關閉場景時出錯:', error);
        }
    }

    // 清理底池相關對象
    clearPotObjects() {
        // 清理底池文本
        if (this.potText && this.potText.destroy) {
            this.potText.destroy();
        }
        
        // 清理贏家文本
        this.winnerTexts.forEach(text => {
            if (text && text.destroy) {
                text.destroy();
            }
        });
        
        // 清理籌碼精靈
        this.chipSprites.forEach(sprite => {
            if (sprite && sprite.destroy) {
                sprite.destroy();
            }
        });
        
        // 重置數組
        this.winnerTexts = [];
        this.chipSprites = [];
    }

    // 場景銷毀時的清理
    destroy() {
        // this.sceneReady = false;
        EventBus.off('table-state-updated');
        // Call shutdown or cleanup logic here if needed
        // this.scene.stop(); // Stops the scene
        this.seatManager = new SeatManager(this); // 重置座位管理器
        if (this.seatManager) {
            this.clearSeats(); // 清空座位
        }
        this.seatManager = null;
    }

}