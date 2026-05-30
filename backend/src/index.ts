import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { SerialService } from "./serial/serialService";
import { SocketService } from "./socket/socketService";
import {
  ArduinoCommand,
  HealthResponse,
  LatestResponse,
  CommandResponse,
} from "./types/arduino";

// Cargar variables de entorno
dotenv.config();

// ==================== VALIDACIÓN DE VARIABLES DE ENTORNO ====================
const requiredEnvVars = [
  "SERIAL_PORT",
  "BAUD_RATE",
  "SERVER_PORT",
  "FRONTEND_URL",
];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  console.error(
    `[APP] Variables de entorno faltantes: ${missingVars.join(", ")}`,
  );
  console.error("[APP] Crea un archivo .env con la configuración requerida");
  process.exit(1);
}

// ==================== CONFIGURACIÓN ====================
const PORT = parseInt(process.env.SERVER_PORT || "3001", 10);
const SERIAL_PORT = process.env.SERIAL_PORT || "COM3";
const BAUD_RATE = parseInt(process.env.BAUD_RATE || "115200", 10);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ==================== INICIALIZACIÓN ====================
const app = express();
const server = http.createServer(app);
const socketService = new SocketService(server, FRONTEND_URL);
const serialService = new SerialService(SERIAL_PORT, BAUD_RATE);

// ==================== MIDDLEWARE ====================
// CORS configurado desde variable de entorno
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  }),
);
app.use(express.json());

// Middleware para logging
app.use((req: Request, res: Response, next) => {
  console.log(`[HTTP] ${req.method} ${req.path}`);
  next();
});

// ==================== RUTAS REST ====================

/**
 * GET /api/health
 * Devuelve el estado del backend y la conexión serial
 */
app.get("/api/health", (_req: Request, res: Response<HealthResponse>) => {
  res.json({
    status: "ok",
    backend: "running",
    serial: {
      connected: serialService.isConnected(),
      port: SERIAL_PORT,
      lastDataTime: serialService.getLastDataTime() || undefined,
    },
  });
});

/**
 * GET /api/latest
 * Devuelve el último dato válido recibido del Arduino
 */
app.get("/api/latest", (_req: Request, res: Response<LatestResponse>) => {
  const data = serialService.getLastData();
  res.json({
    data: data || null,
    receivedAt: serialService.getLastDataTime() || undefined,
  });
});

/**
 * POST /api/command
 * Envía un comando al Arduino
 * Body: { type: 'FAN_ON' | 'FAN_OFF' | ..., value?: number }
 */
app.post(
  "/api/command",
  async (req: Request, res: Response<CommandResponse>) => {
    try {
      const body = req.body;

      // Validar que el body sea un objeto
      if (!body || typeof body !== "object") {
        return res.status(400).json({
          success: false,
          message: "Body debe ser un objeto JSON válido",
        });
      }

      const command = body as ArduinoCommand;

      // Validar que el comando tenga tipo
      if (!command.type || typeof command.type !== "string") {
        return res.status(400).json({
          success: false,
          message: 'Campo "type" es obligatorio y debe ser string',
        });
      }

      // Validar lista de comandos válidos
      const validCommands = [
        "FAN_ON",
        "FAN_OFF",
        "BUZZER_ON",
        "BUZZER_OFF",
        "SERVO_VERTICAL",
        "BASE_LEFT",
        "BASE_RIGHT",
        "BASE_STOP",
      ];

      if (!validCommands.includes(command.type)) {
        return res.status(400).json({
          success: false,
          message: `Comando inválido: "${command.type}". Válidos: ${validCommands.join(", ")}`,
        });
      }

      // Validar que value sea número si es SERVO_VERTICAL
      if (command.type === "SERVO_VERTICAL") {
        if (command.value === undefined || typeof command.value !== "number") {
          return res.status(400).json({
            success: false,
            message: 'SERVO_VERTICAL requiere "value" numérico (0-180)',
          });
        }

        if (command.value < 0 || command.value > 180) {
          return res.status(400).json({
            success: false,
            message: '"value" debe estar entre 0 y 180',
          });
        }
      }

      // Enviar comando
      const success = await serialService.sendCommand(command);

      if (success) {
        res.json({
          success: true,
          message: `Comando "${command.type}" enviado correctamente`,
          command: command.type,
        });
      } else {
        res.status(500).json({
          success: false,
          message:
            "No se pudo enviar el comando. Verifica que el Arduino está conectado.",
        });
      }
    } catch (error) {
      console.error("[HTTP] Error en POST /api/command:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },
);

// Ruta de fallback para paths no encontrados
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Error handler global para excepciones no capturadas
app.use((error: Error, _req: Request, res: Response, _next: () => void) => {
  console.error("[HTTP] Error no capturado:", error);
  res.status(500).json({
    error: "Error interno del servidor",
    message: error.message,
  });
});

// ==================== CONFIGURACIÓN DE SOCKET.IO ====================

/**
 * Callback cuando se reciben datos del Arduino
 */
serialService.onData((data) => {
  socketService.emitArduinoData(data);
});

/**
 * Callback cuando cambia el estado de conexión serial
 */
serialService.onStatus((connected) => {
  socketService.emitSerialStatus(connected, SERIAL_PORT);
  if (connected) {
    console.log("[APP] Arduino conectado");
  } else {
    console.log("[APP] Arduino desconectado");
  }
});

/**
 * Callback cuando Socket.IO recibe comandos
 */
socketService.onCommand(async (command: ArduinoCommand) => {
  return await serialService.sendCommand(command);
});

// ==================== INICIO DEL SERVIDOR ====================

async function startServer() {
  try {
    // Intentar conectar al Arduino
    const serialConnected = await serialService.connect();
    if (serialConnected) {
      console.log("[APP] Conexión serial establecida");
    } else {
      console.log("[APP] No se pudo conectar al Arduino, continuando sin él");
    }

    // Iniciar servidor HTTP
    server.listen(PORT, () => {
      console.log(`[APP] Servidor iniciado en http://localhost:${PORT}`);
      console.log(`[APP] Frontend URL: ${FRONTEND_URL}`);
      console.log(`[APP] Puerto serial: ${SERIAL_PORT} @ ${BAUD_RATE} baud`);
    });
  } catch (error) {
    console.error("[APP] Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

// ==================== MANEJO DE SEÑALES ====================

process.on("SIGINT", async () => {
  console.log("\n[APP] Cerrando servidor...");
  try {
    await serialService.disconnect();
    await socketService.close();
    server.close(() => {
      console.log("[APP] Servidor cerrado");
      process.exit(0);
    });
  } catch (error) {
    console.error("[APP] Error al cerrar:", error);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  console.log("\n[APP] Cerrando servidor...");
  try {
    await serialService.disconnect();
    await socketService.close();
    server.close(() => {
      console.log("[APP] Servidor cerrado");
      process.exit(0);
    });
  } catch (error) {
    console.error("[APP] Error al cerrar:", error);
    process.exit(1);
  }
});

// ==================== INICIAR ====================
startServer();
