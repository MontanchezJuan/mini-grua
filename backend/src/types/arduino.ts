/**
 * Tipo que representa los datos enviados por el Arduino en formato JSON
 */
export interface ArduinoData {
  distancia: number;
  gas: number;
  luz: number;
  servoV: number;
  pocaLuz: boolean;
  gasDetectado: boolean;
  ventilador: boolean;
  buzzer: boolean;
  obstaculo: boolean;
  servoBaseDir?: number;
  timestamp?: number;
  receivedAt?: string;
  ps5Mode?: "NORMAL" | "GRABANDO" | "REPRODUCIENDO";
  grabando?: boolean;
  reproduciendo?: boolean;
  framesGrabados?: number;
}

export type EventType = "proximity" | "gas" | "light" | "ps5_recording";
export type EventStatus = "active" | "closed";
export type EventSource = "arduino" | "web-test" | "ps5";

export interface EventRecord {
  id?: string;
  type: EventType;
  status: EventStatus;
  source: EventSource;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  durationSeconds?: number;
  initialValue?: number;
  finalValue?: number;
  minValue?: number;
  maxValue?: number;
  avgValue?: number;
  samplesCount?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface EventFilters {
  type?: EventType;
  status?: EventStatus;
  limit?: number;
  from?: string;
  to?: string;
}

export interface DatabaseHealth {
  enabled: boolean;
  configured: boolean;
  connected: boolean;
  message: string;
}

/**
 * Respuesta del endpoint /api/health
 */
export interface HealthResponse {
  status: string;
  backend: string;
  serial: {
    connected: boolean;
    port?: string;
    lastDataTime?: number;
  };
  firebase?: DatabaseHealth;
}

/**
 * Respuesta del endpoint /api/latest
 */
export interface LatestResponse {
  data?: ArduinoData | null;
  receivedAt?: number;
}

/**
 * Comando que se envía al Arduino
 */
export interface ArduinoCommand {
  type:
    | "FAN_ON"
    | "FAN_OFF"
    | "BUZZER_ON"
    | "BUZZER_OFF"
    | "SERVO_VERTICAL"
    | "BASE_LEFT"
    | "BASE_RIGHT"
    | "BASE_STOP";
  value?: number; // Para SERVO_VERTICAL
}

/**
 * Respuesta del endpoint /api/command
 */
export interface CommandResponse {
  success: boolean;
  message: string;
  command?: string;
}
