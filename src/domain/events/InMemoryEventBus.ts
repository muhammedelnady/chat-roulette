/** @format */
/**
 * Domain In-Memory Event Bus
 */

import type { ILogger } from "@/src/domain/services/ILogger";

import type { DomainEvent } from "./DomainEvent";
import type { EventBus, EventHandler } from "./EventBus";

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, Set<EventHandler<DomainEvent>>>();

  constructor(private readonly logger?: ILogger) {}

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.eventType);

    if (!handlers || handlers.size === 0) {
      this.logger?.warn(`No handlers registered for event: ${event.eventType}`);
      return;
    }

    const snapshot = Array.from(handlers);
    const promises = snapshot.map((handler) =>
      Promise.resolve()
        .then(() => handler(event))
        .catch((error: unknown) => {
          this.logger?.warn(`Handler failed for event ${event.eventType}:`, error);
        })
    );

    await Promise.all(promises);
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): () => void {
    let handlers = this.handlers.get(eventType);
    if (!handlers) {
      handlers = new Set();
      this.handlers.set(eventType, handlers);
    }
    const typedHandler = handler as EventHandler<DomainEvent>;
    handlers.add(typedHandler);

    return () => {
      const current = this.handlers.get(eventType);
      if (!current) return;
      current.delete(typedHandler);
      if (current.size === 0) {
        this.handlers.delete(eventType);
      }
    };
  }

  clear(): void {
    this.handlers.clear();
  }

  handlerCount(eventType: string): number {
    return this.handlers.get(eventType)?.size ?? 0;
  }
}
