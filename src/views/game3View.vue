<template>
    <div class="game3-page">
        <PhaserGame></PhaserGame>
    </div>
</template>

<script setup lang="ts">
import PhaserGame from '@/game3/PhaserGame.vue';
</script>

<style scoped>

.game3-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    position: relative;
}

.game3-actions {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    padding: 15px;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 8px;
    z-index: 100;
}

.game3-actions button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background-color: #4CAF50;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;
}
</style>