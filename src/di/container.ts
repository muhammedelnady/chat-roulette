/** @format */

import { audioModule } from "./modules/audioModule";
import { chatModule } from "./modules/chatModule";
import { connectivityModule } from "./modules/connectivityModule";
import { eventModule } from "./modules/eventModule";

export const container = {
  ...audioModule,
  ...chatModule,
  ...connectivityModule,
  ...eventModule,
};

export type Container = typeof container;
