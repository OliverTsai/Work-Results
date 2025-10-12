import { GameObjects, Scene, Input } from 'phaser';
import { applyAllSkills } from './utils/skill';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    
    // UI元素
    startButton: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    preload() {
        // 預加載方塊圖片資源
        
        // this.load.image('background', 'assets/background.png');
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
        
        // 添加遊戲標題
        const title = this.add.text(width / 2, height / 3, '方塊消除遊戲', {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // 添加開始遊戲按鈕
        this.startButton = this.add.text(width / 2, height / 2, '開始遊戲', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#1a65ac',
            padding: {
                left: 20,
                right: 20,
                top: 10,
                bottom: 10
            }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
            this.startButton.setStyle({ backgroundColor: '#2c8ad8' });
        })
        .on('pointerout', () => {
            this.startButton.setStyle({ backgroundColor: '#1a65ac' });
        })
        .on('pointerdown', () => {
            this.startButton.setStyle({ backgroundColor: '#0d4b82' });
        })
        .on('pointerup', () => {
            this.startButton.setStyle({ backgroundColor: '#2c8ad8' });
            // 切換到遊戲場景
            this.scene.start('GameScene');
        });
        
        // 添加遊戲說明
        const instructions = this.add.text(width / 2, height * 0.7, 
            '遊戲說明:\n' +
            '- 拖動方塊與相鄰方塊交換位置\n' +
            '- 三個或更多相同顏色的方塊連在一起時會消除\n' +
            '- 消除方塊獲得分數', {
            fontSize: '20px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
    }
    
    update() {
        // 可以在這裡添加更多遊戲邏輯
    }
}