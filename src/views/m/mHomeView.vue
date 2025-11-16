<template>
  <div class="mobile-home-container">
    <!-- 主要內容區 -->
    <div>
      <!-- 英雄區塊 -->
      <section class="hero">
        <div class="hero-content">
          <div class="hero-text-container">
            <div class="greeting-animation">
              <h1>Hi <span class="wave">👋</span>, 我是 <span class="highlight">Oliver Tsai</span></h1>
            </div>
            <div class="role-badge">
              <h3>軟體工程師</h3>
            </div>
            <div class="intro-text">
              <p>我是一位軟體工程師，擁有近5年IT產業經驗，專精於前端與全端開發。從資訊助理起步，透過自主學習與實務經驗，掌握多種程式語言與系統架構，能快速適應各類專案需求並提供最佳技術解決方案。</p>
            </div>
          </div>
        </div>
        <div class="hero-image">
          <div class="image-container">
            <img src="@/assets/picture/headerBG.jpg" alt="個人照片" />
          </div>
        </div>
      </section>

      <!-- 關於我區塊 -->
      <section id="about" class="about">
        <div class="section-title show">
          <h2>關於我</h2>
          <div class="section-decoration"></div>
        </div>
        <div class="about-content">
          <div class="about-text">
            <div class="text-card show">
              <p>我是一位擁有近5年IT產業經驗的軟體工程師，專注於前端與全端開發領域。職涯始於開發部資訊助理的角色，這三年的經歷為我奠定了堅實的技術基礎。在擔任助理期間，我有幸接觸到多種程式語言和各類型專案，從企業內部系統到面向客戶的應用程式，累積了廣泛而多元的實務經驗。</p>
            </div>
            <div class="text-card show">
              <p>我深信技術成長需要理論與實踐並重，因此在工作之餘，我持續自主學習資料結構、演算法和系統架構等核心知識，不僅強化了自身的技術深度，也培養了快速掌握新技術的能力。這些努力使我能夠順利轉型為前端工程師，進而成長為能夠掌握全棧開發的全端工程師。</p>
            </div>
            <div class="text-card show">
              <p>我的優勢在於結合紮實的技術基礎與實務經驗，能夠從系統整體角度思考問題，提供高效且可擴展的解決方案。我熱衷於持續學習最新的技術趨勢，並將其應用於實際開發中，為產品創造更大的價值。</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 專案經歷區塊 -->
      <section id="skills" class="skills">
        <div class="section-title show">
          <h2>近期專案</h2>
          <div class="section-decoration"></div>
        </div>
        <div class="skills-content">
          <div class="skill-category show">
            <h3>德州撲克遊戲前端</h3>
            <div class="skill-items">
              <div class="skill-item video-link show">
                <a href="https://youtu.be/YBlaIgDL7WE" target="_blank" rel="noopener noreferrer">
                  <div class="video-thumbnail">
                    <img src="@/assets/picture/poker.jpg" alt="影片展示" />
                    <div class="play-icon">
                      <i class="fas fa-play-circle"></i>
                    </div>
                  </div>
                  <p class="video-title">點擊觀看德州撲克遊戲演示</p>
                </a>
              </div>
            </div>
          </div>
          <div class="skill-category show">
            <h3>專案責任範圍</h3>
            <div class="skill-items">
              <div class="skill-item project-description show">
                <p>獨立負責前端專案開發，包含專案初始化、環境建置與 Docker 測試／正式環境設定；
                  依公司需求規劃部署流程並與後端串接 API，建立差異化指令以便更新；
                  依設計稿進行切版並整合兩組後端資料；
                  在遊戲畫面中設計並實作以中介資料層（Data Layer / Buffer Layer）為核心的雙
                  向解耦資料更新架構，有效處理 WebSocket 非同步高頻資料流，維持畫面穩定與渲染效能。</p>
              </div>
              <div class="skill-item cta-button">
                <router-link to="/m/Technology_Matrix">
                  <span class="btn primary">AI分析以及未來優化方向</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <div class="skills-content">
          <div class="skill-category show">
            <h3>爬蟲專案後端</h3>
            <div class="skill-items">
              <div class="skill-item video-link show">
                <a href="https://youtu.be/4wgEg8mH5NY" target="_blank" rel="noopener noreferrer">
                  <div class="video-thumbnail">
                    <img src="@/assets/picture/dongling.png" alt="影片展示" />
                    <div class="play-icon">
                      <i class="fas fa-play-circle"></i>
                    </div>
                  </div>
                  <p class="video-title"></p>
                </a>
              </div>
            </div>
          </div>
          <div class="skill-category show">
            <h3>專案責任範圍</h3>
            <div class="skill-items">
              <div class="skill-item project-description show">
                <p>將原有C#本地運行系統轉換為雲端部署的Python後端服務，以支援企業資料查詢系統；
                  主要挑戰包括對整個系統進行了重新設計和優化，使其更適合在伺服器環境中運行，
                  以及處理大量政府公開資料、確保系統穩定性；個人貢獻如下：
                  1.使用Python + Flask開發RESTful API，便於與現有爬蟲系統整合；
                  2.將原本只有資料庫容器化改為整個專案容器化，提升部署效率與一致性；
                  3.設計關聯式資料庫結構，提升資料完整性以及建立種子(政府公開)資料建立機制</p>
              </div>
              <div class="skill-item cta-button">
                <router-link to="/Backend_TechnologyMatrix">
                  <span class="btn primary">AI分析以及未來優化方向</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
