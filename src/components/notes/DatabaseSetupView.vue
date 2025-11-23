<template>
  <div class="note-detail">
    <div class="note-header">
      <h1>資料庫設置指南</h1>
      <div class="note-tags">
        <span class="tag" v-for="tag in tags" :key="tag">{{ tag }}</span>
      </div>
      <div class="note-meta">
        <span class="date">更新日期: 2025-11-24</span>
      </div>
    </div>

    <div class="note-content">
      <section>
        <h2>1. MongoDB 安裝步驟</h2>
        <p>MongoDB 是一個流行的 NoSQL 文檔型資料庫，適合處理大量非結構化數據：</p>
        <h3>1.1 導入 MongoDB 公鑰</h3>
        <pre><code>
# 導入 MongoDB 公鑰
$ wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# 如果上面的命令顯示警告，可以使用下面的命令
$ wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg
        </code></pre>
        
        <h3>1.2 創建 MongoDB 源列表文件</h3>
        <pre><code>
# 為 Ubuntu 20.04 (Focal)
$ echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# 為 Ubuntu 22.04 (Jammy)
$ echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
        </code></pre>
        
        <h3>1.3 安裝 MongoDB</h3>
        <pre><code>
# 更新套件列表
$ sudo apt update

# 安裝 MongoDB
$ sudo apt install -y mongodb-org

# 檢查安裝的版本
$ mongod --version
        </code></pre>
        
        <h3>1.4 啟動 MongoDB 服務</h3>
        <pre><code>
# 啟動 MongoDB 服務
$ sudo systemctl start mongod

# 檢查服務狀態
$ sudo systemctl status mongod

# 設置開機自啟
$ sudo systemctl enable mongod
        </code></pre>
      </section>

      <section>
        <h2>2. MongoDB 基本配置</h2>
        <p>配置 MongoDB 以優化性能和安全性：</p>
        <h3>2.1 配置文件位置</h3>
        <p>MongoDB 的主要配置文件位於 <code>/etc/mongod.conf</code>，使用 YAML 格式。</p>
        
        <h3>2.2 基本配置選項</h3>
        <pre><code>
# 編輯配置文件
$ sudo nano /etc/mongod.conf

# 基本配置範例
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1

processManagement:
  timeZoneInfo: /usr/share/zoneinfo
        </code></pre>
        
        <h3>2.3 應用配置變更</h3>
        <pre><code>
# 重啟 MongoDB 服務以應用配置變更
$ sudo systemctl restart mongod

# 檢查服務狀態
$ sudo systemctl status mongod
        </code></pre>
        
        <h3>2.4 配置文件參數說明</h3>
        <ul>
          <li><strong>storage.dbPath</strong>：數據存儲路徑</li>
          <li><strong>systemLog.path</strong>：日誌文件路徑</li>
          <li><strong>net.port</strong>：MongoDB 監聽端口</li>
          <li><strong>net.bindIp</strong>：MongoDB 綁定的 IP 地址（127.0.0.1 表示只允許本地連接）</li>
        </ul>
      </section>

      <section>
        <h2>3. 用戶認證與權限</h2>
        <p>設置 MongoDB 的用戶認證和權限管理：</p>
        <h3>3.1 啟用認證</h3>
        <pre><code>
# 編輯配置文件
$ sudo nano /etc/mongod.conf

# 添加安全配置
security:
  authorization: enabled

# 重啟 MongoDB 服務
$ sudo systemctl restart mongod
        </code></pre>
        
        <h3>3.2 創建管理員用戶</h3>
        <pre><code>
# 連接到 MongoDB
$ mongosh

# 切換到 admin 數據庫
> use admin

# 創建管理員用戶
> db.createUser({
    user: "adminUser",
    pwd: "securePassword",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
  })

# 退出 MongoDB Shell
> exit
        </code></pre>
        
        <h3>3.3 使用認證連接</h3>
        <pre><code>
# 使用認證連接到 MongoDB
$ mongosh --authenticationDatabase admin -u adminUser -p

# 或在連接後認證
$ mongosh
> use admin
> db.auth("adminUser", "securePassword")
        </code></pre>
        
        <h3>3.4 創建應用程式專用用戶</h3>
        <pre><code>
