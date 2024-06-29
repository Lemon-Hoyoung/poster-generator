import type { IReadFile } from "./types";

const generateInstructFunc = (instruct: string) => {
  return (params: any = {}) => {
    let funcReturnValue = undefined;
    try {
      funcReturnValue = eval(`((params) => {
        ${instruct}
      })(${JSON.stringify(params)})`);
    } catch (err) {
      console.error(err);
    }
    return funcReturnValue;
  };
};

const readFileAsync = async (file: IReadFile): Promise<string> => {
  const reader = new FileReader();
  let resolveController = (value: any) => {};
  let rejectController = (err: any) => {};
  reader.readAsText(file.raw);
  const getResPromise = new Promise((resolve, reject) => {
    resolveController = resolve;
    rejectController = reject;
  });
  reader.onload = (e) => {
    resolveController(e?.target?.result);
  }
  reader.onerror = (e) => {
    rejectController(e?.target?.error);
  }
  const result: string = await getResPromise;
  return result;
};

const safeJsonParse = (json: string) => {
  let res = {};
  try {
    res = JSON.parse(json);
  } catch (err) {
    console.error("json parse error: ", err);
  }
  return res;
};

const base64ConvertFile = function (urlData: string, filename: string) { // 64转file
  // if (typeof urlData != 'string') {
  //   return;
  // }
  let arr = urlData.split(',')
  let type = (arr[0].match(/:(.*?);/) || [])[1] || 'image/png';
  let fileExt = type.split('/')[1]
  let bstr = atob(arr[1])
  let n = bstr.length
  let u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], `${filename}.${fileExt}`, {
    type: type
  });
};

const downloadBase64AsImage = (urlData: string, filename: string) => {
  const downloadFile = base64ConvertFile(urlData, filename);
  const tmpLink = document.createElement("a");
  const objectUrl = URL.createObjectURL(downloadFile);

  tmpLink.href = objectUrl;
  tmpLink.download = downloadFile.name;
  document.body.appendChild(tmpLink);
  tmpLink.click();

  document.body.removeChild(tmpLink);
  URL.revokeObjectURL(objectUrl);
};

export {
  generateInstructFunc,
  readFileAsync,
  safeJsonParse,
  downloadBase64AsImage,
};
