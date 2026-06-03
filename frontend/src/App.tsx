import { useMemo, useState } from "react";
import "./App.css";
import { useArduinoSocket } from "./hooks/useArduinoSocket";
import { ArduinoData } from "./types/arduino";
import { AppShell } from "./components/layout/AppShell";
import { ViewKey } from "./components/layout/Sidebar";
import { MainStatusPanel } from "./components/dashboard/MainStatusPanel";
import { SensorCard } from "./components/dashboard/SensorCard";
import { CraneStatusPanel } from "./components/dashboard/CraneStatusPanel";
import { EventTimeline } from "./components/dashboard/EventTimeline";
import { RecordingBanner } from "./components/dashboard/RecordingBanner";
import { VisualEffectsLayer } from "./components/dashboard/VisualEffectsLayer";
import { ControlPanel } from "./components/controls/ControlPanel";
import { DevTestPanel } from "./components/controls/DevTestPanel";
import { EventsPage } from "./components/history/EventsPage";

function App() {
  const { data, events, connectionStatus, sendCommand, setSimulatedData } =
    useArduinoSocket();
  const [view, setView] = useState<ViewKey>("dashboard");
  const showDevPanel = import.meta.env.VITE_ENABLE_DEV_TEST_PANEL === "true";
  const isCommandConnected =
    connectionStatus.backendConnected && connectionStatus.serialConnected;

  const fallbackData = useMemo<ArduinoData>(
    () => ({
      distancia: 0,
      gas: 0,
      luz: 0,
      servoV: 90,
      pocaLuz: false,
      gasDetectado: false,
      ventilador: false,
      buzzer: false,
      obstaculo: false,
      servoBaseDir: 0,
      ps5Mode: "NORMAL",
      grabando: false,
      reproduciendo: false,
      framesGrabados: 0,
    }),
    [],
  );

  const currentData = data || fallbackData;

  return (
    <AppShell
      data={currentData}
      connectionStatus={connectionStatus}
      view={view}
      onViewChange={setView}
    >
      <VisualEffectsLayer data={currentData} />
      {view === "history" ? (
        <EventsPage />
      ) : (
        <div className="dashboard-grid">
          <RecordingBanner data={currentData} />
          <MainStatusPanel data={currentData} />
          <div className="sensor-grid">
            <SensorCard
              label="Distancia"
              value={currentData.distancia.toFixed(1)}
              unit="cm"
              state={currentData.obstaculo ? "danger" : "normal"}
              detail={currentData.obstaculo ? "Objeto demasiado cerca" : "Area libre"}
            />
            <SensorCard
              label="Gas"
              value={currentData.gas}
              state={currentData.gasDetectado ? "warning" : "normal"}
              detail={currentData.gasDetectado ? "Gas detectado" : "Nivel estable"}
            />
            <SensorCard
              label="Luz"
              value={currentData.luz}
              state={currentData.pocaLuz ? "info" : "normal"}
              detail={currentData.pocaLuz ? "Poca luz" : "Luz suficiente"}
            />
            <SensorCard
              label="Buzzer"
              value={currentData.buzzer ? "Activo" : "Silencio"}
              state={currentData.buzzer ? "danger" : "normal"}
              detail={currentData.buzzer ? "Buzzer activo por proximidad" : "Sin alarma"}
            />
          </div>
          <CraneStatusPanel data={currentData} />
          <ControlPanel onSendCommand={sendCommand} isConnected={isCommandConnected} />
          <EventTimeline events={events} />
          {showDevPanel && (
            <DevTestPanel data={currentData} onSimulate={setSimulatedData} />
          )}
        </div>
      )}
    </AppShell>
  );
}

export default App;
