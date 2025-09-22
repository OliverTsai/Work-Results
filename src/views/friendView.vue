<template>
  <div class="friend-page">
    <img class="friend-background" src="../assets/picture/store-background.png">
    <img class="friend-background second" src="../assets/picture/friend-bg.png">
    <div class="friendBackBtnBox">
      <img @click="handleLeave()" src="@/assets/picture/btn-back.png">
    </div>

    <!-- 搜尋與新增好友區塊 -->
    <div class="friend-actions">
      <div class="search-section">
        <div class="input-group custom-input-group">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="人名輸入" 
            class="form-control"
            @keyup.enter="searchFriends"
          >
        </div>
        <div class="input-group-append">
          <button class="btn custom-search-btn" @click="searchFriends">
            <i class="fas fa-search"></i> 搜尋
          </button>
        </div>
      </div>
    </div>

    <!-- 搜尋結果區塊 -->
    <div v-if="isSearch" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-header">
            <h2>搜尋結果</h2>
            <button class="modal-close-btn" @click="closeSearchModal">&times;</button>
          </div>
          <div class="modal-body">
            <div v-if="searchResults.length > 0" class="friend-list">
              <div v-for="(user, index) in searchResults" :key="index" class="friend-card select">
                <div class="friend-avatar">
                  <img :src="user.avatar" alt="">
                </div>
                <div class="friend-info">
                  <p>{{ user.nickname }}</p>
                  <p>ID: {{ user.username }}</p>
                </div>
                <div class="">
                  <button 
                    class="btn myColor" 
                    @click="addFriendById(user.username)"
                  >
                    {{ '加入' }}
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="empty-search-results">
              <div class="empty-icon">
                <i class="fas fa-search"></i>
              </div>
              <p>沒有找到符合條件的用戶</p>
            </div>
          </div>
          <!-- <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeSearchModal">關閉</button>
          </div> -->
        </div>
      </div>
    </div>

    <!-- 好友列表區塊 -->
    <div class="friend-list-section">
      <div class="section-header">
        <h2>我的好友 ({{ friends.length }})</h2>
        <div class="list-actions">
          <button class="btn btn-outline-primary" @click="refreshFriendList">
            <i class="fas fa-sync-alt"></i> 刷新
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-indicator">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only"></span>
        </div>
        <p>載入中...</p>
      </div>

      <div v-else-if="friends.length === 0" class="empty-list">
        <div class="empty-icon">
          <i class="fas fa-user-friends"></i>
        </div>
        <p>您目前沒有好友</p>
        <p class="empty-tip">使用上方的搜尋功能來尋找並添加好友</p>
      </div>

      <div v-else class="friend-list-container">
        <div class="friend-list">
          <div v-for="friend in friends" :key="friend.friendsId" class="friend-card">
            <div class="box">
              <div class="friend-avatar">
                <!-- <div class="status-indicator" :class="{ 'online': friend.isOnline }"></div> -->
                <img :src="friend.avatar" alt="頭像">
              </div>
              <div class="friend-info">
                <h3>{{ friend.nickname }}</h3>
                <h4>ID: {{ friend.username }}</h4>
                <!-- <p class="status">{{ friend.isOnline ? '在線' : '離線' }}</p> -->
              </div>
            </div>
            <div class="">
              <button class="btn smileLeft" @click="">
                <i class="fas fa-user-minus"></i> 密語
              </button>
              <button class="btn smileRight" @click="confirmRemoveFriend(friend)">
                <i class="fas fa-user-minus"></i> 移除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 移除好友確認彈窗 -->
    <div class="modal fade" id="removeFriendModal" tabindex="-1" role="dialog" aria-labelledby="removeFriendModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="removeFriendModalLabel">確認移除好友</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body" v-if="selectedFriend">
            <p>您確定要移除 <strong>{{ selectedFriend.nickname }}</strong> 從您的好友列表嗎？</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">取消</button>
            <button type="button" class="btn btn-danger" @click="removeFriend">確認移除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { playerApi } from '@/composables/useApi';

const router = useRouter();

const token = ref(localStorage.getItem("token") || "");
const member = ref(localStorage.getItem("member") || "");
const name = ref(localStorage.getItem("name") || "");

const isSearch = ref(false);

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

