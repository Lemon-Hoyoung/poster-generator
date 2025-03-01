import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { IReadFile, IDataInput } from '@/utils/types'
import { ShowFormatEnum } from '@/utils/enum'
import { templateList } from '@/router/templateConfig'

interface ISpecificFile extends IReadFile {
  jsonValue: Record<string, any>
}

interface IImageFile {
  url: string
  filename: string
}

export const useInstructStore = defineStore('instruct', {
  state: () => {
    return {
      instructString: '',
      instructExcuteResult: [] as IDataInput<any>[],
      fileList: [] as ISpecificFile[],
      routerName: '',
      domList: [] as HTMLElement[],
      canvasList: [] as HTMLCanvasElement[],
      base64ImageList: [] as IImageFile[],
      showFormat: ShowFormatEnum.DOM,
      formatChangeDisabled: false
    }
  },
  getters: {
    inputParams(state) {
      return {
        uploadFiles: state.fileList,
        config: {}
      }
    },
    templateComponentPromise(state) {
      const component = ((state) => import(`@/templates/${state.routerName}/index.vue`))(state)
      const componentConfig = templateList.find((item) => item.name === state.routerName)
      return component.then((comp) => {
        return {
          component: comp.default,
          config: componentConfig
        }
      })
    }
  },
  actions: {
    setInstruct(value: string) {
      this.instructString = value
    },
    setInstructExcuteResult(value: IDataInput<any>[]) {
      this.instructExcuteResult = value
    },
    addFile(file: ISpecificFile) {
      this.fileList.push(file)
    },
    clearFiles() {
      this.fileList = []
    },
    setRouterName(name: string) {
      this.routerName = name
    },
    setDomList(list: HTMLElement[]) {
      this.domList = list
    },
    setCanvasList(list: HTMLCanvasElement[]) {
      this.canvasList = list
    },
    setBase64ImageList(list: IImageFile[]) {
      this.base64ImageList = list
    },
    setShowFormat(format: ShowFormatEnum) {
      this.showFormat = format
    },
    setFormatChangeDisabled(disabled: boolean) {
      this.formatChangeDisabled = disabled
    }
  }
})
