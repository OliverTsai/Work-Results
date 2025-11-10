<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const name = ref('蔡福人');
const title = ref('軟體工程師 / 前後端工程師');
const introduction = ref('我是一名熱愛技術的全端開發者，擅長 Vue.js、TypeScript 和後端開發。擁有 5 年開發經驗，致力於打造高品質的使用者體驗。');

onMounted(async () => {
  // 可以在這裡添加頁面載入時的邏輯
});
</script>

<template>
  <div class="mobile-home-container">
    <div class="mobile-profile-box">
      <div class="mobile-profile-image">
        <img src="@/assets/picture/user/MTXX_20200907183540.jpg" alt="個人照片" />
      </div>
      <div class="mobile-profile-info">
        <h1 class="mobile-name">{{ name }}</h1>
        <h2 class="mobile-title">{{ title }}</h2>
        <div class="mobile-divider"></div>
        <p class="mobile-introduction">{{ introduction }}</p>
        <div class="mobile-social-links">
          <a href="https://github.com/OliverTsai" target="_blank" class="mobile-social-link">GitHub</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-home-container {
  position: relative;
  background-image: url('@/assets/picture/headerBG.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  padding: 1rem;
  box-sizing: border-box;
  background-color: #f5f5f5;
}

.mobile-profile-box {
  background-color: rgba(255, 255, 255, 0.9);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  text-align: center;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mobile-profile-image {
  margin-bottom: 1.5rem;
}

.mobile-profile-image img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.mobile-profile-info {
  text-align: center;
  width: 100%;
}

.mobile-name {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin: 0 0 0.3rem 0;
}

.mobile-title {
  font-size: 1.2rem;
  color: #666;
  margin: 0 0 0.8rem 0;
  font-weight: 500;
}

.mobile-divider {
  height: 3px;
  background-color: #3498db;
  width: 50px;
  margin: 0 auto 1.2rem auto;
}

.mobile-introduction {
  font-size: 1rem;
  line-height: 1.5;
  color: #555;
  margin-bottom: 1.2rem;
  padding: 0 0.5rem;
}

.mobile-social-links {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.mobile-social-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.mobile-social-link:hover {
  background-color: #2980b9;
}

.mobile-spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
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