import React from "react";
import { ArduinoData, ConnectionStatus } from "../../types/arduino";

interface HeaderProps {
  data: ArduinoData | null;
  connectionStatus: ConnectionStatus;
}

export const Header: React.FC<HeaderProps> = ({ data, connectionStatus }) => {
  const isDark = data?.luz !== undefined && data.luz !== 0;
  const themeMessage = isDark
    ? "Modo nocturno activado por lectura de luz"
    : "Modo claro activado por lectura de luz en cero";

  return (
    <header className="header">
      <div>
        <p className="eyebrow">Mini grua industrial</p>
        <h1>Centro de control</h1>
      </div>
      <div className="header-status">
        <span
          className={`status-pill ${connectionStatus.backendConnected ? "ok" : "bad"}`}
        >
          Backend {connectionStatus.backendConnected ? "online" : "offline"}
        </span>
        <span className="theme-pill">{themeMessage}</span>
      </div>
    </header>
  );
};
