import React from "react";
import "../styles/MetricPanel.css";

interface MetricPanelProps {
  selectedMetric: string | null;
  value: string | number;
  unit?: string;
  description?: string;
  color?: string;
}

/**
 * Panel que muestra el valor seleccionado en formato grande
 */
export const MetricPanel: React.FC<MetricPanelProps> = ({
  selectedMetric,
  value,
  unit = "",
  description = "",
  color = "#3498db",
}) => {
  if (!selectedMetric) {
    return (
      <div className="metric-panel empty">
        <div className="metric-panel-placeholder">
          Selecciona una métrica para ver su valor
        </div>
      </div>
    );
  }

  return (
    <div className="metric-panel" style={{ borderColor: color }}>
      <div className="metric-panel-header">
        <h2 className="metric-panel-title">{selectedMetric}</h2>
      </div>

      <div className="metric-panel-value" style={{ color: color }}>
        {value}
        {unit && <span className="metric-panel-unit">{unit}</span>}
      </div>

      {description && (
        <div className="metric-panel-description">{description}</div>
      )}
    </div>
  );
};
