import { Scene, GameObjects } from 'phaser';
import { gameStateManager } from '../GameStateManager';
import { CountdownEffect } from '../utils/CountdownEffect2';

export class SeatManager {
    private scene: Scene;
    private playerSeats: GameObjects.Image[] = [];
    private playerAvatars: GameObjects.Image[] = [];
    private playerNames: GameObjects.Text[] = [];
    private playerBrand: GameObjects.Image[] = [];

    private playerBetChips: (GameObjects.Text | null)[] = [];
    private playerBetChipImages: (GameObjects.Image | null)[] = []; // 存儲籌碼圖片
    private playerCards: (GameObjects.Image | GameObjects.Text | null)[][] = []; // 新增：玩家手牌
    private showHoleCards: (GameObjects.Image | null)[] = []; // 新增：秀手牌按鈕
    private playerSeatButton:(GameObjects.Image | null)[] = [];

    // 將原來的 countdownEffect 替換為進度條版本
    private countdownEffects: (CountdownEffect | null)[] = [];

    constructor(scene: Scene) {
        this.scene = scene;
    }

    // 清空座位
    clearSeats() {
        try {
            this.playerSeats.forEach(seat => {
                if (seat && seat.destroy) seat.destroy();
            });
            this.playerAvatars.forEach(avatar => {
                if (avatar && avatar.destroy) avatar.destroy();
            });
            this.playerNames.forEach(name => {
                if (name && name.destroy) name.destroy();
            });
            this.playerBetChips.forEach(betChips => {
                if (betChips && betChips.destroy) betChips.destroy();
            });
            this.playerBetChipImages.forEach(image => {
                if (image && image.destroy) image.destroy();
            });
            this.playerBrand.forEach(brand => {
                if (brand && brand.destroy) brand.destroy();
            });

            // 新增：清理玩家手牌
            this.playerCards.forEach(cards => {
                if (cards) {
                    cards.forEach(card => {
                        if (card && card.destroy) card.destroy();
                    });
                }
            });

            // 新增：清理秀手牌按鈕
            this.showHoleCards.forEach(button => {
                if (button && button.destroy) button.destroy();
            });

            // 停止並清除所有倒數計時器
            this.countdownEffects.forEach(effect => {
                if (effect) effect.stop();
            });

            // 清理座位按鈕
            this.playerSeatButton.forEach(button => {
                if (button && button.destroy) button.destroy();
            });
            
            
            this.playerSeats = [];
            this.playerAvatars = [];
            this.playerNames = [];
            this.playerBrand = [];
            this.playerBetChips = [];
            this.playerBetChipImages = [];
            this.playerCards = []; // 新增：重置玩家手牌數組
            this.showHoleCards = []; // 新增：重置秀手牌按鈕數組
            this.playerSeatButton = []; // 重置座位按鈕數組

        } catch (error) {
            console.error('清空座位時出錯:', error);
        }
    }

