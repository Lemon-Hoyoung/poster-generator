<script setup lang="ts">
import TemplateList from './components/TemplateList.vue';
import DataInput from './components/DataInput.vue';
import TemplatePreview from './components/TemplatePreview.vue';
import Operator from './components/Operator.vue';
import ImageGenerateHistory from './components/ImageGenerateHistory.vue';
</script>

<template>
  <div class="layout-common">
    <el-container class="layout-container">
      <el-aside class="layout-template-list" width="300px">
        <template-list></template-list>
      </el-aside>
      <el-main class="layout-main">
        <el-container>
          <el-header class="layout-header" height="500px">
            <el-container>
              <el-aside width="400px" class="layout-data-input-container">
                <data-input></data-input>
              </el-aside>
              <el-main class="layout-template-preview">
                <template-preview></template-preview>
              </el-main>
            </el-container>
          </el-header>
          <el-main class="layout-operation">
            <operator></operator>
          </el-main>
          <el-footer class="layout-image-generator-history">
            <image-generate-history></image-generate-history>
          </el-footer>
        </el-container>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped lang="scss">
.layout {
  &-common {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    background: rgba(245, 247, 250, 1);
  }

  &-template-list {
    padding-top: 20px;
  }

  &-template-preview {
    padding: 0 0 0 20px;
  }

  &-header {
    padding: 0px;
  }

  &-container {
    height: 100vh;
    padding-left: 20px;
  }

  &-main {
    padding: 20px !important;
  }

  &-data-input-container {
    height: 500px;
  }

  &-operation {
    padding: 20px 0 0 0;
  }

  &-image-generator-history {
    height: 600px;
    padding: 20px 0 0 0;
  }
}
</style>
