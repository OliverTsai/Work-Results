import { defineStore } from 'pinia';

export const useTableStore = defineStore('table', {
  state: () => ({
    currentTableId: '',
    previousTableId: '',
  }),
  actions: {
    setTableId(id: string) {
      this.previousTableId = this.currentTableId;
      this.currentTableId = id;
    },
    resetTableId() {
      this.currentTableId = '';
      this.previousTableId = '';
    }
  },
  getters: {
    hasTableChanged(): boolean {
      return this.previousTableId !== '' && this.previousTableId !== this.currentTableId;
    }
  },
  persist: {
    key: 'table-store',
    storage: localStorage, // 使用 localStorage 來持久化存儲
  }
});