# 連接到 MongoDB 並認證
$ mongosh --authenticationDatabase admin -u adminUser -p

# 創建新數據庫
> use myAppDatabase

# 創建應用程式用戶
> db.createUser({
    user: "appUser",
    pwd: "appPassword",
    roles: [
      { role: "readWrite", db: "myAppDatabase" },
      { role: "read", db: "anotherDatabase" }
    ]
  })
        </code></pre>
        
        <h3>3.5 MongoDB 角色說明</h3>
        <ul>
          <li><strong>read</strong>：允許讀取指定數據庫中的數據</li>
          <li><strong>readWrite</strong>：允許讀寫指定數據庫</li>
          <li><strong>dbAdmin</strong>：允許執行管理任務</li>
          <li><strong>userAdmin</strong>：允許創建和修改用戶</li>
          <li><strong>clusterAdmin</strong>：允許執行集群管理操作</li>
          <li><strong>readAnyDatabase</strong>：允許讀取所有數據庫</li>
          <li><strong>readWriteAnyDatabase</strong>：允許讀寫所有數據庫</li>
          <li><strong>userAdminAnyDatabase</strong>：允許在所有數據庫上管理用戶</li>
          <li><strong>dbAdminAnyDatabase</strong>：允許在所有數據庫上執行管理任務</li>
          <li><strong>root</strong>：超級用戶，擁有所有權限</li>
        </ul>
      </section>

      <section>
        <h2>4. 資料備份與恢復</h2>
        <p>定期備份 MongoDB 數據是防止數據丟失的關鍵：</p>
        <h3>4.1 使用 mongodump 備份</h3>
        <pre><code>
# 備份所有數據庫
$ mongodump --authenticationDatabase admin -u adminUser -p --out /backup/mongodb/$(date +%Y%m%d)

# 備份特定數據庫
$ mongodump --authenticationDatabase admin -u adminUser -p --db myAppDatabase --out /backup/mongodb/$(date +%Y%m%d)

# 備份特定集合
$ mongodump --authenticationDatabase admin -u adminUser -p --db myAppDatabase --collection myCollection --out /backup/mongodb/$(date +%Y%m%d)
        </code></pre>
        
        <h3>4.2 使用 mongorestore 恢復</h3>
        <pre><code>
# 恢復所有數據庫
$ mongorestore --authenticationDatabase admin -u adminUser -p /backup/mongodb/20251124/

# 恢復特定數據庫
$ mongorestore --authenticationDatabase admin -u adminUser -p --db myAppDatabase /backup/mongodb/20251124/myAppDatabase/

# 恢復特定集合
$ mongorestore --authenticationDatabase admin -u adminUser -p --db myAppDatabase --collection myCollection /backup/mongodb/20251124/myAppDatabase/myCollection.bson
        </code></pre>
        
        <h3>4.3 使用 mongoexport 導出 JSON</h3>
        <pre><code>
# 導出集合為 JSON 格式
$ mongoexport --authenticationDatabase admin -u adminUser -p --db myAppDatabase --collection myCollection --out /backup/mongodb/myCollection.json

# 導出為格式化 JSON
$ mongoexport --authenticationDatabase admin -u adminUser -p --db myAppDatabase --collection myCollection --out /backup/mongodb/myCollection.json --pretty
        </code></pre>
        
        <h3>4.4 使用 mongoimport 導入 JSON</h3>
        <pre><code>
# 導入 JSON 到集合
$ mongoimport --authenticationDatabase admin -u adminUser -p --db myAppDatabase --collection myCollection --file /backup/mongodb/myCollection.json

# 導入時覆蓋現有數據
$ mongoimport --authenticationDatabase admin -u adminUser -p --db myAppDatabase --collection myCollection --file /backup/mongodb/myCollection.json --drop
        </code></pre>
        
        <h3>4.5 設置自動備份</h3>
        <pre><code>
# 創建備份腳本
$ sudo nano /usr/local/bin/mongodb-backup.sh

#!/bin/bash
BACKUP_DIR="/backup/mongodb/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR
mongodump --authenticationDatabase admin -u adminUser -p "securePassword" --out $BACKUP_DIR
find /backup/mongodb -type d -mtime +7 -exec rm -rf {} \;

# 設置執行權限
$ sudo chmod +x /usr/local/bin/mongodb-backup.sh

