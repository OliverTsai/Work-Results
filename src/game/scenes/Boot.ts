import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  啟動場景通常用於載入預先載入器所需的任何資源，例如遊戲標誌或背景。
        //  資源的檔案大小越小越好，因為啟動場景本身沒有預先載入器。

        this.load.image('background', 'assets/bgTable.png');
        this.load.image('background_select', 'assets/bg_select.png');
    }

    create ()
    {
        // 取得螢幕大小
        const { width, height } = this.scale;
        console.log('高')
        console.log(height)

        // 加入背景圖片
        const background = this.add.image(0, 0, 'background');

        // 設定圖片為左上角對齊（預設是中心對齊）
        background.setOrigin(0, 0);

        // 計算縮放比例：讓寬度 100%，高度根據原始比例調整
        const scaleX = width / background.width;
        const scaleY = scaleX; // 高度按比例縮放

        // 讓背景填滿整個螢幕
        background.setScale(scaleX, scaleY);

        // 切換到 Preloader 場景
        this.scene.start('Preloader');
    }
}
