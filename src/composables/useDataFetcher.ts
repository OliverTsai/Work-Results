// 模擬從API獲取數據的延遲
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 預加載圖片的函數
const preloadImage = (src: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = resolve;
    img.onerror = reject;
  });
};

// 載入頁面B所需的所有數據和圖片
export const loadPageBData = async (progressCallback?: (progress: number) => void, tableType: string = 'regular') => {
  progressCallback?.(10);
  
  // 獲取token
  const token = localStorage.getItem("token") || "";
  
  // 第一步：獲取表格數據
  progressCallback?.(20);
  let tableData = [];
  try {
    const url = `/api/v1/tables?type=${tableType}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      tableData = data.tables.sort((a, b) => a.number - b.number);
    }
  } catch (error) {
    console.error("獲取牌桌數據失敗:", error);
  }
  
  // 第二步：預加載所有必要的圖片
  progressCallback?.(50);
  
  // 圖片路徑列表 - 這裡需要使用相同的圖片路徑
  const imagePaths = [
    '/src/assets/picture/bg_select.png',
    '/src/assets/picture/select-bg.png',
    '/src/assets/picture/jackpot-bg.png',
    '/src/assets/picture/btn-back.png',
    '/src/assets/picture/btn-enterfast.png',
    '/src/assets/picture/btn-create-room.png',
    '/src/assets/picture/框-一般.png',
    '/src/assets/picture/框-急速.png',
    '/src/assets/picture/框-短牌.png',
    '/src/assets/picture/框-奧馬哈.png',
    '/src/assets/picture/框-積分賽.png',
    '/src/assets/picture/忙注.png',
    '/src/assets/picture/人數.png',
    '/src/assets/picture/room_F_s_2.png'
  ];
  
  // 預加載所有圖片
  try {
    const totalImages = imagePaths.length;
    for (let i = 0; i < totalImages; i++) {
      await preloadImage(imagePaths[i]);
      // 更新進度 - 從50%到90%
      progressCallback?.(50 + Math.floor((i + 1) / totalImages * 40));
    }
  } catch (error) {
    console.error("預加載圖片失敗:", error);
  }
  
  // 完成所有數據加載
  progressCallback?.(100);
  
  // 返回頁面B需要的數據
  return {
    tables: tableData,
    loadedAt: new Date().toISOString()
  };
};

// 檢查是否有預加載的數據
export const getPreloadedPageBData = () => {
  try {
    const storedData = localStorage.getItem('pageBData');
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  } catch (error) {
    console.error('獲取預加載數據時出錯:', error);
    return null;
  }
};