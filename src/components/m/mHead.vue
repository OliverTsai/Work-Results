<template>
    <header class="m-header">
        <!-- 漢堡菜單按鈕 -->
        <div class="menu-icon" @click="toggleMenu">
            <svg  v-if="!menuIcon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-justify" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M2 12.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5m0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5m0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5m0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5"/>
            </svg>
            <div class="hamburger" v-else>
                <span :class="{ 'open': isMenuOpen }"></span>
                <span :class="{ 'open': isMenuOpen }"></span>
                <span :class="{ 'open': isMenuOpen }"></span>
            </div>
        </div>
        
        <!-- 網站標題/Logo -->
        <div class="site-title">
            <router-link router-link to="/">My Portfolio</router-link>
        </div>
        
        <!-- 側邊導航菜單 -->
        <div class="side-menu" :class="{ 'open': isMenuOpen }">
            <div class="menu-header">
                <div class="close-btn" @click="toggleMenu">×</div>
            </div>
            <nav class="menu-items">
                <router-link to="/" @click="closeMenu">首頁</router-link>
                <router-link to="/about" @click="closeMenu">關於我</router-link>
                <router-link to="/skills" @click="closeMenu">技能</router-link>
                <router-link to="/experience" @click="closeMenu">經歷</router-link>
                <router-link to="/projects" @click="closeMenu">作品集</router-link>
            </nav>
            <div class="menu-footer">
                <div class="social-links">
                <a href="https://github.com/yourusername" target="_blank">
                    <!-- <img src="@/assets/picture/github-icon.svg" alt="GitHub"> -->
                </a>
                <a href="https://linkedin.com/in/yourprofile" target="_blank">
                    <!-- <img src="@/assets/picture/linkedin-icon.svg" alt="LinkedIn"> -->
                </a>
                <a href="mailto:your.email@example.com">
                    <!-- <img src="@/assets/picture/email-icon.svg" alt="Email"> -->
                </a>
                </div>
            </div>
        </div>
        
        <!-- 遮罩層 -->
        <div class="overlay" :class="{ 'open': isMenuOpen }" @click="closeMenu"></div>
    </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 控制菜單開關的狀態
const isMenuOpen = ref(false);
// 是否使用自定義菜單圖標 (如果為false則使用圖片，為true則使用CSS繪製的漢堡圖標)
const menuIcon = ref(true);

// 切換菜單開關狀態
const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
    // 當菜單打開時，禁止背景滾動
    if (isMenuOpen.value) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
};

// 關閉菜單
const closeMenu = () => {
    isMenuOpen.value = false;
    document.body.style.overflow = '';
};
</script>

<style lang="scss" scoped>
.m-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 100;
}

.menu-icon {
    cursor: pointer;
    z-index: 102;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    img {
        width: 24px;
        height: 24px;
    }
    
    .hamburger {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 24px;
        height: 18px;
        
        span {
        display: block;
        height: 2px;
        width: 100%;
        background-color: #333;
        transition: all 0.3s ease;
        
        &:nth-child(1) {
            transform-origin: top left;
            &.open {
            transform: rotate(45deg) translate(2px, -2px);
            }
        }
        
        &:nth-child(2) {
            &.open {
            opacity: 0;
            }
        }
        
        &:nth-child(3) {
            transform-origin: bottom left;
            &.open {
            transform: rotate(-45deg) translate(2px, 2px);
            }
        }
        }
    }
}

.site-title {
    font-size: 1.2rem;
    font-weight: bold;
    
    a {
        color: #333;
        text-decoration: none;
    }
}

.side-menu {
    position: fixed;
    top: 0;
    left: -280px;
    width: 280px;
    height: 100vh;
    background-color: #fff;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    z-index: 101;
    transition: left 0.3s ease;
    display: flex;
    flex-direction: column;
    
    &.open {
        left: 0;
    }
    
    .menu-header {
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 0 20px;
        border-bottom: 1px solid #eee;
        
        .close-btn {
        font-size: 24px;
        cursor: pointer;
        color: #333;
        }
    }
    
    .menu-items {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 20px 0;
        
        a {
        padding: 15px 25px;
        color: #333;
        text-decoration: none;
        font-size: 1.1rem;
        transition: background-color 0.2s;
        
        &:hover, &.router-link-active {
            background-color: #f5f5f5;
            color: #3498db;
        }
        
        &.router-link-active {
            font-weight: bold;
            border-left: 3px solid #3498db;
        }
        }
    }
    
    .menu-footer {
        padding: 20px;
        border-top: 1px solid #eee;
        
        .social-links {
        display: flex;
        justify-content: center;
        gap: 20px;
        
        a {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #f5f5f5;
            transition: background-color 0.2s;
            
            &:hover {
            background-color: #e0e0e0;
            }
            
            img {
            width: 20px;
            height: 20px;
            }
        }
        }
    }
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 100;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.3s;
    
    &.open {
        visibility: visible;
        opacity: 1;
    }
}

// 響應式調整
@media (min-width: 768px) {
    .m-header {
        // 在桌面版可以選擇隱藏或顯示
        // display: none;
    }
}
</style>