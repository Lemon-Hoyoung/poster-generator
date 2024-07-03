<script lang="ts" setup>
import { ref, createApp, nextTick, watch, Ref } from 'vue'
import html2canvas from 'html2canvas'
import { useInstructStore } from '@/stores/instruct'
import { generateInstructFunc, downloadBase64AsImage } from '@/utils'
import { ShowFormatEnum } from '@/utils/enum'
const instructStore = useInstructStore()

const showFormat: Ref<ShowFormatEnum> = ref(ShowFormatEnum.DOM)

watch(
  () => showFormat.value,
  (format: ShowFormatEnum) => {
    instructStore.setShowFormat(format)
  },
  { immediate: true }
)

const generateHandle = async () => {
  showFormat.value = ShowFormatEnum.DOM
  const instructString = instructStore.instructString
  const instruct = generateInstructFunc(instructString)
  const result = instruct(instructStore.inputParams)
  if (!Array.isArray(result)) return
  console.log('result: ', result)
  instructStore.setInstructExcuteResult(result)
  let component = await instructStore.templateComponentPromise
  nextTick(() => {
    const componentsNodes = result.map((param, index) => {
      const id = param?.id || index
      const data = param?.data || {}
      let readyToRender = (value: any) => {}
      const readyPromise = new Promise((resolve) => {
        readyToRender = resolve
      })
      const app = createApp(component, {
        ...data,
        readyToRender
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
      await ready
      const canvas = await html2canvas(node, {
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
      instructStore.setCanvasList(canvasList)
      instructStore.setBase64ImageList(imageList)
    })
  })
}

const paramsConsoleLog = () => {
  console.log('当前的输入参数：', instructStore.inputParams)
}

const downloadBatch = () => {
  instructStore.base64ImageList.forEach((imageBase64) => {
    downloadBase64AsImage(imageBase64.url, imageBase64.filename)
  })
}
</script>

<template>
  <div class="operation-container">
    <el-card class="operation-card">
      <el-button @click.stop="paramsConsoleLog">控制台参数打印</el-button>
      <el-button @click.stop="generateHandle" type="primary">批量生成</el-button>
      <el-button class="batch-download" @click.stop="downloadBatch">批量下载</el-button>
      <el-radio-group v-model="showFormat">
        <el-radio :value="ShowFormatEnum.DOM">DOM</el-radio>
        <el-radio :value="ShowFormatEnum.CANVAS">Canvas</el-radio>
        <el-radio :value="ShowFormatEnum.IMAGE">Image</el-radio>
      </el-radio-group>
    </el-card>
  </div>
</template>

<style lang="scss" scope>
.operation-container {
  height: 100px;
}

.operation-card {
  height: 100px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.batch-download {
  margin-right: 20px;
}
</style>
