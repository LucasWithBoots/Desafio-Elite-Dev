import { Bookmark, ChevronDown, Filter, MapPin, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useEvents } from "@/features/event-catalog/hooks/useEvents";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { eventDetailsPath } from "@/shared/constants/routes";
import { formatCurrency } from "@/shared/lib/formatCurrency";

const filters = ["Categoria", "Data", "Mapa", "Preco"];
const tags = ["Workshops", "Arte", "Kids & Family", "Exposicao", "Festival", "Teatro"];

export function SearchPage() {
  const { data: events, isLoading } = useEvents();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!events?.length) {
    return (
      <EmptyState
        title="Nenhum resultado encontrado"
        description="Tente buscar por outro nome, data ou categoria."
      />
    );
  }

  return (
    <section className="app-screen search-screen">
      <header className="search-header">
        <label className="search-field search-field-large">
          <Search size={17} aria-hidden="true" />
          <input aria-label="Buscar eventos" placeholder="Descobrir" />
        </label>

        <div className="filter-rail search-filter-rail" aria-label="Filtros de busca">
          <button className="filter-button filter-icon-button" type="button" aria-label="Abrir filtros">
            <Filter size={17} aria-hidden="true" />
          </button>
          {filters.map((filter) => (
            <button className="filter-button" key={filter} type="button">
              {filter}
              <ChevronDown size={15} aria-hidden="true" />
            </button>
          ))}
        </div>
      </header>

      <section className="search-results-section" aria-labelledby="search-results-title">
        <h1 id="search-results-title">Resultados em Sao Paulo</h1>

        <div className="search-result-list">
          {events.map((event, index) => (
            <Link className="search-result-row" key={event.id} to={eventDetailsPath(event.id)}>
              <div className="search-result-image">
                {event.imageUrl ? <img src={event.imageUrl} alt="" /> : null}
                <span className="search-save-button" aria-hidden="true">
                  <Bookmark size={15} />
                </span>
              </div>

              <div className="search-result-content">
                <strong>{event.title}</strong>
                <span>
                  <MapPin size={13} aria-hidden="true" />
                  {event.venueName}
                </span>
                <span>{formatSearchDate(event.startsAt)}</span>
                <div className="result-tags">
                  <span className="app-pill">{formatCurrency(event.price, event.currency)}</span>
                  <span className="app-pill app-pill-pink">{tags[index % tags.length]}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}

function formatSearchDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
