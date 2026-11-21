/** @format */
/**
 * Domain Event
 */

import { generateUUID } from "@/src/domain/utils/uuid";

export abstract class DomainEvent {
  readonly id: string;
  readonly occurredOn: Date;
  readonly eventType: string;

  constructor(eventType: string) {
    this.id = generateUUID();
    this.occurredOn = new Date();
    this.eventType = eventType;
  }

  abstract toPayload(): Record<string, unknown>;
}
