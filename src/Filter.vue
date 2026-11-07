<script setup lang="ts">
import TriStateRadio from "./components/TriStateRadio.vue";
import { Vulnerability } from "./types";
import { Field, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { XIcon, ChevronDown } from "@lucide/vue";
import { SelectIcon } from "reka-ui";

defineProps<{
  locations: string[];
}>();
const keyword = defineModel<string>("keyword", { required: true });
const location = defineModel<string>("location", { required: true });
const weaknesses = defineModel<[Vulnerability, boolean | null][]>(
  "weaknesses",
  { required: true },
);

const resetWeaknesses = () => {
  weaknesses.value = [
    ["axe", null],
    ["bow", null],
    ["dagger", null],
    ["spear", null],
    ["staff", null],
    ["sword", null],
    ["dark", null],
    ["fire", null],
    ["ice", null],
    ["light", null],
    ["lightning", null],
    ["wind", null],
  ];
};
</script>

<template>
  <div class="flex justify-between gap-2">
    <Field>
      <FieldLabel class="text-xs"> MONSTER NAME </FieldLabel>
      <InputGroup>
        <InputGroupInput v-model="keyword" placeholder="Filter by name..." />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label="Clear"
            title="Clear"
            size="icon-xs"
            @click="keyword = ''"
          >
            <XIcon v-if="!!keyword" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Field>
    <Field>
      <FieldLabel class="text-xs"> LOCATION </FieldLabel>
      <Select v-model="location">
        <SelectTrigger>
          <SelectValue placeholder="Filter by location" />
          <template v-slot:addon>
            <div class="flex gap-2 items-center">
              <Button
                v-if="!!location"
                aria-label="Clear"
                title="Clear"
                size="icon-xs"
                variant="ghost"
                @pointerdown.stop.prevent
                @click.prevent="location = ''"
              >
                <XIcon />
              </Button>
              <SelectIcon as-child>
                <ChevronDown class="size-4 opacity-50" />
              </SelectIcon>
            </div>
          </template>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem
              v-for="location in locations"
              :key="location"
              :value="location"
            >
              {{ location }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  </div>
  <Card class="w-full">
    <CardContent>
      <Field>
        <FieldLabel class="text-xs"> VULNERABILITY </FieldLabel>
        <div class="flex gap-2 flex-wrap">
          <TriStateRadio
            v-for="weakness in weaknesses"
            :type="weakness[0]"
            v-model="weakness[1]"
          />
        </div>
      </Field>
    </CardContent>
    <CardFooter class="flex justify-between">
      <div class="text-sm whitespace-nowrap">
        Tap to cycle:
        <span class="font-bold">unset</span>
        /
        <span class="font-bold text-green-500">+ include</span>
        /
        <span class="font-bold text-red-400">- exclude</span>
      </div>
      <Button variant="outline" @click="resetWeaknesses">Reset</Button>
    </CardFooter>
  </Card>
</template>
