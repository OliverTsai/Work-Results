import { Scene, GameObjects } from 'phaser';
import { gameStateManager } from '../GameStateManager';
import { useTableStore } from "@/store/tableStore";
import {Chips} from './Chips';
import { CountdownEffect } from '../utils/CountdownEffect2';

export class ActionButtonManager {
    private scene: Scene;
    private actionButtons: GameObjects.Container[] = [];
    private betSliderManager: any; // 將在設置時引用
    private chipAddButtons: GameObjects.Container[] = [];
    private mySeatButtons: GameObjects.Text[] = [];
    private width: number;
    private height: number;

    public countdownEffect: CountdownEffect | null = null;

    private playerInfoElements: { 
        avatar?: Phaser.GameObjects.Image,
        infoBox?: Phaser.GameObjects.Image, 
        nameText?: Phaser.GameObjects.Text, 
        chipsText?: Phaser.GameObjects.Text,
        betChips?:Phaser.GameObjects.Container,
    } = {};

    //棄牌留桌按鈕
    private foldStayButton: GameObjects.Container | null = null;

    // 急速桌是否為 fold_stay 模式
    private isFoldStayMode: boolean = false;

    constructor(scene: Scene) {
        this.scene = scene;
        const { width, height } = scene.scale;
        this.width = width;
        this.height = height;
    }

    // 設置下注拉桿管理器
    setBetSliderManager(betSliderManager: any) {
        this.betSliderManager = betSliderManager;
    }

    //創建自己資料的流程
    createMySeat(gameStateManager: any) {
        
        //創建路由按鈕
        this.createRouteButton(gameStateManager);

        //創建自己的頭像
        this.createPlayerAvatar(gameStateManager);

        //創建自己的資料
        this.createPlayerInfo(gameStateManager);

    }


    //創建路由按鈕
    createRouteButton(gameStateManager: any) {
        // 檢查 scene 是否有效
        if (!this.scene || !this.scene.add) {
            console.log('Scene 無效，無法創建路由按鈕');
            return;
        }
        // 清除之前的按鈕
        if (this.mySeatButtons.length > 0) {
            this.mySeatButtons.forEach(button => {
                button.destroy();
            });
            this.mySeatButtons = [];
        }

        const tableId = gameStateManager.tableState.tableId;
        const tableList = gameStateManager.tableState.mySeatList;

        // const chipAddButtonWidth = 80;
        // const chipAddButtonSpacing = 40;
        // const chipAddStartX = this.width - chipAddButtonWidth + 20;
        // const chipAddY = this.height - 50;

        //排除自己目前的tableId
        const otherTableList = Object.keys(tableList).filter(id => id !== tableId);
        
        //將otherTableList資料迴圈並顯示
        otherTableList.forEach((id, index) => {
            try {
                const table = tableList[id];
                const tableName = table.tableName || `桌子 ${index + 1}`;
                const button = this.scene.add.text(50 + index * 100, 30 , tableName, {
                    fontFamily: 'Arial',
                    fontSize: '64px',
                    color: '#ffffff'
                }).setScale(0.5).setInteractive();

                // 添加到我的座位按鈕列表
                this.mySeatButtons.push(button);

                button.on('pointerdown', () => {
                    // 跳轉到選桌頁面
                    useTableStore().setTableId(id)
                    // window.location.href = `/game/#/game`;
                });
            }catch (error) {
                console.error('創建路由按鈕時出錯:', error);
            }
        });
    }

    //創建自己的頭像
    createPlayerAvatar(gameStateManager: any) {
        try {
            const leftBottomX = this.width * 0.2;
            const leftBottomY = this.height - 350;
            const tableId = gameStateManager.tableState.tableId;
            const avatarKey = gameStateManager.tableState.mySeatList[tableId].character || 'player'

            // 檢查必要數據是否存在
            if (!tableId || !gameStateManager.tableState.mySeatList || !gameStateManager.tableState.mySeatList[tableId]) {
                console.warn('創建玩家頭像所需的數據不完整');
            }

            // const avatarKey = gameStateManager.userActionList[tableId].character || '魔法師'; // 使用玩家的頭像或默認頭像
            this.playerInfoElements.avatar = this.scene.add.image(leftBottomX, leftBottomY -20, avatarKey)
                .setScale(1.2) // 設置頭像比例
                .setDepth(1);

        } catch (error) {
            console.error('創建玩家頭像時出錯:', error);
        }
    }

