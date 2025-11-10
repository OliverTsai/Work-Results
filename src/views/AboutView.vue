<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false); // 改為 false，因為我們不需要顯示加載中
const name = ref('蔡福人'); // 您的名字
const title = ref('軟體工程師 / 前後端工程師'); // 您的標語
const introduction = ref('我是一名熱愛技術的全端開發者，擅長 Vue.js、TypeScript 和後端開發。擁有 5 年開發經驗，致力於打造高品質的使用者體驗。'); // 簡短自我介紹

onMounted(async () => {
  // 可以在這裡添加頁面載入時的邏輯
});
</script>

<template>
  <div class="home-container">
    <div class="profile-box">
      <div class="profile-image">
        <img src="@/assets/picture/user/MTXX_20200907183540.jpg" alt="個人照片" />
      </div>
      <div class="profile-info">
        <h1 class="name">{{ name }}</h1>
        <h2 class="title">{{ title }}</h2>
        <div class="divider"></div>
        <p class="introduction">{{ introduction }}</p>
        <div class="social-links">
          <a href="https://github.com/OliverTsai" target="_blank" class="social-link">GitHub</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  position: relative;
  background-image: url('@/assets/picture/headerBG.jpg'); /* 您可以更換為適合的背景圖片 */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #f5f5f5;
}

.profile-box {
  background-color: rgba(255, 255, 255, 0.9);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  text-align: center;
  max-width: 800px;
  width: 90%;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2rem;
}

@media (max-width: 768px) {
  .profile-box {
    flex-direction: column;
  }
}

.profile-image {
  flex-shrink: 0;
}

.profile-image img {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #ffffff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.profile-info {
  text-align: left;
  flex-grow: 1;
}

.name {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.title {
  font-size: 1.5rem;
  color: #666;
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.divider {
  height: 3px;
  background-color: #3498db;
  width: 60px;
  margin-bottom: 1.5rem;
}

.introduction {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #555;
  margin-bottom: 1.5rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.social-link:hover {
  background-color: #2980b9;
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