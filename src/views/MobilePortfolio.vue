<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeTab = ref('games');

const games = ref([
  {
    id: 1,
    title: '太空射擊',
    description: '經典太空射擊遊戲，擊敗敵人、收集道具',
    image: 'game1.jpg',
    link: 'game2'
  },
  {
    id: 2,
    title: '平台跳躍',
    description: '2D 平台跳躍遊戲，收集金幣並避開障礙物',
    image: 'game2.jpg',
    link: '/games/platform-jumper'
  }
]);

const effects = ref([
  {
    id: 1,
    title: '粒子特效',
    description: '多種粒子系統視覺特效展示',
    image: 'effect1.jpg',
    link: '/effects/particles'
  },
  {
    id: 2,
    title: '光影效果',
    description: '動態光影和色彩變換的視覺特效',
    image: 'effect2.jpg',
    link: '/effects/lighting'
  },
  {
    id: 3,
    title: '立體3D選角特效',
    description: 'RPG遊戲選角介面',
    image: 'effect2.jpg',
    link: 'pageA'
  },
  {
    id: 4,
    title: '光影選角特效',
    description: 'RPG遊戲選角介面',
    image: 'effect2.jpg',
    link: 'pageB'
  }
]);

const openProject = (link: string) => {
  router.push(link);
};

const changeTab = (tab: string) => {
  activeTab.value = tab;
};

onMounted(() => {
  // 可以在這裡加載項目數據或其他初始化操作
});
</script>

<template>
  <div class="mobile-portfolio">
    <header class="header">
      <h1>前端作品集</h1>
      <p class="subtitle">Phaser 遊戲與特效</p>
    </header>

    <div class="tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'games' }" 
        @click="changeTab('games')"
      >
        遊戲
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'effects' }" 
        @click="changeTab('effects')"
      >
        特效
      </button>
    </div>

    <div class="projects-list" v-if="activeTab === 'games'">
      <div v-for="game in games" :key="game.id" class="project-item" @click="openProject(game.link)">
        <div class="project-image" :style="{ backgroundImage: `url(@/assets/images/${game.image})` }"></div>
        <div class="project-info">
          <h3>{{ game.title }}</h3>
          <p>{{ game.description }}</p>
          <div class="play-icon">▶</div>
        </div>
      </div>
    </div>

    <div class="projects-list" v-if="activeTab === 'effects'">
      <div v-for="effect in effects" :key="effect.id" class="project-item" @click="openProject(effect.link)">
        <div class="project-image" :style="{ backgroundImage: `url(@/assets/images/${effect.image})` }"></div>
        <div class="project-info">
          <h3>{{ effect.title }}</h3>
          <p>{{ effect.description }}</p>
          <div class="play-icon">▶</div>
        </div>
      </div>
    </div>

    <!-- <footer class="footer">
      <p>© 2025 前端作品集</p>
    </footer> -->
  </div>
</template>

<style scoped>
.mobile-portfolio {
  padding: 1rem;
  font-family: 'Noto Sans TC', sans-serif;
  max-width: 600px;
  margin: 0 auto;
  height: 100vh;
  overflow-y: auto;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0.3rem;
}

.subtitle {
  font-size: 1rem;
  color: #666;
}

.tabs {
  display: flex;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f0f0f0;
}

.tab-btn {
  flex: 1;
  padding: 0.8rem;
  background: transparent;
  border: none;
  color: #555;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  background-color: #3498db;
  color: white;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.project-item {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  height: 100px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.project-item:active {
  transform: scale(0.98);
}

.project-image {
  width: 100px;
  background-size: cover;
  background-position: center;
}

.project-info {
  flex: 1;
  padding: 0.8rem;
  position: relative;
}

.project-info h3 {
  font-size: 1.1rem;
  margin-bottom: 0.3rem;
  color: #333;
}

.project-info p {
  font-size: 0.9rem;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.play-icon {
  position: absolute;
  bottom: 0.8rem;
  right: 0.8rem;
  width: 30px;
  height: 30px;
  background-color: #3498db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
}

.footer {
  margin-top: 2rem;
  text-align: center;
  color: #777;
  font-size: 0.9rem;
  padding-top: 1rem;
  border-top: 1px solid #eaeaea;
}
</style>