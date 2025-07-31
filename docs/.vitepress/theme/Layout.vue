<script setup>
import DefaultTheme from 'vitepress/theme'
import CustomFooter from './CustomFooter.vue'
import { useData } from 'vitepress'

const { Layout } = DefaultTheme
const { site } = useData()
</script>

<template>
  <Layout>
    <template #doc-after>
      <CustomFooter :copyright="site.themeConfig.footer?.copyright" />
    </template>
  </Layout>
</template>