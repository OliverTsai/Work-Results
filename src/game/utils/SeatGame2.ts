import { GameObjects, Scene } from 'phaser';
import { CountdownEffect } from '../utils/CountdownEffect2';
import {Seat} from './Seat';

export class SeatGame {
    private scene: Phaser.Scene | null;
    private width: number;
    private height: number;

    //最大人數
    private maxTablePlayers:Text;

    //玩家座位資料
    private seats: Seat[] = [];
    private playerSeats: any[] = [];

    // 存儲UI元素的數組
    private playerAvatars: (GameObjects.Image | null)[] = [];
    private playerNames: (GameObjects.Text | null)[] = [];
    private playerChips: (GameObjects.Text | null)[] = [];
    private playerBetChips: (GameObjects.Text | null)[] = [];
    private playerBetChipImages: (GameObjects.Image | null)[] = []; // 新增：存儲籌碼圖片
    private playerInfoBox: (GameObjects.Image | null)[] = [];
    private playerCards: any[][] = [];
    private allCards: any[][] = [];
    private playerSeatButton:(GameObjects.Image | null)[] = [];
    private test:(GameObjects.Image | null)[] = [];

    // 將原來的 countdownEffect 替換為進度條版本
    private countdownEffects: (CountdownEffect | null)[] = [];
   
    constructor(scene: Scene) {
        this.scene = scene;
        const { width, height } = scene.scale;
        this.width = width;
        this.height = height;
    }

    
    // 清空座位
    clearSeats() {
        try {
            this.playerAvatars.forEach(avatar => {
                if (avatar && avatar.destroy) avatar.destroy();
            });
            this.playerNames.forEach(name => {
                if (name && name.destroy) name.destroy();
            });
            this.playerChips.forEach(chips => {
                if (chips && chips.destroy) chips.destroy();
            });
            this.playerBetChips.forEach(betChips => {
                if (betChips && betChips.destroy) betChips.destroy();
            });
            this.playerBetChipImages.forEach(image => { // 新增：清除籌碼圖片
                if (image && image.destroy) image.destroy();
            });
            this.playerInfoBox.forEach(box => {
                if (box && box.destroy) box.destroy();
            });
            // 清理 allCards 中的所有卡牌
            this.allCards.forEach(playerCards => {
                if (playerCards) {
                    playerCards.forEach(card => {
                        if (card && card.destroy) card.destroy();
                    });
                }
            });

            // 停止並清除所有倒數計時器
            this.countdownEffects.forEach(effect => {
                if (effect) effect.stop();
            });

            // 清理座位按鈕
            this.playerSeatButton.forEach(button => {
                if (button && button.destroy) button.destroy();
            });
            
            this.playerAvatars = [];
            this.playerNames = [];
            this.playerChips = [];
            this.playerBetChips = [];
            this.playerBetChipImages = []; // 新增：重置籌碼圖片數組
            this.playerInfoBox = [];
            this.allCards = []; // 重置 allCards 數組
            this.playerCards = [];
            this.countdownEffects = []; // 重置倒數計時器數組
            this.playerSeatButton = []; // 重置座位按鈕數組
            
        } catch (error) {
            console.error('清空座位時出錯:', error);
        }
    }
    
