import JSZip from 'jszip'
import type { IReadFile, IImageList } from './types'
import { saveAs } from 'file-saver'
import UPNG from 'upng-js'

const generateInstructFunc = (instruct: string) => {
  return (params: any = {}) => {
    let funcReturnValue = undefined
    try {
      funcReturnValue = eval(`((params) => {
        ${instruct}
      })(${JSON.stringify(params)})`)
    } catch (err) {
      console.error(err)
    }
    return funcReturnValue
  }
}

const readFileAsync = async (file: IReadFile): Promise<string> => {
  const reader = new FileReader()
  let resolveController = (value: any) => {}
  let rejectController = (err: any) => {}
  reader.readAsText(file.raw)
  const getResPromise = new Promise((resolve, reject) => {
    resolveController = resolve
    rejectController = reject
  })
  reader.onload = (e) => {
    resolveController(e?.target?.result)
  }
  reader.onerror = (e) => {
    rejectController(e?.target?.error)
  }
  const result: string = await getResPromise
  return result
}

const safeJsonParse = (json: string) => {
  let res = {}
  try {
    res = JSON.parse(json)
  } catch (err) {
    console.error('json parse error: ', err)
  }
  return res
}

const base64ConvertFile = function (urlData: string, filename: string) {
  // 64转file
  // if (typeof urlData != 'string') {
  //   return;
  // }
  let arr = urlData.split(',')
  let type = (arr[0].match(/:(.*?);/) || [])[1] || 'image/png'
  let fileExt = type.split('/')[1]
  let bstr = atob(arr[1])
  let n = bstr.length
  let u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], `${filename}.${fileExt}`, {
    type: type
  })
}

const compressPNG = async (file: File, quality = 0.8) => {
  const arrayBuffer = await file.arrayBuffer()
  const decoded = UPNG.decode(arrayBuffer)
  const rgba8 = UPNG.toRGBA8(decoded)

  const compressed = UPNG.encode(rgba8, decoded.width, decoded.height, 256 * quality)
  return new File([compressed], file.name, { type: 'image/png' })
}

const downloadBase64AsImage = async (urlData: string, filename: string) => {
  const downloadFile = base64ConvertFile(urlData, filename)
  const compressedFile = await compressPNG(downloadFile)
  const tmpLink = document.createElement('a')
  const objectUrl = URL.createObjectURL(compressedFile)

  tmpLink.href = objectUrl
  tmpLink.download = compressedFile.name
  document.body.appendChild(tmpLink)
  tmpLink.click()

  document.body.removeChild(tmpLink)
  URL.revokeObjectURL(objectUrl)
}

const saveBase64AsImage = async (urlData: string, filename: string, quality = 80) => {
  const downloadFile = base64ConvertFile(urlData, filename)
  const compressedFile = await compressPNG(downloadFile, quality / 100)
  saveAs(compressedFile, filename)
}

const downloadBase64ImageIntoZip = async (
  imageList: IImageList[],
  folderName: string,
  quality = 80
) => {
  let zip = new JSZip()
  let imageFolder = zip.folder(folderName)
  for (let i = 0; i < imageList.length; i++) {
    const downloadFile = base64ConvertFile(imageList[i].url, imageList[i].filename)
    const compressedFile = await compressPNG(downloadFile, quality / 100)
    imageFolder?.file(`${imageList[i].filename}.png`, compressedFile)
  }
  // imageList.forEach(async (image: IImageList) => {
  //   imageFolder?.file(
  //     `${image.filename}.png`,
  //     image.url.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''),
  //     { base64: true }
  //   )
  // })
  zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, `${folderName}.zip`)
  })
}

export {
  generateInstructFunc,
  readFileAsync,
  safeJsonParse,
  downloadBase64AsImage,
  saveBase64AsImage,
  downloadBase64ImageIntoZip
}
