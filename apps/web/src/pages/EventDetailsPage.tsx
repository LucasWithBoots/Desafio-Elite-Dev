import { ArrowLeft, CalendarDays, MapPin, Sparkles, Ticket, UsersRound, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEvent } from "@/features/event-catalog/hooks/useEvent";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { checkoutPath } from "@/shared/constants/routes";
import { formatCurrency } from "@/shared/lib/formatCurrency";

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

  const date = new Date(event.startsAt);

  return (
    <section className="app-screen event-detail-screen">
      <header className="event-detail-hero">
        <div className="detail-actions">
          <Link className="round-action" to="/events" aria-label="Voltar para eventos">
            <ArrowLeft size={18} aria-hidden="true" />
          </Link>
          <button className="round-action" type="button" aria-label="Fechar detalhe">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="event-detail-art">
          {event.imageUrl ? <img src={event.imageUrl} alt="" /> : null}
        </div>

        <div className="event-detail-copy">
          <span className="app-pill app-pill-blue">Experiencia ao vivo</span>
          <h1>{event.title}</h1>
          <p>{event.description}</p>
        </div>
      </header>

      <div className="app-content">
        <div className="benefit-grid">
          <article className="benefit-item">
            <CalendarDays size={18} aria-hidden="true" />
            <strong>{formatDayMonth(date)}</strong>
            <span>{formatTime(date)}</span>
          </article>
          <article className="benefit-item">
            <UsersRound size={18} aria-hidden="true" />
            <strong>{event.availableTickets}</strong>
            <span>lugares livres</span>
          </article>
        </div>

        <section className="info-card">
          <div>
            <MapPin size={18} aria-hidden="true" />
            <span>{event.venueName}</span>
          </div>
          <p>{event.address ?? "Endereco confirmado apos a compra"}</p>
        </section>

        <section className="about-card" aria-labelledby="event-about-title">
          <span className="eyebrow">Sobre</span>
          <h2 id="event-about-title">Sobre</h2>
          <p>{event.about ?? event.description}</p>
        </section>

        <section className="ticket-option-section" aria-labelledby="ticket-option-title">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Ingressos</span>
              <h2 id="ticket-option-title">Escolha seu ingresso</h2>
            </div>
            <span className="app-pill">Assento marcado</span>
          </div>

          <div className="ticket-option-grid">
            <article className="ticket-option ticket-option-active">
              <Ticket size={18} aria-hidden="true" />
              <strong>1 ingresso</strong>
              <span>{formatCurrency(event.price, event.currency)}</span>
            </article>
            <article className="ticket-option ticket-option-muted">
              <Ticket size={18} aria-hidden="true" />
              <strong>2 ingressos</strong>
              <span>{formatCurrency(event.price * 2, event.currency)}</span>
            </article>
          </div>
        </section>

        <section className="blue-insight-card">
          <Sparkles size={20} aria-hidden="true" />
          <div>
            <strong>Compra segura com QR assinado</strong>
            <p>Depois do pagamento, a portaria valida o codigo direto no servidor.</p>
          </div>
        </section>

        <Link className="app-primary-action" to={checkoutPath(event.id)}>
          Comprar 1 ingresso
        </Link>
      </div>
    </section>
  );
}

function formatDayMonth(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  })
    .format(date)
    .replace(".", "");
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
