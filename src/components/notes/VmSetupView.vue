<template>
  <div class="note-detail">
    <div class="note-header">
      <h1>虛擬機設置指南</h1>
      <div class="note-tags">
        <span class="tag" v-for="tag in tags" :key="tag">{{ tag }}</span>
      </div>
      <div class="note-meta">
        <span class="date">更新日期: 2025-11-24</span>
      </div>
    </div>

    <div class="note-content">
      <section>
        <h2>1. 選擇並下載 Ubuntu 映像檔</h2>
        <p>在開始設置虛擬機之前，需要先選擇並下載合適的 Ubuntu 映像檔：</p>
        <ul>
          <li>建議使用 LTS (Long Term Support) 版本，這些版本提供長期支持和更新</li>
          <li>穩定的 LTS 版本包括：16.04、18.04、20.04、22.04</li>
          <li>從 <a href="https://ubuntu.com/download/server" target="_blank">Ubuntu 官網</a> 下載所需版本</li>
        </ul>
        <p>選擇 LTS 版本的優勢：</p>
        <ul>
          <li>更穩定的系統表現</li>
          <li>長期安全更新支持（通常為5年）</li>
          <li>更廣泛的軟體兼容性</li>
        </ul>
      </section>

      <section>
        <h2>2. 安裝 VirtualBox</h2>
        <p>VirtualBox 是一款功能強大的開源虛擬機軟件：</p>
        <ol>
          <li>從 <a href="https://www.virtualbox.org/wiki/Downloads" target="_blank">VirtualBox 官網</a> 下載對應作業系統的安裝檔</li>
          <li>運行安裝檔並按照安裝精靈的指示完成安裝</li>
          <li>安裝完成後啟動 VirtualBox</li>
        </ol>
        <p>VirtualBox 支援的主要平台：</p>
        <ul>
          <li>Windows</li>
          <li>macOS</li>
          <li>Linux</li>
          <li>Solaris</li>
        </ul>
      </section>

      <section>
        <h2>3. 建立 Ubuntu 虛擬機</h2>
        <p>在 VirtualBox 中創建一個新的虛擬機：</p>
        <ol>
          <li>啟動 VirtualBox 並點擊「新增」按鈕</li>
          <li>填寫虛擬機名稱（例如：ubuntu-server）</li>
          <li>選擇類型為「Linux」，版本選擇「Ubuntu (64-bit)」</li>
          <li>選擇下載的 Ubuntu ISO 映像檔作為啟動媒體</li>
        </ol>
        <p>無人值守安裝選項：</p>
        <ul>
          <li>如果想要自己進行手動安裝，可以勾選「Skip Unattended Installation」</li>
          <li>如果選擇無人值守安裝，需要設置用戶名和密碼</li>
        </ul>
        <pre><code>
