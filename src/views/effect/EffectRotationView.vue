<template>
  <div class="page-a">
    <!-- <h1>頁面 A</h1>
    <p>這是起始頁面</p>
    <button @click="navigateToPageB" class="navigate-btn">跳轉到頁面 B</button>
    
    <div v-if="isLoading" class="loading-indicator">
      <p>正在準備頁面 B 的數據，請稍候...</p>
      <div class="progress-bar">
        <div class="progress" :style="{ width: `${loadingProgress}%` }"></div>
      </div>
    </div> -->

    <!-- 角色輪播畫面 -->
    <div class="character-carousel">
      <div class="character-images">
        <div 
          v-for="(character, index) in characters" 
          :key="index" 
          :class="['character-image-container', { active: currentIndex === index }]"
          :style="{ transform: `rotateY(${getRotation(index)}deg) translateZ(150px)`, opacity: getOpacity(index) }"
        >
          <img :src="character.image" :alt="character.name" class="character-image">
        </div>
      </div>
      
      <div class="character-info-container">
        <transition name="fade" mode="out-in">
          <div :key="currentIndex" class="character-info">
            <h3>{{ characters[currentIndex].name }}</h3>
            <p>{{ characters[currentIndex].description }}</p> 
          </div>
        </transition>
      </div>
      
      <div class="carousel-controls">
        <button @click="prevSlide" class="carousel-control prev">&lt;</button>
        <div class="carousel-indicators">
        </div>
        <button @click="nextSlide" class="carousel-control next">&gt;</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { loadPageBData } from '@/composables/useDataFetcher';

import 弓箭手 from '@/assets/picture/user/Archer1_1.png'
import 刺客 from '@/assets/picture/user/Assassin1_1.png'
import 牧師 from '@/assets/picture/user/Cleric1_1.png'
import 騎士 from '@/assets/picture/user/Knight1_1.png'
import 法師 from '@/assets/picture/user/Mage1_1.png'

const router = useRouter();
const isLoading = ref(false);
const loadingProgress = ref(0);

const navigateToPageB = async () => {
  try {
    isLoading.value = true;
    loadingProgress.value = 10;
    
    // 預先載入頁面 B 所需的所有數據
    // 這個函數會返回頁面 B 需要的所有數據
    const pageBData = await loadPageBData(progress => {
      // 更新加載進度
      loadingProgress.value = progress;
    });
    
    loadingProgress.value = 100;
    
    // 將預加載的數據存儲在全局狀態或 localStorage 中
    // 這樣頁面 B 可以直接使用這些數據而不需要重新加載
    localStorage.setItem('pageBData', JSON.stringify(pageBData));
    
    // 數據完全加載後才跳轉到頁面 B
    router.push({ name: 'pageB' });
  } catch (error) {
    console.error('加載頁面 B 數據時出錯:', error);
    alert('無法加載頁面 B 所需的數據，請稍後再試');
  } finally {
    isLoading.value = false;
    loadingProgress.value = 0;
  }
};

// 角色輪播相關邏輯
const characters = ref([
  {
    id: 1,
    name: '牧師 - 珍妮佛',
    description: '牧師是神明在人間的代行者，他們以信仰為盾、以聖光為矛。無論是治癒同伴的創傷，還是對抗黑暗的詛咒，牧師總是站在隊伍最堅實的後方，守護著每一位冒險者。',
    image: 牧師,
    stats: {
      strength: 85,
      speed: 60,
      intelligence: 50
    }
  },
  {
    id: 2,
    name: '法師 - 莫甘娜',
    description: '精通各種魔法的女巫，可以釋放強大的元素魔法攻擊敵人，也可以使用輔助魔法支援隊友。',
    image: 法師,
    stats: {
      strength: 40,
      speed: 55,
      intelligence: 95
    }
  },
  {
    id: 3,
    name: '弓箭手 - 羅賓',
    description: '來自森林的精靈弓箭手，擁有超凡的視力和精準度，可以遠距離狙擊敵人的弱點。',
    image: 弓箭手,
    stats: {
      strength: 55,
      speed: 90,
      intelligence: 70
    }
  },
  {
    id: 4,
    name: '騎士 - 布魯斯',
    description: '信奉騎士精神的騎士，擁有超強的體魄和耐力，是隊伍中的主要肉盾，可以吸收大量傷害。',
    image: 騎士,
    stats: {
      strength: 95,
      speed: 40,
      intelligence: 45
    }
  },
  {
    id: 5,
    name: '刺客 - 比利',
    description: '身手敏捷的暗影刺客，擅長潛行和突襲，可以迅速接近敵人並造成致命一擊。',
    image: 刺客,
    stats: {
      strength: 65,
      speed: 95,
      intelligence: 75
    }
  }
]);

const currentIndex = ref(0);
const autoPlayInterval = ref<number | null>(null);
const lastDirection = ref<'next' | 'prev'>('next'); // 記錄最後一次的滑動方向

