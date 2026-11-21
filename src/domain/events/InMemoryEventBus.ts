/** @format */
/**
 * Domain In-Memory Event Bus
 */

import type { ILogger } from "@/src/domain/services/ILogger";

import type { DomainEvent } from "./DomainEvent";
import type { EventBus, EventHandler } from "./EventBus";

const isTestEnvironment =
  process.env.NODE_ENV === "test" || process.env["JEST_WORKER_ID"] !== undefined;

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, Set<EventHandler<DomainEvent>>>();

  constructor(private readonly logger?: ILogger) {}

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.eventType);

    if (!handlers || handlers.size === 0) {
      if (!isTestEnvironment) {
        this.logger?.warn(`No handlers registered for event: ${event.eventType}`);
      }
      return;
    }

    const promises: Promise<void>[] = [];

    for (const handler of handlers) {
      try {
        const result = handler(event);
        if (result instanceof Promise) {
          promises.push(
            result.catch((error: unknown) => {
              if (!isTestEnvironment) {
                this.logger?.warn(`Handler failed for event ${event.eventType}:`, error);
              }
            })
          );
        }
      } catch (error) {
        if (!isTestEnvironment) {
          this.logger?.warn(`Handler failed for event ${event.eventType}:`, error);
        }
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map((event) => this.publish(event)));
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
      handlers.delete(typedHandler);
    };
  }

  clear(): void {
    this.handlers.clear();
  }

  handlerCount(eventType: string): number {
    return this.handlers.get(eventType)?.size ?? 0;
  }
}
