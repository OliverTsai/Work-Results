import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { gameStateManager } from '../GameStateManager';

export class PokerSceneTransitionManager {
    private static instance: PokerSceneTransitionManager;
    private currentScene: Scene | null = null;
    private isTransitioning: boolean = false;
    private backgroundImage: Phaser.GameObjects.Image | null = null;
    private bootScene: Scene | null = null; // 保存 PokerBoot 場景的引用

    private constructor() {}

    public static getInstance(): PokerSceneTransitionManager {
        if (!PokerSceneTransitionManager.instance) {
            PokerSceneTransitionManager.instance = new PokerSceneTransitionManager();
        }
        return PokerSceneTransitionManager.instance;
    }

    public setCurrentScene(scene: Scene): void {
        this.currentScene = scene;
        
        // 如果是 PokerBoot 場景，保存引用
        if (scene.scene.key === 'PokerBoot') {
            this.bootScene = scene;
        }
    }

    public createBackground(scene: Scene): Phaser.GameObjects.Image {
        const { width, height } = scene.scale;
        
        // 創建新背景
        this.backgroundImage = scene.add.image(0, 0, 'background')
            .setOrigin(0, 0)
            .setDisplaySize(width, height)
            .setDepth(-1); // 確保背景在最底層
            
        return this.backgroundImage;
    }

    public transitionToScene(fromScene: Scene, toSceneName: string, data?: any): void {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        console.log(`正在從 ${fromScene.scene.key} 轉換到 ${toSceneName}`);
        
        // 使用淡入淡出效果，但不是全白
        fromScene.cameras.main.fadeOut(300, 0, 0, 0);
        
        fromScene.cameras.main.once('camerafadeoutcomplete', () => {
            // 啟動目標場景，但保持當前場景運行
            fromScene.scene.launch(toSceneName, data);
            
            // 獲取目標場景
            const toScene = fromScene.scene.get(toSceneName);
            
            // 設置目標場景的相機為淡入效果
            toScene.cameras.main.fadeIn(300, 0, 0, 0);
            
            // 當淡入完成後，停止原場景但不銷毀它
            toScene.cameras.main.once('camerafadeincomplete', () => {
                // 使用 sleep 而不是 stop，這樣場景狀態會被保留
                fromScene.scene.sleep();
                this.isTransitioning = false;
                
                // 設置新的當前場景
                this.currentScene = toScene;
            });
        });
    }

    // 獲取背景圖像
    public getBackgroundImage(): Phaser.GameObjects.Image | null {
        return this.backgroundImage;
    }
    
    // 在場景之間共享背景
    public shareBackground(toScene: Scene): Phaser.GameObjects.Image | null {
        if (this.backgroundImage && this.currentScene) {
            const { width, height } = toScene.scale;
            
            // 在新場景中創建相同的背景
            const newBackground = toScene.add.image(0, 0, 'background')
                .setOrigin(0, 0)
                .setDisplaySize(width, height)
                .setDepth(-1);
                
            return newBackground;
        }
        return null;
    }
}