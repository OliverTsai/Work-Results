// 這個文件用於生成方塊圖片
// 在實際項目中，你應該使用設計師提供的圖片資源
// 這裡我們只是創建一個簡單的腳本來說明如何生成臨時的方塊圖片

const canvas = document.createElement('canvas');
canvas.width = 60;
canvas.height = 60;
const ctx = canvas.getContext('2d');

// 生成紅色方塊
function createRedBlock() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 填充紅色背景
    ctx.fillStyle = '#FF5555';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 添加高光效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    // 添加邊框
    ctx.strokeStyle = '#CC0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    
    return canvas.toDataURL();
}

// 生成藍色方塊
function createBlueBlock() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 填充藍色背景
    ctx.fillStyle = '#5555FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 添加高光效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    // 添加邊框
    ctx.strokeStyle = '#0000CC';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    
    return canvas.toDataURL();
}

// 生成綠色方塊
function createGreenBlock() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 填充綠色背景
    ctx.fillStyle = '#55FF55';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 添加高光效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    // 添加邊框
    ctx.strokeStyle = '#00CC00';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    
    return canvas.toDataURL();
}

// 生成黃色方塊
function createYellowBlock() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 填充黃色背景
    ctx.fillStyle = '#FFFF55';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 添加高光效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    // 添加邊框
    ctx.strokeStyle = '#CCCC00';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    
    return canvas.toDataURL();
}

// 使用方法：
// 1. 在遊戲初始化時調用這些函數生成圖片
// 2. 將生成的 Data URL 轉換為圖片並加載到 Phaser 中
// 例如：
// const redBlockDataURL = createRedBlock();
// this.textures.addBase64('block-red', redBlockDataURL);

// 導出函數
export {
    createRedBlock,
    createBlueBlock,
    createGreenBlock,
    createYellowBlock
};