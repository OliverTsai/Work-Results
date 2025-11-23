<template>
    <!-- 動態組件用於顯示選中的筆記 -->
    <div v-if="selectedNote" class="note-detail-container">
        <!-- <div class="back-button" @click="goBack">
            <i class="fas fa-arrow-left"></i> 返回筆記列表
        </div> -->
        <component :is="selectedNote.component" />
    </div>
    <div v-else class="technical-notes">
        <h1>技術筆記</h1>
        
        <div class="search-filter-container">
            <div class="search-box">
                <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="搜尋筆記標題..." 
                @input="filterNotes"
                />
            </div>
            
            <div class="tag-filters">
                <span class="tag-label">標籤篩選:</span>
                <div class="tags">
                    <span 
                        v-for="tag in allTags" 
                        :key="tag"
                        :class="['tag', { active: selectedTags.includes(tag) }]"
                        @click="toggleTag(tag)"
                    >
                        {{ tag }}
                    </span>
                </div>
            </div>
        </div>

        <div class="notes-list" v-if="filteredNotes.length > 0">
            <div 
                v-for="note in filteredNotes" 
                :key="note.id" 
                class="note-card"
                @click="navigateToNote(note.route)"
            >
                <h2>{{ note.title }}</h2>
                <div class="note-tags">
                <span v-for="tag in note.tags" :key="tag" class="note-tag">
                    {{ tag }}
                </span>
                </div>
                <p class="note-summary">{{ note.summary }}</p>
            </div>
        </div>
        
        <div class="no-notes" v-else>
            <p>沒有符合條件的筆記</p>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { notesData, getAllTags, getNoteByRoute } from '@/components/notes/index';

const router = useRouter();
const route = useRoute();
const searchQuery = ref('');
const selectedTags = ref<string[]>([]);
const selectedNote = ref<any>(null);

// 使用從 index.ts 導入的筆記數據
const notes = ref(notesData);
console.log('Loaded notes:', notes.value);

// 計算所有可用標籤
const allTags = computed(() => getAllTags());

// 根據搜索和標籤過濾筆記
const filteredNotes = computed(() => {
  return notes.value.filter(note => {
    // 標題搜尋
    const titleMatch = note.title.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    // 標籤篩選
    const tagMatch = selectedTags.value.length === 0 || 
      selectedTags.value.every(tag => note.tags.includes(tag));
    
    return titleMatch && tagMatch;
  });
});

// 篩選筆記（可以添加額外邏輯）
const filterNotes = () => {
  // 可以在這裡添加額外的篩選邏輯
};

// 切換標籤選擇
const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag);
  if (index === -1) {
    selectedTags.value.push(tag);
  } else {
    selectedTags.value.splice(index, 1);
  }
};

// 導航到筆記詳情
const navigateToNote = (noteRoute: string) => {
  router.push(`/notes/${noteRoute}`);
};

// 返回筆記列表
const goBack = () => {
  router.push('/notes');
};

// 監聽路由變化，顯示對應筆記
watch(
  () => route.params.noteRoute,
  (newNoteRoute) => {
    if (newNoteRoute) {
      const note = getNoteByRoute(newNoteRoute as string);
      console.log('Found note:', note);
      if (note) {
        selectedNote.value = note;
      } else {
        selectedNote.value = null;
      }
    } else {
      selectedNote.value = null;
    }
  },
  { immediate: true }
);

onMounted(() => {
  // 檢查當前路由是否包含筆記路徑
  if (route.params.noteRoute) {
    const note = getNoteByRoute(route.params.noteRoute as string);
    if (note) {
      selectedNote.value = note;
    }
  }
});
</script>

<style lang="scss" scoped>
.technical-notes {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  height: calc(100vh - 180px); /* 減去頁首頁尾的高度 */
  
  h1 {
    margin-bottom: 30px;
    color: #333;
    text-align: center;
  }
}

.search-filter-container {
  margin-bottom: 30px;
  
  .search-box {
    margin-bottom: 15px;
    
    input {
      width: 100%;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      
      &:focus {
        outline: none;
        border-color: #4a90e2;
      }
    }
  }
  
  .tag-filters {
    .tag-label {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
    }
    
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .tag {
        padding: 6px 12px;
        background-color: #f0f0f0;
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          background-color: #e0e0e0;
        }
        
        &.active {
          background-color: #4a90e2;
          color: white;
        }
      }
    }
  }
}

.notes-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  
  .note-card {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    h2 {
      margin-top: 0;
      margin-bottom: 10px;
      color: #333;
    }
    
    .note-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
      
      .note-tag {
        font-size: 12px;
        padding: 3px 8px;
        background-color: #e8f0fe;
        color: #4a90e2;
        border-radius: 12px;
      }
    }
    
    .note-summary {
      color: #666;
      font-size: 14px;
      margin: 0;
    }
  }
}

.note-detail-container {
  position: relative;
  padding: 20px;
  height: calc(100vh - 180px); /* 減去頁首頁尾的高度 */
  max-width: 1200px;
  margin: 0 auto;
  overflow-x: hidden;
  
  .back-button {
    display: inline-block;
    margin-bottom: 20px;
    padding: 8px 16px;
    background-color: #f0f0f0;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    font-weight: 500;
    
    &:hover {
      background-color: #e0e0e0;
    }
    
    i {
      margin-right: 5px;
    }
  }
}

.no-notes {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .technical-notes {
    padding: 15px;
    min-height: calc(100vh - 100px); /* 手機版頁首頁尾可能較小 */
  }
  
  .notes-list {
    grid-template-columns: 1fr;
  }
  
  .note-detail-container {
    padding: 15px;
    min-height: calc(100vh - 100px);
  }
  
  .search-filter-container {
    .tag-filters {
      .tags {
        .tag {
          padding: 4px 10px;
          font-size: 14px;
        }
      }
    }
  }
}

/* 適應不同的螢幕高度 */
@media (max-height: 600px) {
  .technical-notes, .note-detail-container {
    min-height: 500px; /* 確保在小螢幕上有最小高度 */
  }
}
</style>