// 您可以在這裡導入需要的組件或設置響應式數據
import { onMounted } from 'vue';

onMounted(() => {
  // 頁面載入完成後的操作，例如動畫效果
  console.log('移動版首頁已載入');
  
  // 添加滾動顯示動畫 - 已預設顯示，但仍保留動畫效果
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.section-title:not(.show), .text-card:not(.show), .skill-category:not(.show), .video-thumbnail:not(.show), .project-description:not(.show)').forEach(el => {
    observer.observe(el);
  });
});
</script>

<style scoped lang="scss">
// 全局變數
:root {
  --primary-color: #4FC08D; // Vue 綠色
  --secondary-color: #35495E; // Vue 深藍色
  --text-color: #333;
  --light-text: #666;
  --background-color: #f9f9f9;
  --card-background: #fff;
  --border-radius: 8px;
  --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

// 基本樣式
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', 'Noto Sans TC', sans-serif;
  color: var(--text-color);
  background-color: var(--background-color);
  line-height: 1.6;
}

.mobile-home-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 5rem 15px;
  overflow-y: auto;
  height: 100vh;
}

// 按鈕樣式
.btn {
  display: inline-block;
  width: 100%;
  padding: 12px 20px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
}

.btn:active {
  transform: scale(0.98);
}

.btn.primary {
  background-color: var(--primary-color);
  color: rgb(0, 0, 0);
}

.btn.secondary {
  background-color: transparent;
  color: var(--secondary-color);
  border: 2px solid var(--secondary-color);
}

.btn.small {
  padding: 8px 16px;
  font-size: 0.9em;
}

// 通用區塊樣式
section {
  padding: 50px 0;
  position: relative;
  overflow: hidden;
}

section:nth-child(even) {
  background-color: #f5f5f5;
}

// 區塊標題樣式
.section-title {
  text-align: center;
  margin-bottom: 30px;
  opacity: 1; // 默認顯示
  transform: translateY(0);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.section-title h2 {
  font-size: 1.8rem;
  color: var(--secondary-color);
  position: relative;
  display: inline-block;
  font-weight: 700;
  margin-bottom: 15px;
}

.section-decoration {
  width: 50px;
  height: 3px;
  background-color: var(--primary-color);
  margin: 0 auto;
  position: relative;
}

.section-decoration::before,
.section-decoration::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--primary-color);
  top: -1.5px;
}

