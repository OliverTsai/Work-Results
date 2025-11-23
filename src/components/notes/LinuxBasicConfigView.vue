<template>
  <div class="note-detail">
    <div class="note-header">
      <h1>Linux 系統基礎配置</h1>
      <div class="note-tags">
        <span class="tag" v-for="tag in tags" :key="tag">{{ tag }}</span>
      </div>
      <div class="note-meta">
        <span class="date">更新日期: 2025-11-24</span>
      </div>
    </div>

    <div class="note-content">
      <section>
        <h2>1. 設置 sudo 權限</h2>
        <p>在 Linux 系統中，sudo 是一個強大的命令，允許授權用戶以超級用戶或其他用戶身份執行命令：</p>
        <pre><code>
# 切換至 root 權限
$ su

# 查看當前權限級別
$ whoami

# 安裝 sudo（如果尚未安裝）
$ apt install sudo

# 添加帳號至 sudoers 名單
$ usermod -aG sudo 用戶名

# 離開 root 模式
$ exit

# 重新啟動系統
$ reboot
        </code></pre>
        <p>驗證 sudo 權限：</p>
        <pre><code>
# 測試 sudo 權限
$ sudo ls -la /root
        </code></pre>
      </section>

      <section>
        <h2>2. 系統更新與升級</h2>
        <p>保持系統更新是維護 Linux 系統安全和穩定的重要步驟：</p>
        <h3>2.1 更新套件庫</h3>
        <pre><code>
# 更新套件庫資訊
$ sudo apt update
        </code></pre>
        
        <h3>2.2 升級已安裝套件</h3>
        <pre><code>
# 升級所有已安裝的套件
$ sudo apt upgrade -y

# 升級發行版（慎用）
$ sudo apt dist-upgrade -y
        </code></pre>
        
        <h3>2.3 自動更新設置</h3>
        <pre><code>
# 安裝自動更新工具
$ sudo apt install unattended-upgrades

# 配置自動更新
$ sudo dpkg-reconfigure unattended-upgrades
        </code></pre>
      </section>

      <section>
        <h2>3. 安裝基本工具</h2>
        <p>以下是一些在 Linux 系統中常用的基本工具：</p>
        <h3>3.1 系統工具</h3>
        <pre><code>
# 安裝常用系統工具
$ sudo apt install vim nano htop net-tools curl wget git
        </code></pre>
        
        <h3>3.2 文件操作工具</h3>
        <pre><code>
# 安裝文件操作工具
$ sudo apt install zip unzip tar gzip bzip2
        </code></pre>
        
        <h3>3.3 網絡工具</h3>
        <pre><code>
# 安裝網絡診斷工具
$ sudo apt install traceroute nmap tcpdump whois dnsutils
        </code></pre>
        
        <h3>3.4 系統監控工具</h3>
        <pre><code>
# 安裝系統監控工具
$ sudo apt install iotop iftop sysstat
        </code></pre>
      </section>

      <section>
        <h2>4. 用戶管理</h2>
        <p>Linux 系統中的用戶管理是系統管理的基本任務之一：</p>
        <h3>4.1 創建新用戶</h3>
        <pre><code>
# 創建新用戶
$ sudo adduser 用戶名

# 或使用 useradd（更底層的命令）
$ sudo useradd -m -s /bin/bash 用戶名
$ sudo passwd 用戶名
        </code></pre>
        
        <h3>4.2 用戶組管理</h3>
        <pre><code>
# 創建新用戶組
$ sudo groupadd 組名

# 將用戶添加到組
$ sudo usermod -aG 組名 用戶名

# 查看用戶所屬的組
$ groups 用戶名
        </code></pre>
        
        <h3>4.3 修改用戶權限</h3>
        <pre><code>
# 更改文件擁有者
$ sudo chown 用戶名:組名 文件或目錄

# 更改文件權限
$ sudo chmod 755 文件或目錄  # rwxr-xr-x
        </code></pre>
        
        <h3>4.4 刪除用戶</h3>
        <pre><code>
# 刪除用戶（保留家目錄）
$ sudo userdel 用戶名

