import React from "react";
import "../styles/StatusCard.css";
import { ConnectionStatus } from "../types/arduino";

interface StatusCardProps {
  connectionStatus: ConnectionStatus;
}

/**
 * Tarjeta que muestra el estado de conexión
 */
export const StatusCard: React.FC<StatusCardProps> = ({ connectionStatus }) => {
  const getTimeAgo = (timestamp: number | null): string => {
    if (!timestamp) return "Nunca";

    const now = Date.now();
    const diffMs = now - timestamp;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    if (diffSecs < 60) return `Hace ${diffSecs}s`;
    if (diffMins < 60) return `Hace ${diffMins}m`;
    return "Hace más de una hora";
  };

  return (
    <div className="status-card">
      <h3 className="status-card-title">Estado de Conexión</h3>

      <div className="status-items">
        <div className="status-item">
          <div className="status-indicator">
            <div
              className={`status-dot ${connectionStatus.backendConnected ? "connected" : "disconnected"}`}
            />
            <span className="status-label">Backend</span>
          </div>
          <span className="status-text">
            {connectionStatus.backendConnected ? "Conectado" : "Desconectado"}
          </span>
        </div>

        <div className="status-item">
          <div className="status-indicator">
            <div
              className={`status-dot ${connectionStatus.serialConnected ? "connected" : "disconnected"}`}
            />
            <span className="status-label">Arduino</span>
          </div>
          <span className="status-text">
            {connectionStatus.serialConnected ? "Conectado" : "Desconectado"}
          </span>
        </div>

        <div className="status-item">
          <div className="status-indicator">
            <span className="status-label">Último dato</span>
          </div>
          <span className="status-text">
            {getTimeAgo(connectionStatus.lastDataTime)}
          </span>
        </div>
      </div>
    </div>
  );
};
