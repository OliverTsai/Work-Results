import { GameObjects } from 'phaser';
import { gameStateManager } from '../GameStateManager';
import { SeatGame } from '../utils/SeatGame';
import { EventBus } from '../EventBus';

export class PokerGame extends Phaser.Scene {

    // 基本屬性
    background: GameObjects.Image;

    // 玩家相關
    playerAvatars: (GameObjects.Image | null)[] = [];
    playerNames: (GameObjects.Text | null)[] = [];
    playerChips: (GameObjects.Text | null)[] = [];
    playerBetChips: (GameObjects.Text | null)[] = [];
    playerCards: (GameObjects.Image | null)[][] = []; // 二維數組，每個玩家有多張牌
    allCards: (GameObjects.Image | null)[][] = [];
    playerInfoBox: (GameObjects.Rectangle | null)[] = [];
    tableStatusText: (GameObjects.Text | null)[] = [];

    // 離開按鈕
    leaveButton: GameObjects.Container;

    private seatManager: SeatGame;

    // 添加一個屬性來存儲當前的遊戲狀態
    private currentTableState: any = null;

    constructor() {
        super({ key: 'PokerGame' });
    }

    preload() {
        // Add preload logic here
    }

    create() {
        try {
            // 獲取螢幕尺寸
            const { width, height } = this.scale;

            // 添加背景
            this.background = this.add.image(0, 0, 'background')
                .setOrigin(0, 0)
                .setDisplaySize(width, height);

            // 調試輸出
            console.log('進入 PokerGame 場景，myNumber =', gameStateManager.tableState?.myNumber);

            // 創建離開按鈕
            this.createLeaveButton();

            // 連接到遊戲狀態
            this.connectToGameState();

            // 初始化座位管理器
            this.seatManager = new SeatGame(this);

            // 創建玩家位置
            this.createPlayerPositions();
            
            
        } catch (error) {
            console.error('Error in PokerGame:', error);
        }
        // Add scene creation logic here
        console.log('PokerGame scene created!');
    }

    connectToGameState() {
        console.log('遊戲狀態連接中...');
        console.log(gameStateManager.tableState);

        // 初始化當前狀態
        this.currentTableState = { ...gameStateManager.tableState };

        EventBus.on('table-state-updated', (tableState: any) => {
            
            // 更新當前狀態
            this.currentTableState = { ...tableState };

            // 當狀態更新時，更新座位顯示
            this.createPlayerPositions();

            if(tableState.sitDownButton === false) {
                console.log('玩家已經離開了牌桌，切換到結束畫面');
                this.scene.start('PokerGameOver');
                return;
            }

        });
        // 註冊事件監聽器
        // 連接到遊戲狀態管理器
        // EventBus.on('game-state-updated', (gameState: any) => {
        //     this.updateGameState(gameState);
        // });
    }

    // 修改原來的 createPlayerPositions 方法
    createPlayerPositions() {
        console.log('創建玩家位置...',gameStateManager.tableState.myNumber);
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
        } catch (error) {
            console.error('創建玩家位置時出錯:', error);
        }
    }

    updateTableState(tableState: any) {
        console.log('game更新牌桌狀態:', tableState);
        // 更新牌桌狀態
    }

    updatePlayerState(Players: any) {
        console.log('game更新玩家狀態:', Players);
        // 更新玩家狀態
        // this.players = Players;
    }

    // 創建離開按鈕
    createLeaveButton() {
        const { width, height } = this.scale;
        const buttonWidth = 100;
        const buttonHeight = 40;
        const padding = 20;
        
        // 創建按鈕容器，放在右上角
        this.leaveButton = this.add.container(width - buttonWidth/2 - padding, padding + buttonHeight/2);
        this.leaveButton.setDepth(20); // 確保按鈕在最上層
        
        // 創建按鈕背景
        const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0xaa0000, 1)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive();
        
        // 創建按鈕文本
        const text = this.add.text(0, 0, '離開', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // 添加到容器
        this.leaveButton.add([bg, text]);
        
        // 設置按鈕交互
        bg.on('pointerdown', () => {
            this.handleLeaveTable();
        });
    }

    // 處理離開牌桌
    handleLeaveTable() {
        console.log('玩家點擊離開按鈕');
        
        // 禁用按鈕，防止重複點擊
        this.leaveButton.setAlpha(0.5);
        this.leaveButton.getAt(0).disableInteractive();
        
        // 顯示確認對話框
        gameStateManager.leaveTableApi();
        gameStateManager.tableState.sitDownButton = false;
        gameStateManager.tableState.myNumber = 0;
        // this.scene.start('PokerGameOver');
    }

    update() {
        // Add update logic here
    }
}