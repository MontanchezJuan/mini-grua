import React from "react";
import { ArduinoData } from "../../types/arduino";

interface CraneStatusPanelProps {
  data: ArduinoData | null;
}

export const CraneStatusPanel: React.FC<CraneStatusPanelProps> = ({ data }) => {
  const mode = data?.ps5Mode || "NORMAL";

  return (
    <section className="crane-panel">
      <div className="panel-title-row">
        <h3>Grua y PS5</h3>
        <span className={`mode-chip ${mode.toLowerCase()}`}>{mode}</span>
      </div>
      <div className="crane-grid">
        <div>
          <span>Servo vertical</span>
          <strong>{data?.servoV ?? "--"} deg</strong>
        </div>
        <div>
          <span>Direccion base</span>
          <strong>{data?.servoBaseDir ?? 0}</strong>
        </div>
        <div>
          <span>Frames</span>
          <strong>{data?.framesGrabados ?? 0}</strong>
        </div>
        <div>
          <span>Rele</span>
          <strong>{data?.ventilador ? "Activo" : "Apagado"}</strong>
        </div>
      </div>
      {mode === "REPRODUCIENDO" && (
        <div className="playback-strip">Reproduciendo movimiento guardado</div>
      )}
    </section>
  );
};
