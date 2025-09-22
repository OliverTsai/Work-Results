<template>
    <div class="tournament-container p-2">
      <!-- 返回按鈕 -->
      <div class="back-button mb-3" @click="$emit('back-to-main')">
        <img class="backImg" src="@/assets/picture/btn-back.png">
      </div>
      
      <!-- 標題 -->
      <div class="view-title">錦標賽詳情</div>
      
      <!-- 詳情內容 -->
      <div class="details-content">
        <div class="detail-item">
          <div class="detail-label">錦標賽名稱</div>
          <div class="detail-value">{{ tournamentData?.tournament.base.name }}</div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">狀態</div>
          <div class="detail-value">{{ getTournamentStatusName(tournamentData?.tournament.base.status) }}</div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">入池費</div>
          <div class="detail-value">${{ tournamentData?.tournament.base.pot_fee }}</div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">賽事開始時間</div>
          <div class="detail-value">{{ formatTimestamp(tournamentData?.tournament.base.start_time) }}</div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">賽事結束時間</div>
          <div class="detail-value">{{ formatTimestamp(tournamentData?.tournament.base.end_time) }}</div>
        </div>

        <div class="detail-item">
          <div class="detail-label">報名開始時間</div>
          <div class="detail-value">{{ formatTimestamp(tournamentData?.tournament.base.register_start_time) }}</div>
        </div>

        <div class="detail-item">
          <div class="detail-label">報名結束時間</div>
          <div class="detail-value">{{ formatTimestamp(tournamentData?.tournament.base.register_end_time) }}</div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">最大參賽人數</div>
          <div class="detail-value">{{ tournamentData?.tournament.base.max_players }}</div>
        </div>

        <div class="detail-item">
          <div class="detail-label">買入</div>
          <div class="detail-value">${{ tournamentData?.tournament.base.pot_fee }} + {{ tournamentData?.tournament.base.service_fee }}</div>
        </div>

        <div class="detail-item">
          <div class="detail-label">起始籌碼</div>
          <div class="detail-value">{{ tournamentData?.tournament.base.starting_chips }}</div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">當前參賽人數</div>
          <div class="detail-value">{{ tournamentData?.tournament.stats.current_players }}</div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">總獎池</div>
          <div class="detail-value">${{ tournamentData?.tournament.stats.total_pot }}</div>
        </div>
        
        <div class="detail-item" v-if="tournamentData?.description">
          <div class="detail-label">描述</div>
          <div class="detail-value">{{ tournamentData?.description }}</div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  // 定義組件接收的屬性
  const props = defineProps({
    tournamentData: Object
  });
  
  // 定義組件發出的事件
  defineEmits(['back-to-main']);
  
  // 根據狀態碼回傳狀態名稱
  function getTournamentStatusName(status: string): string {
    const statusMap: Record<string, string> = {
      'draft': '創立中',
      'entry': '報名中',
      'ready': '準備中',
      'run_with_entry': '延遲報名',
      'run': '比賽進行中',
      'complete': '已完成',
      'paid': '已派發',
      'cancel': '已取消'
    };
    
    return statusMap[status] || status;
  }
  
  // 格式化日期時間
  // function formatDateTime(dateTimeStr: string | undefined): string {
  //   if (!dateTimeStr) return '未設定';
    
  //   try {
  //     const date = new Date(dateTimeStr);
  //     return date.toLocaleString('zh-TW', {
  //       year: 'numeric',
  //       month: '2-digit',
  //       day: '2-digit',
  //       hour: '2-digit',
  //       minute: '2-digit'
  //     });
  //   } catch (e) {
  //     return dateTimeStr;
  //   }
  // }

  // 格式化時間戳（Unix timestamp，以秒為單位）
  function formatTimestamp(timestamp: number | undefined): string {
    if (!timestamp) return '未設定';
    
    try {
      // 將時間戳轉換為毫秒（JavaScript Date 需要毫秒）
      const date = new Date(timestamp * 1000);
      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '時間格式錯誤';
    }
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
  
  .details-content {
    flex: 1;
    overflow-y: auto;
  }
  
  .detail-item {
    padding: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background-color: rgba(240, 255, 255, 0.596);
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .detail-label {
    color: #2c2c2c;
    font-size: 0.9rem;
    margin-bottom: 5px;
  }
  
  .detail-value {
    font-size: 1rem;
    word-break: break-word;
  }
  </style>