    // 創建玩家位置
    createPlayerPositions(gameStateManager: any) {
        try {
            // 檢查場景是否有效
            if (!this.scene || !this.scene.add) {
                console.error('場景無效或已被銷毀');
                return {
                    playerAvatars: [],
                    playerNames: [],
                    playerChips: [],
                    playerBetChips: [],
                    playerInfoBox: [],
                    playerCards: [],
                    allCards: []
                };
            }

            // 確保 tableState 存在
            if (!gameStateManager.tableState) {
                console.error('tableState 不存在');
                return {
                    playerAvatars: [],
                    playerNames: [],
                    playerChips: [],
                    playerBetChips: [],
                    playerInfoBox: [],
                    playerCards: [],
                    allCards: [],
                    playerSeatButton: []
                };
            }

            const maxPlayers = gameStateManager.tableState?.maxPlayers || 6;
            const currentPlayers = gameStateManager.tableState?.currentPlayers || [];
            const tableWidth = this.width * 0.9;
            const tableHeight = this.height * 0.7;
            const centerX = this.width / 2;
            const centerY = this.height / 2;
            const seatSize = Math.min(this.width, this.height) * 0.15;
            const seatButton = gameStateManager.tableState?.seatButton || 0;
            const seatTime = gameStateManager.tableState?.seatTime;
            // 使用專門的方法獲取座位號
            const myNumber = gameStateManager.getPlayerSeatNumber();

            // const myNumber = gameStateManager.tableState?.myNumber;

            // 清空之前的座位數組
            this.clearSeats();

            // 計算要顯示的座位順序（按照順時針排列，從左半邊到右半邊）
            const seatOrder = [];
            for (let i = 1; i <= maxPlayers; i++) {
                // 跳過自己的座位號
                if (i !== myNumber) {
                    seatOrder.push(i);
                }
            }

            // 創建橢圓形布局的座位
            const startAngle = Math.PI * 0.083; 
            const endAngle = Math.PI * 1.25;        
            const totalAngleSpan = endAngle - startAngle;

            // 調整順序，使座位從右到左圍繞牌桌
            seatOrder.sort((a, b) => {
                // 計算相對於我的座位的距離（逆時針方向）
                const distA = (a - myNumber + maxPlayers) % maxPlayers;
                const distB = (b - myNumber + maxPlayers) % maxPlayers;
                return distB - distA;
            });

            // 創建假數據
            const position = { x: 0, y: 0 };

            const fakeSeatTime = {
                seatNumber: 5,
                startTime: Date.now()/1000,
                endTime: Date.now()/1000 + 15 // 15秒後
            };

            const seats = gameStateManager.tableState.allSeats

            //確認座位人數
            const maxPlayer  = gameStateManager.tableState.maxPlayers || 0;
            if (maxPlayer === this.maxTablePlayers) {
                console.log('座位人數未變化');
                console.log(this.playerSeats);
            }else{
                console.log('座位人數已變化');
                this.maxTablePlayers = maxPlayer;
                const startMaxPlayer = maxPlayer ; 

                const ellipse = new Phaser.Geom.Ellipse(centerX, centerY, 300, 500);

                for(let i = startMaxPlayer; i > 0; i--) {
                    // const seat = this.scene.add.text(0, 0, i.toString(), {
                    //     fontFamily: 'Arial',
                    //     fontSize: '52px',
                    //     color: '#ffffff',
                    //     stroke: '#000000',
                    //     strokeThickness: 1,
                    //     align: 'center'
                    // }).setOrigin(0.5).setScale(0.5).setDepth(3);
                    console.log('自己的座位:', myNumber);
                    const number = seatOrder[i];

                    if(number === myNumber){
                        console.log('跳過自己的座位號');
                        continue; // 跳過自己的座位號
                    }else{
                        const seat = new Seat(number);
                        console.log('創建座位:', number);
                        const seatContainer = seat.createElements(this.scene, seats[i], position, seatButton, seatTime);

                        this.playerSeats.push(seatContainer);
                    }

                    
                }
                const startAngle = Phaser.Math.DegToRad(153);
                const endAngle = Phaser.Math.DegToRad(425);

                Phaser.Actions.PlaceOnEllipse(this.playerSeats, ellipse, startAngle, endAngle);
                console.log('座位訊息',this.playerSeats)

            }


            
            // 創建其他玩家的座位
            for (let i = 0; i < seatOrder.length; i++) {
                const seatNumber = seatOrder[i];
                
                // 計算座位在240度橢圓上的角度
                const angleRatio = i / (seatOrder.length - 1); // 0到1之間的值
                const angle = startAngle - totalAngleSpan * angleRatio;
                
                // 計算座位位置
                const seatX = centerX + Math.cos(angle) * (tableWidth * 0.4) - 10;
                const seatY = centerY + Math.sin(angle) * (tableHeight * 0.5);
                
                // 查找該座位號對應的玩家
                const player = currentPlayers.find((p: any) => p && typeof p === 'object' && p.number === seatNumber && p.playerStatus !== 'empty');

                // 獲取玩家下注籌碼
                // const playerWithBet = currentPlayers.find((p: any) => p && typeof p === 'object' && p.number === seatNumber && p.playerStatus !== 'empty');
                const playerBetChips = player?.playerBetChips || '0';
                // const playerBetChips = '30';
                const betChipsAmount = parseInt(playerBetChips, 10);

                //測試的白框
                // const textData = this.scene.add.image(seatX,seatY,'test')
                //     .setScale(0.2)
                
                // this.test.push(textData)
                    
                
                if (player) {
                    // 如果有玩家，顯示玩家頭像
                    const avatarTexture = player.playerCharacter || 'player'; // 使用默認的 'player' 紋理
                    const avatar = this.scene.add.image(seatX + 15, seatY - 35, avatarTexture)
                        .setScale(1.2)
                        .setDepth(1);

                    // 創建座位按鈕 (如果座位號與玩家的座位號相同)
                    if (player.number === seatButton) {
                        const seatButtonImage = this.scene.add.image(seatX + 90, seatY - 10, '按鈕位')
                            .setDisplaySize(50, 50)
                            .setDepth(15); // 確保按鈕在頭像上方
                        this.playerSeatButton.push(seatButtonImage);
                    }else{
                        this.playerSeatButton.push(null); // 如果不是座位號，則添加 null
                    }

                    // 創建一個統一的背景框
                    const infoBoxWidth = 70;
                    const infoBoxHeight = 36; // 高度足夠容納兩行文字
                    const infoBoxY = seatY + seatSize/2 + 20; // 位置調整

                    const infoBox = this.scene.add.image(seatX + 20, infoBoxY - 25, 'myBrand')
                        .setScale(0.9)
                        .setDepth(2);

                    let nameData = ''
                    if (player.playerName) {
                        if (player.playerName.length > 10) {
                            nameData = player.playerName.substring(0, 10) + '...';
                        } else {
                            nameData = player.playerName;
                        }
                    }
                    
                    // 創建玩家名稱
                    const nameText = this.scene.add.text(seatX + 20, infoBoxY - 15, nameData || `玩家 ${seatNumber}`, {
                        fontFamily: 'Arial',
                        fontSize: '52px',
                        color: '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 1,
                        align: 'center'
                    }).setOrigin(0.5).setScale(0.5).setDepth(3);

                    // 如果有下注籌碼，則顯示在頭像和圓心之間
                    if (betChipsAmount > 0) {
                        // 計算下注籌碼文字位置，距離圓心更近
                        const betTextX = centerX + Math.cos(angle) * (tableWidth * 0.45 * 0.5) + 10;
                        const betTextY = centerY + Math.sin(angle) * (tableHeight * 0.55 * 0.7) + 5;
                        
                        // 根據籌碼金額選擇不同的圖片
                        let chipTexture = 'chip';
                        if (betChipsAmount >= 1000) {
                            chipTexture = 'chip1000';
                        } else if (betChipsAmount >= 100) {
                            chipTexture = 'chip100';
                        }
                        
                        // 創建籌碼圖片
                        const chipSize = 36; // 籌碼圖片大小
                        const chipImage = this.scene.add.image(betTextX - 10, betTextY + 10, chipTexture)
                            .setDisplaySize(chipSize, chipSize)
                            .setDepth(12);
                        
                        // 創建下注籌碼文字
                        const betText = this.scene.add.text(betTextX, betTextY + 10, `$ ${betChipsAmount}`, {
                            fontFamily: 'Arial',
                            fontSize: '56px',
                            color: '#ffda47',
                            stroke: '#000000',
                            strokeThickness: 1,
                            align: 'center'
                        }).setOrigin(0, 0.5).setScale(0.5).setDepth(12);

                        // 將下注籌碼文字和圖片添加到數組中
                        this.playerBetChips.push(betText);
                        this.playerBetChipImages.push(chipImage);
                    } else {
                        // 如果沒有下注，添加null到數組中保持索引一致
                        this.playerBetChips.push(null);
                        this.playerBetChipImages.push(null);
                    }
                    
                    // 將創建的對象添加到數組中
                    this.playerAvatars.push(avatar);
                    this.playerNames.push(nameText);

                    if(player.seatAction === 'folded' || player.playerStatus === 'fold') {
                        // 如果玩家已棄牌，添加一個紅色的X標記
                        const xMark = this.scene.add.text(seatX + 20, infoBoxY - 37, '棄牌', {
                            fontFamily: 'Arial',
                            fontSize: '56px',
                            color: '#ff0000',
                            stroke: '#000000',
                            strokeThickness: 1,
                            align: 'center'
                        }).setOrigin(0.5).setScale(0.5).setDepth(3);
                        this.playerChips.push(xMark);
                    }else{
                        if (player.handShowCards === 0) {
                            // 創建玩家擁有的籌碼
                            const chipsText = this.scene.add.text(seatX + 20, infoBoxY - 37, `${player.playerChips || 0}`, {
                                fontFamily: 'Arial',
                                fontSize: '56px',
                                color: '#ffda47',
                                stroke: '#000000',
                                strokeThickness: 1,
                                align: 'center'
                            }).setOrigin(0.5).setScale(0.5).setDepth(3);

                            this.playerChips.push(chipsText);
                        } else {
                            //秀手牌
                            const handShowCards = player.playerCard;
                            // console.log('秀手牌的資料:', handShowCards);

                            // 計算卡片的寬度和高度，保持合適的長寬比例
                            const cardSizeWidth = Math.min(this.width, this.height) * 0.06; // 寬度較小
                            const cardSizeHeight = cardSizeWidth * 1.4; // 高度是寬度的1.4倍，符合撲克牌比例
                            const cardSpacing = 5; // 卡片間距

                            // 顯示手牌
                            if (handShowCards && typeof handShowCards === 'object') {
                                const cards = Object.values(handShowCards);
                                
                                // 計算起始位置，使卡片居中顯示
                                const totalWidth = cards.length * cardSizeWidth + (cards.length - 1) * cardSpacing;
                                let startX = seatX - totalWidth / 2 + cardSizeWidth / 2;
                                
                                // 顯示每張卡
                                cards.forEach((card, index) => {
                                    const cardX = startX + index * (cardSizeWidth + cardSpacing);
                                    const cardY = seatY - seatSize/4; // 在頭像上方顯示
                                    
                                    // 創建卡牌
                                    const cardImage = this.scene?.add.image(cardX, cardY, card as string)
                                        .setDisplaySize(cardSizeWidth, cardSizeHeight)
                                        .setDepth(11);

                                    // 將卡牌添加到玩家卡牌數組
                                    if (!this.allCards[i]) {
                                        this.allCards[i] = [];
                                    }
                                    this.allCards[i].push(cardImage);
                                });
                            }

                            // 創建玩家最佳牌型文字
                            const playerCardBest = this.scene.add.text(seatX + 15, infoBoxY - 35, `最佳牌: ${(player.playerCardBest) || '無'}`, {
                                fontFamily: 'Arial',
                                fontSize: '40px',
                                color: '#ffffff',
                                stroke: '#000000',
                                strokeThickness: 1,
                                align: 'center'
                            }).setOrigin(0.5).setScale(0.5).setDepth(3);

                            this.playerChips.push(playerCardBest);
                        }
                    }

                    // 只有當玩家有倒數時間時才創建倒數計時器
                    if (player.number === seatTime.seatNumber) {
                        const countdownEffect = new CountdownEffect(this.scene);
                        countdownEffect.start(seatTime.startTime, seatTime.endTime, seatX + 20, infoBoxY + 5, 180, 5, false);
                        this.countdownEffects.push(countdownEffect);
                    } else {
                        // 如果沒有倒數時間，添加null到數組中保持索引一致
                        this.countdownEffects.push(null);
                    }
                    
                    this.playerInfoBox.push(infoBox);
                    
                    // 創建玩家手牌區域（初始為空）
                    this.playerCards[i] = [];
                    
                } else {
                    // 如果沒有玩家，保留空位置
                    this.playerAvatars.push(null);
                    this.playerNames.push(null);
                    this.playerChips.push(null);
                    this.playerInfoBox.push(null);
                    this.playerCards[i] = [];
                    this.countdownEffects.push(null); // 添加空的倒數計時器佔位
                    this.playerBetChips.push(null);
                    this.playerBetChipImages.push(null); // 新增：添加空的籌碼圖片佔位
                    this.playerSeatButton.push(null); // 新增：添加空的座位按鈕佔位
                }
            }
                
            // 創建當前玩家頭像在左下角
            const leftBottomX = this.width * 0.2;
            const leftBottomY = this.height * 0.75;
            
            // 查找當前玩家信息
            const currentPlayer = currentPlayers.find((p: any) => p.number === myNumber);
            
            // 獲取當前玩家下注籌碼
            const currentPlayerBetChips = currentPlayers.find((p: any) => p.number === myNumber)?.playerBetChips || '0';
            const currentBetChipsAmount = parseInt(currentPlayerBetChips, 10);
            const myCharacter = currentPlayers.find((p: any) => p.number === myNumber)?.playerCharacter || 'player';

            if (myNumber !== undefined && myNumber !== null) {

                // 創建座位按鈕 (如果座位號與玩家的座位號相同)
                if (myNumber === seatButton) {
                    const seatButtonBox = this.scene.add.image(leftBottomX + 90, leftBottomY - 10, '按鈕位')
                        .setDisplaySize(50, 50)
                        .setDepth(15);
                    this.playerSeatButton.push(seatButtonBox);
                } else {
                    this.playerSeatButton.push(null); // 添加空的座位按鈕佔位
                }

                const infoBoxY = leftBottomY + seatSize/2 + 20; // 位置調整

                // 只有當當前玩家有倒數時間時才創建倒數計時器
                if (myNumber === seatTime.seatNumber) {
                    const myCountdownEffect = new CountdownEffect(this.scene);
                    myCountdownEffect.start(seatTime.startTime, seatTime.endTime, leftBottomX, infoBoxY + 140, 250, 10, false);
                    this.countdownEffects.push(myCountdownEffect);
                } else {
                    // 如果沒有倒數時間，添加null到數組中保持索引一致
                    this.countdownEffects.push(null);
                }
                
                // 如果當前玩家有下注籌碼，則顯示在頭像和牌桌之間
                if (currentBetChipsAmount > 0) {
                    // 計算下注籌碼文字位置（向牌桌方向偏移）
                    const betTextX = this.width/2;
                    const betTextY = this.height/2 + 120; // 向牌桌方向偏移
                    
                    // 根據籌碼金額選擇不同的圖片
                    let chipTexture = 'chip';
                    if (currentBetChipsAmount >= 1000) {
                        chipTexture = 'chip1000';
                    } else if (currentBetChipsAmount >= 100) {
                        chipTexture = 'chip100';
                    }
                    
                    // 創建籌碼圖片
                    const chipSize = 48; // 籌碼圖片大小
                    const chipImage = this.scene.add.image(betTextX - 20, betTextY + 30, chipTexture)
                        .setDisplaySize(chipSize, chipSize)
                        .setDepth(12);
                    
                    // 創建下注籌碼文字
                    const betText = this.scene.add.text(betTextX, betTextY + 30, `$ ${currentBetChipsAmount}`, {
                        fontFamily: 'Arial',
                        fontSize: '56px',
                        color: '#ffcc00',
                        stroke: '#000000',
                        strokeThickness: 1,
                        align: 'center'
                    }).setOrigin(0, 0.5).setScale(0.5).setDepth(12);

                    // 將下注籌碼文字和圖片添加到數組中
                    this.playerBetChips.push(betText);
                    this.playerBetChipImages.push(chipImage);
                } else {
                    // 如果沒有下注，添加null到數組中保持索引一致
                    this.playerBetChips.push(null);
                    this.playerBetChipImages.push(null);
                }
                
                // 將當前玩家對象添加到數組中
                // this.playerAvatars.push(currentPlayerAvatar);
                // this.playerNames.push(currentPlayerName);
                // this.playerInfoBox.push(infoBox);
                
                // 創建當前玩家手牌區域
                // this.playerCards[seatOrder.length] = [];
            }
            
            return {
                playerAvatars: this.playerAvatars,
                playerNames: this.playerNames,
                playerChips: this.playerChips,
                playerBetChips: this.playerBetChips,
                playerInfoBox: this.playerInfoBox,
                playerCards: this.playerCards,
                allCards: this.allCards,
                playerSeatButton: this.playerSeatButton,
            };

        } catch (error) {
            console.error('創建玩家位置時出錯:', error);
        }
    }

