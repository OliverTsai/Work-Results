import { GameObjects, Scene, Input } from 'phaser';
import { getAvailableSkills, upgradeSkill, applyAllSkills, Skill } from './utils/skill';

export class GameStart extends Scene
{
    background: GameObjects.Image;
    player: GameObjects.Image;
    lightBalls: GameObjects.Group;
    shootTimer: Phaser.Time.TimerEvent;
    isShooting: boolean = false;
    
    // 角色資料
    characterData: any;
    
    // UI元素
    nameText: GameObjects.Text;
    levelText: GameObjects.Text;
    statsText: GameObjects.Text;
    expText: GameObjects.Text;
    shootInterval: number = 200; // 射擊間隔，會根據速度調整
    
    // 經驗值條
    expBar: GameObjects.Graphics;

    // 怪物相關
    monsters: GameObjects.Group;
    monsterSpawnTimer: Phaser.Time.TimerEvent;
    gameOver: boolean = false;
    
    // 技能選擇界面
    skillSelectionUI: GameObjects.Container;
    isSkillSelectionOpen: boolean = false;

    constructor ()
    {
        super('GameStart');
    }

    init(data: any) 
    {
        // 重置遊戲狀態
        this.gameOver = false;
        this.isSkillSelectionOpen = false;
        
        // 接收從MainMenu傳過來的角色資料
        if (data && data.character) {
            this.characterData = data.character;
            
            
            // 初始化技能相關屬性
            this.initCharacterSkills();
            
            // 根據角色速度調整射擊間隔
            this.updateShootInterval();

            console.log('接收到角色資料:', this.characterData);
        } else {
            // 如果沒有傳入資料，嘗試從localStorage讀取最後選擇的角色
            try {
                const lastIndex = localStorage.getItem('lastSelectedCharacterIndex');
                const savedData = localStorage.getItem('characterData');

                console.log('從localStorage讀取角色資料:', lastIndex, savedData);
                
                if (lastIndex && savedData) {
                    const allCharacters = JSON.parse(savedData);
                    this.characterData = allCharacters[parseInt(lastIndex)];
                    console.log('從localStorage讀取角色資料:', this.characterData);
                    
                    // 初始化技能相關屬性
                    this.initCharacterSkills();
                    
                    // 根據角色速度調整射擊間隔
                    this.updateShootInterval();
                } else {
                    console.error('沒有角色資料可用');
                    // 使用默認值
                    this.characterData = {
                        name: '魔法師',
                        harm: 1,
                        speed: 1,
                        lv: 1,
                        exp: 0,
                        maxExp: 10,
                        skillPoints: 0
                    };
                    this.shootInterval = 200;
                }
            } catch (error) {
                console.error('讀取角色資料失敗', error);
                // 使用默認值
                this.characterData = {
                    name: '魔法師',
                    harm: 1,
                    speed: 1,
                    lv: 1,
                    exp: 0,
                    maxExp: 10,
                    skillPoints: 0
                };
                this.shootInterval = 200;
            }
        }
        
        // 取得當前螢幕大小
        const { width, height } = this.scale;

        // 添加背景圖片
        this.background = this.add.image(width / 2, height / 2, 'background')
            .setDisplaySize(width, height); 
    }
    
    // 初始化角色技能相關屬性
    initCharacterSkills() {
        // 確保有技能點數屬性
        if (this.characterData.skillPoints === undefined) {
            this.characterData.skillPoints = 0;
        }
        
        // 確保所有技能屬性都存在
        const skillKeys = ['splitShot', 'piercingShot', 'explosion', 'harmBoost', 'speedBoost'];
        skillKeys.forEach(skillKey => {
            if (this.characterData[skillKey] === undefined) {
                this.characterData[skillKey] = 0;
            }
        });
        
        // 應用所有已學習的技能效果
        applyAllSkills(this.characterData);
    }
    
    // 更新射擊間隔
    updateShootInterval() {
        // 基礎速度 + 速度強化技能加成
        const speedBoost = this.characterData.speedBoost || 0;
        const totalSpeed = this.characterData.speed + speedBoost;
        this.shootInterval = Math.max(50, 200 - (totalSpeed * 15));
        
        // 如果正在射擊，更新射擊定時器
        if (this.isShooting && this.shootTimer) {
            this.shootTimer.remove();
            this.shootTimer = this.time.addEvent({
                delay: this.shootInterval,
                callback: this.shootLightBall,
                callbackScope: this,
                loop: true
            });
        }
    }