interface SearchResult {
  avatar: string;
  created_at: string;
  guild_name: string;
  nickname: string;
  position: number;
  updated_at: string;
  username: string;
}

//狀態變數
const friends = ref<Friend[]>([]);

const searchResults = ref<SearchResult[]>([]);

const searchQuery = ref('');
const newFriendId = ref('');
const loading = ref(false);


const selectedFriend = ref<Friend | null>(null);

const closeSearchModal = () => {
  isSearch.value = false;
};

// 離開按鈕點擊事件
const handleLeave = () => {
  router.push("/hall");
};

// UI 功能 - 不實際調用 API
const searchFriends = () => {
  console.log('搜尋好友:', searchQuery.value);
  // 這裡可以設置 loading 狀態來模擬搜尋過程
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    searchFriendApi();  // 呼叫搜尋 API
    // 顯示搜尋結果 (已經預設了)
    isSearch.value = true;
  }, 500);
};

const addFriend = () => {
  console.log('新增好友:', newFriendId.value);
  alert('功能尚未實現');
  newFriendId.value = '';
};

const addFriendById = (id: string) => {
  console.log('通過ID新增好友:', id);
  addFriendApi(id);
  isSearch.value = false;
};

const confirmRemoveFriend = (friend: any) => {
  selectedFriend.value = friend;
  console.log('確認移除好友:', friend.nickname);
  removeFriend();
};

const removeFriend = () => {
  if (selectedFriend.value) {
    console.log('移除好友:', selectedFriend.value.nickname);
    removeFriendApi(selectedFriend.value.friendsId);
    selectedFriend.value = null;
  }
};

const refreshFriendList = () => {
  console.log('刷新好友列表');
  loading.value = true;
  setTimeout(() => {
    getMyFriends();
    loading.value = false;
  }, 500);
};

// 模擬組件掛載時的數據加載
onMounted(() => {
  getMyFriends();
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 500);
});

