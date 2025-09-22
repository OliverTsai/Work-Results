<template>
  <div class="chat-container">
    <div class="chatBag">
      <div class="chat-header">
        <img src="@/assets/picture/btn-chat-bg.png" class="chatTitle" />
        <div class="chatTitleButton">
          <!-- <button>全部</button> -->
          <div @click="changeTab('general')" class="tab-button" :class="{ 'active': activeTab === 'general' }">
            <img v-if="activeTab === 'general'" class="buttonImg" src="@/assets/picture/Category_Select.png" />
            <img v-else class="buttonImg" src="@/assets/picture/Category_NoSelect.png">
            <span class="buttonText">一般</span>
          </div>
          <div @click="changeTab('guild')" class="tab-button" :class="{ 'active': activeTab === 'guild' }">
            <img v-if="activeTab === 'guild'" class="buttonImg" src="@/assets/picture/Category_Select.png" />
            <img v-else class="buttonImg" src="@/assets/picture/Category_NoSelect.png">
            <span class="buttonText">公會</span>
          </div>
          <div @click="changeTab('system')" class="tab-button" :class="{ 'active': activeTab === 'system' }">
            <img v-if="activeTab === 'system'" class="buttonImg" src="@/assets/picture/Category_Select.png" />
            <img v-else class="buttonImg" src="@/assets/picture/Category_NoSelect.png">
            <span class="buttonText">系統</span>
          </div>
          <div @click="changeTab('private')" class="tab-button" :class="{ 'active': activeTab === 'private' }">
            <img v-if="activeTab === 'private'" class="buttonImg" src="@/assets/picture/Category_Select.png" />
            <img v-else class="buttonImg" src="@/assets/picture/Category_NoSelect.png">
            <span class="buttonText">私人</span>
          </div>
        </div>
        <!-- 新增全屏按鈕 -->
        <div class="fullscreen-button" @click="openFullscreenModal">
          <!-- <i class="fas fa-expand"></i> -->
           <img src="@/assets/picture/btn-expand.png"/>
        </div>
        <div class="friendList" v-if="activeTab === 'private'">
          <img src="@/assets/picture/Category_NoSelect.png" class="friendImg" @click="toggleFriendDropdown">
          <span v-if="friend" class="friendText">{{ friend.nickname }}</span>
          <span v-else class="friendText">好友列表</span>
          <!-- 好友下拉選單 -->
          <div v-if="showFriendDropdown" class="friend-dropdown">
            <div v-if="friends.length > 0">
              <div v-for="friend in friends" :key="friend.friendsId" class="friend-item" @click="selectFriend(friend)">
                {{ friend.nickname }}
              </div>
            </div>
            <div v-else class="friend-item no-friends">
              暫無好友
            </div>
          </div>
        </div>
      </div>
      <div class="chat-messages" ref="messagesContainer">
        <div v-for="(message, index) in messagesList" :key="index"  class="message-item" :class="{ 'message-item my-message': message.sender === username }">
          <div v-if="message.type === 'private'" class="message-item" :class="{ 'message-item my-message': message.sender === username }">
            <div v-if="message.sender === friend?.username || message.receiver === friend?.username">
              <div v-if="message.sender !== username" class="message-sender">
                {{ message.sender_nickname }}:
              </div>
              <div class="message-content">
                {{ message.content }}
              </div>
              <div class="message-time">
                {{ formatTime(message.created_at) }}
              </div>
            </div>
          </div>
          <div v-else class="message-item" :class="{ 'message-item my-message': message.sender === username }">
            <div v-if="message.sender !== username" class="message-sender">
              {{ message.sender_nickname }}:
            </div>
            <div class="message-content">
              {{ message.content }}
            </div>
            <div class="message-time">
              {{ formatTime(message.created_at) }}
            </div>
          </div>
        </div>
      </div>
      <div class="inputArea">
        <img class="input-wrapper" src="../assets/picture/chat-insert.png">
        <input v-model="newMessage" type="text" class="inputTXT" placeholder="輸入訊息" />
        <img class="inputButton" @click="addMessage" src="../assets/picture/btn-submit.png">
      </div>
    </div>
    
    <!-- 全屏模態框 -->
    <div v-if="showFullscreenModal" class="fullscreen-modal">
      <div class="fullscreen-modal-content">
        <div class="fullscreen-modal-header">
          <div></div>
          <h3>聊天室</h3>
          <img src="../assets/picture/btn-back.png" class="close-button" @click="closeFullscreenModal">
        </div>
        <div class="fullscreen-modal-body">
          <div class="fullscreen-messages">
            <div v-for="(message, index) in messagesList" :key="index" class="message-item" :class="{ 'my-message': message.sender === username }">
              <div v-if="message.type === activeTab">
                <div v-if="message.sender !== username" class="message-sender">
                  {{ message.sender_nickname }}:
                </div>
                <div class="message-content">
                  {{ message.content }}
                </div>
                <div class="message-time">
                  {{ formatTime(message.created_at) }}
                </div>
              </div>
            </div>
          </div>
          <!-- <div class="fullscreen-input-area">
            <input v-model="fullscreenMessage" type="text" class="fullscreen-input" placeholder="輸入訊息" />
            <div class="fullscreen-send-button" @click="sendFullscreenMessage">發送</div>
          </div> -->
          <div class="inputArea">
            <img class="input-wrapper" src="../assets/picture/chat-insert.png">
            <input v-model="newMessage" type="text" class="inputTXT" placeholder="輸入訊息" />
            <img class="inputButton" @click="addMessage" src="../assets/picture/btn-submit.png">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { backendApi,playerApi } from '@/composables/useApi';
