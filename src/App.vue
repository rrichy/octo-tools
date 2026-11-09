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

type Index = number;

interface Config {
  pinned: Index[];
  added: Monster[];
}

const keyword = ref("");
const location = ref("");
const locations = ref<string[]>([]);
const monsters = ref<Monster[]>([]);
const weaknesses = ref<[Weakness, boolean | null][]>(defaultWeaknesses());
const config = ref<Config>({
  pinned: [],
  added: [],
});
const pinned = computed(() =>
  config.value.pinned.map((index) => monsters.value[index]),
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

const togglePin = async (monster: Monster) => {
  const indexExists = config.value.pinned.includes(monster.index);
  if (indexExists) {
    config.value.pinned = config.value.pinned.filter(
      (m) => m !== monster.index,
    );
  } else {
    config.value.pinned.push(monster.index);
  }
  await saveConfig();
};

const getExistingConfig = async () => {
  if (await exists(configFilename, { baseDir: BaseDirectory.AppCache })) {
    const configFile = await readTextFile(configFilename, {
      baseDir: BaseDirectory.AppCache,
    });
    const _config = JSON.parse(configFile) as Config;
    config.value = {
      pinned: _config.pinned ?? [],
      added: _config.added ?? [],
    };
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

  monsters.value = [
    ...csv
      .trim()
      .split("\n")
      .map((line) => line.replace(/\\n/, "\n").split(","))
      .slice(1)
      .reduce(
        (acc, row) => [
          ...acc,
          {
            index: -1,
            name: row[0],
            weaknesses: row.slice(1, 6).filter(Boolean) as Weakness[],
            location: row[6],
          },
        ],
        [] as Monster[],
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((m, index) => ({ ...m, index })),
    ...config.value.added,
  ];

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
      :pinned="config.pinned"
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
            :monsters="pinned"
            @toggle-pin="togglePin"
          />
          <span v-else> Pinned monsters are displayed here </span>
        </PopoverContent>
      </Popover>
    </div>
  </main>
</template>

<style></style>
