<template>
  <div class="m-technology-matrix-container">
    <div class="m-header">
      <h1>後端工程師能力矩陣</h1>
      <p class="m-subtitle">個人技能評估與成長路徑</p>
    </div>

    <div class="m-level-legend">
      <h3>能力等級說明</h3>
      <div class="m-level-grid">
        <div class="m-level-item" v-for="(level, index) in levels" :key="index">
          <div class="m-level-badge" :class="level.class">{{ level.shortName }}</div>
          <div class="m-level-name">{{ level.name }}</div>
        </div>
      </div>
    </div>

    <!-- 類別選擇器 -->
    <div class="m-category-selector">
      <label for="category-select">選擇技能類別：</label>
      <select id="category-select" v-model="selectedCategoryIndex">
        <option v-for="(category, index) in skillMatrix" :key="index" :value="index">
          {{ index + 1 }}. {{ category.name }}
        </option>
      </select>
    </div>

    <!-- 當前選擇的類別 -->
    <div class="m-matrix-section" v-if="selectedCategory">
      <h2 class="m-category-title">{{ selectedCategoryIndex + 1 }}. {{ selectedCategory.name }}</h2>
      
      <div class="m-skill-cards">
        <div class="m-skill-card" v-for="(skill, skillIndex) in selectedCategory.skills" :key="skillIndex">
          <div class="m-skill-header">
            <h3 class="m-skill-name">{{ skill.name }}</h3>
            <div class="m-level-badge" :class="getMyLevelClass(skill.myLevel)">
              {{ getMyLevelShortName(skill.myLevel) }}
            </div>
          </div>
          
          <div class="m-skill-levels">
            <div class="m-level-detail" v-for="level in levels" :key="level.id">
              <div class="m-level-label" :class="level.class">{{ level.shortName }}</div>
              <div class="m-level-description">
                {{ skill.levels[level.id as keyof typeof skill.levels] || '-' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="m-summary-section">
      <h2>綜合評估</h2>
      <div class="m-radar-chart-container">
        <canvas ref="mRadarChart"></canvas>
      </div>
      <div class="m-summary-text">
        <h3>技能總結</h3>
        <p>根據後端工程師能力矩陣的評估，我的技術能力主要集中在<strong>中階(Mid-Level)</strong>到<strong>進階(Senior)</strong>層級，特別是在DevOps與自動化方面達到了進階水平。</p>
        
        <h4>我的主要優勢：</h4>
        <ul>
          <li>系統運維和DevOps技能非常扎實</li>
          <li>對容器化技術和環境部署有豐富經驗</li>
          <li>對網絡安全和服務器配置有深入了解</li>
          <li>能夠使用多種資料庫技術(PostgreSQL和MongoDB)</li>
          <li>掌握了Flask框架的基本使用，能夠建立RESTful API服務</li>
        </ul>
        
        <h4>未來成長方向：</h4>
        <ul>
          <li>深入學習更多設計模式和架構原則，提升系統設計能力</li>
          <li>增強自動化測試和CI/CD流程的實踐</li>
          <li>學習微服務架構和容器編排技術(如Kubernetes)</li>
          <li>探索更多現代API技術(GraphQL、gRPC)和事件驅動架構</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

// 定義技能等級
const levels = [
  { id: 'junior', name: '初級 (Junior)', shortName: 'Jr', class: 'level-junior' },
  { id: 'mid', name: '中階 (Mid-Level)', shortName: 'Mid', class: 'level-mid' },
  { id: 'senior', name: '進階 (Senior)', shortName: 'Sr', class: 'level-senior' },
  { id: 'architect', name: '架構師 (Architect)', shortName: 'Arch', class: 'level-architect' }
];

// 技能矩陣數據
const skillMatrix = [
  {
    name: '程式與邏輯能力',
    skills: [
      {
        name: '程式語言掌握程度',
        myLevel: 'mid',
        levels: {
          junior: '了解基本語法和使用方法',
          mid: '熟練使用Python Flask進行後端開發，能設置完整的應用程式結構',
          senior: '精通多種後端語言，能處理複雜邏輯，了解底層原理',
          architect: '深度理解語言特性，能優化性能，指導團隊最佳實踐'
        }
      },
      {
        name: '框架使用能力',
        myLevel: 'mid',
        levels: {
          junior: '能使用框架完成基本功能',
          mid: '熟練使用Flask框架，能建立RESTful API服務',
          senior: '精通多種後端框架，能靈活應用框架特性',
          architect: '深度理解框架設計思想，能定制和擴展框架'
        }
      },
      {
        name: '程式碼品質管理',
        myLevel: 'mid',
        levels: {
          junior: '了解基本的程式碼規範',
          mid: '能夠組織良好的程式碼結構',
          senior: '熟練應用設計模式和重構技巧',
          architect: '建立完整的程式碼質量管理體系'
        }
      }
    ]
  },
  {
    name: '資料庫設計與操作',
    skills: [
      {
        name: '資料庫使用能力',
        myLevel: 'mid',
        levels: {
          junior: '能進行基本的資料庫操作',
          mid: '能同時使用SQL和NoSQL資料庫，了解基本的資料庫操作和配置',
          senior: '精通資料庫優化技術和複雜查詢',
          architect: '能設計高性能、可擴展的資料庫架構'
        }
      },
      {
        name: '資料模型設計',
        myLevel: 'mid',
        levels: {
          junior: '了解基本的資料表設計',
          mid: '能設計合理的資料庫結構',
          senior: '熟練設計複雜關係的資料模型',
          architect: '能設計大規模、高效能的資料架構'
        }
      },
      {
        name: '資料庫管理',
        myLevel: 'mid',
        levels: {
          junior: '了解基本的資料庫管理操作',
          mid: '了解資料庫備份和管理的基本概念',
          senior: '熟練進行資料庫優化和維護',
          architect: '設計完整的資料庫管理策略和災難恢復方案'
        }
      }
    ]
  },
  {
    name: 'API與系統整合',
    skills: [
      {
        name: 'API設計能力',
        myLevel: 'mid',
        levels: {
          junior: '能開發基本的API端點',
          mid: '了解RESTful API設計和基本的認證機制',
          senior: '能設計高效、安全的API架構',
          architect: '能設計大型系統的API策略和標準'
        }
      },
      {
        name: '系統整合能力',
        myLevel: 'mid',
        levels: {
          junior: '能進行簡單的系統連接',
          mid: '能整合多個服務和API',
          senior: '熟練設計和實現複雜系統整合',
          architect: '設計企業級系統整合架構'
        }
      },
      {
        name: '認證與授權',
        myLevel: 'mid',
        levels: {
          junior: '了解基本的認證概念',
          mid: '能實現JWT等認證機制',
          senior: '熟練實現複雜的權限控制系統',
          architect: '設計企業級身份認證和授權架構'
        }
      }
    ]
  },
  {
    name: '系統架構設計',
    skills: [
      {
        name: '架構設計能力',
        myLevel: 'mid',
        levels: {
          junior: '了解基本的系統架構',
          mid: '了解前後端分離架構，能設計多服務系統',
          senior: '能設計可擴展的系統架構',
          architect: '能設計大型分散式系統架構'
        }
      },
      {
        name: '容器化技術',
        myLevel: 'senior',
        levels: {
          junior: '了解容器基本概念',
          mid: '能使用Docker部署應用',
          senior: '掌握Docker容器化技術，能配置多容器環境',
          architect: '精通容器編排和微服務架構設計'
        }
      },
      {
        name: '系統設計模式',
        myLevel: 'mid',
        levels: {
          junior: '了解基本設計模式',
          mid: '能應用常見設計模式',
          senior: '熟練應用多種架構模式',
          architect: '能設計創新的架構解決方案'
        }
      }
    ]
  },
  {
    name: '資料同步與一致性',
    skills: [
      {
        name: '資料一致性處理',
        myLevel: 'mid',
        levels: {
          junior: '了解基本的資料一致性概念',
          mid: '能處理基本的資料同步問題',
          senior: '熟練處理複雜的資料一致性挑戰',
          architect: '設計高可靠的分散式資料系統'
        }
      },
      {
        name: '事務處理',
        myLevel: 'mid',
        levels: {
          junior: '了解基本的事務概念',
          mid: '能正確使用資料庫事務',
          senior: '熟練處理分散式事務',
          architect: '設計高效的事務處理策略'
        }
      }
    ]
  },
  {
    name: '效能與可用性',
    skills: [
      {
        name: '系統效能優化',
        myLevel: 'mid',
        levels: {
          junior: '了解基本的效能概念',
          mid: '了解基本的效能優化技術',
          senior: '熟練進行系統效能調校',
          architect: '設計高效能的系統架構'
        }
      },
      {
        name: '高可用性設計',
        myLevel: 'mid',
        levels: {
          junior: '了解基本的可用性概念',
          mid: '了解高可用性概念',
          senior: '能設計高可用系統',
          architect: '設計企業級高可用架構'
        }
      },
      {
        name: '快取策略',
        myLevel: 'mid',
        levels: {
          junior: '了解基本的快取概念',
          mid: '能使用快取技術',
          senior: '熟練設計快取策略',
          architect: '設計分散式快取系統'
        }
      }
    ]
  },
  {
    name: 'DevOps與自動化',
    skills: [
      {
        name: '部署自動化',
        myLevel: 'senior',
        levels: {
          junior: '了解基本的部署流程',
          mid: '能進行自動化部署',
          senior: '掌握Docker、自動化部署腳本等DevOps技能',
          architect: '設計完整的CI/CD流程'
        }
      },
      {
        name: '系統監控',
        myLevel: 'senior',
        levels: {
          junior: '了解基本的監控概念',
          mid: '能設置基本的系統監控',
          senior: '熟練配置全面的監控系統',
          architect: '設計企業級監控策略'
        }
      },
      {
        name: '系統運維',
        myLevel: 'senior',
        levels: {
          junior: '能進行基本的系統維護',
          mid: '能處理常見運維問題',
          senior: '掌握Linux系統管理、自動化部署等運維技能',
          architect: '設計企業級運維策略'
        }
      }
    ]
  },
  {
    name: '安全與權限控制',
    skills: [
      {
        name: '網絡安全',
        myLevel: 'senior',
        levels: {
          junior: '了解基本的安全概念',
          mid: '能處理常見的安全問題',
          senior: '了解SSL證書配置、防火牆設置等安全措施',
          architect: '設計完整的安全架構'
        }
      },
      {
        name: '權限管理',
        myLevel: 'mid',
        levels: {
          junior: '了解基本的權限概念',
          mid: '能實現基本的權限控制',
          senior: '熟練設計複雜的權限系統',
          architect: '設計企業級權限管理架構'
        }
      }
    ]
  },
  {
    name: '測試與品質管理',
    skills: [
      {
        name: '測試策略',
        myLevel: 'junior',
        levels: {
          junior: '了解基本的測試概念',
          mid: '能編寫單元測試和整合測試',
          senior: '熟練設計測試策略',
          architect: '建立完整的測試體系'
        }
      },
      {
        name: '自動化測試',
        myLevel: 'junior',
        levels: {
          junior: '了解自動化測試概念',
          mid: '能實現基本的自動化測試',
          senior: '熟練設計自動化測試框架',
          architect: '建立企業級測試自動化策略'
        }
      }
    ]
  },
  {
    name: '雲與分散式架構',
    skills: [
      {
        name: '雲服務使用',
        myLevel: 'mid',
        levels: {
          junior: '了解基本的雲服務概念',
          mid: '了解虛擬化技術和容器化部署',
          senior: '熟練使用雲平台服務',
          architect: '設計雲原生架構'
        }
      },
      {
        name: '分散式系統',
        myLevel: 'mid',
        levels: {
          junior: '了解分散式系統基本概念',
          mid: '了解基本的分散式系統概念',
          senior: '熟練設計分散式系統',
          architect: '設計高可靠的大型分散式系統'
        }
      }
    ]
  }
];

// 選擇的類別索引
const selectedCategoryIndex = ref(0);

// 計算當前選擇的類別
const selectedCategory = computed(() => {
  return skillMatrix[selectedCategoryIndex.value];
});

// 獲取我的等級對應的樣式類
function getMyLevelClass(level: string): string {
  const levelObj = levels.find(l => l.id === level);
  return levelObj ? levelObj.class : '';
}

// 獲取我的等級對應的簡稱
function getMyLevelShortName(level: string): string {
  const levelObj = levels.find(l => l.id === level);
  return levelObj ? levelObj.shortName : '';
}

// 雷達圖
const mRadarChart = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

onMounted(() => {
  if (mRadarChart.value) {
    renderRadarChart();
  }
});

function renderRadarChart() {
  if (mRadarChart.value) {
    // 準備雷達圖數據
    const categories = skillMatrix.map(category => {
      // 簡化長類別名稱以適應移動設備
      const name = category.name;
      return name.length > 8 ? name.substring(0, 8) + '...' : name;
    });
    
    const levelValues = {
      junior: 1,
      mid: 2,
      senior: 3,
      architect: 4
    };
    
    // 計算每個類別的平均水平
    const categoryLevels = skillMatrix.map(category => {
      const sum = category.skills.reduce((acc, skill) => {
        return acc + levelValues[skill.myLevel as keyof typeof levelValues];
      }, 0);
      return sum / category.skills.length;
    });

    // 如果已有圖表實例，先銷毀
    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(mRadarChart.value, {
      type: 'radar',
      data: {
        labels: categories,
        datasets: [{
          label: '技能水平',
          data: categoryLevels,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 4,
            ticks: {
              stepSize: 1,
              callback: function(value) {
                if (value === 1) return 'Jr';
                if (value === 2) return 'Mid';
                if (value === 3) return 'Sr';
                if (value === 4) return 'Arch';
                return '';
              },
              font: {
                size: 10
              }
            },
            pointLabels: {
              font: {
                size: 10
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: function(tooltipItems) {
                const index = tooltipItems[0].dataIndex;
                return skillMatrix[index].name;
              }
            }
          }
        }
      }
    });
  }
}
</script>

<style lang="scss" scoped>
.m-technology-matrix-container {
  padding: 1rem;
  height: 100vh;
  overflow-y: auto;
  font-family: 'Noto Sans TC', sans-serif;
  color: #333;
}

.m-header {
  text-align: center;
  margin-bottom: 1.5rem;
  
  h1 {
    font-size: 1.8rem;
    margin-bottom: 0.3rem;
    color: #2c3e50;
  }
  
  .m-subtitle {
    font-size: 1rem;
    color: #666;
  }
}

.m-level-legend {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  
  h3 {
    font-size: 1.2rem;
    margin-bottom: 0.8rem;
    color: #2c3e50;
  }
  
  .m-level-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
    
    .m-level-item {
      display: flex;
      align-items: center;
      
      .m-level-badge {
        padding: 0.3rem 0.6rem;
        border-radius: 4px;
        font-weight: bold;
        margin-right: 0.5rem;
        font-size: 0.8rem;
      }
      
      .m-level-name {
        font-size: 0.8rem;
      }
    }
  }
}

.level-junior {
  background-color: #4caf50;
  color: white;
}

.level-mid {
  background-color: #2196f3;
  color: white;
}

.level-senior {
  background-color: #ff9800;
  color: white;
}

.level-architect {
  background-color: #f44336;
  color: white;
}

.m-category-selector {
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
    color: #2c3e50;
  }
  
  select {
    width: 100%;
    padding: 0.8rem;
    border-radius: 8px;
    border: 1px solid #ddd;
    background-color: white;
    font-size: 1rem;
    color: #333;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1em;
  }
}

.m-matrix-section {
  margin-bottom: 2rem;
  
  .m-category-title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #eee;
    color: #2c3e50;
  }
}

