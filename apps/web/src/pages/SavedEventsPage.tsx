import { Bookmark, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useEvents } from "@/features/event-catalog/hooks/useEvents";
import { useSavedEvents } from "@/features/saved-events/hooks/useSavedEvents";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { eventDetailsPath, routes } from "@/shared/constants/routes";
import { formatCurrency } from "@/shared/lib/formatCurrency";
import { formatDateTime } from "@/shared/lib/formatters";

export function SavedEventsPage() {
  const { data: events, isLoading, error } = useEvents();
  const { savedEventIds, toggleSavedEvent } = useSavedEvents();
  const savedEvents =
    events?.filter((event) => savedEventIds.includes(event.id)) ?? [];

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <EmptyState
        title="Nao foi possivel carregar seus salvos"
        description={
          error instanceof Error
            ? error.message
            : "Tente novamente em instantes."
        }
      />
    );
  }

  if (!savedEvents.length) {
    return (
      <EmptyState
        title="Nenhum evento salvo"
        description="Salve eventos na home ou na busca para encontra-los aqui depois."
        action={
          <Link className="button button-primary" to={routes.events}>
            Ver eventos
          </Link>
        }
      />
    );
  }

  return (
    <section className="app-screen saved-events-screen">
      <header className="lime-page-header">
        <h1>Eventos salvos</h1>
        <p>Eventos que voce separou para decidir depois.</p>
      </header>

      <div className="search-result-list">
        {savedEvents.map((event) => (
          <article className="search-result-row" key={event.id}>
            <div className="search-result-image">
              <Link
                className="search-result-image-link"
                to={eventDetailsPath(event.id)}
                aria-label={`Abrir ${event.title}`}
              >
                {event.imageUrl ? <img src={event.imageUrl} alt="" /> : null}
              </Link>
              <button
                className="search-save-button save-button-active"
                type="button"
                aria-label={`Remover ${event.title} dos salvos`}
                onClick={(clickEvent) => {
                  clickEvent.preventDefault();
                  clickEvent.stopPropagation();
                  toggleSavedEvent(event.id);
                }}
              >
                <Bookmark size={15} fill="currentColor" aria-hidden="true" />
              </button>
            </div>

            <Link
              className="search-result-content"
              to={eventDetailsPath(event.id)}
            >
              <strong>{event.title}</strong>
              <span>
                <MapPin size={13} aria-hidden="true" />
                {event.venueName}
              </span>
              <span>{formatDateTime(event.startsAt)}</span>
              <div className="result-tags">
                <span className="app-pill">
                  {formatCurrency(event.price, event.currency)}
                </span>
                <span className="app-pill app-pill-pink">
                  {event.category ?? event.genre ?? "Evento"}
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
