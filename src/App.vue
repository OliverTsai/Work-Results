<script setup lang="ts">
import { useWebSocketStore } from "@/store/websocketStore";
import { onMounted, onUnmounted, provide } from 'vue';
import MainFrame from './layouts/MainFrame.vue';
// import Phaser from 'phaser';
// import { ref, toRaw } from 'vue';
// import type { MainMenu } from './game/scenes/MainMenu';
// import PhaserGame from './game/PhaserGame.vue';

const wsStore = useWebSocketStore();

provide("messages", wsStore.messages);
provide("isConnected", wsStore.isConnected);

onMounted(() => {
    // wsStore.connect(); // 啟動 WebSocket 連線
});

onUnmounted(() => {
    // wsStore.disconnect();
});

// The sprite can only be moved in the MainMenu Scene
// const canMoveSprite = ref();

//  References to the PhaserGame component (game and scene are exposed)
// const phaserRef = ref();
// const spritePosition = ref({ x: 0, y: 0 });

// const changeScene = () => {

//     const scene = toRaw(phaserRef.value.scene) as MainMenu;

//     if (scene)
//     {
//         //  Call the changeScene method defined in the `MainMenu`, `Game` and `GameOver` Scenes
//         scene.changeScene();
//     }

// }

// const moveSprite = () => {

//     if (phaserRef.value !== undefined)
//     {

//         const scene = toRaw(phaserRef.value.scene) as MainMenu;

//         if (scene)
//         {
//             // Get the update logo position
//             (scene as MainMenu).moveLogo(({ x, y }) => {

//                 spritePosition.value = { x, y };

//             });
//         }
//     }

// }

// const addSprite = () => {

//     const scene = toRaw(phaserRef.value.scene) as Phaser.Scene;

//     if (scene)
//     {
//         // Add a new sprite to the current scene at a random position
//         const x = Phaser.Math.Between(64, scene.scale.width - 64);
//         const y = Phaser.Math.Between(64, scene.scale.height - 64);
    
//         // `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
//         const star = scene.add.sprite(x, y, 'star');

//         //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
//         //  You could, of course, do this from within the Phaser Scene code, but this is just an example
//         //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
//         scene.add.tween({
//             targets: star,
//             duration: 500 + Math.random() * 1000,
//             alpha: 0,
//             yoyo: true,
//             repeat: -1
//         });
//     }

// }

// Event emitted from the PhaserGame component
// const currentScene = (scene: MainMenu) => {

//     canMoveSprite.value = (scene.scene.key !== "MainMenu");

// }

</script>

<template>
    <MainFrame>
        <router-view />
    </MainFrame>
    <!-- <router-view /> -->
    <!-- <PhaserGame ref="phaserRef" @current-active-scene="currentScene" /> -->
    <!--<div>
        <div>
            <button class="button" @click="changeScene">Change Scene</button>
        </div>
        <div>
            <button :disabled="canMoveSprite" class="button" @click="moveSprite">Toggle Movement</button>
        </div>
        <div class="spritePosition">Sprite Position:
            <pre>{{ spritePosition }}</pre>
        </div>
        <div>
            <button class="button" @click="addSprite">Add New Sprite</button>
        </div>
    </div>-->
</template>

<style>
#app {
    min-height: 100vh;
    background-color: #f5f5f5; /* 更改為較淺的背景色 */
    z-index: -3;
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
}

/* 全局基本樣式 */
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 0;
}

/* 移除所有連結的預設樣式 */
a {
    text-decoration: none;
}
</style>