.m-skill-cards {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  .m-skill-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    
    .m-skill-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background-color: #f9f9f9;
      border-bottom: 1px solid #eee;
      
      .m-skill-name {
        font-size: 1.1rem;
        margin: 0;
        color: #2c3e50;
      }
      
      .m-level-badge {
        padding: 0.3rem 0.6rem;
        border-radius: 4px;
        font-weight: bold;
        font-size: 0.8rem;
      }
    }
    
    .m-skill-levels {
      padding: 0.5rem;
      
      .m-level-detail {
        display: flex;
        margin-bottom: 0.8rem;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .m-level-label {
          flex: 0 0 40px;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-weight: bold;
          font-size: 0.7rem;
          text-align: center;
          margin-right: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .m-level-description {
          flex: 1;
          font-size: 0.9rem;
          line-height: 1.4;
        }
      }
    }
  }
}

.m-summary-section {
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 1.2rem;
    color: #2c3e50;
  }
  
  .m-radar-chart-container {
    width: 100%;
    height: 300px;
    margin: 0 auto 1.5rem;
  }
  
  .m-summary-text {
    h3 {
      font-size: 1.3rem;
      margin-bottom: 0.8rem;
      color: #2c3e50;
    }
    
    h4 {
      font-size: 1.1rem;
      margin: 1.2rem 0 0.5rem;
      color: #2c3e50;
    }
    
    p {
      margin-bottom: 0.8rem;
      line-height: 1.5;
      font-size: 0.95rem;
    }
    
    ul {
      margin-bottom: 1.2rem;
      padding-left: 1.2rem;
      
      li {
        margin-bottom: 0.5rem;
        line-height: 1.5;
        font-size: 0.95rem;
      }
    }
    
    strong {
      color: #2c3e50;
    }
  }
}
</style>