    // 獲取座位按鈕數組
    getPlayerSeatButton() {
        return this.playerSeatButton;
    }

    // 新增：移動籌碼到下注池
    moveBetChipsToPot(callback?: () => void) {
        if (!this.scene) {
            if (callback) callback();
            return;
        }

        const centerX = this.width / 2;
        const centerY = this.height / 2;
        let animationsRunning = 0;

        // 檢查每個玩家的下注籌碼和籌碼圖片
        for (let i = 0; i < this.playerBetChips.length; i++) {
            const betChips = this.playerBetChips[i];
            const chipImage = this.playerBetChipImages[i];
            
            if (betChips || chipImage) {
                animationsRunning++;
                
                // 創建移動動畫
                if (betChips) {
                    this.scene!.tweens.add({
                        targets: betChips,
                        x: centerX,
                        y: centerY,
                        duration: 500,
                        ease: 'Power2',
                        onComplete: () => {
                            // 動畫完成後銷毀籌碼文字
                            if (betChips && betChips.destroy) {
                                betChips.destroy();
                                this.playerBetChips[i] = null;
                            }
                            
                            animationsRunning--;
                            if (animationsRunning === 0 && callback) {
                                callback();
                            }
                        }
                    });
                }
                
                // 創建籌碼圖片的移動動畫
                if (chipImage) {
                    this.scene!.tweens.add({
                        targets: chipImage,
                        x: centerX - 20,
                        y: centerY,
                        duration: 500,
                        ease: 'Power2',
                        onComplete: () => {
                            // 動畫完成後銷毀籌碼圖片
                            if (chipImage && chipImage.destroy) {
                                chipImage.destroy();
                                this.playerBetChipImages[i] = null;
                            }
                            
                            // 不需要在這裡減少 animationsRunning，因為 betChips 的動畫完成時會處理
                        }
                    });
                }
            }
        }

        // 如果沒有任何動畫需要運行，直接調用回調
        if (animationsRunning === 0 && callback) {
            callback();
        }
    }

    // 新增：清空下注籌碼（帶動畫版本）
    clearBetChipsWithAnimation(callback?: () => void) {
        // 先執行移動動畫
        this.moveBetChipsToPot(() => {
            // 動畫完成後執行回調
            if (callback) callback();
        });
    }

    // 設置場景引用為 null，用於場景銷毀時
    destroy() {
        this.clearSeats();
        this.scene = null;
    }
}