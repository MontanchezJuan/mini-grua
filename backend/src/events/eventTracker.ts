import {
  ArduinoData,
  EventRecord,
  EventSource,
  EventType,
} from "../types/arduino";

type EventCallback = (event: EventRecord) => void | Promise<void>;

interface ActiveEventState {
  event: EventRecord;
  sum: number;
  lastUpdateAt: number;
}

interface EventDefinition {
  type: EventType;
  source: EventSource;
  isActive: (data: ArduinoData) => boolean;
  getValue: (data: ArduinoData) => number;
}

const UPDATE_THROTTLE_MS = 5000;

export class EventTracker {
  private activeEvents = new Map<EventType, ActiveEventState>();
  private callbacks: {
    started?: EventCallback;
    updated?: EventCallback;
    closed?: EventCallback;
  } = {};

  onStarted(callback: EventCallback): void {
    this.callbacks.started = callback;
  }

  onUpdated(callback: EventCallback): void {
    this.callbacks.updated = callback;
  }

  onClosed(callback: EventCallback): void {
    this.callbacks.closed = callback;
  }

  process(data: ArduinoData): void {
    const definitions: EventDefinition[] = [
      {
        type: "proximity",
        source: "arduino",
        isActive: (value) => value.obstaculo,
        getValue: (value) => value.distancia,
      },
      {
        type: "gas",
        source: "arduino",
        isActive: (value) => value.gasDetectado,
        getValue: (value) => value.gas,
      },
      {
        type: "light",
        source: "arduino",
        isActive: (value) => value.pocaLuz,
        getValue: (value) => value.luz,
      },
      {
        type: "ps5_recording",
        source: "ps5",
        isActive: (value) =>
          value.grabando === true || value.ps5Mode === "GRABANDO",
        getValue: (value) => value.framesGrabados || 0,
      },
    ];

    for (const definition of definitions) {
      this.processDefinition(definition, data);
    }
  }

  private processDefinition(definition: EventDefinition, data: ArduinoData): void {
    const active = this.activeEvents.get(definition.type);
    const isNowActive = definition.isActive(data);
    const value = definition.getValue(data);
    const now = Date.now();

    if (isNowActive && !active) {
      const event = this.createEvent(definition, data, value, now);
      this.activeEvents.set(definition.type, {
        event,
        sum: value,
        lastUpdateAt: now,
      });
      void this.callbacks.started?.(event);
      return;
    }

    if (isNowActive && active) {
      this.updateActiveEvent(active, data, value, now);
      if (now - active.lastUpdateAt >= UPDATE_THROTTLE_MS) {
        active.lastUpdateAt = now;
        void this.callbacks.updated?.(active.event);
      }
      return;
    }

    if (!isNowActive && active) {
      this.closeEvent(active, data, value, now);
      this.activeEvents.delete(definition.type);
      void this.callbacks.closed?.(active.event);
    }
  }

  private createEvent(
    definition: EventDefinition,
    data: ArduinoData,
    value: number,
    now: number,
  ): EventRecord {
    const iso = new Date(now).toISOString();

    return {
      type: definition.type,
      status: "active",
      source: definition.source,
      startedAt: iso,
      initialValue: value,
      finalValue: value,
      minValue: value,
      maxValue: value,
      avgValue: value,
      samplesCount: 1,
      metadata: this.createMetadata(data),
      createdAt: iso,
      updatedAt: iso,
    };
  }

  private updateActiveEvent(
    active: ActiveEventState,
    data: ArduinoData,
    value: number,
    now: number,
  ): void {
    const event = active.event;
    const samplesCount = (event.samplesCount || 0) + 1;
    active.sum += value;

    event.finalValue = value;
    event.minValue = Math.min(event.minValue ?? value, value);
    event.maxValue = Math.max(event.maxValue ?? value, value);
    event.samplesCount = samplesCount;
    event.avgValue = active.sum / samplesCount;
    event.durationMs = now - new Date(event.startedAt).getTime();
    event.durationSeconds = event.durationMs / 1000;
    event.metadata = this.createMetadata(data);
    event.updatedAt = new Date(now).toISOString();
  }

  private closeEvent(
    active: ActiveEventState,
    data: ArduinoData,
    value: number,
    now: number,
  ): void {
    this.updateActiveEvent(active, data, value, now);
    active.event.status = "closed";
    active.event.endedAt = new Date(now).toISOString();
    active.event.updatedAt = active.event.endedAt;
  }

  private createMetadata(data: ArduinoData): Record<string, unknown> {
    return {
      distancia: data.distancia,
      gas: data.gas,
      luz: data.luz,
      servoV: data.servoV,
      pocaLuz: data.pocaLuz,
      gasDetectado: data.gasDetectado,
      ventilador: data.ventilador,
      buzzer: data.buzzer,
      obstaculo: data.obstaculo,
      servoBaseDir: data.servoBaseDir,
      ps5Mode: data.ps5Mode || "NORMAL",
      grabando: data.grabando || false,
      reproduciendo: data.reproduciendo || false,
      framesGrabados: data.framesGrabados || 0,
      timestamp: data.timestamp,
      receivedAt: data.receivedAt,
    };
  }
}
