<template>
  <div class="note-detail">
    <div class="note-header">
      <h1>網站服務配置</h1>
      <div class="note-tags">
        <span class="tag" v-for="tag in tags" :key="tag">{{ tag }}</span>
      </div>
      <div class="note-meta">
        <span class="date">更新日期: 2025-11-24</span>
      </div>
    </div>

    <div class="note-content">
      <section>
        <h2>1. Nginx 安裝與基礎配置</h2>
        <p>Nginx 是一個高性能的 HTTP 和反向代理伺服器，也是一個 IMAP/POP3/SMTP 代理伺服器：</p>
        <h3>1.1 安裝 Nginx</h3>
        <pre><code>
# 更新套件庫
$ sudo apt update

# 安裝 Nginx
$ sudo apt install nginx

# 檢查 Nginx 版本
$ nginx -v
        </code></pre>
        
        <h3>1.2 管理 Nginx 服務</h3>
        <pre><code>
# 啟動 Nginx 服務
$ sudo systemctl start nginx

# 停止 Nginx 服務
$ sudo systemctl stop nginx

# 重啟 Nginx 服務
$ sudo systemctl restart nginx

# 重新載入配置（不中斷服務）
$ sudo systemctl reload nginx

# 檢查 Nginx 服務狀態
$ sudo systemctl status nginx

# 設置開機自啟
$ sudo systemctl enable nginx
        </code></pre>
        
        <h3>1.3 Nginx 目錄結構</h3>
        <p>了解 Nginx 的目錄結構有助於更好地管理配置：</p>
        <ul>
          <li><strong>/etc/nginx/</strong>：Nginx 主配置目錄</li>
          <li><strong>/etc/nginx/nginx.conf</strong>：主配置文件</li>
          <li><strong>/etc/nginx/sites-available/</strong>：可用站點配置</li>
          <li><strong>/etc/nginx/sites-enabled/</strong>：已啟用站點配置（通常是符號連結）</li>
          <li><strong>/var/log/nginx/</strong>：日誌文件目錄</li>
          <li><strong>/var/www/html/</strong>：默認網站根目錄</li>
        </ul>
      </section>

      <section>
        <h2>2. 靜態網站配置</h2>
        <p>配置 Nginx 來託管靜態網站：</p>
        <h3>2.1 創建網站目錄</h3>
        <pre><code>
# 創建網站目錄
$ sudo mkdir -p /var/www/yourdomain.com/html

# 設置適當的權限
$ sudo chown -R $USER:$USER /var/www/yourdomain.com/html
$ sudo chmod -R 755 /var/www/yourdomain.com
        </code></pre>
        
        <h3>2.2 創建測試頁面</h3>
        <pre><code>
# 創建簡單的 HTML 頁面
$ sudo nano /var/www/yourdomain.com/html/index.html

# HTML 內容範例
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;title&gt;Welcome to yourdomain.com!&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;h1&gt;Success! Your Nginx server is working!&lt;/h1&gt;
    &lt;p&gt;This is a test page for yourdomain.com.&lt;/p&gt;
&lt;/body&gt;
&lt;/html&gt;
        </code></pre>
        
        <h3>2.3 創建伺服器塊配置</h3>
        <pre><code>
# 創建站點配置文件
$ sudo nano /etc/nginx/sites-available/yourdomain.com

