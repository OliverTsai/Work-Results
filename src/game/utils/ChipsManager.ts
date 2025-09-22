import { Scene, GameObjects } from 'phaser';
import { gameStateManager } from '../GameStateManager';
import {Chips} from './Chips';

export class ChipsManager {

    private chip: Chips | null = null;
    private scene: Scene;

    // 儲存所有籌碼的容器
    public chips: Chips[] = [];

    constructor(scene: Scene) {
        this.scene = scene;
    }

    // 清空籌碼
    clearChips() {
        try {
            this.chips.forEach(chip => {
                if (chip && chip.clear) chip.clear();
            });
            this.chips = [];

        } catch (error) {
            console.error('清空籌碼時出錯:', error);
        }
    }

    // 創建玩家籌碼
    createChipsManager(tableState: any) {
        try {
            // 檢查場景是否有效
            if (!this.scene || !this.scene.add || typeof this.scene.add.graphics !== 'function') {
                console.error('場景無效或已被銷毀');
                return {
                    chips: []
                };
            }

            // 確保 tableState 存在
            if (!tableState) {
                console.error('tableState 不存在');
                tableState = { maxPlayers: 8 };
            }

            // if(tableState.betSwitch === true){
            //     this.moveToCenter();
            // }

            const { width, height } = this.scene.scale;
            const centerX = width / 2;
            const centerY = height / 2;

            //確認玩家人數
            const maxPlayer  = tableState.maxPlayers

            //玩家資料
            const playerChips = tableState.allSeats

            // 定義一個橢圓形路徑來放置籌碼
            const ellipse = new Phaser.Geom.Ellipse(centerX, centerY, 300, 600);

            // 創建一個顯示對象數組，用於 PlaceOnEllipse
            let displayObjects: any[] = [];

            // 清空之前的籌碼，避免重複
            // this.clearChips();

            if (this.chips.length === maxPlayer) {
                console.log('更新籌碼')
                console.log(this.chips)

                for (let i = 1; i <= maxPlayer; i++) {

                    let chipAmount: String = '0';
                    const chipIndex = i - 1;

                    if(!playerChips[i].bet_chips){
                        chipAmount = '0'
                    }else{
                        chipAmount = playerChips[i].bet_chips;
                    }

                    // if (this.chips[chipIndex] instanceof Chips) {
                    //     // 更新現有座位
                    //     const chipObj = this.chips[chipIndex];
                    //     // 這裡我們先不設置位置，因為稍後會用 PlaceOnEllipse 設置
                    //     chipObj.updateChips(this.scene, chipAmount);

                    //     // 將容器添加到顯示對象數組
                    //     const container = chipObj.getContainer();

                    //     if (container) {
                    //         displayObjects.push(container);
                    //     }
                    // }else {
                    //     // 如果不是 Chips 實例，則移除舊元素並創建新的 Seat
                    //     if (this.chips[chipIndex] && this.chips[chipIndex].clear()) {
                    //         this.chips[chipIndex].clear();
                    //     }
                        
                    //     const chipObj = new Chips(this.scene);
                    //     // 這裡我們先不設置位置，因為稍後會用 PlaceOnEllipse 設置
                    //     const container = chipObj.createChips(this.scene, chipAmount);
                    //     this.chips[chipIndex] = container;
                        
                    //     // 將容器添加到顯示對象數組
                    //     if (container) {
                    //         displayObjects.push(container);
                    //     }
                    // }

                    const chipObj = this.chips[chipIndex];
                    const container = chipObj.updateChips(this.scene, chipAmount);

                    if(container){
                        displayObjects.push(container);
                    }
                    
                }
            }else{
                for (let i = 1; i <= maxPlayer; i++) {

                    let chipAmount:String = "0";

                    if(!playerChips[i].bet_chips){
                        chipAmount = '0'
                    }else{
                        chipAmount = playerChips[i].bet_chips;
                    }

                    // 創建籌碼
                    const chipObj = new Chips(this.scene);
                    this.chips.push(chipObj);
                    const container = chipObj.createChips(this.scene, chipAmount);

                    if(container){
                        displayObjects.push(container);
                    }
                }
            }

            // 將籌碼放置在橢圓形路徑上
            Phaser.Actions.PlaceOnEllipse(displayObjects, ellipse);

            // 返回所有創建的籌碼
            return displayObjects

        } catch (error) {
            console.error('創建籌碼時出錯:', error);
            return null
        }
    }

    //移動到中心
    moveToCenter() {
        try {
            // 獲取場景的中心點
            const { width, height } = this.scene.scale;
            const centerX = width / 2;
            const centerY = height / 2;
            
            // 遍歷所有籌碼
            this.chips.forEach(chip => {
                // 確保籌碼和容器存在
                if (chip && chip.container) {
                    // 創建移動到中心的補間動畫
                    this.scene.tweens.add({
                        targets: chip.container,
                        x: centerX,
                        y: centerY,
                        duration: 500, // 動畫持續時間（毫秒）
                        ease: 'Power2', // 緩動函數
                        onComplete: () => {
                            console.log('籌碼已移動到中心');
                        }
                    });
                }
            });
        } catch (error) {
            console.error('移動籌碼到中心時出錯:', error);
        }
    }

}