// 計算旋轉角度，創建3D旋轉效果，並考慮循環方向
const getRotation = (index: number) => {
  const totalItems = characters.value.length;
  const baseRotation = 360 / totalItems; // 每個角色的基本旋轉角度
  
  // 計算順時針和逆時針兩個方向的角度差
  let diff = (index - currentIndex.value) * baseRotation;
  
  // 確保角度在 -180 到 180 度之間，這樣可以選擇最短的旋轉路徑
  if (diff > 180) {
    diff -= 360;
  } else if (diff < -180) {
    diff += 360;
  }
  
  // 如果是在邊界處（從最後一個到第一個或從第一個到最後一個）
  if (Math.abs(diff) === (totalItems - 1) * baseRotation) {
    // 根據最後的滑動方向決定旋轉方向
    if (lastDirection.value === 'next' && diff < 0) {
      diff = 360 + diff; // 確保從最後一個到第一個時繼續向右轉
    } else if (lastDirection.value === 'prev' && diff > 0) {
      diff = diff - 360; // 確保從第一個到最後一個時繼續向左轉
    }
  }
  
  return diff;
};

// 計算透明度，當前顯示的角色透明度為1，其他角色透明度降低
const getOpacity = (index: number) => {
  if (index === currentIndex.value) return 1;
  return 0.5;
};

const nextSlide = () => {
  lastDirection.value = 'next';
  currentIndex.value = (currentIndex.value + 1) % characters.value.length;
};

const prevSlide = () => {
  lastDirection.value = 'prev';
  currentIndex.value = (currentIndex.value - 1 + characters.value.length) % characters.value.length;
};

const goToSlide = (index: number) => {
  // 根據目標索引與當前索引的關係決定滑動方向
  if (index > currentIndex.value) {
    lastDirection.value = 'next';
  } else if (index < currentIndex.value) {
    lastDirection.value = 'prev';
  }
  currentIndex.value = index;
};

const startAutoPlay = () => {
  stopAutoPlay(); // 確保不會有多個計時器
  // autoPlayInterval.value = setInterval(() => {
  //   nextSlide();
  // }, 5000) as unknown as number; // 每5秒切換一次
};

const stopAutoPlay = () => {
  if (autoPlayInterval.value !== null) {
    clearInterval(autoPlayInterval.value);
    autoPlayInterval.value = null;
  }
};

onMounted(() => {
  startAutoPlay();
});

onUnmounted(() => {
  stopAutoPlay();
});
</script>

<style scoped>
.page-a {
  padding: 40px;
  background-color: blueviolet;
  color: white;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.navigate-btn {
  background-color: #4CAF50;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  margin-top: 20px;
  transition: background-color 0.3s;
}

.navigate-btn:hover {
  background-color: #45a049;
}

.loading-indicator {
  margin-top: 20px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  border-left: 6px solid #007bff;
}

.progress-bar {
  height: 12px;
  background-color: #e9ecef;
  border-radius: 6px;
  margin-top: 15px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #007bff;
  border-radius: 6px;
  transition: width 0.3s ease;
}

/* 角色輪播樣式 - 優化電腦顯示 */
.character-carousel {
  position: relative;
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  height: 600px;
  perspective: 1500px;
}

.character-images {
  position: relative;
  width: 600px;
  height: 400px;
  margin: 0 auto;
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
}

.character-image-container {
  position: absolute;
  width: 220px;
  height: 330px;
  top: 0;
  left: 50%;
  margin-left: -110px;
  transition: all 0.8s ease;
  transform-origin: center center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border-radius: 15px;
  overflow: hidden;
  background-color: aliceblue;
}

.character-image-container.active {
  z-index: 10;
  box-shadow: 0 0 40px rgba(255, 255, 255, 0.9);
  transform: rotateY(0deg) translateZ(250px) scale(1.3) !important;
}

.character-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.character-info-container {
  position: relative;
  width: 80%;
  max-width: 800px;
  margin: 30px auto 0;
  padding: 30px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 15px;
  text-align: center;
  height: 150px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.3);
}

.character-info {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.character-info h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 28px;
  color: #ffcc00;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.character-info p {
  margin-bottom: 20px;
  font-size: 18px;
  line-height: 1.6;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.character-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 600px;
  margin: 0 auto;
}

.stat {
  display: flex;
  align-items: center;
}

.stat-label {
  width: 100px;
  text-align: right;
  margin-right: 15px;
  font-weight: bold;
  font-size: 16px;
}

.stat-bar {
  flex-grow: 1;
  height: 12px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  background-color: #ffcc00;
  border-radius: 6px;
  transition: width 0.5s ease;
}

.carousel-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  padding: 0 50px;
}

.carousel-control {
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  z-index: 10;
  transition: all 0.3s ease;
}

.carousel-control:hover {
  background-color: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.carousel-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.carousel-dot.active {
  background-color: white;
  transform: scale(1.4);
}

/* 淡入淡出過渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 響應式調整 */
@media (min-width: 1440px) {
  .character-carousel {
    height: 700px;
  }
  
  .character-image-container {
    width: 260px;
    height: 390px;
    margin-left: -130px;
  }
  
  .character-info-container {
    height: 180px;
  }
  
  .character-info h3 {
    font-size: 32px;
  }
  
  .character-info p {
    font-size: 20px;
  }
}

@media (min-width: 1920px) {
  .character-carousel {
    max-width: 1600px;
    height: 800px;
  }
  
  .character-images {
    width: 800px;
    height: 500px;
  }
  
  .character-image-container {
    width: 300px;
    height: 450px;
    margin-left: -150px;
  }
  
  .character-image-container.active {
    transform: rotateY(0deg) translateZ(300px) scale(1.3) !important;
  }
  
  .character-info-container {
    max-width: 1000px;
    height: 200px;
  }
}
</style>