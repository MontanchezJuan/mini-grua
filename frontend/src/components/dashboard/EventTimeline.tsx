import React from "react";
import { EventRecord } from "../../types/arduino";

interface EventTimelineProps {
  events: EventRecord[];
}

const labels: Record<EventRecord["type"], string> = {
  proximity: "Proximidad",
  gas: "Gas",
  light: "Poca luz",
  ps5_recording: "Grabacion PS5",
};

export const EventTimeline: React.FC<EventTimelineProps> = ({ events }) => (
  <section className="timeline-panel">
    <div className="panel-title-row">
      <h3>Eventos en vivo</h3>
      <span>{events.length}</span>
    </div>
    <div className="timeline-list">
      {events.length === 0 && <p className="empty-state">Sin eventos recientes</p>}
      {events.map((event) => (
        <article key={event.id || `${event.type}-${event.startedAt}`} className="timeline-item">
          <span className={`event-marker ${event.type}`} />
          <div>
            <strong>{labels[event.type]}</strong>
            <p>
              {event.status} - {new Date(event.startedAt).toLocaleTimeString()}
            </p>
          </div>
          <span>{event.durationSeconds?.toFixed(1) || "0.0"}s</span>
        </article>
      ))}
    </div>
  </section>
);
