/** @format */
/**
 * Domain Language Changed Event
 */

import { DomainEvent } from "./DomainEvent";

export class LanguageChangedEvent extends DomainEvent {
  constructor(public readonly language: string) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      language: this.language,
      occurredOn: this.occurredOn.toISOString(),
    };
  }
}
