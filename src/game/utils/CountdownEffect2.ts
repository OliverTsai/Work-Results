import { GameObjects, Scene } from 'phaser';

export class CountdownEffect {
    private scene: Phaser.Scene;
    public graphics: GameObjects.Container; // 改為容器，包含所有倒數效果元素
    private progressBar: GameObjects.Graphics | null = null;
    private progressBarBg: GameObjects.Graphics | null = null;
    private timeEvent: Phaser.Time.TimerEvent | null = null;
    private initialTime: number = 0;
    private currentTime: number = 0;
    private width: number = 100; // 進度條寬度
    private height: number = 10; // 進度條高度
    private isActive: boolean = false;
    private onComplete: (() => void) | null = null;
    private showText: boolean = true;
    private countdownText: GameObjects.Text | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        // 創建一個容器來包含所有倒數效果元素
        this.graphics = scene.add.container(0, 0);
    }

    /**
     * 開始倒數計時進度條特效
     * @param startTimestamp 開始的時間戳 (秒)
     * @param endTimestamp 結束的時間戳 (秒)
     * @param x 進度條的X座標位置 (中心點) - 不再使用，改為相對座標
     * @param y 進度條的Y座標位置 (中心點) - 不再使用，改為相對座標
     * @param width 進度條寬度 (可選，默認為100)
     * @param height 進度條高度 (可選，默認為10)
     * @param showText 是否顯示倒數文字 (可選，默認為true)
     * @param onComplete 倒數完成時的回調函數 (可選)
     */
    start(
        startTimestamp: number,
        endTimestamp: number,
        x: number = 0, // 這些參數不再使用於設置絕對位置
        y: number = 0, // 但保留它們以保持向後兼容性
        width: number = 100, 
        height: number = 10,
        showText: boolean = true,
        onComplete?: () => void
    ): void {
        // 如果已經有計時器在運行，先清除它
        this.stop();

        // 將秒級時間戳轉換為毫秒級
        const startTimeMs = startTimestamp * 1000;
        const endTimeMs = endTimestamp * 1000;

        // 計算總時間（秒）
        const totalTimeMs = endTimeMs - startTimeMs;
        const totalTimeSeconds = Math.ceil(totalTimeMs / 1000);

        this.initialTime = totalTimeSeconds;
        this.currentTime = totalTimeSeconds;
        this.width = width;
        this.height = height;
        this.isActive = true;
        this.showText = showText;
        this.onComplete = onComplete || null;

        // 清空容器中的所有元素
        this.graphics.removeAll(true);

        // 創建進度條背景
        this.progressBarBg = this.scene.add.graphics();
        this.progressBarBg.fillStyle(0x000000, 0.7); // 黑色半透明背景
        this.progressBarBg.fillRoundedRect(
            -width / 2, 
            -height / 2, 
            width, 
            height, 
            height / 2
        ); // 圓角矩形
        this.progressBarBg.lineStyle(2, 0xffffff, 0.8); // 白色邊框
        this.progressBarBg.strokeRoundedRect(
            -width / 2, 
            -height / 2, 
            width, 
            height, 
            height / 2
        );
        this.progressBarBg.setDepth(15);
        this.graphics.add(this.progressBarBg);

        // 創建進度條
        this.progressBar = this.scene.add.graphics();
        this.updateProgressBar(1); // 初始進度為100%
        this.progressBar.setDepth(16);
        this.graphics.add(this.progressBar);

        // 如果需要顯示倒數文字
        if (this.showText) {
            this.countdownText = this.scene.add.text(
                0, 
                -height - 5, 
                totalTimeSeconds.toString(), 
                {
                    fontFamily: 'Arial',
                    fontSize: '14px',
                    color: '#FFFFFF',
                    stroke: '#000000',
                    strokeThickness: 1
                }
            )
            .setOrigin(0.5)
            .setDepth(17);
            this.graphics.add(this.countdownText);
        }

        // 創建計時事件 - 使用更高頻率的更新以獲得更平滑的進度條
        this.timeEvent = this.scene.time.addEvent({
            delay: 1000, // 每1000毫秒更新一次
            callback: () => {
                const currentTimeMs = Date.now();
                
                // 如果當前時間已經超過結束時間
                if (currentTimeMs >= endTimeMs) {
                    if (this.onComplete) {
                        this.onComplete();
                    }
                    this.stop();
                    return;
                }
                
                // 計算剩餘時間（秒）
                const remainingTimeMs = endTimeMs - currentTimeMs;
                this.currentTime = Math.ceil(remainingTimeMs / 1000);
                
                // 計算進度 (0-1之間)
                const progress = (currentTimeMs - startTimeMs) / totalTimeMs;
                
                // 更新進度條
                this.updateProgressBar(1 - progress); // 反轉進度，讓進度條隨時間減少
                
                // 更新倒數文字
                if (this.showText && this.countdownText) {
                    this.countdownText.setText(this.currentTime.toString());
                }
                
                // 當剩餘時間少於3秒時，進度條變紅色並有脈動效果
                if (this.currentTime <= 3) {
                    if (this.showText && this.countdownText && this.countdownText.style.color !== '#FF0000') {
                        this.countdownText.setColor('#FF0000');
                        
                        // 添加脈動效果 (只添加一次)
                        this.scene.tweens.add({
                            targets: this.countdownText,
                            scale: { from: 1, to: 1.3 },
                            duration: 300,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });
                    }
                    
                    // 進度條閃爍效果 (避免重複添加)
                    if (this.progressBar && !this.progressBar.getData('flashing')) {
                        this.progressBar.setData('flashing', true);
                        this.scene.tweens.add({
                            targets: this.progressBar,
                            alpha: { from: 1, to: 0.5 },
                            duration: 200,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });
                    }
                }
            },
            callbackScope: this,
            loop: true
        });

        // 添加閃爍動畫效果
        this.scene.tweens.add({
            targets: this.progressBarBg,
            alpha: { from: 1, to: 0.7 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    /**
     * 更新倒數計時的時間戳
     * @param startTimestamp 新的開始時間戳 (秒)
     * @param endTimestamp 新的結束時間戳 (秒)
     */
    updateTimestamps(startTimestamp: number, endTimestamp: number): void {
        // 如果倒計時不在運行，則不做任何事
        if (!this.isActive || !this.timeEvent) {
            return;
        }

        // 更新時間戳
        // this.startTimestamp = startTimestamp;
        // this.endTimestamp = endTimestamp;

        // 將秒級時間戳轉換為毫秒級
        const startTimeMs = startTimestamp * 1000;
        const endTimeMs = endTimestamp * 1000;
        const currentTimeMs = Date.now();

        // 計算總時間（秒）
        const totalTimeMs = endTimeMs - startTimeMs;
        const totalTimeSeconds = Math.ceil(totalTimeMs / 1000);
        
        // 計算剩餘時間（秒）
        const remainingTimeMs = endTimeMs - currentTimeMs;
        const remainingTimeSeconds = Math.ceil(remainingTimeMs / 1000);

        // 更新初始時間和當前時間
        this.initialTime = totalTimeSeconds;
        this.currentTime = remainingTimeSeconds;

        // 如果剩餘時間小於等於0，停止倒計時
        if (remainingTimeSeconds <= 0) {
            if (this.onComplete) {
                this.onComplete();
            }
            this.stop();
            return;
        }

        // 更新倒數文字
        if (this.showText && this.countdownText) {
            this.countdownText.setText(remainingTimeSeconds.toString());
            
            // 當剩餘時間少於3秒時，文字變紅色並有脈動效果
            if (remainingTimeSeconds <= 3) {
                this.countdownText.setColor('#FF0000');
                
                // 如果沒有脈動效果，添加一個
                if (!this.countdownText.getData('pulsing')) {
                    this.countdownText.setData('pulsing', true);
                    this.scene.tweens.add({
                        targets: this.countdownText,
                        scale: { from: 1, to: 1.3 },
                        duration: 300,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }
            } else {
                // 如果剩餘時間大於3秒，恢復正常顏色
                this.countdownText.setColor('#FFFFFF');
                this.countdownText.setData('pulsing', false);
                this.countdownText.setScale(1);
                
                // 停止所有與文字相關的補間動畫
                this.scene.tweens.killTweensOf(this.countdownText);
            }
        }

        // 計算進度 (0-1之間)
        const progress = (currentTimeMs - startTimeMs) / totalTimeMs;
        
        // 更新進度條
        this.updateProgressBar(1 - progress); // 反轉進度，讓進度條隨時間減少
    }

    /**
     * 更新進度條顯示
     * @param progress 進度值 (0-1之間)
     */
    private updateProgressBar(progress: number): void {
        if (!this.progressBar) return;
        
        this.progressBar.clear();
        
        // 根據剩餘時間變化顏色
        let barColor = 0x00ff00; // 綠色
        
        if (progress < 0.6 && progress >= 0.3) {
            barColor = 0xffff00; // 黃色
        } else if (progress < 0.3) {
            barColor = 0xff0000; // 紅色
        }
        
        this.progressBar.fillStyle(barColor, 1);
        
        // 計算進度條實際寬度
        const actualWidth = this.width * progress;
        
        // 繪製圓角進度條
        if (actualWidth > 0) {
            this.progressBar.fillRoundedRect(
                -this.width / 2, 
                -this.height / 2, 
                actualWidth, 
                this.height, 
                this.height / 2
            );
        }
    }

    /**
     * 停止倒數計時並清除相關物件
     */
    stop(): void {
        if (this.timeEvent) {
            this.timeEvent.remove();
            this.timeEvent = null;
        }

        // 清空容器中的所有元素
        if (this.graphics) {
            this.graphics.removeAll(true);
        }

        this.progressBar = null;
        this.progressBarBg = null;
        this.countdownText = null;
        this.isActive = false;
    }

    /**
     * 檢查倒數計時是否正在運行
     */
    isRunning(): boolean {
        return this.isActive;
    }

    /**
     * 獲取當前剩餘時間
     */
    getRemainingTime(): number {
        return this.currentTime;
    }

    /**
     * 設置容器位置
     */
    setPosition(x: number, y: number): void {
        if (this.graphics) {
            this.graphics.setPosition(x, y);
        }
    }
    
    /**
     * 設置進度條顏色
     * @param color 十六進制顏色值
     */
    setBarColor(color: number): void {
        if (this.progressBar) {
            this.updateProgressBar(this.currentTime / this.initialTime);
        }
    }

    //清除所有資源
    destroy(): void {
        this.stop();
        if (this.graphics) {
            this.graphics.destroy();
        }
        this.scene = null as any; // 清除場景引用
        this.onComplete = null; // 清除回調函數
        this.progressBar = null; // 清除進度條引用
        this.progressBarBg = null; // 清除進度條背景引用
        this.timeEvent = null; // 清除計時事件引用
        this.countdownText = null; // 清除倒數文字引用
        this.initialTime = 0; // 重置初始時間
        this.currentTime = 0; // 重置當前時間
    }
}