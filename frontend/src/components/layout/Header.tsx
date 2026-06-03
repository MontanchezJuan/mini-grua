import React from "react";
import { ArduinoData, ConnectionStatus } from "../../types/arduino";

interface HeaderProps {
  data: ArduinoData | null;
  connectionStatus: ConnectionStatus;
}

export const Header: React.FC<HeaderProps> = ({ data, connectionStatus }) => {
  const themeMessage = data?.pocaLuz
    ? "Modo nocturno activado por baja luz"
    : "Modo claro activado por luz suficiente";

  return (
    <header className="header">
      <div>
        <p className="eyebrow">Mini grua industrial</p>
        <h1>Centro de control</h1>
      </div>
      <div className="header-status">
        <span className={`status-pill ${connectionStatus.backendConnected ? "ok" : "bad"}`}>
          Backend {connectionStatus.backendConnected ? "online" : "offline"}
        </span>
        <span className={`status-pill ${connectionStatus.serialConnected ? "ok" : "warn"}`}>
          Arduino {connectionStatus.serialConnected ? "conectado" : "sin conexion"}
        </span>
        <span className={`status-pill ${connectionStatus.database?.connected ? "ok" : "warn"}`}>
          DB {connectionStatus.database?.connected ? "activa" : "no configurada"}
        </span>
        <span className="theme-pill">{themeMessage}</span>
      </div>
    </header>
  );
};
