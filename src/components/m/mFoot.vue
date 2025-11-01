<template>
  <footer class="m-footer">
    <div class="nav-tabs">
      <router-link to="/" class="tab-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5Z"/>
          <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6Z"/>
        </svg>
        <span>首頁</span>
      </router-link>
      <router-link to="/about" class="tab-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/>
        </svg>
        <span>關於我</span>
      </router-link>
      <router-link to="/skills" class="tab-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
          <path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z"/>
        </svg>
        <span>技能</span>
      </router-link>
      <router-link to="/experience" class="tab-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5zm1.886 6.914L15 7.151V12.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V7.15l6.614 1.764a1.5 1.5 0 0 0 .772 0zM1.5 4h13a.5.5 0 0 1 .5.5v1.616L8.129 7.948a.5.5 0 0 1-.258 0L1 6.116V4.5a.5.5 0 0 1 .5-.5z"/>
        </svg>
        <span>經歷</span>
      </router-link>
      <router-link to="/projects" class="tab-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M14.25 6.087c.355.137.68.298.975.477a5.568 5.568 0 0 1-.916 1.398.75.75 0 1 0 1.248.832 6.594 6.594 0 0 0 .837-3.416c0-1.24-.34-2.385-.921-3.32a.75.75 0 0 0-1.248.832A5.7 5.7 0 0 1 14.25 6.087Zm.328 2.483a9.522 9.522 0 0 1-1.875-.917.75.75 0 0 0-.75 1.3 11.187 11.187 0 0 0 2.625 1.087.75.75 0 0 0 0-1.47Zm-2.578 3.427A8.436 8.436 0 0 1 12 11.5a.75.75 0 1 0-1.5.075 9.925 9.925 0 0 0 .177 1.342.75.75 0 0 0 1.323-.67ZM5.92 6.272a.75.75 0 0 0-1.095 1.025 4.706 4.706 0 0 0 2.215 1.256.75.75 0 0 0 .361-1.456 3.194 3.194 0 0 1-1.481-.825Zm5.9.297a.75.75 0 0 0-1.212.887 3.807 3.807 0 0 1 .4 1.48.75.75 0 0 0 1.5-.063 5.289 5.289 0 0 0-.688-2.304ZM1.89 1.813a.75.75 0 0 0-1.188.918A9.493 9.493 0 0 0 2.217 6a.75.75 0 1 0 1.324-.706 7.991 7.991 0 0 1-1.65-3.482ZM9.33 8.902a.75.75 0 0 0-1.455.372c.129.503.21 1.023.233 1.55a.75.75 0 0 0 1.5-.058 9.553 9.553 0 0 0-.278-1.864Zm1.43 3.596a.75.75 0 0 0-1.436.432 5.63 5.63 0 0 0 .767 1.596.75.75 0 1 0 1.23-.86 4.094 4.094 0 0 1-.561-1.168ZM3.678 7.116a.75.75 0 0 0-1.472.307 9.552 9.552 0 0 0 .92 2.512.75.75 0 0 0 1.304-.745 8.09 8.09 0 0 1-.752-2.074Z"/>
        </svg>
        <span>作品集</span>
      </router-link>
    </div>
  </footer>
</template>

<script setup lang="ts">
// 手機版底部組件邏輯
</script>

<style lang="scss" scoped>
.m-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 90;
  
  .nav-tabs {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 50px;
  }
  
  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #777;
    text-decoration: none;
    font-size: 0.7rem;
    padding: 5px 0;
    width: 20%;
    
    svg {
      margin-bottom: 3px;
    }
    
    &.router-link-active {
      color: #3498db;
    }
  }
}
</style>