    create ()
    {
        const { width, height } = this.scale;
        
        // 創建玩家，使用選擇的角色圖像
        this.player = this.add.image(width / 2, height - 200, this.characterData.name)
            .setInteractive();
        
        // 創建光球群組
        this.lightBalls = this.add.group();
        
        // 創建怪物群組
        this.monsters = this.add.group();
        
        // 添加角色資訊UI
        this.createCharacterUI();
        
        // 設置觸控移動事件
        this.input.on('pointermove', (pointer: Input.Pointer) => {
            if (pointer.isDown && !this.gameOver && !this.isSkillSelectionOpen) {
                // 更新玩家的X座標為觸控點的X座標
                this.player.x = pointer.x;
            }
        });
        
        // 設置按下事件 - 開始射擊
        this.input.on('pointerdown', () => {
            if (this.gameOver || this.isSkillSelectionOpen) return;
            
            this.isShooting = true;
            // 設置定時器，根據角色速度決定射擊間隔
            this.shootTimer = this.time.addEvent({
                delay: this.shootInterval,
                callback: this.shootLightBall,
                callbackScope: this,
                loop: true
            });
        });
        
        // 設置放開事件 - 停止射擊
        this.input.on('pointerup', () => {
            this.isShooting = false;
            if (this.shootTimer) {
                this.shootTimer.remove();
            }
        });
        
        // 添加返回主選單按鈕
        const backButton = this.add.rectangle(
            80, 
            40, 
            120, 
            50, 
            0x000000, 
            0.7
        ).setOrigin(0.5).setInteractive();
        
        const backText = this.add.text(
            80, 
            40, 
            '返回', 
            { fontSize: '24px', color: '#ffffff' }
        ).setOrigin(0.5);
        
        backButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
        
        // 添加技能按鈕
        this.createSkillButton();
        
        // 設置怪物生成定時器 (每5秒生成一個怪物)
        this.monsterSpawnTimer = this.time.addEvent({
            delay: 5000,
            callback: this.spawnMonster,
            callbackScope: this,
            loop: true
        });
        
        // 先生成一個怪物，不用等待
        this.spawnMonster();
        
        // 創建技能選擇界面 (初始隱藏)
        this.createSkillSelectionUI();
    }
    
    // 創建技能按鈕
    createSkillButton() {
        const { width } = this.scale;
        
        const skillButton = this.add.rectangle(
            width - 80, 
            40, 
            120, 
            50, 
            0x000000, 
            0.7
        ).setOrigin(0.5).setInteractive();
        
        const skillText = this.add.text(
            width - 80, 
            40, 
            '技能', 
            { fontSize: '24px', color: '#ffffff' }
        ).setOrigin(0.5);
        
        // 技能點數顯示
        const skillPointsText = this.add.text(
            width - 80, 
            65, 
            `點數: ${this.characterData.skillPoints || 0}`, 
            { fontSize: '16px', color: '#ffff00' }
        ).setOrigin(0.5);
        
        // 保存引用以便更新
        this.characterData.skillPointsText = skillPointsText;
        
        skillButton.on('pointerdown', () => {
            this.toggleSkillSelectionUI();
        });
    }
    
