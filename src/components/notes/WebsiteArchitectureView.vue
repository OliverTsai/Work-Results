<template>
  <div class="note-detail">
    <div class="note-header">
      <h1>網站服務架構概述</h1>
      <div class="note-tags">
        <span class="tag" v-for="tag in tags" :key="tag">{{ tag }}</span>
      </div>
      <div class="note-meta">
        <span class="date">更新日期: 2025-11-24</span>
      </div>
    </div>

    <div class="note-content">
      <section>
        <h2>1. 整套 Web 服務</h2>
        <p>完整的網站服務架構包含前端和後端服務，形成一個完整的應用系統：</p>
        <ul>
          <li><strong>前端服務</strong>：處理用戶界面和交互，通常包括HTML、CSS和JavaScript</li>
          <li><strong>後端服務</strong>：處理業務邏輯和數據處理，可使用各種程式語言如Python、Node.js、PHP等</li>
          <li><strong>API 服務</strong>：提供數據接口，連接前端與後端</li>
        </ul>
        <p>典型的網站服務架構圖：</p>
        <pre><code>
用戶 → CDN → 負載均衡器 → Web伺服器 → 應用伺服器 → 資料庫
                      ↓
                    快取
        </code></pre>
      </section>

      <section>
        <h2>2. 分布式資料庫</h2>
        <p>分布式資料庫將數據分散存儲在多個伺服器上，提供以下優勢：</p>
        <ul>
          <li>提高數據讀寫效能</li>
          <li>增強系統可靠性和容錯能力</li>
          <li>支援水平擴展，應對高流量</li>
          <li>提供數據備份和災難恢復機制</li>
        </ul>
        <p>常見的分布式資料庫系統：</p>
        <ul>
          <li><strong>MongoDB Sharding</strong>：將數據分散到多個分片</li>
          <li><strong>MySQL Cluster</strong>：MySQL的高可用性分布式解決方案</li>
          <li><strong>Cassandra</strong>：高度可擴展的分布式NoSQL數據庫</li>
          <li><strong>Redis Cluster</strong>：Redis的分布式實現</li>
        </ul>
      </section>

      <section>
        <h2>3. 快取系統</h2>
        <p>快取系統用於存儲頻繁訪問的數據，提高系統效能：</p>
        <ul>
          <li>減輕資料庫負擔</li>
          <li>加速數據存取速度</li>
          <li>降低系統延遲</li>
          <li>提高用戶體驗</li>
        </ul>
        <p>常見的快取解決方案：</p>
        <pre><code>
# Redis 快取配置範例
redis-server --port 6379 --maxmemory 2gb --maxmemory-policy allkeys-lru

# Memcached 快取配置範例
memcached -d -m 2048 -p 11211 -u memcached
        </code></pre>
        <p>快取層次：</p>
        <ul>
          <li><strong>瀏覽器快取</strong>：最靠近用戶的快取層</li>
          <li><strong>CDN快取</strong>：分布式的內容分發網絡</li>
          <li><strong>應用層快取</strong>：如Redis或Memcached</li>
          <li><strong>資料庫查詢快取</strong>：數據庫內建的快取機制</li>
        </ul>
      </section>

      <section>
        <h2>4. 虛擬化技術</h2>
        <p>虛擬化技術將物理伺服器資源分割為多個虛擬環境，提供以下優勢：</p>
        <ul>
          <li>提高資源利用率</li>
          <li>增加部署靈活性</li>
          <li>簡化系統管理</li>
          <li>提供隔離環境</li>
        </ul>
        <p>常見的虛擬化技術：</p>
        <ul>
          <li><strong>虛擬機</strong>：如VMware、VirtualBox、Hyper-V</li>
          <li><strong>容器化</strong>：如Docker、Podman</li>
          <li><strong>容器編排</strong>：如Kubernetes、Docker Swarm</li>
          <li><strong>無伺服器架構</strong>：如AWS Lambda、Azure Functions</li>
        </ul>
      </section>

      <section>
        <h2>5. 自動化部署</h2>
        <p>自動化部署簡化了應用程式的發布和更新流程：</p>
        <ul>
          <li>減少人為錯誤</li>
          <li>加速部署過程</li>
          <li>標準化部署流程</li>
          <li>支援回滾機制</li>
        </ul>
        <p>常見的自動化部署工具：</p>
        <ul>
          <li><strong>CI/CD 工具</strong>：Jenkins、GitLab CI、GitHub Actions</li>
          <li><strong>配置管理工具</strong>：Ansible、Puppet、Chef</li>
          <li><strong>容器編排工具</strong>：Kubernetes、Docker Compose</li>
          <li><strong>基礎設施即代碼</strong>：Terraform、CloudFormation</li>
        </ul>
        <p>簡單的自動化部署流程：</p>
        <pre><code>
代碼提交 → 自動測試 → 構建映像 → 部署到測試環境 → 測試驗證 → 部署到生產環境
        </code></pre>
      </section>

      <section>
        <h2>6. 監控與日誌系統</h2>
        <p>有效的監控與日誌系統對於維護網站服務至關重要：</p>
        <ul>
          <li>即時發現並解決問題</li>
          <li>分析系統性能瓶頸</li>
          <li>追蹤用戶行為和系統事件</li>
          <li>提供安全審計和合規性支持</li>
        </ul>
        <p>常見的監控與日誌工具：</p>
        <ul>
          <li><strong>監控工具</strong>：Prometheus、Grafana、Nagios、Zabbix</li>
          <li><strong>日誌管理</strong>：ELK Stack (Elasticsearch, Logstash, Kibana)、Graylog</li>
          <li><strong>APM 工具</strong>：New Relic、Datadog、Dynatrace</li>
          <li><strong>警報系統</strong>：PagerDuty、OpsGenie</li>
        </ul>
      </section>

      <section>
        <h2>7. 高可用性設計</h2>
        <p>高可用性設計確保服務能夠持續運行，減少停機時間：</p>
        <ul>
          <li>冗餘設計</li>
          <li>負載均衡</li>
          <li>故障轉移機制</li>
          <li>地理分布式部署</li>
        </ul>
        <p>高可用性架構的關鍵組件：</p>
        <ul>
          <li><strong>負載均衡器</strong>：如Nginx、HAProxy、AWS ELB</li>
          <li><strong>服務發現</strong>：如Consul、etcd、ZooKeeper</li>
          <li><strong>數據複製</strong>：主從複製、多主複製</li>
          <li><strong>自動擴展</strong>：根據負載自動調整資源</li>
        </ul>
      </section>

      <section>
        <h2>8. 安全性考量</h2>
        <p>網站服務的安全性是不可忽視的重要方面：</p>
        <ul>
          <li>網絡層安全</li>
          <li>應用層安全</li>
          <li>數據安全</li>
          <li>身份認證與授權</li>
        </ul>
        <p>基本的安全措施：</p>
        <ul>
          <li><strong>HTTPS</strong>：加密傳輸數據</li>
          <li><strong>WAF</strong>：Web應用防火牆</li>
          <li><strong>DDoS 防護</strong>：防止分布式拒絕服務攻擊</li>
          <li><strong>定期安全審計</strong>：檢查系統漏洞</li>
          <li><strong>數據加密</strong>：保護敏感信息</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tags = ref(['後端', '架構', '部署', '系統設計']);
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