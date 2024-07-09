<script lang="ts" setup>
import { RouterLink } from 'vue-router'
import { templateList } from '@/router/templateConfig'
</script>

<template>
  <div class="w400 flex-col right-5 left-5">
    <div class="template-card" v-for="template in templateList">
      <RouterLink :to="`/${template.name}`">
        <el-card>
          <el-image
            :src="template.icon"
            fit="cover"
            style="width: 260px; height: 260px; padding: 100px"
          />
          <template #footer>{{ template.name }}</template>
        </el-card>
      </RouterLink>
    </div>
  </div>
</template>

<style lang="scss" scope></style>
