/** @format */

import { audioModule } from "./modules/audioModule";
import { chatModule } from "./modules/chatModule";
import { connectivityModule } from "./modules/connectivityModule";
import { eventModule } from "./modules/eventModule";
import { getHapticsService } from "./registerHaptics";

export const container = {
  ...audioModule,
  ...chatModule,
  ...connectivityModule,
  ...eventModule,
  getHapticsService,
};

export type Container = typeof container;
