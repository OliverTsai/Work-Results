<template>
  <div class="home-container">
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
            <div class="hero-buttons">
              <a href="#about" class="btn primary">了解更多</a>
              <a href="#skills" class="btn secondary">查看專案</a>
            </div>
          </div>
        </div>
        <div class="hero-image">
          <div class="image-container">
            <img src="@/assets/picture/headerBG.jpg" alt="個人照片" />
            <div class="image-decoration"></div>
          </div>
        </div>
      </section>

      <!-- 關於我區塊 -->
      <section id="about" class="about">
        <div class="section-title">
          <h2>關於我</h2>
          <div class="section-decoration"></div>
        </div>
        <div class="about-content">
          <div class="about-text">
            <div class="text-card">
              <p>我是一位擁有近5年IT產業經驗的軟體工程師，專注於前端與全端開發領域。職涯始於開發部資訊助理的角色，這三年的經歷為我奠定了堅實的技術基礎。在擔任助理期間，我有幸接觸到多種程式語言和各類型專案，從企業內部系統到面向客戶的應用程式，累積了廣泛而多元的實務經驗。</p>
            </div>
            <div class="text-card">
              <p>我深信技術成長需要理論與實踐並重，因此在工作之餘，我持續自主學習資料結構、演算法和系統架構等核心知識，不僅強化了自身的技術深度，也培養了快速掌握新技術的能力。這些努力使我能夠順利轉型為前端工程師，進而成長為能夠掌握全棧開發的全端工程師。</p>
            </div>
            <div class="text-card">
              <p>我的優勢在於結合紮實的技術基礎與實務經驗，能夠從系統整體角度思考問題，提供高效且可擴展的解決方案。我熱衷於持續學習最新的技術趨勢，並將其應用於實際開發中，為產品創造更大的價值。</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 專案經歷區塊 -->
      <section id="skills" class="skills">
        <div class="section-title">
          <h2>近期專案</h2>
          <div class="section-decoration"></div>
        </div>
        <div class="skills-content">
          <div class="skill-category">
            <h3>德州撲克遊戲前端</h3>
            <div class="skill-items">
              <div class="skill-item video-link">
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
          <div class="skill-category">
            <h3>專案責任範圍</h3>
            <div class="skill-items">
              <div class="skill-item project-description">
                <p>獨立負責前端專案開發，包含專案初始化、環境建置與 Docker 測試／正式環境設定；
                  依公司需求規劃部署流程並與後端串接 API，建立差異化指令以便更新；
                  依設計稿進行切版並整合兩組後端資料；
                  在遊戲畫面中設計並實作以中介資料層（Data Layer / Buffer Layer）為核心的雙
                  向解耦資料更新架構，有效處理 WebSocket 非同步高頻資料流，維持畫面穩定與渲染效能。</p>
              </div>
              <div class="skill-item cta-button">
                <router-link to="/Technology_Matrix">
                  <span class="btn primary">AI評論以及未來優化方向</span>
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
  console.log('首頁已載入');
  
  // 添加滾動顯示動畫
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.section-title, .text-card, .skill-category, .video-thumbnail, .project-description').forEach(el => {
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

.home-container {
  max-width: 1200px;
  height: 100vh;
  margin: 0 auto;
  padding: 0 20px;
  overflow-y: auto;
}

// 按鈕樣式
.btn {
  display: inline-block;
  padding: 12px 28px;
  border-radius: 30px;
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.btn.primary {
  background-color: var(--primary-color);
  color: rgb(0, 0, 0);
}

.btn.primary:hover {
  background-color:#4FC08D;
}

.btn.secondary {
  background-color: transparent;
  color: var(--secondary-color);
  border: 2px solid var(--secondary-color);
}

.btn.secondary:hover {
  background-color: rgba(53, 73, 94, 0.08);
}

.btn.small {
  padding: 8px 16px;
  font-size: 0.9em;
}

// 通用區塊樣式
section {
  padding: 100px 0;
  position: relative;
  overflow: hidden;
}

section:nth-child(even) {
  background-color: #f5f5f5;
}

section:nth-child(even)::before {
  content: '';
  position: absolute;
  top: -80px;
  right: -80px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(79, 192, 141, 0.08);
  z-index: 0;
}

section:nth-child(odd)::after {
  content: '';
  position: absolute;
  bottom: -100px;
  left: -100px;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background: rgba(53, 73, 94, 0.05);
  z-index: 0;
}

// 區塊標題樣式
.section-title {
  text-align: center;
  margin-bottom: 60px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.section-title.show {
  opacity: 1;
  transform: translateY(0);
}

.section-title h2 {
  font-size: 2.5rem;
  color: var(--secondary-color);
  position: relative;
  display: inline-block;
  font-weight: 700;
  margin-bottom: 20px;
}

.section-decoration {
  width: 60px;
  height: 4px;
  background-color: var(--primary-color);
  margin: 0 auto;
  position: relative;
}

.section-decoration::before,
.section-decoration::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--primary-color);
  top: -2px;
}

.section-decoration::before {
  left: -4px;
}

.section-decoration::after {
  right: -4px;
}

// 英雄區塊
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 100px 0;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50px;
  left: -50px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(79, 192, 141, 0.1);
  z-index: -1;
}

.hero::after {
  content: '';
  position: absolute;
  bottom: -100px;
  right: -100px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(53, 73, 94, 0.08);
  z-index: -1;
}

