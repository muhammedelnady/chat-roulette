/** @format */

import { type EventBus, InMemoryEventBus } from "@/src/domain/events";
import { log } from "@/src/infrastructure/logging/logger";

const eventBus: EventBus = new InMemoryEventBus(log);

export const eventModule = {
  getEventBus: (): EventBus => eventBus,
};
