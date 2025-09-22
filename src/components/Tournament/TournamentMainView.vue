<template>
    <div class="tournament-container p-3">
      <div class="back-button mb-3">
        <router-link to="/select">
          <img class="backImg" src="@/assets/picture/btn-back.png">
        </router-link>
      </div>
      <!-- 錦標賽標題和狀態 -->
      <div class="headerBG">
        <img src="@/assets/picture/框-一般.png">
        <div :class="`tournament-header ${tournamentData?.tournament.base.status}`">
          <div class="tournament-status">
            <div class="statusBox">
              <div :class="`status-dot ${tournamentData?.tournament.base.status}`"></div>
              <span>{{ getTournamentStatusName(tournamentData?.tournament.base.status) }}</span>
            </div>
            <span class="tournament-time" v-if="tournamentData?.tournament.base.remaining_time">{{ tournamentData.tournament.base.remaining_time }}</span>
          </div>
          <div class="tournament-name">{{ tournamentData?.tournament.base.name }}</div>
          <div class="tournament-entry">
            <span class="entry-label">購入</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-coin" viewBox="0 0 16 16">
              <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9H5.5zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518l.087.02z"/>
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zm0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"/>
            </svg>
            <span class="entry-amount">${{ tournamentData?.tournament.base.pot_fee }}</span>
          </div>
        </div>
      </div>
      <!-- 參賽者和獎池信息 -->
      <div class="tournament-info-row space">
        <div class="info-item" @click="$emit('view-players')">
          <div class="info-bg">
            <img src="@/assets/picture/F0_Official_bag 2.png">
          </div>
          <div class="info-label">
            <span class="info-icem">參賽者</span>
            <div class="info-icem">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              </svg>
              <span class="player-count">{{ tournamentData?.tournament.stats.current_players }}/{{ tournamentData?.tournament.base.max_players }}</span>
            </div>
          </div>
        </div>
        <div class="info-item" @click="$emit('view-prizes')">
          <div class="info-bg">
            <img src="@/assets/picture/F0_Official_bag 2.png">
          </div>
          <div class="info-label">
            <span class="info-icem">獎池</span>
            <span class="info-icem">${{ tournamentData?.tournament.stats.total_pot }}</span>
          </div>
        </div>
      </div>

      <!-- 排行榜、細節 -->
      <div class="tournament-info-row space">
        <div class="info-item" @click="$emit('view-rank')">
          <div class="info-bg">
            <img src="@/assets/picture/F0_Official_bag 2.png">
          </div>
          <div class="info-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trophy" viewBox="0 0 16 16">
              <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5q0 .807-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33 33 0 0 1 2.5.5m.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935m10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935M3.504 1q.01.775.056 1.469c.13 2.028.457 3.546.87 4.667C5.294 9.48 6.484 10 7 10a.5.5 0 0 1 .5.5v2.61a1 1 0 0 1-.757.97l-1.426.356a.5.5 0 0 0-.179.085L4.5 15h7l-.638-.479a.5.5 0 0 0-.18-.085l-1.425-.356a1 1 0 0 1-.757-.97V10.5A.5.5 0 0 1 9 10c.516 0 1.706-.52 2.57-2.864.413-1.12.74-2.64.87-4.667q.045-.694.056-1.469z"/>
            </svg>
            <div class="player-count">排行榜</div>
          </div>
        </div>
        <div class="info-item" @click="$emit('view-details')">
          <div class="info-bg">
            <img src="@/assets/picture/F0_Official_bag 2.png">
          </div>
          <div class="info-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
            </svg>
            <div class="player-count">細節</div>
          </div>
        </div>
      </div>

      <!-- 盲注級別 -->
      <div class="tournament-info-row">
        <div class="info-item bg80" @click="$emit('view-blind')">
          <div class="info-bg bg80">
            <img src="@/assets/picture/F1_Official_bag 1.png">
          </div>
          <div class="info-label w-100">
            <div v-if="tournamentData?.tournament.blind_state.big_blind === '0'" class="info-label">
              <span class="info-label">當前盲注</span>
              <span class="text-danger">未開始</span>
            </div>
            <div v-else class="info-label">當前盲注 {{ getBlindState() }}</div>
          </div>
        </div>
      </div>
      
      <!-- 進度條 -->
      <!-- <div class="tournament-info-row">
        <div class="player-progress">
          <div class="progress-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: progressPercentage }"></div>
          </div>
          <div class="progress-text">{{ tournamentData?.tournament.base.current_players }}/{{ tournamentData?.tournament.base.max_players }}</div>
          <div class="next-level" v-if="tournamentData?.tournament.base.next_level_time">
            <i class="fas fa-clock"></i>
            {{ tournamentData.tournament.base.next_level_time }}
          </div>
        </div>
      </div> -->
      
      <!-- 報名按鈕 -->
      <div class="tournament-action" v-if="tournamentData?.user_info.is_registered === false">
        <div class="actionBg" @click="$emit('register')">
          <img src="@/assets/picture/on_enter.png">
        </div>
        <div class="actionText">
          {{ getActionButtonText(tournamentData?.tournament.base.status) }}
        </div>
      </div>
      <div class="tournament-action" v-else>
        <div class="actionBg">
          <img src="@/assets/picture/n_enter.png">
        </div>
        <div class="actionText">
          {{ '已經報名' }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  
  // 定義組件接收的屬性
  const props = defineProps({
    tournamentData: Object
  });
  
  // 定義組件發出的事件
  defineEmits(['view-details', 'view-players', 'view-prizes', 'register','view-blind', 'view-rank']);
  
  // 計算進度百分比
  const progressPercentage = computed(() => {
    if (!props.tournamentData) return '0%';
    
    const current = props.tournamentData.current_players || 0;
    const max = props.tournamentData.max_players || 1;
    return `${(current / max * 100).toFixed(0)}%`;
  });
  
  // 根據狀態碼回傳狀態名稱
  function getTournamentStatusName(status: string): string {
    const statusMap: Record<string, string> = {
      'draft': '創立中',
      'entry': '報名中',
      'ready': '準備中',
      'run_with_entry': '延遲報名',
      'run': '比賽進行中',
      'complete': '已完成',
      'cancel': '已取消',
      'paid': '已派發',
    };
    
    return statusMap[status] || status;
  }
  
  // 根據狀態獲取按鈕文字
  function getActionButtonText(status: string): string {
    const buttonTextMap: Record<string, string> = {
      'draft': '尚未開放',
      'entry': '立即報名',
      'ready': '準備開始中',
      'run_with_entry': '延遲報名',
      'run': '比賽進行中',
      'complete': '已結束',
      'cancel': '已取消',
      'paid': '已派發',
    };
    
    return buttonTextMap[status] || '報名';
  }
  // Method to safely get blind state information
  function getBlindState(): string {
    if (!props.tournamentData || !props.tournamentData.tournament.blind_state) return '';
    const { current_level, small_blind, big_blind } = props.tournamentData.tournament.blind_state;
    return `Lv${current_level} ${small_blind}/${big_blind}`;
  }
  </script>
  
  <style lang="scss">
  .tournament-container {
    display: flex;
    flex-direction: column;
    height: calc(100% - 60px);
  }

  .back-button{
    width: 3rem;

    .backImg{
      width: 100%;
    }
  }

  .headerBG{
    position: relative;
    display: flex;
    width: 100%;

    img{
      width: 100%;
    }
  }
  
  .tournament-header {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 20%;

    img{
      width: 100%;
    }
  }
  
  .tournament-status {
    display: flex;
    justify-content: flex-end;
    padding: 0.5rem 1.5rem 0.5rem 0.5rem;
    align-items: center;
    font-size: 0.9rem;
    margin-bottom: 5px;

    .statusBox{

      display: flex;
      align-items: center;

      .status-dot {
        width: 10px;
        height: 10px;
        background-color: #1cd377;
        border-radius: 50%;
        margin-right: 8px;
        
        &.run_with_entry {
          background-color: #ff4d4d;
        }
        
        &.run {
          background-color: #64b5f6;
        }
        
        &.complete {
          background-color: #b0bec5;
        }
        
        &.cancel {
          background-color: #e0e0e0;
        }
      }
      
    
    }

    .tournament-time {
      margin-left: auto;
    }
    
    
  }
  
  .tournament-name {
    position: absolute;
    top: 25%;
    left: 10%;
    font-size: 1.3rem;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .tournament-entry {
    position: absolute;
    top: 28%;
    right: 6%;
    color: #e0e0e0;
    width: 10rem;
    // display: flex;
    // align-items: center;
    // background-color: rgba(0, 0, 0, 0.3);
    // border-radius: 0.8rem;
    // padding: 5px 15px;
    // width: fit-content;
    background-image: url('@/assets/picture/F2_Official_bag 1.png');
    background-size: cover; /* 背景自動縮放填滿 */
    background-position: center; /* 背景居中 */
    background-repeat: no-repeat; /* 背景不重複 */
    
    .entry-label {
      font-size: 0.9rem;
      margin-right: 5px;
    }
    
    svg {
      margin-right: 5px;
    }
    
    .entry-amount {
      font-weight: bold;
    }
  }
  
  .tournament-info-row {
    display: flex;
    padding: 0.5rem;
    
    &.space {
      justify-content: space-between;
      gap: 0.5rem;
    }
  }
  
  .info-item {
    width: 100%;
    height: 4rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0.5rem;
    // color: rgb(87, 65, 5);
    cursor: pointer;
    transition: background-color 0.2s;
    // background-image: url('@/assets/picture/F0_Official_bag 2.png');
    // background-size: cover; /* 背景自動縮放填滿 */
    // background-position: center; /* 背景居中 */
    // background-repeat: no-repeat; /* 背景不重複 */

    &.bg80{
      justify-content:center;
    }
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.15);
    }
    
    &:active {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }

  .info-bg{
    position: relative;
    width:100%;

    &.bg80{
      width: 80%;
    }

    img{
      width: 100%;
    }
  }
  
  .info-label {
    position: absolute;
    padding: 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    // flex-direction: column;
    height: 3rem;
    font-size: 0.9rem;
  }
  
  .info-value {
    display: flex;
    align-items: center;
  }
  
  .info-icem {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    
    // svg {
    //   margin-right: 5px;
    // }
  }
  
  .player-count, .prize-amount {
    font-weight: bold;
  }
  
  .player-progress {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0 10px;
    
    .progress-bar-container {
      flex-grow: 1;
      height: 8px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      margin-right: 10px;
      overflow: hidden;
    }
    
    .progress-bar {
      height: 100%;
      background-color: #4d79ff;
      border-radius: 4px;
    }
    
    .progress-text {
      margin-right: 10px;
      font-size: 0.9rem;
    }
  }
  
  .tournament-action {
    position: relative;
    width: 100%;
    height: 5rem;
    margin-top:2rem ;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .actionBg{
    position: absolute;
    
    
    img{
      width: 100%;
    }
  }

  .actionText{
    position: absolute;
    color: rgb(233, 195, 24); /* 文字顏色改為黃色 */
    font-size: 24px;
    font-weight: bold; /* 文字粗體 */
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; /* 添加黑色外框效果 */
  }
  
  .register-button {
    width: 100%;
    background-color: #4d79ff;
    color: white;
    border: none;
    border-radius: 25px;
    padding: 15px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #3a66ff;
    }
    
    &:active {
      background-color: #2952cc;
    }
  }

  .register-button.disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  </style>