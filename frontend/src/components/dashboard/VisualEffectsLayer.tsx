import React from "react";
import { ArduinoData } from "../../types/arduino";

interface VisualEffectsLayerProps {
  data: ArduinoData | null;
}

export const VisualEffectsLayer: React.FC<VisualEffectsLayerProps> = ({ data }) => (
  <div className="visual-effects" aria-hidden="true">
    {(data?.obstaculo || data?.buzzer) && <div className="proximity-pulse" />}
    {data?.gasDetectado && <div className="gas-wash" />}
  </div>
);
