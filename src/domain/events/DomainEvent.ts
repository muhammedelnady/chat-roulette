/** @format */
/**
 * Domain Event
 */

export abstract class DomainEvent {
  readonly id: string;
  readonly occurredOn: Date;
  readonly eventType: string;

  constructor() {
    this.id = this.generateId();
    this.occurredOn = new Date();
    this.eventType = this.constructor.name;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  abstract toPayload(): Record<string, unknown>;
}
