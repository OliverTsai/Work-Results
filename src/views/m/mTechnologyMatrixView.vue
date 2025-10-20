<template>
  <div class="m-technology-matrix-container">
    <div class="m-header">
      <h1>前端工程師能力矩陣</h1>
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
        <p>根據前端工程師能力矩陣的評估，我的技術能力主要集中在<strong>進階(Senior)</strong>到<strong>架構師(Architect)</strong>層級，特別是在狀態管理、前端架構設計和複雜業務邏輯實現方面達到了架構師水平。</p>
        
        <h4>我的主要優勢：</h4>
        <ul>
          <li>熟練掌握現代前端技術棧（Vue 3、TypeScript、Vite）</li>
          <li>具備良好的架構設計能力，代碼結構清晰，模塊化程度高</li>
          <li>能夠處理複雜的業務邏輯，特別是在遊戲開發和實時通信方面</li>
          <li>實現了穩健的錯誤處理和恢復機制</li>
          <li>具備良好的性能優化意識</li>
        </ul>
        
        <h4>未來成長方向：</h4>
        <ul>
          <li>增強自動化測試覆蓋率，提高代碼質量和穩定性</li>
          <li>進一步優化用戶體驗設計，引入更專業的UI設計系統</li>
          <li>持續學習最新前端技術，保持技術競爭力</li>
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
    name: '前端基礎技術能力',
    skills: [
      {
        name: 'HTML/CSS/JavaScript 掌握程度',
        myLevel: 'senior',
        levels: {
          junior: '掌握基本語法和使用方法',
          mid: '熟練使用，能解決常見問題',
          senior: '精通三者，能處理複雜場景，了解底層原理',
          architect: '深度理解語言特性，能優化性能，指導團隊最佳實踐'
        }
      },
      {
        name: '框架使用能力',
        myLevel: 'senior',
        levels: {
          junior: '能使用框架完成基本功能',
          mid: '熟練使用框架特性和API',
          senior: '精通框架原理，能靈活應用框架特性',
          architect: '深度理解框架設計思想，能定制和擴展框架'
        }
      },
      {
        name: 'TypeScript 應用能力',
        myLevel: 'senior',
        levels: {
          junior: '了解基本類型和語法',
          mid: '能在項目中使用TypeScript',
          senior: '精通TypeScript，熟練使用高級特性',
          architect: '深度理解類型系統，能設計複雜類型結構'
        }
      }
    ]
  },
  {
    name: '前端工程化能力',
    skills: [
      {
        name: '構建工具使用',
        myLevel: 'senior',
        levels: {
          junior: '能使用基本的構建命令',
          mid: '熟悉常用構建配置',
          senior: '精通構建工具，能優化構建流程',
          architect: '能設計定制化構建系統，優化大型項目構建'
        }
      },
      {
        name: '自動化測試能力',
        myLevel: 'mid',
        levels: {
          junior: '了解測試的基本概念',
          mid: '能編寫單元測試和集成測試',
          senior: '熟練設計測試策略，提高測試覆蓋率',
          architect: '建立完整測試體系，指導團隊測試實踐'
        }
      },
      {
        name: '前端性能優化',
        myLevel: 'senior',
        levels: {
          junior: '了解基本優化方法',
          mid: '能應用常見優化技巧',
          senior: '精通多種優化策略，能解決複雜性能問題',
          architect: '系統性思考性能問題，建立性能監控和優化體系'
        }
      }
    ]
  },
  {
    name: '前端架構設計能力',
    skills: [
      {
        name: '組件設計能力',
        myLevel: 'senior',
        levels: {
          junior: '能使用現有組件',
          mid: '能開發基本組件',
          senior: '能設計可復用的組件系統',
          architect: '能設計高度抽象的組件架構'
        }
      },
      {
        name: '狀態管理能力',
        myLevel: 'architect',
        levels: {
          junior: '了解基本狀態管理概念',
          mid: '能使用狀態管理庫',
          senior: '熟練使用複雜狀態管理策略',
          architect: '設計大型應用的狀態管理架構'
        }
      },
      {
        name: '前端架構設計',
        myLevel: 'architect',
        levels: {
          junior: '了解基本架構概念',
          mid: '能在現有架構下開發',
          senior: '能設計中小型應用架構',
          architect: '能設計大型複雜應用架構，考慮擴展性和維護性'
        }
      }
    ]
  },
  {
    name: '前端業務能力',
    skills: [
      {
        name: '業務邏輯實現',
        myLevel: 'architect',
        levels: {
          junior: '能實現簡單業務邏輯',
          mid: '能實現中等複雜度業務',
          senior: '能實現複雜業務邏輯和流程',
          architect: '能設計和優化複雜業務系統'
        }
      },
      {
        name: '用戶體驗設計',
        myLevel: 'senior',
        levels: {
          junior: '關注基本用戶體驗',
          mid: '能實現良好的交互體驗',
          senior: '能從用戶角度優化體驗',
          architect: '建立系統化的用戶體驗設計體系'
        }
      },
      {
        name: '前端安全性',
        myLevel: 'senior',
        levels: {
          junior: '了解基本安全概念',
          mid: '能應對常見安全問題',
          senior: '熟練處理各類安全威脅',
          architect: '建立前端安全體系和最佳實踐'
        }
      }
    ]
  },
  {
    name: '前端創新能力',
    skills: [
      {
        name: '技術探索能力',
        myLevel: 'architect',
        levels: {
          junior: '學習新技術',
          mid: '嘗試應用新技術',
          senior: '評估和引入新技術',
          architect: '引領技術趨勢和創新'
        }
      },
      {
        name: '問題解決能力',
        myLevel: 'architect',
        levels: {
          junior: '解決簡單問題',
          mid: '解決常見技術難題',
          senior: '解決複雜技術問題',
          architect: '解決系統性和創新性問題'
        }
      }
    ]
  },
  {
    name: '前端協作能力',
    skills: [
      {
        name: '代碼規範遵循',
        myLevel: 'senior',
        levels: {
          junior: '了解基本規範',
          mid: '遵循團隊規範',
          senior: '制定和優化規範',
          architect: '建立完整的代碼質量體系'
        }
      },
      {
        name: '版本控制使用',
        myLevel: 'senior',
        levels: {
          junior: '基本的提交和合併',
          mid: '熟練使用分支策略',
          senior: '優化工作流程和協作模式',
          architect: '設計大型項目的版本控制策略'
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
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(75, 192, 192, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(75, 192, 192, 1)'
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
  height: 100%;
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