//獲得我的好友列表
async function getMyFriends() {
  try {
    const url = playerApi("/api/v1/game/user/friends");
    const response = await fetch(url, {
      method: "GET",
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
    console.error('獲取好友列表時出錯:', error);
  }
}

//搜尋好友
async function searchFriendApi() {

  if (!searchQuery.value) {
    alert('請輸入搜尋關鍵字');
    return;
  }

  try {
    const url = playerApi(`/api/v1/game/user/search?q=${searchQuery.value}`);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${member.value}`,
        'Content-Type': 'application/json'
      },
    });
    if (response.ok) {
      const data = await response.json();
      searchResults.value = data.data.users;
      console.log('搜尋結果', data);
    } else {
      console.error('搜尋好友失敗:', response.statusText);
    }
  } catch (error) {
    console.error('搜尋好友時出錯:', error);
  }
}

//添加好友
async function addFriendApi(username: string) {
  try {
    const url = playerApi(`/api/v1/game/user/friends`);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${member.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        "username": username,
        "auto-join": 1
      })
    });
    if (response.ok) {
      const data = await response.json();
      console.log('新增好友成功', data);
      // 重新獲取好友列表
      getMyFriends();
    } else {
      console.error('新增好友失敗:', response.statusText);
    }
  } catch (error) {
    console.error('新增好友時出錯:', error);
  }
}

//刪除好友
async function removeFriendApi(id: string) {
  try {
    const url = playerApi(`/api/v1/game/user/friends/${id}`);
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${member.value}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.ok) {
      const data = await response.json();
      console.log('刪除好友成功', data);
      // 重新獲取好友列表
      getMyFriends();
    } else {
      console.error('刪除好友失敗:', response.statusText);
    }
  } catch (error) {
    console.error('刪除好友時出錯:', error);
  }
}

</script>

<style scoped>
.friend-page {
  display: flex;
  flex-direction: column;
  padding: 20px;
  width: 100%;
  height: 100vh; /* 設置高度為視窗高度 */
  overflow-y: auto; 
  position: relative; /* 確保定位正確 */
}

.friend-background{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  object-fit: cover;
}

.friend-background.second{
  z-index: 1;
}

.friendBackBtnBox {
  position: absolute;
  left: 20px;
  top: 20px;
  cursor: pointer;
  z-index: 10;
}

.friendBackBtnBox img {
  width: 40px;
  height: 40px;
}

.friend-header {
  margin-bottom: 30px;
  text-align: center;
}

.friend-header h1 {
  font-size: 2rem;
  color: #333;
}

.friend-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 20px;
  margin-top: 4rem;
  z-index: 8;
}

.search-section, .add-friend-section {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 250px;
}

.custom-input-group {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(116, 85, 2, 0.966);
  width: auto;
  height: 2.5rem;
}

.custom-input {
  border: 3px solid #ffb74d; /* 橙色框線 */
  border-radius: 20px; /* 增大圓角 */
  padding: 12px 20px;
  font-size: 1rem;
  transition: all 0.3s;
  flex: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.9);
}

.custom-input:focus {
  border-color: #ff9800; /* 聚焦時的框線顏色 */
  box-shadow: 0 0 0 4px rgba(255, 152, 0, 0.25);
  outline: none;
}

.custom-search-btn {
  background-color: #91772f; 
  border: none;
  color: white;
  /*padding: 12px 25px;*/
  font-weight: 600;
  border-radius: 20px; /* 增大圓角 */
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.custom-search-btn:hover {
  background-color: #f57c00; /* 滑鼠懸停時的顏色 */
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.custom-search-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.custom-search-btn:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(255, 152, 0, 0.25);
}
.search-results {
  margin-bottom: 30px;
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-results h2 {
  margin-bottom: 15px;
  font-size: 1.5rem;
  color: #333;
}

.friend-list-section {
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 26rem; /* 設定固定高度 */
  z-index: 8;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
  font-weight: 700;
}

.friend-list-container {
  flex: 1;
  overflow-y: auto; /* 啟用垂直滾動 */
  padding-right: 5px; /* 為滾動條預留空間 */
  z-index: 10;
}

.friend-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.friend-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: linear-gradient(to bottom, #225957 0%, #183A40 100%);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;

  .box{
    display: flex;
    align-items: center;
    gap: 1rem;
  }
}

.friend-card.select{
  background: linear-gradient(to bottom, #BABABA 0%, #979797 100%);
  color: #4A3226;
  justify-content: center;
  gap: 0.5rem;
}

.btn.myColor{
  background-color: #5E4F24;
  color: #fff;
}

.btn.smileLeft {
  background-color: #5E4F24;
  color: #fff;
  padding: 3px;
  font-size: 0.9rem;
}

.btn.smileRight {
  background-color: #9B3856;
  color: #fff;
  padding: 3px;
  font-size: 0.9rem;
}

.friend-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.friend-avatar {
  position: relative;
}

.friend-avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ccc;
  border: 2px solid #f8f9fa;
}

.status-indicator.online {
  background-color: #28a745;
}

.friend-info h3 {
  font-size: 0.8rem;
  color: #EEE5C6;
}

.friend-info h4 {
  font-size: 0.5rem;
  color: #EEE5C6;
}

.friend-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #4A3226;
}

.friend-info .status {
  font-weight: 500;
  color: #6c757d;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
}

.loading-indicator p {
  margin-top: 10px;
  color: #6c757d;
}

.empty-list {
  text-align: center;
  padding: 40px 0;
  color: #6c757d;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #dee2e6;
}

.empty-tip {
  font-size: 0.9rem;
  max-width: 300px;
  margin: 10px auto 0;
}

@media (max-width: 768px) {
  .friend-actions {
    flex-direction: column;
  }
  
  .friend-list {
    grid-template-columns: 1fr;
  }
}

/* 自定義滾動條樣式 */
.friend-list-container::-webkit-scrollbar {
  width: 6px;
}

.friend-list-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.friend-list-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.friend-list-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 模態框樣式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(22, 6, 66, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  animation: modalFadeIn 0.3s;
  background-color:rgba(22, 6, 66, 0.5);
}

.modal-content {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  border: 0.2rem solid #ebc700;
  height: 26rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color:rgba(22, 6, 66, 0.5);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #a0790c;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #a0790c;
  padding: 0;
  line-height: 1;
}

.modal-close-btn:hover {
  color: #343a40;
}

.modal-body {
  padding: 20px;
  max-height: 50vh;
  overflow-y: auto;
  background-color:rgba(22, 6, 66, 0.5);
}

.modal-footer {
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.empty-search-results {
  text-align: center;
  padding: 30px 0;
  color: #6c757d;
}

.empty-search-results .empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #dee2e6;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>