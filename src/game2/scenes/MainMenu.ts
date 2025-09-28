import { GameObjects, Scene, Input } from 'phaser';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    player: GameObjects.Image;
    lightBalls: GameObjects.Group;
    shootTimer: Phaser.Time.TimerEvent;
    isShooting: boolean = false;

    constructor ()
    {
        super('MainMenu');
    }

    init() 
    {
        // 取得當前螢幕大小
        const { width, height } = this.scale;

        // 添加背景圖片
        this.background = this.add.image(width / 2, height / 2, 'background')
            .setDisplaySize(width, height); 
    }

    create ()
    {
        const { width, height } = this.scale;
        
        // 創建玩家
        this.player = this.add.image(width / 2, height - 200, '魔法師')
            .setInteractive();
        
        // 創建光球群組
        this.lightBalls = this.add.group();
        
        // 設置觸控移動事件
        this.input.on('pointermove', (pointer: Input.Pointer) => {
            if (pointer.isDown) {
                // 更新玩家的X座標為觸控點的X座標
                this.player.x = pointer.x;
            }
        });
        
        // 設置按下事件 - 開始射擊
        this.input.on('pointerdown', () => {
            this.isShooting = true;
            // 設置定時器，每200毫秒射出一個光球
            this.shootTimer = this.time.addEvent({
                delay: 200,
                callback: this.shootLightBall,
                callbackScope: this,
                loop: true
            });
        });
        
        // 設置放開事件 - 停止射擊
        this.input.on('pointerup', () => {
            this.isShooting = false;
            if (this.shootTimer) {
                this.shootTimer.remove();
            }
        });
    }
    
    shootLightBall() {
        if (!this.isShooting) return;
        
        // 創建光球 (這裡假設您有一個名為'lightball'的圖像資源)
        // 如果沒有，您需要先加載或替換為其他可用的圖像
        // const lightBall = this.add.image(this.player.x, this.player.y - 50, 'lightball');
        
        // 如果沒有'lightball'圖像，可以用圓形替代
        const lightBall = this.add.circle(this.player.x, this.player.y - 50, 10, 0xffff00);
        
        // 將光球添加到群組中
        this.lightBalls.add(lightBall);
        
        // 設置光球向上移動的動畫
        this.tweens.add({
            targets: lightBall,
            y: -100, // 移動到畫面上方外
            duration: 1500,
            ease: 'Linear',
            onComplete: () => {
                // 動畫完成後移除光球
                lightBall.destroy();
            }
        });
    }
    
    update() {
        // 可以在這裡添加更多遊戲邏輯
    }
}