import { GameObjects, Scene } from 'phaser';
import { CountdownEffect } from '../utils/CountdownEffect2';

interface playerData {
    avatar: string;
    character: string;
    nickname: string;
    username: string;
}

interface seatHand {
    best_community_cards: string[];
    best_hole_cards: string[];
    best_rank:string;
    best_score:number;
    number:number;
    win_rate:string;
}

interface seatData {
    can_do_actions: string[];
    number: number;
    chips:string;
    player?: playerData;
    hole_cards?:string[];
    seat_hand: seatHand;
    scheduled_to_away: boolean;
    scheduled_to_leave: boolean;
    show_hole_cards:number;
    skip_hands: number;
    status: string;
    sub_table_id: string;
    waiting_since: number;
}

export class Seat {

    public container: GameObjects.Container | null = null;
    public avatar: GameObjects.Image | null = null;
    public name: GameObjects.Text | null = null;
    public chips: GameObjects.Text | null = null;
    public betChips: GameObjects.Text | null = null;
    public betChipImage: GameObjects.Image | null = null;
    public infoBox: GameObjects.Image | null = null;
    public cards: any[] = [];
    public seatButton: GameObjects.Image | null = null;
    public countdownEffect: CountdownEffect | null = null;
    public seatNumber: number;
    public isOccupied: boolean = false;

    constructor(seatNumber: number) {
        this.seatNumber = seatNumber;
    }

    // 清空座位上的所有元素
    public clear(scene: Phaser.Scene) {

        if (this.container && this.container.destroy) {
            this.container.destroy();
            // Container 會自動清理其子元素，所以不需要單獨清理
        } else {
            // 如果沒有使用 Container，則需要單獨清理每個元素
            if (this.avatar && this.avatar.destroy) this.avatar.destroy();
            if (this.name && this.name.destroy) this.name.destroy();
            if (this.chips && this.chips.destroy) this.chips.destroy();
            if (this.betChips && this.betChips.destroy) this.betChips.destroy();
            if (this.betChipImage && this.betChipImage.destroy) this.betChipImage.destroy();
            if (this.infoBox && this.infoBox.destroy) this.infoBox.destroy();
            if (this.seatButton && this.seatButton.destroy) this.seatButton.destroy();
            
            this.cards.forEach(card => {
                if (card && card.destroy) card.destroy();
            });
        }
        
        if (this.countdownEffect) this.countdownEffect.stop();
        
        this.avatar = null;
        this.name = null;
        this.chips = null;
        this.betChips = null;
        this.betChipImage = null;
        this.infoBox = null;
        this.seatButton = null;
        this.cards = [];
        this.countdownEffect = null;
        this.isOccupied = false;
    }

    //創建座位上的元素
    public createElements(
        scene: Phaser.Scene, 
        seat: seatData, 
        position: {x: number, y: number}, 
        seatButtonNumber: number, 
        seatTime: any
    ) {

        try{
            // 創建一個容器來包含所有元素
            this.container = scene.add.container(position.x, position.y);
            this.container.setDepth(1);

            // 創建一個透明的佔位元素，防止空容器報錯
            const placeholder = scene.add.rectangle(0, 0, 1, 1, 0x000000, 0);
            placeholder.setAlpha(0); // 設置為完全透明
            this.container.add(placeholder);

            if(seat.player && seat.status !== 'empty'){
                //玩家角色圖案
                this.avatar = scene.add.image(0, -40, seat.player.character).setScale(0.7).setDepth(1);
                this.container.add(this.avatar);

                //玩家資訊框
                this.infoBox = scene.add.image(0, 90, 'myBrand').setScale(0.9).setDepth(2);
                this.container.add(this.infoBox);

                //玩家暱稱
                this.name = scene.add.text(0, 100, seat.player.nickname, 
                    { 
                        fontFamily: 'Arial',
                        fontSize: '52px', 
                        color: '#fff',
                        stroke: '#000000',
                        strokeThickness: 1,
                        align: 'center'
                    }).setDepth(3).setScale(0.5).setOrigin(0.5);
                this.container.add(this.name);

                //玩家籌碼數&狀態&牌型
                if(seat.show_hole_cards !== 0){
                    //顯示牌型
                    const handRankName = this.getHandRankName(seat.seat_hand.best_rank);
                    this.chips = scene.add.text(0, 75, handRankName, 
                    { 
                        fontFamily: 'Arial',
                        fontSize: '56px',
                        color: '#ffda47',
                        stroke: '#000000',
                        strokeThickness: 1,
                        align: 'center'
                    }).setDepth(3).setScale(0.5).setOrigin(0.5);
                }else if(seat.status === 'away'){
                    this.chips = scene.add.text(0, 75, '斷線中...', 
                    { 
                        fontFamily: 'Arial',
                        fontSize: '48px',
                        color: '#ff0000ff',
                        stroke: '#000000',
                        strokeThickness: 1,
                        align: 'center'
                    }).setDepth(3).setScale(0.5).setOrigin(0.5);
                }else if(seat.status === 'folded'){
                    this.chips = scene.add.text(0, 75, '棄牌', 
                    { 
                        fontFamily: 'Arial',
                        fontSize: '48px',
                        color: '#ff0000ff',
                        stroke: '#000000',
                        strokeThickness: 1,
                        align: 'center'
                    }).setDepth(3).setScale(0.5).setOrigin(0.5);
                }else{
                    //等待或遊戲中顯示籌碼數
                    this.chips = scene.add.text(0, 75, seat.chips, 
                    { 
                        fontFamily: 'Arial',
                        fontSize: '56px',
                        color: '#ffda47',
                        stroke: '#000000',
                        strokeThickness: 1,
                        align: 'center'
                    }).setDepth(3).setScale(0.5).setOrigin(0.5);
                }
                
                this.container.add(this.chips);

                //手牌
                if(seat.hole_cards){
                    for(let i = 0;i<seat.hole_cards.length;i++){
                        const cardImage = scene.add.image(i*40 - 20, 30, seat.hole_cards[i]).setScale(0.06).setDepth(1);
                        this.cards.push(cardImage)
                    }
                    this.container.add(this.cards);
                }

                //按鈕位
                if(seat.number === seatButtonNumber){
                    this.seatButton = scene.add.image(position.x + 70, position.y - 10, '按鈕位').setDisplaySize(50, 50).setDepth(15);
                    this.container.add(this.seatButton);
                }

                //倒計時特效
                if(seat.number === seatTime.seatNumber){
                    this.countdownEffect = new CountdownEffect(scene);
                    // 將倒計時效果添加到容器中，使用相對座標
                    this.countdownEffect.graphics.setPosition(0, 120); // 設置相對於容器的位置
                    this.container.add(this.countdownEffect.graphics);
                    // 啟動倒計時，不需要指定絕對座標，因為已經添加到容器中
                    this.countdownEffect.start(seatTime.startTime, seatTime.endTime, 0, 0, 180, 5, false);
                }

                this.isOccupied = true;
            }
            else{

                // console.log(`座位 ${seat.number} 為空，未創建玩家元素。`);
                
            }

            return this.container;

        }catch(error){
            console.error('創建座位元素時出錯:', error);
        }
        
    }

