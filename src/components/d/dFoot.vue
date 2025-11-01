<template>
  <footer class="d-footer">
    <div class="container">
      <div class="footer-content">
        <div class="copyright">
          &copy; {{ new Date().getFullYear() }} My Portfolio. All Rights Reserved.
        </div>
        <div class="footer-links">
          <a href="/privacy">隱私政策</a>
          <a href="/contact">聯絡我</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// 桌面版底部組件邏輯
</script>

<style lang="scss" scoped>
.d-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
  padding: 20px 0;
  z-index: 90;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .copyright {
    color: #666;
    font-size: 0.9rem;
  }
  
  .footer-links {
    display: flex;
    gap: 20px;
    
    a {
      color: #666;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.3s;
      
      &:hover {
        color: #3498db;
      }
    }
  }
}
</style>