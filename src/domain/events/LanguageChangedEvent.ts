/** @format */
/**
 * Domain Language Changed Event
 */

import { DomainEvent } from "./DomainEvent";

export const LANGUAGE_CHANGED_EVENT = "LanguageChangedEvent" as const;

export class LanguageChangedEvent extends DomainEvent {
  constructor(public readonly language: string) {
    super(LANGUAGE_CHANGED_EVENT);
  }

  toPayload(): Record<string, unknown> {
    return {
      id: this.id,
      eventType: this.eventType,
      language: this.language,
      occurredOn: this.occurredOn.toISOString(),
    };
  }
}
