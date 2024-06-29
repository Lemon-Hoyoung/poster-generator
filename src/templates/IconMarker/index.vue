<script setup lang="ts">
import { ref } from 'vue';
interface IProps {
  bgSrc: string;
  content: string;
}
const props = withDefaults(defineProps<IProps>(), {
  bgSrc: '/marker_mark.png',
  content: '起',
});
</script>

<template>
  <div class="template-container">
    <img :src="props.bgSrc" class="poster-bg" />
    <div class="poster-index">{{ props.content }}</div>
  </div>
</template>

<style lang="scss" scoped>
  .template-container {
    width: 50px;
    height: 50px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .poster {
    &-bg {
      width: 100%;
      height: 100%;
      position: absolute;
    }

    &-index {
      position: relative;
      color: #fff;
      font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
      font-size: 19px;
      z-index: 10;
      margin-top: -10px;
    }
  }
</style>
