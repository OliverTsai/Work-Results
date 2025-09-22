import { GameObjects, Scene } from 'phaser';

export class Chips {
    private scene: Phaser.Scene | null;
    public container: GameObjects.Container | null = null;
    private chipImages: GameObjects.Image | null = null;
    private amountText: GameObjects.Text | null = null;

    constructor(scene: Scene) {
        this.scene = scene;
        this.container = scene.add.container(0, 0);
    }

    //清空所有籌碼元素
    public clear() {
        if (this.container && this.container.destroy) {
            this.container.destroy();
        }else{
            if(this.chipImages && this.chipImages.destroy){
                this.chipImages.destroy();
            }
            if(this.amountText && this.amountText.destroy){
                this.amountText.destroy();
            }
        }
    }

    //創建籌碼元素
    public createChips(scene: Phaser.Scene,amount: String) {
        try{

            this.container = scene.add.container(0, 0).setDepth(5);

            // 將 Chips 實例保存到容器數據中
            this.container.setData('chipObj', this);

            // 創建一個透明的佔位元素，防止空容器報錯
            const placeholder = scene.add.rectangle(0, 0, 1, 1, 0x000000, 0);
            placeholder.setAlpha(0); // 設置為完全透明
            this.container.add(placeholder);

            if(amount === '0'){
                // 當金額為0時，隱藏容器
                this.container.setVisible(false);
            } else {
                const amountNumber = Number(amount)
                // 創建籌碼圖像
                this.chipImages = scene.add.image(-20, 0, this.getChipTexture(amountNumber));
                this.chipImages.setOrigin(0.5, 0.5).setScale(0.5).setDepth(15);
                this.container.add(this.chipImages);

                // 創建金額文本，放在籌碼下方
                this.amountText = scene.add.text(20, 0, String(amount), {
                    fontFamily: 'Arial',
                    fontSize: '28px',
                    color: '#ffcc00',
                    stroke: '#000000',
                    strokeThickness: 1,
                    align: 'center'
                }).setOrigin(0, 0.5).setScale(1).setDepth(15);

                this.container.add(this.amountText);
                
                // 確保容器是可見的
                this.container.setVisible(true);
            }

            return this.container;

        }catch(error){
            console.error('創建籌碼元素時出錯:', error);
            return null;
        }
    }

    //更新籌碼元素
    public updateChips(scene: Phaser.Scene,amount: String) {
        try{
            if(!this.container){
                return this.createChips(scene,amount);
            }

            if(amount === '0'){
                // 當金額為0時，隱藏容器
                this.container.setVisible(false);
            } else {
                const amountNumber = Number(amount)

                // 如果之前是隱藏的，現在需要顯示
                this.container.setVisible(true);

                // 如果之前是0，可能沒有創建圖像和文本，需要創建
                if(!this.chipImages) {
                    this.chipImages = scene.add.image(-20, 0, this.getChipTexture(amountNumber));
                    this.chipImages.setOrigin(0.5, 0.5).setScale(0.5).setDepth(15);
                    this.container.add(this.chipImages);
                } else {
                    this.chipImages.setTexture(this.getChipTexture(amountNumber));
                }

                if(!this.amountText) {
                    this.amountText = scene.add.text(20, 0, String(amount), {
                        fontFamily: 'Arial',
                        fontSize: '28px',
                        color: '#ffcc00',
                        stroke: '#000000',
                        strokeThickness: 1,
                        align: 'center'
                    }).setOrigin(0, 0.5).setScale(1).setDepth(15);
                    this.container.add(this.amountText);
                } else {
                    this.amountText.setText(String(amount));
                }
            }

            return this.container;

        }catch(error){
            console.error('更新籌碼元素時出錯:', error);
            return null;
        }
    }

    // 獲取容器，用於外部訪問
    public getContainer(): GameObjects.Container | null {
        return this.container;
    }

    //根據籌碼金額選擇不同的圖片
    private getChipTexture(amount: number): string {
        if (amount >= 1000) {
            return 'chip1000';
        } else if (amount >= 100) {
            return 'chip100';
        } else {
            return 'chip';
        }
    }
}