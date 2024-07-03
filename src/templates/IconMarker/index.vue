<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from 'vue'
interface IProps {
  bgSrc: string
  content: string
  width: string
  height: string
  readyToRender: Function
}
const props = withDefaults(defineProps<IProps>(), {
  bgSrc: '/marker_mark.png',
  content: '起',
  width: '50px',
  height: '50px',
  readyToRender: () => {}
})

const realContent = ref('')

onMounted(async () => {
  let promise: Promise<string> = new Promise((resolve) => {
    setTimeout(() => {
      resolve(props.content)
    }, 3000)
  })
  let res: string = await promise
  // let res = props.content
  console.log('mounted', res)
  realContent.value = res
  props?.readyToRender()
})
</script>

<template>
  <div class="template-container" :style="{ width: props.width, height: props.height }">
    <img :src="props.bgSrc" class="poster-bg" />
    <div class="poster-index">{{ realContent }}</div>
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
    font-family: DM Sans;
    font-size: 28px;
    font-style: normal;
    font-weight: 700;
    z-index: 10;
    margin-top: -10px;
  }
}
</style>
