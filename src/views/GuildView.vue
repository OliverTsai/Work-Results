<template>
    <div class="mGuildBg">
        <img class="mGuild-list-bg" src="@/assets/picture/guild-list-bg.png">
        <div class="mGuildBackBtnBox">
          <img @click="handleLeave()" src="@/assets/picture/btn-back.png">
        </div>
        <div class="mGuildList p-3">
            <div class="dataList">
                <table v-if="guildList.length > 0" class="guild-table">
                    <thead>
                        <tr>
                            <th class="name-column">名稱</th>
                            <th class="president-column">會長</th>
                            <th class="members-column">人數</th>
                            <th class="action-column">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(guild, index) in paginatedGuildList" :key="index">
                            <td>{{ guild.name }}</td>
                            <td>{{ guild.president && guild.president[0] ? guild.president[0].nickname : '無會長' }}</td>
                            <td>{{ guild.guild_members_count }}</td>

                            <td>
                                <router-link :to="{ name: 'guild_details', query: { guild_id: guild.id } }">
                                    <div class="join-btn">
                                        <img src="@/assets/picture/Category_NoSelect.png" alt="按鈕圖示">
                                        <div class="btn-text">查看</div>
                                    </div>
                                </router-link>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div v-else class="no-data">暫無公會資料</div>
                
                <!-- 分頁控制 -->
                <div class="pagination">
                    <div :class="{ 'disabled': currentPage === 1 }" @click="prevPage">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-left-fill" viewBox="0 0 16 16">
                            <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"/>
                        </svg>
                    </div>
                    <span>{{ currentPage }} / {{ totalPages || 1 }}</span>
                    <div :class="{ 'disabled': currentPage === totalPages || totalPages === 0 }" @click="nextPage">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-right-fill" viewBox="0 0 16 16">
                            <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
        <div class="mGuildButtonSpace">
            <div class="guildButton" v-if="myGuildId === 0">
                <img src="@/assets/picture/button_on.png" alt="按鈕圖示">
                <button @click="openCreateGuildModal()">創立公會</button>
            </div>
            <div class="guildButton" v-else>
                <img src="@/assets/picture/button_on.png" alt="按鈕圖示">
                <button @click="openMyGuildModal()">我的公會</button>
            </div>
        </div>
    </div>

    <!-- 創立公會模態框 -->
     <!-- 創立公會的模態框 -->
    <div v-if="showCreateGuildModal" class="guild-modal create-guild-modal">
        <div class="guild-modal-content">
            <div class="guild-modal-header">
                <div></div>
                <h3>創立新公會</h3>
                <button class="close-button" @click="closeCreateGuildModal">&times;</button>
            </div>
            <div class="guild-modal-body">
                <div class="create-guild-form">
                    <div class="form-group">
                        <label for="guildName"></label>
                        <input 
                            type="text" 
                            id="guildName" 
                            v-model="newGuildName" 
                            placeholder="請輸入公會名稱" 
                            maxlength="20"
                            style="color: black;"
                        >
                        <div class="input-hint"></div>
                    </div>
                    <div v-if="createGuildError" class="error-message">
                        {{ createGuildError }}
                    </div>
                </div>
            </div>
            <div class="guild-modal-footer">
                <button 
                    @click="submitCreateGuild()" 
                    :disabled="!isValidGuildName || isCreatingGuild"
                    :class="{'loading': isCreatingGuild}"
                >
                    {{ isCreatingGuild ? '創建中...' : '創立公會' }}
                </button>
            </div>
        </div>
    </div>
    <div v-if="showCreateGuildModal">
        <div>
            <input type="text" v-model="guildData.name" placeholder="輸入公會名稱">
        </div>
        <div>
            <button @click="createGuild(guildData.name)">創立公會</button>
            <button @click="closeCreateGuildModal">關閉</button>
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref, onMounted, watch, computed } from 'vue'
import { useWebSocketStore } from "@/store/websocketStore";
import { useRouter } from 'vue-router'
import { playerApi } from '@/composables/useApi';

