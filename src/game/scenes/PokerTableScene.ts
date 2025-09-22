import { PokerBoot } from './PokerBoot';
import { PlayerAction, Player, Card } from '../types';

export default class TableScene extends PokerBoot {
  private players: Map<string, Phaser.GameObjects.Container> = new Map();
  private cards: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private tableGraphics!: Phaser.GameObjects.Graphics;
  private statusText!: Phaser.GameObjects.Text;
  
  constructor() {
    super({ key: 'TableScene' });
  }

  protected initScene(): void {
    // 繪製牌桌
    this.createTable();
    
    // 創建狀態文本
    this.statusText = this.add.text(
      this.cameras.main.centerX, 
      50, 
      '等待遊戲開始...', 
      { fontSize: '24px', color: '#ffffff' }
    ).setOrigin(0.5);
  }

  private createTable(): void {
    // 獲取遊戲畫面的尺寸
    const { width, height } = this.scale;
    console.log('高')
    console.log(height)
    
    // 使用背景圖片而不是繪製圖形
    const bgTable = this.add.image(0, 0, 'bgTable');

    // 設定圖片為左上角對齊（預設是中心對齊）
    bgTable.setOrigin(0, 0);
    
    // 調整背景圖片大小以適應螢幕
    // 計算適當的縮放比例，確保圖片完全覆蓋畫面
    const scaleX = width / bgTable.width;
    const scaleY = scaleX;

    // const scale = Math.max(scaleX, scaleY);
    
    bgTable.setScale(scaleX, scaleY);
    
    // 如果您仍然想要在背景圖片上方添加一個半透明的牌桌區域，可以保留以下代碼
    // 創建牌桌區域 (適應手機螢幕，高大於寬)
    this.tableGraphics = this.add.graphics();
    
  }

  protected updateScene(): void {
    if (!this.gameState) return;
    
    // 更新狀態文本
    this.statusText.setText(`遊戲階段: ${this.gameState.gamePhase}`);
    
    // 更新玩家
    this.updatePlayers();
    
    // 更新牌
    this.updateCards();
  }

  private updatePlayers(): void {
    if (!this.gameState) return;
    
    // 清除不存在的玩家
    const currentPlayerIds = this.gameState.players.map(p => p.id);
    [...this.players.keys()].forEach(playerId => {
      if (!currentPlayerIds.includes(playerId)) {
        this.players.get(playerId)?.destroy();
        this.players.delete(playerId);
      }
    });
    
    // 更新或創建玩家
    this.gameState.players.forEach(player => {
      if (this.players.has(player.id)) {
        this.updatePlayerUI(player);
      } else {
        this.createPlayerUI(player);
      }
    });
  }

  private createPlayerUI(player: Player): void {
    // 計算玩家位置
    const positions = this.calculatePlayerPositions(this.gameState!.players.length);
    const position = positions[player.position];
    
    // 創建玩家容器
    const container = this.add.container(position.x, position.y);
    
    // 添加玩家頭像背景
    const background = this.add.circle(0, 0, 40, 0x333333);
    container.add(background);
    
    // 添加玩家名稱
    const nameText = this.add.text(0, 50, player.name, { 
      fontSize: '16px', 
      color: '#ffffff' 
    }).setOrigin(0.5);
    container.add(nameText);
    
    // 添加玩家籌碼
    const chipsText = this.add.text(0, 70, `${player.chips}`, { 
      fontSize: '14px', 
      color: '#ffff00' 
    }).setOrigin(0.5);
    container.add(chipsText);
    
    // 保存玩家UI引用
    this.players.set(player.id, container);
  }

  private updatePlayerUI(player: Player): void {
    const container = this.players.get(player.id);
    if (!container) return;
    
    // 更新玩家籌碼文本
    const chipsText = container.getAt(2) as Phaser.GameObjects.Text;
    chipsText.setText(`${player.chips}`);
    
    // 更新玩家狀態 (例如：當前回合高亮顯示)
    const background = container.getAt(0) as Phaser.GameObjects.Shape;
    if (this.gameState?.currentTurn === player.id) {
      background.setFillStyle(0x0066ff); // 高亮當前玩家
    } else {
      background.setFillStyle(0x333333); // 正常顯示
    }
  }

  private calculatePlayerPositions(playerCount: number): { x: number, y: number }[] {
    const positions: { x: number, y: number }[] = [];
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const radius = 300;
    
    // 計算玩家在牌桌周圍的位置
    for (let i = 0; i < playerCount; i++) {
      const angle = (i / playerCount) * Math.PI * 2 - Math.PI / 2;
      positions.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      });
    }
    
    return positions;
  }

  private updateCards(): void {
    if (!this.gameState) return;
    
    // 清除不存在的牌
    const currentCardIds = this.gameState.cards.map(c => c.id);
    [...this.cards.keys()].forEach(cardId => {
      if (!currentCardIds.includes(cardId)) {
        this.cards.get(cardId)?.destroy();
        this.cards.delete(cardId);
      }
    });
    
    // 更新或創建牌
    this.gameState.cards.forEach(card => {
      if (this.cards.has(card.id)) {
        this.updateCardUI(card);
      } else {
        this.createCardUI(card);
      }
    });
  }

  private createCardUI(card: Card): void {
    // 創建牌精靈
    const cardSprite = this.add.sprite(
      card.position?.x || this.cameras.main.centerX,
      card.position?.y || this.cameras.main.centerY,
      card.isVisible ? `card_${card.suit}_${card.value}` : 'card_back'
    );
    
    // 設置牌的大小
    cardSprite.setScale(0.7);
    
    // 保存牌UI引用
    this.cards.set(card.id, cardSprite);
  }

  private updateCardUI(card: Card): void {
    const cardSprite = this.cards.get(card.id);
    if (!cardSprite) return;
    
    // 更新牌的位置
    if (card.position) {
      cardSprite.setPosition(card.position.x, card.position.y);
    }
    
    // 更新牌的正反面
    if (card.isVisible && card.suit && card.value) {
      cardSprite.setTexture(`card_${card.suit}_${card.value}`);
    } else {
      cardSprite.setTexture('card_back');
    }
  }

  // 玩家操作方法
  public playerBet(amount: number): void {
    this.sendPlayerAction({
      type: 'bet',
      playerId: '', // 需要從遊戲狀態或登入信息獲取
      gameId: '', // 需要從遊戲狀態獲取
      data: { amount }
    });
  }

  public playerFold(): void {
    this.sendPlayerAction({
      type: 'fold',
      playerId: '', // 需要從遊戲狀態或登入信息獲取
      gameId: '' // 需要從遊戲狀態獲取
    });
  }

  // 其他玩家操作方法...
}