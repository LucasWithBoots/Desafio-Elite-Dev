import { Armchair, CalendarDays, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEvent } from "@/features/event-catalog/hooks/useEvent";
import { Badge } from "@/shared/components/Badge";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { checkoutPath } from "@/shared/constants/routes";
import { formatCurrency } from "@/shared/lib/formatCurrency";
import { formatDateTime } from "@/shared/lib/formatDate";

export function EventDetailsPage() {
  const { eventId } = useParams();
  const { data: event, isLoading } = useEvent(eventId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!event) {
    return (
      <EmptyState
        title="Evento nao encontrado"
        description="Verifique se o evento ainda esta publicado ou volte para a lista."
      />
    );
  }

  return (
    <section className="detail-layout">
      {event.imageUrl ? <img className="detail-cover" src={event.imageUrl} alt="" /> : null}

      <div className="detail-content">
        <Badge tone="success">Disponivel</Badge>
        <h1>{event.title}</h1>
        <p>{event.description}</p>

        <dl className="metadata-list metadata-list-large">
          <div>
            <CalendarDays size={18} aria-hidden="true" />
            <span>{formatDateTime(event.startsAt)}</span>
          </div>
          <div>
            <MapPin size={18} aria-hidden="true" />
            <span>{event.venueName}</span>
          </div>
          <div>
            <Armchair size={18} aria-hidden="true" />
            <span>{event.availableTickets} lugares disponiveis</span>
          </div>
        </dl>

        <div className="purchase-panel">
          <span>A partir de</span>
          <strong>{formatCurrency(event.price, event.currency)}</strong>
          <Link className="button button-primary" to={checkoutPath(event.id)}>
            Escolher assento
          </Link>
        </div>
      </div>
    </section>
  );
}