.section-decoration::before {
  left: -3px;
}

.section-decoration::after {
  right: -3px;
}

// 英雄區塊
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  position: relative;
  overflow: hidden;
}

.hero-content {
  width: 100%;
  margin-bottom: 20px;
}

.hero-text-container {
  width: 100%;
  animation: fadeIn 0.8s ease-out;
  text-align: center;
}

.greeting-animation {
  margin-bottom: 15px;
}

.greeting-animation h1 {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.wave {
  display: inline-block;
  animation: wave 2.5s infinite;
  transform-origin: 70% 70%;
}

.highlight {
  color: var(--primary-color);
  position: relative;
}

.highlight::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 6px;
  bottom: 3px;
  left: 0;
  background-color: rgba(79, 192, 141, 0.2);
  z-index: -1;
}

.role-badge {
  display: inline-block;
  margin-bottom: 20px;
}

.role-badge h3 {
  display: inline-block;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--secondary-color);
  background: rgba(53, 73, 94, 0.08);
  padding: 6px 14px;
  border-radius: 20px;
  letter-spacing: 1px;
}

.intro-text {
  margin-bottom: 25px;
}

.intro-text p {
  font-size: 1rem;
  color: var(--light-text);
  line-height: 1.7;
  text-align: left;
}

.hero-buttons {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 20px;
}

.hero-image {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 25px;
}

.image-container {
  position: relative;
  width: 85%;
  max-width: 300px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.image-container img {
  width: 100%;
  height: auto;
  display: block;
}

// 關於我區塊
.about-content {
  width: 100%;
}

.about-text {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.text-card {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  opacity: 1; // 默認顯示
  transform: translateY(0);
  transition: opacity 0.6s ease, transform 0.6s ease;
  position: relative;
  z-index: 1;
}

.text-card:nth-child(1) {
  border-top: 3px solid var(--primary-color);
}

.text-card:nth-child(2) {
  border-top: 3px solid var(--secondary-color);
}

.text-card:nth-child(3) {
  border-top: 3px solid #FFD166;
}

.text-card p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--light-text);
}

// 技能區塊
.skills-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.skill-category {
  width: 100%;
  opacity: 1; // 默認顯示
  transform: translateY(0);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.skill-category h3 {
  font-size: 1.3rem;
  color: var(--secondary-color);
  margin-bottom: 20px;
  text-align: center;
  font-weight: 600;
  position: relative;
  display: inline-block;
  padding-bottom: 8px;
}

.skill-category h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 30px;
  height: 2px;
  background-color: var(--primary-color);
}

.skill-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skill-item {
  width: 100%;
}

.project-description {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border-left: 3px solid var(--primary-color);
  opacity: 1; // 默認顯示
  transform: translateX(0);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.project-description p {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--light-text);
  margin: 0;
}

.cta-button {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

// 視頻連結樣式
.video-link {
  position: relative;
  width: 100%;
  opacity: 1; // 默認顯示
  transform: translateY(0);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.video-link a {
  text-decoration: none;
  color: var(--text-color);
  display: block;
  width: 100%;
}

.video-title {
  text-align: center;
  margin-top: 10px;
  font-weight: 500;
  color: var(--secondary-color);
  font-size: 0.95rem;
}

.video-thumbnail {
  position: relative;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  aspect-ratio: 16/9;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.play-icon i {
  color: var(--primary-color);
  font-size: 22px;
  margin-left: 3px; /* 稍微偏右以視覺居中 */
}

// 動畫關鍵幀
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes wave {
  0% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(14deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(10deg); }
  60% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}

// 顯示類
.show {
  opacity: 1 !important;
  transform: translateY(0) !important;
  transform: translateX(0) !important;
}

// 觸摸優化
@media (hover: none) {
  .btn:hover {
    transform: none;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .text-card:hover {
    transform: none;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }
  
  .project-description:hover {
    transform: none;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }
}
</style>