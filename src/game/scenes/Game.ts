import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { backendApi } from '../../composables/useApi';
import { useWebSocketStore } from '../../store/websocketStore';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    actionButton: Phaser.GameObjects.Text;
    image: Phaser.GameObjects.Image;
    tableId: string = '';
    wsStore: any;
    token: string = '';

    constructor ()
    {
        super('Game');
    }

    init(data: any)
    {
        // 從選桌場景接收牌桌 ID
        this.tableId = data.tableId || '';
        this.wsStore = useWebSocketStore();
        this.token = localStorage.getItem("token") || "";
        console.log('進入牌桌:', this.tableId);
    }

    async create ()
    {
        this.camera = this.cameras.main;
        // this.camera.setBackgroundColor(0x00ff00);

        console.log('遊戲開始');
        const { width, height } = this.scale;
        this.background = this.add.image(width / 2, height / 2, 'background')
            .setDisplaySize(width, height) // 讓背景填滿畫面
            .setAlpha(0.5);

        // this.background = this.add.image(512, 384, 'background');
        // this.background.setAlpha(0.5);

        this.gameText = this.add.text(width / 2, height / 2, 'Loading game data...', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // 如果有牌桌 ID，則連接到該牌桌
        if (this.tableId) {
            try {
                // 連接到指定牌桌
                const url = backendApi(`/api/v1/tables/${this.tableId}`);
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
                console.log('牌桌資料:', data);
                
                // 訂閱該牌桌的 WebSocket 消息
                this.wsStore.subscribeToTable(this.tableId);
                
                // 更新遊戲界面
                this.gameText.setText(`歡迎來到 ${data.table.name}\n盲注: ${data.table.small_blind}/${data.table.big_blind}\n玩家數: ${data.table.current_players}/${data.table.max_players}`);
                
                // 創建返回按鈕
                const backButton = this.add.text(width * 0.1, height * 0.1, '返回選桌', {
                    fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
                    backgroundColor: '#333333', padding: { left: 10, right: 10, top: 5, bottom: 5 }
                }).setOrigin(0, 0.5).setInteractive();

                backButton.on('pointerdown', () => {
                    // 取消訂閱
                    this.wsStore.unsubscribeFromTable(this.tableId);
                    // 返回選桌場景
                    this.scene.start('TableSelectScene');
                });

            } catch (error) {
                console.error('獲取牌桌資料失敗:', error);
                this.gameText.setText('無法載入牌桌資料，請稍後再試。');
                
                // 創建返回按鈕
                const backButton = this.add.text(width / 2, height * 0.7, '返回選桌', {
                    fontFamily: 'Arial', fontSize: 32, color: '#ffffff',
                    backgroundColor: '#ff0000', padding: { left: 10, right: 10, top: 5, bottom: 5 }
                }).setOrigin(0.5).setInteractive();

                backButton.on('pointerdown', () => {
                    this.scene.start('TableSelectScene');
                });
            }
        } else {
            this.gameText.setText('未指定牌桌 ID，請返回選擇牌桌。');
            
            // 創建返回按鈕
            const backButton = this.add.text(width / 2, height * 0.7, '返回選桌', {
                fontFamily: 'Arial', fontSize: 32, color: '#ffffff',
                backgroundColor: '#ff0000', padding: { left: 10, right: 10, top: 5, bottom: 5 }
            }).setOrigin(0.5).setInteractive();

            backButton.on('pointerdown', () => {
                this.scene.start('TableSelectScene');
            });
        }

        // 遊戲操作按鈕
        this.actionButton = this.add.text(width / 2, height * 0.8, '開始遊戲', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            backgroundColor: '#ff0000', padding: { left: 10, right: 10, top: 5, bottom: 5 }
        }).setOrigin(0.5).setInteractive();

        this.actionButton.on('pointerdown', async () => {
            console.log('開始遊戲，發送請求...');
            try {
                const url = backendApi(`/api/v1/tables/${this.tableId}/join`);
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ buy_in: 1000 }) // 買入金額
                });
                
                const result = await response.json();
                console.log('加入牌桌結果:', result);
                
                if (result.success) {
                    this.gameText.setText('已成功加入牌桌！等待遊戲開始...');
                } else {
                    this.gameText.setText(`無法加入牌桌: ${result.message || '未知錯誤'}`);
                }
            } catch (error) {
                console.error('加入牌桌失敗:', error);
                this.gameText.setText('加入牌桌失敗，請稍後再試。');
            }
        });

        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        // 取消訂閱
        if (this.tableId) {
            this.wsStore.unsubscribeFromTable(this.tableId);
        }
        this.scene.start('GameOver');
    }
}
