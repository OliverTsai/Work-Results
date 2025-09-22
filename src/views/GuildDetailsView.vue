<template>
    <div class="mGuildBg">
        <!-- <div class="ErudaDebugger">
            <ErudaDebugger buttonText="Debug" />
        </div> -->
        <img class="mGuild-list-bg" src="@/assets/picture/guild-details.png">
        <div class="mGuildBackBtnBox">
          <img @click="handleLeave()" src="@/assets/picture/btn-back.png">
        </div>
        <div class="mGuildDetailsList p-3">
            <div class="DetailsTitle">{{ guildDetails.name }}</div>
            <div class="straight-line"></div>
            <div class="board">
                <img class="boardImg" src="@/assets/picture/guild-board.png">
                <div class="boardText">
                    {{ guildDetails.guild_note }}
                </div>
                <div @click="openEditNoteModal()" v-if="firstPower(Number(guild_id))" class="boardButtonContainer">
                    <img class="boardButton" src="@/assets/picture/button_on.png"></img>
                    <div class="editText">編輯</div>
                </div>
            </div>
            <!-- <div v-if="secondPower(Number(guild_id))" class="mt-2">
                <button @click="openCreateMemberModal">申請名單</button>
            </div> -->
            <div class="playerDataList p-3">
                <div>
                    <div v-for="guild in paginatedGuildList" :key="guildDetails.id" class="">
                        <div class="playerRaw">
                            <div>{{ getPosition(guild.position) }}</div>
                            <div>{{ guild.nickname }}</div>
                            <div v-if="secondPower(Number(guild_id))">
                                <button @click="openMemberModal(guild)">詳細資料</button>
                            </div>
                            <div v-else></div>
                        </div>
                    </div>
                </div>
                
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
            <div class="guildButton" v-if="myGuildId === Number(guild_id)">
                <img src="@/assets/picture/button_on.png" alt="按鈕圖示">
                <button @click="quitGuild()">退出公會</button>
            </div>
            <div class="guildButton" v-else-if="myGuildId === 0">
                <img src="@/assets/picture/button_on.png" alt="按鈕圖示">
                <button @click="joinGuild(guildDetails.id)">加入公會</button>
            </div>
            <div class="guildButton" v-else>
                
            </div>
        </div>
    </div>
    <!-- 佈告欄模態框 -->
    <div v-if="showGuildModal" class="guild-modal">
        <div class="guild-modal-content">
            <div class="guild-modal-header">
                <h3>修改公會佈告欄</h3>
                <button class="close-button" @click="closeEditNoteModal">&times;</button>
            </div>
            <div class="guild-modal-body">
                <div class="edit-note-container">
                    <label for="guild-note">佈告欄內容：</label>
                    <textarea 
                        id="guild-note" 
                        v-model="editedGuildNote" 
                        class="guild-note-textarea"
                        placeholder="請輸入公會佈告欄內容..."
                        rows="6"
                    ></textarea>
                    <div class="character-count">
                        {{ editedGuildNote.length }}/200 字
                    </div>
                </div>
            </div>
            <div class="guild-modal-footer">
                <button class="cancel-btn" @click="closeEditNoteModal">取消</button>
                <button class="save-btn" @click="saveEditedGuildNote">儲存</button>
            </div>
        </div>
    </div>

    <!-- 成員資料模態框 -->
    <div v-if="showMemberModal" class="guild-modal">
        <div class="guild-modal-content">
            <div class="guild-modal-header">
                <h3>成員資料</h3>
                <button class="close-button" @click="closeMemberModal">&times;</button>
            </div>
            <div class="guild-modal-body text-white">
                <div class="member-info">
                    名稱：{{ memberDetails.nickname }}
                </div>
                <div class="member-info position-row">
                    職位：{{ getPosition(memberDetails.position) }}
                    <div class="position-buttons" v-if="firstPower(Number(guild_id)) && memberDetails.position !== 1">
                        <button class="position-btn promote-btn" @click="promotePosition" :disabled="memberDetails.position <= 2">提升</button>
                        <button class="position-btn demote-btn" @click="demotePosition" :disabled="memberDetails.position >= 5">降低</button>
                    </div>
                </div>
                <div class="member-info">
                    返水值：{{ memberDetails.grand_rakeback }}
                </div>
                <div class="member-info">
                    加入時間：{{ memberDetails.created_at }}
                </div>
            </div>
            <div v-if="isAdmin(memberDetails.guild_id, memberDetails.position)" class="guild-modal-footer">
                <button class="cancel-btn" @click="kickMember">踢出</button>
            </div>
        </div>
    </div>

    <!-- 同意申請入會模態框 -->
    <div v-if="showCreateMemberModal" class="guild-modal">
        <div class="guild-modal-content">
            <div class="guild-modal-header">
                <h3>成員資料</h3>
                <button class="close-button" @click="closeCreateMemberModal">&times;</button>
            </div>
            <div class="guild-modal-body text-white">
                
            </div>
            <div class="guild-modal-footer">
                <button class="cancel-btn" @click="closeCreateMemberModal">關閉</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref, onMounted, watch, computed } from 'vue'
