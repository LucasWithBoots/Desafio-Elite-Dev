import { Bookmark, ChevronDown, Filter, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEvents } from "@/features/event-catalog/hooks/useEvents";
import { useSavedEvents } from "@/features/saved-events/hooks/useSavedEvents";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { eventDetailsPath, routes } from "@/shared/constants/routes";
import { formatCurrency } from "@/shared/lib/formatCurrency";

const filters = ["Categoria", "Data", "Mapa", "Preco"];
const categories = ["All", "Music", "Art", "Workshops", "Kids & Family", "Theatre"];

export function SearchPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { data: events, isLoading, error } = useEvents({ search, category });
  const { canSave, isSaved, toggleSavedEvent } = useSavedEvents();

  function handleSaveClick(eventId: string) {
    if (!canSave) {
      navigate(routes.login);
      return;
    }

    toggleSavedEvent(eventId);
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <EmptyState
        title="Nao foi possivel buscar eventos"
        description={error instanceof Error ? error.message : "Tente novamente em instantes."}
      />
    );
  }

  if (!events?.length) {
    return (
      <section className="app-screen search-screen">
        <SearchHeader
          search={search}
          category={category}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
        />
        <EmptyState
          title="Nenhum resultado encontrado"
          description="Tente buscar por outro nome, data ou categoria."
        />
      </section>
    );
  }

  return (
    <section className="app-screen search-screen">
      <SearchHeader
        search={search}
        category={category}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
      />

      <section className="search-results-section" aria-labelledby="search-results-title">
        <h1 id="search-results-title">Resultados em Sao Paulo</h1>

        <div className="search-result-list">
          {events.map((event, index) => {
            const saved = isSaved(event.id);

            return (
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
                    className={`search-save-button ${saved ? "save-button-active" : ""}`}
                    type="button"
                    aria-label={
                      saved ? `Remover ${event.title} dos salvos` : `Salvar ${event.title}`
                    }
                    onClick={(clickEvent) => {
                      clickEvent.preventDefault();
                      clickEvent.stopPropagation();
                      handleSaveClick(event.id);
                    }}
                  >
                    <Bookmark
                      size={15}
                      fill={saved ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
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
                  <span>{formatSearchDate(event.startsAt)}</span>
                  <div className="result-tags">
                    <span className="app-pill">{formatCurrency(event.price, event.currency)}</span>
                    <span className="app-pill app-pill-pink">
                      {event.category ?? event.genre ?? categories[index % categories.length]}
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}

interface SearchHeaderProps {
  search: string;
  category: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

function SearchHeader({
  search,
  category,
  onSearchChange,
  onCategoryChange,
}: SearchHeaderProps) {
  return (
    <header className="search-header">
      <label className="search-field search-field-large">
        <Search size={17} aria-hidden="true" />
        <input
          aria-label="Buscar eventos"
          placeholder="Descobrir"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
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

      <div className="category-rail compact-category-rail" aria-label="Categorias">
        {categories.map((item) => (
          <button
            className={`category-chip ${category === item ? "category-chip-active" : ""}`}
            key={item}
            type="button"
            onClick={() => onCategoryChange(item)}
          >
            {item === "All" ? "Todos" : item}
          </button>
        ))}
      </div>
    </header>
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
