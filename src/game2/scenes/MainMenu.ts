import { GameObjects, Scene, Input } from 'phaser';
import { applyAllSkills } from './utils/skill';

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
    startGameButton: GameObjects.Rectangle; // 開始遊戲按鈕
    startGameText: GameObjects.Text; // 開始遊戲文字
    skillTipText: GameObjects.Text; // 技能提示文字
    resetButton: GameObjects.Rectangle; // 重置按鈕
    resetText: GameObjects.Text; // 重置文字

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
                
                // 確保所有角色都有技能相關屬性
                this.initCharactersSkillData();
            } catch (error) {
                console.error('解析本機角色資料失敗，創建新資料', error);
                this.createDefaultCharacterData();
            }
        } else {
            console.log('本機沒有角色資料，創建新資料');
            this.createDefaultCharacterData();
        }
    }

    // 初始化所有角色的技能相關數據
    initCharactersSkillData() {
        this.characterData.forEach(character => {
            // 確保有技能點數屬性
            if (character.skillPoints === undefined) {
                character.skillPoints = 0;
            }
            
            // 確保所有技能屬性都存在
            const skillKeys = ['splitShot', 'piercingShot', 'explosion', 'harmBoost', 'speedBoost'];
            skillKeys.forEach(skillKey => {
                if (character[skillKey] === undefined) {
                    character[skillKey] = 0;
                }
            });
            
            // 應用所有已學習的技能效果
            applyAllSkills(character);
        });
        
        // 保存更新後的數據
        this.saveCharacterData();
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
            // 確保所有技能數據都被保存
            this.characterData.forEach(character => {
                // 確保所有技能屬性都存在
                const skillKeys = ['splitShot', 'piercingShot', 'explosion', 'harmBoost', 'speedBoost', 'skillPoints', 'lv', 'exp', 'maxExp'];
                skillKeys.forEach(skillKey => {
                    if (character[skillKey] === undefined) {
                        character[skillKey] = 0;
                    }
                });
            });
            
            localStorage.setItem('characterData', JSON.stringify(this.characterData));
            console.log('角色資料已儲存到本機', this.characterData);
        } catch (error) {
            console.error('儲存角色資料到本機失敗', error);
        }
    }

    create ()
    {
        // 使用讀取或創建的角色資料來渲染選角畫面
        this.renderCharacterSelection();
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
        
        // 獲取技能加成
        const harmBoost = currentCharacter.harmBoost || 0;
        const speedBoost = currentCharacter.speedBoost || 0;
        
        // 添加角色屬性文字
        this.statsText = this.add.text(
            width / 2, 
            height / 2 + 410, 
            `攻擊: ${currentCharacter.harm}${harmBoost > 0 ? `+${harmBoost}` : ''}   ` +
            `速度: ${currentCharacter.speed}${speedBoost > 0 ? `+${speedBoost}` : ''}`, 
            { fontSize: '32px', color: '#ffffff' }
        ).setOrigin(0.5);
        
        // 如果有技能點數，添加提示文字
        if (currentCharacter.skillPoints > 0) {
            this.skillTipText = this.add.text(
                width / 2, 
                height / 2 + 470, 
                '進入遊戲後可以使用技能點數提升能力', 
                { fontSize: '24px', color: '#ffff00', fontStyle: 'bold' }
            ).setOrigin(0.5);
        }

        // 添加開始遊戲按鈕
        this.startGameButton = this.add.rectangle(
            width / 2 - 120,
            height / 2 + 100,
            200,
            60,
            0xFF5722,
            1
        ).setOrigin(0.5).setInteractive();
        
        this.startGameText = this.add.text(
            width / 2 - 120,
            height / 2 + 100,
            '開始遊戲',
            { fontSize: '36px', color: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // 添加開始遊戲按鈕點擊事件
        this.startGameButton.on('pointerdown', () => {
            this.startGame();
        });
        
        // 添加重置角色按鈕
        this.resetButton = this.add.rectangle(
            width / 2 + 120,
            height / 2 + 100,
            200,
            60,
            0x3F51B5,
            1
        ).setOrigin(0.5).setInteractive();
        
        this.resetText = this.add.text(
            width / 2 + 120,
            height / 2 + 100,
            '重置角色',
            { fontSize: '36px', color: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // 添加重置角色按鈕點擊事件
        this.resetButton.on('pointerdown', () => {
            this.resetCharacter();
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

    // 重置當前選中的角色
    resetCharacter() {
        // 獲取當前選中的角色
        const currentCharacter = this.characterData[this.currentIndex];
        
        // 確認對話框
        const { width, height } = this.scale;
        
        // 創建確認對話框背景
        const confirmBg = this.add.rectangle(
            width / 2,
            height / 2,
            width * 0.8,
            height * 0.3,
            0x000000,
            0.9
        ).setOrigin(0.5).setInteractive();
        
        // 創建確認文字
        const confirmText = this.add.text(
            width / 2,
            height / 2 - 50,
            `確定要重置 ${currentCharacter.name} 的等級和技能點數嗎？`,
            { fontSize: '24px', color: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // 創建確認按鈕
        const yesButton = this.add.rectangle(
            width / 2 - 100,
            height / 2 + 30,
            150,
            50,
            0x4CAF50,
            1
        ).setOrigin(0.5).setInteractive();
        
        const yesText = this.add.text(
            width / 2 - 100,
            height / 2 + 30,
            '確定',
            { fontSize: '24px', color: '#ffffff' }
        ).setOrigin(0.5);
        
        // 創建取消按鈕
        const noButton = this.add.rectangle(
            width / 2 + 100,
            height / 2 + 30,
            150,
            50,
            0xF44336,
            1
        ).setOrigin(0.5).setInteractive();
        
        const noText = this.add.text(
            width / 2 + 100,
            height / 2 + 30,
            '取消',
            { fontSize: '24px', color: '#ffffff' }
        ).setOrigin(0.5);
        
        // 設置按鈕事件
        yesButton.on('pointerdown', () => {
            // 重置角色數據
            this.characterData[this.currentIndex] = {
                name: currentCharacter.name,
                harm: 1,
                speed: 1,
                lv: 1,
                exp: 0,
                maxExp: 10,
                skillPoints: 0,
                // 明確重置所有技能等級
                splitShot: 0,
                piercingShot: 0,
                explosion: 0,
                harmBoost: 0,
                speedBoost: 0
            };
            
            // 應用技能效果
            applyAllSkills(this.characterData[this.currentIndex]);
            
            // 保存數據
            this.saveCharacterData();
            
            // 更新顯示
            this.updateCharacterDisplay();
            
            // 移除確認對話框
            confirmBg.destroy();
            confirmText.destroy();
            yesButton.destroy();
            yesText.destroy();
            noButton.destroy();
            noText.destroy();
            
            // 顯示重置成功提示
            const successText = this.add.text(
                width / 2,
                height / 2,
                '角色已重置',
                { fontSize: '32px', color: '#4CAF50', fontStyle: 'bold' }
            ).setOrigin(0.5);
            
            // 淡出效果
            this.tweens.add({
                targets: successText,
                alpha: 0,
                y: height / 2 - 50,
                duration: 1500,
                onComplete: () => {
                    successText.destroy();
                }
            });
        });
        
        noButton.on('pointerdown', () => {
            // 移除確認對話框
            confirmBg.destroy();
            confirmText.destroy();
            yesButton.destroy();
            yesText.destroy();
            noButton.destroy();
            noText.destroy();
        });
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
        
        // 獲取技能加成
        const harmBoost = currentCharacter.harmBoost || 0;
        const speedBoost = currentCharacter.speedBoost || 0;
        
        // 更新文字資訊
        this.nameText.setText(currentCharacter.name);
        this.levelText.setText(`等級: ${currentCharacter.lv}`);
        this.expText.setText(`經驗: ${currentCharacter.exp}/${currentCharacter.maxExp}`);
        this.skillPointsText.setText(`技能點數: ${currentCharacter.skillPoints}`);
        this.statsText.setText(
            `攻擊: ${currentCharacter.harm}${harmBoost > 0 ? `+${harmBoost}` : ''}   ` +
            `速度: ${currentCharacter.speed}${speedBoost > 0 ? `+${speedBoost}` : ''}`
        );
        
        // 更新技能提示文字
        if (this.skillTipText) {
            this.skillTipText.destroy();
        }
        
        if (currentCharacter.skillPoints > 0) {
            const { width, height } = this.scale;
            this.skillTipText = this.add.text(
                width / 2, 
                height / 2 + 470, 
                '進入遊戲後可以使用技能點數提升能力', 
                { fontSize: '24px', color: '#ffff00', fontStyle: 'bold' }
            ).setOrigin(0.5);
        }
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