const wsStore = useWebSocketStore();
const token = ref(localStorage.getItem("token") || "");
const member = ref(localStorage.getItem("member") || "");
const name = ref(localStorage.getItem("name") || "");
console.log('name:', name.value);
// const member = ref('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InBsYXllcjYiLCJpYXQiOjE3NTM4NTI0MzMsImV4cCI6MTc1MzkzODgzM30.qPiXUkvDYU30xrQZofj7i-d9SvioY32NJkAyr6k5mLQ')
const router = useRouter();

const myGuildId = ref(0); // 用於存儲自己的公會ID
const myGuildName = ref(""); // 用於存儲自己的公會名稱

// 公會列表相關
const guildList = ref<guildListType[]>([]);
const currentPage = ref(1);
const itemsPerPage = 5; // 每頁顯示3條數據

// 全屏模態框相關
const guildData = ref<guildData>({
    id: 0,
    name: "",
    guild_note: "",
    guild_members: [{}],
    president: [{}]
});

// 創建公會模態框相關
const showCreateGuildModal = ref(false);
const newGuildName = ref("");
const createGuildError = ref("");
const isCreatingGuild = ref(false);

// 驗證公會名稱是否有效
const isValidGuildName = computed(() => {
    return newGuildName.value.length >= 2 && newGuildName.value.length <= 20;
});

interface guildListType {
    id: number;
    name: string;
    guild_members_count: number;
    president: any[];
}

interface guildData {
    id: number;
    name: string;
    guild_note: string;
    guild_members: any[];
    president: any[];
}

const showGuildModal = ref(false); // 控制全屏模態框顯示

// 打開全屏模態框
const openFullscreenModal = (guildId:number) => {
  showGuildModal.value = true;
  getGuildInfoById(guildId);
};

// 關閉全屏模態框
const closeFullscreenModal = () => {
  showGuildModal.value = false;
};

//打開我的公會模態框
const openMyGuildModal = () => {
    if (myGuildId.value !== 0) {
        router.push({name: 'guild_details', query: { guild_id: myGuildId.value }})
    } else {
        console.warn('沒有公會');
    }
}

//打開創立公會模態框
const openCreateGuildModal = () => {
    // 檢查用戶是否已經有公會
    if (myGuildId.value > 0) {
        alert("您已經是公會成員，無法創建新公會");
        return;
    }
    showCreateGuildModal.value = true;
    newGuildName.value = "";
    createGuildError.value = "";
}

// 關閉創立公會模態框
const closeCreateGuildModal = () => {
    showCreateGuildModal.value = false;
}

// 提交創建公會
const submitCreateGuild = async () => {
  if (!isValidGuildName.value) {
    createGuildError.value = "公會名稱長度必須在2-20個字符之間";
    return;
  }
  
  try {
    isCreatingGuild.value = true;
    await createGuild(newGuildName.value);
    closeCreateGuildModal();
    // 重新獲取公會列表和個人公會信息
    await getGuildInfo();
    await getGuildList();
  } catch (error) {
    console.error("創建公會失敗:", error);
    createGuildError.value = "創建公會失敗，請稍後再試";
  } finally {
    isCreatingGuild.value = false;
  }
};

// 計算總頁數
const totalPages = computed(() => {
    return Math.ceil(guildList.value.length / itemsPerPage);
});

console.log('總頁數:', totalPages.value);

// 計算當前頁顯示的數據
const paginatedGuildList = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return guildList.value.slice(start, end);
});

// 上一頁
const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};

// 下一頁
const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
};

// 使用 computed 來確保 `isConnected`,`messages` 是響應式的
const isConnected = computed(() => wsStore.isConnected);
const messages = computed(() => wsStore.messages);

// 監聽 WebSocket 是否連線
watch(isConnected, (newVal) => {
  if (newVal) {
    console.log('WebSocket 個人頁面已連線，開始訂閱');
    if (token.value) {
      wsStore.resubscribeToUser(token.value);
    } else {
      console.warn('沒有可用的 token，無法訂閱');
    }
  }
}, { immediate: true });

