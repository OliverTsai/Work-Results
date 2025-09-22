import { Scene, GameObjects } from 'phaser';

export class BetSliderManager {
    private scene: Scene;
    private betSliderContainer: GameObjects.Container;
    private betSliderHandle: GameObjects.Image;
    private betAmountText: GameObjects.Text;
    private currentBetAmount: string;
    private actionButtons: GameObjects.Container[] = [];

    // 新增兩個屬性來存儲拉桿背景元素
    private sliderBgWhite: GameObjects.Rectangle;
    private sliderBgGreen: GameObjects.Rectangle;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    // 創建下注拉桿
    createBetSlider(minValue: string, maxValue: string, y: number, actionButtons: GameObjects.Container[]) {
        this.actionButtons = actionButtons;
        
        // 計算拉桿的尺寸和位置
        const { width } = this.scene.scale;
        const sliderWidth = width / 2 - 160; // 拉桿寬度
        const sliderHeight = 15;
        const sliderX = width / 2  + 10;

        // 修改拉桿位置 - 將拉桿放在按鈕上方
        const sliderY = y - 70; // 將拉桿向上移動，放在按鈕上方
        
        // 創建拉桿容器
        this.betSliderContainer = this.scene.add.container(0, 0);
        this.betSliderContainer.setDepth(10);

        // 創建一個黑色背景容器，帶有圓角和邊框
        const containerWidth = width / 2 - 160;
        const containerHeight = 120;
        const containerY = sliderY - 5;

        // 使用圖形對象創建圓角矩形
        const controlsContainer = this.scene.add.graphics().setDepth(3);
        controlsContainer.fillStyle(0x000000, 0.8); // 黑色背景，80%不透明度
        controlsContainer.lineStyle(2, 0xddb755, 1); // 灰色邊框
        controlsContainer.fillRoundedRect(sliderX - containerWidth/2  , containerY - containerHeight/2 -25, containerWidth, containerHeight, 10); // 10px圓角
        controlsContainer.strokeRoundedRect(sliderX - containerWidth/2  , containerY - containerHeight/2 -25, containerWidth, containerHeight, 10);
        this.betSliderContainer.add(controlsContainer);

        // 創建金額顯示文本 - 放在中間
        this.betAmountText = this.scene.add.text(sliderX, containerY - 60, `$${minValue}`, {
            fontFamily: 'Arial',
            fontSize: '34px',
            color: '#ddb755',
            backgroundColor: '#000000',
            align: 'center'
        }).setOrigin(0.5).setScale(1);

        this.betSliderContainer.add(this.betAmountText);
        
        // 創建減少按鈕 - 放在左側
        const minText = this.scene.add.image(sliderX  - 45, containerY + 5, '-')
            .setScale(0.8)
            .setInteractive(); // 設置為可交互
        
        // 創建增加按鈕 - 放在右側
        const maxText = this.scene.add.image(sliderX  + 45, containerY + 5, '+')
            .setScale(0.8)
            .setInteractive(); // 設置為可交互
        
        // 將所有元素添加到金額控制容器中
        this.betSliderContainer.add([minText, maxText]);

        // 創建拉桿背景
        // const sliderBg = this.scene.add.image(sliderX, sliderY + 20, 'barBg')
        //     .setDisplaySize(sliderWidth, sliderHeight);
        // this.betSliderContainer.add(sliderBg);

        // 創建拉桿背景 - 修改為矩形
        // 1. 創建綠色背景條
        this.sliderBgWhite = this.scene.add.rectangle(
            sliderX, 
            sliderY - 35, 
            sliderWidth, 
            sliderHeight, 
            0x2e4840, 
            1
        ).setOrigin(0.5);
        this.betSliderContainer.add(this.sliderBgWhite);
        
        // 2. 創建綠色進度條 (初始寬度為0)
        this.sliderBgGreen = this.scene.add.rectangle(
            sliderX - sliderWidth/2, 
            sliderY - 35, 
            0, // 初始寬度為0
            sliderHeight, 
            0xfbd38f, // 綠色
            1
        ).setOrigin(0, 0.5); // 設置原點在左側中間
        this.betSliderContainer.add(this.sliderBgGreen);

        // 創建拉桿手柄
        this.betSliderHandle = this.scene.add.image(sliderX - sliderWidth/2 + 10, sliderY - 35, 'handle')
            .setInteractive({ draggable: true })
            .setScale(1);
        this.betSliderContainer.add(this.betSliderHandle);

        // 設置拉桿的拖動邏輯
        const minX = sliderX - sliderWidth/2 + 10;
        const maxX = sliderX + sliderWidth/2 - 10;
        const minBet = parseInt(minValue);
        const maxBet = parseInt(maxValue);
        
        // 初始化拉桿位置
        this.betSliderHandle.x = minX;
        this.currentBetAmount = minValue;

        // 拖動事件
        this.scene.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number) => {
            if (gameObject === this.betSliderHandle) {
                // 限制拉桿在有效範圍內
                const x = Phaser.Math.Clamp(dragX, minX, maxX);
                gameObject.x = x;

                // 更新綠色進度條
                this.updateGreenBar(x, minX, maxX);
                
                // 計算當前下注金額
                const percentage = (x - minX) / (maxX - minX);
                const betAmount = Math.floor(minBet + percentage * (maxBet - minBet));
                this.currentBetAmount = betAmount.toString();
                
                // 更新金額顯示
                if (this.betAmountText) {
                    this.betAmountText.setText(`$${this.currentBetAmount}`);
                }
                
                // 更新按鈕顯示的金額
                this.updateBetButtonTexts();
            }
        });

        // 點擊金額文本時增加 minValue 的金額
        this.betAmountText.setInteractive().on('pointerdown', () => {
            // 獲取當前金額和最小增加值
            const currentAmount = parseInt(this.currentBetAmount);
            const minIncrease = parseInt(minValue);
            
            // 計算新金額，確保不超過最大值
            const newAmount = Math.min(currentAmount + minIncrease, maxBet);
            this.currentBetAmount = newAmount.toString();
            
            // 更新金額顯示
            this.betAmountText.setText(`$${this.currentBetAmount}`);
            
            // 更新拉桿位置
            const percentage = (newAmount - minBet) / (maxBet - minBet);
            this.betSliderHandle.x = minX + percentage * (maxX - minX);

            // 更新綠色進度條
            this.updateGreenBar(this.betSliderHandle.x, minX, maxX);
            
            // 更新按鈕顯示的金額
            this.updateBetButtonTexts();
            
            // 添加點擊視覺反饋
            this.scene.tweens.add({
                targets: this.betAmountText,
                scale: { from: 1.2, to: 1 },
                duration: 150,
                ease: 'Power2'
            });
        });
        
        // 點擊+時將金額加一個最小值
        maxText.on('pointerdown', () => {
            // 獲取當前金額和最小增加值
            const currentAmount = parseInt(this.currentBetAmount);
            const minIncrease = parseInt(minValue);
            
            // 計算新金額，確保不超過最大值
            const newAmount = Math.min(currentAmount + minIncrease, maxBet);
            this.currentBetAmount = newAmount.toString();
            
            // 更新金額顯示
            this.betAmountText.setText(`$${this.currentBetAmount}`);
            
            // 更新拉桿位置
            const percentage = (newAmount - minBet) / (maxBet - minBet);
            this.betSliderHandle.x = minX + percentage * (maxX - minX);
            
            // 更新綠色進度條
            this.updateGreenBar(this.betSliderHandle.x, minX, maxX);

            // 更新按鈕顯示的金額
            this.updateBetButtonTexts();
            
            // 添加點擊反饋效果
            this.scene.tweens.add({
                targets: maxText,
                scale: { from: 0.6, to: 0.5 },
                duration: 100
            });
        });
        
        // 點擊最小值文字時將金額設為最小值
        minText.on('pointerdown', () => {
            // 獲取當前金額和最小減少值
            const currentAmount = parseInt(this.currentBetAmount);
            const minDecrease = parseInt(minValue);
            
            // 計算新金額，確保不低於最小值
            const newAmount = Math.max(currentAmount - minDecrease, minBet);
            this.currentBetAmount = newAmount.toString();
            
            // 更新金額顯示
            this.betAmountText.setText(`$${this.currentBetAmount}`);
            
            // 更新拉桿位置
            const percentage = (newAmount - minBet) / (maxBet - minBet);
            this.betSliderHandle.x = minX + percentage * (maxX - minX);
            
            // 更新綠色進度條
            this.updateGreenBar(this.betSliderHandle.x, minX, maxX);
            
            // 更新按鈕顯示的金額
            this.updateBetButtonTexts();
            
            // 添加點擊反饋效果
            this.scene.tweens.add({
                targets: minText,
                scale: { from: 0.6, to: 0.5 },
                duration: 100
            });
        });

        return this.betSliderContainer;
    }

    // 新增方法：更新綠色進度條
    private updateGreenBar(handleX: number, minX: number, maxX: number) {
        if (this.sliderBgGreen) {
            // 計算綠色進度條的寬度 (從最左側到手柄位置)
            const greenWidth = handleX - minX + 10; // +10 讓進度條剛好到手柄中心
            
            // 更新綠色進度條的寬度
            this.sliderBgGreen.width = greenWidth;
        }
    }

    // 更新下注按鈕上顯示的金額
    updateBetButtonTexts() {
        this.actionButtons.forEach(button => {
            const action = button.getData('action');
            if (action === '下注' || action === '加注') {
                const textObject = button.getData('textObject');
                if (textObject) {
                    textObject.setText(`${action} $${this.currentBetAmount}`);
                }
            }
        });
    }

    // 獲取當前下注金額
    getCurrentBetAmount(): string {
        return this.currentBetAmount;
    }

    // 設置當前下注金額
    setCurrentBetAmount(amount: string) {
        this.currentBetAmount = amount;
        if (this.betAmountText) {
            this.betAmountText.setText(`$${amount}`);
        }
        this.updateBetButtonTexts();
    }

    // 顯示拉桿
    show() {
        if (this.betSliderContainer) {
            this.betSliderContainer.setVisible(true);
        }
    }

    // 隱藏拉桿
    hide() {
        if (this.betSliderContainer) {
            this.betSliderContainer.setVisible(false);
        }
    }

    // 銷毀拉桿
    destroy() {
        if (this.betSliderContainer) {
            this.betSliderContainer.destroy();
        }
    }
}