# 配置內容範例（靜態網站）
server {
    listen 80;
    listen [::]:80;
    
    root /var/www/yourdomain.com/html;
    index index.html index.htm index.nginx-debian.html;
    
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
        </code></pre>
        
        <h3>2.4 啟用站點配置</h3>
        <pre><code>
# 創建符號連結到 sites-enabled 目錄
$ sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/

# 測試配置是否有語法錯誤
$ sudo nginx -t

# 重新載入 Nginx 配置
$ sudo systemctl reload nginx
        </code></pre>
      </section>

      <section>
        <h2>3. 後端反向代理配置</h2>
        <p>使用 Nginx 作為反向代理，將請求轉發到後端應用服務：</p>
        <h3>3.1 基本反向代理配置</h3>
        <pre><code>
# 編輯站點配置文件
$ sudo nano /etc/nginx/sites-available/yourdomain.com

# 配置內容範例（反向代理）
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
        </code></pre>
        
        <h3>3.2 代理參數說明</h3>
        <ul>
          <li><strong>proxy_pass</strong>：指定後端服務的地址</li>
          <li><strong>proxy_set_header Host</strong>：設置請求頭中的 Host 字段</li>
          <li><strong>proxy_set_header X-Real-IP</strong>：傳遞客戶端真實 IP</li>
          <li><strong>proxy_set_header X-Forwarded-For</strong>：傳遞代理鏈信息</li>
          <li><strong>proxy_set_header X-Forwarded-Proto</strong>：傳遞原始協議（http 或 https）</li>
        </ul>
        
        <h3>3.3 WebSocket 代理配置</h3>
        <pre><code>
# WebSocket 代理配置範例
location /socket.io/ {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
        </code></pre>
        
        <h3>3.4 上傳文件大小限制</h3>
        <pre><code>
# 增加上傳文件大小限制
client_max_body_size 100M;

# 可以在 http, server 或 location 塊中設置
        </code></pre>
      </section>

      <section>
        <h2>4. 虛擬主機設置</h2>
        <p>在同一台伺服器上託管多個網站：</p>
        <h3>4.1 基於域名的虛擬主機</h3>
        <pre><code>
# 第一個網站配置
server {
    listen 80;
    server_name site1.com www.site1.com;
    root /var/www/site1.com/html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}

# 第二個網站配置
server {
    listen 80;
    server_name site2.com www.site2.com;
    root /var/www/site2.com/html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
        </code></pre>
        
        <h3>4.2 基於端口的虛擬主機</h3>
        <pre><code>
# 在 80 端口的網站
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/site1;
    
    location / {
        try_files $uri $uri/ =404;
    }
}

# 在 8080 端口的網站
server {
    listen 8080;
    server_name yourdomain.com;
    root /var/www/site2;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
        </code></pre>
        
        <h3>4.3 默認伺服器</h3>
        <pre><code>
# 設置默認伺服器
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name _;
    root /var/www/default;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
        </code></pre>
      </section>

      <section>
        <h2>5. SSL/TLS 配置</h2>
        <p>使用 Let's Encrypt 配置 HTTPS：</p>
        <h3>5.1 安裝 Certbot</h3>
        <pre><code>
# 安裝 Certbot
$ sudo apt install certbot python3-certbot-nginx
        </code></pre>
        
        <h3>5.2 獲取 SSL 證書</h3>
        <pre><code>
# 自動配置 Nginx 和獲取證書
$ sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 只獲取證書，不修改 Nginx 配置
$ sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
        </code></pre>
        
        <h3>5.3 手動 SSL 配置</h3>
        <pre><code>
# SSL 配置範例
server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL 參數優化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    
    # HSTS 設置
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    root /var/www/yourdomain.com/html;
    index index.html index.htm;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
        </code></pre>
        
        <h3>5.4 HTTP 重定向到 HTTPS</h3>
        <pre><code>
# 將 HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        return 301 https://$host$request_uri;
    }
}
        </code></pre>
        
        <h3>5.5 自動續期證書</h3>
        <pre><code>
# 測試自動續期
$ sudo certbot renew --dry-run

# 自動續期已經由 Certbot 設置了 cron 任務
# 可以查看：
$ sudo systemctl list-timers
        </code></pre>
      </section>

      <section>
        <h2>6. 負載均衡配置</h2>
        <p>使用 Nginx 實現負載均衡：</p>
        <h3>6.1 定義上游服務器組</h3>
        <pre><code>
# 在 http 區塊中定義上游服務器組
upstream backend {
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
    server 127.0.0.1:8003;
}
        </code></pre>
        
        <h3>6.2 負載均衡方法</h3>
        <pre><code>
# 輪詢（默認）
upstream backend {
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}

# 最少連接
upstream backend {
    least_conn;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}

# IP 哈希
upstream backend {
    ip_hash;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}

# 加權輪詢
upstream backend {
    server 127.0.0.1:8001 weight=3;
    server 127.0.0.1:8002 weight=1;
}
        </code></pre>
        
        <h3>6.3 使用上游服務器組</h3>
        <pre><code>
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
        </code></pre>
        
        <h3>6.4 服務器健康檢查</h3>
        <pre><code>
# 使用 Nginx Plus 的健康檢查（商業版）
upstream backend {
    zone backend 64k;
    server 127.0.0.1:8001 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8002 max_fails=3 fail_timeout=30s;
}

# 開源版本的簡單失敗處理
upstream backend {
    server 127.0.0.1:8001 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8002 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8003 backup;  # 備用服務器
}
        </code></pre>
      </section>

      <section>
        <h2>7. 快取配置</h2>
        <p>配置 Nginx 快取以提高性能：</p>
        <h3>7.1 靜態文件快取</h3>
        <pre><code>
# 在 http 區塊中設置快取路徑
http {
    # ...其他配置...
    
    # 瀏覽器快取控制
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
        </code></pre>
        
        <h3>7.2 代理快取</h3>
        <pre><code>
# 設置代理快取
http {
    # ...其他配置...
    
    # 定義快取路徑和參數
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;
    
    server {
        # ...其他配置...
        
        location / {
            proxy_pass http://backend;
            proxy_cache my_cache;
            proxy_cache_valid 200 302 10m;
            proxy_cache_valid 404 1m;
            proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
            proxy_cache_lock on;
            add_header X-Cache-Status $upstream_cache_status;
        }
    }
}
        </code></pre>
        
        <h3>7.3 微快取</h3>
        <pre><code>
# 微快取配置
http {
    # ...其他配置...
    
    # 定義微快取
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=microcache:10m max_size=1g inactive=60m;
    
    server {
        # ...其他配置...
        
        location / {
            proxy_pass http://backend;
            proxy_cache microcache;
            proxy_cache_valid 200 302 1s;
            proxy_cache_use_stale updating;
            proxy_cache_lock on;
            add_header X-Cache-Status $upstream_cache_status;
        }
    }
}
        </code></pre>
        
        <h3>7.4 快取清除</h3>
        <pre><code>
# 手動清除快取
$ sudo rm -rf /var/cache/nginx/*

# 使用 Nginx Plus 的快取清除 API（商業版）
location /purge {
    allow 127.0.0.1;
    deny all;
    proxy_cache_purge my_cache $host$request_uri;
}
        </code></pre>
      </section>

      <section>
        <h2>8. 性能優化</h2>
        <p>優化 Nginx 配置以提高性能：</p>
        <h3>8.1 工作進程與連接</h3>
        <pre><code>
# 在 nginx.conf 中調整工作進程數
worker_processes auto;  # 自動設置為 CPU 核心數
# 或手動設置
# worker_processes 4;

# 調整每個工作進程的連接數
events {
    worker_connections 1024;
    multi_accept on;
    use epoll;  # Linux 系統推薦
}
        </code></pre>
        
        <h3>8.2 緩衝區優化</h3>
        <pre><code>
# 調整緩衝區大小
http {
    # ...其他配置...
    
    client_body_buffer_size 10K;
    client_header_buffer_size 1k;
    client_max_body_size 8m;
    large_client_header_buffers 4 4k;
    
    client_body_timeout 12;
    client_header_timeout 12;
    keepalive_timeout 15;
    send_timeout 10;
}
        </code></pre>
        
        <h3>8.3 壓縮配置</h3>
        <pre><code>
# 啟用 Gzip 壓縮
http {
    # ...其他配置...
    
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_vary on;
    gzip_types
        application/atom+xml
        application/javascript
        application/json
        application/ld+json
        application/manifest+json
        application/rss+xml
        application/vnd.geo+json
        application/vnd.ms-fontobject
        application/x-font-ttf
        application/x-web-app-manifest+json
        application/xhtml+xml
        application/xml
        font/opentype
        image/bmp
        image/svg+xml
        image/x-icon
        text/cache-manifest
        text/css
        text/plain
        text/vcard
        text/vnd.rim.location.xloc
        text/vtt
        text/x-component
        text/x-cross-domain-policy;
}
        </code></pre>
        
        <h3>8.4 開啟文件快取</h3>
        <pre><code>
# 開啟文件快取
http {
    # ...其他配置...
    
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
        </code></pre>
      </section>

      <section>
        <h2>9. 安全設置</h2>
        <p>加強 Nginx 的安全性：</p>
        <h3>9.1 隱藏版本信息</h3>
        <pre><code>
# 在 http 區塊中隱藏版本信息
http {
    # ...其他配置...
    
    server_tokens off;
}
        </code></pre>
        
        <h3>9.2 添加安全頭信息</h3>
        <pre><code>
# 添加安全相關的 HTTP 頭
server {
    # ...其他配置...
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
}
        </code></pre>
        
        <h3>9.3 限制請求</h3>
        <pre><code>
# 限制請求速率
http {
    # ...其他配置...
    
    # 定義限制區域
    limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;
    
    server {
        # ...其他配置...
        
        # 應用限制
        location /login {
            limit_req zone=mylimit burst=20 nodelay;
            # ...其他配置...
        }
    }
}
        </code></pre>
        
        <h3>9.4 基本身份認證</h3>
        <pre><code>
# 創建密碼文件
$ sudo apt install apache2-utils
$ sudo htpasswd -c /etc/nginx/.htpasswd username

# 配置基本認證
location /admin {
    auth_basic "Restricted Access";
    auth_basic_user_file /etc/nginx/.htpasswd;
    # ...其他配置...
}
        </code></pre>
      </section>

      <section>
        <h2>10. 監控與日誌</h2>
        <p>配置 Nginx 日誌和監控：</p>
        <h3>10.1 訪問日誌格式</h3>
        <pre><code>
# 自定義日誌格式
http {
    # ...其他配置...
    
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
}
        </code></pre>
        
        <h3>10.2 按域名分割日誌</h3>
        <pre><code>
# 為每個域名設置獨立的日誌
server {
    server_name example.com;
    access_log /var/log/nginx/example.com.access.log;
    error_log /var/log/nginx/example.com.error.log;
    # ...其他配置...
}
        </code></pre>
        
        <h3>10.3 日誌輪替</h3>
        <pre><code>
# 配置 logrotate
$ sudo nano /etc/logrotate.d/nginx

# 配置內容範例
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
        </code></pre>
        
        <h3>10.4 狀態監控</h3>
        <pre><code>
# 啟用 Nginx 狀態頁面
http {
    # ...其他配置...
    
    server {
        # ...其他配置...
        
        location /nginx_status {
            stub_status on;
            allow 127.0.0.1;
            deny all;
        }
    }
}
        </code></pre>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tags = ref(['Nginx', 'Web服務', '後端', '反向代理']);
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