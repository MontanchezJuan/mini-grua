import React from "react";

interface SensorCardProps {
  label: string;
  value: string | number;
  unit?: string;
  state: "normal" | "warning" | "danger" | "info";
  detail: string;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  label,
  value,
  unit = "",
  state,
  detail,
}) => (
  <section className={`sensor-card ${state}`}>
    <div className="sensor-card-top">
      <span>{label}</span>
      <span className="sensor-dot" />
    </div>
    <strong>
      {value}
      {unit && <small>{unit}</small>}
    </strong>
    <p>{detail}</p>
  </section>
);
