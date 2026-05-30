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
 * Estado de conexión del Socket.IO
 */
export interface ConnectionStatus {
  backendConnected: boolean;
  serialConnected: boolean;
  lastDataTime: number | null;
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
