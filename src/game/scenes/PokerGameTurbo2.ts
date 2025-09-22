import { GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { gameStateManager } from '../GameStateManager';
import { SeatGame } from '../utils/SeatGame';
import { ChipAnimations } from '../utils/ChipAnimations';
import { BetSliderManager } from '../utils/BetSliderManager';
import { ActionButtonManager } from '../utils/ActionButtonManager';
import { PotGame } from '../utils/PotGame';

export class PokerGameTurbo extends Scene
{
    // 基本屬性
    background: GameObjects.Image;
    tableImage: GameObjects.Image;
    
    // 玩家相關
    playerAvatars: (GameObjects.Image | null)[] = [];
    playerNames: (GameObjects.Text | null)[] = [];
    playerChips: (GameObjects.Text | null)[] = [];
    playerBetChips: (GameObjects.Text | null)[] = [];
    playerCards: (GameObjects.Image | null)[][] = []; // 二維數組，每個玩家有多張牌
    allCards: (GameObjects.Image | null)[][] = [];
    playerInfoBox: (GameObjects.Rectangle | null)[] = [];
    tableStatusText: (GameObjects.Text | null)[] = [];
    showHoleCards: (GameObjects.Image | null)[] = [];
    playerSeatButton: (GameObjects.Image | null)[] = []; // 添加座位按鈕數組

    private seatManager: SeatGame;
    private chipAnimations: ChipAnimations; // 新增籌碼動畫管理器
    private potGame: PotGame; // 底池管理器
    
    // 遊戲狀態
    private tableId: string = '';
    private playerSeat: number = 0;
    private buyInAmount: number = 0;
    private sceneReady: boolean = false;
    
    // 公共牌區
    communityCards: GameObjects.Image[] = [];

    // 遊戲數據
    currentTableState: any;

    // 底池
    potText: GameObjects.Text | null;
    potIcon: GameObjects.Image | null;

    //下注池
    collectText:  GameObjects.Text | null;
    collectIcon: GameObjects.Image | null;

    winnerTexts : (GameObjects.Text | GameObjects.Image | null)[] = [];
    chipSprites: (GameObjects.Shape | GameObjects.Text)[] = [];
    // betChipAnimations: boolean = false; // 標記是否正在進行籌碼動畫
    // lastBetChipsState: any = {}; // 用於記錄上一次的下注狀態

    // 離開按鈕
    exitButton: GameObjects.Image;
    
    // 動作按鈕
    private actionButtons: Phaser.GameObjects.Container[] = [];

    // 動作按鈕管理器
    private betSliderManager: BetSliderManager;
    private actionButtonManager: ActionButtonManager;

    // 離開按鈕
    leaveButton: GameObjects.Image;

    //下注滑桿
    private betSliderContainer: Phaser.GameObjects.Container | null = null;
    private betSliderHandle: Phaser.GameObjects.Rectangle | null = null;
    private betAmountText: Phaser.GameObjects.Text | null = null;
    private currentBetAmount: string = '0';
    
    constructor()
    {
        super('PokerGameTurbo');
    }
    
    init(data: any) {
        try {

            // 獲取當前遊戲的實際寬高
            const { width, height } = this.scale;

            // 使用實際的遊戲寬高來定位元素，而不是固定值
            this.add.image(width / 2, height / 2, 'background')
                .setDisplaySize(width, height); // 設置背景圖片大小為整個畫面
            
            this.currentTableState = gameStateManager.tableState
            // console.log('PokerGame 初始化數據:', this.currentTableState);

            // 重置場景狀態
            // this.sceneReady = false;
            
            // 從場景初始化參數中獲取數據
            if (data && data.tableId) {
                this.tableId = data.tableId || '';
                this.playerSeat = data.playerSeat || 0;
                this.buyInAmount = data.buyInAmount || 0;
            }
            
            // 清空所有數組
            this.playerAvatars = [];
            this.playerNames = [];
            this.playerChips = [];
            this.playerCards = [];
            this.communityCards = [];
            this.playerInfoBox = [];
            this.tableStatusText = [];
            this.tableStatusText = [];
            this.allCards = [];
            this.showHoleCards = [];
            this.playerSeatButton = [];
            
            console.log(`初始化急速桌遊戲場景，牌桌ID: ${this.tableId}, 座位: ${this.playerSeat}, 買入: ${this.buyInAmount}`);
        } catch (error) {
            console.error('初始化遊戲場景時出錯:', error);
        }
    }
    
    create() {
        try {
            // 獲取螢幕尺寸
            // const { width, height } = this.scale;
            
            // 確保在使用前初始化 SeatManager
            this.seatManager = new SeatGame(this);
            // console.log('SeatManager 已初始化:', this.seatManager);

            // 初始化籌碼動畫管理器
            this.chipAnimations = new ChipAnimations(this);
            // console.log('ChipAnimations 已初始化:', this.chipAnimations);

            // 初始化底池管理器
            this.potGame =new PotGame(this, this.chipAnimations);
            // console.log('PotManager 已初始化:', this.potManager);

             // 初始化管理器
            this.betSliderManager = new BetSliderManager(this);
            this.actionButtonManager = new ActionButtonManager(this);
            this.actionButtonManager.setBetSliderManager(this.betSliderManager);
            
            // 連接到遊戲狀態
            this.connectToGameState();
            
            // 創建底池顯示
            this.createPotText();
            
            // 創建公共牌區域
            this.createCommunityCardArea();
            
            // 創建玩家位置
            this.createPlayerPositions();

            //創建自己的手牌
            this.createMyCards();

            // 創建離開按鈕
            this.createLeaveButton();

            // 創建遊戲狀態文字
            this.createGameStateText();

            // 創建動作按鈕
            this.createActionButtons();

            // 創建離開按鈕
            this.createExitButton();
            
            // 標記場景已準備好
            this.sceneReady = true;

            // 主動再次請求最新數據 (確保有最新數據)
            this.time.delayedCall(100, () => {
                if (this.scene && this.scene.isActive()) {
                    gameStateManager.getTableState();
                }
            });
            
            // 發送場景準備好的事件
            EventBus.emit('current-scene-ready', this);
            // console.log('PokerGame scene ready');
        } catch (error) {
            console.error('創建遊戲場景時出錯:', error);
        }
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

    // 創建自己的手牌
    createMyCards() {
        const { width, height } = this.scale;

        // 獲取當前玩家頭像位置
        const leftBottomX = width * 0.2;
        const leftBottomY = height * 0.75;
                      
        // 手牌尺寸設定 - 可以根據需要調整
        const cardWidth = 35;
        const cardHeight = 50;
        const cardSpacing = 40;

        // 手牌位置 - 在頭像上方
        const startX = leftBottomX;
        const startY = leftBottomY - 50; // 頭像上方80像素

        // 安全地獲取玩家手牌數據
        let myHandCard = [];

        if (gameStateManager.tableState && gameStateManager.tableState.myHandCard) {
            // 檢查是否為數組且有內容
            if (Array.isArray(gameStateManager.tableState.myHandCard) && 
                gameStateManager.tableState.myHandCard.length > 0) {
                myHandCard = [...gameStateManager.tableState.myHandCard]; // 創建一個副本避免響應式問題
            } else {
                // console.log('手牌數據不是有效數組，使用默認值');
                myHandCard = ['XX', 'XX']; // 使用默認值
            }
        } else {
            // console.log('沒有找到手牌數據，使用默認值');
            myHandCard = ['XX', 'XX']; // 使用默認值
        }

        // 清除之前的手牌（如果有）
        const myPlayerIndex = gameStateManager.tableState.currentPlayers?.length || 0;
        
        // 確保 this.playerCards[myPlayerIndex] 存在
        if (!this.playerCards[myPlayerIndex]) {
            this.playerCards[myPlayerIndex] = [];
        } else {
            // 清除現有的卡牌
            this.playerCards[myPlayerIndex].forEach(card => {
                if (card && card.destroy) card.destroy();
            });
            this.playerCards[myPlayerIndex] = [];
        }

        // 確保有兩張牌
        if (myHandCard.length === 2) {
            // 計算第一張牌的位置
            const firstCardX = startX - cardSpacing/2;
            // 計算第二張牌的位置
            const secondCardX = startX + cardSpacing/2;
            
            // 創建第一張牌
            let firstCardImage;
            if (this.textures.exists(myHandCard[0])) {
                firstCardImage = this.add.image(firstCardX, startY, myHandCard[0])
                    .setDisplaySize(cardWidth, cardHeight)
                    .setDepth(15);
            } else {
                firstCardImage = this.add.rectangle(firstCardX, startY, cardWidth, cardHeight, 0x000066, 0.8)
                    .setStrokeStyle(2, 0xffffff)
                    .setDepth(15) as any;
                
                const firstCardText = this.add.text(firstCardX, startY, myHandCard[0], {
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    color: '#ffffff',
                    align: 'center'
                }).setOrigin(0.5).setDepth(16);
                
                this.playerCards[myPlayerIndex].push(firstCardText as any);
            }
            
            // 創建第二張牌
            let secondCardImage;
            if (this.textures.exists(myHandCard[1])) {
                secondCardImage = this.add.image(secondCardX, startY, myHandCard[1])
                    .setDisplaySize(cardWidth, cardHeight)
                    .setDepth(15);
            } else {
                secondCardImage = this.add.rectangle(secondCardX, startY, cardWidth, cardHeight, 0x000066, 0.8)
                    .setStrokeStyle(2, 0xffffff)
                    .setDepth(15) as any;
                
                const secondCardText = this.add.text(secondCardX, startY, myHandCard[1], {
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    color: '#ffffff',
                    align: 'center'
                }).setOrigin(0.5).setDepth(16);
                
                this.playerCards[myPlayerIndex].push(secondCardText as any);
            }
            
            // 添加到玩家卡牌數組
            this.playerCards[myPlayerIndex].push(firstCardImage);
            this.playerCards[myPlayerIndex].push(secondCardImage);

            // 清除之前的秀手牌按鈕（如果有）
            this.showHoleCards.forEach(card => {
                if (card && card.destroy) card.destroy();
            });
            this.showHoleCards = [];

            // 添加秀手牌按鈕（眼睛圖標）
            const eyeSize = 20;
            const eyeY = startY; // 在卡牌下方放置眼睛圖標
            
            // 創建左邊的眼睛圖標（用於顯示第一張牌）
            const leftEyeIcon = this.add.image(firstCardX, eyeY, 'eye')
                .setDisplaySize(eyeSize, eyeSize)
                .setDepth(16)
                .setInteractive()
                .setVisible(false); // 默認隱藏
                
            // 創建右邊的眼睛圖標（用於顯示第二張牌）
            const rightEyeIcon = this.add.image(secondCardX, eyeY, 'eye')
                .setDisplaySize(eyeSize, eyeSize)
                .setDepth(16)
                .setInteractive()
                .setVisible(false); // 默認隱藏
                
            // 添加點擊事件
            leftEyeIcon.on('pointerdown', () => {
                // 點擊左邊眼睛時顯示第一張牌
                console.log('顯示第一張牌');
                gameStateManager.showHandApi(1);
                
                // 添加點擊視覺反饋
                this.tweens.add({
                    targets: leftEyeIcon,
                    scale: { from: 1.2, to: 1 },
                    duration: 150,
                    ease: 'Power2'
                });
            });
            
            rightEyeIcon.on('pointerdown', () => {
                // 點擊右邊眼睛時顯示第二張牌
                console.log('顯示第二張牌');
                gameStateManager.showHandApi(2);
                
                // 添加點擊視覺反饋
                this.tweens.add({
                    targets: rightEyeIcon,
                    scale: { from: 1.2, to: 1 },
                    duration: 150,
                    ease: 'Power2'
                });
            });
            
            // 將眼睛圖標添加到數組中
            this.showHoleCards.push(leftEyeIcon);
            this.showHoleCards.push(rightEyeIcon);
            
            // 根據 showHoleCardsButton 狀態顯示或隱藏眼睛圖標
            if (gameStateManager.tableState.showHoleCardsButton === true) {
                leftEyeIcon.setVisible(true);
                rightEyeIcon.setVisible(true);
            }
            
        } else {
            console.error('手牌數據不正確:', myHandCard);
        }
    }

    // 創建動作按鈕
    createActionButtons() {

        this.actionButtons = this.actionButtonManager.createActionButtons(gameStateManager);

    }

    // 更新下注按鈕上顯示的金額
    updateBetButtonTexts() {
        this.actionButtons.forEach(button => {
            const action = button.getData('action');
            if (action === 'bet' || action === 'raise') {
                const textObject = button.getData('textObject');
                if (textObject) {
                    textObject.setText(`${action} $${this.currentBetAmount}`);
                }
            }
        });
    }

    // 處理動作按鈕點擊
    handleActionButtonClick(action: string) {
        // console.log(`玩家點擊了 ${action} 按鈕`);
        this.actionButtonManager.handleActionButtonClick(action);
    }

    // 創建底池顯示
    createPotText() {
        // 使用 PotManager 創建底池顯示
        this.potGame.createPotText(gameStateManager.tableState);
        
        // 更新引用
        this.potText = this.potGame.potText;
        this.potIcon = this.potGame.potIcon;
        this.collectText = this.potGame.collectText;
        this.collectIcon = this.potGame.collectIcon;

        this.winnerTexts = this.potGame.winnerTexts;
        this.chipSprites = this.potGame.chipSprites;
    }

    //創建遊戲狀態文字
    createGameStateText() {

        // 清除之前的文字
        this.tableStatusText.forEach(text => {
            if (text) {
                text.destroy();
            }
        });
        this.tableStatusText = [];
        
        // 創建新的文字
        const { width, height } = this.scale;
        const text = this.add.text(width / 2, 30, gameStateManager.tableState.playHand, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5).setDepth(2);

        this.tableStatusText.push(text);
    }

    // 創建離開按鈕
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
                if(gameStateManager.tableState?.tableType === "turbo"){
                    gameStateManager.leaveTableApi(gameStateManager.tableState?.groupId);
                    // window.location.href = '/game/#/select';
                }else{
                    gameStateManager.leaveTableApi(gameStateManager.tableState?.tableId);
                }
            }
        });
    }

    
    // 創建公共牌區域
    createCommunityCardArea() {

        // 確保 this.communityCards 已初始化
        if (!this.communityCards) {
            this.communityCards = [];
        }

        const { width, height } = this.scale;
        const cardWidth = 35;
        const cardSpacing = 10;
        const offsetRight = 20; // 向右偏移的像素值，可以根據需要調整
        const startX = width / 2 - (cardWidth * 2.5 + cardSpacing * 2) + offsetRight;
        const y = height / 2 - 40;

        // 計算卡片的寬度和高度，保持合適的長寬比例
        const cardSizeWidth = Math.min(width, height) * 0.1; // 寬度稍小一些
        const cardSizeHeight = cardSizeWidth * 1.4; // 高度是寬度的1.4倍，符合撲克牌比例

        const cards = gameStateManager.tableState?.publicCard || [];

        // 清除之前的公共牌
        this.communityCards.forEach(card => {
            if (card && card.destroy) card.destroy();
        });
        this.communityCards = []; // 清空之前的公共牌數組
        
        // 創建5個卡牌位置（翻牌前、轉牌、河牌）
        for (let i = 0; i < 5; i++) {
            const x = startX + (cardWidth + cardSpacing) * i;

            if(cards[i]){
                // 創建卡牌正面
                const cardFront = this.add.image(x, y, cards[i])
                    .setDisplaySize(cardSizeWidth, cardSizeHeight)
                    .setDepth(10);
                // 將卡牌正面添加到公共牌數組
                this.communityCards.push(cardFront as any); 
            }else{
                // 創建卡牌背面
                const cardBack = this.add.image(x, y, 'XX')
                .setDisplaySize(cardSizeWidth, cardSizeHeight)
                .setDepth(10);

                // 將背面加到公共牌數組
                this.communityCards.push(cardBack as any);
            }
        }
    }

    // 清空座位
    clearSeats() {
        this.seatManager.clearSeats();
    }
    
    // 創建玩家位置
    createPlayerPositions() {
        try {
            // 使用 SeatManager 創建座位
            const seats = this.seatManager.createPlayerPositions(gameStateManager);
            
            // 更新場景中的座位相關數組
            this.playerAvatars = seats?.playerAvatars ?? [];
            this.playerNames = seats?.playerNames ?? [];
            this.playerChips = seats?.playerChips ?? [];
            this.playerBetChips = seats?.playerBetChips ?? [];
            this.playerInfoBox = seats?.playerInfoBox ?? [];
            this.allCards = seats?.allCards ?? [];
            this.playerCards = seats?.playerCards ?? [];
            this.playerSeatButton = seats?.playerSeatButton ?? [];
        } catch (error) {
            console.error('創建玩家位置時出錯:', error);
        }
        
    }
    
    // 連接到遊戲狀態
    connectToGameState() {
        // 監聽牌桌狀態更新
        EventBus.on('table-state-updated', (tableState: any) => {
            // console.log(`牌桌 ${this.tableId} 狀態更新:`, tableState);

            // 更新當前狀態
            this.currentTableState = { ...tableState };

            // 使用專門的方法獲取座位號
            const myNumber = gameStateManager.getPlayerSeatNumber();
            const key = myNumber - 1; // 將座位號轉換為索引

            if(gameStateManager.tableState.turboData.waitButton === true){

                this.time.delayedCall(500, () => {
                    // 再次检查状态
                    if(gameStateManager.tableState.turboData.waitButton === true) {
                        console.log('确认玩家已离开牌桌，切换到结束画面');
                        this.scene.start('PokerWait');
                    }
                });
            }

            // 玩家座位資料
            if (tableState.currentPlayers) {
                this.createPlayerPositions();
            }

            //計時器
            if(tableState.seatTime){
                this.createPlayerPositions();
            }

            //自己手牌
            if(tableState.myHandCard){
                this.createMyCards();
            }

            //能不能秀牌
            if(tableState.showHoleCardsButton === true){
                this.createMyCards();
            }

            //動作按鈕
            if(tableState.canDoAction){
                this.createActionButtons();
            }

            // 公共牌
            if(tableState.publicCard){
                this.createCommunityCardArea();
            }

            const potCopy = tableState.potAmountBox || "0";

            //籌碼底池
            if(tableState.potAmountBox){
                if(this.potText !== potCopy){
                    this.createPotText();
                }
            }

            //下注主池
            if(tableState.potCollectBox){
                this.createPotText();
            }

            // 贏家列表
            if(tableState.potWinner){
                this.createPotText();
            }

            //遊戲狀態
            if(tableState.playHand){
                this.createGameStateText();
            }
        });
    }
    
    // 更新場景
    update() {
        // 檢查是否需要返回等待場景
        // if (gameStateManager.tableState && gameStateManager.tableState.turboData.waitButton === true) {
                
        //     // 延遲一下再確認狀態
        //     this.time.delayedCall(300, () => {
        //         if (gameStateManager.tableState.turboData.waitButton === true) {
        //             console.log('確認玩家需要等待，切換到 PokerWait 場景');
        //             this.load.on('complete', () => {
        //                 this.scene.start('PokerWait');
        //             });
        //             // this.scene.start('PokerWait');
        //         }
        //     });
        // }
    }
    
    // 場景關閉時清理資源
    shutdown() {
        try {
            // 標記場景未準備好
            this.sceneReady = false;
            
            // 移除事件監聽器
            // EventBus.off('table-state-updated' );
            
            // 使用 seatManager 清理座位
            this.seatManager.clearSeats();

            //清除玩家籌碼
            this.potGame.clearPotAndWinnerTexts();

            // 清理管理器
            if (this.actionButtonManager) {
                this.actionButtonManager.destroy();
            }

            // 清除下注拉桿
            if (this.betSliderContainer) {
                this.betSliderContainer.destroy();
                this.betSliderContainer = null;
                this.betSliderHandle = null;
                this.betAmountText = null;
            }
            
            // 清理所有遊戲物件
            this.clearAllGameObjects();

            // 清理 PotManager
            if (this.potGame) {
                this.potGame.destroy();
            }

            // 停止所有正在進行的 tweens
            this.tweens.killAll();

            this.seatManager = new SeatGame(this);
            gameStateManager.setPlayerSeatNumber(0);
            
        } catch (error) {
            console.error('關閉遊戲場景時出錯:', error);
        }
    }

    // 新增清理所有遊戲物件的方法
    clearAllGameObjects() {
        // 清理其他非座位相關的陣列
        [this.communityCards, this.winnerTexts, this.chipSprites, this.tableStatusText].forEach(arr => {
            if (arr) {
                arr.forEach(obj => {
                    if (obj && obj.destroy) obj.destroy();
                });
            }
        });

        // 清理容器和其他物件
        if (this.betSliderContainer){
            this.betSliderContainer.destroy();
            this.betSliderContainer = null;
            this.betSliderHandle = null;
            this.betAmountText = null;
        } 
        if (this.leaveButton) this.leaveButton.destroy();
        this.actionButtons.forEach(btn => {
            if (btn && btn.destroy) btn.destroy();
        });

        // 重置其他陣列
        this.communityCards = [];
        this.tableStatusText = [];
        this.winnerTexts = [];
        this.chipSprites = [];
        this.actionButtons = [];
    }
}