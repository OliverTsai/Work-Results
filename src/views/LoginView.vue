<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const message = ref('登入中，請稍候...');
const loading = ref(true);

onMounted(() => {
  const token = route.query.token as string;
  
  if (token) {
    // 儲存 token
    localStorage.setItem('token', token);
    message.value = '登入成功，即將進入遊戲...';
    
    // 延遲一下再跳轉，讓用戶看到成功信息
    setTimeout(() => {
      router.push('/hall');
    }, 1000);
  } else {
    message.value = '登入失敗，請重新登入';
    loading.value = false;
  }
});
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="message">
        <p>{{ message }}</p>
        <div class="spinner" v-if="loading"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  position: relative;
  background-image: url('@/assets/picture/loding_bg.png');
  background-size: cover; /* 背景自動縮放填滿 */
  background-position: center; /* 背景居中 */
  background-repeat: no-repeat; /* 背景不重複 */
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #f5f5f5;
}

.login-box {
  /* background-color: white; */
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 90%;
  margin-top: 2rem;
}

h1 {
  margin-bottom: 2rem;
  color: #333;
}

.message {
  position: absolute;
  top: 80%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 10px;
  width: 300px;
}

.message p {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  margin-bottom: 10px;
}

.spinner {
  display: inline-block;
  width: 30px;
  height: 30px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
  margin-top: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>