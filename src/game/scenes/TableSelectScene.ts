import { GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { useWebSocketStore } from '../../store/websocketStore';
import { backendApi } from '../../composables/useApi';

export class TableSelectScene extends Scene {
    // 背景
    background: GameObjects.Image;
    // 標題背景
    titleBg: GameObjects.Image;
    // 返回按鈕
    backButton: GameObjects.Image;
    // 獎池背景
    jackpotBg: GameObjects.Image;
    // 獎池數字
    jackpotText: GameObjects.Text;
    // 快速進入按鈕
    enterFastButton: GameObjects.Image;
    // 創建房間按鈕
    createRoomButton: GameObjects.Image;
    // 牌桌類型按鈕
    tableTypeButtons: GameObjects.Text[] = [];
    // 當前選擇的牌桌類型
    currentTableType: string = 'regular';
    // 牌桌容器
    tableContainer: GameObjects.Container;
    // 牌桌列表
    tables: any[] = [];
    // 牌桌圖片
    tableFrames: { [key: string]: string } = {
        'regular': 'table_regular',
        'turbo': 'table_turbo',
        'short_deck': 'table_short_deck',
        'omaha': 'table_omaha',
        'tournament': 'table_tournament'
    };
    // 是否已加載
    isLoaded: boolean = false;
    // 加載中文字
    loadingText: GameObjects.Text;
    // WebSocket Store
    wsStore: any;
    // 獎池金額
    jackpot: number = 51680000;
    // 牌桌列表字符串
    tableList: string = '';
    // 訊息列表
    messages: any[] = [];
    // Token
    token: string = '';
    // WebSocket 訂閱標記，避免重複訂閱
    private hasSubscribed: boolean = false;

    // 添加新屬性用於滑動功能
    private isDragging: boolean = false;
    private startY: number = 0;
    private scrollY: number = 0;
    private maxScroll: number = 0;
    private scrollSpeed: number = 0.5; // 滾動速度係數
    private scrollMask: Phaser.Display.Masks.GeometryMask; // 用於遮罩滾動區域

    constructor() {
        super('TableSelectScene');
    }

    init() {
        // 初始化 WebSocket Store
        this.wsStore = useWebSocketStore();
        this.token = localStorage.getItem("token") || "";
        this.tables = [];
        this.hasSubscribed = false; // 重置訂閱標記

        // 重置滾動相關變數
        this.scrollY = 0;
        this.isDragging = false;
    }

    preload() {
        // 在這裡可以加載場景特定的資源
        // 如果資源已在 Preloader 中加載，則不需要在這裡重複加載
    }

    create() {
        // 取得當前螢幕大小
        const { width, height } = this.scale;

        // 添加背景圖片
        this.background = this.add.image(0, 0, 'bg_select')
            .setOrigin(0, 0)
            .setDisplaySize(width, height);

        // 添加標題背景
        this.titleBg = this.add.image(width / 2, 50, 'select-bg')
            .setOrigin(0.5, 0)
            .setDisplaySize(width, 100);

        // 添加牌桌類型按鈕
        const tableTypes = [
            { type: 'regular', text: '一般桌' },
            { type: 'turbo', text: '極速桌' },
            { type: 'short_deck', text: '短牌桌' },
            { type: 'omaha', text: '奧瑪哈' },
            { type: 'tournament', text: '錦標賽' },
        ];

        // 清空現有按鈕陣列
        this.tableTypeButtons = [];

        // 直接在場景中添加按鈕，先不使用容器
        const buttonWidth = width / tableTypes.length;
        
        tableTypes.forEach((item, index) => {
            const button = this.add.text(
                (index * buttonWidth) + (buttonWidth / 2),
                75, // 調整位置，確保在標題背景內
                item.text,
                {
                    fontFamily: 'Arial',
                    fontSize: '24px',
                    color: '#ffffff',
                    padding: { left: 10, right: 10, top: 5, bottom: 5 }
                }
            )
            .setOrigin(0.5, 0)
            .setInteractive();

            // 為當前選中的類型設置背景
            if (this.currentTableType === item.type) {
                button.setBackgroundColor('#555555');
            }

            button.on('pointerdown', () => {
                this.changeTableType(item.type);
                
                // 更新所有按鈕的背景顏色
                this.tableTypeButtons.forEach(btn => {
                    if (btn.text === item.text) {
                        btn.setBackgroundColor('#555555');
                    } else {
                        btn.setBackgroundColor('');
                    }
                });
            });

            this.tableTypeButtons.push(button);
        });

         // 添加返回按鈕
         this.backButton = this.add.image(50, 150, 'btn-back')
         .setOrigin(0, 0)
         .setDisplaySize(80, 80)
         .setInteractive();

        this.backButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });

        // 添加獎池背景
        this.jackpotBg = this.add.image(width / 2, 250, 'jackpot-bg')
            .setOrigin(0.5, 0)
            .setDisplaySize(width * 0.9, 250);

        // 添加獎池文字
        this.jackpotText = this.add.text(
            width / 2,
            320,
            this.numberDot(this.jackpot),
            {
                fontFamily: 'Arial',
                fontSize: '48px',
                color: '#ffffff'
            }
        ).setOrigin(0.5, 0);

        // 添加快速進入按鈕
        this.enterFastButton = this.add.image(width / 4, 400, 'btn-enterfast')
            .setOrigin(0.5, 0)
            .setDisplaySize(width * 0.4, 80)
            .setInteractive();

        // 添加創建房間按鈕
        this.createRoomButton = this.add.image(width * 3/4, 400, 'btn-create-room')
            .setOrigin(0.5, 0)
            .setDisplaySize(width * 0.4, 80)
            .setInteractive();

        // 創建牌桌容器
        this.tableContainer = this.add.container(0, 500);

         // 創建一個遮罩區域，限制牌桌列表的可視範圍
         const maskGraphics = this.add.graphics();
         maskGraphics.fillStyle(0xffffff);
         maskGraphics.fillRect(0, 500, width, height - 500); // 從500px開始到螢幕底部
         
         this.scrollMask = new Phaser.Display.Masks.GeometryMask(this, maskGraphics);
         this.tableContainer.setMask(this.scrollMask);
         
         // 設置滾動區域的互動
         this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
             if (pointer.y >= 500) { // 只在牌桌列表區域生效
                 this.isDragging = true;
                 this.startY = pointer.y;
             }
         });
         
         this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
             if (this.isDragging) {
                 const dy = pointer.y - this.startY;
                 this.startY = pointer.y;
                 
                 this.scrollY += dy;
                 
                 // 限制滾動範圍
                 this.scrollY = Phaser.Math.Clamp(this.scrollY, -this.maxScroll, 0);
                 
                 // 更新容器位置
                 this.tableContainer.y = 500 + this.scrollY;
             }
         });
         
         this.input.on('pointerup', () => {
             this.isDragging = false;
         });

         // 添加滾輪支持
        this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
            if (pointer.y >= 500) { // 只在牌桌列表區域生效
                this.scrollY -= deltaY * this.scrollSpeed;
                
                // 限制滾動範圍
                this.scrollY = Phaser.Math.Clamp(this.scrollY, -this.maxScroll, 0);
                
                // 更新容器位置
                this.tableContainer.y = 500 + this.scrollY;
            }
        });

        // 添加加載中文字
        this.loadingText = this.add.text(
            width / 2,
            height / 2,
            'Loading...',
            {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        // 獲取牌桌數據
        this.getTable();

        // 監聽 WebSocket 連接狀態
        this.wsStore.$subscribe((mutation: any, state: any) => {
            if (state.isConnected && !this.hasSubscribed) {
                console.log('WebSocket 已連線，開始訂閱');
                if (this.token && this.tableList) {
                    this.wsStore.resubscribeToTableShow(this.tableList);
                    this.hasSubscribed = true; // 設置訂閱標記
                }
            }
            
            // 監聽消息
            if (state.messages && state.messages !== null) {
                const lastMessage = state.messages;
                this.handleWsMessage(lastMessage);
            }
        });

        EventBus.emit('current-scene-ready', this);
    }

    // 切換牌桌類型
    changeTableType(type: string) {
        this.currentTableType = type;
        this.getTable();
    }

    // 獲取牌桌數據
    async getTable() {
        this.isLoaded = false;
        this.loadingText.setVisible(true);
        this.tableContainer.removeAll(true);
        
        // 重置滾動位置
        this.scrollY = 0;
        this.tableContainer.y = 500;
        
        const url = backendApi(`/api/v1/tables?type=${this.currentTableType}`);
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                }
            });

            if (response.status === 401) {
                console.error('認證失敗，跳轉到登入頁面');
                this.scene.start('MainMenu');
                return;
            }

            const data = await response.json();
            this.tables = data.tables.sort((a: any, b: any) => a.number - b.number);
            console.log('牌桌資料:', this.tables);
            
            let tableListArray: string[] = [];

            // 針對每張桌子訂閱 WebSocket
            this.tables.forEach(table => {
                tableListArray.push(table.id);
            });
            
            this.tableList = tableListArray.join(',');
            this.wsStore.resubscribeToTableShow(this.tableList);

            // 創建牌桌顯示
            this.createTableItems();

            this.isLoaded = true;
            this.loadingText.setVisible(false);

        } catch (error) {
            console.error("獲取牌桌資料失敗:", error);
            this.isLoaded = true;
            this.loadingText.setVisible(false);
        }
    }

    // 創建牌桌顯示
    createTableItems() {
        const { width, height } = this.scale;
        const tableWidth = width * 0.9;
        const tableHeight = 160;
        const padding = 20;

        this.tables.forEach((table, index) => {
            // 創建牌桌容器
            const tableItem = this.add.container(width / 2, index * (tableHeight + padding));
            
            // 添加牌桌背景
            const tableFrame = this.add.image(0, 0, this.tableFrames[table.type] || this.tableFrames['regular'])
                .setOrigin(0.5, 0)
                .setDisplaySize(tableWidth, tableHeight)
                .setInteractive();
                
            tableFrame.on('pointerdown', () => {
                this.enterTable(table.id);
            });
            
            // 添加牌桌號碼
            const tableNumber = this.add.text(
                -tableWidth / 2 + 40,
                20,
                table.number.toString(),
                {
                    fontFamily: 'Arial',
                    fontSize: '24px',
                    color: '#000000'
                }
            );
            
            // 添加牌桌名稱
            const tableName = this.add.text(
                0,
                50,
                table.name,
                {
                    fontFamily: 'Arial',
                    fontSize: '28px',
                    color: '#ffffff'
                }
            ).setOrigin(0.5, 0);
            
            // 添加盲注信息
            const blindInfo = this.add.image(-80, 100, 'blind-bg')
                .setOrigin(0.5, 0)
                .setDisplaySize(120, 40);
                
            const blindText = this.add.text(
                -80,
                110,
                `${table.small_blind}/${table.big_blind}`,
                {
                    fontFamily: 'Arial',
                    fontSize: '18px',
                    color: '#ffffff'
                }
            ).setOrigin(0.5, 0);
            
            // 添加玩家數量信息
            const playerInfo = this.add.image(80, 100, 'player-bg')
                .setOrigin(0.5, 0)
                .setDisplaySize(120, 40);
                
            const playerText = this.add.text(
                80,
                110,
                `${table.current_players}/${table.max_players}`,
                {
                    fontFamily: 'Arial',
                    fontSize: '18px',
                    color: '#ffffff'
                }
            ).setOrigin(0.5, 0);
            
            // 將所有元素添加到牌桌容器
            tableItem.add([tableFrame, tableNumber, tableName, blindInfo, blindText, playerInfo, playerText]);
            
            // 將牌桌容器添加到主容器
            this.tableContainer.add(tableItem);
        });
        
        // 計算最大滾動範圍
        if (this.tables.length > 0) {
            const totalHeight = this.tables.length * (tableHeight + padding);
            const visibleHeight = height - 500; // 可視區域高度
            this.maxScroll = Math.max(0, totalHeight - visibleHeight);
        } else {
            this.maxScroll = 0;
        }
    }

    // 進入牌桌
    enterTable(tableId: string) {
        // 使用 EventBus 通知 Vue 組件
        EventBus.emit('enter-table', tableId);
        // 切換到遊戲場景
        this.scene.start('Game', { tableId });
    }

    // 處理 WebSocket 消息
    handleWsMessage(data: any) {
        if (!data) return;
        
        if (data.event === "table_show_update") {
            // 找到對應的桌子，更新人數
            const tableIndex = this.tables.findIndex(table => table.id === data.table_id);
            if (tableIndex !== -1) {
                this.tables[tableIndex].current_players = data.current_players;
                // 更新顯示
                this.updateTableDisplay(tableIndex);
            }
        }
    }

    // 更新牌桌顯示
    updateTableDisplay(tableIndex: number) {
        if (!this.tableContainer || !this.tableContainer.list || this.tableContainer.list.length <= tableIndex) {
            return;
        }
        
        const tableItem = this.tableContainer.list[tableIndex] as Phaser.GameObjects.Container;
        if (!tableItem) return;
        
        // 尋找玩家數量文字元素（假設它是容器中的第7個元素）
        const playerText = tableItem.list[6] as Phaser.GameObjects.Text;
        if (playerText) {
            const table = this.tables[tableIndex];
            playerText.setText(`${table.current_players}/${table.max_players}`);
        }
    }

    // 數字加逗號
    numberDot(num: number) {
        if (num == -1) {
            return '-';
        }

        if (Math.abs(num) < 0.001) num = 0;
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // 場景更新
    update() {
        // 可以在這裡添加需要每幀更新的邏輯
    }
}