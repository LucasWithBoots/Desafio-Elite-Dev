import { Bookmark, ChevronDown, Filter, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export function SearchPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL_EVENT_CATEGORIES);
  const [areCategoryFiltersOpen, setAreCategoryFiltersOpen] = useState(false);
  const { data: allEvents } = useEvents();
  const {
    data: searchedEvents,
    isFetching,
    isLoading,
    error,
  } = useEvents({
    search: search.trim(),
  });
  const { canSave, isSaved, toggleSavedEvent } = useSavedEvents();
  const availableCategories = getAvailableEventCategories(
    allEvents ?? searchedEvents ?? [],
  );
  const events =
    category === ALL_EVENT_CATEGORIES
      ? searchedEvents
      : searchedEvents?.filter((event) => getEventCategory(event) === category);

  function handleSaveClick(eventId: string) {
    if (!canSave) {
      navigate(routes.login);
      return;
    }

    toggleSavedEvent(eventId);
  }

  return (
    <section className="app-screen search-screen">
      <SearchHeader
        search={search}
        category={category}
        categories={availableCategories}
        isCategoryFiltersOpen={areCategoryFiltersOpen}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onToggleCategoryFilters={() =>
          setAreCategoryFiltersOpen((currentValue) => !currentValue)
        }
      />

      {error ? (
        <EmptyState
          title="Nao foi possivel buscar eventos"
          description={
            error instanceof Error
              ? error.message
              : "Tente novamente em instantes."
          }
        />
      ) : isLoading ? (
        <LoadingState />
      ) : !events?.length ? (
        <EmptyState
          title="Nenhum resultado encontrado"
          description="Tente buscar por outro nome, data ou categoria."
        />
      ) : (
        <section
          className="search-results-section"
          aria-labelledby="search-results-title"
        >
          <div className="search-results-title-row">
            <h1 id="search-results-title">Resultados em Sao Paulo</h1>
            {isFetching ? (
              <span className="search-updating" aria-live="polite">
                Atualizando
              </span>
            ) : null}
          </div>

          <div className="search-result-list">
            {events.map((event) => {
              const saved = isSaved(event.id);

              return (
                <article className="search-result-row" key={event.id}>
                  <div className="search-result-image">
                    <Link
                      className="search-result-image-link"
                      to={eventDetailsPath(event.id)}
                      aria-label={`Abrir ${event.title}`}
                    >
                      {event.imageUrl ? (
                        <img src={event.imageUrl} alt="" />
                      ) : null}
                    </Link>
                    <button
                      className={`search-save-button ${saved ? "save-button-active" : ""}`}
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
                      <span className="app-pill">
                        {formatCurrency(event.price, event.currency)}
                      </span>
                      <span className="app-pill app-pill-pink">
                        {getEventCategoryLabel(getEventCategory(event))}
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </section>
  );
}

interface SearchHeaderProps {
  search: string;
  category: string;
  categories: string[];
  isCategoryFiltersOpen: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onToggleCategoryFilters: () => void;
}

function SearchHeader({
  search,
  category,
  categories,
  isCategoryFiltersOpen,
  onSearchChange,
  onCategoryChange,
  onToggleCategoryFilters,
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

      <div
        className="filter-rail search-filter-rail"
        aria-label="Filtros de busca"
      >
        <button
          className={`filter-button filter-icon-button ${
            isCategoryFiltersOpen ? "filter-button-selected" : ""
          }`}
          type="button"
          aria-label="Abrir categorias"
          aria-controls="search-category-filters"
          aria-expanded={isCategoryFiltersOpen}
          onClick={onToggleCategoryFilters}
        >
          <Filter size={17} aria-hidden="true" />
        </button>
        <button
          className="filter-button"
          type="button"
          aria-controls="search-category-filters"
          aria-expanded={isCategoryFiltersOpen}
          onClick={onToggleCategoryFilters}
        >
          {category === ALL_EVENT_CATEGORIES
            ? "Categorias"
            : getEventCategoryLabel(category)}
          <ChevronDown size={15} aria-hidden="true" />
        </button>
      </div>

      {isCategoryFiltersOpen ? (
        <div
          className="category-rail compact-category-rail"
          id="search-category-filters"
          aria-label="Categorias disponiveis"
        >
          {categories.map((item) => (
            <button
              className={`category-chip ${category === item ? "category-chip-active" : ""}`}
              key={item}
              type="button"
              onClick={() => onCategoryChange(item)}
            >
              {getEventCategoryLabel(item)}
            </button>
          ))}
        </div>
      ) : null}
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