# 刪除用戶及其家目錄
$ sudo userdel -r 用戶名
        </code></pre>
      </section>

      <section>
        <h2>5. 文件系統管理</h2>
        <p>Linux 文件系統管理是系統維護的重要部分：</p>
        <h3>5.1 磁盤分區</h3>
        <pre><code>
# 查看磁盤分區
$ sudo fdisk -l

# 創建分區（交互式）
$ sudo fdisk /dev/sdb
        </code></pre>
        
        <h3>5.2 格式化分區</h3>
        <pre><code>
# 格式化為 ext4 文件系統
$ sudo mkfs.ext4 /dev/sdb1

# 格式化為 xfs 文件系統
$ sudo mkfs.xfs /dev/sdb1
        </code></pre>
        
        <h3>5.3 掛載文件系統</h3>
        <pre><code>
# 創建掛載點
$ sudo mkdir /mnt/data

# 手動掛載
$ sudo mount /dev/sdb1 /mnt/data

# 設置開機自動掛載（編輯 /etc/fstab）
$ sudo nano /etc/fstab
# 添加以下行
# /dev/sdb1 /mnt/data ext4 defaults 0 2
        </code></pre>
        
        <h3>5.4 檢查磁盤使用情況</h3>
        <pre><code>
# 查看磁盤使用情況
$ df -h

# 查看目錄大小
$ du -sh /path/to/directory
        </code></pre>
      </section>

      <section>
        <h2>6. 系統服務管理</h2>
        <p>使用 systemd 管理 Linux 系統服務：</p>
        <h3>6.1 服務狀態查詢</h3>
        <pre><code>
# 查看服務狀態
$ sudo systemctl status 服務名

# 列出所有運行中的服務
$ sudo systemctl list-units --type=service --state=running
        </code></pre>
        
        <h3>6.2 服務控制</h3>
        <pre><code>
# 啟動服務
$ sudo systemctl start 服務名

# 停止服務
$ sudo systemctl stop 服務名

# 重啟服務
$ sudo systemctl restart 服務名

# 重新載入配置
$ sudo systemctl reload 服務名
        </code></pre>
        
        <h3>6.3 設置開機自啟</h3>
        <pre><code>
# 設置服務開機自啟
$ sudo systemctl enable 服務名

# 禁用服務開機自啟
$ sudo systemctl disable 服務名

# 檢查服務是否設置為開機自啟
$ sudo systemctl is-enabled 服務名
        </code></pre>
        
        <h3>6.4 創建自定義服務</h3>
        <pre><code>
# 創建服務文件
$ sudo nano /etc/systemd/system/myservice.service

# 服務文件範例
[Unit]
Description=My Custom Service
After=network.target

[Service]
Type=simple
User=username
WorkingDirectory=/path/to/working/directory
ExecStart=/path/to/executable
Restart=on-failure

[Install]
WantedBy=multi-user.target

# 重新載入 systemd 配置
$ sudo systemctl daemon-reload

# 啟用並啟動服務
$ sudo systemctl enable --now myservice
        </code></pre>
      </section>

      <section>
        <h2>7. 基本網絡配置</h2>
        <p>Linux 系統網絡配置是伺服器設置的關鍵部分：</p>
        <h3>7.1 查看網絡信息</h3>
        <pre><code>
# 查看網絡接口
$ ip addr show

# 查看路由表
$ ip route show

# 查看DNS配置
$ cat /etc/resolv.conf
        </code></pre>
        
        <h3>7.2 配置靜態 IP (Ubuntu 18.04+)</h3>
        <pre><code>
# 編輯 Netplan 配置文件
$ sudo nano /etc/netplan/00-installer-config.yaml

# 配置範例
network:
  version: 2
  ethernets:
    enp0s3:
      addresses: [192.168.1.100/24]
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]

# 應用配置
$ sudo netplan apply
        </code></pre>
        
        <h3>7.3 配置主機名</h3>
        <pre><code>
# 查看當前主機名
$ hostname

# 設置新主機名
$ sudo hostnamectl set-hostname new-hostname

