<template>
  <div class="note-detail">
    <div class="note-header">
      <h1>伺服器安全性設置</h1>
      <div class="note-tags">
        <span class="tag" v-for="tag in tags" :key="tag">{{ tag }}</span>
      </div>
      <div class="note-meta">
        <span class="date">更新日期: 2025-11-24</span>
      </div>
    </div>

    <div class="note-content">
      <section>
        <h2>1. SSH 安全配置</h2>
        <p>SSH (Secure Shell) 是遠程管理 Linux 伺服器的主要工具，正確配置 SSH 對於伺服器安全至關重要：</p>
        <h3>1.1 更改 SSH 預設連接埠</h3>
        <pre><code>
# 編輯 SSH 配置文件
$ sudo nano /etc/ssh/sshd_config

# 找到 #Port 22 行，修改為所需端口（如 22222）
# 記得移除前面的 # 符號
Port 22222

# 重啟 SSH 服務
$ sudo systemctl restart ssh
        </code></pre>
        <p>更改默認端口可以減少自動化掃描攻擊，但不要依賴這種「隱藏式安全」作為唯一的保護措施。</p>
        
        <h3>1.2 禁用 root 直接登錄</h3>
        <pre><code>
# 編輯 SSH 配置文件
$ sudo nano /etc/ssh/sshd_config

# 設置禁止 root 直接登錄
PermitRootLogin no

# 重啟 SSH 服務
$ sudo systemctl restart ssh
        </code></pre>
        
        <h3>1.3 使用密鑰認證</h3>
        <p>在本地電腦上生成 SSH 密鑰對：</p>
        <pre><code>
# 生成 SSH 密鑰對
$ ssh-keygen -t ed25519 -C "your_email@example.com"

# 或使用 RSA 算法（如果需要更廣泛的兼容性）
$ ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
        </code></pre>
        
        <p>將公鑰複製到伺服器：</p>
        <pre><code>
# 使用 ssh-copy-id 工具（推薦）
$ ssh-copy-id -i ~/.ssh/id_ed25519.pub username@server_ip

# 如果更改了 SSH 端口
$ ssh-copy-id -i ~/.ssh/id_ed25519.pub -p 22222 username@server_ip

# 手動複製（如果 ssh-copy-id 不可用）
$ cat ~/.ssh/id_ed25519.pub | ssh username@server_ip "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
        </code></pre>
        
        <p>配置 SSH 使用密鑰認證並禁用密碼認證：</p>
        <pre><code>
# 編輯 SSH 配置文件
$ sudo nano /etc/ssh/sshd_config

# 設置以下選項
PubkeyAuthentication yes
PasswordAuthentication no
ChallengeResponseAuthentication no

# 重啟 SSH 服務
$ sudo systemctl restart ssh
        </code></pre>
        
        <h3>1.4 限制 SSH 訪問用戶</h3>
        <pre><code>
# 編輯 SSH 配置文件
$ sudo nano /etc/ssh/sshd_config

# 僅允許特定用戶通過 SSH 登錄
AllowUsers username1 username2

# 重啟 SSH 服務
$ sudo systemctl restart ssh
        </code></pre>
        
        <h3>1.5 其他 SSH 安全設置</h3>
        <pre><code>
# 編輯 SSH 配置文件
$ sudo nano /etc/ssh/sshd_config

# 設置閒置超時（單位：秒）
ClientAliveInterval 300
ClientAliveCountMax 2

# 禁用空密碼
PermitEmptyPasswords no

# 禁用 X11 轉發（如果不需要）
X11Forwarding no

# 禁用 TCP 轉發（如果不需要）
AllowTcpForwarding no

# 禁用代理轉發（如果不需要）
AllowAgentForwarding no

# 重啟 SSH 服務
$ sudo systemctl restart ssh
        </code></pre>
      </section>

      <section>
        <h2>2. 防火牆設置</h2>
        <p>防火牆是伺服器安全的第一道防線，用於控制進出伺服器的網絡流量：</p>
        <h3>2.1 UFW 基本設置</h3>
        <p>UFW (Uncomplicated Firewall) 是 Ubuntu 的默認防火牆配置工具：</p>
        <pre><code>
