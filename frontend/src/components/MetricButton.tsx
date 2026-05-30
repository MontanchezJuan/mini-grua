import React from "react";
import "../styles/MetricButton.css";

interface MetricButtonProps {
  label: string;
  value: string | number;
  isSelected: boolean;
  onClick: () => void;
  icon?: string;
  color?: string;
}

/**
 * Botón para seleccionar una métrica específica
 */
export const MetricButton: React.FC<MetricButtonProps> = ({
  label,
  value,
  isSelected,
  onClick,
  color = "#3498db",
}) => {
  return (
    <button
      className={`metric-button ${isSelected ? "selected" : ""}`}
      onClick={onClick}
      style={{
        borderColor: isSelected ? color : "#ddd",
        color: isSelected ? color : "#666",
      }}
    >
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </button>
  );
};
