<template>
  <div class="chat-container">
    <div class="chatBag">
        <div class="chat-header">
            <img src="@/assets/picture/btn-chat-bg2.png" class="chatTitle" />
            <div class="chatTitleButton">
                <button>全部</button>
                <button>一般</button>
                <button>私人</button>
                <button>公會</button>
                <button>系統</button>
            </div>
        </div>
        
        <div class="chat-messages p-5" ref="messagesContainer">
          <div v-for="(message, index) in messagesList" :key="index" class="message-item" :class="{ 'message-item my-message': message.sender === username }">
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
        
        <div class="inputArea p-3">
          <input v-model="newMessage" type="text" class="inputTXT" placeholder="輸入訊息" />
          <div class="inputButton mt-2" @click="addMessage"></div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { backendApi } from '@/composables/useApi';

const router = useRouter();

const newMessage = ref<string>('')

const token = ref(localStorage.getItem("token") || "");
const username = ref(localStorage.getItem("name") || "");

const messagesList = ref<any[]>([]); // 儲存所有訊息
const activeTab = ref('general'); // 當前選中的標籤

// 將輸入的訊息新增到對應的陣列
function addMessage() {
  if (!newMessage.value.trim()) return
  sendMessage()
  newMessage.value = '' // 清空輸入欄位
}

//時間戳轉字串
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

//發送聊天訊息
const sendMessage = async () => {
  try {
    const url = backendApi("/api/v1/chat/messages");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token.value}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "content": newMessage.value,
        "type": activeTab.value,
      }),
    });
    if (response.ok) {
      // 將訊息添加到本地陣列
      // const message = { content: newMessage.value, type: activeTab.value }
      // categorizeMessages([message])
      console.log('訊息已發送:', newMessage.value)
    } else {
      console.error('發送訊息失敗:', await response.text())
    }
  } catch (error) {
    console.error('發送訊息時出現錯誤:', error)
  }
}

//獲取聊天訊息
const getMessages = async () => {
  try {
    const url = backendApi("/api/v1/chat/messages");
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
      messagesList.value = data.messages;
      console.log('獲取訊息成功:', messagesList.value)
    } else {
      console.error('獲取訊息失敗:', await response.text())
    }
  } catch (error) {
    console.error('獲取訊息時出現錯誤:', error)
  }
}

onMounted(() => {
  getMessages()
});

</script>

<style lang="scss">

.chat-container {
  position: absolute;
//   top:31.5rem;
//   left: 0;
  width: 100%; /* 滿屏寬度 */
  aspect-ratio: 76 / 76;
  display: flex; /* 父容器使用 flex 布局，方便背景調整 */
  flex-direction:column;
  justify-content: center;

  .chatBag {
    position: relative;
    flex: 1;
    background-image: url('@/assets/picture/chat-bg-01.png');
    background-size: cover; /* 使用圖片的實際大小，確保比例正確 */
    background-repeat: no-repeat; /* 防止圖片重複 */

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

    .chatTitle{
        position: absolute;
        top: 70%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .chatTitleButton{
        position: absolute;
        top: 75%;
        left: 60%;
        transform: translate(-50%, -50%);
        display: flex;
        gap: 0.5rem;
        margin-left: 1rem;
        width: 100%;

        button{
            background: transparent;
            color: white;
            padding: 3px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }
    }

    img{
        width: 100%;
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
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  gap: 8px;
}

.message-item {
  display: flex;
  padding: 8px 12px;
  border-radius: 8px;
  max-width: 85%;
  align-self: flex-start;
  gap:0.5rem;
}

.message-item.my-message {
  display: flex;
  align-self: flex-end;
}

.message-sender {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 2px;
}

.system-message {
  color: #9c27b0;
}

.message-content {
  word-break: break-word;
  font-size: 14px;
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
  // background-color: rgb(78, 67, 34);
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  z-index: 5;
  .inputTXT {
    flex: 1;
    padding: 1.5rem 1rem; /* 增加左右間距 */
    border-radius: 0.5rem;
    border: none;
    outline: none; /* 去除聚焦時的邊框 */
    background-image: url('@/assets/picture/chat-insert.png');
    background-size: cover; /* 確保背景圖片填滿 */
    background-position: center;
    background-repeat: no-repeat;
    color: white; /* 輸入文字顏色 */
    font-size: 1rem;
    background-color: #0000;

    /* 透明背景效果，確保文字顯示清晰 */
    ::placeholder {
      color: rgba(255, 255, 255, 0.7); /* 提示文字顏色透明 */
    }
  }

  .inputButton{
    background-image: url('@/assets/picture/btn-submit.png');
    background-size: cover;
    width: 4rem;
    height: 3.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
  }
}
</style>