    //創建玩家資料顯示
    createPlayerInfo(gameStateManager: any) {
        try {
            const leftBottomX = this.width * 0.2;
            const leftBottomY = this.height;
            const tableId = gameStateManager.tableState.tableId;

            const chipX = this.width/2
            const chipY = this.height/2 +250

            // 檢查必要數據是否存在
            if (!tableId || !gameStateManager.tableState.mySeatList || !gameStateManager.tableState.mySeatList[tableId]) {
                console.warn('創建玩家資料所需的數據不完整');
                return { nameText: null, chipsText: null };
            }

            const myData = gameStateManager.tableState.mySeatList[tableId];
            const seatTime = gameStateManager.tableState?.seatTime;
            
            // 創建一個統一的背景框
            const seatSize = Math.min(this.width, this.height) * 0.15;
            const infoBoxWidth = 100;
            const infoBoxHeight = 50; // 高度足夠容納兩行文字
            const infoBoxY = leftBottomY - 160; // 位置調整

            // 如果已有元素，則更新而非創建
            if (this.playerInfoElements.infoBox) {
                this.playerInfoElements.infoBox.setPosition(leftBottomX, infoBoxY );
            } else {
                this.playerInfoElements.infoBox = this.scene.add.image(leftBottomX, infoBoxY , 'myBrand')
                    .setScale(1.2)
                    .setDepth(2);
            }
            // 獲取玩家資料
            const playerName = myData.playerName || '玩家';
            const playerNumber = myData.seatNumber;
            const playerCardBestRank = myData.myCardBestRank || '';
            const playerBetChips = myData.betChips;
            let playerChips = myData.chips || "0";
            let playerStatus = myData.status || '等待中';
            let playerShowCard = myData.showHoleCards || 0;
            // playerStatus = 'folded'

            //更新或創建下注籌碼
            if(this.playerInfoElements.betChips){
                // 如果已經存在籌碼元素，先清除它
                if(this.playerInfoElements.betChips instanceof Phaser.GameObjects.Container) {
                    this.playerInfoElements.betChips.destroy();
                }

                // 創建新的籌碼對象
                const chipObj = new Chips(this.scene);
                const container = chipObj.createChips(this.scene, playerBetChips);

                // 將創建的容器賦值給 betChips 並設置位置
                if(container) {
                    this.playerInfoElements.betChips = container;
                    this.playerInfoElements.betChips.setPosition(chipX, chipY);
                }
            }else {
                // 如果 betChips 不存在，則創建它
                const chipObj = new Chips(this.scene);
                const container = chipObj.createChips(this.scene, playerBetChips);
                
                if(container) {
                    this.playerInfoElements.betChips = container;
                    this.playerInfoElements.betChips.setPosition(chipX, chipY);
                }
            }

            // 更新或創建名稱文本
            if (this.playerInfoElements.nameText) {
                this.playerInfoElements.nameText
                    .setPosition(leftBottomX, leftBottomY - 175 )
                    .setText(playerName);
            } else {
                this.playerInfoElements.nameText = this.scene.add.text(leftBottomX, leftBottomY - 175 , playerName, {
                    fontFamily: 'Arial',
                    fontSize: '32px',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 1,
                    align: 'center'
                }).setOrigin(0.5).setScale(1).setDepth(3);
            }

            // 更新或創建籌碼文本
            if (this.playerInfoElements.chipsText) {
                this.playerInfoElements.chipsText
                    .setPosition(leftBottomX, leftBottomY - 140)
                    .setText(playerChips);
            } else {
                this.playerInfoElements.chipsText = this.scene.add.text(leftBottomX, leftBottomY - 140, playerChips, {
                    fontFamily: 'Arial',
                    fontSize: '32px',
                    color: '#ffcc00',
                    stroke: '#000000',
                    strokeThickness: 1,
                    align: 'center'
                }).setOrigin(0.5).setScale(1).setDepth(3);
            }

            // 根據玩家狀態更新籌碼顯示
            if(playerStatus === 'folded') {
                playerChips = '棄牌';
                this.playerInfoElements.chipsText.setColor('#ff0000'); // 棄牌時顯示紅色
                this.playerInfoElements.chipsText.setText(playerChips);
            }else if(playerShowCard !== 0) {
                this.playerInfoElements.chipsText.setColor('#ffcc00');
                this.playerInfoElements.chipsText.setText(playerCardBestRank);
            }
            else{
                this.playerInfoElements.chipsText.setColor('#ffcc00'); // 恢復正常顏色
                this.playerInfoElements.chipsText.setText(playerChips);
            }

            if(playerNumber === seatTime.seatNumber){
                if(this.countdownEffect){
                    console.log('再次更新')
                    this.countdownEffect.updateTimestamps(seatTime.startTime,seatTime.endTime);
                }else{
                    this.countdownEffect = new CountdownEffect(this.scene);
                    this.countdownEffect.start(seatTime.startTime,seatTime.endTime,0,0,240,20)

                    this.countdownEffect.graphics.setPosition(leftBottomX,leftBottomY - 120)
                }
                                
            }else{
                this.countdownEffect?.stop();
                this.countdownEffect = null;
            }

            return { 
                nameText: this.playerInfoElements.nameText, 
                chipsText: this.playerInfoElements.chipsText 
            };
        } catch (error) {
            console.error('創建玩家資料時出錯:', error);
            // 返回空對象，避免調用方出錯
            return { nameText: null, chipsText: null };
        }
    }

