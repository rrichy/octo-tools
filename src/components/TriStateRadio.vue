<script setup lang="ts">
import { Button } from "@/components/ui/button";
import Include from "./icons/Include.vue";
import Exclude from "./icons/Exclude.vue";
import Unset from "./icons/Unset.vue";
import { Vulnerability } from "@/types";
import { computed } from "vue";

const value = defineModel<boolean | null>({ required: true });
const props = defineProps<{
  type: Vulnerability;
}>();

const title = computed(
  () => props.type[0].toLocaleUpperCase() + props.type.slice(1),
);
</script>

<template>
  <Button
    variant="outline"
    :color="value === true ? 'green' : value === false ? 'red' : 'primary'"
    @click="value = value === true ? false : value === false ? null : true"
  >
    <img :src="`/icons/${type}.jpg`" class="h-5" :alt="title" :title="title" />
    {{ title }}
    <component
      :is="value === true ? Include : value === false ? Exclude : Unset"
    />
  </Button>
</template>

<style scoped></style>
