import React, { useEffect, useState } from "react";
import { ArduinoData } from "../../types/arduino";

interface RecordingBannerProps {
  data: ArduinoData | null;
}

export const RecordingBanner: React.FC<RecordingBannerProps> = ({ data }) => {
  const recording = data?.grabando || data?.ps5Mode === "GRABANDO";
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (recording && !startedAt) setStartedAt(Date.now());
    if (!recording && startedAt) {
      setElapsed(0);
      setStartedAt(null);
    }
  }, [recording, startedAt]);

  useEffect(() => {
    if (!recording || !startedAt) return;
    const interval = window.setInterval(() => {
      setElapsed((Date.now() - startedAt) / 1000);
    }, 250);
    return () => window.clearInterval(interval);
  }, [recording, startedAt]);

  if (!recording && data?.ps5Mode !== "REPRODUCIENDO") return null;

  return (
    <div className={`recording-banner ${recording ? "recording" : "playing"}`}>
      {recording ? (
        <>
          <span className="rec-dot" />
          <strong>Grabando movimiento...</strong>
          <span>{elapsed.toFixed(1)}s</span>
          <span>{data?.framesGrabados || 0} frames</span>
        </>
      ) : (
        <strong>Reproduciendo movimiento guardado</strong>
      )}
    </div>
  );
};
