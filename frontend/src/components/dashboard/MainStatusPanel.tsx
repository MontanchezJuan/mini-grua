import React from "react";
import { ArduinoData } from "../../types/arduino";

interface MainStatusPanelProps {
  data: ArduinoData | null;
}

export const MainStatusPanel: React.FC<MainStatusPanelProps> = ({ data }) => {
  const danger = data?.obstaculo || data?.buzzer;
  const gas = data?.gasDetectado;

  return (
    <section className={`main-status-panel ${danger ? "danger" : ""} ${gas ? "gas" : ""}`}>
      <div>
        <p className="eyebrow">Estado operacional</p>
        <h2>
          {danger
            ? "Objeto demasiado cerca"
            : gas
              ? "Gas detectado"
              : "Sistema en monitoreo"}
        </h2>
        <p>
          {danger
            ? "Buzzer activo por proximidad"
            : gas
              ? "Ventilador activado"
              : "Sensores dentro de parametros esperados"}
        </p>
      </div>
      <div className="status-gauge">
        <span>{data?.distancia?.toFixed(1) || "--"}</span>
        <small>cm</small>
      </div>
    </section>
  );
};
