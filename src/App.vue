<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Filter from "@/components/Filter.vue";
import WeaknessTable from "@/components/WeaknessTable.vue";
import { defaultWeaknesses } from "@/utils/default-weakness";
import { Monster, Weakness } from "@/types";
import { Button } from "@/components/ui/button";
import { StarIcon } from "@lucide/vue";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const keyword = ref("");
const location = ref("");
const locations = ref<string[]>([]);
const monsters = ref<Monster[]>([]);
const pinnedMonsters = ref<Monster[]>([]);
const weaknesses = ref<[Weakness, boolean | null][]>(defaultWeaknesses());
const pinned = computed(
  () => new Set(pinnedMonsters.value.map((m) => m.index)),
);

const appliedWeaknesses = computed(() =>
  weaknesses.value.filter((w) => w[1] === true).map((w) => w[0]),
);
const hideWeaknesses = computed(() =>
  weaknesses.value.filter((w) => w[1] === false).map((w) => w[0]),
);

const filtered = computed(() => {
  if (
    !keyword.value &&
    !location.value &&
    !appliedWeaknesses.value.length &&
    !hideWeaknesses.value.length
  )
    return monsters.value;

  let pre = monsters.value;

  if (keyword.value) {
    const lowerCase = keyword.value.toLowerCase();
    pre = pre.filter((monster) =>
      monster.name.toLowerCase().includes(lowerCase),
    );
  }

  if (location.value) {
    pre = pre.filter((monster) => monster.location.includes(location.value));
  }

  if (appliedWeaknesses.value.length) {
    pre = pre.filter((monster) =>
      appliedWeaknesses.value.every((weakness) =>
        monster.weaknesses.includes(weakness),
      ),
    );
  }

  if (hideWeaknesses.value.length) {
    pre = pre.filter((monster) =>
      hideWeaknesses.value.every(
        (weakness) => !monster.weaknesses.includes(weakness),
      ),
    );
  }

  return pre;
});

const togglePin = (monster: Monster) => {
  const existsIndex = pinnedMonsters.value.findIndex(
    (m) => m.index === monster.index,
  );
  if (existsIndex >= 0) {
    pinnedMonsters.value.splice(existsIndex, 1);
  } else {
    pinnedMonsters.value.push(monster);
  }
};

onMounted(async () => {
  const raw = await fetch("monster-weaknesses.csv").then((r) => r.text());
  monsters.value = raw
    .trim()
    .split("\n")
    .map((line) => line.replace(/\\n/, "\n").split(","))
    .slice(1)
    .reduce(
      (acc, row, index) => [
        ...acc,
        {
          index: index + 1,
          name: row[0],
          weaknesses: row.slice(1, 6).filter(Boolean) as Weakness[],
          location: row[6],
        },
      ],
      [] as Monster[],
    );
  locations.value = Array.from(
    new Set(monsters.value.flatMap((m) => m.location.split("\n"))),
  );
});
</script>

<template>
  <main class="px-4 py-3 relative">
    <Filter
      v-model:keyword="keyword"
      v-model:location="location"
      v-model:weaknesses="weaknesses"
      :locations="locations"
    />

    <WeaknessTable
      class="mt-4"
      :monsters="filtered"
      :pinned="pinned"
      @toggle-pin="togglePin"
    />

    <Popover>
      <PopoverTrigger as-child>
        <Button size="icon-lg" class="fixed right-2 bottom-2">
          <StarIcon
            v-if="!pinnedMonsters.length"
            fill="#eab308"
            color="#eab308"
          />
          <span v-else class="text-yellow-400 font-bold">{{
            pinnedMonsters.length
          }}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" :side-offset="8" align="end" class="w-fit">
        <WeaknessTable
          v-if="pinnedMonsters.length"
          pin-table
          :monsters="pinnedMonsters"
          @toggle-pin="togglePin"
        />
        <span v-else> Pinned monsters are displayed here </span>
      </PopoverContent>
    </Popover>
  </main>
</template>

<style></style>
