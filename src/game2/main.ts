import Phaser from 'phaser';

import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import{ MainMenu } from './scenes/MainMenu';
import{ GameStart } from './scenes/GameStart';

import { AUTO, Game, Scale } from 'phaser';

// 創建一個標誌變量，確保遊戲只被初始化一次
let gameInstance: Phaser.Game | null = null;

const BASE_WIDTH = 375;
const BASE_HEIGHT = 667;

var winH = window.innerHeight
var winW = window.innerWidth
var dpr = Math.min(window.devicePixelRatio || 1, 2);

var H5 = winH > winW
var isGullScreen = winH/winW; //是否是全面屏
var canH,canW,bl;

// 計算畫布尺寸的函數
function calculateCanvasSize() {
    winH = window.innerHeight;
    winW = window.innerWidth;
    H5 = winH > winW;
    isGullScreen = winH/winW;
    
    if(isGullScreen > 1.9 && H5){

        // 全面屏手機，保持寬度適應，高度可能超出基準比例
        canW = BASE_WIDTH;
        canH = BASE_WIDTH * (winH / winW);
        console.log('全面屏手機', canW, canH);

    }else if(H5 && isGullScreen<1.9){

        // 一般豎屏設備，保持基準比例
        canW = BASE_WIDTH;
        canH = BASE_HEIGHT;
        console.log('一般豎屏設備', canW, canH);

    }else{

        // 橫屏設備，保持基準比例
        canH = BASE_HEIGHT;
        canW = BASE_WIDTH;
        console.log('橫屏設備', canW, canH);

    }
    
    bl = canW / 640;

    canH *= dpr;
    canW *= dpr;
    
    // 如果遊戲實例存在，則調整其大小
    if (gameInstance) {
        gameInstance.scale.resize(canW, canH);
        gameInstance.scale.refresh();
    }
}

// 初始計算
calculateCanvasSize();

// 監聽窗口大小變化
window.addEventListener('resize', () => {
    winW = window.innerWidth;
    winH = window.innerHeight;
    calculateCanvasSize(); // 重新計算並應用新尺寸
});


const config = {
    type: AUTO,
    // width: window.innerWidth,   // 設定為螢幕寬度
    width:canW,
    // height: window.innerHeight, // 設定為螢幕高度
    height:canH,
    parent: 'game-container',
    pixelArt: true,
    backgroundColor: '#000000',
    resolution: Math.max(window.devicePixelRatio, 2), // ✅ 讓 Phaser 根據實際螢幕密度渲染高解析畫面
    autoRound: true, // ✅ 確保像素對齊，避免模糊
    scene: [
        Boot,
        Preloader,
        MainMenu,
        GameStart,
    ],
    render: {
        antialias: true, // ✅ 關鍵：禁用抗鋸齒（會導致模糊）
        pixelArt: false,     // ✅ 雙保險：確保 pixel 精準顯示
        clearBeforeRender: true,
        failIfMajorPerformanceCaveat: false, // 避免低階設備中斷
        powerPreference: 'high-performance', // 優先使用高性能 GPU
    },
    scale: {
        mode: Scale.FIT,  // 自動縮放遊戲來適應視窗
        autoCenter: Scale.CENTER_BOTH, // 居中顯示遊戲
        orientation: Scale.PORTRAIT, // 強制豎屏方向
    },
    // 添加 FPS 顯示和性能監控
    fps: {
        target: 60,
        forceSetTimeOut: false,
        min: 10,
        paused: false
    },
    physics: {
        default: 'arcade',
        arcade: {
        debug: true // 顯示物理引擎調試信息
        }
    },
    // 添加 WebGL 上下文配置，減少上下文丟失問題
    contextCreation: {
        powerPreference: 'high-performance'
    }
} as unknown as Phaser.Types.Core.GameConfig;

const StartGame = (parent: string) => {

    // 如果已經有遊戲實例，先銷毀它
    if (gameInstance) {
        gameInstance.destroy(true);
        gameInstance = null;
    } 

    // 創建新的遊戲實例
    gameInstance = new Game({ ...config, parent });
    return gameInstance;
}

export default StartGame;