import { useWebSocketStore } from "@/store/websocketStore";

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
const wsStore = useWebSocketStore();
const newMessage = ref<string>('');
const fullscreenMessage = ref<string>(''); // 全屏模式下的消息
const token = ref(localStorage.getItem("token") || "");
const username = ref(localStorage.getItem("name") || "");
const member = ref(localStorage.getItem("member") || "");
const messagesList = ref<any[]>([]); // 儲存所有訊息
const activeTab = ref('general'); // 當前選中的標籤
const showFullscreenModal = ref(false); // 控制全屏模態框顯示

//狀態變數
const friends = ref<Friend[]>([]);
const showFriendDropdown = ref(false);

//好友
const friend = ref<Friend>();

// 使用 computed 來確保 `isConnected`,`messages` 是響應式的
const isConnected = computed(() => wsStore.isConnected);
const messages = computed(() => wsStore.messages);

// 監聽 WebSocket 是否連線
watch(isConnected, (newVal) => {
  if (newVal) {
    console.log('WebSocket聊天室已連線，開始訂閱');
    if (token.value) {
    wsStore.resubscribeChat(token.value,activeTab.value);
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
    
    if (data.event === "chat_message") {
      const message = {
        sender: data.sender,
        content: data.content,
        receiver:data.receiver,
        receiver_nickname:data.receiver_nickname,
        created_at: data.created_at,
        sender_nickname: data.sender_nickname,
        type: data.type,
      };
      messagesList.value.unshift(message); // 將訊息添加到本地陣列
    }
  } catch (e) {
    console.error("解析 WebSocket 訊息時發生錯誤:", e);
  }
});

// 改變聊天類型
const changeTab = (tab: string) => {
  activeTab.value = tab;
  wsStore.resubscribeChat(token.value,activeTab.value);
  getMessages();
};

// 打開全屏模態框
const openFullscreenModal = () => {
  showFullscreenModal.value = true;
};

// 關閉全屏模態框
const closeFullscreenModal = () => {
  showFullscreenModal.value = false;
};

// 從全屏模式發送消息
const sendFullscreenMessage = () => {
  if (!fullscreenMessage.value.trim()) return;
  newMessage.value = fullscreenMessage.value;
  addMessage();
  fullscreenMessage.value = '';
};

// 將輸入的訊息新增到對應的陣列
function addMessage() {
  if (!newMessage.value.trim()) return;
  sendMessage();
  newMessage.value = ''; // 清空輸入欄位
}

//時間戳轉字串
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// 切換好友下拉選單顯示狀態
const toggleFriendDropdown = () => {
  if (!showFriendDropdown.value) {
    getMyFriends(); // 打開下拉選單時獲取好友列表
  }
  showFriendDropdown.value = !showFriendDropdown.value;
}

//選擇好友
const selectFriend = (data: Friend) => {
  friend.value = data
  // console.log(friend.value)
  showFriendDropdown.value = !showFriendDropdown.value;
}


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
      // console.log('好友列表資料',friends.value);
    } else {
      console.error('獲取好友列表失敗:', response.statusText);
    }
  } catch (error) {
    console.error('獲取好友列表時出錯:', error);
  }
}

