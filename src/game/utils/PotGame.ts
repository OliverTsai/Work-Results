import { GameObjects, Scene } from 'phaser';
import { ChipAnimations } from './ChipAnimations';

export class PotGame {
    private scene: Scene;
    private chipAnimations: ChipAnimations;

    private lastWinnerState: string = ''; // 用於追蹤上一次的贏家狀態
    
    // 底池
    potText: GameObjects.Text | null;
    potIcon: GameObjects.Image | null;

    //下注池
    collectText: GameObjects.Text | null;
    collectIcon: GameObjects.Image | null;

    //邊池集合
    sidePotTexts: (GameObjects.Text)[] = [];
    sidePotIcons: (GameObjects.Image)[] = [];

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
    createPotText(tableState: any) {
        // 清除之前的底池文字和贏家文字
        this.clearPotAndWinnerTexts();

        // 直接顯示底池和贏家信息，不處理下注籌碼移動
        this.displayPotAndWinners(tableState);

        return{
            // 返回底池和下注池
            potText: this.potText,
            potIcon: this.potIcon,
            collectText: this.collectText,
            collectIcon: this.collectIcon,

            winnerTexts: this.winnerTexts,
            chipSprites: this.chipSprites
        }
    }
    
    // 所有文字圖標清除
    clearPotAndWinnerTexts() {
        // 清除之前的底池文字
        this.clearPotText();

        // 清除之前的下注池文字
        this.clearCollectText();

        // 清除贏家文本
        this.clearWinnerTexts();

        // 清除所有收集文本和图标
        this.clearCollectTextsAndIcons();

        // 清除籌碼精靈
        this.clearChipSprites();
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

    //清除下注池文字跟圖標
    private clearCollectText() {
        if (this.collectText && this.collectText.destroy) {
            this.collectText.destroy();
        }
        if (this.collectIcon && this.collectIcon.destroy) {
            this.collectIcon.destroy();
        }
        this.collectText = null;
        this.collectIcon = null;
    }

    //清除邊池文本和图标
    private clearSidePotTextsAndIcons() {
        try{
            this.sidePotTexts.forEach(text => {
                if (text && text.destroy) {
                    text.destroy();
                }
            });

            this.sidePotIcons.forEach(icon => {
                if (icon && icon.destroy) {
                    icon.destroy();
                }
            });

            this.sidePotTexts = [];
            this.sidePotIcons = [];

        }catch(error){
            console.error('清空邊池時出錯:', error);
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

    // 清除所有邊池文本和图标
    private clearCollectTextsAndIcons() {
        try{
            this.sidePotTexts.forEach(text => {
                if (text && text.destroy) {
                    text.destroy();
                }
            });

            this.sidePotIcons.forEach(icon => {
                if (icon && icon.destroy) {
                    icon.destroy();
                }
            });

            this.sidePotTexts = [];
            this.sidePotIcons = [];

        }catch(error){
            console.error('清空下注池時出錯:', error);
        }
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

    // 顯示底池和下注池
    displayPotAndWinners(tableState: any) {
        const { width, height } = this.scene.scale;

        const pot = tableState.potAmountBox || '0';
        const collect = tableState.potCollectBox || '0';
        const sidePot = tableState.potSideBox || {};
        const potWinnerBox = tableState.potWinner || {};

        // const pot = '10';
        // const collect = '0';
        // const potWinnerBox = {0:{'reson':'collect','amount':'100','players':[{'name':'bbb','seatNumber':7}]},1:{'reson':'collect','amount':'20','players':[]}};

        // 如果底池為0，則不顯示底池
        if (pot === '0') {
            return
        }else{
            // 清除之前的底池文字
            this.clearPotText();

            const potCopy = parseInt(pot, 10) || 0;

            // 根據籌碼金額選擇不同的圖片
            let chipTexture = 'chip';
            if (potCopy >= 1000) {
                chipTexture = 'chip1000';
            } else if (potCopy >= 100) {
                chipTexture = 'chip100';
            }

            // 先創建底池圖標
            this.potIcon = this.scene.add.image(width / 2 - 45, height / 2 - 140, chipTexture)
                .setOrigin(0.5)
                .setDepth(2)
                .setScale(1); // 調整大小，根據實際需要修改
            
            this.potText = this.scene.add.text(width / 2 +30, height / 2 - 140, `底池: ${pot}`, {
                fontFamily: 'Arial',
                fontSize: '56px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
                align: 'center'
            }).setOrigin(0.5).setDepth(2).setScale(0.5);
        }

        // 如果下注池為0，則不顯示下注池
        // if (collect === '0') {

        // }else{  
        //     // 清除之前的下注池文字
        //     this.clearCollectText();

        //     const collectCopy = parseInt(collect, 10) || 0;

        //     // 根據籌碼金額選擇不同的圖片
        //     let chipTexture = 'chip';
        //     if (collectCopy >= 1000) {
        //         chipTexture = 'chip1000';
        //     } else if (collectCopy >= 100) {
        //         chipTexture = 'chip100';
        //     }

        //     // 先創建下注池圖標
        //     this.collectIcon = this.scene.add.image(width / 2 - 25, height / 2 + 20, chipTexture)
        //         .setOrigin(0.5)
        //         .setDepth(2)
        //         .setScale(0.5); // 調整大小，根據實際需要修改
            
        //     this.collectText = this.scene.add.text(width / 2 +15, height / 2 + 20, `$ ${collect}`, {
        //         fontFamily: 'Arial',
        //         fontSize: '14px',
        //         color: '#FFD700',
        //         stroke: '#000000',
        //         strokeThickness: 2,
        //         align: 'center'
        //     }).setOrigin(0.5).setDepth(2);
        // }

        if (!potWinnerBox) {
            return;
        }else{

            // 清除邊池文字
            this.clearSidePotTextsAndIcons();

            const potKeys = Object.keys(potWinnerBox).sort((a, b) => parseInt(a) - parseInt(b));

            //歷遍sidePot
            potKeys.forEach((potKey, index) => {
                const potData = potWinnerBox[potKey];
                const amount = potData.amount;
                const players = potData.players;

                const collectCopy = parseInt(String(amount), 10) || 0;
                const gap = 30 * index; // 間距

                // 根據籌碼金額選擇不同的圖片   
                let chipTexture = 'chip';
                if (collectCopy >= 1000) {
                    chipTexture = 'chip1000';
                } else if (collectCopy >= 100) {
                    chipTexture = 'chip100';
                }
                // 先創建邊池圖標
                const sideIcon = this.scene.add.image(width / 2 - 40, height / 2 + 60 +gap, chipTexture)
                    .setOrigin(0.5)
                    .setDepth(2)
                    .setScale(1); // 調整大小，根據實際需要修改

                this.sidePotIcons.push(sideIcon);

                if (players.length > 0) {
                    //歷遍贏家並儲存為字串
                    const playerNames: string = players.map((player: { name: string }) => player.name).join(', ');
                    const sideText = this.scene.add.text(width / 2 +30, height / 2 + 60 + gap, `$ ${amount} ${playerNames}`, {
                        fontFamily: 'Arial',
                        fontSize: '56px',
                        color: '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 1,
                        align: 'center'
                    }).setOrigin(0.5).setDepth(2).setScale(0.5);

                    this.sidePotTexts.push(sideText);
                }else{
                    const sideText = this.scene.add.text(width / 2 +30, height / 2 + 60  + gap, `$ ${amount}`, {
                        fontFamily: 'Arial',
                        fontSize: '56px',
                        color: '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 1,
                        align: 'center'
                    }).setOrigin(0.5).setDepth(2).setScale(0.5);

                    this.sidePotTexts.push(sideText);
                }

                // const sideText = this.scene.add.text(width / 2 +15, height / 2 + 50 + gap, `$ ${amount}`, {
                //     fontFamily: 'Arial',
                //     fontSize: '14px',
                //     color: '#ffffff',
                //     stroke: '#000000',
                //     strokeThickness: 2,
                //     align: 'center'
                // }).setOrigin(0.5).setDepth(2);

                // this.sidePotTexts.push(sideText);

                // if(players.length > 0) {
                //     const targetPosition = this.getPlayerPositionBySeatNumber(players.seatNumber, tableState);
                //     this.displayWinners(width / 2, height / 2 + 50 + gap, players, amount, tableState);
                    // 為邊池文本添加移動動畫
                    // if (this.sidePotTexts.length > index) {
                    //     const sideText = this.sidePotTexts[index];
                    //     this.scene.tweens.add({
                    //         targets: sideText,
                    //         x: targetPosition.x,
                    //         y: targetPosition.y,
                    //         duration: 1000,
                    //         ease: 'Power2',
                    //         onComplete: () => {
                    //             console.log(`邊池 ${index} 移動到7號位置完成`);
                    //         }
                    //     });

                    //     // 圖標動畫
                    //     this.scene.tweens.add({
                    //         targets: sideIcon,
                    //         x: targetPosition.x - 20, // 稍微偏移，避免與頭像重疊
                    //         y: targetPosition.y - 20,
                    //         duration: 1000,
                    //         ease: 'Power2',
                    //         onComplete: () => {
                    //             console.log(`邊池圖標 ${index} 移動到${player.seatNumber}號位置完成`);
                    //         }
                    //     });
                    // }
                // }
            });
            
        }
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