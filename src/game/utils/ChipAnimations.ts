import { GameObjects, Scene, Tweens } from 'phaser';

export class ChipAnimations {
    private scene: Scene;
    private chipSprites: (GameObjects.Shape | GameObjects.Text)[] = [];

    constructor(scene: Scene) {
        this.scene = scene;
    }

    /**
     * 將玩家下注的籌碼移動到底池
     * @param playerBetChips 玩家下注籌碼文字對象數組
     * @param chipSprites 籌碼精靈數組引用，用於保存創建的籌碼精靈
     * @param callback 動畫完成後的回調函數
     */
    moveBetChipsToPool(
        playerBetChips: (GameObjects.Text | null)[], 
        chipSprites: (GameObjects.Shape | GameObjects.Text)[],
        callback: Function
    ) {
        const { width, height } = this.scene.scale;
        const centerX = width / 2;
        const centerY = height / 2 + 30; // 底池位置
        
        // 計算需要移動的籌碼數量
        let chipsToMove = 0;
        let completedAnimations = 0;

        // 檢查是否有有效的籌碼可以移動
        let hasValidChips = false;
        
        // 為每個玩家的下注籌碼創建動畫
        playerBetChips.forEach((betChip, index) => {
            if (betChip && betChip.text) {
                hasValidChips = true;
                chipsToMove++;

                // 獲取籌碼位置，如果籌碼不活躍，使用其存儲的坐標
                const chipX = betChip.x;
                const chipY = betChip.y;
                const chipText = betChip.text;
                
                // 創建一個克隆的籌碼文字用於動畫
                const chipClone = this.scene.add.text(chipX, chipY, chipText, {
                    fontFamily: 'Arial',
                    fontSize: '56px',
                    color: '#ffcc00',
                    stroke: '#000000',
                    strokeThickness: 1,
                    align: 'center'
                }).setOrigin(0.5).setScale(0.25).setDepth(12);
                
                chipSprites.push(chipClone as GameObjects.Text);
                
                // 添加移動動畫
                this.scene.tweens.add({
                    targets: chipClone,
                    x: centerX,
                    y: centerY,
                    duration: 800,
                    ease: 'Power2',
                    delay:100,
                    onComplete: () => {
                        // 動畫完成後淡出
                        this.scene.tweens.add({
                            targets: chipClone,
                            alpha: 0,
                            duration: 300,
                            ease: 'Power2',
                            onComplete: () => {
                                completedAnimations++;
                                
                                // 當所有動畫完成時，調用回調函數
                                if (completedAnimations === chipsToMove) {
                                    console.log('所有籌碼動畫完成');
                                    callback();
                                }
                            }
                        });
                        
                        // 同時淡出原始下注文字
                        this.scene.tweens.add({
                            targets: betChip,
                            alpha: 0,
                            duration: 300,
                            ease: 'Power2'
                        });
                    }
                });
            }
        });
        
        // 如果沒有需要移動的籌碼，直接調用回調
        if (!hasValidChips) {
            console.log('沒有有效的籌碼可以移動', playerBetChips);
            callback();
        } else if (chipsToMove === 0) {
            console.log('需要移動的籌碼數量為0');
            callback();
        }
    
    }

