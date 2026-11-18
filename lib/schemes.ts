import data from "@/data/schemes.json";
import type { Scheme } from "./types";

export const schemes = data.schemes as Scheme[];

export function getScheme(id: string): Scheme | undefined {
  return schemes.find((s) => s.id === id);
}
