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
  timestamp?: number;
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
