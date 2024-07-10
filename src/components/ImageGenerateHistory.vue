<script lang="ts" setup>
import { watch, computed, nextTick, createApp } from 'vue'
import html2canvas from 'html2canvas'
import { useInstructStore } from '@/stores/instruct'
import { ShowFormatEnum } from '@/utils/enum'
import { generateInstructFunc } from '@/utils'
const instructStore = useInstructStore()

const instructDataResults = computed(() => {
  const results = instructStore.instructExcuteResult
  return Array.isArray(results) ? results : []
})

const generateHandle = async () => {
  instructStore.setShowFormat(ShowFormatEnum.DOM)
  instructStore.setFormatChangeDisabled(true)
  const instructString = instructStore.instructString
  const instruct = generateInstructFunc(instructString)
  const result = instruct(instructStore.inputParams)
  if (!Array.isArray(result)) return
  console.log('result: ', result)
  instructStore.setInstructExcuteResult(result)
  let { component, config } = await instructStore.templateComponentPromise
  nextTick(() => {
    const componentsNodes = result.map((param, index) => {
      const id = param?.id || index
      const data = param?.data || {}
      let readyToRender = (value: any) => {}
      let stopToRender = (value: any) => {}
      const readyPromise = config?.async
        ? new Promise((resolve, reject) => {
            readyToRender = resolve
            stopToRender = reject
          })
        : Promise.resolve(true)
      const app = createApp(component, {
        ...data,
        readyToRender,
        stopToRender
      })
      const rootContainer = document.getElementById(`${id}`)
      if (rootContainer === null) return { node: null, ready: Promise.resolve() }
      app.mount(rootContainer)
      return { node: rootContainer, ready: readyPromise }
    })
    instructStore.setDomList(componentsNodes.map((comp) => comp.node) as HTMLElement[])

    let canvasList: HTMLCanvasElement[] = []
    const componentsImageBase64 = componentsNodes.map(async ({ node, ready }) => {
      if (node === null) return { url: '', filename: '' }
      try {
        await ready
      } catch (e) {
        return { url: '', filename: '' }
      }
      const canvas = await html2canvas(node.childNodes[0], {
        dpi: window.devicePixelRatio * 2,
        scale: 2,
        useCORS: true,
        backgroundColor: 'transparent',
        allowTaint: true
      })
      canvasList.push(canvas)
      const image = await canvas.toDataURL('image/png')
      return {
        url: image,
        filename: node?.getAttribute('data-filename') || ''
      }
    })

    Promise.all(componentsImageBase64).then((imageList) => {
      const validImageList = imageList.filter((image) => image.url)
      instructStore.setCanvasList(canvasList)
      instructStore.setBase64ImageList(validImageList)
      instructStore.setFormatChangeDisabled(false)
    })
  })
}

watch(
  () => instructStore.showFormat,
  (format: ShowFormatEnum) => {
    nextTick(() => {
      console.log('format: ', format)
      const canvasList = document.getElementById('canvasList')
      const domList = document.getElementById('domList')
      if (format === ShowFormatEnum.DOM) {
        if (Array.isArray(instructStore.domList) && instructStore.domList.length > 0) {
          domList.innerHTML = ''
          instructStore.domList.forEach((node) => {
            domList?.appendChild(node)
          })
        } else {
          generateHandle()
        }
      } else if (format === ShowFormatEnum.CANVAS) {
        canvasList.innerHTML = ''
        instructStore.canvasList.forEach((node) => {
          canvasList?.appendChild(node)
        })
      } else {
        // imageList?.innerHTML = '';
        // instructStore.base64ImageList.forEach
      }
    })
  },
  { immediate: true }
)
</script>

<template>
  <div class="image-generate-history-container">
    <el-card class="image-generate-history-card">
      <div v-if="instructStore.showFormat === ShowFormatEnum.DOM" id="domList">
        <div
          v-for="(result, index) in instructDataResults"
          :id="result.id || `${index}`"
          class="image-generate-history-node"
          :data-filename="result.filename"
        ></div>
      </div>
      <div v-else-if="instructStore.showFormat === ShowFormatEnum.CANVAS" id="canvasList"></div>
      <div v-else id="imageList">
        <img v-for="(image, index) in instructStore.base64ImageList" :src="image.url" />
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scope>
.image-generate-history {
  &-container {
    height: 600px;
  }

  &-card {
    height: 600px;
    display: flex;
    justify-content: flex-start;
    align-content: flex-start;
  }

  &-node {
    display: inline-block;
    background: transparent;
  }
}
</style>
