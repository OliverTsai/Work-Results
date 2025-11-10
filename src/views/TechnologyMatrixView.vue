<template>
  <div class="technology-matrix-container">
    <div class="header">
      <h1>前端工程師能力矩陣</h1>
      <p class="subtitle">個人技能評估與成長路徑</p>
    </div>

    <div class="level-indicator">
      <div class="level-item" v-for="(level, index) in levels" :key="index">
        <div class="level-badge" :class="level.class">{{ level.shortName }}</div>
        <div class="level-name">{{ level.name }}</div>
      </div>
    </div>

    <div class="matrix-section" v-for="(category, index) in skillMatrix" :key="index">
      <h2 class="category-title">{{ index + 1 }}. {{ category.name }}</h2>
      
      <div class="skill-table">
        <table>
          <thead>
            <tr>
              <th class="skill-name-header">能力項目</th>
              <th v-for="level in levels" :key="level.id" class="level-header">{{ level.name }}</th>
              <th class="current-level-header">我的水平</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(skill, skillIndex) in category.skills" :key="skillIndex">
              <td class="skill-name">{{ skill.name }}</td>
              <td v-for="level in levels" :key="level.id" class="skill-level-cell">
                <div class="skill-description" v-if="skill.levels[level.id as keyof typeof skill.levels]">
                  {{ skill.levels[level.id as keyof typeof skill.levels] }}
                </div>
              </td>
              <td class="my-level-cell">
                <div class="level-badge" :class="getMyLevelClass(skill.myLevel)">
                  {{ getMyLevelShortName(skill.myLevel) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="summary-section">
      <h2>綜合評估</h2>
      <div class="radar-chart-container">
        <canvas ref="radarChart"></canvas>
      </div>
      <div class="summary-text">
        <h3>技能總結</h3>
        <p>根據前端工程師能力矩陣的評估，我的技術能力主要集中在<strong>進階(Senior)</strong>到<strong>架構師(Architect)</strong>層級，特別是在狀態管理、前端架構設計和複雜業務邏輯實現方面達到了架構師水平。</p>
        <p>我的主要優勢在於：</p>
        <ul>
          <li>熟練掌握現代前端技術棧（Vue 3、TypeScript、Vite）</li>
          <li>具備良好的架構設計能力，代碼結構清晰，模塊化程度高</li>
          <li>能夠處理複雜的業務邏輯，特別是在遊戲開發和實時通信方面</li>
          <li>實現了穩健的錯誤處理和恢復機制</li>
          <li>具備良好的性能優化意識</li>
        </ul>
        <p>未來成長方向：</p>
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
import { ref, onMounted } from 'vue';
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
const radarChart = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (radarChart.value) {
    // 準備雷達圖數據
    const categories = skillMatrix.map(category => category.name);
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

    new Chart(radarChart.value, {
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
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 4,
            ticks: {
              stepSize: 1,
              callback: function(value) {
                if (value === 1) return '初級';
                if (value === 2) return '中階';
                if (value === 3) return '進階';
                if (value === 4) return '架構師';
                return '';
              }
            }
          }
        }
      }
    });
  }
});
</script>

<style lang="scss" scoped>
.technology-matrix-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  height: 100vh;
  overflow-y: auto;
  font-family: 'Noto Sans TC', sans-serif;
  color: #333;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: #2c3e50;
  }
  
  .subtitle {
    font-size: 1.2rem;
    color: #666;
  }
}

.level-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  
  .level-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 1rem;
    
    .level-badge {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .level-name {
      font-size: 0.9rem;
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

.matrix-section {
  margin-bottom: 3rem;
  
  .category-title {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #eee;
    color: #2c3e50;
  }
}

.skill-table {
  width: 100%;
  overflow-x: auto;
  
  table {
    width: 100%;
    border-collapse: collapse;
    
    th, td {
      padding: 1rem;
      border: 1px solid #ddd;
    }
    
    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    
    .skill-name-header {
      width: 15%;
    }
    
    .level-header {
      width: 20%;
    }
    
    .current-level-header {
      width: 10%;
    }
    
    .skill-name {
      font-weight: bold;
    }
    
    .skill-level-cell {
      vertical-align: top;
      font-size: 0.9rem;
    }
    
    .my-level-cell {
      text-align: center;
      
      .level-badge {
        display: inline-block;
        padding: 0.3rem 0.6rem;
        border-radius: 4px;
        font-weight: bold;
      }
    }
  }
}

.summary-section {
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  
  h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #2c3e50;
  }
  
  .radar-chart-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto 2rem;
    height: 400px;
  }
  
  .summary-text {
    h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #2c3e50;
    }
    
    p {
      margin-bottom: 1rem;
      line-height: 1.6;
    }
    
    ul {
      margin-bottom: 1.5rem;
      padding-left: 1.5rem;
      
      li {
        margin-bottom: 0.5rem;
        line-height: 1.6;
      }
    }
    
    strong {
      color: #2c3e50;
    }
  }
}

@media (max-width: 768px) {
  .technology-matrix-container {
    padding: 1rem;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .skill-table {
    font-size: 0.9rem;
    
    th, td {
      padding: 0.75rem 0.5rem;
    }
  }
  
  .level-indicator {
    flex-wrap: wrap;
    
    .level-item {
      margin-bottom: 1rem;
    }
  }
}
</style>