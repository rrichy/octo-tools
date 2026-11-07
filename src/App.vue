<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import TriStateRadio from "./components/TriStateRadio.vue";
import { Vulnerability } from "./types";

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
    !appliedWeaknesses.value.length &&
    !hideWeaknesses.value.length
  )
    return monsters.value;

  const lowerCase = keyword.value.toLowerCase();

  let pre = monsters.value.filter(
    (monster) =>
      monster.name.toLowerCase().includes(lowerCase) ||
      monster.location.toLowerCase().includes(lowerCase),
  );

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
});
</script>

<template>
  <main class="container">
    <input v-model="keyword" placeholder="Filter..." />
    <div class="flex gap-2">
      <TriStateRadio
        v-for="weakness in weaknesses"
        :type="weakness[0]"
        v-model="weakness[1]"
      />
    </div>
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
/* :root { */
/*   font-family: Inter, Avenir, Helvetica, Arial, sans-serif; */
/*   font-size: 16px; */
/*   font-weight: 400; */
/**/
/*   color: #0f0f0f; */
/*   background-color: #f6f6f6; */
/**/
/*   font-synthesis: none; */
/*   text-rendering: optimizeLegibility; */
/*   -webkit-font-smoothing: antialiased; */
/*   -moz-osx-font-smoothing: grayscale; */
/*   -webkit-text-size-adjust: 100%; */
/* } */

/* .container { */
/*   margin: 0; */
/*   display: flex; */
/*   flex-direction: column; */
/*   justify-content: center; */
/* } */

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

/* input { */
/*   border-radius: 8px; */
/*   border: 1px solid transparent; */
/*   padding: 0.6em 1.2em; */
/*   font-size: 1em; */
/*   font-weight: 500; */
/*   font-family: inherit; */
/*   color: #0f0f0f; */
/*   background-color: #ffffff; */
/*   transition: border-color 0.25s; */
/*   box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2); */
/* } */

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