# 安裝 UFW（如果尚未安裝）
$ sudo apt install ufw

# 設置默認策略
$ sudo ufw default deny incoming
$ sudo ufw default allow outgoing

# 允許 SSH 連接（使用自定義端口）
$ sudo ufw allow 22222/tcp

# 允許 Web 服務
$ sudo ufw allow 80/tcp
$ sudo ufw allow 443/tcp

# 允許特定 IP 訪問特定服務
$ sudo ufw allow from 192.168.1.0/24 to any port 3306

# 啟用防火牆
$ sudo ufw enable

# 檢查防火牆狀態
$ sudo ufw status verbose
        </code></pre>
        
        <h3>2.2 限制 SSH 訪問</h3>
        <pre><code>
# 僅允許特定 IP 或網段訪問 SSH
$ sudo ufw allow from 192.168.1.0/24 proto tcp to any port 22222

# 刪除之前的通用規則（如果存在）
$ sudo ufw delete allow 22222/tcp
        </code></pre>
        
        <h3>2.3 設置速率限制</h3>
        <p>使用 iptables 設置連接速率限制（UFW 是 iptables 的前端）：</p>
        <pre><code>
# 安裝 iptables-persistent
$ sudo apt install iptables-persistent

# 限制 SSH 連接速率
$ sudo iptables -A INPUT -p tcp --dport 22222 -m conntrack --ctstate NEW -m recent --set
$ sudo iptables -A INPUT -p tcp --dport 22222 -m conntrack --ctstate NEW -m recent --update --seconds 60 --hitcount 4 -j DROP

# 保存 iptables 規則
$ sudo netfilter-persistent save
        </code></pre>
        
        <h3>2.4 端口掃描檢測</h3>
        <pre><code>
# 安裝 psad
$ sudo apt install psad

# 配置 psad
$ sudo nano /etc/psad/psad.conf

# 設置郵件通知
EMAIL_ADDRESSES             your_email@example.com;

# 設置警報級別
ALERT_ALL                   Y;

# 重新啟動 psad
$ sudo systemctl restart psad
        </code></pre>
      </section>

      <section>
        <h2>3. SSL 證書配置</h2>
        <p>SSL/TLS 證書用於加密網站流量，保護數據傳輸安全：</p>
        <h3>3.1 安裝 Certbot</h3>
        <pre><code>
# 安裝 Certbot
$ sudo apt install certbot python3-certbot-nginx

# 或者如果使用 Apache
$ sudo apt install certbot python3-certbot-apache
        </code></pre>
        
        <h3>3.2 獲取 SSL 證書</h3>
        <pre><code>
# 使用 Nginx 插件自動配置
$ sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 使用 Apache 插件自動配置
$ sudo certbot --apache -d yourdomain.com -d www.yourdomain.com

# 僅獲取證書（不修改 Web 服務器配置）
$ sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
        </code></pre>
        
        <h3>3.3 自動續期設置</h3>
        <p>Certbot 會自動添加一個 cron 任務來處理證書續期：</p>
        <pre><code>
# 測試自動續期
$ sudo certbot renew --dry-run

# 查看已安裝的定時任務
$ sudo systemctl list-timers
        </code></pre>
        
        <h3>3.4 手動配置 SSL</h3>
        <p>如果需要手動配置 Nginx 使用 SSL 證書：</p>
        <pre><code>
# 編輯 Nginx 站點配置
$ sudo nano /etc/nginx/sites-available/yourdomain.com

# SSL 配置範例
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/yourdomain.com/chain.pem;
    
    # 優化 SSL 設置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # 安全頭信息
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    
    # 網站內容配置
    root /var/www/yourdomain.com/html;
    index index.html index.htm index.nginx-debian.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        return 301 https://$host$request_uri;
    }
}
        </code></pre>
      </section>

      <section>
        <h2>4. 用戶權限管理</h2>
        <p>正確管理用戶權限可以限制潛在攻擊的影響範圍：</p>
        <h3>4.1 創建有限權限用戶</h3>
        <pre><code>