    // 創建動作按鈕
    createActionButtons(gameStateManager: any) {
        // 清除之前的按鈕
        this.clearActionButtons();
        
        const { width, height } = this.scene.scale;
        
        // 獲取可用動作
        const tableId = gameStateManager.tableState.tableId;
        const actions = gameStateManager.tableState.mySeatList[tableId].canDoActions || ['leave'];
        const availableActions = this.processActions(actions);

        //加注金額
        const call = gameStateManager.tableState.mySeatList[tableId].call || '0';
        const minRaise = gameStateManager.tableState.mySeatList[tableId].mainRaise || '0';
        const maxRaise = gameStateManager.tableState.mySeatList[tableId].maxRaise || '0';

        // const availableActions = ['棄牌', '過牌', '加注']; // 預設可用動作

        if (availableActions.length === 0) {
            return this.actionButtons;
        }
        
        // 計算按鈕位置和尺寸
        const buttonWidth = 250;
        const buttonHeight = 120;
        const buttonSpacing = 10;
        const totalWidth = availableActions.length * buttonWidth + (availableActions.length - 1) * buttonSpacing;
        const startX = (width - totalWidth) / 2 + buttonWidth / 2;
        const y = height - 60;
        
        // 創建按鈕
        availableActions.forEach((action:string, index:number) => {

            const x = startX + index * (buttonWidth + buttonSpacing);
            
            // 創建按鈕容器
            const container = this.scene.add.container(x, y);
            container.setDepth(10);

            const buttonKey = 'actionButton';
            
            let buttonBg = this.scene.add.image(0, 0, buttonKey)
                .setDisplaySize(buttonWidth, buttonHeight)
                .setInteractive();

            
            // 創建按鈕文本
            let buttonText = action;
            
            // 如果是跟注，顯示金額
            if (action === '跟注') {
                buttonText = `跟注 $${call || '0'}`;
            } else if (action === '下注' || action === '加注') {
                // 如果是下注或加注，顯示拉桿當前金額
                buttonText = `${action} $${minRaise || '0'}`;
            }
            
            const text = this.scene.add.text(0, 0, buttonText, {
                fontFamily: 'Arial',
                fontSize: '64px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5).setScale(0.5);
            
            // 添加到容器
            container.add([buttonBg, text]);
            
            // 設置按鈕交互
            buttonBg.on('pointerdown', () => {
                this.handleActionButtonClick(action);
            });
            
            // 存儲按鈕引用
            this.actionButtons.push(container);
            
            // 存儲文本引用
            container.setData('textObject', text);
            
            // 設置按鈕的數據屬性
            container.setData('action', action);
            
            // 如果是下注或加注，創建拉桿
            if ((action === '下注' || action === '加注') && this.betSliderManager) {
                // 獲取最小和最大下注金額
                const minBet = minRaise || '10';
                const maxBet = maxRaise || '1000';
                
                // 創建下注拉桿
                this.betSliderManager.createBetSlider(minBet, maxBet, y, this.actionButtons);
                
                // 創建籌碼快速添加按鈕
                this.createChipAddButtons(action);
            }

            // 如果是急速桌且動作是棄牌，創建棄牌留桌按鈕
            // if (gameStateManager.tableState.tableType === "turbo" && action === "棄牌") {

            //     this.createFoldStayButton(x, y - buttonHeight - 10);
            // }            
        });
        
        return this.actionButtons;
    }

    // 處理動作的函數
    processActions(actions: string[]): string[] {
        // 如果第一個動作是 "blind_bet"，回傳空陣列
        if (actions[0] === "blind_bet") {
            return [];
        }

        // 過濾掉 "blind_bet" 和 "all-in"
        const filteredActions = actions.filter(action => action !== "blind_bet");

        // 檢查是否包含 ALL-IN
        const hasAllIn = filteredActions.includes("all-in");
        const hasBetRaiseCheckCall = ["bet", "raise"].some(action => filteredActions.includes(action));

        // 預設順序
        let sortedActions: string[] = [];

        // 保證 "fold"（棄牌）永遠在前面
        if (filteredActions.includes("fold")) {
            sortedActions.push("棄牌");
        }

        // 加入 "call" 或 "check"（只會有其一，放第二位）
        if (filteredActions.includes("call")) {
            sortedActions.push("跟注");
        } else if (filteredActions.includes("check")) {
            sortedActions.push("過牌");
        }

        // 加入 "bet" 或 "raise"（只會有其一，放最後面）
        if (filteredActions.includes("bet")) {
            sortedActions.push("下注");
        } else if (filteredActions.includes("raise")) {
            sortedActions.push("加注");
        }

        // 如果有 ALL-IN，且沒有 bet、raise、check、call，則加入 "all-in"
        if (hasAllIn && !hasBetRaiseCheckCall) {
            sortedActions.push("全下");
        }

        return sortedActions;
    }

    // 創建棄牌留桌按鈕
    private createFoldStayButton(x: number, y: number) {
        const buttonWidth = 120;
        const buttonHeight = 40;

        // 如果已經存在棄牌留桌按鈕，則先銷毀
        if (this.foldStayButton) {
            this.foldStayButton.destroy();
            this.foldStayButton = null;
        }
        
        // 創建按鈕容器
        const container = this.scene.add.container(x, y);
        container.setDepth(10);
        
        const buttonKey = 'actionButton';
        
        let buttonBg = this.scene.add.image(0, 0, buttonKey)
            .setDisplaySize(buttonWidth, buttonHeight)
            .setInteractive();
        
        // 創建按鈕文本
        const text = this.scene.add.text(0, 0, "棄牌留桌", {
            fontFamily: 'Arial',
            fontSize: '56px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setScale(0.25);
        
        // 添加到容器
        container.add([buttonBg, text]);
        
        // 設置按鈕交互
        buttonBg.on('pointerdown', () => {
            this.isFoldStayMode = true;
            // 更新按鈕外觀以表示已啟用
            buttonBg.setTint(0x00ff00);
            text.setColor('#000000');
        });
        
        this.foldStayButton = container;
    }

    // 創建籌碼快速添加按鈕
    private createChipAddButtons(actions:string) {

        const chipAdd = gameStateManager.tableState.allChipAdditionBox;
        // const chipAdd = [
        //     { '30%': 30 },
        //     { '50%': 50 },
        //     { '100%': 100 }
        // ];
        
        // 清除之前的按鈕
        this.chipAddButtons.forEach(button => {
            if (button && button.destroy) button.destroy();
        });
        this.chipAddButtons = [];
        
        const { width, height } = this.scene.scale;
        const chipAddButtonWidth = 220;
        const chipAddButtonHeight = 90;
        const chipAddButtonSpacing = 100;
        const chipAddStartX = width - chipAddButtonWidth + 110;
        const chipAddY = height - 160; // 底部邊距30px

        // 確定當前可用的下注動作類型（raise或bet）
        const betAction = actions.includes('加注') ? 'raise' : (actions.includes('下注') ? 'bet' : 'raise');

        // 創建按鈕
        chipAdd.forEach((item:any, index:number) => {

            // 獲取百分比和金額
            const percentage = Object.keys(item)[0];
            const amount = item[percentage];

            // 計算按鈕位置 (從右到左排列)
            const y = chipAddY - chipAddButtonSpacing * index;
            
            // 創建按鈕容器
            const container = this.scene.add.container(chipAddStartX, y);
            container.setDepth(10);
            
            // 使用 raiseButton 圖片替代矩形背景
            const buttonKey = 'raiseButton';
            const bg = this.scene.add.image(0, 0, buttonKey)
                .setDisplaySize(chipAddButtonWidth, chipAddButtonHeight)
                .setInteractive();
            
            // 創建按鈕文本
            const text = this.scene.add.text(0, 0, `${percentage} $${amount}`, {
                fontFamily: 'Arial',
                fontSize: '56px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5).setScale(0.5);
            
            // 添加到容器
            container.add([bg, text]);
            
            // 設置按鈕交互
            bg.on('pointerdown', () => {
                // 發送動作到後端
                gameStateManager.myAction(betAction, amount)
                .then(response => {
                    console.log('動作成功:', response);
                    // 這裡可以添加成功後的處理邏輯
                })
                .catch(error => {
                    console.error('動作失敗:', error);
                    // 這裡可以添加錯誤處理邏輯
                });
            });
            
            // 存儲按鈕引用
            this.chipAddButtons.push(container);
            
            // 設置按鈕的數據屬性
            container.setData('chipAddPercentage', percentage);
            container.setData('chipAddAmount', amount);
        });
    }

    // 處理動作按鈕點擊
    handleActionButtonClick(action: string) {

        const actionList: { [key: string]: string } = {
            '棄牌': 'fold',
            '跟注': 'call',
            '過牌': 'check',
            '下注': 'bet',
            '加注': 'raise',
            '全下': 'all-in'
        }

        let button = actionList[action];
        console.log(`玩家點擊了 ${action} 按鈕`);

        

        if(this.isFoldStayMode && button === 'fold') {
            button = 'fold_stay';
        }

        let chips = '0';

        switch(button) {
            case 'fold':
            case 'fold_stay':
            case 'all-in':
                // 這些動作不需要金額
                chips = '0';
                break;
            case 'call':
                // 使用當前跟注金額
                chips = gameStateManager.tableState.call || '0';
                break;
            case 'check':
                // 檢查不需要金額
                chips = '0';
                break;
            case 'bet':
            case 'raise':
                // 使用拉桿設置的金額
                chips = this.betSliderManager ? this.betSliderManager.getCurrentBetAmount() : '0';
                break;
        }

        // 發送動作到後端
        gameStateManager.myAction(button, chips)
        .then(response => {
            console.log('動作成功:', response);
            // 這裡可以添加成功後的處理邏輯
        })
        .catch(error => {
            console.error('動作失敗:', error);
            // 這裡可以添加錯誤處理邏輯
        });
    }

    // 清除所有動作按鈕
    clearActionButtons() {
        this.actionButtons.forEach(button => {
            if (button && button.destroy) button.destroy();
        });
        this.actionButtons = [];
        
        this.chipAddButtons.forEach(button => {
            if (button && button.destroy) button.destroy();
        });
        this.chipAddButtons = [];

        if (this.betSliderManager) {
            this.betSliderManager.destroy();
        }

        if (this.foldStayButton) {
            this.foldStayButton.destroy();
            this.foldStayButton = null;
        }
    }

    // 顯示所有動作按鈕
    showActionButtons() {
        this.actionButtons.forEach(button => {
            button.setVisible(true);
        });
        
        this.chipAddButtons.forEach(button => {
            button.setVisible(true);
        });
        
        if (this.betSliderManager) {
            this.betSliderManager.show();
        }
    }

    // 隱藏所有動作按鈕
    hideActionButtons() {
        this.actionButtons.forEach(button => {
            button.setVisible(false);
        });
        
        this.chipAddButtons.forEach(button => {
            button.setVisible(false);
        });
        
        if (this.betSliderManager) {
            this.betSliderManager.hide();
        }
    }

    // 獲取所有動作按鈕
    getActionButtons() {
        return this.actionButtons;
    }

    // 銷毀所有按鈕
    destroy() {
        this.clearActionButtons();

        this.destroyRouteButtons();

        this.destroyPlayerInfo();
        
        if (this.betSliderManager) {
            this.betSliderManager.destroy();
        }

        if (this.countdownEffect) this.countdownEffect.stop();
    }

    //清理路由按鈕
    destroyRouteButtons() {
        this.mySeatButtons.forEach(button => {
            if (button && button.destroy) button.destroy();
        });
        this.mySeatButtons = [];
    }

    // 添加清理方法
    destroyPlayerInfo() {
        if (this.playerInfoElements.avatar) {
            this.playerInfoElements.avatar.destroy();
            this.playerInfoElements.avatar = undefined;
        }
        if (this.playerInfoElements.infoBox) {
            this.playerInfoElements.infoBox.destroy();
            this.playerInfoElements.infoBox = undefined;
        }
        if (this.playerInfoElements.nameText) {
            this.playerInfoElements.nameText.destroy();
            this.playerInfoElements.nameText = undefined;
        }
        if (this.playerInfoElements.chipsText) {
            this.playerInfoElements.chipsText.destroy();
            this.playerInfoElements.chipsText = undefined;
        }
    }
}