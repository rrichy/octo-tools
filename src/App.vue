<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Vulnerability } from "./types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StarIcon } from "@lucide/vue";
import Filter from "./Filter.vue";

type Weakness = Vulnerability;

interface Monster {
  index: number;
  name: string;
  weaknesses: Weakness[];
  location: string;
}

const keyword = ref("");
const location = ref("");
const locations = ref<string[]>([]);
const monsters = ref<Monster[]>([]);
const pinnedMonsters = ref<Monster[]>([]);
const weaknesses = ref<[Weakness, boolean | null][]>([
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
]);
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
  <main class="px-4 py-3">
    <Filter
      v-model:keyword="keyword"
      v-model:location="location"
      v-model:weaknesses="weaknesses"
      :locations="locations"
    />

    <template v-if="pinnedMonsters.length > 0">
      <div class="my-2">
        <h4 class="text-sm font-bold leading-none">
          PINNED
          <span class="font-normal"
            >{{ pinnedMonsters.length }} · always shown</span
          >
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
          <TableRow v-for="invoice in pinnedMonsters" :key="invoice.index">
            <TableCell>
              <div class="flex items-center gap-1">
                <Button variant="ghost" size="icon" @click="togglePin(invoice)">
                  <StarIcon fill="#eab308" color="#eab308" />
                </Button>
                {{ invoice.name }}
              </div>
            </TableCell>
            <TableCell>
              <div class="flex gap-1">
                <img
                  v-for="weakness in invoice.weaknesses"
                  :key="weakness"
                  :src="`/icons/${weakness}.jpg`"
                  class="h-5"
                  :alt="weakness"
                  :title="weakness"
                />
              </div>
            </TableCell>
            <TableCell>
              {{ invoice.location }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </template>

    <div class="my-2">
      <h4 class="text-sm font-bold leading-none">
        RESULTS
        <span class="font-normal">{{ filtered.length }} matches</span>
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
        <TableRow v-for="m in filtered" :key="m.index">
          <TableCell>
            <div class="flex items-center gap-1">
              <Button variant="ghost" size="icon" @click="togglePin(m)">
                <StarIcon
                  :fill="pinned.has(m.index) ? '#eab308' : 'transparent'"
                  color="#eab308"
                />
              </Button>
              {{ m.name }}
            </div>
          </TableCell>
          <TableCell>
            <div class="flex gap-1">
              <img
                v-for="weakness in m.weaknesses"
                :key="weakness"
                :src="`/icons/${weakness}.jpg`"
                class="h-5"
                :alt="weakness"
                :title="weakness"
              />
            </div>
          </TableCell>
          <TableCell>
            {{ m.location }}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </main>
</template>

<style></style>
