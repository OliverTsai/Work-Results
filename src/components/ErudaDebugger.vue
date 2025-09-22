<template>
  <div class="eruda-debugger">
    <button 
      @click="toggleEruda" 
      :class="['debug-btn', isActive ? 'active' : '']"
      :title="isActive ? '關閉調試工具' : '開啟調試工具'"
    >
      {{ buttonText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// 定義props，可以自定義按鈕文字
const props = defineProps({
  buttonText: {
    type: String,
    default: 'Debug'
  }
});

// 追蹤Eruda是否已啟用
const isActive = ref(false);

// 檢查Eruda是否已載入
const isErudaLoaded = () => {
  return typeof window !== 'undefined' && window.eruda !== undefined;
};

// 載入Eruda
const loadEruda = () => {
  return new Promise<void>((resolve) => {
    if (isErudaLoaded()) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/eruda';
    document.body.appendChild(script);
    script.onload = () => {
      resolve();
    };
  });
};

// 初始化Eruda
const initEruda = async () => {
  await loadEruda();
  
  if (!window.eruda._isInit) {
    window.eruda.init({
      tool: ['console', 'elements', 'network', 'resources', 'info', 'sources'],
      useShadowDom: true,
      autoScale: true,
      defaults: {
        displaySize: 50,
        transparency: 0.9
      }
    });
  }
};

// 切換Eruda的顯示狀態
const toggleEruda = async () => {
  if (!isErudaLoaded()) {
    await initEruda();
  }
  
  if (window.eruda._isInit) {
    if (isActive.value) {
      window.eruda.hide();
    } else {
      window.eruda.show();
    }
    isActive.value = !isActive.value;
  }
};

// 組件掛載時檢查Eruda狀態
onMounted(() => {
  // 如果Eruda已經載入並初始化，更新狀態
  if (isErudaLoaded() && window.eruda._isInit) {
    isActive.value = true;
  }
});

// 組件卸載時，如果Eruda是由此組件開啟的，則關閉它
onUnmounted(() => {
  if (isActive.value && isErudaLoaded() && window.eruda._isInit) {
    window.eruda.hide();
  }
});

// 為TypeScript添加全局類型定義
declare global {
  interface Window {
    eruda: {
      init: (options?: any) => void;
      show: () => void;
      hide: () => void;
      _isInit: boolean;
    };
  }
}
</script>

<style scoped>
.eruda-debugger {
  position: relative;
  display: inline-block;
}

.debug-btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: #f8f9fa;
  color: #212529;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.debug-btn:hover {
  background-color: #e2e6ea;
  border-color: #dae0e5;
}

.debug-btn.active {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}
</style>