# 添加到 crontab
$ sudo crontab -e
# 添加以下行以每天凌晨 2 點執行備份
# 0 2 * * * /usr/local/bin/mongodb-backup.sh
        </code></pre>
      </section>

      <section>
        <h2>5. 性能優化</h2>
        <p>優化 MongoDB 以提高性能和效率：</p>
        <h3>5.1 創建索引</h3>
        <pre><code>
# 連接到 MongoDB
$ mongosh --authenticationDatabase admin -u adminUser -p

# 切換到目標數據庫
> use myAppDatabase

# 創建單字段索引
> db.myCollection.createIndex({ fieldName: 1 })  // 1 表示升序索引

# 創建複合索引
> db.myCollection.createIndex({ field1: 1, field2: -1 })  // -1 表示降序索引

# 創建唯一索引
> db.myCollection.createIndex({ email: 1 }, { unique: true })

# 創建文本索引
> db.myCollection.createIndex({ description: "text" })

# 查看集合的索引
> db.myCollection.getIndexes()
        </code></pre>
        
        <h3>5.2 查詢優化</h3>
        <pre><code>
# 使用 explain() 分析查詢性能
> db.myCollection.find({ field: "value" }).explain("executionStats")

# 使用投影僅返回需要的字段
> db.myCollection.find({ field: "value" }, { neededField: 1, _id: 0 })

# 使用 limit() 限制結果數量
> db.myCollection.find().limit(100)

# 使用 sort() 排序結果
> db.myCollection.find().sort({ field: 1 })
        </code></pre>
        
        <h3>5.3 配置優化</h3>
        <pre><code>
# 編輯配置文件
$ sudo nano /etc/mongod.conf

# 優化內存使用
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1  # 根據可用內存調整

# 優化連接池
net:
  maxIncomingConnections: 1000

# 優化日誌
systemLog:
  verbosity: 0  # 0-5，數字越大日誌越詳細
  quiet: false
  traceAllExceptions: false
        </code></pre>
        
        <h3>5.4 監控性能</h3>
        <pre><code>
# 連接到 MongoDB
$ mongosh --authenticationDatabase admin -u adminUser -p

# 查看數據庫狀態
> db.serverStatus()

# 查看當前操作
> db.currentOp()

# 查看集合統計信息
> db.myCollection.stats()

# 查看數據庫統計信息
> db.stats()
        </code></pre>
      </section>

      <section>
        <h2>6. MongoDB Compass 安裝與使用</h2>
        <p>MongoDB Compass 是一個圖形化界面工具，用於可視化和操作 MongoDB 數據：</p>
        <h3>6.1 下載與安裝</h3>
        <ol>
          <li>訪問 <a href="https://www.mongodb.com/try/download/compass" target="_blank">MongoDB Compass 下載頁面</a></li>
          <li>選擇適合您操作系統的版本下載</li>
          <li>安裝下載的文件</li>
        </ol>
        <p>在 Ubuntu 上使用 .deb 包安裝：</p>
        <pre><code>
# 安裝 .deb 包
$ sudo dpkg -i mongodb-compass_*.deb

# 如果有依賴問題，運行
$ sudo apt --fix-broken install
        </code></pre>
        
        <h3>6.2 連接到 MongoDB 服務器</h3>
        <ol>
          <li>啟動 MongoDB Compass</li>
          <li>在連接字符串中輸入：<code>mongodb://username:password@hostname:27017/admin</code></li>
          <li>或使用表單填寫連接信息：
            <ul>
              <li>Hostname: localhost 或伺服器 IP</li>
              <li>Port: 27017</li>
              <li>Authentication: Username/Password</li>
              <li>Username: adminUser</li>
              <li>Password: securePassword</li>
              <li>Authentication Database: admin</li>
            </ul>
          </li>
          <li>點擊「Connect」按鈕</li>
        </ol>
        
        <h3>6.3 使用 Compass 管理數據</h3>
        <p>MongoDB Compass 提供以下功能：</p>
        <ul>
          <li>瀏覽和查詢數據庫與集合</li>
          <li>創建、編輯和刪除文檔</li>
          <li>創建和管理索引</li>
          <li>分析查詢性能</li>
          <li>可視化數據分布</li>
          <li>導入和導出數據</li>
          <li>監控數據庫性能</li>
        </ul>
      </section>

      <section>
        <h2>7. MongoDB Shell 操作指南</h2>
        <p>MongoDB Shell (mongosh) 是一個功能強大的命令行工具，用於與 MongoDB 交互：</p>
        <h3>7.1 安裝 MongoDB Shell</h3>
        <pre><code>
