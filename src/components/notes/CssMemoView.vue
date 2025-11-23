<template>
  <div class="note-detail">
    <div class="note-header">
      <h1>CSS備忘錄</h1>
      <div class="note-tags">
        <span class="tag" v-for="tag in tags" :key="tag">{{ tag }}</span>
      </div>
      <div class="note-meta">
        <span class="date">更新日期: 2025-11-23</span>
      </div>
    </div>

    <div class="note-content">
      <section>
        <h2>Flex 排版基礎</h2>
        <p>Flexbox 是一種一維的佈局方法，用於在行或列中排列項目：</p>
        <pre><code>
display: flex;
justify-content: space-between; /* 水平方向項目之間平均分配空間 */
justify-content: center; /* 水平置中 */
align-items: center; /* 垂直置中 */
flex-wrap: wrap; /* 允許項目換行 */
        </code></pre>
      </section>

      <section>
        <h2>Grid 排版基礎</h2>
        <p>Grid 是一種二維的佈局方法，同時處理行和列：</p>
        <pre><code>
display: grid;
grid-template-columns: 1fr 1fr 1fr; /* 三等分列 */
grid-template-columns: repeat(3, 1fr); /* 同上，重複三次1fr */
grid-template-rows: 100px auto; /* 第一行高度固定，第二行自動 */
grid-gap: 10px; /* 網格間距 */
gap: 10px; /* 新語法，同上 */
        </code></pre>
        
        <h3>Grid 區域定義</h3>
        <pre><code>
grid-template-areas: 
  "header header header"
  "sidebar content content"
  "footer footer footer";

/* 在子元素中使用 */
.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.footer { grid-area: footer; }
        </code></pre>
        
        <h3>Grid 元素定位</h3>
        <pre><code>
/* 指定元素從第1行開始，跨越3行 */
grid-column: 1 / span 3;
grid-column: 1 / 4; /* 同上，從第1行到第4行(不含) */

/* 指定元素從第1列開始，跨越2列 */
grid-row: 1 / span 2;
grid-row: 1 / 3; /* 同上，從第1列到第3列(不含) */
        </code></pre>
      </section>

      <section>
        <h2>主軸方向(排列方向)</h2>
        <p>控制 flex 容器中項目的排列方向：</p>
        <pre><code>
flex-direction: row; /* 從左到右 (預設值) */
flex-direction: row-reverse; /* 從右到左 */
flex-direction: column; /* 從上到下 */
flex-direction: column-reverse; /* 從下到上 */
        </code></pre>
      </section>

      <section>
        <h2>主軸對齊方式</h2>
        <p>控制 flex 容器中項目在主軸上的對齊方式：</p>
        
        <h3>水平對齊 (justify-content)</h3>
        <pre><code>
justify-content: flex-start; /* 對齊主軸起點 */
justify-content: flex-end; /* 對齊主軸終點 */
justify-content: center; /* 對齊主軸中央 */
justify-content: space-between; /* 分散對齊 (左右邊不留間距) */
justify-content: space-around; /* 分散對齊 (左右邊有留間距，左右邊留間距的一半) */
justify-content: space-evenly; /* 均分對齊 (左右邊有留間距，所有間距一致) */
        </code></pre>

        <h3>垂直對齊 (align-items)</h3>
        <pre><code>
align-items: flex-start; /* 垂直對齊上方 */
align-items: center; /* 垂直置中 */
align-items: flex-end; /* 垂直對齊下方 */
align-items: stretch; /* 拉伸以填滿容器 (預設值) */
align-items: baseline; /* 對齊項目的基線 */
        </code></pre>
      </section>

      <section>
        <h2>常用排版技巧</h2>
        <p>常見的 CSS 排版方法：</p>
        
        <h3>上下排列</h3>
        <pre><code>
display: flex;
flex-direction: column;
        </code></pre>

        <h3>根據畫面位置排版</h3>
        <pre><code>
position: absolute;
top: 40%;
left: 26%;
transform: translate(-50%, -50%);
        </code></pre>
      </section>

      <section>
        <h2>CSS 相對定位示範</h2>
        <p>使用相對定位來精確控制元素位置：</p>
        <pre><code>
.BG {
  position: relative; /* 設定定位上下文 */
  width: 400px;
  height: 300px;
  background-color: lightblue; /* 只是為了示意背景 */
}

.A-img {
  position: absolute; /* 相對於 .BG 定位 */
  right: 10px; /* 距離 .BG 右邊 10px */
  bottom: 10px; /* 距離 .BG 底部 10px */
  transform: translate(-50%, -50%);
  width: 100px; /* 圖片尺寸示意 */
}
        </code></pre>
      </section>

      <section>
        <h2>文字樣式</h2>
        <p>常用的文字樣式設定：</p>
        <pre><code>
font-size: 16px; /* 文字大小 */
font-weight: bold; /* 粗體 */
text-align: center; /* 文字位置置中 */
white-space: nowrap; /* 文字不換行 */
        </code></pre>
      </section>

      <section>
        <h2>圖形與線條</h2>
        <p>創建各種圖形和線條的 CSS：</p>
        
        <h3>框線</h3>
        <pre><code>