    // 創建技能選擇界面
    createSkillSelectionUI() {
        const { width, height } = this.scale;
        
        // 創建容器來存放所有UI元素
        this.skillSelectionUI = this.add.container(0, 0);
        this.skillSelectionUI.setVisible(false);
        
        // 半透明背景
        const bg = this.add.rectangle(
            width / 2, 
            height / 2, 
            width, 
            height, 
            0x000000, 
            0.8
        );
        this.skillSelectionUI.add(bg);
        
        // 標題
        const title = this.add.text(
            width / 2, 
            50, 
            '技能選擇', 
            { fontSize: '36px', color: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5);
        this.skillSelectionUI.add(title);
        
        // 技能點數顯示
        const pointsText = this.add.text(
            width / 2, 
            90, 
            `可用技能點數: ${this.characterData.skillPoints || 0}`, 
            { fontSize: '24px', color: '#ffff00' }
        ).setOrigin(0.5);
        this.skillSelectionUI.add(pointsText);
        
        // 保存引用以便更新
        this.characterData.skillUIPointsText = pointsText;
        
        // 獲取可用技能列表
        const skills = getAvailableSkills(this.characterData);
        
        // 顯示技能列表
        const startY = 150;
        const spacing = 80;
        
        skills.forEach((skill, index) => {
            const y = startY + index * spacing;
            
            // 技能背景
            const skillBg = this.add.rectangle(
                width / 2, 
                y, 
                width * 0.8, 
                70, 
                0x333333, 
                0.9
            ).setOrigin(0.5);
            this.skillSelectionUI.add(skillBg);
            
            // 技能名稱
            const nameText = this.add.text(
                width * 0.2, 
                y - 15, 
                `${skill.name} (等級 ${skill.level}/${skill.maxLevel})`, 
                { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }
            ).setOrigin(0, 0.5);
            this.skillSelectionUI.add(nameText);
            
            // 技能描述
            const descText = this.add.text(
                width * 0.2, 
                y + 15, 
                skill.getDescription(skill.level), 
                { fontSize: '16px', color: '#aaaaaa' }
            ).setOrigin(0, 0.5);
            this.skillSelectionUI.add(descText);
            
            // 升級按鈕
            const upgradeButton = this.add.rectangle(
                width * 0.8, 
                y, 
                100, 
                40, 
                skill.level < skill.maxLevel ? 0x006600 : 0x660000, 
                0.9
            ).setOrigin(0.5).setInteractive();
            this.skillSelectionUI.add(upgradeButton);
            
            // 按鈕文字
            const buttonText = this.add.text(
                width * 0.8, 
                y, 
                skill.level < skill.maxLevel ? '升級' : '已滿級', 
                { fontSize: '18px', color: '#ffffff' }
            ).setOrigin(0.5);
            this.skillSelectionUI.add(buttonText);
            
            // 設置按鈕事件
            upgradeButton.on('pointerdown', () => {
                if (this.characterData.skillPoints > 0 && skill.level < skill.maxLevel) {
                    // 升級技能
                    if (upgradeSkill(this.characterData, skill.id)) {
                        // 更新UI
                        this.updateSkillUI();
                        
                        // 更新射擊間隔
                        this.updateShootInterval();
                        
                        // 更新角色屬性顯示
                        this.updateCharacterStats();
                    }
                }
            });
        });
        
        // 關閉按鈕
        const closeButton = this.add.rectangle(
            width / 2, 
            height - 50, 
            200, 
            60, 
            0x660000, 
            0.9
        ).setOrigin(0.5).setInteractive();
        this.skillSelectionUI.add(closeButton);
        
        const closeText = this.add.text(
            width / 2, 
            height - 50, 
            '關閉', 
            { fontSize: '24px', color: '#ffffff' }
        ).setOrigin(0.5);
        this.skillSelectionUI.add(closeText);
        
        closeButton.on('pointerdown', () => {
            this.toggleSkillSelectionUI();
        });
    }
    
    // 切換技能選擇界面顯示/隱藏
    toggleSkillSelectionUI() {
        this.isSkillSelectionOpen = !this.isSkillSelectionOpen;
        this.skillSelectionUI.setVisible(this.isSkillSelectionOpen);
        
        // 如果打開技能界面，暫停遊戲
        if (this.isSkillSelectionOpen) {
            // 更新技能UI
            this.updateSkillUI();
            
            // 暫停怪物生成
            if (this.monsterSpawnTimer) {
                this.monsterSpawnTimer.paused = true;
            }
            
            // 暫停射擊
            if (this.shootTimer) {
                this.shootTimer.paused = true;
            }
        } else {
            // 恢復怪物生成
            if (this.monsterSpawnTimer) {
                this.monsterSpawnTimer.paused = false;
            }
            
            // 恢復射擊
            if (this.shootTimer && this.isShooting) {
                this.shootTimer.paused = false;
            }
        }
    }
    
    // 更新技能UI
    updateSkillUI() {
        // 更新技能點數顯示
        if (this.characterData.skillPointsText) {
            this.characterData.skillPointsText.setText(`點數: ${this.characterData.skillPoints || 0}`);
        }
        
        if (this.characterData.skillUIPointsText) {
            this.characterData.skillUIPointsText.setText(`可用技能點數: ${this.characterData.skillPoints || 0}`);
        }
        
        // 重新創建技能選擇界面
        if (this.skillSelectionUI) {
            this.skillSelectionUI.destroy();
        }
        this.createSkillSelectionUI();
        this.skillSelectionUI.setVisible(this.isSkillSelectionOpen);
    }
    
    // 更新角色屬性顯示
    updateCharacterStats() {
        // 獲取技能加成
        const harmBoost = this.characterData.harmBoost || 0;
        const speedBoost = this.characterData.speedBoost || 0;
        
        // 更新屬性顯示
        this.statsText.setText(
            `攻擊: ${this.characterData.harm}${harmBoost > 0 ? `+${harmBoost}` : ''}   ` +
            `速度: ${this.characterData.speed}${speedBoost > 0 ? `+${speedBoost}` : ''}`
        );
    }
    
    // 創建角色資訊UI
    createCharacterUI() {
        const { width } = this.scale;
        
        // 添加角色名稱
        this.nameText = this.add.text(
            width / 2, 
            20, 
            this.characterData.name, 
            { fontSize: '32px', color: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // 添加等級
        this.levelText = this.add.text(
            width / 2, 
            60, 
            `等級: ${this.characterData.lv}`, 
            { fontSize: '24px', color: '#ffcc00' }
        ).setOrigin(0.5);
        
        // 獲取技能加成
        const harmBoost = this.characterData.harmBoost || 0;
        const speedBoost = this.characterData.speedBoost || 0;
        
        // 添加屬性
        this.statsText = this.add.text(
            width / 2, 
            90, 
            `攻擊: ${this.characterData.harm}${harmBoost > 0 ? `+${harmBoost}` : ''}   ` +
            `速度: ${this.characterData.speed}${speedBoost > 0 ? `+${speedBoost}` : ''}`, 
            { fontSize: '20px', color: '#ffffff' }
        ).setOrigin(0.5);
        
        // 添加經驗值顯示
        this.expText = this.add.text(
            width / 2,
            120,
            `經驗值: ${this.characterData.exp}/${this.characterData.maxExp}`,
            { fontSize: '18px', color: '#00ffff' }
        ).setOrigin(0.5);
        
        // 創建經驗值條
        this.createExpBar();
    }
    
    // 創建經驗值條
    createExpBar() {
        const { width } = this.scale;
        const barWidth = 200;
        const barHeight = 10;
        const x = width / 2 - barWidth / 2;
        const y = 140;
        
        // 清除之前的經驗值條
        if (this.expBar) {
            this.expBar.clear();
        } else {
            this.expBar = this.add.graphics();
        }
        
        // 繪製背景
        this.expBar.fillStyle(0x444444, 1);
        this.expBar.fillRect(x, y, barWidth, barHeight);
        
        // 計算填充寬度
        const fillWidth = (this.characterData.exp / this.characterData.maxExp) * barWidth;
        
        // 繪製填充部分
        this.expBar.fillStyle(0x00ffff, 1);
        this.expBar.fillRect(x, y, fillWidth, barHeight);
    }
    
    // 增加經驗值
    addExperience(exp: number) {
        this.characterData.exp += exp;
        
        // 檢查是否升級
        if (this.characterData.exp >= this.characterData.maxExp) {
            this.levelUp();
        }
        
        // 更新經驗值顯示
        this.updateExpDisplay();
    }
    
    // 升級
    levelUp() {
        // 增加等級
        this.characterData.lv += 1;
        
        // 計算溢出的經驗值
        const overflowExp = this.characterData.exp - this.characterData.maxExp;
        
        // 重置經驗值
        this.characterData.exp = 0;
        
        // 重新計算升級所需經驗值
        this.characterData.maxExp = this.characterData.lv * 10;
        
        // 添加溢出的經驗值
        this.characterData.exp = overflowExp;
        
        // 增加技能點數
        if (!this.characterData.skillPoints) {
            this.characterData.skillPoints = 0;
        }
        this.characterData.skillPoints += 1;
        
        // 更新UI
        this.levelText.setText(`等級: ${this.characterData.lv}`);
        
        // 更新技能點數顯示
        if (this.characterData.skillPointsText) {
            this.characterData.skillPointsText.setText(`點數: ${this.characterData.skillPoints}`);
        }
        
        // 顯示升級效果
        this.showLevelUpEffect();
        
        // 保存角色數據
        this.saveCharacterData();
    }
    
    // 顯示升級效果
    showLevelUpEffect() {
        const { width, height } = this.scale;
        
        // 創建升級文字
        const levelUpText = this.add.text(
            width / 2,
            height / 2,
            '升級!',
            { fontSize: '64px', color: '#ffff00', fontStyle: 'bold' }
        ).setOrigin(0.5).setAlpha(0);
        
        // 創建升級動畫
        this.tweens.add({
            targets: levelUpText,
            alpha: 1,
            scale: 1.5,
            duration: 500,
            ease: 'Power2',
            yoyo: true,
            onComplete: () => {
                levelUpText.destroy();
            }
        });
        
        // 創建玩家閃爍效果
        this.tweens.add({
            targets: this.player,
            alpha: 0.5,
            scale: 1.2,
            duration: 200,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                this.player.setAlpha(1).setScale(1);
            }
        });
        
        // 顯示獲得技能點數的提示
        const skillPointText = this.add.text(
            width / 2,
            height / 2 + 80,
            '獲得技能點數 +1',
            { fontSize: '32px', color: '#00ffff', fontStyle: 'bold' }
        ).setOrigin(0.5).setAlpha(0);
        
        this.tweens.add({
            targets: skillPointText,
            alpha: 1,
            duration: 500,
            ease: 'Power2',
            yoyo: true,
            delay: 300,
            onComplete: () => {
                skillPointText.destroy();
            }
        });
    }
    
    // 更新經驗值顯示
    updateExpDisplay() {
        this.expText.setText(`經驗值: ${this.characterData.exp}/${this.characterData.maxExp}`);
        this.createExpBar();
    }
    
    // 保存角色數據
    saveCharacterData() {
        try {
            // 獲取所有角色數據
            const lastIndex = localStorage.getItem('lastSelectedCharacterIndex');
            const savedData = localStorage.getItem('characterData');
            
            if (lastIndex && savedData) {
                const allCharacters = JSON.parse(savedData);
                
                // 確保所有技能數據都被保存
                const skillsToSave = [
                    'splitShot', 
                    'piercingShot', 
                    'explosion', 
                    'harmBoost', 
                    'speedBoost',
                    'skillPoints',
                    'lv',
                    'exp',
                    'maxExp'
                ];
                
                // 創建一個新的對象來保存當前角色數據
                const characterToSave = { ...this.characterData };
                
                // 確保所有技能數據都被包含
                skillsToSave.forEach(skillKey => {
                    if (this.characterData[skillKey] !== undefined) {
                        characterToSave[skillKey] = this.characterData[skillKey];
                    }
                });
                
                // 更新當前角色數據
                allCharacters[parseInt(lastIndex)] = characterToSave;
                
                // 保存回 localStorage
                localStorage.setItem('characterData', JSON.stringify(allCharacters));
                console.log('角色數據已保存', characterToSave);
            }
        } catch (error) {
            console.error('保存角色數據失敗', error);
        }
    }
    
    shootLightBall() {
        if (!this.isShooting || this.gameOver) return;
        
        // 獲取分裂射擊等級
        const splitShot = this.characterData.splitShot || 0;
        const totalShots = splitShot + 1; // 基礎1發 + 分裂數量
        
        // 獲取攻擊力加成
        const harmBoost = this.characterData.harmBoost || 0;
        const totalDamage = this.characterData.harm + harmBoost;
        
        // 獲取穿透射擊等級
        const piercingShot = this.characterData.piercingShot || 0;
        
        // 獲取爆炸效果等級
        const explosion = this.characterData.explosion || 0;
        
        // 根據分裂數量創建多個光球
        for (let i = 0; i < totalShots; i++) {
            // 計算光球的水平偏移
            let offsetX = 0;
            if (totalShots > 1) {
                // 計算偏移量，使光球均勻分布
                offsetX = (i - (totalShots - 1) / 2) * 20;
            }
            
            // 根據角色的攻擊力調整光球大小和顏色
            const ballSize = 5 + (totalDamage * 2); // 基礎大小 + 攻擊力加成
            const ballColor = this.getBallColorByCharacter(this.characterData.name);
            
            const lightBall = this.add.circle(this.player.x + offsetX, this.player.y - 50, ballSize, ballColor);
            
            // 將光球添加到群組中
            this.lightBalls.add(lightBall);
            
            // 設置光球的傷害值
            lightBall.setData('damage', totalDamage);
            
            // 設置穿透次數
            lightBall.setData('piercing', piercingShot);
            
            // 設置爆炸效果
            lightBall.setData('explosion', explosion);
            
            // 設置光球向上移動的動畫，速度根據角色速度調整
            const speedBoost = this.characterData.speedBoost || 0;
            const totalSpeed = this.characterData.speed + speedBoost;
            const duration = Math.max(800, 1500 - (totalSpeed * 70));
            
            this.tweens.add({
                targets: lightBall,
                y: -100, // 移動到畫面上方外
                duration: duration,
                ease: 'Linear',
                onComplete: () => {
                    // 動畫完成後移除光球
                    lightBall.destroy();
                }
            });
        }
    }
    
    // 根據角色名稱獲取光球顏色
    getBallColorByCharacter(name: string): number {
        switch (name) {
            case '魔法師':
                return 0x00ffff; // 青色
            case '刺客':
                return 0xff0000; // 紅色
            case '弓箭手':
                return 0x00ff00; // 綠色
            case '祭司':
                return 0xffff00; // 黃色
            case '騎士':
                return 0xff8800; // 橙色
            default:
                return 0xffffff; // 白色
        }
    }
    
    // 生成怪物
    spawnMonster() {
        if (this.gameOver) return;
        
        const { width, height } = this.scale;
        
        // 隨機位置 (避開玩家直接頭頂)
        const x = Phaser.Math.Between(50, width - 50);
        const y = Phaser.Math.Between(100, height / 2);
        
        // 隨機大小 (根據難度可調整)
        const size = Phaser.Math.Between(30, 50);
        
        // 隨機顏色
        const colors = [0xff0000, 0x880000, 0x440000, 0x660066];
        const color = Phaser.Utils.Array.GetRandom(colors);
        
        // 創建怪物 (使用圓形代替，之後可替換為圖片)
        // const monster = this.add.image(x, y, 'monster').setDisplaySize(size, size);
        const monster = this.add.circle(x, y, size / 2, color);
        
        // 設置怪物的生命值 (根據大小和難度調整)
        const health = Math.floor(size / 10) + 1;
        monster.setData('health', health);
        monster.setData('maxHealth', health);
        monster.setData('size', size);
        monster.setData('expValue', health); // 設置怪物的經驗值獎勵
        
        // 添加到怪物群組
        this.monsters.add(monster);
        
        // 設置隨機速度
        const speedX = Phaser.Math.Between(100, 200) * (Math.random() > 0.5 ? 1 : -1);
        const speedY = Phaser.Math.Between(100, 200) * (Math.random() > 0.5 ? 1 : -1);
        monster.setData('velocityX', speedX);
        monster.setData('velocityY', speedY);
        
        // 添加生命值顯示
        const healthText = this.add.text(0, 0, `${health}`, { 
            fontSize: '16px', 
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        monster.setData('healthText', healthText);
        
        // 更新生命值文字位置
        this.updateMonsterHealthText(monster);
    }
    
    // 更新怪物生命值文字位置
    updateMonsterHealthText(monster: any) {
        // 檢查怪物是否存在且有效
        if (!monster || !monster.active) return;
        
        const healthText = monster.getData('healthText');
        // 檢查健康文字是否存在且有效
        if (healthText && healthText.active) {
            healthText.setPosition(monster.x, monster.y);
            
            // 更新生命值文字
            const health = monster.getData('health');
            const maxHealth = monster.getData('maxHealth');
            
            // 確保健康值存在
            if (health !== undefined && maxHealth !== undefined) {
                healthText.setText(`${health}`);
                
                // 根據生命值百分比改變顏色
                const healthPercent = health / maxHealth;
                if (healthPercent > 0.6) {
                    healthText.setColor('#00ff00'); // 綠色
                } else if (healthPercent > 0.3) {
                    healthText.setColor('#ffff00'); // 黃色
                } else {
                    healthText.setColor('#ff0000'); // 紅色
                }
            }
        }
    }
    
    // 處理怪物受傷
    damageMonster(monster: any, damage: number, ball: any) {
        // 檢查怪物是否存在且有效
        if (!monster || !monster.active) return;
        
        let health = monster.getData('health') - damage;
        monster.setData('health', health);
        
        // 更新生命值顯示
        this.updateMonsterHealthText(monster);
        
        // 閃爍效果
        this.tweens.add({
            targets: monster,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                // 檢查怪物是否仍然存在且有效
                if (!monster || !monster.active) return;
                
                if (health <= 0) {
                    // 獲取怪物的經驗值獎勵
                    const expValue = monster.getData('expValue') || 1;
                    
                    // 增加玩家經驗值
                    this.addExperience(expValue);
                    
                    // 顯示獲得經驗值的提示
                    this.showExpGainText(monster.x, monster.y, expValue);
                    
                    // 移除生命值文字
                    const healthText = monster.getData('healthText');
                    if (healthText && healthText.active) {
                        healthText.destroy();
                    }
                    
                    // 死亡效果
                    this.tweens.add({
                        targets: monster,
                        scale: 0,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => {
                            if (monster && monster.active) {
                                monster.destroy();
                            }
                        }
                    });
                    
                    // 檢查是否有爆炸效果
                    if (ball) {
                        const explosionLevel = ball.getData('explosion');
                        if (explosionLevel && explosionLevel > 0) {
                            this.createExplosion(monster.x, monster.y, explosionLevel);
                        }
                    }
                }
            }
        });
    }
    
    // 創建爆炸效果
    createExplosion(x: number, y: number, level: number) {
        // 爆炸半徑根據等級決定
        const radius = level * 20;
        
        // 創建爆炸視覺效果
        const explosion = this.add.circle(x, y, radius, 0xffff00, 0.5);
        
        // 爆炸動畫
        this.tweens.add({
            targets: explosion,
            alpha: 0,
            scale: 1.5,
            duration: 300,
            onComplete: () => {
                explosion.destroy();
            }
        });
        
        // 檢測爆炸範圍內的怪物
        this.monsters.getChildren().forEach((monster: any) => {
            // 檢查怪物是否存在且有效
            if (!monster || !monster.active) return;
            
            // 計算與爆炸中心的距離
            const distance = Phaser.Math.Distance.Between(
                monster.x, monster.y,
                x, y
            );
            
            // 如果在爆炸範圍內
            if (distance <= radius) {
                // 根據距離計算傷害 (越近傷害越高)
                const damagePercent = 1 - (distance / radius);
                const damage = Math.max(1, Math.floor(level * 2 * damagePercent));
                
                // 對怪物造成傷害
                this.damageMonster(monster, damage, null);
            }
        });
    }
    
    // 顯示獲得經驗值的提示
    showExpGainText(x: number, y: number, exp: number) {
        const expText = this.add.text(
            x,
            y,
            `+${exp} 經驗`,
            { fontSize: '20px', color: '#00ffff', stroke: '#000000', strokeThickness: 3 }
        ).setOrigin(0.5);
        
        // 文字浮動效果
        this.tweens.add({
            targets: expText,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power1',
            onComplete: () => {
                expText.destroy();
            }
        });
    }
    
    // 處理玩家被怪物撞到
    playerHit() {
        if (this.gameOver) return;
        
        this.gameOver = true;
        
        // 停止所有定時器
        if (this.shootTimer) this.shootTimer.remove();
        if (this.monsterSpawnTimer) this.monsterSpawnTimer.remove();
        
        // 玩家閃爍效果
        this.tweens.add({
            targets: this.player,
            alpha: 0.5,
            duration: 200,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                // 顯示遊戲結束文字
                const { width, height } = this.scale;
                
                const gameOverText = this.add.text(
                    width / 2, 
                    height / 2 - 50, 
                    '遊戲結束', 
                    { fontSize: '64px', color: '#ff0000', fontStyle: 'bold' }
                ).setOrigin(0.5);
                
                // 添加重新開始按鈕
                const restartButton = this.add.rectangle(
                    width / 2, 
                    height / 2 + 50, 
                    200, 
                    60, 
                    0x000000, 
                    0.7
                ).setOrigin(0.5).setInteractive();
                
                const restartText = this.add.text(
                    width / 2, 
                    height / 2 + 50, 
                    '重新開始', 
                    { fontSize: '32px', color: '#ffffff' }
                ).setOrigin(0.5);
                
                restartButton.on('pointerdown', () => {
                    // 重新開始遊戲
                    this.scene.restart();
                });
                
                // 添加返回主選單按鈕
                const menuButton = this.add.rectangle(
                    width / 2, 
                    height / 2 + 120, 
                    200, 
                    60, 
                    0x000000, 
                    0.7
                ).setOrigin(0.5).setInteractive();
                
                const menuText = this.add.text(
                    width / 2, 
                    height / 2 + 120, 
                    '返回主選單', 
                    { fontSize: '32px', color: '#ffffff' }
                ).setOrigin(0.5);
                
                menuButton.on('pointerdown', () => {
                    this.scene.start('MainMenu');
                });
                
                // 保存角色數據
                this.saveCharacterData();
            }
        });
    }
    
    update() {
        if (this.gameOver || this.isSkillSelectionOpen) return;
        
        const { width, height } = this.scale;
        
        // 處理怪物移動和碰撞檢測
        this.monsters.getChildren().forEach((monster: any) => {
            // 檢查怪物是否存在且有效
            if (!monster || !monster.active) return;
            
            // 獲取怪物速度
            const velocityX = monster.getData('velocityX');
            const velocityY = monster.getData('velocityY');
            
            // 確保速度值存在
            if (velocityX === undefined || velocityY === undefined) return;
            
            // 根據時間差計算移動距離 (使用delta time來保持一致的速度)
            const deltaX = velocityX * this.game.loop.delta * 0.001;
            const deltaY = velocityY * this.game.loop.delta * 0.001;
            
            // 更新怪物位置
            monster.x += deltaX;
            monster.y += deltaY;
            
            // 更新生命值文字位置
            this.updateMonsterHealthText(monster);
            
            // 檢查邊界碰撞
            const size = monster.getData('size') / 2 || 25; // 怪物半徑
            
            if (monster.x < size) {
                monster.x = size;
                monster.setData('velocityX', Math.abs(velocityX)); // 反向
            } else if (monster.x > width - size) {
                monster.x = width - size;
                monster.setData('velocityX', -Math.abs(velocityX)); // 反向
            }
            
            if (monster.y < size) {
                monster.y = size;
                monster.setData('velocityY', Math.abs(velocityY)); // 反向
            } else if (monster.y > height - size) {
                monster.y = height - size;
                monster.setData('velocityY', -Math.abs(velocityY)); // 反向
            }
            
            // 檢查與玩家的碰撞
            const distanceToPlayer = Phaser.Math.Distance.Between(
                monster.x, monster.y,
                this.player.x, this.player.y
            );
            
            // 假設玩家半徑為玩家圖像寬度的一半
            const playerRadius = this.player.width / 2;
            
            if (distanceToPlayer < size + playerRadius) {
                this.playerHit();
            }
            
            // 檢查與光球的碰撞
            this.lightBalls.getChildren().forEach((ball: any) => {
                // 檢查光球是否存在且有效
                if (!ball || !ball.active) return;
                
                const distanceToBall = Phaser.Math.Distance.Between(
                    monster.x, monster.y,
                    ball.x, ball.y
                );
                
                // 光球半徑
                const ballRadius = ball.radius || 5;
                
                if (distanceToBall < size + ballRadius) {
                    // 光球命中怪物
                    const damage = ball.getData('damage') || 1;
                    this.damageMonster(monster, damage, ball);
                    
                    // 檢查穿透
                    let piercing = ball.getData('piercing') || 0;
                    if (piercing > 0) {
                        // 減少穿透次數
                        ball.setData('piercing', piercing - 1);
                    } else {
                        // 移除光球
                        if (ball && ball.active) {
                            ball.destroy();
                        }
                    }
                }
            });
        });
    }
}