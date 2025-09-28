import { GameObjects, Scene, Input } from 'phaser';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    player: GameObjects.Image;
    playerList: GameObjects.Image[] = [];
    characterData: any[] = [];
    currentIndex: number = 0;
    lightBalls: GameObjects.Group;
    shootTimer: Phaser.Time.TimerEvent;
    isShooting: boolean = false;
    
    // UI元素
    nameText: GameObjects.Text;
    levelText: GameObjects.Text;
    expText: GameObjects.Text;
    skillPointsText: GameObjects.Text;
    statsText: GameObjects.Text;
    leftButton: GameObjects.Image | GameObjects.Triangle;
    rightButton: GameObjects.Image | GameObjects.Triangle;
    upgradeHarmButton: GameObjects.Rectangle;
    upgradeSpeedButton: GameObjects.Rectangle;
    upgradeHarmText: GameObjects.Text;
    upgradeSpeedText: GameObjects.Text;
    startGameButton: GameObjects.Rectangle; // 新增開始遊戲按鈕
    startGameText: GameObjects.Text; // 新增開始遊戲文字

    test:GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    init() 
    {
        // 取得當前螢幕大小
        const { width, height } = this.scale;

        // 添加背景圖片
        this.background = this.add.image(width / 2, height / 2, 'background')
            .setDisplaySize(width, height); 
            
        // 從本機讀取角色資料
        this.loadCharacterData();
    }

    // 從本機讀取角色資料，如果沒有則創建新的
    loadCharacterData() {
        const savedData = localStorage.getItem('characterData');
        
        if (savedData) {
            try {
                this.characterData = JSON.parse(savedData);
                console.log('從本機讀取角色資料成功');
            } catch (error) {
                console.error('解析本機角色資料失敗，創建新資料', error);
                this.createDefaultCharacterData();
            }
        } else {
            console.log('本機沒有角色資料，創建新資料');
            this.createDefaultCharacterData();
        }
    }

    // 創建默認角色資料
    createDefaultCharacterData() {
        this.characterData = [
            {
                'name': '魔法師',
                'harm': 1,
                'speed': 1,
                'lv': 1,
                'exp': 0,
                'maxExp': 10, // 初始等級*10
                'skillPoints': 0
            },
            {
                'name': '刺客',
                'harm': 1,
                'speed': 1,
                'lv': 1,
                'exp': 0,
                'maxExp': 10,
                'skillPoints': 0
            },
            {
                'name': '弓箭手',
                'harm': 1,
                'speed': 1,
                'lv': 1,
                'exp': 0,
                'maxExp': 10,
                'skillPoints': 0
            },
            {
                'name': '祭司',
                'harm': 1,
                'speed': 1,
                'lv': 1,
                'exp': 0,
                'maxExp': 10,
                'skillPoints': 0
            },
            {
                'name': '騎士',
                'harm': 1,
                'speed': 1,
                'lv': 1,
                'exp': 0,
                'maxExp': 10,
                'skillPoints': 0
            }
        ];
        
        // 將新創建的資料儲存到本機
        this.saveCharacterData();
    }

    // 儲存角色資料到本機
    saveCharacterData() {
        try {
            localStorage.setItem('characterData', JSON.stringify(this.characterData));
            console.log('角色資料已儲存到本機');
        } catch (error) {
            console.error('儲存角色資料到本機失敗', error);
        }
    }

    create ()
    {
        // 使用讀取或創建的角色資料來渲染選角畫面
        this.renderCharacterSelection();

        // this.test = this.add.text(200,200,'升級按鈕')
        // this.test.setInteractive()
        // this.test.on('pointerdown', () => {
        //     this.addExperience(1);
        // });
    }
    
    // 渲染選角畫面
    renderCharacterSelection() {
        const { width, height } = this.scale;
        
        // 清空之前的角色圖像
        this.playerList.forEach(player => player.destroy());
        this.playerList = [];
        
        // 創建角色圖像 - 只顯示當前選中的角色
        const currentCharacter = this.characterData[this.currentIndex];
        this.player = this.add.image(width / 2, height / 2 - 100, currentCharacter.name)
            .setScale(1.2)
            .setInteractive();
            
        this.playerList.push(this.player);
        
        // 添加角色資訊面板背景
        const infoPanelBg = this.add.rectangle(
            width / 2, 
            height /2 + 270, 
            width * 0.9, 
            350, 
            0x000000, 
            0.7
        ).setOrigin(0.5);
        
        // 添加角色名稱文字
        this.nameText = this.add.text(
            width / 2, 
            height/ 2 + 170, 
            currentCharacter.name, 
            { fontSize: '48px', color: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // 添加等級文字
        this.levelText = this.add.text(
            width / 2, 
            height / 2 + 230, 
            `等級: ${currentCharacter.lv}`, 
            { fontSize: '36px', color: '#ffcc00' }
        ).setOrigin(0.5);
        
        // 添加經驗值文字
        this.expText = this.add.text(
            width / 2, 
            height / 2 + 290, 
            `經驗: ${currentCharacter.exp}/${currentCharacter.maxExp}`, 
            { fontSize: '32px', color: '#ffffff' }
        ).setOrigin(0.5);
        
        // 添加技能點數文字
        this.skillPointsText = this.add.text(
            width / 2, 
            height / 2 + 350, 
            `技能點數: ${currentCharacter.skillPoints}`, 
            { fontSize: '32px', color: '#00ff00' }
        ).setOrigin(0.5);
        
        // 添加角色屬性文字
        this.statsText = this.add.text(
            width / 2, 
            height / 2 + 410, 
            `攻擊: ${currentCharacter.harm}   速度: ${currentCharacter.speed}`, 
            { fontSize: '32px', color: '#ffffff' }
        ).setOrigin(0.5);
        
        // 添加升級按鈕 - 如果有技能點數
        if (currentCharacter.skillPoints > 0) {
            // 升級攻擊按鈕
            this.upgradeHarmButton = this.add.rectangle(
                width / 2 - 80, 
                height / 2 + 470, 
                120, 
                30, 
                0x4CAF50, 
                1
            ).setOrigin(0.5).setInteractive();
            
            this.upgradeHarmText = this.add.text(
                width / 2 - 80, 
                height / 2 + 470, 
                '提升攻擊', 
                { fontSize: '28px', color: '#ffffff' }
            ).setOrigin(0.5);
            
            // 升級速度按鈕
            this.upgradeSpeedButton = this.add.rectangle(
                width / 2 + 80, 
                height / 2 + 470, 
                120, 
                30, 
                0x2196F3, 
                1
            ).setOrigin(0.5).setInteractive();
            
            this.upgradeSpeedText = this.add.text(
                width / 2 + 80, 
                height / 2 + 470, 
                '提升速度', 
                { fontSize: '28px', color: '#ffffff' }
            ).setOrigin(0.5);
            
            // 添加按鈕點擊事件
            this.upgradeHarmButton.on('pointerdown', () => {
                this.upgradeCharacterStat('harm');
            });
            
            this.upgradeSpeedButton.on('pointerdown', () => {
                this.upgradeCharacterStat('speed');
            });
        }

        //添加開始遊戲按鈕
        this.startGameButton = this.add.rectangle(
            width / 2,
            height - 50,
            200,
            60,
            0xFF5722,
            1
        ).setOrigin(0.5).setInteractive();
        
        this.startGameText = this.add.text(
            width / 2,
            height - 50,
            '開始遊戲',
            { fontSize: '36px', color: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // 添加開始遊戲按鈕點擊事件
        this.startGameButton.on('pointerdown', () => {
            this.startGame();
        });
        
        // 添加左右切換按鈕
        // 左箭頭
        this.leftButton = this.add.triangle(
            width * 0.1, 
            height / 2, 
            0, 15, 
            30, 0, 
            30, 30, 
            0xffffff
        ).setInteractive();
        
        this.leftButton.on('pointerdown', () => {
            this.prevCharacter();
        });
        
        // 右箭頭
        this.rightButton = this.add.triangle(
            width * 0.9, 
            height / 2, 
            0, 0, 
            0, 30, 
            30, 15, 
            0xffffff
        ).setInteractive();
        
        this.rightButton.on('pointerdown', () => {
            this.nextCharacter();
        });
        
        // 添加滑動切換功能
        this.input.on('pointerdown', this.startSwipe, this);
        this.input.on('pointerup', this.endSwipe, this);
        this.input.on('pointermove', this.moveSwipe, this);
    }

    // 開始遊戲
    startGame() {
        // 獲取當前選中的角色資料
        const selectedCharacter = this.characterData[this.currentIndex];
        
        // 儲存最後選擇的角色索引
        localStorage.setItem('lastSelectedCharacterIndex', this.currentIndex.toString());
        
        // 將角色資料傳遞到 GameStart 場景
        this.scene.start('GameStart', { 
            character: selectedCharacter 
        });
        
        console.log(`開始遊戲，選擇角色: ${selectedCharacter.name}`);
    }
    
    // 切換到上一個角色
    prevCharacter() {
        this.currentIndex = (this.currentIndex - 1 + this.characterData.length) % this.characterData.length;
        this.updateCharacterDisplay();
    }
    
    // 切換到下一個角色
    nextCharacter() {
        this.currentIndex = (this.currentIndex + 1) % this.characterData.length;
        this.updateCharacterDisplay();
    }
    
    // 更新角色顯示
    updateCharacterDisplay() {
        const currentCharacter = this.characterData[this.currentIndex];
        
        // 更新角色圖像
        this.player.setTexture(currentCharacter.name);
        
        // 更新文字資訊
        this.nameText.setText(currentCharacter.name);
        this.levelText.setText(`等級: ${currentCharacter.lv}`);
        this.expText.setText(`經驗: ${currentCharacter.exp}/${currentCharacter.maxExp}`);
        this.skillPointsText.setText(`技能點數: ${currentCharacter.skillPoints}`);
        this.statsText.setText(`攻擊: ${currentCharacter.harm}   速度: ${currentCharacter.speed}`);
        
        // 更新升級按鈕
        this.updateUpgradeButtons();
    }
    
    // 更新升級按鈕
    updateUpgradeButtons() {
        const currentCharacter = this.characterData[this.currentIndex];
        
        // 移除舊的按鈕
        if (this.upgradeHarmButton) {
            this.upgradeHarmButton.destroy();
            this.upgradeHarmText.destroy();
        }
        
        if (this.upgradeSpeedButton) {
            this.upgradeSpeedButton.destroy();
            this.upgradeSpeedText.destroy();
        }
        
        // 如果有技能點數，添加新的按鈕
        if (currentCharacter.skillPoints > 0) {
            const { width, height } = this.scale;
            
            // 升級攻擊按鈕
            this.upgradeHarmButton = this.add.rectangle(
                width / 2 - 80, 
                height / 2 + 470, 
                120, 
                30, 
                0x4CAF50, 
                1
            ).setOrigin(0.5).setInteractive();
            
            this.upgradeHarmText = this.add.text(
                width / 2 - 80, 
                height / 2 + 470, 
                '提升攻擊', 
                { fontSize: '14px', color: '#ffffff' }
            ).setOrigin(0.5);
            
            // 升級速度按鈕
            this.upgradeSpeedButton = this.add.rectangle(
                width / 2 + 80, 
                height / 2 + 470, 
                120, 
                30, 
                0x2196F3, 
                1
            ).setOrigin(0.5).setInteractive();
            
            this.upgradeSpeedText = this.add.text(
                width / 2 + 80, 
                height / 2 + 470, 
                '提升速度', 
                { fontSize: '14px', color: '#ffffff' }
            ).setOrigin(0.5);
            
            // 添加按鈕點擊事件
            this.upgradeHarmButton.on('pointerdown', () => {
                this.upgradeCharacterStat('harm');
            });
            
            this.upgradeSpeedButton.on('pointerdown', () => {
                this.upgradeCharacterStat('speed');
            });
        }
    }
    
    // 升級角色屬性
    upgradeCharacterStat(stat: 'harm' | 'speed') {
        const currentCharacter = this.characterData[this.currentIndex];
        
        if (currentCharacter.skillPoints > 0) {
            // 提升指定屬性
            currentCharacter[stat] += 1;
            currentCharacter.skillPoints -= 1;
            
            // 更新顯示
            this.statsText.setText(`攻擊: ${currentCharacter.harm}   速度: ${currentCharacter.speed}`);
            this.skillPointsText.setText(`技能點數: ${currentCharacter.skillPoints}`);
            
            // 更新升級按鈕
            this.updateUpgradeButtons();
            
            // 儲存更新後的角色資料
            this.saveCharacterData();
        }
    }
    
    // 添加經驗值 (這個方法可以在遊戲中調用)
    addExperience(exp: number) {
        const currentCharacter = this.characterData[this.currentIndex];
        currentCharacter.exp += exp;
        
        // 檢查是否升級
        while (currentCharacter.exp >= currentCharacter.maxExp) {
            // 升級
            currentCharacter.exp -= currentCharacter.maxExp;
            currentCharacter.lv += 1;
            currentCharacter.skillPoints += 1;
            currentCharacter.maxExp = currentCharacter.lv * 10; // 更新下一級所需經驗
        }
        
        // 更新顯示
        this.levelText.setText(`等級: ${currentCharacter.lv}`);
        this.expText.setText(`經驗: ${currentCharacter.exp}/${currentCharacter.maxExp}`);
        this.skillPointsText.setText(`技能點數: ${currentCharacter.skillPoints}`);
        
        // 更新升級按鈕
        this.updateUpgradeButtons();
        
        // 儲存更新後的角色資料
        this.saveCharacterData();
    }
    
    // 滑動相關變數
    swipeStartX: number = 0;
    swipeStartTime: number = 0;
    isSwipping: boolean = false;
    
    // 開始滑動
    startSwipe(pointer: Input.Pointer) {
        this.swipeStartX = pointer.x;
        this.swipeStartTime = Date.now();
        this.isSwipping = true;
    }
    
    // 移動滑動
    moveSwipe(pointer: Input.Pointer) {
        if (!this.isSwipping) return;
    }
    
    // 結束滑動
    endSwipe(pointer: Input.Pointer) {
        if (!this.isSwipping) return;
        
        const swipeTime = Date.now() - this.swipeStartTime;
        const swipeDistance = pointer.x - this.swipeStartX;
        
        // 如果滑動時間小於500毫秒且滑動距離大於50像素
        if (swipeTime < 500 && Math.abs(swipeDistance) > 50) {
            if (swipeDistance > 0) {
                // 向右滑動，顯示上一個角色
                this.prevCharacter();
            } else {
                // 向左滑動，顯示下一個角色
                this.nextCharacter();
            }
        }
        
        this.isSwipping = false;
    }
    
    update() {
        // 可以在這裡添加更多遊戲邏輯
    }
}