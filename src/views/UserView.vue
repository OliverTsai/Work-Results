<template>
  <div class="mUserBg">
    <div class="userBackBtnBox">
      <img @click="handleLeave()" src="@/assets/picture/btn-back.png">
    </div>
    <div class="userSpace p-1">
      <div class="avatar-container">
        <img src="@/assets/picture/Player_frame.png" class="avatar-frame">
        <img :src="avatar" class="avatar-image rounded-circle" width="100">
      </div>
      <div class="balance-container">
        <img src="@/assets/picture/IF_frame.png" class="balance-image">
        <span class="balance-text">
          <div>名稱:{{ name }}</div>
          <div>金幣:{{ balance }}</div>
          <div>等級:{{ lv }}</div>
          <div>屬性:{{ '??' }}</div>
        </span>
      </div>
      <div class="dataList-container">
        <div class="userButtonBg" @click="jumpRouter('/play_log')">
          <img class="userButtonImg" src="@/assets/picture/Category_NoSelect.png">
          <div class="userButtonText">紀錄</div>
        </div>
        <div class="userButtonBg" @click="jumpRouter('/guild')">
          <img class="userButtonImg" src="@/assets/picture/Category_NoSelect.png">
          <div class="userButtonText">公會</div>
        </div>
      </div>
      <!-- <div class="cacheSpace">
        <ClearCache />
      </div> -->
    </div>
  </div>
</template>

<script setup>

import { ref ,onMounted ,watch ,computed } from 'vue'
import ClearCache from '@/components/ClearCache.vue'
import { useWebSocketStore } from "@/store/websocketStore";
import { useRouter } from 'vue-router'
import { playerApi } from '@/composables/useApi';

const wsStore = useWebSocketStore();
const token = ref(localStorage.getItem("token") || "");
const member = ref(localStorage.getItem("member") || "");
const router = useRouter();

const avatar = ref(null)
const name = ref('mAboutView');
const lv = ref(50);
const balance = ref(0);

// 使用 computed 來確保 `isConnected`,`messages` 是響應式的
const isConnected = computed(() => wsStore.isConnected);
const messages = computed(() => wsStore.messages);

// 監聽 WebSocket 是否連線
watch(isConnected, (newVal) => {
  if (newVal) {
    console.log('WebSocket 個人頁面已連線，開始訂閱');
    if (token.value) {
      wsStore.resubscribeToUser(token.value);
    } else {
      console.warn('沒有可用的 token，無法訂閱');
    }
  }
}, { immediate: true });

// 監聽 WebSocket 訊息
watch(messages, (msg) => {
  if (!msg) return;  // 避免 msg 為 null
  try {
    const data = msg;
    
    if (data.event === "user_balance_update") {
      balance.value = data.balance //推送的金幣
      localStorage.setItem('balance', balance.value);
    }
  } catch (e) {
    console.error("解析 WebSocket 訊息時發生錯誤:", e);
  }
});

// 離開按鈕點擊事件
const handleLeave = () => {
  router.push("/hall");
}

//跳轉事件
const jumpRouter = (seat) => {
  router.push(seat);
}

//獲取用戶資料
const getUserData = async () => {
  const url = playerApi('/api/v1/game/user/profile');
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${member.value}`,
        // 'Content-Type': 'application/json'
      },
    });
    if (response.status === 401) {
      // 如果是 401 錯誤，跳轉到登入頁面
      console.error('認證失敗，跳轉到登入頁面');
      localStorage.setItem('token', "");
      router.push('/login_line');
    }
    if (response.ok) {
      const data = await response.json();
      avatar.value = data.data.avatar;
      name.value = data.data.nickname;
      lv.value = data.data.level;
      balance.value = data.data.balance;

    } else {
      console.error('獲取個人資料失敗:', response.statusText);
    }
  } catch (error) {
    console.error('獲取個人資料時發生錯誤:', error);
    return null;
  }
}

// 第一次連接
onMounted(async () => {
  getUserData();
})

</script>

<style lang="scss">

.mUserBg{
  position: relative;
  background-image: url('@/assets/picture/frame.png');
  height: 100vh;
  width: 100%;
  background-color: #DED2BD;
  color: #ffffff;
  background-size: cover; /* 背景自動縮放填滿 */
  background-position: center; /* 背景居中 */
  background-repeat: no-repeat; /* 背景不重複 */
}

.cacheSpace{
    position: absolute;
    bottom: 0;
    right: 50%;
    transform: translateX(50%);
    z-index: 1000; /* 確保清除快取按鈕在最上層 */
}

.userBackBtnBox{
    position: absolute;
    top: 4rem;
    left: 0.3rem;
    cursor: pointer;
    width: 3rem;
    height: 3rem;
    z-index: 10;

    img{
        width: 100%;
        height: 100%;
    }
}

.userSpace{
  position: absolute;
  top:50%;
  left: 50%;
  width: 100%;
  height: 80%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction:column;
  align-items: center;
  gap: 1rem;

  .avatar-container {
    position: relative;
    display: inline-block;
    width: fit-content;
    height: fit-content;

    .avatar-frame {
      width: 9rem;
      position: absolute;
      top: -9%;
      left: -19%;
      z-index: 1; 
    }

    .avatar-image {
      width: 6.5rem;
      position: relative;
      z-index: 2; /* 確保頭像在上層 */
    }
  }

  .balance-container{
    position: relative;
    display: inline-block;
    width: 75%;

    .balance-image{
      width: 100%;
    }

    .balance-text {
      position: absolute;
      top: 46%; /* 垂直居中 */
      left: 55%; /* 水平居中 */
      transform: translate(-50%, -50%); /* 精確居中 */
      width: 100%;
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.7);
    }
  }

  .dataList-container{
    display: flex;
    justify-content: space-evenly;
    gap: 1rem;
    width: 80%;
    text-align: center;

    // div{
    //   background-color: rgba(255, 255, 255, 0.1);
    //   padding: 0.5rem;
    //   border-radius: 5px;
    //   font-size: 1.2rem;
    //   font-weight: bold;
    // }
  }
}

.userButtonBg{
  position: relative;
  width: 5rem;
  height: 3rem;
  cursor: pointer;

  .userButtonImg{
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  .userButtonText{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    text-align: center;
    font-weight: bold;
    color: #ffffff;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
    z-index: 2;
  }
}

.propertySpace{
    position: relative;
    display: inline-block;
    top:57%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;

    .titleText{
        position: absolute;
        width: 100%;
        display: flex;
        justify-content: space-around;
        top: 34%;
        left: 0;
        padding-inline: 2.5rem;
        
        button{
            background-color: transparent;
            border: none;
            color: #ffffff;
            font-size: 1.2rem;
            font-weight: bold;
            cursor: pointer;
            transition: color 0.3s ease; /* 添加平滑的顏色變化效果 */
        }

        button:active{
            color: #fa2c37; /* 點擊時的顏色 */
        }
    }
}

</style>