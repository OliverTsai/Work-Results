import { createRouter, createWebHistory  } from 'vue-router'
import { store } from '@/store';

import HomeView from '@/views/HomeView.vue';
import mHomeView from '@/views/m/mHomeView.vue';

import AboutView from '@/views/AboutView.vue';
import mAboutView from '@/views/m/mAboutView.vue';

import Portfolio from '@/views/PortfolioView.vue';
import mPortfolio from '@/views/m/mPortfolioView.vue';

import gameView from '@/views/gameView.vue';
import game2View from '@/views/game2View.vue';
import game3View from '@/views/game3View.vue';

//特效
import Rotation from '@/views/effect/EffectRotationView.vue';
import mRotation from '@/views/effect/m/mEffectRotationView.vue';

import Slot from '@/views/effect/SlotMachineView.vue';
import mSlot from '@/views/effect/m/mSlotMachineView.vue';

import Jackpot from '@/views/effect/JackpotView.vue';

import gameTurboView from '@/views/gameTurboView.vue';
import LoginView from '@/views/LoginView.vue';
import LoginLineView from '@/views/LoginLineView.vue';
import LoginLineCallBack from '@/views/LineCallBackView.vue';
import HallView from '@/views/HallView.vue';
import SelectTableView from '@/views/SelectTableView.vue';
import TournamentView from '@/views/TournamentView.vue';
import UserView from '@/views/UserView.vue';
import PlayLog from '@/views/PlayLogView.vue';
import Guild from '@/views/GuildView.vue';
import GuildDetails from '@/views/GuildDetailsView.vue';
import Friend from '@/views/friendView.vue';
import Bank from '@/views/bankView.vue';
import Choose from '@/views/chooseView.vue';
import Store from '@/views/storeView.vue';
import WebSocketTester from '@/views/WebSocketTester.vue';
import test from '@/views/LoginTestView.vue';

import TechnologyMatrix from '@/views/TechnologyMatrixView.vue';
import mTechnologyMatrix from '@/views/m/mTechnologyMatrixView.vue';
import BackendTechnologyMatrix from '@/views/BackendTechnologyMatrixView.vue';
import mBackendTechnologyMatrix from '@/views/m/mBackendTechnologyMatrixView.vue';

import PageA from '@/views/pageA.vue';
const PageB = () => import('@/views/pageB.vue');

const routes = [
  // 前導頁面 - 處理登入和 token
  {
    path: '/',
    name: 'home',
    component: store.isMobile ? mHomeView : HomeView,
  },
  {
    path: '/about',
    name: 'about',
    component: store.isMobile ? mAboutView : AboutView,
  },
  {
    path: '/portfolio',
    name: 'portfolio',
    component: store.isMobile ? mPortfolio : Portfolio,
  },
  {
    path: '/gameHome',
    name: 'gameHome',
    component: store.isMobile ? HomeView : HomeView,
  },
  // 登入頁面 - 專門處理帶有 token 的登入
  {
    path: '/login',
    name: 'login',
    component: store.isMobile ? LoginView : LoginView,
  },
  {
    path: '/testAA',
    name: 'test',
    component: store.isMobile ? test : test,
  },
  //選擇角色頁面
  {
    path: '/choose',
    name: 'choose',
    component: store.isMobile ? Choose : Choose,
  },
  //特效頁面
  {
    path: '/rotation',
    name: 'rotation',
    component: store.isMobile ? mRotation : Rotation,
    meta: {
      showFooter: false,
      showHeader: false,  // 頭部和底部都不顯示
      showDeskHeader: false,
      showDeskFooter: false
    }
  },
  {
    path: '/slot',
    name: 'slot',
    component: store.isMobile ? mSlot : Slot,
    meta: {
      showFooter: false,
      showHeader: false,  // 頭部和底部都不顯示
      showDeskHeader: true,
      showDeskFooter: true
    }
  },
  {
    path: '/jackpot',
    name: 'jackpot',
    component: store.isMobile ? Jackpot : Jackpot,
    meta: {
      showFooter: false,
      showHeader: true,  // 頭部和底部都不顯示
      showDeskHeader: true,
      showDeskFooter: true
    }
  },
  {
    path: '/pageA',
    name: 'pageA',
    component: store.isMobile ? PageA : PageA,
    meta: {
      layout: 'main',
      showFooter: false
    }
  },
  {
    path: '/pageB',
    name: 'pageB',
    component: store.isMobile ? PageB : PageB,
  },
  {
    path: '/login_line',
    name: 'login_line',
    component: store.isMobile ? LoginLineView : LoginLineView,
  },
  {
    path: '/callback',
    name: 'login_line_callback',
    component: store.isMobile ? LoginLineCallBack : LoginLineCallBack,
  },
  {
    path: '/hall',
    name: 'hall',
    component: store.isMobile ? HallView : HallView,
  },
  {
    path: '/user',
    name: 'user',
    component: store.isMobile ? UserView : UserView,
  },
  {
    path: '/guild',
    name: 'guild',
    component: store.isMobile ? Guild : Guild,
  },
  {
    path: '/guild_details',
    name: 'guild_details',
    component: store.isMobile ? GuildDetails : GuildDetails,
  },
  {
    path: '/friend',
    name: 'friend',
    component: store.isMobile ? Friend : Friend,
  },
  {
    path: '/bank',
    name: 'bank',
    component: store.isMobile ? Bank : Bank,
  },
  {
    path: '/store',
    name: 'store',
    component: store.isMobile ? Store : Store,
  },
  {
    path: '/Technology_Matrix',
    name: 'Technology_Matrix',
    component: store.isMobile ? mTechnologyMatrix : TechnologyMatrix,
  },
  {
    path: '/Backend_TechnologyMatrix',
    name: 'Backend_TechnologyMatrix',
    component: store.isMobile ? mBackendTechnologyMatrix : BackendTechnologyMatrix,
  },
  {
    path: '/play_log',
    name: 'play_log',
    component: store.isMobile ? PlayLog : PlayLog,
  },
  {
    path: '/select',
    name: 'select',
    component: store.isMobile ? SelectTableView : SelectTableView,
  },
  {
    path: '/tournament',
    name: 'tournament',
    component: store.isMobile ? TournamentView : TournamentView,
  },
  // 遊戲頁面
  {
    path: '/game',
    name: 'game',
    component: store.isMobile ? gameView : gameView,
    meta: { requiresAuth: true } // 標記此路由需要驗證
  },
  // 遊戲2頁面
  {
    path: '/game2',
    name: 'game2',
    component: store.isMobile ? game2View : game2View,
    meta: {
      showFooter: false,
      showHeader: false  // 頭部和底部都不顯示
    }
  },
  // 遊戲3頁面
  {
    path: '/game3',
    name: 'game3',
    component: store.isMobile ? game3View : game3View,
  },
  {
    path: '/gameTurbo',
    name: 'gameTurbo',
    component: store.isMobile ? gameTurboView : gameTurboView,
    meta: { requiresAuth: true } // 標記此路由需要驗證
  },
  {
    path: '/websocket-tester',
    name: 'WebSocketTester',
    component: store.isMobile ? WebSocketTester : WebSocketTester,
  }
]

const router = createRouter({
  history: createWebHistory('/Work-Results/'),
  routes:routes,
})


export default router;
