<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

import img from '@/assets/picture/user/3.png';
import rotation from '@/assets/picture/rotation.png';
import shooting from '@/assets/picture/shooting.png';
import tetris from '@/assets/picture/tetris.png';
import slot from '@/assets/picture/slot.png';

const router = useRouter();
const activeFilter = ref('all');

const projects = ref([
  {
    id: 1,
    title: '英雄戰爭',
    description: '手機遊戲、經典RPG射擊遊戲，擊敗敵人、提升技能',
    image: shooting,
    link: 'game2',
    type: 'game'
  },
  {
    id: 2,
    title: '方塊消除',
    description: '手機遊戲、消除方塊',
    image: tetris,
    link: '/games/platform-jumper',
    type: 'game'
  },
  {
    id: 3,
    title: '縱向3D旋轉效果',
    description: '使用3D旋轉效果的應用展示',
    image: rotation,
    link: '/rotation',
    type: 'effect'
  },
  {
    id: 4,
    title: '老虎機效果',
    description: '實現老虎機轉動特效',
    image: slot,
    link: '/slot',
    type: 'effect'
  }
]);

// 根據當前篩選條件過濾項目
const filteredProjects = computed(() => {
  if (activeFilter.value === 'all') {
    return projects.value;
  }
  return projects.value.filter(project => project.type === activeFilter.value);
});

// 切換篩選條件
const setFilter = (filter: string) => {
  activeFilter.value = filter;
};

const openProject = (link: string) => {
  router.push(link);
};

onMounted(() => {
  // 可以在這裡加載項目數據或其他初始化操作
});
</script>

<template>
  <div class="web-portfolio">
    <header class="header">
      <h1>前端作品集</h1>
      <p class="subtitle">Phaser 遊戲與特效展示</p>
    </header>

    <div class="filters">
      <button
        class="filter-btn"
        :class="{ active: activeFilter === 'all' }"
        @click="setFilter('all')"
        >全部
      </button>
      <button 
        class="filter-btn" 
        :class="{ active: activeFilter === 'game' }"
        @click="setFilter('game')"
      >
        遊戲
      </button>
      <button 
        class="filter-btn" 
        :class="{ active: activeFilter === 'effect' }"
        @click="setFilter('effect')"
      >
        特效
      </button>
    </div>

    <div class="projects-container">
      <div v-for="project in filteredProjects" :key="project.id" class="project-card" @click="openProject(project.link)">
        <div class="project-image" :style="{ backgroundImage: `url(${project.image})` }">
          <div class="project-type" :class="project.type">{{ project.type === 'game' ? '遊戲' : '特效' }}</div>
        </div>
        <div class="project-info">
          <h3>{{ project.title }}</h3>
          <p>{{ project.description }}</p>
          <button class="play-btn">立即體驗</button>
        </div>
      </div>
    </div>

    <!-- <footer class="footer">
      <p>© 2025 前端作品集 - 使用 Vue.js 和 Phaser 開發</p>
    </footer> -->
  </div>
</template>

<style scoped>
.web-portfolio {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Noto Sans TC', sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eaeaea;
}

.header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
}

.filters {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.filter-btn {
  padding: 0.6rem 1.5rem;
  background: transparent;
  border: 2px solid #3498db;
  border-radius: 30px;
  color: #3498db;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn:hover, .filter-btn.active {
  background-color: #3498db;
  color: white;
}

.projects-container {
  display: grid;
  width: 100%;
  height: 70vh;
  overflow-y: auto;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 2rem;
}

.project-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  display: flex;
  height: 250px;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.project-image {
  flex: 1;
  background-size: cover;
  background-position: center;
  position: relative;
}

.project-type {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
}

.project-type.game {
  background-color: #e74c3c;
}

.project-type.effect {
  background-color: #9b59b6;
}

.project-info {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.project-info h3 {
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
  color: #333;
}

.project-info p {
  color: #666;
  margin-bottom: auto;
  line-height: 1.6;
}

.play-btn {
  padding: 0.7rem 1.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  align-self: flex-start;
  margin-top: 1rem;
}

.play-btn:hover {
  background-color: #2980b9;
}

.footer {
  margin-top: 4rem;
  text-align: center;
  color: #777;
  padding-top: 2rem;
  border-top: 1px solid #eaeaea;
}

/* 確保在較大屏幕上有更好的展示效果 */
@media (min-width: 1400px) {
  .projects-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 較小屏幕的響應式調整 */
@media (max-width: 992px) {
  .projects-container {
    grid-template-columns: 1fr;
  }
}
</style>