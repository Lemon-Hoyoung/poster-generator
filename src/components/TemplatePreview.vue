<script lang="ts" setup>
import { useInstructStore } from '@/stores/instruct';
import { RouterView, useRouter } from 'vue-router';
import { watch } from 'vue';
const instructStore = useInstructStore();
const router = useRouter();

watch(() => router.currentRoute.value.name, (newRouterName: string) => {
  console.log('newRouterName: ', newRouterName);
  instructStore.setRouterName(newRouterName || '');
}, { immediate: true });

</script>

<template>
  <div class="template-preview-container">
    <el-card class="template-preview-card">
      <RouterView />
    </el-card>
  </div>
</template>

<style lang="scss" scope>
.template-preview {
  &-container {
    height: 500px;
  }
  &-card {
    height: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>