import { useWebSocketStore } from "@/store/websocketStore";
import { useRouter,useRoute } from 'vue-router'
import { playerApi } from '@/composables/useApi';
import ErudaDebugger from '@/components/ErudaDebugger.vue';

const wsStore = useWebSocketStore();
const token = ref(localStorage.getItem("token") || "");
const member = ref<string>(localStorage.getItem("member") || "");
const name = ref(localStorage.getItem("name") || "");
console.log('name:', name.value);
// const member = ref('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InBsYXllcjUiLCJpYXQiOjE3NTQ0NjMxNzYsImV4cCI6MTc1NDU0OTU3Nn0.quQHAvQFDmNvpDZ3hRPVHvozYDGgODjZ3non8cXvKBY')
const router = useRouter();
const route = useRoute();

const guild_id = ref(route.query.guild_id);

console.log('公會ID',guild_id)

const myGuildId = ref(0); // 用於存儲自己的公會ID
const myGuildName = ref(""); // 用於存儲自己的公會名稱
const myGuildPosition = ref(0); // 用於存儲自己的公會職位

// 公會列表相關
const guildList = ref<guildListType[]>([]);
const currentPage = ref(1);
const itemsPerPage = 4; // 每頁顯示4條數據

//會長權限
const firstPower = (guildId:number) =>{

    if(guildId === myGuildId.value && myGuildPosition.value === 1){
        return true;
    }else{
        return false;
    }
}

//副會長權限
const secondPower = (guildId:number) =>{

    if(guildId === myGuildId.value && myGuildPosition.value <= 2){
        return true;
    }else{
        return false;
    }
}

//確定踢人權限
const isAdmin = (guildId:number, position:number) => {

    console.log('我的公會ID:', myGuildId.value, '當前公會ID:', guildId, '我的職位:', myGuildPosition.value, '當前職位:', position);

    if(guildId === myGuildId.value && myGuildPosition.value < position){
        return true;
    }else{
        return false;
    }
}

// 全屏模態框相關
const guildData = ref<guildData>({
    id: 0,
    name: "",
    guild_note: "",
    guild_members: [{}],
    president: [{}]
});

//公會詳細資料
const guildDetails = ref<guildData>({
    id: 0,
    name: "",
    guild_note: "",
    guild_members: [{}],
    president: [{}]
});

