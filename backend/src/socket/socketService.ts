import { Server as HTTPServer } from "http";
import { Server as IOServer, Socket } from "socket.io";
import { ArduinoData, ArduinoCommand } from "../types/arduino";

type CommandCallback = (command: ArduinoCommand) => Promise<boolean>;

export class SocketService {
  private io: IOServer;
  private commandCallback: CommandCallback | null = null;
  private connectedClients = 0;

  constructor(httpServer: HTTPServer, origin: string) {
    this.io = new IOServer(httpServer, {
      cors: {
        origin: origin,
        methods: ["GET", "POST"],
      },
    });

    this.setupConnections();
  }

  /**
   * Configura los manejadores de conexión
   */
  private setupConnections(): void {
    this.io.on("connection", (socket: Socket) => {
      this.connectedClients++;
      console.log(
        `[SOCKET] Cliente conectado. Clientes activos: ${this.connectedClients}`,
      );

      socket.on("disconnect", () => {
        this.connectedClients--;
        console.log(
          `[SOCKET] Cliente desconectado. Clientes activos: ${this.connectedClients}`,
        );
      });

      // Evento para recibir comandos desde el cliente
      socket.on("arduino:command", async (command: ArduinoCommand) => {
        console.log(`[SOCKET] Comando recibido:`, command);

        if (this.commandCallback) {
          const success = await this.commandCallback(command);
          socket.emit("arduino:command:response", {
            success,
            command: command.type,
          });
        }
      });

      // Ping/pong para detectar desconexiones
      socket.on("ping", () => {
        socket.emit("pong");
      });
    });
  }

  /**
   * Registra el callback para comandos recibidos
   */
  onCommand(callback: CommandCallback): void {
    this.commandCallback = callback;
  }

  /**
   * Emite datos del Arduino a todos los clientes conectados
   */
  emitArduinoData(data: ArduinoData): void {
    this.io.emit("arduino:data", {
      ...data,
      receivedAt: Date.now(),
    });
  }

  /**
   * Emite cambios de estado de conexión
   */
  emitSerialStatus(connected: boolean, port?: string): void {
    this.io.emit("arduino:status", {
      connected,
      port: port || "unknown",
      timestamp: Date.now(),
    });
  }

  /**
   * Obtiene el número de clientes conectados
   */
  getConnectedClients(): number {
    return this.connectedClients;
  }

  /**
   * Cierra el servidor Socket.IO
   */
  async close(): Promise<void> {
    return new Promise((resolve) => {
      this.io.close(() => {
        resolve();
      });
    });
  }
}
