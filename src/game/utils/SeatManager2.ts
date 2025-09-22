import { Scene, GameObjects } from 'phaser';
import { gameStateManager } from '../GameStateManager';
import { Seat } from './Seat';

export class SeatManager {

    private scene: Scene;

    // 儲存所有座位的容器
    public seats: any[] = [];

    constructor(scene: Scene) {
        this.scene = scene;
    }

    // 清空座位
    clearSeats() {
        try {

            this.seats.forEach(seat => {
                if (seat && seat.destroy) seat.destroy();
            });
            this.seats = [];

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
                    seats: []
                };
            }

            // 確保 tableState 存在
            if (!tableState) {
                console.error('tableState 不存在');
                return {
                    seats: []
                };
            }

            const { width, height } = this.scene.scale;
            const centerX = width / 2;
            const centerY = height / 2;
            
            // 清空之前的座位
            this.clearSeats();
            
            // 從傳入的 tableState 獲取值
            const minBuyIn = tableState?.mainBuyIn || '600'; // 最小買入金額
            const maxBuyIn = tableState?.maxBuyIn || '1000'; // 最大買入金額
            const seatButton = gameStateManager.tableState?.seatButton || 0;
            const seatTime = gameStateManager.tableState?.seatTime;

            // 檢查是否為錦標賽 - 修正判定邏輯
            const isTournament = !!(gameStateManager.tableState && 
                gameStateManager.tableState.tournamentId && 
                gameStateManager.tableState.tournamentId !== "");
            
            //確認座位人數
            const maxPlayer  = gameStateManager.tableState.maxPlayers
            
            // 定義一個橢圓形路徑來放置座位
            const ellipse = new Phaser.Geom.Ellipse(centerX, centerY, 500, 900);
            
            // 取得當前所有座位資訊
            const seats = gameStateManager.tableState.allSeats

            // 創建一個顯示對象數組，用於 PlaceOnEllipse
            const displayObjects: any[] = [];

            if (this.seats.length === maxPlayer) {
                // 更新現有座位

                for (let i = 1; i <= maxPlayer; i++) {
                    const seatIndex = i - 1;
                    
                    // 檢查是否有玩家坐在這個座位上
                    if (seats[i]?.status !== 'empty') {
                        
                        // 檢查現有座位是否為 Seat 實例
                        if (this.seats[seatIndex] instanceof Seat) {
                            // 更新現有座位
                            const seatObj = this.seats[seatIndex];
                            // 這裡我們先不設置位置，因為稍後會用 PlaceOnEllipse 設置
                            seatObj.update(this.scene, seats[i], {x: 0, y: 0}, seatButton, seatTime);

                            // 將容器添加到顯示對象數組
                            displayObjects.push(seatObj.getContainer());
                        } else {
                            // 如果不是 Seat 實例，則移除舊元素並創建新的 Seat
                            if (this.seats[seatIndex] && this.seats[seatIndex].destroy) {
                                this.seats[seatIndex].destroy();
                            }
                            
                            const seatObj = new Seat(i);
                            // 這裡我們先不設置位置，因為稍後會用 PlaceOnEllipse 設置
                            const container = seatObj.createElements(this.scene, seats[i], {x: 0, y: 0}, seatButton, seatTime);
                            this.seats[seatIndex] = container;
                            
                            // 將容器添加到顯示對象數組
                            if (container) {
                                displayObjects.push(container);
                            }
                        }
                    } else {
                        
                        // 如果之前是 Seat 實例，則清除它
                        if (this.seats[seatIndex] instanceof Seat) {
                            this.seats[seatIndex].clear(this.scene);
                        } else if (this.seats[seatIndex] && this.seats[seatIndex].destroy) {
                            this.seats[seatIndex].destroy();
                        }
                        
                        // 創建空座位按鈕
                        const seatButton = this.scene.add.image(0, 0, 'seatButton')
                            .setScale(0.6)
                            .setDepth(10)
                            .setInteractive();

                        seatButton.on('pointerdown', () => {
                            onSeatClick(i, minBuyIn, maxBuyIn);
                        });
                        
                        this.seats[seatIndex] = seatButton;
                        
                        // 將按鈕添加到顯示對象數組
                        displayObjects.push(seatButton);
                    }
                }
            } else {
                // 初始創建所有座位
                this.seats = []; // 清空現有座位
                
                for (let i = 1; i <= maxPlayer; i++) {
                    if (seats[i]?.status !== 'empty') {
                        const seatObj = new Seat(i);
                        // 這裡我們先不設置位置，因為稍後會用 PlaceOnEllipse 設置
                        const container = seatObj.createElements(this.scene, seats[i], {x: 0, y: 0}, seatButton, seatTime);
                        this.seats.push(seatObj);
                        
                        // 將容器添加到顯示對象數組
                        if (container) {
                            displayObjects.push(container);
                        }
                    } else {
                        const seatButton = this.scene.add.image(0, 0, 'seatButton')
                            .setScale(0.6)
                            .setDepth(10)
                            .setInteractive();

                        seatButton.on('pointerdown', () => {
                            onSeatClick(i, minBuyIn, maxBuyIn);
                        });
                        
                        this.seats.push(seatButton);
                        
                        // 將按鈕添加到顯示對象數組
                        displayObjects.push(seatButton);
                    }
                }
            }

            this.seats = displayObjects;

            // 使用 PlaceOnEllipse 設置所有顯示對象的位置
            Phaser.Actions.PlaceOnEllipse(this.seats, ellipse);

            // 如果需要旋轉動畫，可以添加以下代碼
            this.scene.tweens.add({
                targets: ellipse,
                angle: 360,
                duration: 5000,  // 5秒完成一圈旋轉
                repeat: -1,       // 無限重複
                onUpdate: () => {
                    Phaser.Actions.PlaceOnEllipse(this.seats, ellipse);
                }
            });

            return this.seats;

        } catch (error) {
            console.error('創建座位時出錯:', error);
            return {
                seats: this.seats
            };
        }
    }
}