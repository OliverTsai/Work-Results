import { GameObjects, Scene } from 'phaser';
import {Seat} from './Seat';

export class SeatGame {
    private scene: Phaser.Scene | null;
    private width: number;
    private height: number;

    //玩家座位資料
    public seats: any[] = [];

    // 存儲UI元素的數組
    private playerSeatButton:(GameObjects.Image | null)[] = [];
   
    constructor(scene: Scene) {
        this.scene = scene;
        const { width, height } = scene.scale;
        this.width = width;
        this.height = height;
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
    
    // 創建玩家位置
    createPlayerPositions(gameStateManager: any) {
        try {
            // 檢查場景是否有效
            if (!this.scene || !this.scene.add) {
                console.error('場景無效或已被銷毀');
                return {
                    seats: []
                };
            }

            // 確保 tableState 存在
            if (!gameStateManager.tableState) {
                console.error('tableState 不存在');
                return {
                    seats: []
                };
            }

            const maxPlayers = gameStateManager.tableState?.maxPlayers || 6;
            const centerX = this.width / 2;
            const centerY = this.height / 2;
            const seatButton = gameStateManager.tableState?.seatButton || 0;
            const seatTime = gameStateManager.tableState?.seatTime;
            // 使用專門的方法獲取座位號
            const myNumber = gameStateManager.getPlayerSeatNumber();

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

            // 調整順序，使座位從右到左圍繞牌桌
            seatOrder.sort((a, b) => {
                // 計算相對於我的座位的距離（逆時針方向）
                const distA = (a - myNumber + maxPlayers) % maxPlayers;
                const distB = (b - myNumber + maxPlayers) % maxPlayers;
                return distA - distB;
            });

            const fakeSeatTime = {
                seatNumber: 5,
                startTime: Date.now()/1000,
                endTime: Date.now()/1000 + 15 // 15秒後
            };

            // 取得當前所有座位資訊
            const seats = gameStateManager.tableState.allSeats;

            // 定義一個橢圓形路徑來放置座位
            const ellipse = new Phaser.Geom.Ellipse(centerX, centerY, 500, 1000);

            //確認座位人數
            const maxPlayer  = gameStateManager.tableState.maxPlayers || 0;

            // 創建一個顯示對象數組，用於 PlaceOnEllipse
            const displayObjects: any[] = [];

            // console.log('按鈕位置', seatButton);

            if (this.seats.length === maxPlayer) {

                //入座後的其他玩家座位
                const otherSeats = maxPlayer - 1;
                
                // 更新現有座位
                for (let i = 1; i <= otherSeats; i++) {
                    
                    const seatIndex = i - 1;

                    //應該對應的玩家座位號
                    const newSeatNumber = seatOrder[seatIndex];
                    
                    // 檢查是否有玩家坐在這個座位上
                    if (seats[newSeatNumber]?.status !== 'empty') {
                        
                        // 檢查現有座位是否為 Seat 實例
                        if (this.seats[seatIndex] instanceof Seat) {
                            // 更新現有座位
                            const seatObj = this.seats[seatIndex];
                            // 這裡我們先不設置位置，因為稍後會用 PlaceOnEllipse 設置
                            seatObj.update(this.scene, seats[newSeatNumber], {x: 0, y: 0}, seatButton, seatTime);

                            // 將容器添加到顯示對象數組
                            displayObjects.push(seatObj.getContainer());
                        } else {
                            // 如果不是 Seat 實例，則移除舊元素並創建新的 Seat
                            if (this.seats[seatIndex] && this.seats[seatIndex].destroy) {
                                this.seats[seatIndex].destroy();
                            }
                            
                            const seatObj = new Seat(i);
                            // 這裡我們先不設置位置，因為稍後會用 PlaceOnEllipse 設置
                            const container = seatObj.createElements(this.scene, seats[newSeatNumber], {x: 0, y: 0}, seatButton, seatTime);
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
                        
                        // 創建透明空座位
                        const seatButton2 = this.scene.add.image(0, 0, 'seatButton')
                            .setScale(0.6)
                            .setDepth(10)
                            .setInteractive();
                        
                        this.seats[seatIndex] = seatButton2;
                        
                        // 將按鈕添加到顯示對象數組
                        displayObjects.push(seatButton2);
                    }
                }
            }else{
                // 初始創建所有座位
                this.seats = []; // 清空現有座位

                //入座後的其他玩家座位
                const otherSeats = maxPlayer - 1;

                for (let i = 1; i <= otherSeats; i++) {

                    //應該對應的玩家座位號
                    const seatIndex = i - 1;
                    const newSeatNumber = seatOrder[seatIndex];

                    if (seats[newSeatNumber]?.status !== 'empty') {
                        const seatObj = new Seat(i);
                        // 這裡我們先不設置位置，因為稍後會用 PlaceOnEllipse 設置
                        const container = seatObj.createElements(this.scene, seats[newSeatNumber], {x: 0, y: 0}, seatButton, seatTime);
                        this.seats.push(seatObj);
                        
                        // 將容器添加到顯示對象數組
                        if (container) {
                            displayObjects.push(container);
                        }
                    } else {
                        const seatObj = new Seat(i);
                        const container = seatObj.createElements(this.scene, seats[newSeatNumber], {x: 0, y: 0}, seatButton, seatTime);
                        // const container = this.scene.add.image(0, 0, 'seatButton')
                        //     .setScale(0.6)
                        //     .setDepth(10)
                        //     .setInteractive();

                        this.seats.push(container);
                        
                        // 將按鈕添加到顯示對象數組
                        displayObjects.push(container);
                    }
                }
            }

            this.seats = displayObjects;

            const startAngle2 = Phaser.Math.DegToRad(173);
            const endAngle2 = Phaser.Math.DegToRad(399);

            Phaser.Actions.PlaceOnEllipse(this.seats, ellipse, startAngle2, endAngle2);
            
            return this.seats;

        } catch (error) {
            console.error('創建玩家位置時出錯:', error);
        }
    }

    // 獲取座位按鈕數組
    getPlayerSeatButton() {
        return this.playerSeatButton;
    }

    // 設置場景引用為 null，用於場景銷毀時
    destroy() {
        this.clearSeats();
        this.scene = null;
    }
}