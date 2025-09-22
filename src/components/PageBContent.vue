<template>
  <div class="page-b-content">
    <div v-if="data.length > 0">
      <h2>加載的數據</h2>
      <div class="data-container">
        <div v-for="(item, index) in data" :key="index" class="data-item">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const data = ref<any[]>([]);

// 模擬數據加載
const loadData = async () => {
  // 模擬網絡請求延遲
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 返回模擬數據
  return [
    {
      id: 1,
      title: '數據項目 1',
      description: '這是頁面B的數據項目1'
    },
    {
      id: 2,
      title: '數據項目 2',
      description: '這是頁面B的數據項目2'
    },
    {
      id: 3,
      title: '數據項目 3',
      description: '這是頁面B的數據項目3'
    }
  ];
};

// 異步加載數據
// 這會使組件成為異步組件，Suspense 將等待此 Promise 解析
const fetchData = async () => {
  const result = await loadData();
  data.value = result;
};

// 執行數據加載
await fetchData();
</script>

<style scoped>
.page-b-content {
  margin: 20px 0;
}

.data-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.data-item {
  padding: 15px;
  border-radius: 4px;
  background-color: #f0f0f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.data-item h3 {
  margin-top: 0;
  color: #333;
}
</style>