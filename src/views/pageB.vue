<template>
  <div class="page-b">
    <img src="@/assets/picture/guild-details.png">
    <!-- <h1>頁面 B</h1> -->

    <div class="pageTitle">角色選擇</div>

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
    
    <!-- <Suspense>
      <template #default>
        <div class="mBoxSelect">
            <div class="tableBox">
                <div v-for="table in all_table" :key="table.id" class="routerLink">
                    <div :class="'tableItem ' + table.type">
                        <div class="tableName">{{ table.name }}</div>
                        <div class="tableMoney">
                            <div class="imgSelectBox1">
                                <img src="@/assets/picture/room_F_s_2.png" alt="忙注" class="">
                                <span class="player-count">盲注 {{ table.small_blind }}/{{ table.big_blind }}</span>
                            </div>
                            <div v-if="table.type === 'turbo'" class="imgSelectBox2">
                                <img src="@/assets/picture/room_F_s_2.png" alt="人數" class="">
                                <span class="player-count">人數 {{ table.max_players }}/{{ table.current_players }}</span>
                            </div>
                            <div v-else class="imgSelectBox2">
                                <img src="@/assets/picture/room_F_s_2.png" alt="人數" class="">
                                <span class="player-count">人數 {{ table.current_players }}/{{ table.max_players }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </template>
      <template #fallback>
        <div class="loading-state">
          <p>正在準備頁面內容...</p>
        </div>
      </template>
    </Suspense> -->
    
    <!-- <button @click="navigateBack" class="back-btn">返回頁面 A</button> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router';
import { backendApi } from '@/composables/useApi';
import { getPreloadedPageBData } from '@/composables/useDataFetcher';
import PageBContent from '@/components/PageBContent.vue';


import 弓箭手 from '@/assets/picture/user/Archer1_1.png'
import 刺客 from '@/assets/picture/user/Assassin1_1.png'
import 牧師 from '@/assets/picture/user/Cleric1_1.png'
import 騎士 from '@/assets/picture/user/Knight1_1.png'
import 法師 from '@/assets/picture/user/Mage1_1.png'

const router = useRouter();
const table_type = ref('regular');
const token = ref(localStorage.getItem("token") || "");
const currentIndex = ref(0); // 當前選中的角色索引
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

// 計算可見的角色（始終顯示5個，當前選中的在中間，兩側各2個）
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

// 自動輪播
const startAutoPlay = () => {
  stopAutoPlay(); // 確保不會有多個計時器
  autoPlayInterval.value = setInterval(() => {
    nextSlide();
  }, 5000) as unknown as number; // 每5秒切換一次
};

const stopAutoPlay = () => {
  if (autoPlayInterval.value !== null) {
    clearInterval(autoPlayInterval.value);
    autoPlayInterval.value = null;
  }
};

const all_table = ref<{ 
    id: string; 
    number: number; 
    group: string; 
    name: string; 
    small_blind: string; 
    big_blind: string; 
    current_players: number; 
    max_players: number; 
    type: string; 
}[]>([]); 

const navigateBack = () => {
  router.push({ name: 'pageA' });
};

// 取得牌桌資料並訂閱所有桌子ID
async function getTable() {
  // 首先檢查是否有預加載的數據
  const preloadedData = getPreloadedPageBData();
  
  if (preloadedData && preloadedData.tables && preloadedData.tables.length > 0) {
    // 使用預加載的數據
    all_table.value = preloadedData.tables;
    console.log('使用預加載的牌桌資料:', all_table.value);
    // 清除預加載數據，避免下次使用過期數據
    localStorage.removeItem('pageBData');
    return;
  }
  
  // 如果沒有預加載數據，則從API獲取
  const url = backendApi(`/api/v1/tables?type=${table_type.value}`);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (response.status === 401) {
      console.error('認證失敗，跳轉到登入頁面');
      router.push('/login_line');
      return;
    }

    const data = await response.json();
    all_table.value = data.tables.sort((a: { number: number }, b: { number: number }) => a.number - b.number);
    console.log('從API獲取牌桌資料:', all_table.value);

  } catch (error) {
    console.error("獲取牌桌資料失敗:", error);
  }
}

onMounted(async () => {
  // await getTable();
  // startAutoPlay();
})

onUnmounted(() => {
  stopAutoPlay();
})
</script>

<style lang="scss">
/* 保持原有的樣式不變 */
.page-b {
  position: relative;
  width: 100%;
  // padding: 20px;
  // background-color: blueviolet;
  color: white;

  img{
    width: 100%;
  }
}

.pageTitle{
  position: absolute;
  top: 20%;
  width: 100%;
  display: flex;
  justify-content: center;
  color: rgb(92, 51, 4);
  font-size: 1.5rem;
  font-weight: bold;
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

.loading-state {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  text-align: center;
  margin: 20px 0;
}

.back-btn {
  background-color: #6c757d;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
}

.back-btn:hover {
  background-color: #5a6268;
}

.mBoxSelect{
    position: relative;
    height: 80vh;
    width: 100%;
    overflow-y: auto;
}


.tableBox{
    display: flex;
    flex-direction:column;
    gap: 1rem;
    margin-top: 5rem;

    .tableItem{
        position: relative;
        width: 100%;
        height: 8rem;
        display: flex;
        justify-content: space-between;
        background-image: url('@/assets/picture/框-一般.png');
        background-size: cover; /* 背景自動縮放填滿 */
        background-position: center -0.6rem; /* 背景居中 */
        background-repeat: no-repeat; /* 背景不重複 */
        animation-duration: 0.3s;
        animation-timing-function: ease;

        &:active {
            animation-name: clickAnimation;
        }

        .tableId{
            position: absolute;
            top: 0.5rem;
            left: 2rem;
            font-size: 1.5rem;
            color: rgb(0, 0, 0);
        }

        .tableName{
            position: absolute;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 8rem;
            height: 4rem;
            top: 2rem;
            left: 1rem;
            text-align: center;
            font-size: 1.5rem;
            font-weight: bold;
            color: rgb(0, 0, 0);
        }

        .tableMoney{
            position: absolute;
            top: 20%;
            right: 0.3rem;
            // display: flex;
            // justify-content: center;
            height: 2rem;
            // padding-top: 5px;
            // padding-left: 8.5rem;
            text-align: left;
            font-size: 1.2rem;
            color: rgb(0, 0, 0);
        }
    }
    //不一樣的底圖
    .tableItem.regular{
        background-image: url('@/assets/picture/框-一般.png');
    }
    .tableItem.turbo{
        background-image: url('@/assets/picture/框-急速.png');
    }
    .tableItem.short_deck{
        background-image: url('@/assets/picture/框-短牌.png');
    }
    .tableItem.omaha{
        background-image: url('@/assets/picture/框-奧馬哈.png');
    }
    .tableItem.tournament{
        background-image: url('@/assets/picture/框-積分賽.png');
        .tableName{
            position: absolute;
            display: flex;
            justify-content: center;
            width: 100%;
            top: 2rem;
            left: 1rem;
            text-align: center;
            font-size: 1.2rem;
            color: rgb(0, 0, 0);
        }

        .tableBody{
            display: flex;
            justify-content: space-around;
            gap:0.5rem;
            color: #000000;
            font-size: 0.7rem;
        }

        .tableBodyBox{
            margin-top: 4.2rem;
            display: flex;
            flex-direction:column;
            align-items: center;
            justify-content: center;
        }

        .tableBodyBox.left{
            margin-left: 4rem;
        }
    }
}
</style>