# 無人值守安裝配置示例
Username: vboxuser
Password: ********
Hostname: ubuntu-server
Domain Name: myguest.virtualbox.org
        </code></pre>
      </section>

      <section>
        <h2>4. 配置虛擬機硬體資源</h2>
        <p>根據您的需求和主機配置，為虛擬機分配適當的硬體資源：</p>
        <h3>4.1 記憶體 (RAM)</h3>
        <p>記憶體是系統的短期資料儲存區，存放電腦正在使用中的資訊：</p>
        <ul>
          <li>最低建議：1024MB</li>
          <li>一般建議：2048MB</li>
          <li>伺服器環境建議：4096MB 或更高</li>
        </ul>
        
        <h3>4.2 處理器 (CPU)</h3>
        <p>CPU 是電腦的中央處理器，負責執行計算任務：</p>
        <ul>
          <li>最低建議：1 核心</li>
          <li>一般建議：2 核心</li>
          <li>高負載環境建議：4 核心或更多</li>
        </ul>
        <p>注意：分配給虛擬機的核心數不應超過主機實際可用的核心數</p>
        
        <h3>4.3 啟用 EFI (可選)</h3>
        <p>某些特殊操作系統可能需要啟用 EFI 支持</p>
      </section>

      <section>
        <h2>5. 配置儲存空間</h2>
        <p>為虛擬機配置適當的儲存空間：</p>
        <h3>5.1 創建虛擬硬碟</h3>
        <ul>
          <li>選擇「Create a Virtual Hard Disk Now」</li>
          <li>設置磁碟大小（建議至少 25GB）</li>
          <li>可選擇是否預先分配完整大小（Pre-allocate Full Size）</li>
        </ul>
        
        <h3>5.2 硬碟類型選擇</h3>
        <ul>
          <li><strong>VDI (VirtualBox Disk Image)</strong>：VirtualBox 默認格式</li>
          <li><strong>VMDK (Virtual Machine Disk)</strong>：與 VMware 兼容</li>
          <li><strong>VHD (Virtual Hard Disk)</strong>：與 Microsoft 虛擬化產品兼容</li>
        </ul>
        
        <h3>5.3 存儲分配方式</h3>
        <ul>
          <li><strong>動態分配</strong>：隨著使用逐漸增長，節省磁碟空間</li>
          <li><strong>固定大小</strong>：一次性分配所有空間，性能較好但佔用空間大</li>
        </ul>
      </section>

      <section>
        <h2>6. 網絡設置</h2>
        <p>配置虛擬機的網絡連接方式：</p>
        <h3>6.1 網絡模式選擇</h3>
        <ul>
          <li><strong>NAT</strong>：虛擬機可以訪問外部網絡，但外部無法直接訪問虛擬機</li>
          <li><strong>橋接網卡</strong>：虛擬機獲得與主機相同網絡環境的獨立IP地址</li>
          <li><strong>Host-only</strong>：僅主機與虛擬機之間可以通信</li>
          <li><strong>內部網絡</strong>：僅虛擬機之間可以通信</li>
        </ul>
        <p>對於伺服器環境，建議使用橋接網卡模式，這樣可以讓虛擬機獲得與主機相同的網絡環境：</p>
        <ol>
          <li>打開 VirtualBox，選擇您的虛擬機，然後點擊「設定」</li>
          <li>在「網絡」選項卡中，將「附加到」設置為「橋接適配器」</li>
          <li>在「名稱」下拉選單中選擇您的主機網絡適配器</li>
        </ol>
      </section>

      <section>
        <h2>7. 啟動與安裝 Ubuntu</h2>
        <p>完成虛擬機配置後，啟動並安裝 Ubuntu：</p>
        <ol>
          <li>選擇虛擬機並點擊「啟動」按鈕</li>
          <li>如果選擇了無人值守安裝，系統會自動完成安裝過程</li>
          <li>如果選擇手動安裝，按照安裝嚮導的提示完成安裝：
            <ul>
              <li>選擇語言和鍵盤佈局</li>
              <li>配置網絡連接</li>
              <li>設置存儲分區</li>
              <li>創建用戶帳號和密碼</li>
              <li>選擇要安裝的軟件包</li>
            </ul>
          </li>
        </ol>
      </section>

      <section>
        <h2>8. 安裝 VirtualBox 增強功能 (可選)</h2>
        <p>VirtualBox 增強功能提供更好的整合體驗：</p>
        <ul>
          <li>改進的顯示驅動</li>
          <li>無縫視窗模式</li>
          <li>共享剪貼板</li>
          <li>共享文件夾</li>
          <li>時間同步</li>
        </ul>
        <p>安裝步驟：</p>
        <pre><code>
# 安裝必要的依賴
$ sudo apt update
$ sudo apt install build-essential dkms linux-headers-$(uname -r)

# 掛載 VirtualBox 增強功能 ISO
# 在 VirtualBox 菜單中選擇「設備」>「安裝增強功能」

# 掛載 CD-ROM
$ sudo mount /dev/cdrom /mnt

# 運行安裝腳本
$ cd /mnt
$ sudo ./VBoxLinuxAdditions.run
        </code></pre>
      </section>

      <section>
        <h2>9. 虛擬機快照</h2>
        <p>使用 VirtualBox 的快照功能來保存虛擬機的狀態：</p>
        <ul>
          <li>在進行重大更改前創建快照</li>
          <li>測試新配置時使用快照</li>
          <li>在出現問題時可以快速恢復到之前的狀態</li>
        </ul>
        <p>創建快照：</p>
        <ol>
          <li>選擇虛擬機</li>
          <li>點擊「工具」菜單中的「快照」</li>
          <li>點擊「拍攝」按鈕</li>
          <li>輸入快照名稱和描述</li>
        </ol>
      </section>

      <section>
        <h2>10. 常見問題與解決方案</h2>
        <h3>10.1 虛擬機啟動失敗</h3>
        <ul>
          <li>檢查硬體虛擬化是否在 BIOS 中啟用</li>
          <li>確認分配給虛擬機的資源不超過主機可用資源</li>
          <li>檢查 ISO 映像檔是否完整</li>
        </ul>
        
        <h3>10.2 網絡連接問題</h3>
        <ul>
          <li>檢查網絡適配器設置</li>
          <li>確認主機防火牆設置</li>
          <li>嘗試不同的網絡模式</li>
        </ul>
        
        <h3>10.3 效能問題</h3>
        <ul>
          <li>增加分配給虛擬機的記憶體和 CPU</li>
          <li>使用固定大小的虛擬硬碟</li>
          <li>安裝 VirtualBox 增強功能</li>
          <li>關閉不必要的虛擬機進程</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tags = ref(['虛擬化', 'VirtualBox', 'Ubuntu', '系統設置']);
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