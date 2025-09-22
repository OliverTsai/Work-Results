<template>
  <div class="bankBg">
    <div class="mGuildBackBtnBox">
        <img @click="handleLeave()" src="@/assets/picture/btn-back.png">
    </div>
    <!-- 頂部選單 -->
    <div class="header">
        
    </div>

    <!-- 功能選單 -->
    <div class="menu-bar">
      <div class="menu-container">
        <img src="@/assets/picture/btn-chat-bg.png" alt="選項" />
        <div class="menu-items">
          <span :class="{ active: activeTab === 'gift' }" @click="activeTab = 'gift'">贈禮中心</span>
          <!-- <span :class="{ active: activeTab === 'giftCenter' }" @click="activeTab = 'giftCenter'">贈禮中心</span> -->
          <span :class="{ active: activeTab === 'giftRecord' }" @click="activeTab = 'giftRecord'">贈禮紀錄</span>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'gift'" class="bank-bg">
      <img class="bankImage" src="@/assets/picture/IF_frame.png">
      <!-- 用戶資訊 -->
      <div class="user-card">
        <div class="user-info">
          <img class="avatar" :src="avatar" alt="avatar" />
          <div class="user-separately">
            <p class="nickname">{{ name }}</p>
            <button class="info-btn">贈禮說明</button>
          </div>
        </div>
        <p class="bank-balance"><span class="point">$ {{ balance }}</span></p>

        <!-- 可送禮資訊 -->
        <div class="gift-info">
          <div class="giftrow">
            <div>可送禮數量</div>
            <div>0</div>
          </div>
          <div class="giftrow">
            <div>今日可送禮額度</div>
            <div>0</div>
          </div>
          <div class="giftrow">
            <div>今日可贈禮次數</div>
            <div>0</div>
          </div>
          <div class="giftrow">
            <div class="gifButton">
              <p>凍結總額</p>
              <button class="detail">明細</button>
            </div>
            <div>0</div>
          </div>
        </div>
      </div>

      <div class="form">
        <label>收禮玩家</label>
        <select v-model="selectedFriend" class="friend-select">
          <option value="" disabled selected>請選擇收禮玩家</option>
          <option v-for="friend in friends" :key="friend.friendsId" :value="friend">
            {{ friend.nickname }}
          </option>
        </select>
      </div>

      <!-- 贈送金幣 -->
      <div class="form">
        <label>贈送金幣</label>
        <input v-model="giftAmount" type="String" placeholder="請輸入金幣" />
      </div>

      <!-- 手續費 -->
      <p class="fee">手續費：0.00</p>

      <!-- 確認按鈕 -->
      <div class="confirm" @click="handleConfirm">
        <img src="@/assets/picture/Category_NoSelect.png" alt="確認" />
        <div class="confirm-text">確認</div>
      </div>
    </div>
    <!-- 收禮玩家 -->
    

    <!-- 贈禮中心頁面 -->
    <!-- <div v-if="activeTab === 'giftCenter'" class="gift-center">
      <div class="section-title">贈禮中心</div>
      <div class="gift-items">
        <div class="gift-item" v-for="(item, index) in giftItems" :key="index">
          <img :src="item.image" alt="禮物圖片" class="gift-image" />
          <div class="gift-name">{{ item.name }}</div>
          <div class="gift-price">{{ item.price }} 點</div>
          <button class="gift-buy-btn">購買</button>
        </div>
      </div>
    </div> -->

    <!-- 贈禮紀錄頁面 -->
    <div v-if="activeTab === 'giftRecord'" class="gift-record">
      <div class="section-title">
        <div>全部</div>
        <div>送禮</div>
        <div>收禮</div>
      </div>
      <div class="record-list">
        <div class="record-item" v-for="(record, index) in giftRecords" :key="index">
          <div class="record-date">{{ record.date }}</div>
          <div class="record-info">
            <div>贈送對象：{{ record.recipient }}</div>
            <div>贈送金額：<span class="record-amount">{{ record.amount }}</span> 點</div>
            <div>狀態：<span :class="record.status === '成功' ? 'status-success' : 'status-pending'">{{ record.status }}</span></div>
          </div>
        </div>
        <div v-if="giftRecords.length === 0" class="no-records">
          暫無贈禮紀錄
        </div>
      </div>
    </div>
  </div>
  <img class="bank-background" src="../assets/picture/store-background.png">
  <img class="bank-background second" src="../assets/picture/bank-bg.png">
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { backendApi,playerApi } from '@/composables/useApi';

interface Friend {
  friendsId: string;
  username: string;
  nickname: string;
  created_at: string;
  updated_at: string;
  avatar: string;
  guild_name: string;
  position: number;
}

const router = useRouter();

const token = ref(localStorage.getItem("token") || "");
const member = ref(localStorage.getItem("member") || "");

