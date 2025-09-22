<template>
  <div class="store-container">
    <img class="store-background" src="../assets/picture/store-background.png">
    <img class="store-background second" src="../assets/picture/store-background2.png">
    <div class="mGuildBackBtnBox">
        <img @click="handleLeave()" src="@/assets/picture/btn-back.png">
    </div>
    <div class="store-card">
      <div class="header">
        <div class="title">快速儲值</div>
      </div>
      <div class="quick-recharge">
        <div class="recharge-row">
          <div class="recharge-item">
            <div class="payment-method">mycard 序號</div>
            <div class="coin-amount"><span class="coin-icon"></span> 5,000</div>
            <button class="recharge-btn">$50</button>
          </div>
          <div class="recharge-item">
            <div class="payment-method">電信</div>
            <div class="coin-amount"><span class="coin-icon"></span> 10,000</div>
            <button class="recharge-btn">$100</button>
          </div>
          <div class="recharge-item">
            <div class="payment-method">LINE Pay</div>
            <div class="coin-amount"><span class="coin-icon"></span> 15,300</div>
            <button class="recharge-btn">$150</button>
          </div>
        </div>
        <div class="recharge-row">
          <div class="recharge-item">
            <div class="payment-method">mycard 序號</div>
            <div class="coin-amount"><span class="coin-icon"></span> 15,200</div>
            <button class="recharge-btn">$150</button>
          </div>
          <div class="recharge-item">
            <div class="payment-method">LINE Pay</div>
            <div class="coin-amount"><span class="coin-icon"></span> 30,900</div>
            <button class="recharge-btn">$300</button>
          </div>
          <div class="recharge-item">
            <div class="payment-method">LINE Pay</div>
            <div class="coin-amount"><span class="coin-icon"></span> 330,300</div>
            <button class="recharge-btn">$3,000</button>
          </div>
        </div>
      </div>

      <div class="header">
        <div class="title">一般儲值</div>
      </div>
      <div class="normal-recharge">
        <div class="recharge-row">
          <div class="normal-item">
            <div class="normal-icon mycard"></div>
            <div class="normal-text">序號儲值</div>
          </div>
          <div class="normal-item">
            <div class="normal-icon mycard"></div>
            <div class="normal-text">線上儲值</div>
          </div>
          <div class="normal-item">
            <div class="normal-icon mycard"></div>
            <div class="normal-text">免費扣抵</div>
          </div>
        </div>
        <div class="recharge-row">
          <div class="normal-item">
            <div class="normal-icon apple-pay"></div>
            <div class="normal-text">Apple Pay</div>
          </div>
          <div class="normal-item">
            <div class="normal-icon mobile"></div>
            <div class="normal-text">行動支付</div>
          </div>
          <div class="normal-item">
            <div class="normal-icon bank"></div>
            <div class="normal-text">銀行轉帳</div>
          </div>
          <div class="normal-item">
            <div class="normal-icon credit-card"></div>
            <div class="normal-text">信用卡</div>
          </div>
        </div>
      </div>
    </div>
    <div class="store-balance">
        <div class="balance-text">帳戶金幣</div>
        <div class="balance-amount">{{ balance }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const balance = ref(localStorage.getItem("balance") || "");

// 離開按鈕點擊事件
const handleLeave = () => {
  router.push("/hall");
};
</script>

<style lang="scss">
.store-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    padding: 1rem 1rem 4rem 1rem;
    overflow-y: auto;
}

.store-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  object-fit: cover;
}

.store-background.second{
    z-index: 1;
}


.store-card {
  width: 100%;
  max-width: 500px;
  padding: 0.3rem;
  position: relative;
  z-index: 2;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    z-index: -1;
  }
  
  &::before {
    top: -10px;
    left: -10px;
  }
  
  &::after {
    bottom: -10px;
    right: -10px;
  }
}

.header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    margin: 0 10px;
  }
  
  .title {
    color: #694804;
    font-size: 18px;
    font-weight: bold;
    padding: 0 10px;
    position: relative;
    
    &::before,
    &::after {
      content: '✦';
      color: #694804;
      margin: 0 10px;
    }
  }
}

.recharge-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.recharge-item {
  flex: 1;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 10px;
  margin: 0 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .payment-method {
    font-size: 12px;
    color: #333;
    margin-bottom: 5px;
  }
  
  .coin-amount {
    display: flex;
    align-items: center;
    font-weight: bold;
    color: #333;
    
    .coin-icon {
      display: inline-block;
      width: 15px;
      height: 15px;
      background-color: #ffc107;
      border-radius: 50%;
      margin-right: 5px;
    }
  }
  
  .price {
    color: #333;
    margin: 5px 0;
  }
  
  .recharge-btn {
    background-color: #694804;
    color: white;
    border: none;
    border-radius: 15px;
    padding: 3px 10px;
    font-size: 12px;
    cursor: pointer;
    
    &:hover {
      background-color: #2a5ca0;
    }
  }
}

.normal-recharge {
  margin: 15px 0;
}

.normal-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 5px;
  
  .normal-icon {
    width: 50px;
    height: 50px;
    background-color: #f5f5f5;
    border-radius: 8px;
    margin-bottom: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    
    &.mycard {
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23f5f5f5"/></svg>');
    }
    
    &.apple-pay {
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23f5f5f5"/></svg>');
    }
    
    &.mobile {
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23f5f5f5"/></svg>');
    }
    
    &.bank {
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23f5f5f5"/></svg>');
    }
    
    &.credit-card {
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23f5f5f5"/></svg>');
    }
  }
  
  .normal-text {
    color: #f0e6d2;
    font-size: 12px;
    text-align: center;
  }
}

.store-balance {
    position: absolute;
    bottom: 6%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 20px;
    padding: 10px;
    z-index: 2;

    .balance-text {
        color: #ffc107;
        font-size: 14px;
        margin-bottom: 5px;
    }
  
    .balance-amount {
        color: #ffc107;
        font-size: 18px;
        font-weight: bold;
    }
}
</style>