    // 更新座位上的玩家信息
    public update(
    scene: Phaser.Scene, 
    seat: seatData, 
    position: {x: number, y: number}, 
    seatButtonNumber: number, 
    seatTime: any
) {
    // 更新容器位置
    if (this.container) {
        this.container.setPosition(position.x, position.y);
    }

    if(seat.status !== 'empty' && seat.player){
        if (this.avatar) this.avatar.setTexture(seat.player.character);
        if (this.name) this.name.setText(seat.player.nickname);

        if (this.chips) {
            if (seat.show_hole_cards !== 0) {
                // 顯示牌型
                const handRankName = this.getHandRankName(seat.seat_hand.best_rank);
                this.chips.setText(handRankName);
            }else if(seat.status === 'away') {
                // 顯示斷線中
                this.chips.setText('斷線中...');
                // 設置斷線中的樣式 - 紅色，較小字體
                this.chips.setStyle({ 
                    fontFamily: 'Arial',
                    fontSize: '48px',
                    color: '#ff4747', // 紅色
                    stroke: '#000000',
                    strokeThickness: 1,
                    align: 'center'
                });
                this.chips.setScale(0.5);
            }else if(seat.status === 'folded') {
                // 顯示棄牌
                this.chips.setText('棄牌');
                // 設置棄牌的樣式 - 紅色，較小字體
                this.chips.setStyle({ 
                    fontFamily: 'Arial',
                    fontSize: '48px',
                    color: '#ff4747', // 紅色
                    stroke: '#000000',
                    strokeThickness: 1,
                    align: 'center'
                });
                this.chips.setScale(0.5);
            }else {
                // 顯示籌碼數
                this.chips.setText(seat.chips);
            }
        }

        if(seat.hole_cards && this.cards){
            for(let i = 0;i<seat.hole_cards.length;i++){
                const cardImage = this.cards[i].setTexture(seat.hole_cards[i]).setScale(0.06).setDepth(1);
                this.cards[i] = cardImage
            }
        }

        //按鈕位
        if(seat.number === seatButtonNumber){
            if (!this.seatButton) {
                this.seatButton = scene.add.image(70, -10, '按鈕位').setDisplaySize(50, 50).setDepth(15);
                if (this.container) this.container.add(this.seatButton);
            } else {
                this.seatButton.setTexture('按鈕位').setDisplaySize(50, 50).setDepth(15);
            }
        } else if (this.seatButton) {
            this.seatButton.destroy();
            this.seatButton = null;
        }
        
        this.isOccupied = true;
    }
    
    // 更新倒計時特效
    if (seat.number === seatTime.seatNumber) {
        if (!this.countdownEffect) {
            this.countdownEffect = new CountdownEffect(scene);
            if (this.container) {
                // 將倒計時效果添加到容器中，使用相對座標
                this.countdownEffect.graphics.setPosition(0, 120);
                this.container.add(this.countdownEffect.graphics);
            }
        }
        // } else if (!this.container.getAll().includes(this.countdownEffect.graphics)) {
        //     // 如果倒計時效果不在容器中，添加它
        //     this.countdownEffect.graphics.setPosition(0, 120);
        //     this.container.add(this.countdownEffect.graphics);
        // }
            
        // 啟動倒計時，不需要指定絕對座標
        this.countdownEffect.start(seatTime.startTime, seatTime.endTime, 0, 0, 180, 5, false);
    } else if (this.countdownEffect) {
        this.countdownEffect.stop();
        if (this.container && this.countdownEffect.graphics.parentContainer === this.container) {
            this.container.remove(this.countdownEffect.graphics);
        }
        this.countdownEffect = null;
    }
}

    // 獲取容器，用於外部訪問
    public getContainer(): GameObjects.Container | null {
        return this.container;
    }

    //牌型對應的中文名稱
    public getHandRankName(rank: string): string {
        const rankNames: { [key: string]: string } = {
            'none': '無牌型',
            'high_card': '高牌',
            'pair': '對子',
            'two_pair': '兩對',
            'three_of_a_kind': '三條',
            'straight': '順子',
            'flush': '同花',
            'full_house': '葫蘆',
            'four_of_a_kind': '四條',
            'straight_flush': '同花順',
            'royal_flush': '皇家同花順'
        };
        return rankNames[rank] || rank;
    }
}