const friends = ref<Friend[]>([]);
const selectedFriend = ref<Friend | null>(null);
const giftAmount = ref<String | null>(null);

const avatar = ref<string | undefined>('')
const name = ref('mAboutView');
const lv = ref(50);
const balance = ref(0);
const character = ref("魔法師");
const activeTab = ref('gift'); // 預設顯示贈禮頁面

// 確認按鈕點擊事件
const handleConfirm = () => {

  const uid = getUuid();
  const timeStr = getTime();

  if (selectedFriend.value && giftAmount.value) {
    transferMoney(uid,selectedFriend.value.username,giftAmount.value.toString(),timeStr);
    console.log(uid,selectedFriend.value.username, giftAmount.value);
  } else {
    // 可以在這裡添加提示，告知用戶需要選擇好友和輸入金幣數量
    console.log('請選擇收禮玩家並輸入贈送金幣數量');
  }
};

//根據現在的時間戳新增UUID
const getUuid = () => {
  // 標準UUID v4格式
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Date.now() + Math.random() * 16) % 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

//時間戳轉字串
const getTime = () =>{
  return Math.floor(Date.now() / 1000).toString();
}

// 贈禮中心示例數據
const giftItems = ref([
  { name: '禮物1', price: 100, image: 'https://via.placeholder.com/80' },
  { name: '禮物2', price: 200, image: 'https://via.placeholder.com/80' },
  { name: '禮物3', price: 300, image: 'https://via.placeholder.com/80' },
  { name: '禮物4', price: 500, image: 'https://via.placeholder.com/80' },
]);

// 贈禮紀錄示例數據
const giftRecords = ref([
  { date: '2025-08-28', recipient: '玩家A', amount: 1000, status: '成功' },
  { date: '2025-08-27', recipient: '玩家B', amount: 500, status: '處理中' },
  { date: '2025-08-26', recipient: '玩家C', amount: 2000, status: '成功' },
]);

// 離開按鈕點擊事件
const handleLeave = () => {
  router.push("/hall");
};

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
      character.value = data.data.character;

    } else {
      console.error('獲取個人資料失敗:', response.statusText);
    }
  } catch (error) {
    console.error('獲取個人資料時發生錯誤:', error);
    return null;
  }
}

