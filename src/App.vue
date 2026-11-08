<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Filter from "@/components/Filter.vue";
import WeaknessTable from "@/components/WeaknessTable.vue";
import { defaultWeaknesses } from "@/utils/default-weakness";
import { Monster, Weakness } from "@/types";
import { Button } from "@/components/ui/button";
import { StarIcon, PlusIcon } from "@lucide/vue";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  exists,
  mkdir,
  readTextFile,
  writeTextFile,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";

import csv from "./monster-weaknesses.csv?raw";

const configFilename = "octo-tools.config.json";

interface Config {
  pinned: Monster[];
}

const keyword = ref("");
const location = ref("");
const locations = ref<string[]>([]);
const monsters = ref<Monster[]>([]);
// const pinnedMonsters = ref<Monster[]>([]);
const weaknesses = ref<[Weakness, boolean | null][]>(defaultWeaknesses());
const config = ref<Config>({
  pinned: [],
});
const pinned = computed(() => new Set(config.value.pinned.map((m) => m.index)));

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

const togglePin = async (monster: Monster) => {
  const existsIndex = config.value.pinned.findIndex(
    (m) => m.index === monster.index,
  );
  if (existsIndex >= 0) {
    config.value.pinned.splice(existsIndex, 1);
  } else {
    config.value.pinned.push(monster);
  }
  await saveConfig();
};

const getExistingConfig = async () => {
  if (await exists(configFilename, { baseDir: BaseDirectory.AppCache })) {
    const configFile = await readTextFile(configFilename, {
      baseDir: BaseDirectory.AppCache,
    });
    config.value = JSON.parse(configFile) as Config;
  }
};

const saveConfig = async () => {
  await mkdir("", { baseDir: BaseDirectory.AppCache, recursive: true });
  await writeTextFile(configFilename, JSON.stringify(config.value, null, 2), {
    baseDir: BaseDirectory.AppCache,
  });
};

onMounted(async () => {
  try {
    await getExistingConfig();
  } catch (error) {
    console.warn("Config file does not exists. Creating one.");
    await saveConfig();
  }

  // TODO: fetch added monsters too and merge
  monsters.value = csv
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
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  locations.value = Array.from(
    new Set(monsters.value.flatMap((m) => m.location.split("\n"))),
  ).sort();
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

    <div class="fixed right-2 bottom-2 flex flex-col gap-2">
      <Popover>
        <PopoverTrigger as-child>
          <Button size="icon-lg" class="bg-green-400 hover:bg-green-400/80">
            <PlusIcon :stroke-width="5" color="#1a2e05" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="right" :side-offset="8" align="end" class="w-fit">
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger as-child>
          <Button size="icon-lg">
            <StarIcon
              v-if="!config.pinned.length"
              fill="#eab308"
              color="#eab308"
            />
            <span v-else class="text-yellow-400 font-bold">{{
              config.pinned.length
            }}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent side="right" :side-offset="8" align="end" class="w-fit">
          <WeaknessTable
            v-if="config.pinned.length"
            pin-table
            :monsters="config.pinned"
            @toggle-pin="togglePin"
          />
          <span v-else> Pinned monsters are displayed here </span>
        </PopoverContent>
      </Popover>
    </div>
  </main>
</template>

<style></style>
