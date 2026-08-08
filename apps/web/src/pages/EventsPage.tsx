import { CalendarDays, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useEvents } from "@/features/event-catalog/hooks/useEvents";
import { Badge } from "@/shared/components/Badge";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { eventDetailsPath } from "@/shared/constants/routes";
import { formatCurrency } from "@/shared/lib/formatCurrency";
import { formatDateTime } from "@/shared/lib/formatDate";

export function EventsPage() {
  const { data: events, isLoading } = useEvents();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!events?.length) {
    return (
      <EmptyState
        title="Nenhum evento publicado"
        description="Quando o organizador publicar eventos, eles aparecem aqui."
      />
    );
  }

  return (
    <section className="stack">
      <div className="page-heading">
        <span className="eyebrow">Cliente</span>
        <h1>Eventos publicados</h1>
        <p>Primeira tela do fluxo de compra: encontrar evento, escolher assento e receber ingresso.</p>
      </div>

      <div className="event-grid">
        {events.map((event) => (
          <article className="event-card" key={event.id}>
            {event.imageUrl ? <img src={event.imageUrl} alt="" /> : null}
            <div className="event-card-body">
              <div className="event-card-meta">
                <Badge tone={event.status === "published" ? "success" : "neutral"}>
                  {event.status}
                </Badge>
                <strong>{formatCurrency(event.price, event.currency)}</strong>
              </div>

              <h2>{event.title}</h2>
              <p>{event.description}</p>

              <dl className="metadata-list">
                <div>
                  <CalendarDays size={16} aria-hidden="true" />
                  <span>{formatDateTime(event.startsAt)}</span>
                </div>
                <div>
                  <MapPin size={16} aria-hidden="true" />
                  <span>{event.venueName}</span>
                </div>
              </dl>

              <Link className="button button-primary" to={eventDetailsPath(event.id)}>
                Ver evento
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
