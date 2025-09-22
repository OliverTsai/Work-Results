<template>
  <div class="text-color-white text-center">
    <p>正在處理 LINE 登入...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted,ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { playerApi } from '@/composables/useApi';

const route = useRoute()
const router = useRouter()

const urlParams = new URLSearchParams(window.location.search)
const code = ref(urlParams.get('code'))
const state = ref(urlParams.get('state'))

console.log('code:', code.value)

//獲取登入的url
async function getGameUrl(){
  const url = playerApi(`/api/v1/home/social-login`);
  // const url = 'https://bopoki.ebrainzone.com/api/v1/home/social-login';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // 'Authorization': `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        provider: 'line-code',
        token:code.value,
      })
    });

    if (response.status === 401) {
      // 如果是 401 錯誤，跳轉到登入頁面
      console.error('認證失敗');
      router.push('/login_line');
      return null;
    } else if (!response.ok) {
      // 處理其他 HTTP 錯誤
      console.error(`HTTP 錯誤: ${response.status}`);
      const errorText = await response.text();
      console.error('錯誤響應內容:', errorText);
      throw new Error(`HTTP 錯誤: ${response.status}`);
    }

    const data: any = await response.json();
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('member', data.data.member_token);
    localStorage.setItem('name', data.data.user?.username);
    localStorage.setItem('character', data.data.user?.character);
    console.log('獲取資料成功:', data);

    //跳轉url
    if (data.success) {
      router.push('/hall');
    }

  } catch (error) {
    console.error('獲取URL失敗:', error);
    return null;
  }
}

onMounted(() => {
  // 檢查URL中是否有code和state參數（在哈希前面）
  getGameUrl();
})
</script>