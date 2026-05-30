import React, { useState } from "react";
import "./App.css";
import { useArduinoSocket } from "./hooks/useArduinoSocket";
import { MetricButton } from "./components/MetricButton";
import { MetricPanel } from "./components/MetricPanel";
import { ControlPanel } from "./components/ControlPanel";
import { StatusCard } from "./components/StatusCard";
import { ArduinoData } from "./types/arduino";

/**
 * Componente principal de la aplicación
 */
function App() {
  const { data, connectionStatus, sendCommand } = useArduinoSocket();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Obtener valor y descripción de la métrica seleccionada
  const getMetricInfo = (data: ArduinoData | null) => {
    if (!data || !selectedMetric) {
      return { value: "—", unit: "", description: "", color: "#3498db" };
    }

    const metrics: Record<
      string,
      {
        value: string | number;
        unit: string;
        description: string;
        color: string;
      }
    > = {
      distancia: {
        value: data.distancia.toFixed(1),
        unit: " cm",
        description: "Distancia medida por el sensor ultrasónico",
        color: "#3498db",
      },
      gas: {
        value: data.gas,
        unit: "",
        description: "Nivel de gas detectado (0-4095)",
        color: "#e74c3c",
      },
      luz: {
        value: data.luz,
        unit: "",
        description: "Nivel de luz detectado (0-4095)",
        color: "#f39c12",
      },
      servoV: {
        value: data.servoV,
        unit: "°",
        description: "Posición del servo vertical",
        color: "#9b59b6",
      },
      pocaLuz: {
        value: data.pocaLuz ? "POCA LUZ" : "LUZ OK",
        unit: "",
        description: "Estado de iluminación",
        color: data.pocaLuz ? "#f39c12" : "#27ae60",
      },
      gasDetectado: {
        value: data.gasDetectado ? "GAS DETECTADO" : "NORMAL",
        unit: "",
        description: "Estado de detección de gas",
        color: data.gasDetectado ? "#e74c3c" : "#27ae60",
      },
      ventilador: {
        value: data.ventilador ? "ENCENDIDO" : "APAGADO",
        unit: "",
        description: "Estado del ventilador",
        color: data.ventilador ? "#27ae60" : "#95a5a6",
      },
      buzzer: {
        value: data.buzzer ? "SONANDO" : "SILENCIO",
        unit: "",
        description: "Estado del buzzer",
        color: data.buzzer ? "#e74c3c" : "#27ae60",
      },
      obstaculo: {
        value: data.obstaculo ? "OBSTACULO" : "LIBRE",
        unit: "",
        description: "Estado de detección de obstáculo",
        color: data.obstaculo ? "#e74c3c" : "#27ae60",
      },
    };

    return (
      metrics[selectedMetric] || {
        value: "—",
        unit: "",
        description: "",
        color: "#3498db",
      }
    );
  };

  const metricInfo = getMetricInfo(data);

  return (
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">🏗️ Mini Grúa Web</h1>
        <p className="app-subtitle">Visualización y Control en Tiempo Real</p>
      </div>

      <div className="app-content">
        {/* Sección izquierda */}
        <div className="app-section-left">
          {/* Estado de conexión */}
          <StatusCard connectionStatus={connectionStatus} />

          {/* Panel principal de métrica */}
          <MetricPanel
            selectedMetric={selectedMetric}
            value={metricInfo.value}
            unit={metricInfo.unit}
            description={metricInfo.description}
            color={metricInfo.color}
          />

          {/* Botones de métricas */}
          <div className="app-section">
            <h3 className="app-section-title">Sensores y Estados</h3>
            <div className="metrics-grid">
              <MetricButton
                label="Distancia"
                value={`${data?.distancia.toFixed(1) || "—"} cm`}
                isSelected={selectedMetric === "distancia"}
                onClick={() => setSelectedMetric("distancia")}
                color="#3498db"
              />
              <MetricButton
                label="Gas"
                value={data?.gas || 0}
                isSelected={selectedMetric === "gas"}
                onClick={() => setSelectedMetric("gas")}
                color="#e74c3c"
              />
              <MetricButton
                label="Luz"
                value={data?.luz || 0}
                isSelected={selectedMetric === "luz"}
                onClick={() => setSelectedMetric("luz")}
                color="#f39c12"
              />
              <MetricButton
                label="Servo V"
                value={`${data?.servoV || 0}°`}
                isSelected={selectedMetric === "servoV"}
                onClick={() => setSelectedMetric("servoV")}
                color="#9b59b6"
              />
              <MetricButton
                label="Estado Luz"
                value={data?.pocaLuz ? "POCA LUZ" : "LUZ OK"}
                isSelected={selectedMetric === "pocaLuz"}
                onClick={() => setSelectedMetric("pocaLuz")}
                color={data?.pocaLuz ? "#f39c12" : "#27ae60"}
              />
              <MetricButton
                label="Gas Detector"
                value={data?.gasDetectado ? "DETECTADO" : "NORMAL"}
                isSelected={selectedMetric === "gasDetectado"}
                onClick={() => setSelectedMetric("gasDetectado")}
                color={data?.gasDetectado ? "#e74c3c" : "#27ae60"}
              />
              <MetricButton
                label="Ventilador"
                value={data?.ventilador ? "ON" : "OFF"}
                isSelected={selectedMetric === "ventilador"}
                onClick={() => setSelectedMetric("ventilador")}
                color={data?.ventilador ? "#27ae60" : "#95a5a6"}
              />
              <MetricButton
                label="Buzzer"
                value={data?.buzzer ? "ON" : "OFF"}
                isSelected={selectedMetric === "buzzer"}
                onClick={() => setSelectedMetric("buzzer")}
                color={data?.buzzer ? "#e74c3c" : "#27ae60"}
              />
            </div>
          </div>
        </div>

        {/* Sección derecha - Panel de control */}
        <div className="control-section">
          <ControlPanel
            onSendCommand={sendCommand}
            isConnected={
              connectionStatus.backendConnected &&
              connectionStatus.serialConnected
            }
          />
        </div>
      </div>
    </div>
  );
}

export default App;
