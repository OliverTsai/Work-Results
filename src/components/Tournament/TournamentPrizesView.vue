<template>
    <div class="tournament-container p-2">
      <!-- 返回按鈕 -->
      <div class="back-button mb-3" @click="$emit('back-to-main')">
        <img class="backImg" src="@/assets/picture/btn-back.png">
      </div>
      
      <!-- 標題 -->
      <div class="view-title">獎池分配</div>
      
      <!-- 總獎池 -->
      <div class="total-prize">
        <div class="prize-label">總獎池</div>
        <div class="prize-amount">${{ tournamentData?.tournament.stats.total_pot || 0 }}</div>
      </div>
      
      <!-- 獎金分配列表 -->
      <div class="prizes-list" v-if="tournamentData?.tournament.prize_info.prize_details && tournamentData.tournament.prize_info.prize_details.length > 0">
        <div class="prize-item">
          <div class="prize-position">
            <span class="position-number title">名次</span>
            <span class="position-text">百分比</span>
          </div>
          <div class="prize-value">預期獎金</div>
        </div>
        <div class="prize-item" v-for="(prize, index) in tournamentData.tournament.prize_info.prize_details" :key="index">
          <div class="prize-position">
            <span class="position-number">{{ prize.rank }}</span>
            <span class="position-text">{{ prize.prize_ratio }}</span>
          </div>
          <div class="prize-value">${{ prize.expected_prize || 0 }}</div>
        </div>
      </div>
      
      <!-- 無獎金分配時顯示 -->
      <div class="no-prizes" v-else>
        尚未設定獎金分配
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  // 定義組件接收的屬性
  const props = defineProps({
    tournamentData: Object
  });

  console.log('獎池分配',props.tournamentData);
  
  // 定義組件發出的事件
  defineEmits(['back-to-main']);
  
  // 獲取名次文字
  function getPositionText(position: number): string {
    const positionTexts = ['冠軍', '亞軍', '季軍', '第四名', '第五名', '第六名', '第七名', '第八名', '第九名'];
    return position <= positionTexts.length ? positionTexts[position - 1] : `第${position}名`;
  }
  </script>
  
  <style lang="scss" scoped>
  .tournament-container {
    display: flex;
    flex-direction: column;
    height: calc(100% - 60px);
  }
  
  .back-button {
    display: flex;
    align-items: center;
    cursor: pointer;
    width: 3rem;

    img{
        width: 100%;
    }
  }
  
  .view-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 10px 0 20px;
    text-align: center;
  }
  
  .total-prize {
    background-color: rgba(255, 255, 255, 0.836);
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 20px;
    text-align: center;
    
    .prize-label {
      color: #aaa;
      font-size: 0.9rem;
      margin-bottom: 5px;
    }
    
    .prize-amount {
      font-size: 2rem;
      font-weight: bold;
      color: #4d79ff;
    }
  }
  
  .prizes-list {
    flex: 1;
    overflow-y: auto;
  }
  
  .prize-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background-color: #ffde4da8;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .prize-position {
    display: flex;
    align-items: center;
    
    .position-number {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 30px;
      height: 30px;

      border-radius: 50%;
      font-weight: bold;
    }

    .position-number.title{
      border-radius: 0px;
      width: 2.5rem;
    }
    
    .position-text {
      font-weight: bold;
      padding-left: 2.5rem;
    }
  }
  
  .prize-value {
    font-weight: bold;
    color: #4d79ff;
  }
  
  .no-prizes {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #aaa;
    font-style: italic;
  }
  </style>