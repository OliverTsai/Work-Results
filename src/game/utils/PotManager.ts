import { GameObjects, Scene } from 'phaser';
import { ChipAnimations } from './ChipAnimations';

export class PotManager {
    private scene: Scene;
    private chipAnimations: ChipAnimations;

    private lastWinnerState: string = ''; // 用於追蹤上一次的贏家狀態
    
    // 底池
    potText: GameObjects.Text | null;
    potIcon: GameObjects.Image | null;

    //下注池
    collectText: GameObjects.Text;
    collectIcon: GameObjects.Image;
    collectTexts: (GameObjects.Text)[] = [];
    collectIcons: (GameObjects.Image)[] = [];

    // 下注池集合與贏家
    winnerTexts: (GameObjects.Text | null)[] = [];

    chipSprites: (GameObjects.Shape | GameObjects.Text)[] = [];
    betChipAnimations: boolean = false; // 標記是否正在進行籌碼動畫
    lastBetChipsState: any = {}; // 用於記錄上一次的下注狀態
    
    constructor(scene: Scene, chipAnimations: ChipAnimations) {
        this.scene = scene;
        this.chipAnimations = chipAnimations;
    }

    // 創建底池顯示 - 主要入口點
    createPotText(tableState: any, playerBetChips: (GameObjects.Text | null)[]) {
        // 清除之前的底池文字和贏家文字
        this.clearPotAndWinnerTexts();

        // 直接顯示底池和贏家信息，不處理下注籌碼移動
        this.displayPotAndWinners(tableState);

        return{
            potText: this.potText,
            potIcon: this.potIcon,
            collectTexts: [...this.collectTexts], // 使用展開運算符創建新陣列
            collectIcons: [...this.collectIcons], // 使用展開運算符創建新陣列
            winnerTexts: this.winnerTexts,
            chipSprites: this.chipSprites
        }
    }
    
    // 所有文字圖標清除
    private clearPotAndWinnerTexts() {
        // 清除之前的底池文字
        this.clearPotText();

        // 清除贏家文本
        this.clearWinnerTexts();

        // 清除所有收集文本和图标
        this.clearCollectTextsAndIcons();

        // 清除籌碼精靈
        this.clearChipSprites();
    }

    // 清除籌碼精靈
    clearChipSprites() {
        // 清除所有籌碼精靈
        this.chipSprites.forEach(sprite => {
            if (sprite && sprite.destroy) {
                sprite.destroy();
            }
        });
        this.chipSprites = []; // 重置數組
    }

    // 顯示底池和贏家信息
    displayPotAndWinners(tableState: any) {
        const { width, height } = this.scene.scale;
        
        // 更新底池顯示（如果已存在則不需要重新創建）
        if (!this.potText || !this.potText.active) {

            // 清除之前的底池文字
            this.clearPotText();

            const potCopy = parseInt(tableState.potAmountBox, 10) || 0;

            // 根據籌碼金額選擇不同的圖片
            let chipTexture = 'chip';
            if (potCopy >= 1000) {
                chipTexture = 'chip1000';
            } else if (potCopy >= 100) {
                chipTexture = 'chip100';
            }

            // 先創建底池圖標
            this.potIcon = this.scene.add.image(width / 2 - 25, height / 2 + 30, chipTexture)
                .setOrigin(0.5)
                .setDepth(2)
                .setScale(0.8); // 調整大小，根據實際需要修改
            
            this.potText = this.scene.add.text(width / 2 +15, height / 2 + 30, `$ ${tableState.potAmountBox}`, {
                fontFamily: 'Arial',
                fontSize: '28px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
                align: 'center'
            }).setOrigin(0.5).setDepth(2).setScale(1);
        } else {
            
            const potCopy = parseInt(tableState.potAmountBox, 10) || 0;

            // 根據籌碼金額選擇不同的圖片
            let chipTexture = 'chip';
            if (potCopy >= 1000) {
                chipTexture = 'chip1000';
            } else if (potCopy >= 100) {
                chipTexture = 'chip100';
            }
            
            // 清除之前的底池圖標
            if (this.potIcon && this.potIcon.destroy) {
                this.potIcon.destroy();
            }

            // 先創建底池圖標
            this.potIcon = this.scene.add.image(width / 2 - 40, height / 2 + 30, chipTexture)
                .setOrigin(0.5)
                .setDepth(2)
                .setScale(0.5); // 調整大小，根據實際需要修改

            this.potText.setText(`$ ${tableState.potAmountBox}`);
        }

        // const potWinnerBox = {0:{'reson':'collect','amount':10,'players':[]},1:{'reson':'collect','amount':20,'players':[]}}; // 初始化 potWinner 為空物件
        // const tableBox = {'potWinner': potWinnerBox}; // 初始化 tableBox 為空物件
        // 只有當贏家信息發生變化時才處理贏家顯示tableState.potWinner
        if (tableState.potWinner) {

            // 創建當前贏家狀態的唯一標識符
            const currentWinnerState = JSON.stringify(tableState.potWinner);
            
            // 只有當贏家狀態發生變化時才更新顯示
            if (this.lastWinnerState !== currentWinnerState) {

                // 清除之前的贏家文本和籌碼精靈
                this.clearWinnerTexts();
                this.clearChipSprites();
                this.clearCollectTextsAndIcons();
                
                // 顯示所有池的資料
                this.displayAllPots(tableState);
                
                // 更新贏家狀態
                this.lastWinnerState = currentWinnerState;
            }
        } else if (this.lastWinnerState !== '') {
            // 如果之前有贏家但現在沒有，清除贏家顯示
            this.clearWinnerTexts();
            this.clearChipSprites();
            this.clearCollectTextsAndIcons();
            this.lastWinnerState = '';
        }
    }

