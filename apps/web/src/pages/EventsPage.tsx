import {
  Bell,
  Bookmark,
  ChevronDown,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { useEvents } from "@/features/event-catalog/hooks/useEvents";
import {
  ALL_EVENT_CATEGORIES,
  getAvailableEventCategories,
  getEventCategory,
  getEventCategoryLabel,
} from "@/features/event-catalog/lib/eventCategories";
import { useSavedEvents } from "@/features/saved-events/hooks/useSavedEvents";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { eventDetailsPath, routes } from "@/shared/constants/routes";
import { formatCurrency } from "@/shared/lib/formatCurrency";

export function EventsPage() {
  const navigate = useNavigate();
  const session = useAuthSession();
  const [selectedCategory, setSelectedCategory] = useState(ALL_EVENT_CATEGORIES);
  const { data: events, isLoading, error } = useEvents();
  const { canSave, isSaved, toggleSavedEvent } = useSavedEvents();

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <EmptyState
        title="Nao foi possivel carregar os eventos"
        description={error instanceof Error ? error.message : "Tente novamente em instantes."}
      />
    );
  }

  if (!events?.length) {
    return (
      <EmptyState
        title="Nenhum evento publicado"
        description="Quando o organizador publicar eventos, eles aparecem aqui."
      />
    );
  }

  const categories = getAvailableEventCategories(events);
  const filteredEvents =
    selectedCategory === ALL_EVENT_CATEGORIES
      ? events
      : events.filter((event) => getEventCategory(event) === selectedCategory);
  const [featuredEvent, ...recommendedEvents] = filteredEvents;
  const userFirstName = getFirstName(session?.user.name);
  const userInitial = userFirstName?.charAt(0).toUpperCase() ?? "E";
  const featuredSaved = featuredEvent ? isSaved(featuredEvent.id) : false;

  function handleSaveClick(eventId: string) {
    if (!canSave) {
      navigate(routes.login);
      return;
    }

    toggleSavedEvent(eventId);
  }

  return (
    <section className="client-home">
      <header className="client-hero">
        {featuredEvent?.imageUrl ? (
          <img className="client-hero-image" src={featuredEvent.imageUrl} alt="" />
        ) : null}
        <div className="client-hero-shade" aria-hidden="true" />

        <div className="client-location">
          <MapPin size={16} aria-hidden="true" />
          <span>Sao Paulo</span>
          <ChevronDown size={15} aria-hidden="true" />
        </div>

        <button
          className="icon-button notification-button"
          type="button"
          aria-label="Ver notificacoes"
        >
          <Bell size={18} aria-hidden="true" />
        </button>

        <div className="client-avatar" aria-hidden="true">
          {userInitial}
        </div>

        <div className="client-greeting">
          <span>{userFirstName ? `Oi, ${userFirstName}!` : "Oi!"}</span>
          <strong>
            {userFirstName
              ? "Separamos eventos interessantes para voce"
              : "Explore eventos interessantes perto de voce"}
          </strong>
        </div>

        {featuredEvent ? (
          <div className="desktop-hero-content">
            <span className="featured-price">
              {formatCurrency(featuredEvent.price, featuredEvent.currency)}
            </span>
            <h1>{featuredEvent.title}</h1>
            <p>{getHeroDescription(featuredEvent.description, featuredEvent.about)}</p>
            <div className="desktop-hero-actions">
              <Link className="button button-primary" to={eventDetailsPath(featuredEvent.id)}>
                Ver evento
              </Link>
              <Link className="button button-secondary" to={routes.search}>
                Buscar eventos
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <div className="home-filter-panel">
        <span className="home-filter-title">Filtros</span>
        <div className="category-rail" aria-label="Categorias de eventos">
          {categories.map((category) => (
            <button
              className={`category-chip ${
                selectedCategory === category ? "category-chip-active" : ""
              }`}
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
            >
              {getEventCategoryLabel(category)}
            </button>
          ))}
        </div>
      </div>

      <div className="client-main-grid">
        {featuredEvent ? (
          <section className="featured-section" aria-labelledby="featured-title">
            <div className="section-title-row">
              <div>
                <span className="eyebrow">Em destaque</span>
                <h1 id="featured-title">Proximos eventos</h1>
              </div>
              <Link
                className="icon-button search-button"
                to={routes.search}
                aria-label="Buscar eventos"
              >
                <Search size={18} aria-hidden="true" />
              </Link>
            </div>

            <article className="featured-event-card">
              <Link
                className="featured-event-link"
                to={eventDetailsPath(featuredEvent.id)}
              >
                {featuredEvent.imageUrl ? (
                  <img src={featuredEvent.imageUrl} alt="" />
                ) : null}
                <span className="date-bubble">
                  <strong>{getDay(featuredEvent.startsAt)}</strong>
                  <small>{getMonth(featuredEvent.startsAt)}</small>
                </span>
                <span className="featured-card-content">
                  <span className="featured-price">
                    {formatCurrency(featuredEvent.price, featuredEvent.currency)}
                  </span>
                  <strong>{featuredEvent.title}</strong>
                  <span>
                    <MapPin size={14} aria-hidden="true" />
                    {featuredEvent.venueName}
                  </span>
                </span>
              </Link>
              <button
                className={`bookmark-button ${featuredSaved ? "save-button-active" : ""}`}
                type="button"
                aria-label={
                  featuredSaved
                    ? `Remover ${featuredEvent.title} dos salvos`
                    : `Salvar ${featuredEvent.title}`
                }
                onClick={(clickEvent) => {
                  clickEvent.preventDefault();
                  clickEvent.stopPropagation();
                  handleSaveClick(featuredEvent.id);
                }}
              >
                <Bookmark
                  size={18}
                  fill={featuredSaved ? "currentColor" : "none"}
                  aria-hidden="true"
                />
              </button>
            </article>

            <div className="carousel-dots" aria-hidden="true">
              <span />
              <span className="active" />
              <span />
              <span />
              <span />
            </div>
          </section>
        ) : (
          <EmptyState
            title="Nenhum evento nesta categoria"
            description="Escolha outra categoria para ver novos eventos em destaque."
          />
        )}

        <section
          className="recommendation-section"
          aria-labelledby="recommendation-title"
        >
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Recomendacoes</span>
              <h2 id="recommendation-title">Para sua semana</h2>
            </div>
            <Link className="text-link" to={routes.search}>
              Ver todos
            </Link>
          </div>

          <div className="recommendation-rail">
            {recommendedEvents.map((event) => {
              const saved = isSaved(event.id);

              return (
                <article className="recommendation-card" key={event.id}>
                  <Link
                    className="recommendation-card-link"
                    to={eventDetailsPath(event.id)}
                  >
                    {event.imageUrl ? <img src={event.imageUrl} alt="" /> : null}
                    <strong>{event.title}</strong>
                    <span>{getShortDate(event.startsAt)}</span>
                  </Link>
                  <button
                    className={`recommendation-save ${saved ? "save-button-active" : ""}`}
                    type="button"
                    aria-label={
                      saved
                        ? `Remover ${event.title} dos salvos`
                        : `Salvar ${event.title}`
                    }
                    onClick={(clickEvent) => {
                      clickEvent.preventDefault();
                      clickEvent.stopPropagation();
                      handleSaveClick(event.id);
                    }}
                  >
                    <Bookmark
                      size={16}
                      fill={saved ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="client-insight-card">
          <Sparkles size={20} aria-hidden="true" />
          <div>
            <strong>Compra rapida, entrada segura</strong>
            <p>
              Depois do pagamento, seu ingresso aparece com QR Code e codigo
              manual.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function getFirstName(name?: string) {
  return name?.trim().split(/\s+/)[0];
}

function getHeroDescription(description?: string, about?: string) {
  return (
    description?.trim() ||
    about?.trim() ||
    "Uma curadoria de eventos para voce descobrir, salvar e comprar ingresso com praticidade."
  );
}

function getDay(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(
    new Date(value),
  );
}

function getMonth(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { month: "short" })
    .format(new Date(value))
    .replace(".", "");
}

function getShortDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}
