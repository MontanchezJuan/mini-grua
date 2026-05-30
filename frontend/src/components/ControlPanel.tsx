import React, { useState } from "react";
import "../styles/ControlPanel.css";
import { ArduinoCommand } from "../types/arduino";

interface ControlPanelProps {
  onSendCommand: (command: ArduinoCommand) => Promise<boolean>;
  isConnected: boolean;
}

/**
 * Panel de control con botones para enviar comandos al Arduino
 */
export const ControlPanel: React.FC<ControlPanelProps> = ({
  onSendCommand,
  isConnected,
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleCommand = async (command: ArduinoCommand) => {
    if (!isConnected) {
      setFeedback({ type: "error", message: "No conectado al backend" });
      return;
    }

    setLoading(command.type);
    const success = await onSendCommand(command);
    setLoading(null);

    if (success) {
      setFeedback({
        type: "success",
        message: `Comando enviado: ${command.type}`,
      });
    } else {
      setFeedback({
        type: "error",
        message: `Error al enviar: ${command.type}`,
      });
    }

    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="control-panel">
      <h3 className="control-panel-title">Control Manual</h3>

      {feedback && (
        <div className={`control-panel-feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <div className="control-groups">
        {/* Ventilador */}
        <div className="control-group">
          <h4>Ventilador</h4>
          <div className="button-row">
            <button
              className="control-button success"
              onClick={() => handleCommand({ type: "FAN_ON" })}
              disabled={!isConnected || loading === "FAN_ON"}
            >
              {loading === "FAN_ON" ? "..." : "Encender"}
            </button>
            <button
              className="control-button danger"
              onClick={() => handleCommand({ type: "FAN_OFF" })}
              disabled={!isConnected || loading === "FAN_OFF"}
            >
              {loading === "FAN_OFF" ? "..." : "Apagar"}
            </button>
          </div>
        </div>

        {/* Buzzer */}
        <div className="control-group">
          <h4>Buzzer</h4>
          <div className="button-row">
            <button
              className="control-button success"
              onClick={() => handleCommand({ type: "BUZZER_ON" })}
              disabled={!isConnected || loading === "BUZZER_ON"}
            >
              {loading === "BUZZER_ON" ? "..." : "Encender"}
            </button>
            <button
              className="control-button danger"
              onClick={() => handleCommand({ type: "BUZZER_OFF" })}
              disabled={!isConnected || loading === "BUZZER_OFF"}
            >
              {loading === "BUZZER_OFF" ? "..." : "Apagar"}
            </button>
          </div>
        </div>

        {/* Servo Vertical */}
        <div className="control-group">
          <h4>Servo Vertical</h4>
          <div className="button-row">
            <button
              className="control-button info"
              onClick={() =>
                handleCommand({ type: "SERVO_VERTICAL", value: 45 })
              }
              disabled={!isConnected || loading === "SERVO_VERTICAL"}
            >
              {loading === "SERVO_VERTICAL" ? "..." : "45°"}
            </button>
            <button
              className="control-button info"
              onClick={() =>
                handleCommand({ type: "SERVO_VERTICAL", value: 90 })
              }
              disabled={!isConnected || loading === "SERVO_VERTICAL"}
            >
              {loading === "SERVO_VERTICAL" ? "..." : "90°"}
            </button>
            <button
              className="control-button info"
              onClick={() =>
                handleCommand({ type: "SERVO_VERTICAL", value: 135 })
              }
              disabled={!isConnected || loading === "SERVO_VERTICAL"}
            >
              {loading === "SERVO_VERTICAL" ? "..." : "135°"}
            </button>
          </div>
        </div>

        {/* Base */}
        <div className="control-group">
          <h4>Base</h4>
          <div className="button-row">
            <button
              className="control-button primary"
              onClick={() => handleCommand({ type: "BASE_LEFT" })}
              disabled={!isConnected || loading === "BASE_LEFT"}
            >
              {loading === "BASE_LEFT" ? "..." : "← Izquierda"}
            </button>
            <button
              className="control-button primary"
              onClick={() => handleCommand({ type: "BASE_STOP" })}
              disabled={!isConnected || loading === "BASE_STOP"}
            >
              {loading === "BASE_STOP" ? "..." : "Parar"}
            </button>
            <button
              className="control-button primary"
              onClick={() => handleCommand({ type: "BASE_RIGHT" })}
              disabled={!isConnected || loading === "BASE_RIGHT"}
            >
              {loading === "BASE_RIGHT" ? "..." : "Derecha →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
