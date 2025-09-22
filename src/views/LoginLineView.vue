<template>
  <div class="login-container">
    <img @click="loginWithLine" src="@/assets/picture/line_in.png" alt="Loading Background" class="loading-background">
    <p class="other-login-methods">其他登入方式建置中...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 替換成你的 LINE Channel ID 和 redirect URI
const clientId = '2006807417'
const redirectUri = encodeURIComponent('https://devpoki.ebrainzone.com/game/callback') // 要在LINE開發者後台設定
const scope = 'profile openid email'
const state = crypto.randomUUID() // 用於防止 CSRF

const loginWithLine = () => {
  const authUrl = `https://access.line.me/oauth2/v2.1/authorize` +
    `?response_type=code` +
    `&client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&state=${state}` +
    `&scope=${scope}`

  window.location.href = authUrl
}
</script>

<style lang="scss">

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background-image: url('@/assets/picture/loding_bg.png');
  background-size: cover; /* 背景自動縮放填滿 */
  background-position: center; /* 背景居中 */
  background-repeat: no-repeat; /* 背景不重複 */
}

.loading-background{
  margin-top: 14rem;
}

.other-login-methods {
  margin-top: 20px;
  color: #ffffff;
  font-size: 14px;
  text-align: center;
}

</style>