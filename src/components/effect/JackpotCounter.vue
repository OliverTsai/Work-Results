<template>
  <div>
    <input v-if="showControls" v-model="money" type="text" placeholder="請輸入金幣" />
    <input v-if="showControls" v-model="time" type="text" placeholder="請輸入秒數" />
    <button v-if="showControls" @click="updateJackpot" :disabled="animating">更新金額</button>
    <div class="jackpot">
      <template v-for="(item, index) in displayItems" :key="index">
        <!-- 顯示數字位元 -->
        <div v-if="item.type === 'digit'" class="digit-column">
          <div class="digit-wrapper" :style="{ transform: `translateY(${item.offset}%)` }">
            <div class="digit" v-for="num in 10" :key="num">
              <img :src="digitImages[(num - 1 + 10) % 10]" alt="digit" class="digit-image" />
            </div>
          </div>
        </div>
        <!-- 顯示小數點 -->
        <div v-else-if="item.type === 'decimal'" class="separator decimal-point">
          <img :src="bit" alt="decimal point" class="separator-image" />
        </div>
        <!-- 顯示千位分隔符 -->
        <div v-else-if="item.type === 'comma'" class="separator comma">
          <img :src="comma" alt="comma" class="separator-image" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, onUnmounted } from 'vue';

import one from '@/assets/picture/Jackpot/1.png';
import two from '@/assets/picture/Jackpot/2.png';
import three from '@/assets/picture/Jackpot/3.png';
import four from '@/assets/picture/Jackpot/4.png';
import five from '@/assets/picture/Jackpot/5.png';
import six from '@/assets/picture/Jackpot/6.png';
import seven from '@/assets/picture/Jackpot/7.png';
import eight from '@/assets/picture/Jackpot/8.png';
import nine from '@/assets/picture/Jackpot/9.png';
import zero from '@/assets/picture/Jackpot/0.png';

import comma from '@/assets/picture/Jackpot/comma.png';
import bit from '@/assets/picture/Jackpot/bit.png';

// 數字圖片映射
const digitImages = [zero, one, two, three, four, five, six, seven, eight, nine];

// 定義組件的props
const props = defineProps({
  initialValue: {
    type: Number,
    default: 10.00
  },
  animationDuration: {
    type: Number,
    default: 3
  },
  showControls: {
    type: Boolean,
    default: true
  }
});

// 定義事件
const emit = defineEmits(['update:value', 'animation-complete']);

const money = ref(props.initialValue.toString());
const time = ref(props.animationDuration.toString());
const currentMoney = ref(props.initialValue);
const targetMoney = ref(props.initialValue);
const animating = ref(false);
const idleAnimationActive = ref(false);
const idleAnimationDirection = ref(true); // true 為遞增，false 為遞減

// 創建顯示項目，包括數字、小數點和逗號
const displayItems = reactive([
  { type: 'digit', value: 0, offset: 0 }, // 十億位
  { type: 'comma' },
  { type: 'digit', value: 0, offset: 0 }, // 億位
  { type: 'digit', value: 0, offset: 0 }, // 千萬位
  { type: 'digit', value: 0, offset: 0 }, // 百萬位
  { type: 'comma' },
  { type: 'digit', value: 0, offset: 0 }, // 十萬位
  { type: 'digit', value: 0, offset: 0 }, // 萬位
  { type: 'digit', value: 0, offset: 0 }, // 千位
  { type: 'comma' },
  { type: 'digit', value: 0, offset: 0 }, // 百位
  { type: 'digit', value: 0, offset: 0 }, // 十位
  { type: 'digit', value: 0, offset: 0 }, // 個位
  { type: 'decimal' },
  { type: 'digit', value: 0, offset: 0 }, // 小數第一位
  { type: 'digit', value: 0, offset: 0 }  // 小數第二位
]);

// 計算每個元素的寬度百分比和總項目數
const totalItems = computed(() => displayItems.length);

// 獲取所有數字位元
const digitItems = computed(() => {
  return displayItems.filter(item => item.type === 'digit');
});

// 將數字轉換為帶有小數點的字符串，並補零至指定位數
const formatNumber = (value: number) => {
  // 格式化為固定的2位小數
  const fixedValue = value.toFixed(2);
  
  // 分離整數部分和小數部分
  const parts = fixedValue.split('.');
  const decimalPart = parts[1]; // 小數部分
  
  // 將整數部分轉換為右對齊的字符串，確保從右到左填充
  const integerPart = parts[0];
  const digitCount = digitItems.value.length - 2; // 減去2位小數位
  
  // 右對齊整數部分
  const paddedInteger = integerPart.padStart(digitCount, '0');
  
  // 返回完整的格式化字符串
  return paddedInteger + '.' + decimalPart;
};

// 更新顯示
const updateDisplay = (value: number) => {
  // 捨棄小於1的小數部分
  const intValue = Math.floor(value);
  
  // 保留兩位小數用於顯示
  const formattedValue = formatNumber(value);
  let digitIndex = 0;
  
  // 遍歷格式化後的字符串中的每個字符
  for (let i = 0; i < formattedValue.length; i++) {
    // 跳過小數點
    if (formattedValue[i] === '.') continue;
    
    // 確保我們不超出數字位元的數量
    if (digitIndex < digitItems.value.length) {
      // 解析當前字符為數字
      const digit = parseInt(formattedValue[i]);
      // 更新對應的數字位元的值和偏移量
      digitItems.value[digitIndex].value = digit;
      digitItems.value[digitIndex].offset = -digit * 10;
      digitIndex++;
    }
  }
};