# 創建新用戶
$ sudo adduser username

# 或使用 useradd
$ sudo useradd -m -s /bin/bash username
$ sudo passwd username
        </code></pre>
        
        <h3>4.2 sudo 權限管理</h3>
        <pre><code>
# 將用戶添加到 sudo 組
$ sudo usermod -aG sudo username

# 或編輯 sudoers 文件
$ sudo visudo

# 添加特定命令權限
username ALL=(ALL) /usr/bin/apt
        </code></pre>
        
        <h3>4.3 限制 sudo 訪問</h3>
        <pre><code>
# 編輯 sudoers 文件
$ sudo visudo

# 限制特定用戶只能執行特定命令
username ALL=(ALL) NOPASSWD: /usr/bin/apt update, /usr/bin/apt upgrade

# 要求輸入密碼
Defaults:username timestamp_timeout=0
        </code></pre>
        
        <h3>4.4 文件權限管理</h3>
        <pre><code>
# 設置適當的文件權限
$ sudo chmod 750 /path/to/directory
$ sudo chmod 640 /path/to/file

# 更改文件所有者
$ sudo chown user:group /path/to/file

# 設置安全默認權限
$ sudo nano /etc/login.defs
UMASK 027  # 設置為 027（對應權限 750）
        </code></pre>
      </section>

      <section>
        <h2>5. 系統更新策略</h2>
        <p>保持系統更新是維護伺服器安全的關鍵：</p>
        <h3>5.1 自動安全更新</h3>
        <pre><code>
# 安裝 unattended-upgrades
$ sudo apt install unattended-upgrades apt-listchanges

# 配置自動更新
$ sudo dpkg-reconfigure unattended-upgrades

# 編輯配置文件
$ sudo nano /etc/apt/apt.conf.d/50unattended-upgrades

# 設置只安裝安全更新
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
};

# 設置自動重啟（可選）
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";
        </code></pre>
        
        <h3>5.2 手動更新流程</h3>
        <pre><code>
# 更新套件列表
$ sudo apt update

# 查看可用更新
$ sudo apt list --upgradable

# 安裝安全更新
$ sudo apt upgrade -y

# 完整系統升級（包括可能需要移除套件的更新）
$ sudo apt full-upgrade

# 移除不再需要的套件
$ sudo apt autoremove
        </code></pre>
        
        <h3>5.3 內核更新</h3>
        <pre><code>
# 查看當前內核版本
$ uname -r

# 安裝特定內核版本
$ sudo apt install linux-image-x.x.x-xx-generic

# 移除舊內核
$ sudo apt autoremove --purge
        </code></pre>
      </section>

      <section>
        <h2>6. 安全審計</h2>
        <p>定期進行安全審計可以發現潛在的安全問題：</p>
        <h3>6.1 Lynis 安全審計工具</h3>
        <pre><code>
# 安裝 Lynis
$ sudo apt install lynis

# 運行系統審計
$ sudo lynis audit system

# 查看報告
$ less /var/log/lynis.log
        </code></pre>
        
        <h3>6.2 RootKit 檢測</h3>
        <pre><code>
# 安裝 RootKit Hunter
$ sudo apt install rkhunter

# 更新 rkhunter 數據庫
$ sudo rkhunter --update

# 執行檢查
$ sudo rkhunter --check

# 查看報告
$ less /var/log/rkhunter.log
        </code></pre>
        
        <h3>6.3 ClamAV 病毒掃描</h3>
        <pre><code>
# 安裝 ClamAV
$ sudo apt install clamav clamav-daemon

# 更新病毒庫
$ sudo freshclam

# 掃描特定目錄
$ sudo clamscan -r /home

