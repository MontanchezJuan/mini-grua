import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { ArduinoData, ArduinoCommand } from "../types/arduino";
import { parseArduinoJSON } from "../utils/validateArduinoData";

type DataCallback = (data: ArduinoData) => void;
type StatusCallback = (connected: boolean) => void;

export class SerialService {
  private port: SerialPort | null = null;
  private parser: ReadlineParser | null = null;
  private serialPort: string;
  private baudRate: number;
  private dataCallback: DataCallback | null = null;
  private statusCallback: StatusCallback | null = null;
  private lastData: ArduinoData | null = null;
  private lastDataTime: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 segundos
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(serialPort: string, baudRate: number = 115200) {
    this.serialPort = serialPort;
    this.baudRate = baudRate;
  }

  /**
   * Registra el callback para datos recibidos
   */
  onData(callback: DataCallback): void {
    this.dataCallback = callback;
  }

  /**
   * Registra el callback para cambios de estado de conexión
   */
  onStatus(callback: StatusCallback): void {
    this.statusCallback = callback;
  }

  /**
   * Conecta al puerto serial
   */
  async connect(): Promise<boolean> {
    try {
      console.log(
        `[SERIAL] Intentando conectar a ${this.serialPort} @ ${this.baudRate} baud`,
      );

      this.port = new SerialPort({
        path: this.serialPort,
        baudRate: this.baudRate,
      });

      this.port.on("open", () => {
        console.log(`[SERIAL] Puerto ${this.serialPort} abierto`);
        this.reconnectAttempts = 0;
        this.statusCallback?.(true);
      });

      this.port.on("error", (error) => {
        console.error(`[SERIAL] Error en puerto:`, error.message);
        this.handleDisconnect();
      });

      this.port.on("close", () => {
        console.log(`[SERIAL] Puerto cerrado`);
        this.handleDisconnect();
      });

      // Configurar parser para leer línea por línea
      this.parser = this.port.pipe(new ReadlineParser({ delimiter: "\n" }));

      this.parser.on("data", (line: string) => {
        this.handleData(line);
      });

      return new Promise((resolve) => {
        this.port!.on("open", () => resolve(true));
        setTimeout(() => resolve(false), 5000); // Timeout de 5s
      });
    } catch (error) {
      console.error(`[SERIAL] Error al conectar:`, error);
      this.handleDisconnect();
      return false;
    }
  }

  /**
   * Maneja datos recibidos del puerto serial
   */
  private handleData(line: string): void {
    const data = parseArduinoJSON(line);

    if (data) {
      this.lastData = data;
      this.lastDataTime = Date.now();
      this.dataCallback?.(data);
    } else if (line.trim().length > 0) {
      // Log de líneas que no son datos de sensor válidos
      // (ej: mensajes de inicio del Arduino)
      console.log(`[SERIAL] Línea no reconocida:`, line);
    }
  }

  /**
   * Maneja desconexión y reintenta conectar
   */
  private handleDisconnect(): void {
    this.port = null;
    this.parser = null;
    this.statusCallback?.(false);

    // Intentar reconectar
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `[SERIAL] Reconectando en ${this.reconnectDelay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      );

      this.reconnectTimer = setTimeout(() => {
        this.connect().catch((error) => {
          console.error(`[SERIAL] Error en reconexión:`, error);
        });
      }, this.reconnectDelay);
    } else {
      console.error(`[SERIAL] Se alcanzó el máximo de intentos de reconexión`);
    }
  }

  /**
   * Envía un comando al Arduino
   */
  async sendCommand(command: ArduinoCommand): Promise<boolean> {
    if (!this.port || !this.port.isOpen) {
      console.error(`[SERIAL] Puerto no conectado`);
      return false;
    }

    let commandStr = "";

    switch (command.type) {
      case "FAN_ON":
        commandStr = "FAN_ON";
        break;
      case "FAN_OFF":
        commandStr = "FAN_OFF";
        break;
      case "BUZZER_ON":
        commandStr = "BUZZER_ON";
        break;
      case "BUZZER_OFF":
        commandStr = "BUZZER_OFF";
        break;
      case "SERVO_VERTICAL":
        if (
          command.value !== undefined &&
          command.value >= 0 &&
          command.value <= 180
        ) {
          commandStr = `SERVO_VERTICAL:${command.value}`;
        } else {
          return false;
        }
        break;
      case "BASE_LEFT":
        commandStr = "BASE_LEFT";
        break;
      case "BASE_RIGHT":
        commandStr = "BASE_RIGHT";
        break;
      case "BASE_STOP":
        commandStr = "BASE_STOP";
        break;
      default:
        return false;
    }

    return new Promise((resolve) => {
      this.port!.write(commandStr + "\n", (error) => {
        if (error) {
          console.error(`[SERIAL] Error al enviar comando:`, error);
          resolve(false);
        } else {
          console.log(`[SERIAL] Comando enviado: ${commandStr}`);
          resolve(true);
        }
      });
    });
  }

  /**
   * Obtiene el último dato válido recibido
   */
  getLastData(): ArduinoData | null {
    return this.lastData;
  }

  /**
   * Obtiene la hora del último dato recibido
   */
  getLastDataTime(): number | null {
    return this.lastDataTime;
  }

  /**
   * Verifica si el puerto está conectado
   */
  isConnected(): boolean {
    return this.port !== null && this.port.isOpen;
  }

  /**
   * Desconecta del puerto serial
   */
  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.port && this.port.isOpen) {
      return new Promise((resolve) => {
        this.port!.close(() => {
          this.port = null;
          this.parser = null;
          resolve();
        });
      });
    }
  }
}
