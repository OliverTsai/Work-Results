import { GameObjects, Scene, Input } from 'phaser';

export class GameStart extends Scene
{
    background: GameObjects.Image;
    player: GameObjects.Image;
    lightBalls: GameObjects.Group;
    shootTimer: Phaser.Time.TimerEvent;
    isShooting: boolean = false;
    
    // 角色資料
    characterData: any;
    
    // UI元素
    nameText: GameObjects.Text;
    levelText: GameObjects.Text;
    statsText: GameObjects.Text;
    shootInterval: number = 200; // 射擊間隔，會根據速度調整

    constructor ()
    {
        super('GameStart');
    }

    init(data: any) 
    {
        // 接收從MainMenu傳過來的角色資料
        if (data && data.character) {
            this.characterData = data.character;
            console.log('接收到角色資料:', this.characterData);
            
            // 根據角色速度調整射擊間隔
            this.shootInterval = Math.max(50, 200 - (this.characterData.speed * 15));
        } else {
            // 如果沒有傳入資料，嘗試從localStorage讀取最後選擇的角色
            try {
                const lastIndex = localStorage.getItem('lastSelectedCharacterIndex');
                const savedData = localStorage.getItem('characterData');
                
                if (lastIndex && savedData) {
                    const allCharacters = JSON.parse(savedData);
                    this.characterData = allCharacters[parseInt(lastIndex)];
                    console.log('從localStorage讀取角色資料:', this.characterData);
                    
                    // 根據角色速度調整射擊間隔
                    this.shootInterval = Math.max(50, 200 - (this.characterData.speed * 15));
                } else {
                    console.error('沒有角色資料可用');
                    // 使用默認值
                    this.characterData = {
                        name: '魔法師',
                        harm: 1,
                        speed: 1,
                        lv: 1
                    };
                    this.shootInterval = 200;
                }
            } catch (error) {
                console.error('讀取角色資料失敗', error);
                // 使用默認值
                this.characterData = {
                    name: '魔法師',
                    harm: 1,
                    speed: 1,
                    lv: 1
                };
                this.shootInterval = 200;
            }
        }
        
        // 取得當前螢幕大小
        const { width, height } = this.scale;

        // 添加背景圖片
        this.background = this.add.image(width / 2, height / 2, 'background')
            .setDisplaySize(width, height); 
    }

    create ()
    {
        const { width, height } = this.scale;
        
        // 創建玩家，使用選擇的角色圖像
        this.player = this.add.image(width / 2, height - 200, this.characterData.name)
            .setInteractive();
        
        // 創建光球群組
        this.lightBalls = this.add.group();
        
        // 添加角色資訊UI
        this.createCharacterUI();
        
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
            // 設置定時器，根據角色速度決定射擊間隔
            this.shootTimer = this.time.addEvent({
                delay: this.shootInterval,
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
        
        // 添加返回主選單按鈕
        const backButton = this.add.rectangle(
            80, 
            40, 
            120, 
            50, 
            0x000000, 
            0.7
        ).setOrigin(0.5).setInteractive();
        
        const backText = this.add.text(
            80, 
            40, 
            '返回', 
            { fontSize: '24px', color: '#ffffff' }
        ).setOrigin(0.5);
        
        backButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
    
    // 創建角色資訊UI
    createCharacterUI() {
        const { width } = this.scale;
        
        // 添加角色名稱
        this.nameText = this.add.text(
            width / 2, 
            20, 
            this.characterData.name, 
            { fontSize: '32px', color: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // 添加等級
        this.levelText = this.add.text(
            width / 2, 
            60, 
            `等級: ${this.characterData.lv}`, 
            { fontSize: '24px', color: '#ffcc00' }
        ).setOrigin(0.5);
        
        // 添加屬性
        this.statsText = this.add.text(
            width / 2, 
            90, 
            `攻擊: ${this.characterData.harm}   速度: ${this.characterData.speed}`, 
            { fontSize: '20px', color: '#ffffff' }
        ).setOrigin(0.5);
    }
    
    shootLightBall() {
        if (!this.isShooting) return;
        
        // 創建光球 (這裡假設您有一個名為'lightball'的圖像資源)
        // 如果沒有，您需要先加載或替換為其他可用的圖像
        // const lightBall = this.add.image(this.player.x, this.player.y - 50, 'lightball');
        
        // 如果沒有'lightball'圖像，可以用圓形替代
        // 根據角色的攻擊力調整光球大小和顏色
        const ballSize = 5 + (this.characterData.harm * 2); // 基礎大小 + 攻擊力加成
        const ballColor = this.getBallColorByCharacter(this.characterData.name);
        
        const lightBall = this.add.circle(this.player.x, this.player.y - 50, ballSize, ballColor);
        
        // 將光球添加到群組中
        this.lightBalls.add(lightBall);
        
        // 設置光球向上移動的動畫，速度根據角色速度調整
        const duration = Math.max(800, 1500 - (this.characterData.speed * 70));
        
        this.tweens.add({
            targets: lightBall,
            y: -100, // 移動到畫面上方外
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                // 動畫完成後移除光球
                lightBall.destroy();
            }
        });
    }
    
    // 根據角色名稱獲取光球顏色
    getBallColorByCharacter(name: string): number {
        switch (name) {
            case '魔法師':
                return 0x00ffff; // 青色
            case '刺客':
                return 0xff0000; // 紅色
            case '弓箭手':
                return 0x00ff00; // 綠色
            case '祭司':
                return 0xffff00; // 黃色
            case '騎士':
                return 0xff8800; // 橙色
            default:
                return 0xffffff; // 白色
        }
    }
    
    update() {
        // 可以在這裡添加更多遊戲邏輯
    }
}