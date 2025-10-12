import { Scene, GameObjects, Input } from 'phaser';
import { Block } from '../objects/Block';

export class GameScene extends Scene {
    // 遊戲配置
    private gridWidth: number = 6;  // 網格寬度
    private gridHeight: number = 8; // 網格高度
    private blockSize: number = 60; // 方塊大小
    private gridOffsetX: number = 0; // 網格X偏移
    private gridOffsetY: number = 0; // 網格Y偏移
    
    // 遊戲狀態
    private blocks: Block[][] = [];
    private selectedBlock: Block | null = null;
    private isSwapping: boolean = false;
    private score: number = 0;
    private scoreText: GameObjects.Text;
    
    constructor() {
        super('GameScene');
    }
    
    preload() {
        console.log('GameScene preload');
    }
    
    create() {
        const { width, height } = this.scale;
        
        // 計算網格偏移，使其居中
        this.gridOffsetX = (width - this.gridWidth * this.blockSize) / 2;
        this.gridOffsetY = (height - this.gridHeight * this.blockSize) / 2;
        
        // 添加背景
        const bg = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.5);
        
        // 添加分數顯示
        this.scoreText = this.add.text(20, 20, `分數: ${this.score}`, {
            fontSize: '24px',
            color: '#ffffff'
        });
        
        // 初始化遊戲板
        this.initializeBoard();
        
