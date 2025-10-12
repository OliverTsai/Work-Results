<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import StartGame from './main';
import Phaser from 'phaser';

// 保存當前場景實例
const scene = ref<Phaser.Scene>();
const game = ref<Phaser.Game>();

// 在組件卸載前清理遊戲
const destroyGame = () => {
    if (game.value) {
        try {
        // 停止所有場景
        game.value.scene.scenes.forEach(scene => {
            if (scene.scene && typeof scene.scene.isActive === 'function' && scene.scene.isActive()) {
            scene.scene.stop();
            }
        });

        // 銷毀遊戲實例
        game.value.destroy(true);
        game.value = undefined;
        
        console.log('遊戲已成功銷毀');
        } catch (error) {
        console.error('銷毀遊戲時出錯:', error);
        }
    }
};

onMounted(() => {
    const container = document.getElementById('game3-container');

    if (container) {
        container.innerHTML = '';
    }

    game.value = StartGame('game3-container');
})

onUnmounted(() => {
    // 清理遊戲實例
    destroyGame();
});

// 暴露方法和屬性給父組件
defineExpose({ 
    scene, 
    game,
    destroyGame
});

</script>

<template>
    <div class="phaser-game3-container">
        <div id="game3-container"></div>
    </div>
</template>

<style scoped>
.phaser-game3-container {
    position: relative;
    width: 100%;
    height: 100%;
}

#game3-container {
    width: 100%;
    height: 100%;
}

</style>