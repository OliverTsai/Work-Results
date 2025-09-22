import { GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { gameStateManager } from '../GameStateManager';
import { SeatGame } from '../utils/SeatGame';
import { ChipAnimations } from '../utils/ChipAnimations';
import { BetSliderManager } from '../utils/BetSliderManager';
import { ActionButtonManager } from '../utils/ActionButtonManager';
import { PotGame } from '../utils/PotGame';
import { Chips } from '../utils/Chips'

export class PokerGame extends Scene
{
    // 基本屬性
    background: GameObjects.Image;
    Table:GameObjects.Image;
    tableImage: GameObjects.Image;

    // 添加 SeatManager 實例
    private seatGame: SeatGame | null = null;

    // 在 PokerGame 類中添加 seats 屬性
    private seats: any[] = [];
    private chips:any[] = [];
    
    // 玩家相關
    playerAvatars: (GameObjects.Image | null)[] = [];
    playerNames: (GameObjects.Text | null)[] = [];
    playerChips: (GameObjects.Text | null)[] = [];
    playerBetChips: (GameObjects.Text | null)[] = [];
    playerCards: (GameObjects.Image | null)[][] = []; // 二維數組，每個玩家有多張牌
    allCards: (GameObjects.Image | null)[][] = [];
    playerInfoBox: (GameObjects.Image | null)[] = [];
    tableStatusText: (GameObjects.Text | null)[] = [];
    showHoleCards: (GameObjects.Image | null)[] = [];
    playerSeatButton: (GameObjects.Image | null)[] = []; // 添加座位按鈕數組

    playerContainers: (GameObjects.Container | null)[] = [];

    playerTempBetChips: (GameObjects.Text | null)[] = [];

    private chipAnimations: ChipAnimations; // 新增籌碼動畫管理器
    private potGame: PotGame; // 底池管理器
    
    // 遊戲狀態
    private tableId: string = '';
    private playerSeat: number = 0;
    private buyInAmount: number = 0;
    private sceneReady: boolean = false;
    private fpsText: GameObjects.Text | null = null;

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
    mySeatButtons: Phaser.GameObjects.Text[] = [];
    myHandCards: Phaser.GameObjects.Image[] = [];

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

    private tableStateUpdateCallback: ((tableState: any) => void) | null = null;
    
    constructor()
    {
        super('PokerGame');
    }
    
    init(data: any) {
        try {
            
            this.currentTableState = gameStateManager.tableState
            // console.log('PokerGame 初始化數據:', this.currentTableState);

            // 重置場景狀態
            this.sceneReady = false;
            
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
            
            // console.log(`初始化遊戲場景，牌桌ID: ${this.tableId}, 座位: ${this.playerSeat}, 買入: ${this.buyInAmount}`);
        } catch (error) {
            console.error('初始化遊戲場景時出錯:', error);
        }
    }
    
    create() {
        try {
            // 獲取螢幕尺寸
            const { width, height } = this.scale;
            
            // 添加背景
            this.background = this.add.image(0, 0, 'background')
                .setOrigin(0, 0)
                .setDisplaySize(width, height);

            // 添加背景2
            this.Table = this.add.image(width/2, height/2 + 20, 'Table')
                .setScale(0.9);

            //fps
            this.fpsText = this.add.text(10, 10, "FPS: 0", {
                fontSize: "24px",
                color: "#ffffff",
            });

            // 確保在使用前初始化 SeatManager
            this.seatGame = new SeatGame(this);
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

            // 創建離座按鈕
            this.createLeaveButton();

            // 創建遊戲狀態文字
            this.createGameStateText();

            // 創建動作按鈕
            this.createActionButtons();

            // 創建返回按鈕
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

    // 創建返回按鈕
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
        const cardWidth = 70;
        const cardHeight = 100;
        const cardSpacing = 40;

        // 手牌位置 - 在頭像上方
        const startX = leftBottomX;
        const startY = leftBottomY + 40;

        // 獲取牌桌ID
        const tableId = gameStateManager.tableState.tableId;

        // 安全地獲取玩家手牌數據
        let myHandCard = gameStateManager.tableState.mySeatList[tableId].myHandCard || ['XX', 'XX']; // 默認為空數組
        // let myHandCard = ['XX', 'XX']; // 默認為空數組

        if (gameStateManager.tableState.mySeatList[tableId] && gameStateManager.tableState.mySeatList[tableId].myHandCard) {
            // 檢查是否為數組且有內容
            if (Array.isArray(gameStateManager.tableState.mySeatList[tableId].myHandCard) && 
                gameStateManager.tableState.mySeatList[tableId].myHandCard.length > 0) {
                myHandCard = [...gameStateManager.tableState.mySeatList[tableId].myHandCard]; // 創建一個副本避免響應式問題
            } else {
                // console.log('手牌數據不是有效數組，使用默認值');
                myHandCard = ['XX', 'XX']; // 使用默認值
            }
        } else {
            // console.log('沒有找到手牌數據，使用默認值');
            myHandCard = ['XX', 'XX']; // 使用默認值
        }

        // 清除之前的手牌（如果有）
        const myPlayerIndex = this.myHandCards.length || 0;
        
        // 確保 this.playerCards[myPlayerIndex] 存在
        // if (!this.playerCards[myPlayerIndex]) {
        //     this.playerCards[myPlayerIndex] = [];
        // } else {
        //     // 清除現有的卡牌
        //     this.playerCards[myPlayerIndex].forEach(card => {
        //         if (card && card.destroy) card.destroy();
        //     });
        //     this.playerCards[myPlayerIndex] = [];
        // }

        //如果有資料則清除
        if (this.myHandCards.length > 0) {
            this.myHandCards.forEach(card => {
                if (card && card.destroy) card.destroy();
            });
        }

        // 確保有兩張牌
        if (myHandCard.length >= 1) {
            // 計算第一張牌的位置
            const firstCardX = startX - cardSpacing/4 - 15;
            // 計算第二張牌的位置
            const secondCardX = startX + cardSpacing/4 + 15;
            
            // 創建第一張牌
            let firstCardImage;
            if (this.textures.exists(myHandCard[0])) {
                firstCardImage = this.add.image(firstCardX, startY, myHandCard[0])
                    .setDisplaySize(cardWidth, cardHeight)
                    .setDepth(15)
                    .setAngle(-15);
            } else {
                firstCardImage = this.add.rectangle(firstCardX, startY, cardWidth, cardHeight, 0x000066, 0.8)
                    .setStrokeStyle(2, 0xffffff)
                    .setDepth(15)
                    .setAngle(-15) as any;
                
                const firstCardText = this.add.text(firstCardX, startY, myHandCard[0], {
                    fontFamily: 'Arial',
                    fontSize: '32px',
                    color: '#ffffff',
                    align: 'center'
                }).setOrigin(0.5).setDepth(16).setScale(0.5).setAngle(-15);
                
                this.playerCards[myPlayerIndex].push(firstCardText as any);
            }
            
            // 創建第二張牌
            let secondCardImage;
            if (this.textures.exists(myHandCard[1])) {
                secondCardImage = this.add.image(secondCardX, startY, myHandCard[1])
                    .setDisplaySize(cardWidth, cardHeight)
                    .setDepth(15)
                    .setAngle(15);
            } else {
                secondCardImage = this.add.rectangle(secondCardX, startY, cardWidth, cardHeight, 0x000066, 0.8)
                    .setStrokeStyle(2, 0xffffff)
                    .setDepth(15)
                    .setAngle(15) as any;
                
                const secondCardText = this.add.text(secondCardX, startY, myHandCard[1], {
                    fontFamily: 'Arial',
                    fontSize: '32px',
                    color: '#ffffff',
                    align: 'center'
                }).setOrigin(0.5).setDepth(16).setScale(0.5).setAngle(15);
                
                this.playerCards[myPlayerIndex].push(secondCardText as any);
            }
            
            // 添加到玩家卡牌數組
            this.myHandCards.push(firstCardImage);
            this.myHandCards.push(secondCardImage);

            // // 清除之前的秀手牌按鈕（如果有）
            // this.showHoleCards.forEach(card => {
            //     if (card && card.destroy) card.destroy();
            // });
            // this.showHoleCards = [];

            // // 添加秀手牌按鈕（眼睛圖標）
            // const eyeSize = 20;
            // const eyeY = startY; // 在卡牌下方放置眼睛圖標
            
            // // 創建左邊的眼睛圖標（用於顯示第一張牌）
            // const leftEyeIcon = this.add.image(firstCardX, eyeY, 'eye')
            //     .setDisplaySize(eyeSize, eyeSize)
            //     .setDepth(16)
            //     .setInteractive()
            //     .setVisible(false); // 默認隱藏
                
            // // 創建右邊的眼睛圖標（用於顯示第二張牌）
            // const rightEyeIcon = this.add.image(secondCardX, eyeY, 'eye')
            //     .setDisplaySize(eyeSize, eyeSize)
            //     .setDepth(16)
            //     .setInteractive()
            //     .setVisible(false); // 默認隱藏
                
            // 添加點擊事件
            // leftEyeIcon.on('pointerdown', () => {
            //     // 點擊左邊眼睛時顯示第一張牌
            //     console.log('顯示第一張牌');
            //     gameStateManager.showHandApi(1);
                
            //     // 添加點擊視覺反饋
            //     this.tweens.add({
            //         targets: leftEyeIcon,
            //         scale: { from: 1.2, to: 1 },
            //         duration: 150,
            //         ease: 'Power2'
            //     });
            // });
            
            // rightEyeIcon.on('pointerdown', () => {
            //     // 點擊右邊眼睛時顯示第二張牌
            //     console.log('顯示第二張牌');
            //     gameStateManager.showHandApi(2);
                
            //     // 添加點擊視覺反饋
            //     this.tweens.add({
            //         targets: rightEyeIcon,
            //         scale: { from: 1.2, to: 1 },
            //         duration: 150,
            //         ease: 'Power2'
            //     });
            // });
            
            // 將眼睛圖標添加到數組中
            // this.showHoleCards.push(leftEyeIcon);
            // this.showHoleCards.push(rightEyeIcon);
            
            // // 根據 showHoleCardsButton 狀態顯示或隱藏眼睛圖標
            // if (gameStateManager.tableState.showHoleCardsButton === true) {
            //     leftEyeIcon.setVisible(true);
            //     rightEyeIcon.setVisible(true);
            // }
            
        } else {
            console.error('手牌數據不正確:', myHandCard);
        }
    }

    // 創建動作按鈕
    createActionButtons() {
        this.actionButtons = this.actionButtonManager.createActionButtons(gameStateManager);
        this.actionButtonManager.createMySeat(gameStateManager);
    }

    //創建自己的頭像跟資料
    createMyData() {
        this.actionButtonManager.createMySeat(gameStateManager);
    }

    showActionButtons() {
        this.actionButtonManager.showActionButtons();
    }

    hideAllActionButtons() {
        this.actionButtonManager.hideActionButtons();
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

    // 根據座位號獲取玩家位置(入座後)
    getPlayerPositionBySeatNumber(seatNumber: number) {
        const { width, height } = this.scale;
        const maxPlayers = gameStateManager.tableState?.maxPlayers || 6;
        const centerX = width / 2;
        const centerY = height / 2;
        const tableWidth = width * 0.9;
        const tableHeight = height * 0.7;
        
        // 獲取當前玩家的座位號
        const myNumber = gameStateManager.getPlayerSeatNumber();
        
        // 如果是當前玩家，返回左下角位置
        if (seatNumber === myNumber) {
            return { x: width * 0.2, y: height * 0.75 };
        }
        
        // 計算要顯示的座位順序（按照順時針排列，從左半邊到右半邊）
        const seatOrder = [];
        for (let i = 1; i <= maxPlayers; i++) {
            // 跳過自己的座位號
            if (i !== myNumber) {
                seatOrder.push(i);
            }
        }
        
        // 調整順序，使座位從右到左圍繞牌桌
        seatOrder.sort((a, b) => {
            // 計算相對於我的座位的距離（逆時針方向）
            const distA = (a - myNumber + maxPlayers) % maxPlayers;
            const distB = (b - myNumber + maxPlayers) % maxPlayers;
            return distA - distB;
        });
        
        // 找到該座位號在排序後的索引
        const index = seatOrder.indexOf(seatNumber);
        
        // 如果找不到該座位號，返回中心位置
        if (index === -1) {
            return { x: centerX, y: centerY };
        }
        
        // 創建270度橢圓形布局的座位
        const startAngle = Math.PI; // 180度（左側）
        const endAngle = 0;         // 0度（右側）
        const totalAngleSpan = endAngle - startAngle;
        
        // 計算座位在240度橢圓上的角度
        const angleRatio = index / (seatOrder.length - 1); // 0到1之間的值
        const angle = startAngle - totalAngleSpan * angleRatio;
        
        // 計算座位位置
        const seatX = centerX + Math.cos(angle) * (tableWidth * 0.45);
        const seatY = centerY + Math.sin(angle) * (tableHeight * 0.55);
        
        return { x: seatX, y: seatY };
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
        const text = this.add.text(width / 2, 100, gameStateManager.tableState.playHand, {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1,
            align: 'center'
        }).setOrigin(0.5).setScale(1).setDepth(2);

        //創建牌桌ID
        const tableIdText = this.add.text(width / 2, height/2 + 20, `牌桌ID: ${gameStateManager.tableState.tableId}`, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1,
            align: 'center'
        }).setOrigin(0.5).setScale(1).setDepth(2);

        this.tableStatusText.push(text);
    }

    // 創建離開按鈕
    createLeaveButton() {
        const { width, height } = this.scale;
        const buttonWidth = 100;
        const buttonHeight = 100;
        const padding = 20;

        if(gameStateManager.tableState?.tournamentId === ""){
            // 創建按鈕，放在右上角
            this.leaveButton = this.add.image(width * 0.85, height * 0.1, 'leave')
                .setDepth(100)
                .setInteractive();

            // 設置按鈕大小
            const buttonScale = 1; // 可以根據需要調整大小
            this.leaveButton.setScale(buttonScale);
            
            // 設置按鈕交互
            this.leaveButton.on('pointerdown', () => {
                this.handleLeaveTable();
            });
        }else{
            // 創建按鈕，放在右上角
            this.leaveButton = this.add.image(width * 0.9, height * 0.1, 'trophy')
                .setScale(0.15)
                .setDepth(100)  // 確保按鈕在最上層
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
                this.leaveButton.disableInteractive();
                
                let leavePromise;

                if(gameStateManager.tableState?.tableType === "turbo"){
                    leavePromise = gameStateManager.leaveTableApi(gameStateManager.tableState?.groupId);
                    // window.location.href = '/game/#/select';
                }else{
                    leavePromise = gameStateManager.leaveTableApi(gameStateManager.tableState?.tableId);
                }

                leavePromise.then(() => {
                    this.leaveButton.setAlpha(0.5);
                }).catch((error) => {
                    console.error('退出桌子時出錯:', error);
                    this.leaveButton.setAlpha(1);
                    this.leaveButton.setInteractive();
                });
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

        const cards = gameStateManager.tableState?.publicCard || [];

        const amount = 5; // 最多顯示5張牌
        const cardsUpWard = 50; // 公共牌向上偏移的像素值
        const cardSize = 0.12; // 卡牌的縮放比例

        // 清除之前的公共牌
        this.communityCards.forEach(card => {
            if (card && card.destroy) card.destroy();
        });
        this.communityCards = []; // 清空之前的公共牌數組
        
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

    // 清空座位
    clearSeats() {
        if (this.seatGame){
            this.seatGame.clearSeats();
        }
    }
    
    // 創建玩家位置
    createPlayerPositions() {
        try {
            // 確保 SeatManager 已初始化
            if (!this.seatGame) {
                // console.log('SeatManager 未初始化，正在創建新實例');
                console.log('SeatManager 未初始化，正在創建新實例');
                this.seatGame = new SeatGame(this);
            }
            // 使用 SeatManager 創建座位
            const seatsObj:any = this.seatGame.createPlayerPositions(gameStateManager);
            this.seats = seatsObj.seats
        } catch (error) {
            console.error('創建玩家位置時出錯:', error);
        }
        
    }

    //創建下注籌碼
    createBetChips() {
        try {
            const tableState = gameStateManager.tableState;

            const { width, height } = this.scale;
            const centerX = width / 2;
            const centerY = height / 2;

            //清空
            this.chips.forEach(chip => {
                if (chip && chip.destroy) chip.destroy();
            });
            this.chips = [];

            //玩家資料
            const seats = tableState.allSeats
            const maxPlayers  = tableState.maxPlayers

            // 使用專門的方法獲取座位號
            const myNumber = gameStateManager.getPlayerSeatNumber();

            // 計算要顯示的座位順序（按照順時針排列，從左半邊到右半邊）
            const seatOrder = [];
            for (let i = 1; i <= maxPlayers; i++) {
                // 跳過自己的座位號
                if (i !== myNumber) {
                    seatOrder.push(i);
                }
            }

            // 調整順序，使座位從右到左圍繞牌桌
            seatOrder.sort((a, b) => {
                // 計算相對於我的座位的距離（逆時針方向）
                const distA = (a - myNumber + maxPlayers) % maxPlayers;
                const distB = (b - myNumber + maxPlayers) % maxPlayers;
                return distA - distB;
            });

            // 定義一個橢圓形路徑來放置座位
            const ellipse = new Phaser.Geom.Ellipse(centerX, centerY, 300, 600);

            // 創建新的籌碼
            const chipObj = new Chips(this);
            let newChips = [];

            //入座後的其他玩家座位
            const otherSeats = maxPlayers - 1;

            for (let i = 1; i <= otherSeats; i++) {
                const chipIndex = i - 1;
                let chipAmount: String = '0';
                //應該對應的玩家座位號
                const newChipNumber = seatOrder[chipIndex];

                if (seats[newChipNumber] && seats[newChipNumber].bet_chips) {
                    chipAmount = seats[newChipNumber].bet_chips;
                }

                const container = chipObj.createChips(this, chipAmount);
                if (container) {
                    newChips.push(container);
                }
            }

            this.chips = newChips;

            const startAngle = Phaser.Math.DegToRad(173);
            const endAngle = Phaser.Math.DegToRad(399);

            // 將籌碼放置在橢圓形路徑上
            Phaser.Actions.PlaceOnEllipse(this.chips, ellipse,startAngle,endAngle);


        }catch(error){
            console.error('創建玩家籌碼時出錯:', error);
        }
    }
    
    // 連接到遊戲狀態
    connectToGameState() {

        const tableId = gameStateManager.tableState?.tableId || '';
         // 創建一個命名的回調函數，這樣我們可以在 shutdown 中引用它

         if(!tableId){
            console.error('無效的牌桌ID，無法連接到遊戲狀態');
            return;
         }
         
        this.tableStateUpdateCallback = (tableState: any) => {
            // console.log(`牌桌 ${this.tableId} 狀態更新:`, tableState);

            // 檢查場景是否存在且活躍
            if (!this.scene || !this.scene.isActive || typeof this.scene.isActive !== 'function') {
                console.log('場景已被銷毀，忽略更新');
                return;
            }

            // 檢查場景是否活躍
            if (!this.scene.isActive()) {
                console.log('場景不活躍，忽略更新');
                return;
            }

            // 更新當前狀態
            this.currentTableState = { ...tableState };

            // 使用專門的方法獲取座位號
            const myNumber = gameStateManager.getPlayerSeatNumber();
            const key = myNumber - 1; // 將座位號轉換為索引

            if(gameStateManager.tableState.sitDownButton === false ){
                // console.log('玩家已經離開了牌桌，切換到結束畫面');
                this.scene.start('PokerGameOver');
            }

            if (!tableState.mySeatList[tableId]) {
                console.warn(`沒有找到牌桌 ${tableId} 的玩家動作狀態`);
                return;
            }

            if(tableState.betSwitch === false){
                this.playerTempBetChips = this.playerBetChips
            }else{
                
                // 添加將籌碼移動到中間的動畫
                if(this.playerTempBetChips && this.playerTempBetChips.length > 0) {
                    const { width, height } = this.scale;
                    const centerX = width / 2;
                    const centerY = height / 2;

                    console.log('籌碼移動到中心',this.playerTempBetChips)
                    
                    // 遍歷所有玩家的臨時下注籌碼
                    this.playerTempBetChips.forEach((betChip, index) => {
                        if(betChip && betChip.active) {
                            // 創建動畫將籌碼移動到中間
                            this.tweens.add({
                                targets: betChip,
                                x: centerX,
                                y: centerY,
                                duration: 500,
                                ease: 'Power2',
                                onComplete: () => {
                                    // 動畫完成後隱藏籌碼
                                    betChip.setVisible(false);
                                    // 清空籌碼文本
                                    if(betChip.setText) {
                                        betChip.setText('');
                                    }
                                }
                            });
                        }
                    });
                    
                    // 動畫完成後清空臨時籌碼數組
                    this.time.delayedCall(600, () => {
                        this.playerTempBetChips = [];
                    });
                }
            }

            //更新自己的資料
            if (tableState.mySeatList[tableId]){
                this.createMyData();
            }

            //更新個人籌碼
            if (tableState.mySeatList[tableId].chips){
                this.createMyData();
            }

            //更新自己的動作
            if (tableState.mySeatList[tableId].canDoActions){
                this.createActionButtons();
            }

            //更新自己的手牌
            if (tableState.mySeatList[tableId].myHandCard && 
            Array.isArray(tableState.mySeatList[tableId].myHandCard) && 
            tableState.mySeatList[tableId].myHandCard.length >= 1){
                this.createMyCards();
            }else{
                //沒有手牌刪除資料
                this.myHandCards.forEach(card => {
                    if (card && card.destroy) card.destroy();
                });
                this.myHandCards = [];
            }

            // 玩家座位資料
            if (tableState.allSeats) {
                this.createPlayerPositions();
                this.createBetChips();
            }

            //計時器
            if(tableState.seatTime){
                this.createPlayerPositions();
                this.createMyData();
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
        };
        
        // 監聽牌桌狀態更新，使用保存的回調函數
        EventBus.on('table-state-updated', this.tableStateUpdateCallback);

    }
    
    // 更新場景
    update() {
        // 可以添加需要每幀更新的邏輯
        const fps = Math.floor(this.game.loop.actualFps);
        if (this.fpsText) {
            this.fpsText.setText("FPS: " + fps);
        }
    }
    
    // 場景關閉時清理資源
    shutdown() {
        try {
            // 標記場景未準備好
            this.sceneReady = false;
            
            // 確保使用正確的回調函數移除事件監聽器
            if (this.tableStateUpdateCallback) {
                EventBus.off('table-state-updated', this.tableStateUpdateCallback);
                this.tableStateUpdateCallback = null;
            }

            // 停止所有計時器
            this.time.removeAllEvents();

            // 使用 seatGame 清理座位
            if (this.seatGame) {
                this.seatGame.clearSeats();
            }

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

            this.seatGame = new SeatGame(this);
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

        this.actionButtonManager.destroy();

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