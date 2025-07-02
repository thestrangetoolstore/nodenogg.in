<script setup lang="ts">
import { useAppRouter } from '@/state'
import { Microcosm } from '@/microcosm'

const data = useAppRouter()
</script>

<template>
  <Microcosm v-if="data.microcosm_id" :uuid="data.microcosm_id"
    v-bind:key="`main/${data.microcosm_id}/${data.viewType}`" id="main" ui />
</template>