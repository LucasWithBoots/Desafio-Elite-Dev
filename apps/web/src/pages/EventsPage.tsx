import { Bell, Bookmark, ChevronDown, Filter, MapPin, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useEvents } from "@/features/event-catalog/hooks/useEvents";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { eventDetailsPath } from "@/shared/constants/routes";
import { formatCurrency } from "@/shared/lib/formatCurrency";

const categories = ["Todos", "Shows", "Festivais", "Ballet", "Teatro"];

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

  const [featuredEvent, ...recommendedEvents] = events;

  return (
    <section className="client-home">
      <header className="client-hero">
        <div className="client-location">
          <MapPin size={16} aria-hidden="true" />
          <span>Sao Paulo</span>
          <ChevronDown size={15} aria-hidden="true" />
        </div>

        <button className="icon-button notification-button" type="button" aria-label="Ver notificacoes">
          <Bell size={18} aria-hidden="true" />
        </button>

        <div className="client-avatar" aria-hidden="true">
          L
        </div>

        <div className="client-greeting">
          <span>Oi, Lucas!</span>
          <strong>Separamos eventos interessantes para voce</strong>
        </div>
      </header>

      <section className="search-panel" aria-label="Busca de eventos">
        <label className="search-field">
          <Search size={17} aria-hidden="true" />
          <input placeholder="Descobrir eventos" />
        </label>
        <div className="filter-rail">
          <button className="filter-button filter-icon-button" type="button" aria-label="Abrir filtros">
            <Filter size={17} aria-hidden="true" />
          </button>
          <button className="filter-button" type="button">
            Categoria
            <ChevronDown size={15} aria-hidden="true" />
          </button>
          <button className="filter-button" type="button">
            Data
            <ChevronDown size={15} aria-hidden="true" />
          </button>
          <button className="filter-button" type="button">
            Mapa
            <ChevronDown size={15} aria-hidden="true" />
          </button>
        </div>
      </section>

      <div className="category-rail" aria-label="Categorias de eventos">
        {categories.map((category, index) => (
          <button
            className={`category-chip ${index === 0 ? "category-chip-active" : ""}`}
            key={category}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>

      <div className="client-main-grid">
        <section className="featured-section" aria-labelledby="featured-title">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Em destaque</span>
              <h1 id="featured-title">Proximos eventos</h1>
            </div>
            <button className="icon-button search-button" type="button" aria-label="Buscar eventos">
              <Search size={18} aria-hidden="true" />
            </button>
          </div>

          <Link className="featured-event-card" to={eventDetailsPath(featuredEvent.id)}>
            {featuredEvent.imageUrl ? <img src={featuredEvent.imageUrl} alt="" /> : null}
            <span className="date-bubble">
              <strong>{getDay(featuredEvent.startsAt)}</strong>
              <small>{getMonth(featuredEvent.startsAt)}</small>
            </span>
            <span className="bookmark-button" aria-hidden="true">
              <Bookmark size={18} />
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

          <div className="carousel-dots" aria-hidden="true">
            <span />
            <span className="active" />
            <span />
            <span />
            <span />
          </div>
        </section>

        <section className="recommendation-section" aria-labelledby="recommendation-title">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Recomendacoes</span>
              <h2 id="recommendation-title">Para sua semana</h2>
            </div>
            <Link className="text-link" to="/events">
              Ver todos
            </Link>
          </div>

          <div className="recommendation-rail">
            {recommendedEvents.map((event) => (
              <Link className="recommendation-card" key={event.id} to={eventDetailsPath(event.id)}>
                {event.imageUrl ? <img src={event.imageUrl} alt="" /> : null}
                <span className="recommendation-save" aria-hidden="true">
                  <Bookmark size={16} />
                </span>
                <strong>{event.title}</strong>
                <span>{getShortDate(event.startsAt)}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="result-list-section" aria-labelledby="result-list-title">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Busca</span>
              <h2 id="result-list-title">Resultados em Sao Paulo</h2>
            </div>
          </div>

          <div className="result-list">
            {events.map((event, index) => (
              <Link className="result-event-row" key={event.id} to={eventDetailsPath(event.id)}>
                {event.imageUrl ? <img src={event.imageUrl} alt="" /> : null}
                <div>
                  <strong>{event.title}</strong>
                  <span>
                    <MapPin size={13} aria-hidden="true" />
                    {event.venueName}
                  </span>
                  <span>{getListDate(event.startsAt)}</span>
                  <div className="result-tags">
                    <span className="app-pill">{formatCurrency(event.price, event.currency)}</span>
                    <span className="app-pill app-pill-pink">
                      {index === 0 ? "Workshops" : index === 1 ? "Arte" : "Ballet"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <aside className="client-insight-card">
          <Sparkles size={20} aria-hidden="true" />
          <div>
            <strong>Compra rapida, entrada segura</strong>
            <p>Depois do pagamento, seu ingresso aparece com QR Code e codigo manual.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function getDay(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(new Date(value));
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

function getListDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date(value))
    .replace(".", "");
}
