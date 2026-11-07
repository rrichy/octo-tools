<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import TriStateRadio from "./components/TriStateRadio.vue";
import { Vulnerability } from "./types";
import { Field, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { XIcon, ChevronDown, StarIcon } from "@lucide/vue";
import { SelectIcon } from "reka-ui";

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
  <main class="container">
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