# 下載 MongoDB Shell
$ wget https://downloads.mongodb.com/compass/mongodb-mongosh_1.8.0_amd64.deb

# 安裝
$ sudo dpkg -i mongodb-mongosh_1.8.0_amd64.deb

# 檢查版本
$ mongosh --version
        </code></pre>
        
        <h3>7.2 基本操作</h3>
        <pre><code>
# 連接到 MongoDB
$ mongosh

# 顯示所有數據庫
> show dbs

# 切換/創建數據庫
> use myDatabase

# 顯示當前數據庫中的集合
> show collections

# 創建集合
> db.createCollection("myCollection")

# 插入文檔
> db.myCollection.insertOne({ name: "John", age: 30, city: "New York" })

# 插入多個文檔
> db.myCollection.insertMany([
  { name: "Jane", age: 25, city: "Los Angeles" },
  { name: "Bob", age: 35, city: "Chicago" }
])

# 查詢所有文檔
> db.myCollection.find()

# 格式化輸出
> db.myCollection.find().pretty()
        </code></pre>
        
        <h3>7.3 查詢操作</h3>
        <pre><code>
# 條件查詢
> db.myCollection.find({ age: { $gt: 25 } })  // 年齡大於 25

# AND 條件
> db.myCollection.find({ age: { $gt: 25 }, city: "Chicago" })

# OR 條件
> db.myCollection.find({ $or: [{ age: { $gt: 30 } }, { city: "Los Angeles" }] })

# 排序
> db.myCollection.find().sort({ age: 1 })  // 1 升序，-1 降序

# 限制結果數量
> db.myCollection.find().limit(2)

# 跳過結果
> db.myCollection.find().skip(1).limit(2)

# 計數
> db.myCollection.countDocuments({ age: { $gt: 25 } })
        </code></pre>
        
        <h3>7.4 更新操作</h3>
        <pre><code>
# 更新單個文檔
> db.myCollection.updateOne(
  { name: "John" },
  { $set: { age: 31, city: "Boston" } }
)

# 更新多個文檔
> db.myCollection.updateMany(
  { age: { $gt: 30 } },
  { $set: { status: "senior" } }
)

# 替換整個文檔
> db.myCollection.replaceOne(
  { name: "John" },
  { name: "John Smith", age: 31, city: "Boston", status: "active" }
)
        </code></pre>
        
        <h3>7.5 刪除操作</h3>
        <pre><code>
# 刪除單個文檔
> db.myCollection.deleteOne({ name: "John" })

# 刪除多個文檔
> db.myCollection.deleteMany({ age: { $lt: 30 } })

# 刪除集合
> db.myCollection.drop()

# 刪除數據庫
> db.dropDatabase()
        </code></pre>
      </section>

      <section>
        <h2>8. 常見問題排解</h2>
        <p>MongoDB 使用過程中可能遇到的常見問題及解決方法：</p>
        <h3>8.1 連接問題</h3>
        <pre><code>
# 檢查 MongoDB 服務狀態
$ sudo systemctl status mongod

# 檢查 MongoDB 日誌
$ sudo tail -f /var/log/mongodb/mongod.log

# 檢查 MongoDB 是否監聽正確的端口和 IP
$ sudo netstat -plntu | grep mongod

