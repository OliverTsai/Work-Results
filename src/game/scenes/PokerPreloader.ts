import { Scene } from 'phaser';
import { gameStateManager } from '../GameStateManager';

export class PokerPreloader extends Scene
{
    constructor ()
    {
        super('PokerPreloader');
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
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('/game/assets/picture');

        this.load.image('seatButton', 'btn-play.png');
        this.load.image('player', '/user/otherch4.png');
        this.load.image('leave', 'btn-leave.png');

        this.load.image('Table','Table.png')

        this.load.image('player1', '/user/otherch4.png');

        this.load.image('刺客', '/user/assa_sat1-1.png');
        this.load.image('刺客2', '/user/otherch_2_300.png');
        this.load.image('刺客3', '/user/otherch_2_300.png');
        this.load.image('魔法師', '/user/mage_sat1-1.png');
        this.load.image('弓箭手', '/user/弓箭手1-1NEW sat.png');
        this.load.image('祭司', '/user/祭司_sat1-1.png');
        this.load.image('騎士', '/user/knight1_1_sat.png');

        // 選桌場景需要的資源
        this.load.image('btn-back', 'btn-back.png');
        this.load.image('chip', 'chip.png');
        this.load.image('chip100', 'chip100.png');
        this.load.image('chip1000', 'chip1000.png');
        this.load.image('按鈕位', '按鈕位.png');
        this.load.image('確認', '確認.png');
        this.load.image('取消', '取消.png');

        //錦標賽
        this.load.image('trophy', 'trophy.png');

        //撲克牌
        this.load.image('XX', '/POKER/recharge/lvback1.png');
        this.load.image('2C', '/POKER/2C.png');
        this.load.image('2D', '/POKER/2D.png');
        this.load.image('2H', '/POKER/2H.png');
        this.load.image('2S', '/POKER/2S.png');
        this.load.image('3C', '/POKER/3C.png');
        this.load.image('3D', '/POKER/3D.png');
        this.load.image('3H', '/POKER/3H.png');
        this.load.image('3S', '/POKER/3S.png');
        this.load.image('4C', '/POKER/4C.png');
        this.load.image('4D', '/POKER/4D.png');
        this.load.image('4H', '/POKER/4H.png');
        this.load.image('4S', '/POKER/4S.png');
        this.load.image('5C', '/POKER/5C.png');
        this.load.image('5D', '/POKER/5D.png');
        this.load.image('5H', '/POKER/5H.png');
        this.load.image('5S', '/POKER/5S.png');
        this.load.image('6C', '/POKER/6C.png');
        this.load.image('6D', '/POKER/6D.png');
        this.load.image('6H', '/POKER/6H.png');
        this.load.image('6S', '/POKER/6S.png');
        this.load.image('7C', '/POKER/7C.png');
        this.load.image('7D', '/POKER/7D.png');
        this.load.image('7H', '/POKER/7H.png');
        this.load.image('7S', '/POKER/7S.png');
        this.load.image('8C', '/POKER/8C.png');
        this.load.image('8D', '/POKER/8D.png');
        this.load.image('8H', '/POKER/8H.png');
        this.load.image('8S', '/POKER/8S.png');
        this.load.image('9C', '/POKER/9C.png');
        this.load.image('9D', '/POKER/9D.png');
        this.load.image('9H', '/POKER/9H.png');
        this.load.image('9S', '/POKER/9S.png');
        this.load.image('TC', '/POKER/TC.png');
        this.load.image('TD', '/POKER/TD.png');
        this.load.image('TH', '/POKER/TH.png');
        this.load.image('TS', '/POKER/TS.png');
        this.load.image('JC', '/POKER/JC.png');
        this.load.image('JD', '/POKER/JD.png');
        this.load.image('JH', '/POKER/JH.png');
        this.load.image('JS', '/POKER/JS.png');
        this.load.image('QC', '/POKER/QC.png');
        this.load.image('QD', '/POKER/QD.png');
        this.load.image('QH', '/POKER/QH.png');
        this.load.image('QS', '/POKER/QS.png');
        this.load.image('KC', '/POKER/KC.png');
        this.load.image('KD', '/POKER/KD.png');
        this.load.image('KH', '/POKER/KH.png');
        this.load.image('KS', '/POKER/KS.png');
        this.load.image('AC', '/POKER/AC.png');
        this.load.image('AD', '/POKER/AD.png');
        this.load.image('AH', '/POKER/AH.png');
        this.load.image('AS', '/POKER/AS.png');

        //玩家動作按鈕
        this.load.image('actionButton', 'actionButton.png');
        this.load.image('raiseButton', '趴數按鈕-未按下.png');
        this.load.image('eye', 'eye.png');
        this.load.image('barBg', 'bar-bg.png');
        this.load.image('handle', 'handle.png');
        this.load.image('-', 'Negative_button.png');
        this.load.image('+', 'plus_button.png');

        //資料牌子
        this.load.image('myBrand', 'myBrand.png');
        this.load.image('playerBrand', 'Negative_button.png');

        //測試用
        this.load.image('test', 'test.jpg');

    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.      
        if (this.scene.isActive('PokerMainMenu')) {
        // 如果場景已經存在但處於休眠狀態，喚醒它
            this.scene.wake('PokerMainMenu');
        } else if (this.scene.isSleeping('PokerMainMenu')) {
            // 如果場景處於休眠狀態，喚醒它
            this.scene.wake('PokerMainMenu');
        } else {
        // 如果場景不存在或已被停止，重新啟動它
            this.scene.start('PokerMainMenu');
        }
        
        console.log('PokerPreloader')
    }
}
