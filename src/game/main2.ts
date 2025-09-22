import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game, Scale } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { TableSelectScene } from './scenes/TableSelectScene';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: window.innerWidth,   // 設定為螢幕寬度
    height: window.innerHeight, // 設定為螢幕高度
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        MainMenu,
        TableSelectScene,
        MainGame,
        GameOver
    ],
    scale: {
        mode: Scale.FIT,  // 自動縮放遊戲來適應視窗
        autoCenter: Scale.CENTER_BOTH, // 居中顯示遊戲
    }
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
