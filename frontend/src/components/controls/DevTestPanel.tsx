import React, { useState } from "react";
import { ArduinoData, EventType } from "../../types/arduino";

interface DevTestPanelProps {
  data: ArduinoData | null;
  onSimulate: (data: ArduinoData) => void;
}

const defaultData: ArduinoData = {
  distancia: 42,
  gas: 900,
  luz: 2600,
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
};

export const DevTestPanel: React.FC<DevTestPanelProps> = ({ data, onSimulate }) => {
  const [draft, setDraft] = useState<ArduinoData>(data || defaultData);
  const [eventType, setEventType] = useState<EventType>("proximity");
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  const update = (patch: Partial<ArduinoData>) => {
    const next = { ...draft, ...patch };
    if (patch.ps5Mode === "GRABANDO") {
      next.grabando = true;
      next.reproduciendo = false;
    }
    if (patch.ps5Mode === "REPRODUCIENDO") {
      next.grabando = false;
      next.reproduciendo = true;
    }
    if (patch.ps5Mode === "NORMAL") {
      next.grabando = false;
      next.reproduciendo = false;
    }
    setDraft(next);
    onSimulate(next);
  };

  const createTestEvent = async () => {
    await fetch(`${backendUrl}/api/events/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: eventType,
        durationMs: 3200,
        initialValue: draft.distancia,
        finalValue: draft.distancia,
        metadata: { ...draft, simulated: true },
      }),
    });
  };

  return (
    <section className="dev-panel">
      <div className="panel-title-row">
        <h3>Panel de pruebas visuales</h3>
        <span>dev</span>
      </div>
      <div className="dev-grid">
        {(["pocaLuz", "obstaculo", "gasDetectado", "ventilador", "buzzer"] as const).map((key) => (
          <label key={key} className="toggle-row">
            <input
              type="checkbox"
              checked={Boolean(draft[key])}
              onChange={(event) => update({ [key]: event.target.checked })}
            />
            <span>{key}</span>
          </label>
        ))}
        <label>
          PS5
          <select
            value={draft.ps5Mode || "NORMAL"}
            onChange={(event) =>
              update({ ps5Mode: event.target.value as ArduinoData["ps5Mode"] })
            }
          >
            <option value="NORMAL">NORMAL</option>
            <option value="GRABANDO">GRABANDO</option>
            <option value="REPRODUCIENDO">REPRODUCIENDO</option>
          </select>
        </label>
        <label>
          Distancia
          <input
            type="number"
            value={draft.distancia}
            onChange={(event) => update({ distancia: Number(event.target.value) })}
          />
        </label>
        <label>
          Gas
          <input
            type="number"
            value={draft.gas}
            onChange={(event) => update({ gas: Number(event.target.value) })}
          />
        </label>
        <label>
          Luz
          <input
            type="number"
            value={draft.luz}
            onChange={(event) => update({ luz: Number(event.target.value) })}
          />
        </label>
        <label>
          Frames
          <input
            type="number"
            value={draft.framesGrabados || 0}
            onChange={(event) => update({ framesGrabados: Number(event.target.value) })}
          />
        </label>
      </div>
      <div className="test-event-row">
        <select value={eventType} onChange={(event) => setEventType(event.target.value as EventType)}>
          <option value="proximity">Proximidad</option>
          <option value="gas">Gas</option>
          <option value="light">Luz</option>
          <option value="ps5_recording">Grabacion PS5</option>
        </select>
        <button onClick={createTestEvent}>Crear evento test</button>
      </div>
    </section>
  );
};
