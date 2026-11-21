/** @format */

import ar from "./langs/ar.json";
import en from "./langs/en.json";

export const resources = {
  en,
  ar,
};

export type LangCode = keyof typeof resources;
