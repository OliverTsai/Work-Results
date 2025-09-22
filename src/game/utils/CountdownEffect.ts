import { GameObjects, Scene } from 'phaser';

export class CountdownEffect {
    private scene: Phaser.Scene;
    private countdownText: GameObjects.Text | null = null;
    private countdownCircle: GameObjects.Arc | null = null;
    private timeEvent: Phaser.Time.TimerEvent | null = null;
    private initialTime: number = 0;
    private currentTime: number = 0;
    private x: number = 0;
    private y: number = 0;
    private isActive: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * 開始倒數計時特效
     * @param seconds 倒數的秒數
     * @param x 倒數特效的X座標位置
     * @param y 倒數特效的Y座標位置
     */
    start(seconds: number, x: number, y: number): void {
        // 如果已經有計時器在運行，先清除它
        this.stop();

        this.initialTime = seconds;
        this.currentTime = seconds;
        this.x = x;
        this.y = y;
        this.isActive = true;

        // 創建倒數圓圈背景
        this.countdownCircle = this.scene.add.circle(x, y, 20, 0x000000, 0.7)
            .setStrokeStyle(2, 0xffcc00)
            .setDepth(15);

        // 創建倒數文字
        this.countdownText = this.scene.add.text(x, y, seconds.toString(), {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 1
        })
            .setOrigin(0.5)
            .setDepth(16);

        // 創建計時事件
        this.timeEvent = this.scene.time.addEvent({
            delay: 1000,
            callback: this.updateCountdown,
            callbackScope: this,
            loop: true
        });

        // 添加閃爍動畫效果
        this.scene.tweens.add({
            targets: this.countdownCircle,
            alpha: { from: 1, to: 0.5 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    /**
     * 更新倒數計時
     */
    private updateCountdown(): void {
        if (!this.isActive) return;

        this.currentTime--;

        if (this.countdownText) {
            this.countdownText.setText(this.currentTime.toString());

            // 當時間少於3秒時，變成紅色並放大效果
            if (this.currentTime <= 3) {
                this.countdownText.setColor('#FF0000');
                
                // 添加脈動效果
                this.scene.tweens.add({
                    targets: this.countdownText,
                    scale: { from: 1, to: 1.5 },
                    duration: 300,
                    yoyo: true,
                    ease: 'Sine.easeInOut'
                });
                
                // 圓圈也變成紅色
                if (this.countdownCircle) {
                    this.countdownCircle.setStrokeStyle(2, 0xff0000);
                }
            }
        }

        // 時間結束時
        if (this.currentTime <= 0) {
            this.stop();
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

        if (this.countdownText) {
            this.countdownText.destroy();
            this.countdownText = null;
        }

        if (this.countdownCircle) {
            this.countdownCircle.destroy();
            this.countdownCircle = null;
        }

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
     * 更新倒數計時的位置
     */
    updatePosition(x: number, y: number): void {
        this.x = x;
        this.y = y;

        if (this.countdownText) {
            this.countdownText.setPosition(x, y);
        }

        if (this.countdownCircle) {
            this.countdownCircle.setPosition(x, y);
        }
    }
}