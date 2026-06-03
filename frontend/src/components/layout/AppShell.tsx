import React from "react";
import { ArduinoData, ConnectionStatus } from "../../types/arduino";
import { Header } from "./Header";
import { Sidebar, ViewKey } from "./Sidebar";

interface AppShellProps {
  data: ArduinoData | null;
  connectionStatus: ConnectionStatus;
  view: ViewKey;
  onViewChange: (view: ViewKey) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  data,
  connectionStatus,
  view,
  onViewChange,
  children,
}) => {
  const isDark = data?.pocaLuz === true;

  return (
    <div className={`app-shell ${isDark ? "theme-dark" : "theme-light"}`}>
      <Sidebar view={view} onViewChange={onViewChange} />
      <main className="app-main">
        <Header data={data} connectionStatus={connectionStatus} />
        {children}
      </main>
    </div>
  );
};