    // 清除所有收集文本和图标
    private clearCollectTextsAndIcons() {
        try{
            this.collectTexts.forEach(text => {
                if (text && text.destroy) {
                    text.destroy();
                }
            });

            this.collectIcons.forEach(icon => {
                if (icon && icon.destroy) {
                    icon.destroy();
                }
            });


            this.collectTexts = [];
            this.collectIcons = [];

        }catch(error){
            console.error('清空下注池時出錯:', error);
        }
    }

    // 顯示所有池的資料
    private displayAllPots(tableState: any) {
        const { width, height } = this.scene.scale;
        
        if (tableState.potWinner) {
            // 計算起始位置 (底池文字下方)
            let startY = height / 2 + 60; // 底池文字下方 30px

            // 檢查 potWinner 是否為陣列或物件
            if (Array.isArray(tableState.potWinner)) {
                
                // 如果是陣列，遍歷每個元素
                tableState.potWinner.forEach((potData: { amount: number; players: Array<{ name: string; seatNumber: number }> }, index: number) => {
                    // 創建和顯示獎池信息
                    this.createPotAmountText(width / 2, startY, potData.amount);
                    startY += 15; // 移動到下一行

                    // 如果有贏家，顯示贏家名稱並安排籌碼移動動畫
                    if (potData.players && potData.players.length > 0) {
                        startY = this.displayWinners(width / 2, startY, potData.players, potData.amount, tableState);
                    } else {
                        // 如果沒有贏家，只增加一點間距
                        startY += 10;
                    }
                    
                    // 如果不是最後一個池，添加一點額外間距
                    if (index < tableState.potWinner.length - 1) {
                        startY += 10;
                    }
                });
            } else {
                // 如果是物件，按原來的方式處理
                this.handleWinnersDisplay(tableState);
            }
        }
    }

    // 添加一個專門清除贏家文本的方法
    private clearWinnerTexts() {
        if (this.winnerTexts && this.winnerTexts.length > 0) {
            this.winnerTexts.forEach(text => {
                if (text && text.destroy) text.destroy();
            });
            this.winnerTexts = [];
        }
    }

    //清除底池文字跟圖標
    private clearPotText() {
        if (this.potText && this.potText.destroy) {
            this.potText.destroy();
        }
        if (this.potIcon && this.potIcon.destroy) {
            this.potIcon.destroy();
        }
        this.potText = null;
        this.potIcon = null;
    }
    
    // 處理贏家信息和獎池顯示
    private handleWinnersDisplay(tableState: any) {
        const { width, height } = this.scene.scale;
        
        if (tableState.potWinner){
            // 獲取所有池的索引並排序
            const potKeys = Object.keys(tableState.potWinner).sort((a, b) => parseInt(a) - parseInt(b));
            
            // 計算起始位置 (底池文字下方)
            let startY = height / 2 + 60; // 底池文字下方 30px

            // 遍歷每個池
            potKeys.forEach((potKey, index) => {
                const potData = tableState.potWinner[potKey];
                const amount = potData.amount;
                const players = potData.players;
                const gap = 10 * index; // 間距

                console.log('遍歷每個池:', startY + gap );
  
                // 創建和顯示獎池信息
                this.createPotAmountText(width / 2, startY + gap, amount);

                startY += 10 // 移動到下一行

                // 如果有贏家，顯示贏家名稱並安排籌碼移動動畫
                if (players && players.length > 0) {
                    startY = this.displayWinners(width / 2, startY + gap * index, players, amount, tableState);
                } else {
                    // 如果沒有贏家，只增加一點間距
                    startY += 5;
                }
                
                // 如果不是最後一個池，添加一點額外間距
                if (index < potKeys.length - 1) {
                    startY += 10;
                }
            });
        }else {

        }
    }
    
