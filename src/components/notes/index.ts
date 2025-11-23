import { defineAsyncComponent } from 'vue';

// 筆記元數據
export interface NoteMetadata {
  id: number;
  title: string;
  tags: string[];
  summary: string;
  route: string;
  updatedAt: string;
  component: any;
}

// 所有筆記的資料
export const notesData: NoteMetadata[] = [
  {
    id: 1,
    title: 'CSS備忘錄',
    tags: ['前端', 'CSS', 'Flexbox', '切版'],
    summary: '紀錄CSS常用技巧與範例',
    route: 'css-memo',
    updatedAt: '2025-11-20',
    component: defineAsyncComponent(() => import('./CssMemoView.vue'))
  },
  {
    id: 2,
    title: '網站服務架構概述',
    tags: ['後端', '架構', '部署'],
    summary: '介紹常見的網站服務架構與部署方式',
    route: 'website-architecture',
    updatedAt: '2025-11-24',
    component: defineAsyncComponent(() => import('./WebsiteArchitectureView.vue'))
  },
  {
    id: 3,
    title: '虛擬機設置指南',
    tags: ['虛擬化', 'VirtualBox', 'Ubuntu'],
    summary: '詳細說明如何設置Ubuntu虛擬機環境',
    route: 'vm-setup',
    updatedAt: '2025-11-24',
    component: defineAsyncComponent(() => import('./VmSetupView.vue'))
  },
  {
    id: 4,
    title: 'Linux系統基礎配置',
    tags: ['Linux', 'Ubuntu', '系統管理'],
    summary: 'Linux系統初始設定與基本配置指南',
    route: 'linux-basic-config',
    updatedAt: '2025-11-24',
    component: defineAsyncComponent(() => import('./LinuxBasicConfigView.vue'))
  },
  {
    id: 5,
    title: '網站服務配置',
    tags: ['Nginx', 'Web服務', '後端'],
    summary: '配置Nginx網頁服務器與反向代理',
    route: 'web-service-config',
    updatedAt: '2025-11-24',
    component: defineAsyncComponent(() => import('./WebServiceConfigView.vue'))
  },
  {
    id: 6,
    title: '資料庫設置指南',
    tags: ['MongoDB', '資料庫', '後端'],
    summary: '安裝與配置MongoDB資料庫',
    route: 'database-setup',
    updatedAt: '2025-11-24',
    component: defineAsyncComponent(() => import('./DatabaseSetupView.vue'))
  },
  {
    id: 7,
    title: '伺服器安全性設置',
    tags: ['安全', 'SSH', '防火牆', 'SSL'],
    summary: '加強伺服器安全性的關鍵設定',
    route: 'server-security',
    updatedAt: '2025-11-24',
    component: defineAsyncComponent(() => import('./ServerSecurityView.vue'))
  },
//   {
//     id: 8,
//     title: '自動化部署流程',
//     tags: ['自動化', '部署', 'Python', 'systemd'],
//     summary: '設置自動化部署與服務管理',
//     route: 'automated-deployment',
//     updatedAt: '2025-11-24',
//     component: defineAsyncComponent(() => import('./AutomatedDeploymentView.vue'))
//   },
//   {
//     id: 9,
//     title: '遠端連接與檔案傳輸',
//     tags: ['FTP', 'SSH', '遠端管理'],
//     summary: '設置遠端連接與檔案傳輸服務',
//     route: 'remote-connection',
//     updatedAt: '2025-11-24',
//     component: defineAsyncComponent(() => import('./RemoteConnectionView.vue'))
//   },
//   {
//     id: 10,
//     title: '伺服器問題排解指南',
//     tags: ['疑難排解', '維護', '監控'],
//     summary: '常見伺服器問題的診斷與解決方案',
//     route: 'troubleshooting',
//     updatedAt: '2025-11-24',
//     component: defineAsyncComponent(() => import('./TroubleshootingView.vue'))
//   }
];

// 獲取所有標籤
export const getAllTags = (): string[] => {
  const tagsSet = new Set<string>();
  notesData.forEach(note => {
    note.tags.forEach(tag => tagsSet.add(tag));
  });
  return Array.from(tagsSet);
};

// 根據路由獲取筆記
export const getNoteByRoute = (route: string): NoteMetadata | undefined => {
  return notesData.find(note => note.route === route);
};