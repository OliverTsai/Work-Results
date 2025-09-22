<template>
  <div class="clear-cache-container">
    <button 
      @click="clearCache" 
      class="clear-cache-button"
      :disabled="isClearing"
    >
      {{ isClearing ? '清除中...' : '清除網頁快取' }}
    </button>
    <span v-if="showMessage" class="clear-cache-message" :class="{ 'success': isSuccess }">
      {{ message }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'ClearCache',
  data() {
    return {
      isClearing: false,
      showMessage: false,
      isSuccess: false,
      message: '',
    }
  },
  methods: {
    async clearCache() {
      this.isClearing = true;
      this.showMessage = false;
      
      try {
        // 清除各種類型的快取
        await this.clearCaches();
        await this.clearLocalStorage();
        await this.clearSessionStorage();
        await this.clearCookies();
        
        this.message = '快取清除成功！';
        this.isSuccess = true;
      } catch (error) {
        console.error('清除快取時發生錯誤:', error);
        this.message = '清除快取失敗，請重試';
        this.isSuccess = false;
      } finally {
        this.isClearing = false;
        this.showMessage = true;
        
        // 5秒後隱藏訊息
        setTimeout(() => {
          this.showMessage = false;
        }, 5000);
      }
    },
    
    // 清除 Cache API 快取
    async clearCaches() {
      if ('caches' in window) {
        try {
          const cacheNames = await window.caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => {
              return caches.delete(cacheName);
            })
          );
        } catch (error) {
          console.error('清除 Cache API 快取失敗:', error);
        }
      }
    },
    
    // 清除 localStorage
    clearLocalStorage() {
      try {
        window.localStorage.clear();
      } catch (error) {
        console.error('清除 localStorage 失敗:', error);
      }
    },
    
    // 清除 sessionStorage
    clearSessionStorage() {
      try {
        window.sessionStorage.clear();
      } catch (error) {
        console.error('清除 sessionStorage 失敗:', error);
      }
    },
    
    // 清除 cookies
    clearCookies() {
      try {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      } catch (error) {
        console.error('清除 cookies 失敗:', error);
      }
    }
  }
}
</script>

<style scoped>
.clear-cache-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.clear-cache-button {
  padding: 10px 20px;
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.clear-cache-button:hover {
  background-color: #3a5ce5;
}

.clear-cache-button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.clear-cache-message {
  font-size: 14px;
  color: #ff4d4f;
}

.clear-cache-message.success {
  color: #52c41a;
}
</style>