    // 創建下注池金額文字
    private createPotAmountText(x: number, y: number, amount: number): GameObjects.Text {
        const text = String(amount);

        // 清除之前的下注池文字

        // 根據籌碼金額選擇不同的圖片
        let chipTexture = 'chip';
        if (amount >= 1000) {
            chipTexture = 'chip1000';
        } else if (amount >= 100) {
            chipTexture = 'chip100';
        }

        console.log('創建下注池金額資料:', x, y, text);

        this.collectText = this.scene.add.text(x +20, y , `$ ${text}`, {
            fontFamily: 'Arial',
            fontSize: '56px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1,
            align: 'center'
        }).setOrigin(0.5).setDepth(10).setScale(0.25).setVisible(true);
        this.collectTexts.push(this.collectText);

        //創建標籤
        this.collectIcon = this.scene.add.image(x - 20, y, chipTexture)
            .setOrigin(0.5)
            .setDepth(10)
            .setScale(0.5).setVisible(true); // 調整大小，根據實際需要修改

        this.collectIcons.push(this.collectIcon);
        // 返回創建的文字對象
        return this.collectText;
    }
    
    // 顯示贏家名稱並安排籌碼移動動畫
    private displayWinners(x: number, y: number, players: Array<{name: string, seatNumber: number}>, amount: number, tableState: any): number {
        
        // 延遲1秒後開始移動籌碼到贏家
        this.scene.time.delayedCall(1000, () => {
            this.moveChipsToWinners(amount, players, tableState);
        });
        
        return y + 30; // 移動到下一行，並增加一點間距
    }

    // 移動籌碼到贏家
    moveChipsToWinners(amount: number, players: Array<{name: string, seatNumber: number}>, tableState: any) {
        const { width, height } = this.scene.scale;
        
        // 在開始新的動畫前，清除之前的籌碼精靈
        this.clearChipSprites();
        
        // 找到源位置（獎池文本位置）
        const sourcePosition = this.findSourcePosition(width, height);

        // 使用 ChipAnimations 類來處理籌碼移動
        this.chipAnimations.moveChipsToWinners(
            amount,
            players,
            sourcePosition,
            (seatNumber) => this.getPlayerPositionBySeatNumber(seatNumber, tableState),
            this.chipSprites,
            this.winnerTexts
        );
    }
    
    // 找到籌碼移動的源位置
    private findSourcePosition(width: number, height: number): {x: number, y: number} {
        // 找到最後添加的獎池文本
        const potAmountTexts = this.winnerTexts.filter(text => 
            text && text.text && text.text.startsWith('$:')
        );
        
        // 如果找不到獎池文本，使用默認位置
        let sourceX = width / 2;
        let sourceY = height / 2 + 60; // 獎池位置
        
        // 如果找到獎池文本，使用其位置
        if (potAmountTexts.length > 0) {
            const potText = potAmountTexts[potAmountTexts.length - 1];
            if (potText) {
                sourceX = potText.x;
            }
            sourceY = potText ? potText.y : height / 2 + 60; // Default to center if potText is null
        }
        
        return { x: sourceX, y: sourceY };
    }

    // 根據座位號獲取玩家位置(入座後)
    getPlayerPositionBySeatNumber(seatNumber: number, tableState: any) {
        
        // 嘗試從場景中獲取 playerSeats 和 playerAvatars 數組
        const pokerMainMenuScene = this.scene as any; // 轉換為 any 類型以訪問自定義屬性

        // 檢查場景是否有 playerSeats 和 playerAvatars 數組
        if (pokerMainMenuScene.playerBetChips ) {
            return this.getPositionFromSeats(seatNumber, tableState, pokerMainMenuScene);
        } else {
            // 如果找不到座位信息，使用原來的計算方法
            return this.calculatePositionBySeatNumber(seatNumber, tableState);
        }
    }