    // 創建玩家座位
    createPlayerManagerSeats(tableState: any, onSeatClick: (seatNumber: number, minBuyIn: string, maxBuyIn: string) => void) {
        try {
            // 檢查場景是否有效
            if (!this.scene || !this.scene.add || typeof this.scene.add.graphics !== 'function') {
                console.error('場景無效或已被銷毀');
                return {
                    playerSeats: [],
                    playerAvatars: [],
                    playerNames: []
                };
            }

            // 確保 tableState 存在
            if (!gameStateManager.tableState) {
                console.error('tableState 不存在');
                return {
                    playerSeats: [],
                    playerAvatars: [],
                    playerNames: []
                };
            }

            const { width, height } = this.scene.scale;
            const tableWidth = width * 0.9;
            const tableHeight = height * 0.6;
            const centerX = width / 2;
            const centerY = height / 2;
            
            // 清空之前的座位
            this.clearSeats();
            
            // 從傳入的 tableState 獲取值
            const maxPlayers = tableState?.maxPlayers || 6; // 默認為6個玩家
            const currentPlayers = tableState?.currentPlayers || [];
            const seatSize = Math.min(width, height) * 0.25; // 根據螢幕大小調整座位大小
            const minBuyIn = tableState?.mainBuyIn || '600'; // 最小買入金額
            const maxBuyIn = tableState?.maxBuyIn || '1000'; // 最大買入金額
            const seatButton = gameStateManager.tableState?.seatButton || 0;
            const seatTime = gameStateManager.tableState?.seatTime;

            // 檢查是否為錦標賽 - 修正判定邏輯
            const isTournament = !!(gameStateManager.tableState && 
                gameStateManager.tableState.tournamentId && 
                gameStateManager.tableState.tournamentId !== "");
            
            //創建牌桌框架
            for (let i = 0; i < maxPlayers; i++) {
                // 計算座位的角度和位置
                const angle = (Math.PI * 2 / maxPlayers) * i - Math.PI / 2;
                const seatX = centerX + Math.cos(angle) * (tableWidth * 0.4);
                const seatY = centerY + Math.sin(angle) * (tableHeight * 0.5);

                // 座位號碼從1開始，而不是0
                const seatNumber = i + 1;
                
                // 檢查這個位置是否有玩家
                const player = currentPlayers.find((p: { playerStatus: string, number: number }) => 
                    p && typeof p === 'object' && p.number === seatNumber && p.playerStatus !== 'empty');
                
                // 獲取玩家下注籌碼
                // const playerWithBet = currentPlayers.find((p: any) => p && typeof p === 'object' && p.number === seatNumber && p.playerStatus !== 'empty');
                const playerBetChips = player?.playerBetChips || '0';
                const betChipsAmount = parseInt(playerBetChips, 10);

                if (player) {
                    // 如果有玩家，顯示玩家頭像
                    const avatarTexture = player.playerCharacter || 'player'; // 預設為 'player'，如果沒有則使用這個
                    const avatar = this.scene.add.image(seatX, seatY - 2, avatarTexture)
                        .setScale(1.2)
                        .setDepth(10);

                    const infoBox = this.scene.add.image(seatX + 10, seatY + 90, 'myBrand')
                        .setScale(0.9)
                        .setDepth(2);
                    
                    // 創建座位按鈕 (如果座位號與玩家的座位號相同)
                    if (player.number === seatButton) {
                        const seatButtonImage = this.scene.add.image(seatX + 60, seatY - 10, '按鈕位')
                            .setDisplaySize(60, 60)
                            .setDepth(15); // 確保按鈕在頭像上方
                        this.playerSeatButton.push(seatButtonImage);
                    }else{
                        this.playerSeatButton.push(null); // 如果不是座位號，則添加 null
                    }
                        
                    const nameText = this.scene.add.text(seatX + 5, seatY + seatSize/2 - 15, player.playerName, {
                        fontFamily: 'Arial',
                        fontSize: '26px',
                        color: '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 1,
                        align: 'center'
                    }).setOrigin(0.5).setScale(1).setDepth(3);

                    if(player.seatAction === 'folded' || player.playerStatus === 'fold') {
                        // 如果玩家已棄牌，添加一個紅色的X標記
                        const xMark = this.scene.add.text(seatX, seatY + seatSize/2 + 10, '棄牌', {
                            fontFamily: 'Arial',
                            fontSize: '26px',
                            color: '#ff0000',
                            stroke: '#000000',
                            strokeThickness: 1,
                            align: 'center'
                        }).setOrigin(0.5).setScale(1).setDepth(3);
                        this.playerNames.push(xMark);
                    }else{
                        // 文字顯示玩家籌碼或最佳牌型
                        if (player.handShowCards === 0) {
                            // 顯示籌碼
                            const chipsText = this.scene.add.text(seatX, seatY + seatSize/2 + 10, `${player.playerChips}`, {
                                fontFamily: 'Arial',
                                fontSize: '26px',
                                color: '#ffcc00',
                                stroke: '#000000',
                                strokeThickness: 1,
                                align: 'center'
                            }).setOrigin(0.5).setScale(1).setDepth(10);
                            
                            this.playerNames.push(chipsText);
                        } else {
                            // 顯示最佳牌型
                            const cardBestText = this.scene.add.text(seatX, seatY + seatSize/2 + 10, `最佳牌: ${player.playerCardBest || '無'}`, {
                                fontFamily: 'Arial',
                                fontSize: '26px',
                                color: '#ffffff',
                                stroke: '#000000',
                                strokeThickness: 1,
                                align: 'center'
                            }).setOrigin(0.5).setScale(1).setDepth(10);
                            
                            this.playerNames.push(cardBestText);
                            
                            // 顯示玩家手牌
                            const handShowCards = player.playerCard;
                            if (handShowCards && typeof handShowCards === 'object') {
                                // 初始化該玩家的手牌數組
                                if (!this.playerCards[i]) {
                                    this.playerCards[i] = [];
                                }
                                
                                const cards = Object.values(handShowCards);
                                
                                // 計算卡片的寬度和高度，保持合適的長寬比例
                                const cardSizeWidth = Math.min(width, height) * 0.06; // 寬度較小
                                const cardSizeHeight = cardSizeWidth * 1.4; // 高度是寬度的1.4倍，符合撲克牌比例
                                const cardSpacing = 5; // 卡片間距
                                
                                // 計算起始位置，使卡片居中顯示
                                const totalWidth = cards.length * cardSizeWidth + (cards.length - 1) * cardSpacing;
                                let startX = seatX - totalWidth / 2 + cardSizeWidth / 2;
                                
                                // 顯示每張卡
                                cards.forEach((card, index) => {
                                    const cardX = startX + index * (cardSizeWidth + cardSpacing);
                                    const cardY = seatY - seatSize/4; // 在頭像上方顯示
                                    
                                    // 創建卡牌
                                    let cardImage;
                                    if (this.scene.textures.exists(card as string)) {
                                        cardImage = this.scene.add.image(cardX, cardY, card as string)
                                            .setDisplaySize(cardSizeWidth, cardSizeHeight)
                                            .setDepth(11);
                                    } else {
                                        cardImage = this.scene.add.rectangle(cardX, cardY, cardSizeWidth, cardSizeHeight, 0x000066, 0.8)
                                            .setStrokeStyle(2, 0xffffff)
                                            .setDepth(11) as any;
                                        
                                        const cardText = this.scene.add.text(cardX, cardY, card as string, {
                                            fontFamily: 'Arial',
                                            fontSize: '20px',
                                            color: '#ffffff',
                                            align: 'center'
                                        }).setOrigin(0.5).setScale(0.5).setDepth(12);
                                        
                                        this.playerCards[i].push(cardText as any);
                                    }
                                    
                                    this.playerCards[i].push(cardImage);
                                });
                            }
                        }
                    }
                    

                    if (betChipsAmount > 0) {
                        // 計算下注籌碼文字位置，距離圓心更近
                        const betTextX = centerX + Math.cos(angle) * (tableWidth * 0.45 * 0.6);
                        const betTextY = centerY + Math.sin(angle) * (tableHeight * 0.55 * 0.6);
                        
                        // 根據籌碼金額選擇不同的圖片
                        let chipTexture = 'chip';
                        if (betChipsAmount >= 1000) {
                            chipTexture = 'chip1000';
                        } else if (betChipsAmount >= 100) {
                            chipTexture = 'chip100';
                        }
                        
                        // 創建籌碼圖片
                        const chipSize = 36; // 籌碼圖片大小
                        const chipImage = this.scene.add.image(betTextX - 20, betTextY, chipTexture)
                            .setDisplaySize(chipSize, chipSize)
                            .setDepth(12);
                        
                        // 創建下注籌碼文字
                        const betText = this.scene.add.text(betTextX, betTextY, `$ ${betChipsAmount}`, {
                            fontFamily: 'Arial',
                            fontSize: '28px',
                            color: '#ffcc00',
                            stroke: '#000000',
                            strokeThickness: 1,
                            align: 'center'
                        }).setOrigin(0, 0.5).setScale(1).setDepth(12);

                        // 將下注籌碼文字和圖片添加到數組中
                        this.playerBetChips.push(betText);
                        this.playerBetChipImages.push(chipImage);
                    } else {
                        // 如果沒有下注，添加null到數組中保持索引一致
                        this.playerBetChips.push(null);
                        this.playerBetChipImages.push(null);
                    }
                    
                    this.playerAvatars.push(avatar);
                    this.playerNames.push(nameText);
                    this.playerBrand.push(infoBox);

                    if (player.number === seatTime.seatNumber) {
                        const countdownEffect = new CountdownEffect(this.scene);
                        countdownEffect.start(seatTime.startTime, seatTime.endTime, seatX, seatY + seatSize/2 + 35, 70, 5, false);
                        this.countdownEffects.push(countdownEffect);
                    } else {
                        // 如果沒有倒數時間，添加null到數組中保持索引一致
                        this.countdownEffects.push(null);
                    }

                } else {
                    // 如果沒有玩家，顯示可坐下的按鈕
                    // 檢查是否有 'seatButton' 紋理
                    if (!isTournament) {
                        let seatTexture = 'seatButton';
                        if (!this.scene.textures.exists(seatTexture)) {
                            // 使用一個替代紋理，如果有的話
                            if (this.scene.textures.exists('player')) {
                                seatTexture = 'player';
                            } else {
                                // 創建一個簡單的圓形作為座位
                                const graphics = this.scene.add.graphics();
                                graphics.fillStyle(0x333333, 0.8);
                                graphics.fillCircle(0, 0, seatSize / 2);
                                graphics.generateTexture('tempSeat', seatSize, seatSize);
                                graphics.destroy();
                                seatTexture = 'tempSeat';
                            }
                        }
                        
                        const seat = this.scene.add.image(seatX, seatY, seatTexture)
                            .setScale(0.6)
                            .setDepth(10)
                            .setInteractive()
                            // .setAlpha(0.6); // 半透明表示空座位
                            
                        // 添加點擊事件
                        seat.on('pointerdown', () => {
                            onSeatClick(seatNumber, minBuyIn, maxBuyIn);
                        });
                        
                        this.playerSeats.push(seat);
                    }

                    this.countdownEffects.push(null); // 添加空的倒數計時器佔位
                }
            }
            
            return {
                playerSeats: this.playerSeats,
                playerAvatars: this.playerAvatars,
                playerNames: this.playerNames,
                playerBetChips: this.playerBetChips,
                playerBetChipImages: this.playerBetChipImages,
                playerCards: this.playerCards,
                showHoleCards: this.showHoleCards,
                playerSeatButton: this.playerSeatButton,
            };
        } catch (error) {
            console.error('創建座位時出錯:', error);
            return {
                playerSeats: [],
                playerAvatars: [],
                playerNames: []
            };
        }
    }
}