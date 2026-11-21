/** @format */
/**
 * Domain Event Bus
 */

import type { DomainEvent } from "./DomainEvent";

export type EventHandler<T extends DomainEvent> = (event: T) => void | Promise<void>;

export interface EventBus {
  publish<T extends DomainEvent>(event: T): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): () => void;
  clear(): void;
}