.hero-content {
  flex: 1;
}

.hero-text-container {
  max-width: 600px;
  animation: fadeIn 0.8s ease-out;
}

.greeting-animation {
  margin-bottom: 15px;
}

.greeting-animation h1 {
  font-size: 3rem;
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
  height: 8px;
  bottom: 5px;
  left: 0;
  background-color: rgba(79, 192, 141, 0.2);
  z-index: -1;
}

.role-badge {
  display: inline-block;
  margin-bottom: 25px;
}

.role-badge h3 {
  display: inline-block;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--secondary-color);
  background: rgba(53, 73, 94, 0.08);
  padding: 8px 16px;
  border-radius: 30px;
  letter-spacing: 1px;
}

.intro-text {
  margin-bottom: 35px;
}

.intro-text p {
  font-size: 1.1rem;
  color: var(--light-text);
  line-height: 1.8;
  position: relative;
  padding-left: 15px;
  border-left: 3px solid var(--primary-color);
}

.hero-buttons {
  display: flex;
  gap: 15px;
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  animation: slideIn 1s ease-out;
}

.image-container {
  position: relative;
  width: 85%;
}

.image-container img {
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: var(--box-shadow);
  transition: transform 0.5s ease;
}

.image-container img:hover {
  transform: scale(1.02);
}

.image-decoration {
  position: absolute;
  top: -15px;
  right: -15px;
  width: 100%;
  height: 100%;
  border: 2px solid var(--primary-color);
  border-radius: 12px;
  z-index: -1;
}

// 關於我區塊
.about-content {
  max-width: 900px;
  margin: 0 auto;
}

.about-text {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.text-card {
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.5s ease, box-shadow 0.5s ease;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
  position: relative;
  z-index: 1;
}

.text-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.text-card.show {
  opacity: 1;
  transform: translateY(0);
}

.text-card:nth-child(1) {
  transition-delay: 0.1s;
  border-top: 4px solid var(--primary-color);
}

.text-card:nth-child(2) {
  transition-delay: 0.3s;
  border-top: 4px solid var(--secondary-color);
}

.text-card:nth-child(3) {
  transition-delay: 0.5s;
  border-top: 4px solid #FFD166;
}

.text-card p {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--light-text);
}

// 技能區塊
.skills-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 50px;
}

.skill-category {
  flex: 1;
  min-width: 300px;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.skill-category:nth-child(1) {
  transition-delay: 0.2s;
}

.skill-category:nth-child(2) {
  transition-delay: 0.4s;
}

.skill-category.show {
  opacity: 1;
  transform: translateY(0);
}

.skill-category h3 {
  font-size: 1.5rem;
  color: var(--secondary-color);
  margin-bottom: 25px;
  text-align: center;
  font-weight: 600;
  position: relative;
  display: inline-block;
  padding-bottom: 10px;
}

.skill-category h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background-color: var(--primary-color);
}

.skill-items {
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
}

.skill-item {
  width: 100%;
}

.project-description {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.5s ease, box-shadow 0.5s ease;
  border-left: 4px solid var(--primary-color);
  opacity: 0;
  transform: translateX(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.project-description.show {
  opacity: 1;
  transform: translateX(0);
}

.project-description:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.project-description p {
  font-size: 1.05rem;
  line-height: 1.8;
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
  transition: all 0.5s ease;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.video-link.show {
  opacity: 1;
  transform: translateY(0);
}

.video-link:hover {
  transform: translateY(-8px);
}

.video-link:hover .play-icon {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.video-link:hover img {
  transform: scale(1.05);
  filter: brightness(0.8);
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
}

.video-thumbnail {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  height: 280px; /* 固定高度 */
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.5s ease;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.9);
  width: 70px;
  height: 70px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.play-icon i {
  color: var(--primary-color);
  font-size: 30px;
  margin-left: 5px; /* 稍微偏右以視覺居中 */
}

// 動畫關鍵幀
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(50px); }
  to { opacity: 1; transform: translateX(0); }
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

// 響應式調整
@media (max-width: 768px) {
  section {
    padding: 60px 0;
  }
  
  .section-title h2 {
    font-size: 2rem;
  }
  
  .hero {
    flex-direction: column;
    padding: 60px 0;
  }
  
  .hero-content {
    margin-bottom: 50px;
    text-align: center;
  }
  
  .hero-text-container {
    margin: 0 auto;
  }
  
  .greeting-animation h1 {
    font-size: 2.5rem;
  }
  
  .intro-text p {
    padding-left: 0;
    border-left: none;
    text-align: left;
  }
  
  .hero-buttons {
    justify-content: center;
  }
  
  .hero-image {
    justify-content: center;
    width: 100%;
  }
  
  .image-container {
    width: 80%;
    max-width: 400px;
  }
  
  .about-text {
    gap: 20px;
  }
  
  .text-card {
    padding: 20px;
  }
  
  .skills-content {
    flex-direction: column;
  }
  
  .skill-category {
    width: 100%;
  }
  
  .video-thumbnail {
    max-width: 100%;
  }
}

// 小型移動設備
@media (max-width: 480px) {
  .greeting-animation h1 {
    font-size: 2rem;
  }
  
  .role-badge h3 {
    font-size: 1.1rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    gap: 15px;
  }
  
  .hero-buttons .btn {
    width: 100%;
    text-align: center;
  }
  
  .section-title h2 {
    font-size: 1.8rem;
  }
}
</style>