<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Monster } from "@/types";
import { StarIcon } from "@lucide/vue";

withDefaults(
  defineProps<{
    monsters: Monster[];
    pinTable?: boolean;
    pinned?: number[];
  }>(),
  {
    pinned: () => [],
  },
);
defineEmits<{
  (e: "toggle-pin", v: Monster): void;
}>();
</script>

<template>
  <div>
    <div class="my-2">
      <h4 class="text-sm font-bold text-yellow-700 leading-none">
        <template v-if="pinTable">
          PINNED
          <span class="font-normal">{{ monsters.length }} · always shown</span>
        </template>
        <template v-else>
          RESULTS
          <span class="font-normal">{{ monsters.length }} matches</span>
        </template>
      </h4>
    </div>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>NAME</TableHead>
          <TableHead>WEAKNESS</TableHead>
          <TableHead> LOCATION </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="monster in monsters" :key="monster.index">
          <TableCell>
            <div class="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                @click="$emit('toggle-pin', monster)"
              >
                <StarIcon
                  :fill="
                    pinTable || pinned.includes(monster.index)
                      ? '#eab308'
                      : 'transparent'
                  "
                  color="#eab308"
                />
              </Button>
              {{ monster.name }}
            </div>
          </TableCell>
          <TableCell>
            <div class="flex gap-1">
              <img
                v-for="weakness in monster.weaknesses"
                :key="weakness"
                :src="`/icons/${weakness}.jpg`"
                class="h-5"
                :alt="weakness"
                :title="weakness"
              />
            </div>
          </TableCell>
          <TableCell class="whitespace-pre-wrap">
            {{ monster.location }}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
