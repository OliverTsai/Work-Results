<template>
  <div class="rank-container">
    <div class="back-button mb-3" @click="$emit('back-to-main')">
      <img class="backImg" src="@/assets/picture/btn-back.png">
    </div>
    <div class="rank-header mt-3">
      <h2 class="rank-title">排行榜</h2>
    </div>

    <div class="last-updated" v-if="tournamentData?.tournament.leaderboard.last_updated">
      最後更新時間: {{ formatTimestamp(tournamentData.tournament.leaderboard.last_updated) }}
    </div>

    <div class="rank-list" v-if="tournamentData?.tournament.leaderboard.rankings && tournamentData.tournament.leaderboard.rankings.length > 0">
      <!-- 表頭 -->
      <div class="rank-item header">
        <div class="rank-position">排名</div>
        <div class="rank-username">用戶名</div>
        <div class="rank-chips">積分</div>
        <div class="rank-prize">獎金</div>
        <!-- <div class="rank-status">狀態</div> -->
      </div>

      <!-- 排行數據 -->
      <div 
        v-for="player in tournamentData.tournament.leaderboard.rankings" 
        :key="player.rank" 
        class="rank-item"
        :class="{'rank-first': player.rank === 1, 'rank-second': player.rank === 2, 'rank-third': player.rank === 3}"
      >
        <div class="rank-position">
          <div class="rank-medal" v-if="player.rank <= 3">{{ player.rank }}</div>
          <span v-else>{{ player.rank }}</span>
        </div>
        <div class="rank-username">{{ player.nickname }}</div>
        <div class="rank-chips">{{ formatNumber(player.rank_chips) }}</div>
        <div class="rank-prize">${{ player.prize }}</div>
        <!-- <div class="rank-status">
          <span :class="getStatusClass(player.status)">{{ getStatusText(player.status) }}</span>
        </div> -->
      </div>
    </div>

    <div class="no-data" v-else>
      暫無排行榜數據
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  tournamentData: Object
});

defineEmits(['back-to-main']);

// 格式化數字，添加千位分隔符
function formatNumber(value: string | number): string {
  if (!value) return '0';
  return Number(value).toLocaleString();
}

// 格式化時間戳為可讀格式
function formatTimestamp(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

// 根據狀態返回對應的CSS類名
function getStatusClass(status: string): string {
  const statusMap: Record<string, string> = {
    'active': 'status-active',
    'eliminated': 'status-eliminated',
    'winner': 'status-winner'
  };
  return statusMap[status] || '';
}

// 根據狀態返回對應的文字
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'active': '進行中',
    'eliminated': '已淘汰',
    'winner': '冠軍'
  };
  return statusMap[status] || status;
}
</script>

<style lang="scss" scoped>
.rank-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
}

.rank-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  position: relative;
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

.rank-title {
  width: 100%;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.last-updated {
  text-align: right;
  font-size: 0.8rem;
  color: #aaa;
  margin-bottom: 1rem;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rank-item {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 2fr;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: rgb(189, 144, 22);

  &.header {
    background-color: transparent;
    color: #aaa;
    font-size: 0.9rem;
    padding: 0.5rem 0.75rem;
  }

  &.rank-first {
    background: linear-gradient(135deg, rgba(255, 217, 0, 0.795), rgba(255, 215, 0, 0.05));
    border: 1px solid rgba(255, 215, 0, 0.3);
  }

  &.rank-second {
    background: linear-gradient(135deg, rgba(192, 192, 192, 0.747), rgba(192, 192, 192, 0.05));
    border: 1px solid rgba(192, 192, 192, 0.3);
  }

  &.rank-third {
    background: linear-gradient(135deg, rgba(205, 127, 50, 0.15), rgba(205, 127, 50, 0.05));
    border: 1px solid rgba(205, 127, 50, 0.3);
  }
}

.rank-position {
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.rank-medal {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  font-weight: bold;
  
  .rank-first & {
    background: linear-gradient(135deg, #ffd700, #ffcc00);
    color: #000;
  }
  
  .rank-second & {
    background: linear-gradient(135deg, #c0c0c0, #e0e0e0);
    color: #000;
  }
  
  .rank-third & {
    background: linear-gradient(135deg, #cd7f32, #dda15e);
    color: #000;
  }
}

.rank-username {
  font-weight: bold;
}

.rank-chips, .rank-prize {
  text-align: center;
}

.rank-status {
  text-align: center;
  
  span {
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    
    &.status-active {
      background-color: rgba(76, 175, 80, 0.2);
      color: #4caf50;
      border: 1px solid rgba(76, 175, 80, 0.5);
    }
    
    &.status-eliminated {
      background-color: rgba(244, 67, 54, 0.2);
      color: #f44336;
      border: 1px solid rgba(244, 67, 54, 0.5);
    }
    
    &.status-winner {
      background-color: rgba(255, 193, 7, 0.2);
      color: #ffc107;
      border: 1px solid rgba(255, 193, 7, 0.5);
    }
  }
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #aaa;
  font-style: italic;
}
</style>