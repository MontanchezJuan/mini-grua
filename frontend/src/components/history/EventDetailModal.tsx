import React from "react";
import { EventRecord } from "../../types/arduino";

interface EventDetailModalProps {
  event: EventRecord | null;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <article className="event-modal" onClick={(click) => click.stopPropagation()}>
        <div className="panel-title-row">
          <h3>Detalle de evento</h3>
          <button onClick={onClose}>Cerrar</button>
        </div>
        <dl className="detail-grid">
          <dt>Tipo</dt>
          <dd>{event.type}</dd>
          <dt>Estado</dt>
          <dd>{event.status}</dd>
          <dt>Origen</dt>
          <dd>{event.source}</dd>
          <dt>Inicio</dt>
          <dd>{new Date(event.startedAt).toLocaleString()}</dd>
          <dt>Fin</dt>
          <dd>{event.endedAt ? new Date(event.endedAt).toLocaleString() : "Activo"}</dd>
          <dt>Duracion</dt>
          <dd>{event.durationSeconds?.toFixed(2) || "0.00"}s</dd>
          <dt>Valor inicial/final</dt>
          <dd>
            {event.initialValue ?? "--"} / {event.finalValue ?? "--"}
          </dd>
          <dt>Min / Max / Prom</dt>
          <dd>
            {event.minValue ?? "--"} / {event.maxValue ?? "--"} /{" "}
            {event.avgValue?.toFixed(2) ?? "--"}
          </dd>
        </dl>
        <pre>{JSON.stringify(event.metadata || {}, null, 2)}</pre>
      </article>
    </div>
  );
};