border: 1px solid #000;
border-radius: 5px; /* 圓角 */
        </code></pre>

        <h3>直線</h3>
        <pre><code>
.straight-line {
  width: 100%;
  height: 2px;
  background-color: #000;
}
        </code></pre>

        <h3>圓形</h3>
        <pre><code>
.rounded-circle {
  width: 50px; /* 調整圓形的寬度 */
  height: 50px; /* 調整圓形的高度 */
  border-radius: 50%; /* 將寬度和高度的一半設為圓角半徑 */
  background-color: #000; /* 圓形的背景顏色 */
}
        </code></pre>
      </section>

      <section>
        <h2>其他實用技巧</h2>
        <p>常用的 CSS 功能與技巧：</p>
        <ul>
          <li>Y軸能滑動：<code>overflow-y: auto;</code></li>
          <li>Class可以被穿透：<code>pointer-events: none;</code></li>
        </ul>
        
        <h3>背景漸層</h3>
        <pre><code>
background: linear-gradient(to bottom, #957E3C, #463A1A);
background: linear-gradient(
  to bottom, 
  rgba(0,0,0,0.2) 0%, 
  rgba(0,0,0,0.8) 50% 
), 
linear-gradient(
  to bottom, 
  rgba(0,0,0,0.8) 50%, 
  rgba(0,0,0,0.2) 100% 
);
        </code></pre>

        <h3>自訂滾動條樣式</h3>
        <pre><code>
/* 修改垂直滚动条 */
::-webkit-scrollbar {
  width: 10px; /* 滚动条宽度 */
}

/* 滚动槽 */
::-webkit-scrollbar-track {
  background-color: #f1f1f1; /* 滚动槽背景颜色 */
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background-color: #888; /* 滚动条滑块颜色 */
  border-radius: 5px; /* 滚动条滑块圆角 */
}

/* 滚动条滑块悬停时的样式 */
::-webkit-scrollbar-thumb:hover {
  background-color: #555; /* 滚动条滑块悬停时的颜色 */
}
        </code></pre>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tags = ref(['CSS', 'Flexbox', 'Grid', '排版']);
</script>

<style lang="scss" scoped>
.note-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px 40px;
  height: 100%;
  
  .note-header {
    margin-bottom: 30px;
    border-bottom: 1px solid #eee;
    padding-bottom: 20px;
    
    h1 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
      font-size: 2rem;
    }
    
    .note-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 10px;
      
      .tag {
        padding: 5px 10px;
        background-color: #e8f0fe;
        color: #4a90e2;
        border-radius: 16px;
        font-size: 14px;
      }
    }
    
    .note-meta {
      font-size: 14px;
      color: #666;
    }
  }
  
  .note-content {
    line-height: 1.6;
    
    section {
      margin-bottom: 30px;
      
      h2 {
        margin-top: 30px;
        margin-bottom: 15px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f0f0f0;
        color: #2c3e50;
        font-size: 1.5rem;
      }
      
      h3 {
        margin-top: 25px;
        margin-bottom: 10px;
        color: #34495e;
        font-size: 1.25rem;
      }
      
      p {
        margin-bottom: 15px;
        font-size: 16px;
      }
      
      ul, ol {
        padding-left: 20px;
        margin-bottom: 15px;
        
        li {
          margin-bottom: 8px;
          font-size: 16px;
        }
      }
      
      pre {
        background-color: #f8f8f8;
        border-radius: 5px;
        padding: 15px;
        overflow-x: auto;
        margin: 15px 0;
        border: 1px solid #eee;
        
        code {
          font-family: 'Courier New', Courier, monospace;
          font-size: 14px;
          color: #333;
          white-space: pre-wrap;
          word-break: break-all;
        }
      }
    }
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .note-detail {
    padding: 0 15px 30px;
    
    .note-header {
      h1 {
        font-size: 1.5rem;
      }
    }
    
    .note-content {
      section {
        h2 {
          font-size: 1.3rem;
        }
        
        h3 {
          font-size: 1.1rem;
        }
        
        p, li {
          font-size: 15px;
        }
        
        pre {
          padding: 10px;
          
          code {
            font-size: 13px;
          }
        }
      }
    }
  }
}

/* 適應不同的螢幕寬度 */
@media (max-width: 480px) {
  .note-detail {
    .note-header {
      .note-tags {
        .tag {
          padding: 4px 8px;
          font-size: 12px;
        }
      }
    }
    
    .note-content {
      section {
        pre {
          code {
            font-size: 12px;
          }
        }
      }
    }
  }
}

/* 確保代碼區塊在小螢幕上正確顯示 */
@media (max-width: 600px) {
  .note-detail {
    .note-content {
      section {
        pre {
          margin: 10px -15px;
          border-radius: 0;
          border-left: none;
          border-right: none;
          padding: 10px 15px;
        }
      }
    }
  }
}
</style>