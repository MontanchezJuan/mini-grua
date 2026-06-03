import React, { useState } from "react";
import { ArduinoCommand } from "../../types/arduino";

interface ControlPanelProps {
  onSendCommand: (command: ArduinoCommand) => Promise<boolean>;
  isConnected: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onSendCommand,
  isConnected,
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleCommand = async (command: ArduinoCommand) => {
    setLoading(command.type);
    const success = await onSendCommand(command);
    setLoading(null);
    setFeedback(success ? `Comando enviado: ${command.type}` : "No se pudo enviar el comando");
    window.setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <section className="control-panel-modern">
      <div className="panel-title-row">
        <h3>Control manual</h3>
        <span>{isConnected ? "listo" : "sin arduino"}</span>
      </div>
      {feedback && <div className="inline-feedback">{feedback}</div>}
      <div className="control-grid">
        <button disabled={!isConnected || loading === "FAN_ON"} onClick={() => handleCommand({ type: "FAN_ON" })}>
          Ventilador ON
        </button>
        <button disabled={!isConnected || loading === "FAN_OFF"} onClick={() => handleCommand({ type: "FAN_OFF" })}>
          Ventilador OFF
        </button>
        <button disabled={!isConnected || loading === "BUZZER_ON"} onClick={() => handleCommand({ type: "BUZZER_ON" })}>
          Buzzer ON
        </button>
        <button disabled={!isConnected || loading === "BUZZER_OFF"} onClick={() => handleCommand({ type: "BUZZER_OFF" })}>
          Buzzer OFF
        </button>
        <button disabled={!isConnected || loading === "BASE_LEFT"} onClick={() => handleCommand({ type: "BASE_LEFT" })}>
          Base izquierda
        </button>
        <button disabled={!isConnected || loading === "BASE_RIGHT"} onClick={() => handleCommand({ type: "BASE_RIGHT" })}>
          Base derecha
        </button>
        <button disabled={!isConnected || loading === "BASE_STOP"} onClick={() => handleCommand({ type: "BASE_STOP" })}>
          Parar base
        </button>
        <button disabled={!isConnected || loading === "SERVO_VERTICAL"} onClick={() => handleCommand({ type: "SERVO_VERTICAL", value: 90 })}>
          Servo 90
        </button>
      </div>
    </section>
  );
};
