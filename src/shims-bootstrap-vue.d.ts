declare module 'bootstrap-vue-3' {
    import { Plugin } from 'vue';
    const BootstrapVue3: Plugin;
    export default BootstrapVue3;

    // 如果需要導出其他組件或功能，可以在這裡添加
    export const BModal: any;
    export const BButton: any;
    // 等等...
}