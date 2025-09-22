<template>
    <div class="tournament-container p-2">
      <!-- 返回按鈕 -->
      <div class="back-button mb-3" @click="$emit('back-to-main')">
        <img class="backImg" src="@/assets/picture/btn-back.png">
      </div>
      <!-- 盲注級別表 -->
      <div class="prizes-list" v-if="tournamentData?.tournament.base.blind_levels && tournamentData.tournament.base.blind_levels.length > 0">
        <div class="prize-item">
          <div class="prize-position">
            <span class="position-number title">級別</span>
            <span class="position-text">盲注</span>
          </div>
          <div class="prize-value">時間</div>
        </div>
        <div class="prize-item" v-for="(blind, index) in tournamentData.tournament.base.blind_levels" :key="index">
          <div class="prize-position">
            <span class="position-number">{{ blind.level }}</span>
            <span class="position-text">{{ blind.small_blind }}/{{ blind.big_blind }}</span>
            <span class="current-level-tag" v-if=" tournamentData.tournament.blind_state.current_level === blind.level">當前級別</span>
          </div>
          <div class="prize-value">{{ blind.duration || 0 }}分鐘</div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const level = ref(0);

const props = defineProps({
    tournamentData: Object
});

// 第一次連接
onMounted(async () => {
  
})

console.log('盲注級別',props.tournamentData);
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
    background-color: rgba(255, 255, 255, 0.1);
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
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        font-weight: bold;
    }

    .position-number.title{
        background-color:#1a1a2e;
        border-radius: 0px;
        width: 2.5rem;
    }

    .position-text {
        font-weight: bold;
        padding-left: 2.5rem;
    }

    .current-level-tag {
        position: relative;
        display: inline-block;
        margin-left: 10px;
        padding: 3px 8px;
        background: linear-gradient(135deg, #4d79ff, #6a5acd);
        color: white;
        font-size: 0.75rem;
        font-weight: bold;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        animation: pulse 1.5s infinite;
        
        &:before {
            content: '';
            position: absolute;
            left: -4px;
            top: 50%;
            transform: translateY(-50%);
            width: 0;
            height: 0;
            border-top: 4px solid transparent;
            border-bottom: 4px solid transparent;
            border-right: 4px solid #4d79ff;
        }
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