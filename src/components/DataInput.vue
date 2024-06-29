<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useInstructStore } from '@/stores/instruct';
import { ElMessage } from 'element-plus';
import type { UploadInstance } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue'
import { readFileAsync, safeJsonParse } from '@/utils';
import type { IReadFile } from '@/utils/types';
const instructStore = useInstructStore();
const dataInstructValue = ref('');

const upload = ref<UploadInstance>()
const fileList = ref([]);

watch(() => dataInstructValue.value, (instruct: string) => {
  instructStore.setInstruct(instruct);
}, { immediate: true });

watch(() => fileList.value, (files: IReadFile[]) => {
  console.log('fileList: ', files);
}, { immediate: true });

const onUploadChange = async (file: IReadFile) => {
  try {
    const fileContent: string = await readFileAsync(file);
    instructStore.addFile({
      ...file,
      jsonValue: safeJsonParse(fileContent),
    });
    ElMessage("文件添加成功");
  } catch (err) {
    ElMessage(`文件添加失败: ${JSON.stringify(err)}`);
  }
};

const clearFiles = () => {
  upload.value?.clearFiles();
  instructStore.clearFiles();
  ElMessage("文件清空成功")
};
</script>

<template>
  <div class="data-input-container">
    <el-card class="data-input-card">
      <el-upload
        class="upload-component"
        ref="upload"
        v-model:file-list="fileList"
        :drag="true"
        :on-change="onUploadChange"
        :auto-upload="false"
        :show-file-list="false"
        accept="application/json"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="upload-tips">上传文件</div>
      </el-upload>
      <el-button class="clear-files" type="primary" @click.stop="clearFiles">清空文件</el-button>
      <el-input
        v-model="dataInstructValue"
        type="textarea"
        :rows="15"
        :autosize="false"
        style="width: 360px;"
        :placeholder="`可以获取的参数为
params: { uploadFiles: Array, config: Object }
需要返回的数据类型为数组类型：
[
  {
    id: 'xxx',
    filename: 'xxx',
    data: {
      xxx
    }
  }
]
        `"
        :resize="false"
      />
    </el-card>
  </div>
</template>

<style lang="scss" scope>
.data-input {
  &-card {
    height: 500px;
  }
}

.upload-tips {
  margin-top: -20px;
}

.upload-component {
  margin-bottom: 10px;

  .el-upload-dragger {
    padding: 0 !important;
  }
}

.clear-files {
  width: 100%;
  margin-bottom: 10px;
}
</style>@/compositions/use-instruct