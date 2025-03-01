<script lang="ts" setup>
import { ref, createApp, nextTick, watch, Ref } from 'vue'
import html2canvas from 'html2canvas'
import { useInstructStore } from '@/stores/instruct'
import {
  generateInstructFunc,
  downloadBase64AsImage,
  saveBase64AsImage,
  downloadBase64ImageIntoZip
} from '@/utils'
import { ShowFormatEnum } from '@/utils/enum'
const instructStore = useInstructStore()

const showFormat: Ref<ShowFormatEnum> = ref(ShowFormatEnum.DOM)
const showDialog: Ref<boolean> = ref(false)
const folderName: Ref<string> = ref('')
const quality = ref(80)

watch(
  () => showFormat.value,
  (format: ShowFormatEnum) => {
    instructStore.setShowFormat(format)
  },
  { immediate: true }
)

const generateHandle = async () => {
  showFormat.value = ShowFormatEnum.DOM
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

const paramsConsoleLog = () => {
  console.log('当前的输入参数：', instructStore.inputParams)
}

const downloadBatch = () => {
  showDialog.value = true
}

const batchDownloadHandle = () => {
  showDialog.value = false
  if (folderName.value) {
    downloadBase64ImageIntoZip(instructStore.base64ImageList, folderName.value, quality.value)
  } else {
    instructStore.base64ImageList.forEach((imageBase64) => {
      // downloadBase64AsImage(imageBase64.url, imageBase64.filename)
      saveBase64AsImage(imageBase64.url, imageBase64.filename, quality.value)
    })
  }
}
</script>

<template>
  <div class="operation-container">
    <el-card class="operation-card">
      <div class="operation-flex">
        <div class="flex-left">
          <el-button @click.stop="paramsConsoleLog">控制台参数打印</el-button>
          <el-button @click.stop="generateHandle" type="primary">批量生成</el-button>
          <el-button class="batch-download" @click.stop="downloadBatch">批量下载</el-button>
          <div class="quality-slider">
            <span class="quality-title">图片质量：</span>
            <el-slider v-model="quality" :step="10" size="large" />
          </div>
        </div>
        <div class="flex-right">
          <el-radio-group v-model="showFormat">
            <el-radio :value="ShowFormatEnum.DOM">DOM</el-radio>
            <el-radio :value="ShowFormatEnum.CANVAS" :disabled="instructStore.formatChangeDisabled"
              >Canvas</el-radio
            >
            <el-radio :value="ShowFormatEnum.IMAGE" :disabled="instructStore.formatChangeDisabled"
              >Image</el-radio
            >
          </el-radio-group>
        </div>
      </div>
    </el-card>
    <el-dialog v-model="showDialog" title="批量下载" width="700px" destroy-on-close center>
      文件夹名称：<el-input
        v-model="folderName"
        style="width: 500px"
        :placeholder="`请输入文件夹名称，若为空则直接下载，否则下载到压缩包中`"
        :resize="false"
      ></el-input>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDialog = false">取消</el-button>
          <el-button type="primary" @click="batchDownloadHandle">下载</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scope>
.operation-container {
  height: 100px;
}

.operation-card {
  height: 100px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.operation-card > .el-card__body {
  width: 100% !important;
}

.operation-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flex-left {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.flex-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.batch-download {
  margin-right: 20px;
}

.quality-slider {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 400px;
  margin-right: 20px;
}

.quality-title {
  width: 100px;
}
</style>