// 監聽 WebSocket 訊息
watch(messages, (msg) => {
  if (!msg) return;  // 避免 msg 為 null
  try {
    const data = msg;
    
    if (data.event === "user_balance_update") {

    }
  } catch (e) {
    console.error("解析 WebSocket 訊息時發生錯誤:", e);
  }
});

// 離開按鈕點擊事件
const handleLeave = () => {
    router.push("/hall");
}

//取得自己的公會訊息
const getGuildInfo = async () => {
    const url = playerApi('/api/v1/game/guild/whether_member_have_guild');
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${member.value}`,
            }
        });
        if (response.status === 401) {
            // 如果是 401 錯誤，跳轉到登入頁面
            console.error('認證失敗，跳轉到登入頁面');
            router.push('/login_line');
            return null;
        } else if (!response.ok) {
            // 處理其他 HTTP 錯誤
            throw new Error(`HTTP 錯誤: ${response.status}`);
        }
        const data = await response.json();
        myGuildId.value = data.data.guild_id || 0; // 獲取公會ID
        myGuildName.value = data.data.guild_name || ""; // 獲取公會名稱
        console.log(`我的公會ID: ${myGuildId.value}`);
        console.log(`我的公會名稱: ${myGuildName.value}`);
        
        getGuildInfoById(myGuildId.value); // 根據公會ID獲取公會訊息
    } catch (error) {
        console.error('獲取公會訊息時發生錯誤:', error);
        return null;
    }
}

//根據ID取得工會訊息
const getGuildInfoById = async (guildId:number) => {
    const url = playerApi(`/api/v1/game/guild/get_guild_info_by_guild_id`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "guild_id": guildId // 傳遞公會ID
            })
        });
        if (response.status === 401) {
            // 如果是 401 錯誤，跳轉到登入頁面
            console.error('認證失敗，跳轉到登入頁面');
            router.push('/login_line');
            return null;
        } else if (!response.ok) {
            // 處理其他 HTTP 錯誤
            throw new Error(`HTTP 錯誤: ${response.status}`);
        }
        const data = await response.json();
        
        const raw = {
            id: data.data.id,
            name: data.data.name,
            guild_note: data.data.guild_note,
            guild_members: data.data.guild_members,
            president: data.data.president
        };

        guildData.value = raw; // 更新全屏模態框的公會數據

        console.log('獲取公會訊息成功:', data);
    } catch (error) {
        console.error('獲取公會訊息時發生錯誤:', error);
        return null;
    }
}

// 加入公會
const joinGuild = async (guildId:number) => {
    console.log(`加入公會 ID: ${guildId}`);
    // 這裡添加加入公會的API調用
    const key = await getGuildInviteCode(guildId);

    if(key){
        const url = playerApi('/api/v1/game/guild/apply_join_guild');
        fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${member.value}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "invite_code": key
            })
        })
        .then(response => {
            if (!response.ok) {
                // 處理其他 HTTP 錯誤
                throw new Error(`HTTP 錯誤: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // 假設API返回的數據中有公會邀請碼
            if (data) {
                console.log('加入公會成功:', data);
                // 這裡可以添加成功加入公會後的處理邏輯
                getGuildInfo(); // 更新自己的公會資訊
                //關掉模擬框
                closeFullscreenModal();
            } else {
                // 如果API返回的數據結構不同，請根據實際情況調整
                console.error('API返回的數據中沒有公會邀請碼');
            }
        })
    }
}