        // 設置輸入事件
        this.setupInputEvents();
    }
    
    private initializeBoard() {
        // 初始化空的二維數組
        for (let y = 0; y < this.gridHeight; y++) {
            this.blocks[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.createBlockAt(x, y);
            }
        }
        
        // 檢查並消除初始匹配
        this.checkAndClearMatches();
    }
    
    private createBlockAt(x: number, y: number) {
        // 隨機選擇一種顏色
        const color = Math.floor(Math.random() * 4);
        
        // 計算實際位置
        const posX = this.gridOffsetX + x * this.blockSize + this.blockSize / 2;
        const posY = this.gridOffsetY + y * this.blockSize + this.blockSize / 2;
        
        // 創建方塊
        const block = new Block(this, posX, posY, color);
        block.setGridPosition(x, y);

        // 確保數組已初始化
        if (!this.blocks[y]) {
            this.blocks[y] = [];
        }
        
        // 存儲到數組
        this.blocks[y][x] = block;
        
        return block;
    }
    
    private setupInputEvents() {
        // 按下事件
        this.input.on('pointerdown', (pointer: Input.Pointer) => {
            if (this.isSwapping) return;
            
            const { x, y } = this.getGridPosition(pointer.x, pointer.y);
            
            if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                this.selectedBlock = this.blocks[y][x];
                this.selectedBlock.select();
            }
        });
        
        // 移動事件
        this.input.on('pointermove', (pointer: Input.Pointer) => {
            if (!this.selectedBlock || this.isSwapping) return;
            
            const { x, y } = this.getGridPosition(pointer.x, pointer.y);
            
            if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                const targetBlock = this.blocks[y][x];
                
                // 確保目標方塊不是當前選中的方塊
                if (targetBlock !== this.selectedBlock) {
                    // 檢查是否為相鄰方塊
                    const dx = Math.abs(targetBlock.gridX - this.selectedBlock.gridX);
                    const dy = Math.abs(targetBlock.gridY - this.selectedBlock.gridY);
                    
                    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                        // 交換方塊
                        this.swapBlocks(this.selectedBlock, targetBlock);
                    }
                }
            }
        });
        
        // 釋放事件
        this.input.on('pointerup', () => {
            if (this.selectedBlock) {
                this.selectedBlock.deselect();
                this.selectedBlock = null;
                
                // 檢查並消除匹配
                this.checkAndClearMatches();
            }
        });
    }
    
    private getGridPosition(x: number, y: number) {
        // 將屏幕坐標轉換為網格坐標
        const gridX = Math.floor((x - this.gridOffsetX) / this.blockSize);
        const gridY = Math.floor((y - this.gridOffsetY) / this.blockSize);
        
        return { x: gridX, y: gridY };
    }
    
    private swapBlocks(block1: Block, block2: Block) {
        this.isSwapping = true;
        
        // 交換網格位置
        const tempX = block1.gridX;
        const tempY = block1.gridY;
        
        block1.setGridPosition(block2.gridX, block2.gridY);
        block2.setGridPosition(tempX, tempY);
        
        // 更新數組
        this.blocks[block1.gridY][block1.gridX] = block1;
        this.blocks[block2.gridY][block2.gridX] = block2;
        
        // 動畫交換
        this.tweens.add({
            targets: block1,
            x: this.gridOffsetX + block1.gridX * this.blockSize + this.blockSize / 2,
            y: this.gridOffsetY + block1.gridY * this.blockSize + this.blockSize / 2,
            duration: 200
        });
        
        this.tweens.add({
            targets: block2,
            x: this.gridOffsetX + block2.gridX * this.blockSize + this.blockSize / 2,
            y: this.gridOffsetY + block2.gridY * this.blockSize + this.blockSize / 2,
            duration: 200,
            onComplete: () => {
                this.isSwapping = false;
            }
        });
    }
    
    private async checkAndClearMatches() {
        // 檢查水平匹配
        const horizontalMatches = this.findHorizontalMatches();
        
        // 檢查垂直匹配
        const verticalMatches = this.findVerticalMatches();
        
        // 合併所有匹配
        const allMatches = [...horizontalMatches, ...verticalMatches];
        
        if (allMatches.length > 0) {
            // 消除匹配的方塊
            await this.clearMatches(allMatches);
            
            // 填充新方塊
            await this.fillEmptySpaces();
            
            // 再次檢查匹配（連鎖反應）
            this.checkAndClearMatches();
        }
    }
    
    private findHorizontalMatches(): Block[][] {
        const matches: Block[][] = [];
        
        for (let y = 0; y < this.gridHeight; y++) {
            let currentMatch: Block[] = [];
            
            for (let x = 0; x < this.gridWidth; x++) {
                const block = this.blocks[y][x];
                
                if (currentMatch.length === 0 || block.color === currentMatch[0].color) {
                    currentMatch.push(block);
                } else {
                    if (currentMatch.length >= 3) {
                        matches.push([...currentMatch]);
                    }
                    currentMatch = [block];
                }
            }
            
            // 檢查最後一組
            if (currentMatch.length >= 3) {
                matches.push(currentMatch);
            }
        }
        
        return matches;
    }
    
    private findVerticalMatches(): Block[][] {
        const matches: Block[][] = [];
        
        for (let x = 0; x < this.gridWidth; x++) {
            let currentMatch: Block[] = [];
            
            for (let y = 0; y < this.gridHeight; y++) {
                const block = this.blocks[y][x];
                
                if (currentMatch.length === 0 || block.color === currentMatch[0].color) {
                    currentMatch.push(block);
                } else {
                    if (currentMatch.length >= 3) {
                        matches.push([...currentMatch]);
                    }
                    currentMatch = [block];
                }
            }
            
            // 檢查最後一組
            if (currentMatch.length >= 3) {
                matches.push(currentMatch);
            }
        }
        
        return matches;
    }
    
    private async clearMatches(matches: Block[][]) {
        // 標記要消除的方塊
        const blocksToRemove: Set<Block> = new Set();
        
        for (const match of matches) {
            for (const block of match) {
                blocksToRemove.add(block);
            }
        }
        
        // 更新分數
        this.score += blocksToRemove.size * 10;
        this.scoreText.setText(`分數: ${this.score}`);
        
        // 播放消除動畫
        const animations: Promise<void>[] = [];
        
        for (const block of blocksToRemove) {
            animations.push(block.playDestroyAnimation());
            
            // 將方塊位置設為null
            this.blocks[block.gridY][block.gridX] = null;
        }
        
        // 等待所有動畫完成
        await Promise.all(animations);
        
        // 銷毀方塊
        for (const block of blocksToRemove) {
            block.destroy();
        }
    }
    
    private async fillEmptySpaces() {
        // 首先，將現有方塊下移填補空位
        for (let x = 0; x < this.gridWidth; x++) {
            // 從底部向上遍歷
            for (let y = this.gridHeight - 1; y >= 0; y--) {
                if (this.blocks[y][x] === null) {
                    // 找到一個空位，尋找上方最近的方塊
                    for (let above = y - 1; above >= 0; above--) {
                        if (this.blocks[above][x] !== null) {
                            // 找到了一個方塊，將其移動到空位
                            const block = this.blocks[above][x];
                            
                            // 更新位置
                            this.blocks[y][x] = block;
                            this.blocks[above][x] = null;
                            
                            // 更新方塊的網格位置
                            block.setGridPosition(x, y);
                            
                            // 添加動畫
                            this.tweens.add({
                                targets: block,
                                y: this.gridOffsetY + y * this.blockSize + this.blockSize / 2,
                                duration: 300
                            });
                            
                            break;
                        }
                    }
                }
            }
        }
        
        // 等待一小段時間讓動畫完成
        await new Promise(resolve => this.time.delayedCall(300, resolve));
        
        // 然後，在頂部創建新方塊
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (this.blocks[y][x] === null) {
                    // 在頂部外創建新方塊
                    const block = this.createBlockAt(x, -1);
                    
                    // 設置正確的網格位置
                    block.setGridPosition(x, y);
                    
                    // 更新數組
                    this.blocks[y][x] = block;
                    
                    // 設置初始位置（在屏幕外）
                    block.y = this.gridOffsetY - this.blockSize;
                    
                    // 添加下落動畫
                    this.tweens.add({
                        targets: block,
                        y: this.gridOffsetY + y * this.blockSize + this.blockSize / 2,
                        duration: 300
                    });
                }
            }
        }
        
        // 等待所有動畫完成
        await new Promise(resolve => this.time.delayedCall(300, resolve));
    }
    
    update() {
        // 遊戲邏輯更新
    }
}