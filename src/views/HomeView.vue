<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(true);
const message = ref('前端網頁...');

onMounted(async () => {
  router.push('/');
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
}

.logo {
  margin-bottom: 2rem;
}

.logo h1 {
  font-size: 1.8rem;
  color: #333;
  margin: 0;
}

.message {
  position: absolute;
  top: 56%;
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