//獲取好友名單(送禮名單)
const getMyFriends = async () => {
  const url = playerApi('/api/v1/game/user/friends');
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${member.value}`,
      }
    });
    if (response.ok) {
      const data = await response.json();
      friends.value = data.data;
      console.log('好友列表資料',friends.value);
    } else {
      console.error('獲取好友列表失敗:', response.statusText);
    }
  } catch (error) {
    console.error('獲取好友訊息時發生錯誤:', error);
    return null;
  }
}

//查詢餘額
// const getMyMoney = async () => {
//   const url = playerApi('/api/v1/game/wallet/balance?coin=POINT');
//   try {
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${member.value}`,
//         // 'Content-Type': 'application/json'
//       },
//     });
//     if (response.ok) {
//       const data = await response.json();
//       balance.value = data.data.balance_available
      
//       console.log('餘額資料',data.data.balance_available);
//       localStorage.setItem('balance', balance.value.toString());

//     } else {
//       console.error('獲取餘額資料失敗:', response.statusText);
//     }
//   } catch (error) {
//     console.error('獲取餘額資料時發生錯誤:', error);
//     return null;
//   }
// }

//轉送金幣
const transferMoney = async (
  request_id:string,
  to_username:string,
  trans_value:string,
  timestamp:string
) => {
  const url = playerApi('/api/v1/game/wallet/transfer');
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${member.value}`,
        'Content-Type': 'application/json'
      },
      body:JSON.stringify({
        "request_id": request_id,
        "to_username": to_username,
        "trans_type": "TRANS_TYPE_POINTS_TRANSFER",
        "trans_value": trans_value,
        "timestamp": timestamp,
        "coin": "POINT",
      })
    });
    if (response.ok) {
      const data = await response.json();

      balance.value = data.data.balance;
      localStorage.setItem('balance', balance.value.toString());
      console.log('轉移金幣',data);

    } else {
      console.error('獲取餘額資料失敗:', response.statusText);
    }
  } catch (error) {
    console.error('獲取餘額資料時發生錯誤:', error);
    return null;
  }
} 

onMounted(() => {
  // getMyMoney();
  getUserData();
  getMyFriends();
  console.log("轉點畫面...");
});
</script>

<style lang="scss">
.bankBg {
  width: 100%;
  height: 100vh;
  padding: 1rem 3rem;
  overflow-y: auto;
  font-family: "Arial", sans-serif;
  z-index: 2;
}

.bank-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 0;
  object-fit: cover;
}

.bank-background.second{
  z-index: 1;
}

/* 頂部選單 */
.header {
    display: flex;
    /* justify-content: space-between; */
    align-items: center;
    height: 4rem;
}
.header h2 {
    font-size: 1.2rem;
}
.header button {
    background: none;
    border: none;
    font-size: 1.2rem;
}

/* 功能選單 */
.menu-bar {
  display: flex;
  justify-content: center;
  width: 100%;
}

.menu-container {
  position: relative;
  width: 77%;
}

.menu-container img {
  width: 100%;
  height: auto;
}

.menu-items {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 3;
}

.menu-bar span {
  z-index: 3;
  color: #ffffff;
  padding: 0.4rem 0.4rem;
  cursor: pointer;
  background-image: url('@/assets/picture/Category_NoSelect.png');
  background-size: cover; /* 背景自動縮放填滿 */
  background-position: center; /* 背景居中 */
  background-repeat: no-repeat; /* 背景不重複 */
}
.menu-bar .active {
  background-image: url('@/assets/picture/Category_Select.png');
  background-size: cover; /* 背景自動縮放填滿 */
  background-position: center; /* 背景居中 */
  background-repeat: no-repeat; /* 背景不重複 */
  // font-weight: bold;
  // border-bottom: 2px solid yellow;
}

.bank-bg{
  position: relative;
  width: 100%;
  // padding: 0 3rem;
}

.bankImage{
  width: 100%;
  object-fit: cover;
}

/* 用戶資訊 */
.user-card {
  position: absolute;
  width: 100%;
  top: 2rem;
  left: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 0 1rem;
}
.user-info {
  width: 100%;
  display: flex;
  align-items: center;

  .user-separately{
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
}
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}
.nickname {
  color: #ffffff;
  font-size: 0.9rem;
  margin: 0;
}
.bank-balance {
  font-size: 0.9rem;
  margin: 0;
  width: 100%;
  text-align:center;
}
.point {
  font-size: 26px;
  font-weight: bold;
  color: orange;
}
.info-btn {
  background: #eee;
  border: none;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 0.8rem;
}

/* 可送禮資訊 */
.gift-info {
  width: 100%;
  font-size: 0.9rem;
  color: #ffffff;

  
}
.gift-info .giftrow {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;

  .gifButton{
    display: flex;
    white-space: nowrap;
  }
}

.detail {
  width: 100%;
  height: 100%;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin: 0 5px;
  font-size: 0.8rem;
}

/* 表單 */
.form {
  display: flex;
  flex-direction: column;
  margin: 10px 0;
}
.form label {
  font-size: 0.85rem;
  margin-bottom: 4px;
}
.form input {
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 0.9rem;
}

/* 手續費 */
.fee {
    text-align: center;
    font-size: 0.6rem;
    margin: 10px 0;
}

/* 確認按鈕 */
.confirm {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  border: none;
  width: 100%;
  height: 2.2rem;
  font-size: 1rem;

  img{
    position: absolute;
    height: 100%;
  }

  .confirm-text{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

/* 贈禮中心樣式 */
.gift-center {
    margin-top: 10px;
}

.section-title {
  display: flex;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 15px;
  gap: 1rem;
}

.gift-items {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
}

.gift-item {
    background: white;
    border-radius: 10px;
    padding: 12px;
    text-align: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.gift-image {
    width: 80px;
    height: 80px;
    margin-bottom: 10px;
}

.gift-name {
    font-size: 0.9rem;
    margin-bottom: 5px;
}

.gift-price {
    font-weight: bold;
    color: #ff6600;
    margin-bottom: 10px;
}

.gift-buy-btn {
    background: #1e90ff;
    color: white;
    border: none;
    border-radius: 15px;
    padding: 5px 15px;
    font-size: 0.85rem;
}

/* 贈禮紀錄樣式 */
.gift-record {
    margin-top: 10px;
}

.record-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.record-item {
    background: white;
    border-radius: 10px;
    padding: 12px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.record-date {
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 8px;
}

.record-info {
    font-size: 0.9rem;
    line-height: 1.6;
}

.record-amount {
    color: #ff6600;
    font-weight: bold;
}

.status-success {
    color: green;
}

.status-pending {
    color: orange;
}

.no-records {
    text-align: center;
    padding: 20px;
    color: #666;
    font-style: italic;
}

/* ========= RWD ========= */
@media (max-width: 480px) {
    .header h2 {
        font-size: 1rem;
    }
    .menu-bar {
        font-size: 0.8rem;
        padding: 6px;
    }
    .user-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
    .avatar {
        width: 40px;
        height: 40px;
    }
    .confirm {
        font-size: 0.9rem;
        padding: 10px;
    }
    .gift-items {
        grid-template-columns: 1fr;
    }
}
</style>