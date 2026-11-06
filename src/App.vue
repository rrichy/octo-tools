<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

type Weakness = string;

interface Monster {
  index: number;
  name: string;
  weaknesses: Weakness[];
  location: string;
}

const keyword = ref("");
const monsters = ref<Monster[]>([]);
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
          weaknesses: row.slice(1, 6).filter(Boolean),
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
    <div class="weakness-filter">
      <button
        v-for="weakness in weaknesses"
        :key="weakness[0]"
        class="weakness-btn"
        @click.prevent="
          weakness[1] =
            weakness[1] === true ? false : weakness[1] === false ? null : true
        "
      >
        <img
          :src="`/icons/${weakness[0]}.jpg`"
          class="weakness"
          :alt="weakness[0]"
          :title="weakness[0]"
        />

        <img
          v-if="weakness[1] === true"
          src="/include.svg"
          class="weakness-selection"
          alt="include"
        />
        <img
          v-else-if="weakness[1] === false"
          src="/exclude.svg"
          class="weakness-selection"
          alt="exclude"
        />
        <img v-else src="/unset.svg" class="weakness-selection" alt="unset" />
      </button>
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
        <tr v-for="item in filtered" :key="item.index">
          <td>{{ item.index }}</td>
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

<style scoped></style>
<style>
:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  font-weight: 400;

  color: #0f0f0f;
  background-color: #f6f6f6;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

.container {
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.weakness {
  height: 1.5em;
}

.weakness-wrapper .weakness:not(:first-child) {
  margin-left: 2px;
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

td {
  border: 1px solid black;
}

input {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  color: #0f0f0f;
  background-color: #ffffff;
  transition: border-color 0.25s;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
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

/* button:hover { */
/*   border-color: #396cd8; */
/* } */
/* button:active { */
/*   border-color: #396cd8; */
/*   background-color: #e8e8e8; */
/* } */

input {
  outline: none;
}

@media (prefers-color-scheme: dark) {
  :root {
    color: #f6f6f6;
    background-color: #2f2f2f;
  }

  a:hover {
    color: #24c8db;
  }

  input {
    color: #ffffff;
    background-color: #0f0f0f98;
  }
  /* button:active { */
  /*   background-color: #0f0f0f69; */
  /* } */
}
</style>