// 更新jackpot顯示
const updateJackpot = () => {
  if (animating.value) return;
  
  const newMoney = parseFloat(money.value) || 0;
  const durationInSeconds = parseFloat(time.value) || 1;
  
  if (newMoney === currentMoney.value) return;
  
  // 停止閒置動畫
  stopIdleAnimation();
  
  targetMoney.value = newMoney;
  animating.value = true;
  
  // 計算差值（以分為單位，避免浮點數精度問題）
  const startCents = Math.round(currentMoney.value * 100);
  const endCents = Math.round(newMoney * 100);
  const difference = endCents - startCents;
  
  // 確定方向（增加或減少）
  const direction = difference > 0 ? 1 : -1;
  const steps = Math.abs(difference);
  
  // 如果沒有變化，直接返回
  if (steps === 0) {
    animating.value = false;
    startIdleAnimation();
    return;
  }
  
  // 計算每步之間的時間間隔（毫秒）
  const totalDurationMs = durationInSeconds * 1000;
  const stepDuration = totalDurationMs / steps;
  
  // 初始化當前值
  let currentCents = startCents;
  let animationFrame: number;
  const startTime = performance.now();
  
  // 動畫函數
  const animate = (currentTime: number) => {
    // 計算已經過去的時間
    const elapsedTime = currentTime - startTime;
    
    // 根據已過時間計算應該完成的步數
    const expectedSteps = Math.min(steps, Math.floor(elapsedTime / stepDuration));
    
    // 計算當前應該顯示的值
    const expectedCents = startCents + expectedSteps * direction;
    
    // 如果值有變化，更新顯示
    if (expectedCents !== currentCents) {
      currentCents = expectedCents;
      updateDisplay(currentCents / 100);
    }
    
    // 檢查是否完成所有步驟
    if (expectedSteps < steps) {
      // 繼續動畫
      animationFrame = requestAnimationFrame(animate);
    } else {
      // 確保最終值正確
      updateDisplay(endCents / 100);
      currentMoney.value = endCents / 100;
      animating.value = false;
      
      // 通知父組件動畫完成和最終值
      emit('update:value', currentMoney.value);
      emit('animation-complete');
      
      // 開始閒置動畫
      startIdleAnimation();
    }
  };
  
  // 開始動畫
  animationFrame = requestAnimationFrame(animate);
};

// 閒置動畫：小數部分從0.01到0.99往復循環
let idleAnimationInterval: number | null = null;

const startIdleAnimation = () => {
  if (idleAnimationActive.value) return;
  
  idleAnimationActive.value = true;
  let currentDecimal = 1; // 從0.01開始
  
  // 計算每次更新的間隔（60秒內從0.01到0.99需要99次更新）
  const updateInterval = 60000 / 98; // 約612毫秒/次
  
  idleAnimationInterval = window.setInterval(() => {
    if (animating.value) {
      stopIdleAnimation();
      return;
    }
    
    // 獲取整數部分
    const integerPart = Math.floor(currentMoney.value);
    
    // 更新小數部分
    currentDecimal++;
    if (currentDecimal > 99) {
      currentDecimal = 0; // 達到0.99後重置為0.00
    }
    
    // 格式化小數部分
    const decimalPart = currentDecimal / 100;
    
    // 更新顯示
    const newValue = integerPart + decimalPart;
    updateDisplay(newValue);
    
  }, updateInterval);
};

const stopIdleAnimation = () => {
  if (idleAnimationInterval !== null) {
    clearInterval(idleAnimationInterval);
    idleAnimationInterval = null;
  }
  idleAnimationActive.value = false;
};

// 提供一個方法讓外部可以更新值
const updateValue = (newValue: number, duration?: number) => {
  money.value = newValue.toString();
  if (duration !== undefined) {
    time.value = duration.toString();
  }
  updateJackpot();
};

// 監聽props變化
watch(() => props.initialValue, (newValue) => {
  if (!animating.value) {
    money.value = newValue.toString();
    currentMoney.value = newValue;
    updateDisplay(newValue);
  }
});

// 初始化數字顯示
onMounted(() => {
  updateDisplay(currentMoney.value);
  // 開始閒置動畫
  startIdleAnimation();
});

// 組件卸載時清理
onUnmounted(() => {
  stopIdleAnimation();
});

// 暴露方法給父組件
defineExpose({
  updateValue
});
</script>

<style lang="scss" scoped>
.jackpot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%; /* 設置為100%寬度 */
  margin-top: 20px;
  font-family: monospace;
  font-size: 24px;
  background-color: #ffffff00;
  border-radius: 8px;
  padding: 10px;
  overflow: hidden;
  box-sizing: border-box;
}

.digit-column {
  position: relative;
  flex: 1; /* 讓每個數字列平均分配寬度 */
  height: 60px;
  margin: 0 1px;
  overflow: hidden;
  background-color: #ffffff00;
  border-radius: 4px;
  max-width: calc(100% / 16); /* 根據displayItems的長度設置最大寬度 */
}

.digit-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  transition: transform 0.1s linear;
}

.digit {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  color: #fff;
  text-align: center;
}

.digit-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.separator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  margin: 0 1px;
  flex: 1; /* 讓分隔符也平均分配寬度 */
  // max-width: calc(100% / 16); /* 與數字列相同的最大寬度 */
  max-width:0.3rem;
}

.separator-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.decimal-point {
  padding: 0 1px;
}

.comma {
  padding: 0 1px;
}

input {
  margin: 10px;
  padding: 8px;
  width: 150px;
}

button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>