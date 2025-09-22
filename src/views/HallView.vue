<template>
  
  <transition name="fade" mode="out-in">
    <div class="mBgOut" v-show="isLoaded">
      <HeadView />
      <div class="mBg">
        <div class="mbodyListBox p-3">
          <div class="mbodyListRow mt-3">
            <div class="listBoxCenter">
              <div class="imgBox1" @click="animateClick($event); transfer('/guild')"><img src="../assets/picture/btn-league.png"></div>
              <div class="imgBox1" @click="animateClick($event); transfer('/friend')"><img src="../assets/picture/btn-friend.png"></div>
              <div class="imgBox1" @click="animateClick($event); transfer('/store')"><img src="../assets/picture/btn-deposit.png"></div>
            </div>
            <div class="userImg">
              <img class="ground" src="@/assets/picture/Pedestal.png">
              <img class="player" :src=getCharacterImage()>
            </div>
            <div class="listBoxCenter">
              <div class="imgBox1" @click="animateClick($event); transfer('/bank')"><img src="../assets/picture/btn-bank.png"></div>
              <div class="imgBox1" @click="animateClick($event); buttonTXT('衣櫃')"><img src="../assets/picture/btn-closet.png"></div>
              <div class="imgBox1" @click="animateClick($event); buttonTXT('商店')"><img src="../assets/picture/btn-shop.png"></div>
            </div>
            <div class="gameButtonBox" @click="animateClick($event); handleGameButtonClick()">
              <div class="imgBox2"><img src="../assets/picture/btn-enter-game.png"></div>
            </div>
          </div>
        </div>
      </div>
      <!-- <chat /> -->
       <div class="chatBg">
        <Chat />
       </div>
    </div>
  </transition>
  <div v-if="!isLoaded" class="loading-overlay">
    <div class="spinner"></div> <!-- 這裡可以用自訂的 spinner 或文字 -->
    <p>Loading...</p>
  </div>

  <!-- 遊戲資源載入中的彈窗 -->
  <div v-if="isLoadingGameResources" class="loading-overlay">
    <div class="spinner"></div>
    <p>遊戲資源載入中...</p>
  </div>

  <!-- 自定義彈跳窗口 -->
  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content p-4">
      <div class="modal-header">
        <h3>{{ modalTitle }}</h3>
        <button class="close-button" @click="closeModal">×</button>
      </div>
      <div class="modal-body">
        {{ modalText }}
      </div>
      <!-- <div class="modal-footer">
        <button class="confirm-button" @click="closeModal">確定</button>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import HeadView from '@/components/HeadView.vue'
import Chat from '@/components/ChatView.vue'
import { onMounted, ref, computed, inject, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { preloadImages } from '@/utils/preload'

import bgTable from '@/assets/picture/bgTable.png'

// import 魔法師 from '@/assets/picture/user/assa3-3.png'
import 魔法師 from '@/assets/picture/user/Mage1_1.png'
import 弓箭手 from '@/assets/picture/user/Archer1_1.png'
import 刺客 from '@/assets/picture/user/Assassin1_1.png'
import 祭司 from '@/assets/picture/user/Cleric1_1.png'
import 騎士 from '@/assets/picture/user/Knight1_1.png'

// const images = import.meta.glob('@/assets/picture/*.png');

const character = ref<string>(localStorage.getItem("character") || "魔法師");

const isLoaded = ref(false);
const isLoadingGameResources = ref(false);
const router = useRouter();

// 彈跳窗口相關狀態
const showModal = ref(false);
const modalText = ref('');
const modalTitle = ref('提示');

// 嘗試從 HeadView 注入 character
const injectedCharacter = inject('character', null);
if (injectedCharacter) {
  watch(injectedCharacter, (newVal: string) => {
    if (newVal) {
      character.value = newVal;
    }
  });
}

// 預先載入基本圖片
const basicImages = [
  bgTable,
  魔法師,
  弓箭手,
  刺客,
  祭司,
  騎士
];

const guild = () => {
  router.push('/guild');
}

const transfer = (site:string) => {
  router.push(site);
}

// 處理遊戲按鈕點擊
async function handleGameButtonClick() {
  try {
    isLoadingGameResources.value = true;
    // 預載入遊戲相關圖片
    await preloadImages();
    isLoadingGameResources.value = false;
    // 載入完成後導航到遊戲選擇頁面
    router.push('/select');
  } catch (error) {
    console.error('載入遊戲資源失敗:', error);
    isLoadingGameResources.value = false;
    // 顯示錯誤訊息
    modalTitle.value = '錯誤';
    modalText.value = '載入遊戲資源失敗，請重試';
    showModal.value = true;
  }
}

// 根據character獲取對應的角色圖片
function getCharacterImage() {
  switch (character.value) {
    case '魔法師':
      return 魔法師;
    case '弓箭手':
      return 弓箭手;
      // return 魔法師;
    case '刺客':
      return 刺客;
    case '祭司':
      return 祭司;
    case '騎士':
      return 騎士;
    default:
      return 魔法師; // 預設顯示魔法師
  }
  // return 弓箭手
}

// 修改後的 buttonTXT 函數，顯示自定義彈跳窗口
function buttonTXT(TXT: string) {
  modalTitle.value = TXT;
  modalText.value = `${TXT}功能建置中...`;
  showModal.value = true;
}

// 關閉彈跳窗口
function closeModal() {
  showModal.value = false;
}

// 點擊動畫效果函數
function animateClick(event: Event) {
  const element = event.currentTarget as HTMLElement;
  element.classList.add('click-animation');
  
  // 動畫結束後移除類別
  setTimeout(() => {
    element.classList.remove('click-animation');
  }, 300); // 動畫時間為300毫秒
}

// 預先載入圖片方法
function preloadBasicImages(imageArray: string[]): Promise<void[]> {
  return Promise.all(
    imageArray.map(src => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve();
        img.onerror = () => resolve(); // 確保即使某些圖片載入失敗，也不會影響流程
      });
    })
  );
}