//退出工會
const quitGuild = async () => {
    const url = playerApi('/api/v1/game/guild/leave_guild');
    fetch(url, {
        method: 'POST',
        // headers: {
        //     'Authorization': `Bearer ${member.value}`,
        //     'Content-Type': 'application/json',
        // },
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "username": name.value // 傳遞自己的用戶名
        }),
    })
    .then(response => {
        if (!response.ok) {
            // 處理其他 HTTP 錯誤
            throw new Error(`HTTP 錯誤: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // 假設API返回的數據中有公會邀請碼
        if (data) {
            console.log('退出公會成功:', data);
            // 這裡可以添加成功退出公會後的處理邏輯
            myGuildId.value = 0; // 清除自己的公會ID
            myGuildName.value = ""; // 清除自己的公會名稱
            //關掉模擬框
            closeFullscreenModal();
        } else {
            // 如果API返回的數據結構不同，請根據實際情況調整
            console.error('API返回的數據中沒有公會邀請碼');
        }
    })
}

//獲取公會邀請碼
async function getGuildInviteCode(id:number){
    const url = playerApi(`/api/v1/game/guild/get_invite_code?guild_id=${id}`);
    try {
        const response = await fetch(url, {
            method: 'GET',
            // headers: {
            //     'Authorization': `Bearer ${token.value}`,
            // }
        });
        if (response.status === 401) {
            // 如果是 401 錯誤，跳轉到登入頁面
            console.error('認證失敗，跳轉到登入頁面');
            router.push('/login_line');
            return null;
        } else if (!response.ok) {
            // 處理其他 HTTP 錯誤
            throw new Error(`HTTP 錯誤: ${response.status}`);
        }
        const data = await response.json();
        // 假設API返回的數據中有公會邀請碼
        if (data && data.data && data.data.invite_code) {
            console.log('獲取公會邀請碼成功:', data);
            return data.data.invite_code;
        } else {
            // 如果API返回的數據結構不同，請根據實際情況調整
            console.error('API返回的數據中沒有公會邀請碼');
            return null;
        }
    } catch (error) {
        console.error('獲取公會邀請碼失敗:', error);
        return null;
    }
}

//獲取公會列表
function getGuildList(){
    const url = playerApi('/api/v1/game/guild/get_guild_list');
    fetch(url, {
        method: 'GET',
        // headers: {
        //     'Authorization': `Bearer ${token.value}`,
        // }
    })
    .then(response => {
        if (response.status === 401) {
            // 如果是 401 錯誤，跳轉到登入頁面
            console.error('認證失敗，跳轉到登入頁面');
            router.push('/login_line');
        } else if (!response.ok) {
            // 處理其他 HTTP 錯誤
            throw new Error(`HTTP 錯誤: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // 假設API返回的數據中有公會列表
        if (data) {
            guildList.value = data.data;
            console.log('獲取公會列表成功:', data);
        } else {
            // 如果API返回的數據結構不同，請根據實際情況調整
            console.error('API返回的數據中沒有公會列表');
        }
    })
    .catch(error => {
        console.error('獲取公會列表失敗:', error);
    });
}

//創立公會
const createGuild = async (guild_name:string) => {
    const url = playerApi('/api/v1/game/guild/create_guild');
    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${member.value}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "guild_name": guild_name,
            "guild_rebate":"2.1",
        })
    })
    .then(response => {
        if (!response.ok) {
            // 處理其他 HTTP 錯誤
            throw new Error(`HTTP 錯誤: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // 假設API返回的數據中有公會創建成功的訊息
        if (data) {
            console.log('創立公會成功:', data);
            // 這裡可以添加創立公會成功後的處理邏輯
        } else {
            // 如果API返回的數據結構不同，請根據實際情況調整
            console.error('API返回的數據中沒有創立公會成功的訊息');
        }
    })
}

// 第一次連接
onMounted(async () => {
    getGuildInfo();
    getGuildList();
    console.log('我的member資料:', member.value);
})

</script>

<style lang="scss">

.mGuildBg{
    position: relative;
    background-image: url('@/assets/picture/公會BG.png');
    height: 100vh;
    width: 100%;
    background-color: black;
    color: #ffffff;
    background-size: cover; /* 背景自動縮放填滿 */
    background-position: center; /* 背景居中 */
    background-repeat: no-repeat; /* 背景不重複 */
}

.mGuild-list-bg {
    position: absolute;
    width: 100%;
    // height: 100%;
    top: 0;
    left: 0;
    z-index: 1;
}

.mGuildBackBtnBox{
    position: absolute;
    top: 3%;
    left: 5%;
    cursor: pointer;
    width: 3rem;
    height: 3rem;
    z-index: 3;

    img{
        width: 100%;
        height: 100%;
    }
}

.mGuildList{
    position: absolute;
    top:54%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction:column;
    align-items: center;
    gap: 1rem;
    width: 80%;
    z-index: 3;

    .dataList{
        height: 24rem; /* 固定高度 */
        width: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .guild-table {
        width: 100%;
        border-collapse: collapse;
        color: #4A3226;
        table-layout: fixed;

        thead{
            border: #4A3226 1px solid;
        }

        tbody tr:not(:last-child) {
            border-bottom: 5px solid rgba(139, 136, 136, 0.3);
        }
        
        th, td {
            padding: 0.3rem;
            text-align: center;
            // border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            overflow: hidden;
            font-size: 13px;
        }

        /* 添加表头分隔线 */
        th:not(:last-child) {
            position: relative;
        }

        th:not(:last-child)::after {
            content: '';
            position: absolute;
            top: 10%; /* 顶部留出空间 */
            right: 0;
            height: 80%; /* 高度为外框高度的80% */
            width: 1px;
            background-color: #8b8888; /* 使用与外框相同的颜色 */
        }
        
        .name-column {
            width: 30%;
        }
        
        .president-column {
            width: 30%;
        }
        
        .members-column {
            width: 15%;
        }
        
        .action-column {
            width: 25%;
        }

        /* 文字超出省略處理 */
        .ellipsis-text {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
        }
    }
    
    .join-btn {
        // background-color: rgba(250, 44, 55, 0.8);
        // border: none;
        // color: white;
        // padding: 5px 10px;
        // border-radius: 4px;
        // cursor: pointer;
        position: relative;
        display: inline-block;
        width: 100%;
        height: 2rem;
        cursor: pointer;

        img{
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            height: 100%;
            width: auto;
            z-index: 1;
        }

        .btn-text{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2;
            color: white;
            font-weight: bold;
            text-align: center;
            width: 100%;
        }
    }
    
    .no-data {
        text-align: center;
        padding: 20px;
        color: rgba(255, 255, 255, 0.7);
    }
    
    .pagination {
        margin-top: 15px;
        display: flex;
        justify-content: center;
        align-items: center;
        color:#574821;
        gap: 10px;

        .disabled {
            opacity: 0.5;
            cursor: not-allowed;
            
            svg {
                fill: #a0a0a0; /* 灰色填充表示禁用 */
            }
        }

        svg{
            width: 2.5rem;
            height: 2.5rem;
        }
        
        button {
            background-color: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            
            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            &:hover:not(:disabled) {
                background-color: rgba(0, 0, 0, 0.7);
            }
        }
        
        span {
            color: rgb(53, 27, 27);
        }
    }

    .avatar-container {
        position: relative;
        display: inline-block;
        width: fit-content;
        height: fit-content;

        .avatar-frame {
            width: 6rem;
            position: absolute;
            top: -0.9rem;
            left: -1.2rem;
            z-index: 1; 
        }

        .avatar-image {
            width: 3.5rem;
            position: relative;
            z-index: 2; /* 確保頭像在上層 */
        }
    }

    .balance-container{
        position: relative;
        display: inline-block;

        .balance-image{
            width: 100%;
        }

        .balance-text {
            position: absolute;
            top: 46%; /* 垂直居中 */
            left: 55%; /* 水平居中 */
            transform: translate(-50%, -50%); /* 精確居中 */
            text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.7);
        }
    }

    .dataList-container{
        display: flex;
        justify-content: center;
        gap: 1rem;
        width: 100%;
        text-align: center;

        div{
            background-color: rgba(255, 255, 255, 0.1);
            padding: 0.5rem;
            border-radius: 5px;
            font-size: 1.2rem;
            font-weight: bold;
        }
    }
}

.mGuildButtonSpace{
    position: relative;
    display: inline-block;
    top: 82%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    z-index: 5;

    .guildButton{
        position: absolute;
        width: 100%;
        display: flex;
        justify-content: space-around;
        top: 34%;
        left: 0;
        padding-inline: 2.5rem;

        img{
            position: relative;
            // height: 3rem;
            // width: 10rem;
        }
        
        button{
            position: absolute;
            top: 10%;
            background-color: transparent;
            border: none;
            color: #ffffff;
            font-size: 1.2rem;
            font-weight: bold;
            cursor: pointer;
            transition: color 0.3s ease; /* 添加平滑的顏色變化效果 */
        }

        button:active{
            color: #fa2c37; /* 點擊時的顏色 */
        }
    }
}

// 全屏模態框樣式
.mGuildBg{
    position: relative;
    background-image: url('@/assets/picture/公會BG.png');
    height: 100vh;
    width: 100%;
    background-color: black;
    color: #ffffff;
    background-size: cover; /* 背景自動縮放填滿 */
    background-position: center; /* 背景居中 */
    background-repeat: no-repeat; /* 背景不重複 */

    img{
        height: 100%;
    }
}

.guildBackBtnBox{
    position: absolute;
    top: 4rem;
    left: 0.3rem;
    cursor: pointer;
    width: 5rem;
    height: 5rem;

    img{
        width: 100%;
        height: 100%;
    }
}

.guildList{
    position: absolute;
    top:46%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction:column;
    align-items: center;
    gap: 1rem;
    width: 80%;

    .dataList{
        height: 22rem; /* 固定高度 */
        width: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .guild-table {
        width: 100%;
        border-collapse: collapse;
        color: white;
        
        th, td {
            padding: 8px;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        th {
            background-color: rgba(0, 0, 0, 0.5);
            font-weight: bold;
        }
        
        tr:nth-child(even) {
            background-color: rgba(255, 255, 255, 0.05);
        }
        
        tr:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }
    }
    
    .join-btn {
        background-color: rgba(250, 44, 55, 0.8);
        border: none;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        
        &:hover {
            background-color: rgba(250, 44, 55, 1);
        }
    }
    
    .no-data {
        text-align: center;
        padding: 20px;
        color: rgba(255, 255, 255, 0.7);
    }
    
    .pagination {
        margin-top: 15px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;

        .disabled {
            opacity: 0.5;
            cursor: not-allowed;
            
            svg {
                fill: #a0a0a0; /* 灰色填充表示禁用 */
            }
        }
        
        button {
            background-color: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            
            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            &:hover:not(:disabled) {
                background-color: rgba(0, 0, 0, 0.7);
            }
        }
        
        span {
            color: white;
        }
    }

    .avatar-container {
        position: relative;
        display: inline-block;
        width: fit-content;
        height: fit-content;

        .avatar-frame {
            width: 6rem;
            position: absolute;
            top: -0.9rem;
            left: -1.2rem;
            z-index: 1; 
        }

        .avatar-image {
            width: 3.5rem;
            position: relative;
            z-index: 2; /* 確保頭像在上層 */
        }
    }

    .balance-container{
        position: relative;
        display: inline-block;

        .balance-image{
            width: 100%;
        }

        .balance-text {
            position: absolute;
            top: 46%; /* 垂直居中 */
            left: 55%; /* 水平居中 */
            transform: translate(-50%, -50%); /* 精確居中 */
            text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.7);
        }
    }

    .dataList-container{
        display: flex;
        justify-content: center;
        gap: 1rem;
        width: 100%;
        text-align: center;

        div{
            background-color: rgba(255, 255, 255, 0.1);
            padding: 0.5rem;
            border-radius: 5px;
            font-size: 1.2rem;
            font-weight: bold;
        }
    }
}

.guildButtonSpace{
    position: relative;
    display: inline-block;
    top:75%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;

    .guildButton{
        position: absolute;
        width: 100%;
        display: flex;
        justify-content: space-around;
        top: 34%;
        left: 0;
        padding-inline: 2.5rem;
        
        button{
            background-color: transparent;
            border: none;
            color: #ffffff;
            font-size: 1.2rem;
            font-weight: bold;
            cursor: pointer;
            transition: color 0.3s ease; /* 添加平滑的顏色變化效果 */
        }

        button:active{
            color: #fa2c37; /* 點擊時的顏色 */
        }
    }
}

/* 全屏模態框樣式 - 美化版 */
.guild-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.guild-modal-content {
    width: 80%;
    max-width: 800px;
    max-height: 80vh;
    background-color: #383961;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 0 30px rgba(250, 44, 55, 0.5);
    border: 3px solid #CDA653;
    position: relative;
    display: flex;
    flex-direction: column;
    animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
    from { transform: scale(0.9); }
    to { transform: scale(1); }
}

.guild-modal-header {
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #95796E;
    position: relative;

    div:first-child {
        width: 30px; /* 與關閉按鈕寬度相同 */
        visibility: hidden; /* 隱藏但保留空間 */
    }
    
    h3 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        letter-spacing: 1px;
        position: absolute; /* 絕對定位 */
        left: 50%; /* 水平居中 */
        transform: translateX(-50%); /* 精確居中 */
        width: auto; /* 自動寬度 */
        text-align: center; /* 文字居中 */
    }
    
    .close-button {
        background: transparent;
        border: none;
        color: #95796E;
        font-size: 1.8rem;
        cursor: pointer;
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        transition: all 0.2s ease;
        z-index: 2;
        
        &:hover {
            background-color: rgba(255, 255, 255, 0.2);
            transform: rotate(90deg);
        }
    }
}

.guild-modal-body {
    padding: 20px;
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .create-guild-form{
        display: flex;
        flex-direction: column;
        align-items: center; /* 水平置中 */
        width: 100%;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        align-items: center; /* 水平置中 */
        width: 100%;
        margin: 0 auto; /* 讓元素在父容器中水平置中 */
        max-width: 300px; /* 設置最大寬度，可以根據需要調整 */
    }

    .form-group input {
        width: 100%; /* 讓輸入框佔滿 form-group 的寬度 */
        text-align: center; /* 輸入的文字也置中 */
        padding: 8px;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background-color: rgb(255, 255, 255);
        color: white;
    }

    .error-message {
        text-align: center; /* 錯誤訊息也置中 */
        color: #fa2c37;
        margin-top: 10px;
    }
    
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: rgba(250, 44, 55, 0.6);
        border-radius: 4px;
        
        &:hover {
            background: rgba(250, 44, 55, 0.8);
        }
    }
    
    .guild-messages {
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        padding: 15px;
        border-left: 4px solid #fa2c37;
        font-size: 1.1rem;
        color: #e0e0e0;
        line-height: 1.5;
        box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
    }
    
    .guild-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 15px;
        
        .message-item {
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 12px;
            transition: all 0.2s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
            
            &:hover {
                background-color: rgba(255, 255, 255, 0.1);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }
            
            div {
                color: #ffffff;
                font-size: 1rem;
                display: flex;
                align-items: center;
                
                &:before {
                    content: '';
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    background-color: #fa2c37;
                    border-radius: 50%;
                    margin-right: 8px;
                }
            }
        }
    }
}

.guild-modal-footer {
    padding: 15px 20px;
    // background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    // border-top: 1px solid rgba(255, 255, 255, 0.1);
    
    button {
        background: #59505F;
        border: 2px solid rgba(248, 211, 44, 0.623);
        color: #95796E;
        padding: 10px 25px;
        border-radius: 5px;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        text-transform: uppercase;
        letter-spacing: 1px;
        
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 10px rgba(0, 0, 0, 0.4);
            background: linear-gradient(to bottom, #ff3c47, #e82632);
        }
        
        &:active {
            transform: translateY(1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
        }
    }
    
    div:has(button[onclick*="quitGuild"]) button {
        background: linear-gradient(to bottom, #505050, #383838);
        
        &:hover {
            background: linear-gradient(to bottom, #606060, #484848);
        }
    }
}
</style>