    /**
     * 將籌碼從底池移動到贏家位置
     * @param amount 獎池金額
     * @param players 贏家數組
     * @param sourcePosition 籌碼起始位置
     * @param getPlayerPositionFunc 根據座位號獲取玩家位置的函數
     * @param chipSprites 籌碼精靈數組引用
     * @param winnerTexts 贏家文字數組引用
     * @param callback 動畫完成後的回調函數
     */
    moveChipsToWinners(
        amount: number, 
        players: Array<{name: string, seatNumber: number}>,
        sourcePosition: {x: number, y: number},
        getPlayerPositionFunc: (seatNumber: number) => {x: number, y: number},
        chipSprites: (GameObjects.Shape | GameObjects.Text)[],
        winnerTexts: (GameObjects.Text | null)[] = [],
        callback?: Function
    ) {
        // const { width, height } = this.scene.scale;

        // 清理之前可能存在的動畫元素
        this.cleanupPreviousAnimations(chipSprites, winnerTexts);
        
        // 使用提供的源位置
        let sourceX = sourcePosition.x;
        let sourceY = sourcePosition.y;
        
        // 計算每位贏家應得的籌碼數量
        const amountPerWinner = amount / players.length;

        // 追蹤動畫完成情況
        let totalAnimations = 0;
        let completedAnimations = 0;
        
        // 為每位贏家創建籌碼動畫
        players.forEach(player => {
            // 決定籌碼移動的目標位置
            const targetPosition = getPlayerPositionFunc(player.seatNumber);
            let targetX = targetPosition.x;
            let targetY = targetPosition.y;
            
            // 創建多個籌碼精靈以增加視覺效果
            const chipCount = Math.min(5, Math.max(1, Math.floor(amountPerWinner / 100))); // 根據金額決定籌碼數量，最少1個，最多5個
            totalAnimations += chipCount + 1; // 加上文字動畫

            for (let i = 0; i < chipCount; i++) {
                // 創建籌碼精靈，從獎池位置開始
                const chipSprite = this.scene.add.circle(
                    sourceX + (Math.random() * 20 - 10), 
                    sourceY + (Math.random() * 20 - 10), 
                    10, 
                    0xffcc00
                );
                chipSprite.setStrokeStyle(1, 0xffffff);
                chipSprite.setDepth(3);
                
                chipSprites.push(chipSprite);
                
                // 添加移動動畫
                this.scene.tweens.add({
                    targets: chipSprite,
                    x: targetX + (Math.random() * 20 - 10),
                    y: targetY + (Math.random() * 20 - 10),
                    duration: 800,
                    ease: 'Power2',
                    delay: i * 100, // 每個籌碼延遲一點時間，形成連續移動效果
                    onComplete: () => {
                        // 動畫完成後添加閃爍效果
                        this.scene.tweens.add({
                            targets: chipSprite,
                            alpha: 0,
                            duration: 500,
                            ease: 'Power2',
                            delay: 500,
                            onComplete: () => {
                                chipSprite.destroy();
                                completedAnimations++;
                                this.checkAllAnimationsComplete(completedAnimations, totalAnimations, callback);
                            }
                        });
                    }
                });
            }
            
            // 在贏家座位處顯示獲得的金額
            const amountText = this.scene.add.text(targetX, targetY - 30, `+${amountPerWinner.toFixed(0)}`, {
                fontFamily: 'Arial',
                fontSize: '64px',
                color: '#ffcc00',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(0.5).setScale(0.25).setDepth(3);
            
            winnerTexts.push(amountText);
            
            // 添加文字動畫
            this.scene.tweens.add({
                targets: amountText,
                y: targetY - 50,
                alpha: 0,
                duration: 1500,
                ease: 'Power2',
                delay: 1000
            });
        });

        // 如果沒有贏家或動畫，直接調用回調
        if (players.length === 0 || totalAnimations === 0) {
            if (callback) callback();
        }
    }

    /**
     * 清理之前的動畫元素
     */
    private cleanupPreviousAnimations(
        chipSprites: (GameObjects.Shape | GameObjects.Text)[],
        winnerTexts: (GameObjects.Text | null)[]
    ) {
        // 清理籌碼精靈
        while (chipSprites.length > 0) {
            const sprite = chipSprites.pop();
            if (sprite) {
                sprite.destroy();
            }
        }
        
        // 清理贏家文字
        while (winnerTexts.length > 0) {
            const text = winnerTexts.pop();
            if (text) {
                text.destroy();
            }
        }
    }

    /**
     * 檢查所有動畫是否完成
     */
    private checkAllAnimationsComplete(
        completed: number,
        total: number,
        callback?: Function
    ) {
        if (completed >= total && callback) {
            console.log('所有贏家籌碼動畫完成');
            callback();
        }
    }

    /**
     * 清理所有籌碼精靈
     */
    clearChips() {
        this.chipSprites.forEach(chip => {
            if (chip) {
                chip.destroy();
            }
        });
        this.chipSprites = [];

        // 停止所有正在進行的 tweens
        this.scene.tweens.killAll();
    }

    destroy() {
        this.clearChips();
    }
}