// 第一次連接
onMounted(async () => {
  character.value = localStorage.getItem("character") || "魔法師";
  await preloadBasicImages(basicImages);
  console.log("基本圖片已載入完成");
  isLoaded.value = true;
})
</script>

<style lang="scss">

.mBgOut{
  background-color: rgb(63, 46, 0);
  height: 100vh;
  width: 100vw;
  overflow: hidden; /* 這將裁切任何超出容器的內容 */
  position: relative;
}

.mBg{
  position: relative;
  background-image: url('../assets/picture/frame-upside.png'),url('../assets/picture/bg.png');
  background-size: cover; /* 背景自動縮放填滿 */
  background-position: center -0.6rem; /* 背景居中 */
  background-repeat: no-repeat; /* 背景不重複 */
  height: 47%;
}

.chatBg{
  background-color: #000000;
  height: 45%;
}

.mbodyListBox {
  display: flex;
  flex-direction:column;
  gap:1rem;
  height: 100%;
}

.mbodyListBox .mbodyListRow {
  display: flex;
  justify-content: space-between;
  padding: 3px 0px 3px 0px;
  height: 100%;
}

.mbodyListBox .mbodyListRow .mbodyListLeft {
  width: 6rem;
  height: 3rem;
  text-align: end;
  white-space: nowrap;
  text-overflow: ellipsis;

  img {
    width: 100%;
    height: 100%;
  }
}

.listBoxCenter{
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.userImg {
  position: relative;
  width: 9rem;
  height: 100%;

  .player{
    position: absolute;
    // top: -1rem;
    bottom: 10%;
    width: 17rem;
    right:-4rem;
    z-index: 3;
  }

  .ground{
    position: absolute;
    // top: 11rem;
    bottom: -1rem;
    left: -2rem;
    width: 13rem;
  }

  img{
    width: 100%;
  }

}

.inputArea {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.gameButtonBox{
  position: absolute;
  top: 90%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  z-index: 15;
}

.imgBox1{

  width: 5rem;
  height: 5rem;
  animation-duration: 0.3s;
  animation-timing-function: ease;
  z-index: 5;

  &:active {
    animation-name: clickAnimation;
  }

  img{
    width: 100%;
    height: 100%;
  }
}

.imgBox2{

  width: 14rem;
  animation-duration: 0.3s;
  animation-timing-function: ease;

  &:active {
    animation-name: clickAnimation;
  }

  img{
    width: 100%;
  }
}

@keyframes clickAnimation {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.footer {
  position: fixed;
  bottom: 0; /* 固定在底部 */
  left: 0;
  width: 100%; /* 佔滿寬度 */
  height: 10rem; /* 高度固定 */
  background-color: #333; /* 底部背景色 */
  color: white; /* 文字顏色 */
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center; /* 文字居中 */
  z-index: 1000; /* 確保區塊在最上層 */
}

/* 彈跳窗口樣式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.modal-content {
  background-color: #fff;
  border-radius: 8px;
  width: 80%;
  max-width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  background-color: #4a2f00;
  color: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 20px;
  color: #ffffff;
  font-size: 16px;
}

.modal-footer {
  padding: 10px 15px;
  text-align: right;
  border-top: 1px solid #ddd;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.confirm-button {
  background-color: #4a2f00;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  font-size: 14px;
}

.confirm-button:hover {
  background-color: #6b4400;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  z-index: 1200;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid white;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>