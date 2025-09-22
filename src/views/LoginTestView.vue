<template>
  <div class="login-test-container">
    <div class="input-group">
      <input 
        v-model="username" 
        type="text" 
        placeholder="請輸入測試名稱"
        class="api-input"
      />
      <button 
        @click="fetchData" 
        class="fetch-button"
      >
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { playerApi } from '@/composables/useApi';

const token = ref(localStorage.getItem("token") || "");
const member = ref(localStorage.getItem("member") || "");

const username = ref('');

const url = playerApi(`/api/v1/game/guild/get_player_member_token`);

// 抓取API資料的函數
const fetchData = async () => {

    console.log('名字',username.value);
  
    try {
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username.value,
            })
        });
        
        if (!response.ok) {
            throw new Error(`API請求失敗: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();

        console.log('資料已成功存儲到本地',data);

        localStorage.setItem('token', data.token);
        localStorage.setItem('member', data.member_token);
        
        
    } catch (error) {
        console.error('抓取資料時出錯:', error);
    } 
};
</script>

<style scoped>
.login-test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.input-group {
  display: flex;
  margin-bottom: 20px;
}

.api-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.fetch-button {
  margin-left: 10px;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.fetch-button:hover {
  background-color: #45a049;
}

.fetch-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.response-container {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: auto;
}

.response-container pre {
  white-space: pre-wrap;
  word-break: break-all;
}

.error-message {
  margin-top: 20px;
  padding: 10px;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
}
</style>