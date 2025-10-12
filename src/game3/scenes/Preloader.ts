import { Scene } from 'phaser';

export class Preloader extends Scene{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        // 獲取當前遊戲的實際寬高
        const { width, height } = this.scale;

        // 使用實際的遊戲寬高來定位元素，而不是固定值
        this.add.image(width / 2, height / 2, 'background')
            .setDisplaySize(width, height); // 設置背景圖片大小為整個畫面
        
        // 添加遊戲標誌
        this.add.image(width *0.8, height * 0.9, 'logo').setScale(0.8);
        
        // 進度條外框 - 使用相對位置
        const barWidth = Math.min(width * 0.8, 468); // 進度條寬度為畫面寬度的80%，但最大不超過468
        const barHeight = 32;
        this.add.rectangle(width / 2, height / 2, barWidth, barHeight).setStrokeStyle(1, 0xffffff);

        // 創建圓角矩形作為米黃色邊框
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0xFFE09B);
        graphics.strokeRoundedRect(
            width / 2 - (barWidth + 50) / 2,  // x 位置
            height / 2 - (barHeight + 50) / 2, // y 位置
            barWidth + 50,                    // 寬度
            barHeight + 50,                   // 高度
            15                                 // 圓角半徑
        );

        // 進度條 - 使用相對位置
        const bar = this.add.rectangle(width / 2 - barWidth / 2 + 2, height / 2, 4, barHeight - 4, 0xFFE09B);

        // 添加星星圖片在進度條上
        const star = this.add.image(width / 2 - barWidth / 2 + 2, height / 2, 'star').setScale(0.5);
        
        // 使用 'progress' 事件更新進度條
        this.load.on('progress', (progress: number) => {
            // 更新進度條寬度
            bar.width = 4 + ((barWidth - 8) * progress);
            
            // 更新星星位置，讓它跟隨進度條前端移動
            star.x = width / 2 - barWidth / 2 + 2 + ((barWidth - 8) * progress);
        });

        // 設置遊戲縮放模式
        this.scale.scaleMode = Phaser.Scale.FIT; // 使用 FIT 模式自適應螢幕
        this.scale.refresh(); // 刷新縮放
    }

    preload ()
    {
        this.load.image('刺客', 'https://olivertsai.github.io/Work-Results/assets/picture/user/assa_sat1-1.png');
        this.load.image('魔法師', 'https://olivertsai.github.io/Work-Results/assets/picture/user/mage_sat1-1.png');
        this.load.image('弓箭手', 'https://olivertsai.github.io/Work-Results/assets/picture/user/弓箭手1-1NEW sat.png');
        this.load.image('祭司', 'https://olivertsai.github.io/Work-Results/assets/picture/user/祭司_sat1-1.png');
        this.load.image('騎士', 'https://olivertsai.github.io/Work-Results/assets/picture/user/knight1_1_sat.png');

        this.load.image('block-red', '/public/assets/picture/red.png');
        this.load.image('block-blue', '/public/assets/picture/blue.png');
        this.load.image('block-green', '/public/assets/picture/green.png');
        this.load.image('block-yellow', '/public/assets/picture/yellow.png');
    }

    create()
    {
        console.log('Preloader')
        this.scene.start('MainMenu');
    }
}