export type Weapon = "axe" | "bow" | "dagger" | "spear" | "staff" | "sword";
export type Element = "dark" | "fire" | "ice" | "light" | "lightning" | "wind";

export type Vulnerability = Weapon | Element;
export type Weakness = Vulnerability;

export interface Monster {
  index: number;
  name: string;
  weaknesses: Weakness[];
  location: string;
}
