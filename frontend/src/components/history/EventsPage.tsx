import React, { useEffect, useState } from "react";
import { DatabaseHealth, EventRecord, EventType } from "../../types/arduino";
import { EventDetailModal } from "./EventDetailModal";

const labels: Record<EventType | "all", string> = {
  all: "Todos",
  proximity: "Proximidad",
  gas: "Gas",
  light: "Luz",
  ps5_recording: "Grabacion PS5",
};

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [filter, setFilter] = useState<EventType | "all">("all");
  const [database, setDatabase] = useState<DatabaseHealth | null>(null);
  const [selected, setSelected] = useState<EventRecord | null>(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  useEffect(() => {
    const params = new URLSearchParams({ limit: "100" });
    if (filter !== "all") params.set("type", filter);

    fetch(`${backendUrl}/api/events?${params.toString()}`)
      .then((response) => response.json())
      .then((body: { events?: EventRecord[]; database?: DatabaseHealth }) => {
        setEvents(body.events || []);
        setDatabase(body.database || null);
      })
      .catch(() => {
        setEvents([]);
        setDatabase({
          enabled: false,
          configured: false,
          connected: false,
          message: "No se pudo conectar al backend",
        });
      });
  }, [backendUrl, filter]);

  return (
    <section className="history-page">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Firestore</p>
          <h2>Historial de eventos</h2>
        </div>
        <div className="filter-row">
          {(Object.keys(labels) as Array<EventType | "all">).map((key) => (
            <button
              key={key}
              className={filter === key ? "active" : ""}
              onClick={() => setFilter(key)}
            >
              {labels[key]}
            </button>
          ))}
        </div>
      </div>

      {database && !database.connected && (
        <div className="database-warning">
          Base de datos no configurada. Configura Firebase en el backend para ver el historial.
        </div>
      )}

      <div className="event-table">
        <div className="event-table-head">
          <span>Tipo</span>
          <span>Inicio</span>
          <span>Fin</span>
          <span>Duracion</span>
          <span>Estado</span>
          <span>Valor</span>
          <span />
        </div>
        {events.map((event) => (
          <article key={event.id || event.startedAt} className="event-row">
            <span>{labels[event.type]}</span>
            <span>{new Date(event.startedAt).toLocaleString()}</span>
            <span>{event.endedAt ? new Date(event.endedAt).toLocaleString() : "Activo"}</span>
            <span>{event.durationSeconds?.toFixed(1) || "0.0"}s</span>
            <span>{event.status}</span>
            <span>{event.finalValue ?? event.initialValue ?? "--"}</span>
            <button onClick={() => setSelected(event)}>Detalle</button>
          </article>
        ))}
        {events.length === 0 && <div className="empty-table">No hay eventos para mostrar</div>}
      </div>

      <EventDetailModal event={selected} onClose={() => setSelected(null)} />
    </section>
  );
};
