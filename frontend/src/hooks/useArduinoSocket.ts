import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
  ArduinoData,
  ConnectionStatus,
  ArduinoCommand,
  DatabaseHealth,
  EventRecord,
} from "../types/arduino";

/**
 * Hook personalizado para manejar la conexión WebSocket con el backend
 */
export function useArduinoSocket() {
  const [data, setData] = useState<ArduinoData | null>(null);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    backendConnected: false,
    serialConnected: false,
    lastDataTime: null,
  });
  const [socket, setSocket] = useState<Socket | null>(null);

  // Inicializar conexión Socket.IO
  useEffect(() => {
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

    console.log(`[Socket] Conectando a ${backendUrl}`);

    const newSocket = io(backendUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Conexión establecida
    newSocket.on("connect", () => {
      console.log("[Socket] Conectado al backend");
      setConnectionStatus((prev) => ({ ...prev, backendConnected: true }));
    });

    // Desconexión
    newSocket.on("disconnect", () => {
      console.log("[Socket] Desconectado del backend");
      setConnectionStatus((prev) => ({ ...prev, backendConnected: false }));
    });

    // Recibir datos del Arduino
    newSocket.on(
      "arduino:data",
      (receivedData: ArduinoData & { receivedAt: number }) => {
        console.log("[Socket] Datos recibidos:", receivedData);
        setData({
          ...receivedData,
          receivedAt: new Date(receivedData.receivedAt).toISOString(),
        });
        setConnectionStatus((prev) => ({
          ...prev,
          lastDataTime: receivedData.receivedAt,
        }));
      },
    );

    // Recibir estado de conexión serial
    newSocket.on(
      "arduino:status",
      (status: { connected: boolean; port: string; timestamp: number }) => {
        console.log("[Socket] Estado serial:", status);
        setConnectionStatus((prev) => ({
          ...prev,
          serialConnected: status.connected,
        }));
      },
    );

    newSocket.on("database:status", (status: DatabaseHealth) => {
      setConnectionStatus((prev) => ({ ...prev, database: status }));
    });

    newSocket.on("event:started", (event: EventRecord) => {
      setEvents((prev) => [event, ...prev.filter((item) => item.id !== event.id)].slice(0, 20));
    });

    newSocket.on("event:updated", (event: EventRecord) => {
      setEvents((prev) =>
        prev.map((item) => (item.id === event.id ? event : item)),
      );
    });

    newSocket.on("event:closed", (event: EventRecord) => {
      setEvents((prev) => {
        const exists = prev.some((item) => item.id === event.id);
        if (!exists) return [event, ...prev].slice(0, 20);
        return prev.map((item) => (item.id === event.id ? event : item));
      });
    });

    // Errores de conexión
    newSocket.on("connect_error", (error) => {
      console.error("[Socket] Error de conexión:", error);
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const setSimulatedData = useCallback((nextData: ArduinoData) => {
    setData({
      ...nextData,
      receivedAt: new Date().toISOString(),
      timestamp: Date.now(),
    });
    setConnectionStatus((prev) => ({
      ...prev,
      lastDataTime: Date.now(),
    }));
  }, []);

  /**
   * Envía un comando al Arduino a través del socket
   */
  const sendCommand = useCallback(
    (command: ArduinoCommand): Promise<boolean> => {
      return new Promise((resolve) => {
        if (!socket || !socket.connected) {
          console.error("[Socket] No hay conexión al backend");
          resolve(false);
          return;
        }

        console.log("[Socket] Enviando comando:", command);

        // Escuchar respuesta
        socket.once("arduino:command:response", (response) => {
          console.log("[Socket] Respuesta recibida:", response);
          resolve(response.success);
        });

        // Timeout de 5 segundos
        const timeout = setTimeout(() => {
          socket.off("arduino:command:response");
          console.error("[Socket] Timeout al enviar comando");
          resolve(false);
        }, 5000);

        socket.emit("arduino:command", command, () => {
          clearTimeout(timeout);
        });
      });
    },
    [socket],
  );

  return {
    data,
    events,
    connectionStatus,
    sendCommand,
    setSimulatedData,
  };
}
