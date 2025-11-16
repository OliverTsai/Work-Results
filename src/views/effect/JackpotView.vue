<template>
  <div class="jackpot-demo">
    <h1>Jackpot 無控制元素示範</h1>
    
    <div class="jackpot-container">
      <h3>當前獎池金額</h3>
      <JackpotCounter 
        :initialValue="jackpotValue" 
        :animationDuration="animationDuration"
        :showControls="false"
        @update:value="onValueUpdate"
        @animation-complete="onAnimationComplete"
        ref="jackpotRef"
      />
    </div>
    
    <div class="control-panel">
      <h3>後台控制面板</h3>
      <div class="input-group">
        <label for="new-value">新金額:</label>
        <input 
          id="new-value" 
          v-model="newValue" 
          type="number" 
          step="0.01" 
          min="0"
          placeholder="輸入新金額"
        />
      </div>
      
      <div class="input-group">
        <label for="animation-time">動畫時間 (秒):</label>
        <input 
          id="animation-time" 
          v-model="newDuration" 
          type="number" 
          step="0.1" 
          min="0.1"
          placeholder="輸入動畫時間"
        />
      </div>
      
      <div class="buttons">
        <button @click="updateJackpotValue" class="primary-btn">更新獎池金額</button>
        <button @click="addRandomAmount" class="secondary-btn">增加隨機金額</button>
        <button @click="resetJackpot" class="reset-btn">重置獎池</button>
      </div>
    </div>
    
    <div class="event-log">
      <h3>事件日誌</h3>
      <div class="log-container">
        <div v-for="(log, index) in eventLogs" :key="index" class="log-entry">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import JackpotCounter from '@/components/effect/JackpotCounter.vue';
import type { ComponentPublicInstance } from 'vue';

// 初始值和控制變量
const jackpotValue = ref(1000.00);
const animationDuration = ref(3);
const newValue = ref('2000.00');
const newDuration = ref('2.0');
const eventLogs = ref<Array<{time: string, message: string}>>([]);

// 引用 JackpotCounter 組件實例
const jackpotRef = ref<ComponentPublicInstance<{ updateValue: (value: number, duration?: number) => void }>>();

// 當組件更新值時的回調
const onValueUpdate = (value: number) => {
  jackpotValue.value = value;
  addLog(`獎池金額更新為: ${value.toFixed(2)}`);
};

// 當動畫完成時的回調
const onAnimationComplete = () => {
  addLog('動畫播放完成');
};

// 更新獎池金額
const updateJackpotValue = () => {
  const value = parseFloat(newValue.value);
  const duration = parseFloat(newDuration.value);
  
  if (isNaN(value) || value < 0) {
    addLog('錯誤: 請輸入有效的金額');
    return;
  }
  
  if (isNaN(duration) || duration <= 0) {
    addLog('錯誤: 請輸入有效的動畫時間');
    return;
  }
  
  addLog(`開始更新獎池金額: ${jackpotValue.value.toFixed(2)} → ${value.toFixed(2)}`);
  
  if (jackpotRef.value) {
    jackpotRef.value.updateValue(value, duration);
  }
};

// 增加隨機金額
const addRandomAmount = () => {
  const randomAmount = Math.floor(Math.random() * 10000) / 100;
  const newTotal = jackpotValue.value + randomAmount;
  
  addLog(`增加隨機金額: +${randomAmount.toFixed(2)}`);
  
  if (jackpotRef.value) {
    jackpotRef.value.updateValue(newTotal, parseFloat(newDuration.value) || 1);
  }
};

// 重置獎池
const resetJackpot = () => {
  addLog('重置獎池金額至初始值: 1000.00');
  
  if (jackpotRef.value) {
    jackpotRef.value.updateValue(1000.00, 1);
  }
};

// 添加日誌
const addLog = (message: string) => {
  const now = new Date();
  const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  eventLogs.value.unshift({
    time: timeString,
    message: message
  });
  
  // 限制日誌數量
  if (eventLogs.value.length > 50) {
    eventLogs.value = eventLogs.value.slice(0, 50);
  }
};

// 初始化
onMounted(() => {
  addLog('頁面加載完成，獎池初始化金額: 1000.00');
  
  // 示範: 定時增加小額隨機金額，模擬真實場景
  const intervalId = setInterval(() => {
    // 每次都觸發，確保畫面一直在動
    const smallAmount = (jackpotValue.value % 1) + 0.01 > 0.99 ? 
      0.00 - (jackpotValue.value % 1) : // 如果小數部分即將超過0.99，則重置為0.00
      0.01; // 否則增加0.01
    
    const newTotal = Math.floor(jackpotValue.value) + ((jackpotValue.value % 1) + smallAmount);
    
    addLog(`系統自動增加: ${smallAmount > 0 ? '+' : ''}${smallAmount.toFixed(2)}`);
    
    if (jackpotRef.value) {
      jackpotRef.value.updateValue(newTotal, 0.5);
    }
  }, 60000); // 每60秒檢查一次
  
  // 組件卸載時清除定時器
  onUnmounted(() => {
    clearInterval(intervalId);
  });
});
</script>

<style lang="scss" scoped>
.jackpot-demo {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  height: 100vh;
  overflow-y: auto;
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

h3 {
  color: #444;
  margin-top: 0;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.jackpot-container {
  background-color: #f8f8f8;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.control-panel {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.input-group {
  margin-bottom: 15px;
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #555;
  }
  
  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    
    &:focus {
      outline: none;
      border-color: #4CAF50;
      box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
    }
  }
}

.buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  
  button {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &.primary-btn {
      background-color: #4CAF50;
      color: white;
      
      &:hover {
        background-color: #45a049;
      }
    }
    
    &.secondary-btn {
      background-color: #2196F3;
      color: white;
      
      &:hover {
        background-color: #0b7dda;
      }
    }
    
    &.reset-btn {
      background-color: #f44336;
      color: white;
      
      &:hover {
        background-color: #d32f2f;
      }
    }
  }
}

.event-log {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  .log-container {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 10px;
    background-color: #fafafa;
  }
  
  .log-entry {
    padding: 5px 0;
    border-bottom: 1px solid #f0f0f0;
    font-size: 14px;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .log-time {
    color: #888;
    margin-right: 10px;
    font-family: monospace;
  }
  
  .log-message {
    color: #333;
  }
}

@media (max-width: 768px) {
  .buttons {
    flex-direction: column;
    
    button {
      width: 100%;
    }
  }
}
</style>