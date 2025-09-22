<template>
    <div class="page-b">
        <!-- 角色輪播畫面 -->
        <div class="pageCarousel">
            <div class="pageCarouselBox">
                <div 
                    v-for="(character, index) in visibleCharacters" 
                    :key="character.id"
                    :class="['pageCarouselImg', { active: index === 2 }]"
                    :style="getImageStyle(index)"
                    @click="selectCharacter(character.originalIndex)"
                >
                <img :src="character.image">
                <div class="character-overlay" v-if="index !== 2"></div>
                <div class="character-name" v-if="index === 2">{{ character.name }}</div>
                </div>
            </div>
      
            <div class="carousel-controls">
                <button @click="prevSlide" class="carousel-control prev">&lt;</button>
                <button @click="nextSlide" class="carousel-control next">&gt;</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref,computed } from 'vue';

import 弓箭手 from '@/assets/picture/user/Archer1_1.png'
import 刺客 from '@/assets/picture/user/Assassin1_1.png'
import 牧師 from '@/assets/picture/user/Cleric1_1.png'
import 騎士 from '@/assets/picture/user/Knight1_1.png'
import 法師 from '@/assets/picture/user/Mage1_1.png'

const currentIndex = ref(0);
const autoPlayInterval = ref<number | null>(null);

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


const visibleCharacters = computed(() => {
  const totalItems = characters.value.length;
  const result = [];
  
  // 顯示5個角色，當前選中的在中間（索引2）
  for (let i = -2; i <= 2; i++) {
    // 計算實際索引，處理循環
    let actualIndex = (currentIndex.value + i + totalItems) % totalItems;
    
    // 添加到結果中，包含原始索引以便點擊時使用
    result.push({
      ...characters.value[actualIndex],
      originalIndex: actualIndex
    });
  }
  
  return result;
});

// 根據索引計算圖片的樣式（大小和位置）
const getImageStyle = (index: number) => {
  // 中間索引是2
  const centerIndex = 2;
  const distance = Math.abs(index - centerIndex);
  
  // 計算縮放和透明度
  const scale = distance === 0 ? 1 : Math.max(0.6, 1 - (distance * 0.2));
  const opacity = distance === 0 ? 1 : Math.max(0.7, 1 - (distance * 0.2));
  
  // 計算水平位置偏移
  let translateX = 0;
  if (distance > 0) {
    // 如果不是中心項，根據與中心的距離計算偏移
    const direction = index > centerIndex ? 1 : -1;
    translateX = direction * (distance * 80); // 每個項目偏移80px
  }
  
  // 計算z-index，讓中心項在最上層
  const zIndex = 5 - distance;
  
  return {
    transform: `translateX(${translateX}px) scale(${scale})`,
    opacity: opacity,
    zIndex: zIndex
  };
};

// 選擇角色
const selectCharacter = (index: number) => {
  currentIndex.value = index;
};

// 下一個角色
const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % characters.value.length;
};

// 上一個角色
const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + characters.value.length) % characters.value.length;
};

const stopAutoPlay = () => {
  if (autoPlayInterval.value !== null) {
    clearInterval(autoPlayInterval.value);
    autoPlayInterval.value = null;
  }
};
</script>

<style lang="scss">
.page-b {
  position: relative;
  width: 100%;
  color: white;

  img{
    width: 100%;
  }
}

.pageCarousel{
  position: absolute;
  top: 25%;
  width: 80%;
  transform: translate(13%, -12%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pageCarouselBox{
  width: 100%;
  height: 12rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  perspective: 1000px;
}

.pageCarouselImg{
  position: absolute;
  height: 10rem;
  transition: all 0.5s ease;
  cursor: pointer;
  
  img{
    height: 100%;
    width: auto;
    object-fit: contain;
    border-radius: 8px;
    transition: all 0.3s ease;
    filter: brightness(20%);
  }
  
  .character-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: all 0.3s ease;
  }
  
  &.active {
    z-index: 10;
    
    img {
      filter: drop-shadow(0 0 10px rgba(255, 204, 0, 0.7));
    }
  }
  
  .character-name {
    position: absolute;
    bottom: -30px;
    left: 0;
    right: 0;
    text-align: center;
    color: #ffcc00;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }
}

.carousel-controls {
  display: flex;
  justify-content: space-between;
  width: 90%;
  margin-top: 2rem;
}

.carousel-control {
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  z-index: 10;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
}

</style>