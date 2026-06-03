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

export interface DatabaseHealth {
  enabled: boolean;
  configured: boolean;
  connected: boolean;
  message: string;
}

/**
 * Estado de conexión del Socket.IO
 */
export interface ConnectionStatus {
  backendConnected: boolean;
  serialConnected: boolean;
  lastDataTime: number | null;
  database?: DatabaseHealth;
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
