<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import TriStateRadio from "./components/TriStateRadio.vue";
import { Vulnerability } from "./types";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { XIcon, ChevronDown, CopyIcon, InfoIcon, StarIcon } from "@lucide/vue";
import { SelectIcon } from "reka-ui";

type Weakness = Vulnerability;

interface Monster {
  index: number;
  name: string;
  weaknesses: Weakness[];
  location: string;
}

const MAX_PINS = 5;

const temp = ref<boolean | null>(null);
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
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Name</th>
          <th>Weakness</th>
          <th>Location</th>
        </tr>
      </thead>
      <tbody>
        <!-- PINNED -->
        <tr v-for="item in pinnedMonsters" :key="item.index">
          <td>
            <button class="pin" @click.prevent="togglePin(item)">
              <img src="/pin.svg" class="pin" alt="pin" />
              {{ item.index }}
            </button>
          </td>
          <td>{{ item.name }}</td>
          <td>
            <div class="weakness-wrapper">
              <img
                v-for="weakness in item.weaknesses"
                :key="weakness"
                :src="`/icons/${weakness}.jpg`"
                class="weakness"
                :alt="weakness"
                :title="weakness"
              />
            </div>
          </td>
          <td>{{ item.location }}</td>
        </tr>

        <tr>
          <td colspan="4"></td>
        </tr>

        <tr v-for="item in filtered" :key="item.index">
          <td>
            <button class="pin" @click.prevent="togglePin(item)">
              <img src="/pin.svg" class="pin" alt="pin" />
              {{ item.index }}
            </button>
          </td>
          <td>{{ item.name }}</td>
          <td>
            <div class="weakness-wrapper">
              <img
                v-for="weakness in item.weaknesses"
                :key="weakness"
                :src="`/icons/${weakness}.jpg`"
                class="weakness"
                :alt="weakness"
                :title="weakness"
              />
            </div>
          </td>
          <td>{{ item.location }}</td>
        </tr>
      </tbody>
    </table>
  </main>
</template>

<style>
.weakness {
  height: 1.5em;
}

.weakness-wrapper {
  display: flex;
  align-items: center;
  gap: 2px;
}

table {
  margin-top: 8px;
  border-collapse: collapse;
}

td {
  white-space: pre-line;
  padding-right: 4px;
  padding-left: 4px;
}

td:nth-of-type(1) {
  text-align: right;
  width: 2rem;
}

td:nth-of-type(2) {
  width: 14rem;
}

td:nth-of-type(3) {
  width: 8rem;
}

td,
th {
  border: 1px solid #aaa;
}

.weakness-filter {
  margin: auto;
  margin-top: 8px;
}

.weakness-selection {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
}

.weakness-btn {
  cursor: pointer;
  padding: 0;
  border: none;
  background-color: transparent;
  position: relative;
}
.weakness-btn .weakness {
  width: 2.5em;
  height: 2.5em;
}

.weakness-btn:not(:first-child) {
  margin-left: 4px;
}
</style>