    // 從場景中的座位數組獲取玩家位置
    private getPositionFromSeats(seatNumber: number, tableState: any, scene: any): {x: number, y: number} {
        const { width, height } = this.scene.scale;
        const maxPlayers = tableState?.maxPlayers || 6;
        
        // 獲取當前玩家的座位號
        const myNumber = this.getPlayerSeatNumber(tableState);
        
        // 如果是當前玩家，返回左下角位置
        if (seatNumber === myNumber) {
            return { x: width * 0.2, y: height * 0.75 };
        }
        
        // 從場景中獲取座位和頭像數組
        const playerSeats = scene.playerSeats || [];
        const playerAvatars = scene.playerAvatars || [];
        
        // 首先檢查是否有對應座位號的頭像
        const currentPlayers = tableState?.currentPlayers || [];
        const player = currentPlayers.find((p: any) => p && p.number === seatNumber);
        
        if (player) {
            // 如果有玩家，嘗試找到對應的頭像
            const tableWidth = width * 0.9;
            const tableHeight = height * 0.6;
            const centerX = width / 2;
            const centerY = height / 2;
            
            // 計算座位的角度和位置
            const angle = (Math.PI * 2 / maxPlayers) * (seatNumber - 1) - Math.PI / 2;
            const seatX = centerX + Math.cos(angle) * (tableWidth * 0.4);
            const seatY = centerY + Math.sin(angle) * (tableHeight * 0.6);
            
             // 修正：先過濾掉 null 或 undefined 的元素，再進行查找
            const avatar = playerAvatars
                .filter((a: { x: number; y: number } | null): a is { x: number; y: number } => 
                    a !== null && typeof a === 'object' && 'x' in a && 'y' in a
                )
                .find((a: { x: number; y: number }) => 
                    Math.abs(a.x - seatX) < 20 && Math.abs(a.y - seatY) < 20
                );
            // 查找最接近計算位置的頭像
            // const avatar = playerAvatars.find(a => 
            //     Math.abs(a.x - seatX) < 20 && Math.abs(a.y - seatY) < 20
            // );
            
            if (avatar) {
                return { x: avatar.x, y: avatar.y };
            }
        } else {
            // 如果沒有玩家，嘗試找到對應的空座位
            const tableWidth = width * 0.9;
            const tableHeight = height * 0.6;
            const centerX = width / 2;
            const centerY = height / 2;
            
            // 計算座位的角度和位置
            const angle = (Math.PI * 2 / maxPlayers) * (seatNumber - 1) - Math.PI / 2;
            const seatX = centerX + Math.cos(angle) * (tableWidth * 0.4);
            const seatY = centerY + Math.sin(angle) * (tableHeight * 0.6);
            
            // 查找最接近計算位置的座位
            const seat = playerSeats.find((s: { x: number; y: number }) => 
                Math.abs(s.x - seatX) < 20 && Math.abs(s.y - seatY) < 20
            );
            
            if (seat) {
                return { x: seat.x, y: seat.y };
            }
        }
        
        // 如果找不到對應的座位或頭像，使用計算方法
        return this.calculatePositionBySeatNumber(seatNumber, tableState);
    }

    // 計算玩家位置（原方法的備用）
    private calculatePositionBySeatNumber(seatNumber: number, tableState: any): {x: number, y: number} {
        const { width, height } = this.scene.scale;
        const maxPlayers = tableState?.maxPlayers || 6;
        const centerX = width / 2;
        const centerY = height / 2;
        const tableWidth = width * 0.9;
        const tableHeight = height * 0.7;
        
        // 獲取當前玩家的座位號
        const myNumber = this.getPlayerSeatNumber(tableState);
        
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

    // 獲取玩家座位號
    getPlayerSeatNumber(tableState: any): number {
        if (tableState && tableState.myNumber) {
            return tableState.myNumber;
        }
        return 0;
    }

    // 清理資源
    destroy() {
        // 清除底池文字
        if (this.potText && this.potText.destroy) {
            this.potText.destroy();
            this.potText = null;
        }

        // 清除底池圖標
        if (this.potIcon && this.potIcon.destroy) {
            this.potIcon.destroy();
            this.potIcon = null;
        }

        // 清除贏家文字
        this.winnerTexts.forEach(text => {
            if (text && text.destroy) text.destroy();
        });
        this.winnerTexts = [];

        // 清除籌碼精靈
        this.clearChipSprites();

        // 清除收集文本和图标
        this.clearCollectTextsAndIcons();

        // 重置狀態
        this.betChipAnimations = false;
        this.lastBetChipsState = {};
        this.lastWinnerState = '';
    }
}