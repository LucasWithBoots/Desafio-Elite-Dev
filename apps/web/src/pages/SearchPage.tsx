import {
  Armchair,
  Banknote,
  Bookmark,
  CalendarDays,
  ChevronDown,
  MapPin,
  Search,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { SeatingMode } from "@/entities/event/model";
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
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [seatingMode, setSeatingMode] = useState<SeatingModeFilter>("all");
  const [activeFilterPanel, setActiveFilterPanel] =
    useState<FilterPanel>(null);
  const { data: allEvents } = useEvents();
  const dateRange = getDateRange(dateFilter);
  const priceRange = getPriceRange(priceFilter);
  const {
    data: searchedEvents,
    isFetching,
    isLoading,
    error,
  } = useEvents({
    search: search.trim(),
    category,
    ...dateRange,
    ...priceRange,
    seatingMode: seatingMode === "all" ? undefined : seatingMode,
  });
  const { canSave, isSaved, toggleSavedEvent } = useSavedEvents();
  const availableCategories = getAvailableEventCategories(
    allEvents ?? searchedEvents ?? [],
  );
  const events = searchedEvents;

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
        dateFilter={dateFilter}
        priceFilter={priceFilter}
        seatingMode={seatingMode}
        activeFilterPanel={activeFilterPanel}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onDateFilterChange={setDateFilter}
        onPriceFilterChange={setPriceFilter}
        onSeatingModeChange={setSeatingMode}
        onToggleFilterPanel={(panel) =>
          setActiveFilterPanel((current) => (current === panel ? null : panel))
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
  dateFilter: DateFilter;
  priceFilter: PriceFilter;
  seatingMode: SeatingModeFilter;
  activeFilterPanel: FilterPanel;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDateFilterChange: (value: DateFilter) => void;
  onPriceFilterChange: (value: PriceFilter) => void;
  onSeatingModeChange: (value: SeatingModeFilter) => void;
  onToggleFilterPanel: (panel: Exclude<FilterPanel, null>) => void;
}

function SearchHeader({
  search,
  category,
  categories,
  dateFilter,
  priceFilter,
  seatingMode,
  activeFilterPanel,
  onSearchChange,
  onCategoryChange,
  onDateFilterChange,
  onPriceFilterChange,
  onSeatingModeChange,
  onToggleFilterPanel,
}: SearchHeaderProps) {
  const panelId = "search-filter-options";

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
          className={`filter-button ${
            activeFilterPanel === "category" || category !== ALL_EVENT_CATEGORIES
              ? "filter-button-selected"
              : ""
          }`}
          type="button"
          aria-controls={panelId}
          aria-expanded={activeFilterPanel === "category"}
          onClick={() => onToggleFilterPanel("category")}
        >
          {category === ALL_EVENT_CATEGORIES
            ? "Categorias"
            : getEventCategoryLabel(category)}
          <ChevronDown size={15} aria-hidden="true" />
        </button>
        <button
          className={`filter-button ${
            activeFilterPanel === "date" || dateFilter !== "all"
              ? "filter-button-selected"
              : ""
          }`}
          type="button"
          aria-controls={panelId}
          aria-expanded={activeFilterPanel === "date"}
          onClick={() => onToggleFilterPanel("date")}
        >
          <CalendarDays size={15} aria-hidden="true" />
          {dateFilterLabels[dateFilter]}
          <ChevronDown size={15} aria-hidden="true" />
        </button>
        <button
          className={`filter-button ${
            activeFilterPanel === "price" || priceFilter !== "all"
              ? "filter-button-selected"
              : ""
          }`}
          type="button"
          aria-controls={panelId}
          aria-expanded={activeFilterPanel === "price"}
          onClick={() => onToggleFilterPanel("price")}
        >
          <Banknote size={15} aria-hidden="true" />
          {priceFilterLabels[priceFilter]}
          <ChevronDown size={15} aria-hidden="true" />
        </button>
        <button
          className={`filter-button ${
            activeFilterPanel === "seating" || seatingMode !== "all"
              ? "filter-button-selected"
              : ""
          }`}
          type="button"
          aria-controls={panelId}
          aria-expanded={activeFilterPanel === "seating"}
          onClick={() => onToggleFilterPanel("seating")}
        >
          <Armchair size={15} aria-hidden="true" />
          {seatingModeLabels[seatingMode]}
          <ChevronDown size={15} aria-hidden="true" />
        </button>
      </div>

      {activeFilterPanel ? (
        <div className="search-filter-options" id={panelId}>
          {activeFilterPanel === "category" ? (
            <FilterOptions
              ariaLabel="Categorias disponíveis"
              options={categories.map((value) => ({
                value,
                label: getEventCategoryLabel(value),
              }))}
              selectedValue={category}
              onChange={onCategoryChange}
            />
          ) : null}
          {activeFilterPanel === "date" ? (
            <FilterOptions
              ariaLabel="Períodos disponíveis"
              options={toFilterOptions(dateFilterLabels)}
              selectedValue={dateFilter}
              onChange={onDateFilterChange}
            />
          ) : null}
          {activeFilterPanel === "price" ? (
            <FilterOptions
              ariaLabel="Faixas de preço disponíveis"
              options={toFilterOptions(priceFilterLabels)}
              selectedValue={priceFilter}
              onChange={onPriceFilterChange}
            />
          ) : null}
          {activeFilterPanel === "seating" ? (
            <FilterOptions
              ariaLabel="Modalidades de ingresso disponíveis"
              options={toFilterOptions(seatingModeLabels)}
              selectedValue={seatingMode}
              onChange={onSeatingModeChange}
            />
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

interface FilterOption<Value extends string> {
  value: Value;
  label: string;
}

interface FilterOptionsProps<Value extends string> {
  ariaLabel: string;
  options: FilterOption<Value>[];
  selectedValue: Value;
  onChange: (value: Value) => void;
}

function FilterOptions<Value extends string>({
  ariaLabel,
  options,
  selectedValue,
  onChange,
}: FilterOptionsProps<Value>) {
  return (
    <div className="search-filter-option-list" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          className={`category-chip ${selectedValue === option.value ? "category-chip-active" : ""}`}
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

type FilterPanel = "category" | "date" | "price" | "seating" | null;
type DateFilter = "all" | "today" | "weekend" | "next-30-days";
type PriceFilter = "all" | "free" | "up-to-50" | "50-to-150" | "over-150";
type SeatingModeFilter = "all" | SeatingMode;

const dateFilterLabels: Record<DateFilter, string> = {
  all: "Qualquer data",
  today: "Hoje",
  weekend: "Fim de semana",
  "next-30-days": "Próximos 30 dias",
};

const priceFilterLabels: Record<PriceFilter, string> = {
  all: "Qualquer preço",
  free: "Grátis",
  "up-to-50": "Até R$ 50",
  "50-to-150": "R$ 50 a R$ 150",
  "over-150": "Acima de R$ 150",
};

const seatingModeLabels: Record<SeatingModeFilter, string> = {
  all: "Qualquer entrada",
  "general-admission": "Entrada geral",
  "seat-map": "Assento marcado",
};

function toFilterOptions<Value extends string>(labels: Record<Value, string>) {
  return Object.entries(labels).map(([value, label]) => ({
    value: value as Value,
    label: label as string,
  }));
}

function getDateRange(filter: DateFilter) {
  if (filter === "all") {
    return {};
  }

  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (filter === "today") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }

  if (filter === "weekend") {
    const day = now.getDay();
    const daysUntilSaturday = day === 0 ? 0 : (6 - day + 7) % 7;
    start.setDate(now.getDate() + daysUntilSaturday);
    start.setHours(0, 0, 0, 0);
    end.setTime(start.getTime());
    end.setDate(start.getDate() + (day === 0 ? 0 : 1));
    end.setHours(23, 59, 59, 999);
  }

  if (filter === "next-30-days") {
    start.setHours(0, 0, 0, 0);
    end.setDate(now.getDate() + 30);
    end.setHours(23, 59, 59, 999);
  }

  return { dateFrom: start.toISOString(), dateTo: end.toISOString() };
}

function getPriceRange(filter: PriceFilter) {
  const ranges: Record<PriceFilter, { minPrice?: number; maxPrice?: number }> = {
    all: {},
    free: { minPrice: 0, maxPrice: 0 },
    "up-to-50": { maxPrice: 50 },
    "50-to-150": { minPrice: 50, maxPrice: 150 },
    "over-150": { minPrice: 150.01 },
  };

  return ranges[filter];
}

function formatSearchDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