# 掃描並移動感染文件
$ sudo clamscan -r --move=/quarantine /var/www
        </code></pre>
        
        <h3>6.4 日誌審計</h3>
        <pre><code>
# 查看認證日誌
$ sudo cat /var/log/auth.log | grep "Failed password"

# 查看 sudo 使用情況
$ sudo cat /var/log/auth.log | grep sudo

# 使用 aureport 查看審計報告（需要安裝 auditd）
$ sudo apt install auditd
$ sudo aureport --auth --summary
        </code></pre>
      </section>

      <section>
        <h2>7. 入侵檢測</h2>
        <p>設置入侵檢測系統可以及時發現並應對安全威脅：</p>
        <h3>7.1 安裝 Fail2Ban</h3>
        <pre><code>
# 安裝 Fail2Ban
$ sudo apt install fail2ban

# 創建本地配置文件
$ sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
$ sudo nano /etc/fail2ban/jail.local
        </code></pre>
        
        <h3>7.2 配置 Fail2Ban</h3>
        <pre><code>
# 基本配置
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
banaction = iptables-multiport

# SSH 保護
[sshd]
enabled = true
port = 22222
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

# Web 服務器保護
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
        </code></pre>
        
        <h3>7.3 啟動 Fail2Ban</h3>
        <pre><code>
# 啟動服務
$ sudo systemctl start fail2ban

# 設置開機自啟
$ sudo systemctl enable fail2ban

# 檢查狀態
$ sudo fail2ban-client status

# 檢查特定監獄狀態
$ sudo fail2ban-client status sshd
        </code></pre>
        
        <h3>7.4 其他入侵檢測工具</h3>
        <p>除了 Fail2Ban，還有其他入侵檢測工具：</p>
        <ul>
          <li><strong>OSSEC</strong>：全面的主機入侵檢測系統</li>
          <li><strong>Suricata</strong>：高性能的網絡 IDS/IPS</li>
          <li><strong>Wazuh</strong>：基於 OSSEC 的安全監控解決方案</li>
        </ul>
        <pre><code>
# 安裝 OSSEC（示例）
$ wget https://github.com/ossec/ossec-hids/archive/3.7.0.tar.gz
$ tar -xzf 3.7.0.tar.gz
$ cd ossec-hids-3.7.0
$ sudo ./install.sh
        </code></pre>
      </section>

      <section>
        <h2>8. 資料加密</h2>
        <p>加密敏感數據可以防止未授權訪問：</p>
        <h3>8.1 磁盤加密</h3>
        <p>在安裝系統時設置全盤加密，或使用 LUKS 加密特定分區：</p>
        <pre><code>
# 安裝必要工具
$ sudo apt install cryptsetup

# 創建加密容器
$ sudo cryptsetup luksFormat /dev/sdb1

# 打開加密容器
$ sudo cryptsetup luksOpen /dev/sdb1 secure-data

# 格式化
$ sudo mkfs.ext4 /dev/mapper/secure-data

# 掛載
$ sudo mount /dev/mapper/secure-data /mnt/secure-data
        </code></pre>
        
        <h3>8.2 加密備份</h3>
        <pre><code>
# 使用 GPG 加密文件
$ gpg -c important-file.tar.gz

# 使用 tar 和 GPG 創建加密備份
$ tar czf - /path/to/backup | gpg -c > backup.tar.gz.gpg

# 解密
$ gpg -d backup.tar.gz.gpg > backup.tar.gz
        </code></pre>
        
        <h3>8.3 加密通信</h3>
        <p>使用 SSH 隧道加密數據庫或其他服務的通信：</p>
        <pre><code>
# 創建 SSH 隧道
$ ssh -L 3307:localhost:3306 username@remote-server

# 然後連接到本地端口
$ mysql -h 127.0.0.1 -P 3307 -u user -p
        </code></pre>
        
        <h3>8.4 加密敏感文件</h3>
        <pre><code>
# 使用 EncFS 加密目錄
$ sudo apt install encfs