# 編輯 hosts 文件
$ sudo nano /etc/hosts
# 添加以下行
# 127.0.1.1 new-hostname
        </code></pre>
        
        <h3>7.4 測試網絡連接</h3>
        <pre><code>
# 測試與特定主機的連接
$ ping -c 4 google.com

# 檢查網絡路由
$ traceroute google.com

# 測試DNS解析
$ nslookup google.com
        </code></pre>
      </section>

      <section>
        <h2>8. 防火牆設置</h2>
        <p>使用 UFW (Uncomplicated Firewall) 配置 Linux 防火牆：</p>
        <h3>8.1 安裝 UFW</h3>
        <pre><code>
# 安裝 UFW
$ sudo apt install ufw
        </code></pre>
        
        <h3>8.2 基本防火牆規則</h3>
        <pre><code>
# 允許 SSH 連接
$ sudo ufw allow 22/tcp
$ sudo ufw allow OpenSSH

# 允許 Web 服務
$ sudo ufw allow 80/tcp
$ sudo ufw allow 443/tcp
$ sudo ufw allow 'Nginx Full'

# 允許特定 IP 訪問特定端口
$ sudo ufw allow from 192.168.1.0/24 to any port 3306
        </code></pre>
        
        <h3>8.3 管理防火牆</h3>
        <pre><code>
# 啟用防火牆
$ sudo ufw enable

# 禁用防火牆
$ sudo ufw disable

# 查看防火牆狀態
$ sudo ufw status
$ sudo ufw status verbose
$ sudo ufw status numbered

# 刪除規則
$ sudo ufw delete 允許 80/tcp
$ sudo ufw delete 5  # 刪除編號為5的規則
        </code></pre>
        
        <h3>8.4 設置默認策略</h3>
        <pre><code>
# 默認拒絕入站連接
$ sudo ufw default deny incoming

# 默認允許出站連接
$ sudo ufw default allow outgoing
        </code></pre>
      </section>

      <section>
        <h2>9. 時區與時間同步</h2>
        <p>正確設置系統時區和時間同步對於伺服器運行至關重要：</p>
        <h3>9.1 設置時區</h3>
        <pre><code>
# 查看當前時區
$ timedatectl

# 列出可用時區
$ timedatectl list-timezones | grep Asia

# 設置時區
$ sudo timedatectl set-timezone Asia/Taipei
        </code></pre>
        
        <h3>9.2 時間同步</h3>
        <pre><code>
# 安裝 NTP 服務
$ sudo apt install ntp

# 或使用 systemd 的 timesyncd
$ sudo systemctl enable systemd-timesyncd
$ sudo systemctl start systemd-timesyncd

# 檢查時間同步狀態
$ timedatectl status
        </code></pre>
        
        <h3>9.3 手動設置系統時間</h3>
        <pre><code>
# 設置系統日期和時間
$ sudo date -s "2025-11-24 10:00:00"

# 將系統時間寫入硬件時鐘
$ sudo hwclock --systohc
        </code></pre>
      </section>

      <section>
        <h2>10. 系統日誌管理</h2>
        <p>系統日誌對於監控和排查問題非常重要：</p>
        <h3>10.1 查看系統日誌</h3>
        <pre><code>
# 查看系統日誌
$ sudo journalctl

# 查看特定服務的日誌
$ sudo journalctl -u nginx

# 查看最近的日誌
$ sudo journalctl -n 50

# 實時查看日誌
$ sudo journalctl -f
        </code></pre>
        
        <h3>10.2 傳統日誌文件</h3>
        <pre><code>
# 查看系統日誌
$ sudo cat /var/log/syslog
$ sudo tail -f /var/log/syslog

# 查看認證日誌
$ sudo cat /var/log/auth.log

# 查看啟動日誌
$ sudo cat /var/log/boot.log
        </code></pre>
        
        <h3>10.3 日誌輪替配置</h3>
        <pre><code>
# 查看日誌輪替配置
$ cat /etc/logrotate.conf

# 創建自定義日誌輪替配置
$ sudo nano /etc/logrotate.d/myapp
# 配置範例
/var/log/myapp/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
        </code></pre>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tags = ref(['Linux', 'Ubuntu', '系統管理', '基礎配置']);
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