//發送聊天訊息
const sendMessage = async () => {
  try {
    const url = backendApi("/api/v1/chat/messages");
    let chatData

    if(activeTab.value === 'private' && friend){
      const chat = {
        "type": activeTab.value, 
        "content": newMessage.value,
        "receiver": friend.value?.username
      }
      chatData = chat
    }else{
      const chat = {
        "type": activeTab.value, 
        "content": newMessage.value,
      }
      chatData = chat
    }
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token.value}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chatData),
    });
    if (response.ok) {
      // 將訊息添加到本地陣列
      // const message = { content: newMessage.value, type: activeTab.value }
      // categorizeMessages([message])
      console.log('訊息已發送:', newMessage.value);
    } else {
      console.error('發送訊息失敗:', await response.text());
    }
  } catch (error) {
    console.error('發送訊息時出現錯誤:', error);
  }
};

//獲取聊天訊息
const getMessages = async () => {
  try {
    const url = backendApi(`/api/v1/chat/messages?type=${activeTab.value}`);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token.value}`,
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const data = await response.json();
      // 將訊息添加到本地陣列
      messagesList.value = data.data.messages;
      // console.log('獲取訊息成功:', messagesList.value);
    } else {
      console.error('獲取訊息失敗:', await response.text());
    }
  } catch (error) {
    console.error('獲取訊息時出現錯誤:', error);
  }
};

onMounted(() => {
  getMessages();
});
</script>
<style lang="scss">
.chat-container {
  position: fixed; /* 改為 fixed 定位 */
  bottom: 0; /* 固定在底部 */
  left: 0;
  width: 100%; /* 滿屏寬度 */
  height: 49vh; /* 固定高度為 30vh */
  display: flex; /* 父容器使用 flex 布局，方便背景調整 */
  flex-direction: column;
  justify-content: flex-end; /* 內容從底部開始 */
  z-index: 20;
  
  .chatBag {
    position: relative;
    height: 100%; /* 填充整個容器高度 */
    width: 100%;
    background-image: url('@/assets/picture/chat-bg-01.png');
    background-size: cover; /* 使用圖片的實際大小，確保比例正確 */
    background-repeat: no-repeat; /* 防止圖片重複 */
    display: flex;
    flex-direction: column;
  }
}

.chat-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  color: white;
  width: 100%;
  z-index: 10;
  
  .chatTitle {
    position: absolute;
    top: 280%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
  }
  
  .chatTitleButton {
    position: absolute;
    top: 280%;
    left: 45%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    margin-left: 1rem;
    width: 55%;

    .tab-button {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .buttonImg{
      position:relative;
      width: 3rem;
    }

    .buttonText {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 12px;
      text-align: center;
      width: 100%;
      pointer-events: none; /* 防止文字影響點擊事件 */
    }

    .active .buttonImg {
      /* 可以在這裡添加選中狀態的樣式 */
      filter: brightness(1.2);
    }
    
    button {
      background: transparent;
      color: white;
      padding: 3px 8px;
      cursor: pointer;
      font-size: 12px;
      border-radius: 0.5rem;
      background-color: #855207;
      border:0;
    }
  }
  
  img {
    width: 100%;
  }
  
  .fullscreen-button {
    position: absolute;
    top: 275%;
    right: 2%;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 5;
    transition: transform 0.2s ease;

    &:active {
      transform: scale(1.1); /* 點擊時放大 10% */
    }
    
    &:hover {
      background: rgba(255, 255, 255, 0.4);
    }
  }

  .friendList{
    position: absolute;
    top: 210%;
    left: 2%;

    .friendImg{
      position:relative;
      width: 4rem;
      cursor: pointer; /* 添加指針樣式表示可點擊 */
      transition: transform 0.2s ease;
      
      &:active {
        transform: scale(1.1); /* 點擊時放大 10% */
      }
    }

    .friendText{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 12px;
      text-align: center;
      width: 100%;
      pointer-events: none;
    }

    /* 好友下拉選單樣式 */
    .friend-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      width: 150px;
      max-height: 200px;
      overflow-y: auto;
      background-color: rgba(0, 0, 0, 0.8);
      border: 1px solid #855207;
      border-radius: 5px;
      z-index: 25;
      margin-top: 5px;
      
      .friend-item {
        padding: 8px 12px;
        color: white;
        cursor: pointer;
        font-size: 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        
        &:hover {
          background-color: #855207;
        }
        
        &:last-child {
          border-bottom: none;
        }
      }
      
      .no-friends {
        text-align: center;
        color: #999;
        cursor: default;
        
        &:hover {
          background-color: transparent;
        }
      }
    }
  }
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
}

.option-btn {
  background: transparent;
  border: 1px solid white;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.chat-messages {
  flex: 1;
  width: 100%;
  overflow-y: auto;
  padding: 1rem 1rem 0rem 1rem;
  display: flex;
  flex-direction: column-reverse;
  align-self: flex-start;
  margin-top: 4.5rem;
}

.message-item {
  display: flex;
  align-self: flex-start;
  gap: 0.5rem;
}

.my-message {
  display: flex;
  align-self: flex-end;
  gap: 0.5rem;
}

.message-sender {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 2px;
  color: #ffffff;
  white-space: nowrap;
}

.system-message {
  color: #9c27b0;
}

.message-content {
  word-break: break-word;
  font-size: 14px;
  color: #ffffff;
}

.message-time {
  font-size: 10px;
  color: #888;
  text-align: right;
  margin-top: 2px;
}

.chat-input-area {
  display: flex;
  padding: 10px;
  background-color: white;
  border-top: 1px solid #ddd;
}

.chat-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  margin-right: 8px;
  outline: none;
}

.send-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0 15px;
  cursor: pointer;
}

.send-btn:hover {
  background-color: #45a049;
}

.inputArea {
  position: relative; /* 改為相對定位 */
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 15;

  .input-wrapper {
    position: relative; /* 為了讓按鈕可以定位在輸入框上 */
    width: 100%;
    bottom: 0;
    left: 0;
  }
  
  .inputTXT {
    position: absolute;
    width: 95%;
    top:20%;
    border-radius: 0.5rem;
    border: none;
    outline: none; /* 去除聚焦時的邊框 */
    color: white; /* 輸入文字顏色 */
    font-size: 1rem;
    background-color: #0000;
    padding-right: 4.5rem; /* 為按鈕留出空間 */
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.7); /* 提示文字顏色透明 */
    }
  }
  
  .inputButton {
    position: absolute; /* 絕對定位 */
    right: 0.5rem; /* 距離右側的距離 */
    top: 0.55rem;
    width: 2.5rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
  }
}

/* 全屏模態框樣式 */
.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}

.fullscreen-modal-content {
  width: 90%;
  height: 90%;
  // background-color: #1a1a1a;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-image: url('@/assets/picture/chat-bg5.png');
  background-size: 100% 100%;
  background-position: center; /* 背景居中 */
  background-repeat: no-repeat; /* 背景不重複 */
  position: relative; /* 添加相對定位 */
  z-index: 1; /* 確保有正確的層疊順序 */
}

.fullscreen-modal-header {
  padding: 15px 20px;
  // background-color: #2a2a2a;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  
  h3 {
    margin: 0.2rem;
    font-size: 18px;
    text-align: center;
  }
  
  .close-button {
    position: absolute;
    right: 20px; /* 距離右側的距離 */
    top: 70%; /* 垂直居中 */
    transform: translateY(-50%); /* 確保垂直居中 */
    width: 2.5rem;
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    
    &:hover {
      color: #ff5555;
    }
  }
}

.fullscreen-modal-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

.fullscreen-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;
  // background-color: #2a2a2a;
}

.fullscreen-messages::-webkit-scrollbar {
  width: 10px; /* 滾動條寬度 */
}

.fullscreen-messages::-webkit-scrollbar-track {
  background: #3a3636; /* 滾動條軌道顏色 */
}

.fullscreen-messages::-webkit-scrollbar-thumb {
  background-color: rgb(255, 255, 255); /* 滾動條滑塊顏色，從紅色改為綠色 */
  border-radius: 5px; /* 滑塊圓角 */
}

.fullscreen-input-area {
  padding: 15px;
  display: flex;
  gap: 10px;
  background-color: #333;
  
  .fullscreen-input {
    flex: 1;
    padding: 12px 15px;
    border-radius: 8px;
    border: 1px solid #555;
    background-color: #222;
    color: white;
    font-size: 16px;
    outline: none;
    
    &::placeholder {
      color: #999;
    }
  }
  
  .fullscreen-send-button {
    padding: 12px 25px;
    background-color: #4a5;
    color: white;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    
    &:hover {
      background-color: #5b6;
    }
  }
}
</style>