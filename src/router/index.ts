import { createRouter, createWebHistory } from 'vue-router'
import { templateList, type ITemplate } from './templateConfig'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: templateList.map((config: ITemplate) => {
    return {
      path: `/${config.name}`,
      name: config.name,
      component: () => import(`../templates/${config.name}/index.vue`)
    }
  })
})

export default router