# 檢查防火牆設置
$ sudo ufw status
        </code></pre>
        <p>常見連接問題解決方法：</p>
        <ul>
          <li>確保 MongoDB 服務正在運行</li>
          <li>檢查 bindIp 設置是否正確（如果需要遠程訪問，應設置為 0.0.0.0 或特定 IP）</li>
          <li>確保防火牆允許 MongoDB 端口（默認 27017）</li>
          <li>檢查認證設置和用戶憑證是否正確</li>
        </ul>
        
        <h3>8.2 性能問題</h3>
        <p>MongoDB 性能下降的常見原因和解決方法：</p>
        <ul>
          <li><strong>缺少索引</strong>：為常用查詢字段創建適當的索引</li>
          <li><strong>內存不足</strong>：增加服務器內存或調整 cacheSizeGB 設置</li>
          <li><strong>查詢效率低</strong>：使用 explain() 分析查詢，優化查詢模式</li>
          <li><strong>磁盤 I/O 瓶頸</strong>：使用 SSD 存儲或優化存儲配置</li>
          <li><strong>連接數過多</strong>：檢查應用程序是否正確關閉連接，調整 maxIncomingConnections</li>
        </ul>
        
        <h3>8.3 數據恢復</h3>
        <p>在數據損壞或意外刪除的情況下：</p>
        <ul>
          <li>使用最近的備份恢復數據</li>
          <li>如果使用了 WiredTiger 存儲引擎（默認），可以嘗試從日誌恢復</li>
          <li>對於重要數據，考慮使用專業數據恢復服務</li>
        </ul>
        <pre><code>
# 從備份恢復
$ mongorestore --authenticationDatabase admin -u adminUser -p /path/to/backup
        </code></pre>
        
        <h3>8.4 常見錯誤代碼</h3>
        <ul>
          <li><strong>Error 13</strong>：權限錯誤，檢查用戶權限和文件系統權限</li>
          <li><strong>Error 48</strong>：端口已被占用，檢查是否有其他 MongoDB 實例或程序使用相同端口</li>
          <li><strong>Error 100</strong>：認證失敗，檢查用戶名和密碼</li>
          <li><strong>Error 14</strong>：未授權操作，檢查用戶角色和權限</li>
        </ul>
      </section>

      <section>
        <h2>9. 安全最佳實踐</h2>
        <p>保護 MongoDB 數據庫的安全最佳實踐：</p>
        <ul>
          <li><strong>啟用認證</strong>：始終啟用認證機制</li>
          <li><strong>使用強密碼</strong>：為所有用戶設置強密碼</li>
          <li><strong>最小權限原則</strong>：為用戶分配最小必要權限</li>
          <li><strong>限制網絡訪問</strong>：使用防火牆限制對 MongoDB 端口的訪問</li>
          <li><strong>加密通信</strong>：配置 TLS/SSL 加密</li>
          <li><strong>加密存儲數據</strong>：使用存儲加密（企業版功能）</li>
          <li><strong>定期備份</strong>：實施定期備份策略</li>
          <li><strong>更新至最新版本</strong>：保持 MongoDB 版本更新以獲取安全補丁</li>
          <li><strong>審計日誌</strong>：啟用審計功能（企業版功能）</li>
          <li><strong>定期安全審查</strong>：定期檢查安全配置和訪問日誌</li>
        </ul>
      </section>

      <section>
        <h2>10. 進階主題</h2>
        <h3>10.1 複製集</h3>
        <p>MongoDB 複製集提供高可用性和數據冗餘：</p>
        <pre><code>
# 配置複製集
replication:
  replSetName: "rs0"
        </code></pre>
        <p>初始化複製集：</p>
        <pre><code>
# 連接到主節點
$ mongosh

# 初始化複製集
> rs.initiate({
    _id: "rs0",
    members: [
      { _id: 0, host: "mongodb0.example.com:27017" },
      { _id: 1, host: "mongodb1.example.com:27017" },
      { _id: 2, host: "mongodb2.example.com:27017" }
    ]
  })

# 檢查複製集狀態
> rs.status()
        </code></pre>
        
        <h3>10.2 分片</h3>
        <p>MongoDB 分片用於水平擴展，處理大數據集和高吞吐量：</p>
        <ul>
          <li>設置配置服務器</li>
          <li>設置分片服務器</li>
          <li>設置 mongos 路由服務</li>
          <li>配置數據庫和集合分片</li>
        </ul>
        
        <h3>10.3 監控與分析</h3>
        <p>使用 MongoDB 內置工具和第三方工具監控數據庫：</p>
        <ul>
          <li>MongoDB Atlas 監控（雲服務）</li>
          <li>MongoDB Cloud Manager</li>
          <li>Prometheus + Grafana</li>
          <li>MongoDB Compass</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tags = ref(['MongoDB', '資料庫', '後端', 'NoSQL']);
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