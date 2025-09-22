<template>
  <div class="headBg">
    <div class="headTitle">
      <router-link to="/user">
        <div class="userBox">
          <img class="userImgBack" src="../assets/picture/top-account.png">
          <div class="avatarBox">
            <img :src="avatar">
          </div>
          <p class="userText">{{ name }}</p>
        </div>
      </router-link>
      <div class="balanceBox" @click="openBalanceModal">
        <img class="balanceImg" src="../assets/picture/top-balance.png">
        <div class="balanceText">{{ balance }}</div>
        <img @click="openBalanceModal" class="balanceImg2" src="../assets/picture/CLASH_PLUS 1.png">
      </div>
      <div class="lvBox" @click="openLevelModal">
        <img class="lvImg" src="../assets/picture/top-lv.png">
        <div class="lvText">{{ lv }}</div>
      </div>
    </div>
  </div>
  <!-- 使用 Bootstrap Vue 3 的 Modal 組件 -->
  <b-modal id="user-modal" hide-header hide-footer content-class="custom-modal" body-class="modalBodyBox">
    <img :src="avatar" class="rounded-circle" width="100">
    <h4>{{ name }}</h4>
    <p>等級: {{ lv }}</p>
    <p>餘額: {{ balance }}</p>
    <div @click="closeModalAndNavigate">遊戲紀錄</div>
    <div class="btnCloseBox mt-2">
    <img :src="closeButtonImg" @click="hideUserModal" class="close-img">
    </div>
  </b-modal>
</template>
  
<script setup lang="ts">

import { ref ,onMounted ,watch ,computed, provide   } from'vue'
// import { ref ,onMounted ,defineExpose ,inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { playerApi } from '@/composables/useApi';
import { useWebSocketStore } from "@/store/websocketStore";
import { BModal } from 'bootstrap-vue-3';
import { useTableStore } from "@/store/tableStore";

const tableStore = useTableStore();

const token = ref(localStorage.getItem("token") || "");
const member = ref(localStorage.getItem("member") || "");

const router = useRouter();
const route = useRoute();

// 導入圖片資源
import closeButtonImg from '@/assets/picture/btn-close.png';

const avatar = ref<string | undefined>('')
const name = ref('mAboutView');
const lv = ref(50);
const balance = ref('');
// 使用 ref 來控制 Modal 的顯示
const showUserModal = ref(false);
const showBalanceModal = ref(false);
const showLevelModal = ref(false);

const character = ref("魔法師");
  
const wsStore = useWebSocketStore();
// const{ messages } = useWebSocketStore();

// 提供 character 給其他組件使用
provide('character', character);

//個人資料
const openModal = () => {
  showUserModal.value = true;
};
  
//儲值
const openBalanceModal = () => {
  router.push('/store');
};

//等級
const openLevelModal = () => {
    showLevelModal.value = true;
};

// 隱藏 Modal 的方法
const hideUserModal = () => {
  showUserModal.value = false;
};

//跳轉遊戲紀錄
const closeModalAndNavigate = () => {
  router.push('/play_log');
};

  
  
  // 第一次連接
onMounted(async () => {
  console.log("標頭顯示路由資訊:", route.name);
})
  
</script>
  
<style lang="scss">
.headBg{
  background-color: rgb(78, 67, 34);
  position: relative;
  z-index: 10;
  background-image: url('../assets/picture/Top_bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  .headTitle{
      display: flex;
      justify-content:space-between;
      align-items: center;
      padding: 0.5rem;
      gap:0.1rem;
  }

  .headBox{
      display: flex;
      gap:1rem;
  }
}

.imgBox{
  width: 6rem;
  height: 3rem;
  img{
      width:100%;
      height:100%;
  }
}

.balanceBox{
  position: relative;
  width: 100%;
  height: 2rem;
  font-size:0.9rem;
  display: flex;
  align-items: center;
  // justify-content: center;
  color: white;
  text-align: center;
  
  .balanceImg{
    position: relative;
    width: 85%;
    height: 150%;
  }

  .balanceText{
    position: absolute;
    left: 35%;
    top: 0.3rem;
    color: white;
    font-size: 0.8rem;
  }

  .balanceImg2{
    position: absolute;
    left: 70%;
    top: 0;
  }
}

.lvBox{
  position: relative;
  width: 40%;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;

  .lvImg{
    position: relative;
    width: 120%;
    height: 130%;
  }

  .lvText{
    position: absolute;
    left: 60%;
    top: 0.4rem;
    color: white;
    font-size: 0.8rem;
  }
}



.userBox{
  position: relative;
  max-width: 100%;
  height: 2rem;
  font-size:0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  // background-image: url('../assets/picture/top-account.png');
  // background-size: cover;
  // background-position: center;
  // background-repeat: no-repeat;

  .userImgBack{
    position: relative;
  }

  .avatarBox{
    position: absolute;
    left: 0.3rem;
    top: 0.2rem;
    width: 1.5rem;
    height: 1.5rem;
    img{
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }

  .userText{
    position: absolute;
    margin: 0;
    margin-left: 2rem;
    z-index: 10;
    white-space: nowrap; /* 讓文字不換行 */
    overflow: hidden; /* 隱藏超出的文字 */
    text-overflow: ellipsis; /* 超出時顯示省略號 */
    max-width: 100%; /* 限制最大寬度，避免超出 */
  }
}

//會員中心模板
.modal-dialog {
  display: flex;
  align-items: center;
  min-height: 100vh; /* 讓 Modal 區塊至少與視窗一樣高 */
}

.modal-content {
  height: 40rem;
  margin: auto;
  background-color: rgba(0, 0, 0, 0) !important; /* 透明黑色，讓背景圖透出 */
  border-radius: 10px;
  backdrop-filter: blur(5px); /* 增加毛玻璃效果 */
}

.custom-modal {
  background: url('../assets/picture/popup-bg.png') no-repeat center center;
  background-size: cover;
  color: white;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  max-height: 90vh; /* 避免超出視窗高度 */
}

.modalBodyBox {
  margin-top: 5rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}


.btnCloseBox{
  display: flex;
  align-items: center;
  width: 3rem;
  height: 3rem;
  img{
    width: 100%;
    height: 100%;
  }
}

</style>