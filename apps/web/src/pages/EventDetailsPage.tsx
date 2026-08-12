import {
  ArrowLeft,
  Bookmark,
  CalendarDays,
  MapPin,
  Share2,
  Tags,
  Ticket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEvent } from "@/features/event-catalog/hooks/useEvent";
import {
  getEventCategory,
  getEventCategoryLabel,
} from "@/features/event-catalog/lib/eventCategories";
import { useSavedEvents } from "@/features/saved-events/hooks/useSavedEvents";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { checkoutPath, routes } from "@/shared/constants/routes";
import { formatCurrency } from "@/shared/lib/formatCurrency";
import { AnimatePresence, motion } from "motion/react";

export function EventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const { data: event, isLoading } = useEvent(eventId);
  const { canSave, isSaved, toggleSavedEvent } = useSavedEvents();

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
  const currentEventId = event.id;
  const categoryLabel = getEventCategoryLabel(getEventCategory(event));
  const saved = isSaved(event.id);
  const eventDescription = event.description ?? event.about ?? "";
  const about = event.about ?? event.description ?? "Mais detalhes em breve.";

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: event?.title,
        text: eventDescription,
        url,
      });
      return;
    }

    await navigator.clipboard.writeText(url);
    setShareFeedback("Link copiado.");
  }

  function handleSaveClick() {
    if (!canSave) {
      navigate(routes.login);
      return;
    }

    toggleSavedEvent(currentEventId);
  }

  return (
    <AnimatePresence mode="wait">
      <motion.section
        className="app-screen event-detail-screen"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: 0.25,
          ease: "easeOut",
        }}
      >
        <header className="event-detail-topbar">
          <Link
            className="round-action"
            to={routes.events}
            aria-label="Voltar para eventos"
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </Link>
          <strong>{categoryLabel}</strong>
          <div className="event-detail-topbar-actions">
            <button
              className="round-action"
              type="button"
              aria-label="Compartilhar evento"
              onClick={handleShare}
            >
              <Share2 size={17} aria-hidden="true" />
            </button>
            <button
              className={`round-action event-detail-save ${saved ? "save-button-active" : ""}`}
              type="button"
              aria-label={
                saved
                  ? `Remover ${event.title} dos salvos`
                  : `Salvar ${event.title}`
              }
              onClick={handleSaveClick}
            >
              <Bookmark
                size={17}
                fill={saved ? "currentColor" : "none"}
                aria-hidden="true"
              />
            </button>
          </div>
        </header>

        <div className="event-detail-media">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt="" />
          ) : (
            <div className="event-detail-media-fallback" aria-hidden="true">
              <Ticket size={52} />
            </div>
          )}
        </div>

        <main className="event-detail-content">
          <header className="event-detail-topbar-desktop">
            <div className="event-detail-topbar-actions">
              <button
                className="round-action"
                type="button"
                aria-label="Compartilhar evento"
                onClick={handleShare}
              >
                <Share2 size={17} aria-hidden="true" />
              </button>
              <button
                className={`round-action event-detail-save ${saved ? "save-button-active" : ""}`}
                type="button"
                aria-label={
                  saved
                    ? `Remover ${event.title} dos salvos`
                    : `Salvar ${event.title}`
                }
                onClick={handleSaveClick}
              >
                <Bookmark
                  size={17}
                  fill={saved ? "currentColor" : "none"}
                  aria-hidden="true"
                />
              </button>
            </div>
          </header>
          <section
            className="event-detail-intro"
            aria-labelledby="event-detail-title"
          >
            <h1 id="event-detail-title">{event.title}</h1>
            {eventDescription ? <p>{eventDescription}</p> : null}
            {shareFeedback ? (
              <span className="event-share-feedback">{shareFeedback}</span>
            ) : null}
          </section>

          <section
            className="event-main-info"
            aria-labelledby="event-main-info-title"
          >
            <h2 id="event-main-info-title">Informacoes principais</h2>
            <div className="event-main-info-list">
              <EventInfoRow
                icon={MapPin}
                title={event.venueName}
                detail={
                  event.address ??
                  event.city ??
                  "Endereco confirmado apos a compra"
                }
              />
              <EventInfoRow
                icon={CalendarDays}
                title={formatDetailDate(date)}
                detail={formatTime(date)}
              />
              <EventInfoRow
                icon={Ticket}
                title={formatCurrency(event.price, event.currency)}
                detail={`${event.availableTickets} ingressos disponiveis`}
              />
              <EventInfoRow
                icon={Tags}
                title={categoryLabel}
                detail={event.genre ?? getSeatingModeLabel(event.seatingMode)}
              />
            </div>
          </section>

          <section
            className="event-about-section"
            aria-labelledby="event-about-title"
          >
            <h2 id="event-about-title">Sobre o evento</h2>
            <p>{about}</p>
          </section>

          <Link
            className="app-primary-action event-detail-buy-button"
            to={checkoutPath(event.id)}
          >
            Escolher um ticket
          </Link>
        </main>
      </motion.section>
    </AnimatePresence>
  );
}

interface EventInfoRowProps {
  icon: LucideIcon;
  title: string;
  detail: string;
}

function EventInfoRow({ icon: Icon, title, detail }: EventInfoRowProps) {
  return (
    <div className="event-info-row">
      <Icon size={16} aria-hidden="true" />
      <span>
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
    </div>
  );
}

function formatDetailDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getSeatingModeLabel(seatingMode: string) {
  return seatingMode === "seat-map" ? "Assentos marcados" : "Entrada geral";
}