# 創建加密目錄
$ encfs ~/Private_encrypted ~/Private

# 卸載加密目錄
$ fusermount -u ~/Private
        </code></pre>
      </section>

      <section>
        <h2>9. 安全監控</h2>
        <p>設置監控系統可以幫助及時發現異常活動：</p>
        <h3>9.1 系統監控工具</h3>
        <pre><code>
# 安裝基本監控工具
$ sudo apt install htop iotop iftop

# 安裝 Glances（綜合監控工具）
$ sudo apt install glances

# 安裝 Netdata（實時性能監控）
$ bash <(curl -Ss https://my-netdata.io/kickstart.sh)
        </code></pre>
        
        <h3>9.2 日誌監控</h3>
        <pre><code>
# 安裝 logwatch
$ sudo apt install logwatch

# 配置 logwatch
$ sudo nano /etc/logwatch/conf/logwatch.conf

# 設置每日郵件報告
$ sudo nano /etc/cron.daily/00logwatch
        </code></pre>
        
        <h3>9.3 設置監控警報</h3>
        <pre><code>
# 安裝 Monit
$ sudo apt install monit

# 配置 Monit
$ sudo nano /etc/monit/monitrc

# 監控 SSH 服務範例
check process sshd with pidfile /var/run/sshd.pid
    start program = "/etc/init.d/ssh start"
    stop program = "/etc/init.d/ssh stop"
    if failed port 22222 protocol ssh then restart
    if 5 restarts within 5 cycles then timeout

# 啟動 Monit
$ sudo systemctl enable monit
$ sudo systemctl start monit
        </code></pre>
      </section>

      <section>
        <h2>10. 安全最佳實踐</h2>
        <p>遵循以下最佳實踐可以提高伺服器的整體安全性：</p>
        <ul>
          <li><strong>最小化安裝</strong>：只安裝必要的軟件和服務</li>
          <li><strong>定期更新</strong>：保持系統和軟件的最新安全補丁</li>
          <li><strong>強密碼策略</strong>：使用強密碼並定期更換</li>
          <li><strong>最小權限原則</strong>：為用戶和進程分配最小必要權限</li>
          <li><strong>網絡隔離</strong>：使用防火牆和網絡分段限制訪問</li>
          <li><strong>加密敏感數據</strong>：對靜態和傳輸中的敏感數據進行加密</li>
          <li><strong>定期備份</strong>：實施定期備份策略並測試恢復流程</li>
          <li><strong>監控與日誌</strong>：設置全面的監控和日誌記錄</li>
          <li><strong>安全審計</strong>：定期進行安全審計和漏洞掃描</li>
          <li><strong>災難恢復計劃</strong>：制定並測試災難恢復計劃</li>
          <li><strong>安全文檔</strong>：維護安全配置和流程的文檔</li>
        </ul>
        
        <h3>10.1 安全檢查清單</h3>
        <ol>
          <li>更改默認 SSH 端口並禁用 root 登錄</li>
          <li>設置 SSH 密鑰認證並禁用密碼認證</li>
          <li>配置防火牆只允許必要的服務</li>
          <li>安裝和配置入侵檢測系統</li>
          <li>設置自動安全更新</li>
          <li>實施強密碼策略</li>
          <li>定期備份關鍵數據</li>
          <li>監控系統日誌和活動</li>
          <li>定期進行安全審計</li>
          <li>保持系統和軟件更新</li>
        </ol>
        
        <h3>10.2 安全資源</h3>
        <ul>
          <li><a href="https://www.cisa.gov/uscert/ncas/tips">CISA 網絡安全提示</a></li>
          <li><a href="https://www.cisecurity.org/cis-benchmarks/">CIS 基準</a></li>
          <li><a href="https://www.sans.org/security-resources/">SANS 安全資源</a></li>
          <li><a href="https://www.owasp.org/index.php/Main_Page">OWASP 安全項目</a></li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tags = ref(['伺服器安全', 'SSH', '防火牆', '加密', '安全審計']);
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