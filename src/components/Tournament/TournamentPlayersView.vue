<template>
  <div class="tournament-container p-2">
    <!-- 返回按鈕 -->
    <div class="back-button mb-3" @click="$emit('back-to-main')">
      <img class="backImg" src="@/assets/picture/btn-back.png">
    </div>
    
    <!-- 標題 -->
    <div class="view-title">參賽者列表</div>
    
    <!-- 參賽者計數 -->
    <div class="players-count">
      <span>{{ tournamentData?.tournament.stats.current_players || 0 }}/{{ tournamentData?.tournament.base.max_players || 0 }} 位參賽者</span>
    </div>
    
    <!-- 參賽者列表 -->
    <div class="players-list" v-if="tournamentData?.tournament.players">
      <div class="player-item" v-for="(player, index) in sortedPlayers" :key="player.id || index">
        <div class="player-avatar">
          <img :src="player.avatar || 'default-avatar.png'" />
        </div>
        <div class="player-info">
          <div class="player-name">{{ player.nickname || `玩家 ${index}` }}</div>
          <div class="player-status" :class="player.status">{{ getPlayerStatusName(player.status || '') }}</div>
        </div>
        <div class="player-chips" v-if="player.chips !== undefined">
          {{ player.chips }} 籌碼
        </div>
        <div v-if="player.table_id">
          <router-link :to="{ name: 'game' }">
            <div @click="playerMove(player.table_id)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-right-fill" viewBox="0 0 16 16">
                <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
              </svg>
            </div>
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- 無參賽者時顯示 -->
    <div class="no-players" v-else>
      目前尚無參賽者
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTableStore } from "@/store/tableStore";

//全域tableId
const tableStore = useTableStore();

// 定義組件接收的屬性
const props = defineProps({
  tournamentData: Object
});

// 定義玩家對象的接口
interface Player {
  id: string;
  username?: string;
  avatar?: string;
  status?: string;
  chips?: string | number;
  [key: string]: any; // 允許其他屬性
}

function playerMove(id:string){
    tableStore.setTableId(id)
}

// 定義組件發出的事件
defineEmits(['back-to-main']);

// 獲取玩家狀態名稱
function getPlayerStatusName(status: string): string {
  const statusMap: Record<string, string> = {
    'active': '活躍',
    'eliminated': '已淘汰',
    'registered': '已報名',
    'waiting': '等待中'
  };
  
  return statusMap[status] || status;
}

// 計算屬性：根據籌碼排序的玩家列表
const sortedPlayers = computed<Player[]>(() => {
  if (!props.tournamentData?.tournament?.players) return [];
  
  try {
    // 將對象轉換為數組
    const playersArray: Player[] = Object.entries(props.tournamentData.tournament.players).map(([key, value]) => {
      // 確保 value 是一個對象
      const playerData = (typeof value === 'object' && value !== null) ? value : {};
      
      // 返回一個包含所有必要屬性的玩家對象
      return {
        id: key,
        username: (playerData as Player).username || '',
        avatar: (playerData as Player).avatar || '',
        status: (playerData as Player).status || '',
        chips: (playerData as Player).chips || 0,
        ...playerData // 包含其他可能的屬性
      };
    });
    
    // 根據籌碼從高到低排序
    return playersArray.sort((a, b) => {
      // 將籌碼轉換為數字進行比較
      const chipsA = typeof a.chips === 'string' ? Number(a.chips) : (a.chips || 0);
      const chipsB = typeof b.chips === 'string' ? Number(b.chips) : (b.chips || 0);
      
      // 從高到低排序
      return chipsB - chipsA;
    });
  } catch (error) {
    console.error('處理玩家數據時出錯:', error);
    return [];
  }
});


console.log(props.tournamentData);

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

.players-count {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  text-align: center;
}

.players-list {
  flex: 1;
  overflow-y: auto;
}

.player-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(240, 248, 255, 0.651);
  
  &:last-child {
    border-bottom: none;
  }
}

.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.player-info {
  flex: 1;
}

.player-name {
  font-weight: bold;
  margin-bottom: 3px;
}

.player-status {
  font-size: 0.8rem;
  
  &.active {
    color: #4caf50;
  }
  
  &.eliminated {
    color: #f44336;
  }
  
  &.registered {
    color: #2196f3;
  }
  
  &.waiting {
    color: #ff9800;
  }
}

.player-chips {
  font-weight: bold;
  color: #4d79ff;
}

.no-players {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #aaa;
  font-style: italic;
}
</style>