//個人詳細資料
const memberDetails = ref<memberData>({
    id: 0,
    guild_id: 0,
    nickname: "",
    position: 0,
    created_at: "",
    grand_rakeback: ""
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
    guild_members: any[];
    president: any[];
}

interface guildData {
    id: number;
    name: string;
    guild_note: string;
    guild_members: any[];
    president: any[];
}

interface memberData {
    id: number;
    guild_id: number;
    nickname: string;
    position: number;
    created_at: string;
    grand_rakeback: string;
}

const showGuildModal = ref(false); // 控制編輯佈告欄模態框顯示
const showMemberModal = ref(false); // 控制成員資料模態框顯示
const showCreateMemberModal = ref(false); // 控制同意申請成員模態框顯示

const editedGuildNote = ref("");

// 關閉編輯佈告欄模態框
const closeEditNoteModal = () => {
  showGuildModal.value = false;
};

// 打開編輯佈告欄模態框
const openEditNoteModal = () => {
  // 初始化編輯內容為當前佈告欄內容
  editedGuildNote.value = guildDetails.value.guild_note;
  showGuildModal.value = true;
};

// 關閉編輯成員資料模態框
const closeMemberModal = () => {
  showMemberModal.value = false;
};

// 打開編輯成員資料模態框
const openMemberModal = (member: memberData) => {
  memberDetails.value = member;
  showMemberModal.value = true;
};

//關閉同意申請成員模態框
const closeCreateMemberModal = () => {
  showCreateMemberModal.value = false;
};

//打開同意申請成員模態框
const openCreateMemberModal = () => {
  showCreateMemberModal.value = true;
};

const saveEditedGuildNote = () => {
  // 保存編輯後的公會公告
  saveGuildNote();
  guildDetails.value.guild_note = editedGuildNote.value;
  closeEditNoteModal();
};

const promotePosition = async () => {
    // 提升成員職位
    await updatePosition("promote");
};

const demotePosition = async () => {
    // 降級成員職位
    await updatePosition("demote");
};

//打開我的公會模態框
const openMyGuildModal = () => {
    if (myGuildId.value !== 0) {
        getGuildInfoById(myGuildId.value);
        showGuildModal.value = true;
    } else {
        console.warn('沒有公會，無法打開模態框');
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

const getPosition = (position:number) => {
    switch (position) {
        case 0:
            return '申請中';
        case 1:
            return '會長';
        case 2:
            return '副會長';
        case 3:
            return '長老';
        case 4:
            return '成員';
        case 5:
            return '萌新';
        default:
            return '成員';
    }
}

// 提交創建公會
// const submitCreateGuild = async () => {
//   if (!isValidGuildName.value) {
//     createGuildError.value = "公會名稱長度必須在2-20個字符之間";
//     return;
//   }
  
//   try {
//     isCreatingGuild.value = true;
//     await createGuild(newGuildName.value);
//     closeCreateGuildModal();
//     // 重新獲取公會列表和個人公會信息
//     await getGuildInfo();
//     await getGuildList();
//   } catch (error) {
//     console.error("創建公會失敗:", error);
//     createGuildError.value = "創建公會失敗，請稍後再試";
//   } finally {
//     isCreatingGuild.value = false;
//   }
// };

// 計算總頁數
const totalPages = computed(() => {
    return Math.ceil(guildDetails.value.guild_members.length / itemsPerPage);
});

// 計算當前頁顯示的數據
const paginatedGuildList = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return guildDetails.value.guild_members.slice(start, end);
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
    router.push("/guild");
}

//階級變更
const updatePosition = async (update:string) => {

    let newPosition
    const strId = String(memberDetails.value.id);

    if(update === "promote") {
        // 提升
        newPosition = String(memberDetails.value.position - 1);
    } else if(update === "demote") {
        // 降級
        newPosition = String(memberDetails.value.position + 1);
    }

    const url = playerApi('/api/v1/game/guild/update_guild_position');
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${member.value}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "guild_member_id": strId,
                "position": newPosition,
                "next_president_guild_member_id":"0"
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP 錯誤: ${response.status}`);
        }
        const data = await response.json();
        console.log('提升成功:', data);
        // 重新獲取公會成員信息
        await getGuildInfoById(memberDetails.value.guild_id);
        memberDetails.value.position = Number(data.data.position); // 更新成員職位
    } catch (error) {
        console.error('提升失敗:', error);
    }
};

//踢出公會
const kickMember = async () => {
    const url = playerApi('/api/v1/game/guild/guild_kick_out');
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${member.value}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "guild_member_id": memberDetails.value.id, // 成員ID
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP 錯誤: ${response.status}`);
        }
        const data = await response.json();
        console.log('踢出成功:', data);
        // 重新獲取公會成員信息
        await getGuildInfoById(memberDetails.value.guild_id);
        closeMemberModal();
    } catch (error) {
        console.error('踢出失敗:', error);
    }
};

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
        myGuildPosition.value = data.data.guild_position || 0; // 獲取公會職位
        console.log(`我的公會ID: ${myGuildId.value}`);
        console.log(`我的公會名稱: ${myGuildName.value}`);
        console.log('我的公會等級:', myGuildPosition.value);
        
        // getGuildInfoById(myGuildId.value); // 根據公會ID獲取公會訊息
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

        guildDetails.value = raw; // 更新全屏模態框的公會數據

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
            // 假設API有返回的數據中
            if (data) {
                console.log('加入公會成功:', data);
                // 這裡可以添加成功加入公會後的處理邏輯
                router.push('guild');
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
        headers: {
            'Authorization': `Bearer ${member.value}`,
            'Content-Type': 'application/json',
        },
        // headers: {
        //     'Content-Type': 'application/json',
        // },
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
            //重新整理
            router.push('guild')
            
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
            headers: {
                'Authorization': `Bearer ${member.value}`,
                'Content-Type': 'application/json',
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

//測試的token
async function getToken(){
    const url = playerApi(`/api/v1/game/guild/get_player_member_token`);
    try {
        const response = await fetch(url, {
            method: 'GET',
            body: JSON.stringify({
                "username": name.value // 傳遞自己的用戶名
            }),
        });

        const data = await response.json();

        member.value = data.member_token

    }catch (error) {
        console.error('獲取token失敗:', error);
        return null;
    }
}

// 儲存佈告欄內容
const saveGuildNote = async () => {
  try {
    // 檢查字數限制
    if (editedGuildNote.value.length > 200) {
      alert("佈告欄內容不能超過200字");
      return;
    }

    const id = String(guild_id.value);

    const url = playerApi('/api/v1/game/guild/update_guild_note');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${member.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "username": name.value,
        "guild_id": id,
        "guild_note": editedGuildNote.value
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP 錯誤: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('更新佈告欄成功:', data);
    
    // 可以添加成功提示
    alert("佈告欄內容已更新");
  } catch (error) {
    console.error('更新佈告欄失敗:', error);
    alert("更新佈告欄失敗，請稍後再試");
  }
};

// 第一次連接
onMounted(async () => {
    // if(!member.value){
    //     await getToken();
    //     console.log('我的token:', member.value)
    // }
    getGuildInfo();
    getGuildInfoById(Number(guild_id.value))
    console.log('公會詳細資料:', guildDetails.value);
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

.ErudaDebugger{
    position: absolute;
    top: 3%;
    left: 75%;
    cursor: pointer;
    width: 3rem;
    height: 3rem;
    z-index: 3;
}

.mGuildDetailsList{
    position: absolute;
    top:52%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction:column;
    align-items: center;
    width: 80%;
    z-index: 3;
    color: #383838;

    .DetailsTitle{
        font-size: 26px;
        font-weight: bold;
    }

    .straight-line {

        width: 90%;
        height: 2px;
        background-color: #000;

    }

    .board {
        color: #000;
        position: relative; /* 添加这一行，使其成为定位上下文 */
        width: 90%; /* 确保容器大小适合内容 */
        // margin: 0 auto; /* 居中显示 */

        .boardImg {
            display: block; /* 确保图片正确显示 */
            width: 100%; /* 确保图片不会超出容器 */
        }

        .boardText {
            position: absolute;
            top: 50%; /* 垂直居中 */
            left: 50%; /* 水平居中 */
            transform: translate(-50%, -50%); /* 精确居中 */
            width: 80%; /* 控制文本宽度，避免溢出 */
            height: 80%; /* 确保文本高度适应容器 */
            overflow-y: auto;
            overflow-wrap: break-word; /* 长文本自动换行 */
        }

        .boardButtonContainer {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 4rem;
            height: 2rem;
            cursor: pointer;
        }

        .boardButton {
            position: absolute;
            width: 100%;
            height: 100%;
        }

        .editText {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ffffff;
            font-size: 0.9rem;
            font-weight: bold;
            text-align: center;
            width: 100%;
            z-index: 2;
        }
    }

    .playerDataList{
        height: 16rem; /* 固定高度 */
        width: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .playerRaw{
            display: flex;
            justify-content: space-between;
        }
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

.position-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.position-buttons {
  display: flex;
  gap: 8px;
}

.position-btn {
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  border: 1px solid;
}

.promote-btn {
  background-color: #4CAF50;
  color: white;
  border-color: #45a049;
}

.promote-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.demote-btn {
  background-color: #f44336;
  color: white;
  border-color: #da190b;
}

.demote-btn:hover:not(:disabled) {
  background-color: #da190b;
}

.position-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes scaleIn {
    from { transform: scale(0.9); }
    to { transform: scale(1); }
}

</style>