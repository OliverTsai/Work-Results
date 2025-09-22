import { GameObjects, Scene } from 'phaser';

export class SeatLocation {

    // 根據玩家數量返回座位位置
    getSeatPosition(playerCount: number, seatIndex: number): { x: number, y: number } {
        const angle = (seatIndex / playerCount) * (Math.PI * 2);
        const radius = 200; // 座位距離中心的半徑
        const centerX = 400; // 中心點X座標
        const centerY = 300; // 中心點Y座標

        return {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
        };
    }

}