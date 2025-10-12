import { GameObjects, Scene } from 'phaser';

export enum BlockColor {
    RED = 0,
    BLUE = 1,
    GREEN = 2,
    YELLOW = 3
}

export class Block extends GameObjects.Sprite {
    color: BlockColor;
    gridX: number;
    gridY: number;
    isSelected: boolean = false;
    
    constructor(scene: Scene, x: number, y: number, color: BlockColor) {
        // 根據顏色選擇不同的材質
        const textureKey = Block.getTextureByColor(color);
        super(scene, x, y, textureKey);
        
        this.color = color;
        this.setInteractive();
        scene.add.existing(this);
        
        // 設置方塊的初始大小
        this.setDisplaySize(60, 60);
    }
    
    // 根據顏色獲取對應的材質名稱
    static getTextureByColor(color: BlockColor): string {
        switch(color) {
            case BlockColor.RED:
                return 'block-red';
            case BlockColor.BLUE:
                return 'block-blue';
            case BlockColor.GREEN:
                return 'block-green';
            case BlockColor.YELLOW:
                return 'block-yellow';
            default:
                return 'block-red';
        }
    }
    
    // 設置網格位置
    setGridPosition(x: number, y: number): void {
        this.gridX = x;
        this.gridY = y;
    }
    
    // 選中效果
    select(): void {
        this.isSelected = true;
        this.setDisplaySize(70, 70);
        this.setAlpha(0.8);
    }
    
    // 取消選中效果
    deselect(): void {
        this.isSelected = false;
        this.setDisplaySize(60, 60);
        this.setAlpha(1.0);
    }
    
    // 消除動畫
    playDestroyAnimation(): Promise<void> {
        return new Promise((resolve) => {
            this.scene.tweens.add({
                targets: this,
                alpha: 0,
                scale: 0.5,
                duration: 300,
                onComplete: () => {
                    resolve();
                }
            });
        });
    }
}