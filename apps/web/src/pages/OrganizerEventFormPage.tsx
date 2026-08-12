import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ImagePlus, MapPin, Search } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Event, ExternalEventSource, SeatingMode } from "@/entities/event/model";
import { eventManagementService } from "@/features/event-management/services/eventManagementService";
import type { TicketmasterCatalogItem } from "@/features/event-management/types";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { Input } from "@/shared/components/Input";
import { LoadingState } from "@/shared/components/LoadingState";
import { routes } from "@/shared/constants/routes";
import { formatCurrency, formatDateTime } from "@/shared/lib/formatters";

interface ManualEventFormValues {
  source: ExternalEventSource;
  externalId: string;
  title: string;
  description: string;
  about: string;
  imageUrl: string;
  venueName: string;
  address: string;
  city: string;
  category: string;
  genre: string;
  date: string;
  time: string;
  capacity: string;
  price: string;
  currency: string;
  seatingMode: SeatingMode;
}

const initialManualForm: ManualEventFormValues = {
  source: "manual",
  externalId: "",
  title: "",
  description: "",
  about: "",
  imageUrl: "",
  venueName: "",
  address: "",
  city: "",
  category: "",
  genre: "",
  date: "",
  time: "",
  capacity: "",
  price: "",
  currency: "BRL",
  seatingMode: "seat-map",
};

export function OrganizerEventFormPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const manualPanelRef = useRef<HTMLElement | null>(null);
  const isEditMode = Boolean(eventId);
  const [keyword, setKeyword] = useState("");
  const [catalogFeedback, setCatalogFeedback] = useState<string | null>(null);
  const [manualFeedback, setManualFeedback] = useState<string | null>(null);
  const [catalogResults, setCatalogResults] = useState<TicketmasterCatalogItem[]>([]);
  const [manualForm, setManualForm] = useState<ManualEventFormValues>(initialManualForm);
  const {
    data: editingEvent,
    isLoading: isEditingEventLoading,
    error: editingEventError,
  } = useQuery({
    queryKey: ["organizer", "events", eventId],
    queryFn: () => eventManagementService.getEvent(eventId ?? ""),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (editingEvent) {
      setManualForm(toManualEventForm(editingEvent));
    }
  }, [editingEvent]);

  const searchMutation = useMutation({
    mutationFn: eventManagementService.searchTicketmasterEvents,
    onSuccess: (response) => {
      setCatalogResults(response.items);
      setCatalogFeedback(
        response.items.length ? null : "Nenhum evento encontrado na Ticketmaster.",
      );
    },
    onError: (error) => {
      setCatalogFeedback(
        error instanceof Error ? error.message : "Nao foi possivel buscar no catalogo.",
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: eventManagementService.createEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organizer", "events"] });
      navigate(routes.organizerDashboard);
    },
    onError: (error) => {
      setManualFeedback(
        error instanceof Error ? error.message : "Nao foi possivel criar o evento.",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: Parameters<typeof eventManagementService.updateEvent>[1]) =>
      eventManagementService.updateEvent(eventId ?? "", values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organizer", "events"] });
      navigate(routes.organizerDashboard);
    },
    onError: (error) => {
      setManualFeedback(
        error instanceof Error ? error.message : "Nao foi possivel editar o evento.",
      );
    },
  });

  function handleCatalogSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (keyword.trim()) {
      setCatalogFeedback(null);
      searchMutation.mutate(keyword.trim());
    }
  }

  function updateManualField<TKey extends keyof ManualEventFormValues>(
    field: TKey,
    value: ManualEventFormValues[TKey],
  ) {
    setManualForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleCatalogImport(event: TicketmasterCatalogItem) {
    const { date, time } = getDateTimeFields(event.startsAt);

    setManualForm({
      source: "ticketmaster",
      externalId: event.externalId,
      title: event.title,
      description: "",
      about: event.description ?? "",
      imageUrl: event.imageUrl ?? "",
      venueName: event.venueName ?? "",
      address: event.address ?? "",
      city: event.city ?? "",
      category: event.category ?? "",
      genre: event.genre ?? "",
      date,
      time,
      capacity: "",
      price: event.minPrice !== undefined ? String(event.minPrice) : "",
      currency: event.currency ?? "BRL",
      seatingMode: "seat-map",
    });
    setManualFeedback(null);
    setCatalogFeedback("Dados enviados para o formulario. Revise antes de salvar.");
    window.setTimeout(() => {
      manualPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setManualFeedback(null);

    const capacity = Number(manualForm.capacity);
    const price = Number(manualForm.price || 0);

    if (!manualForm.capacity || !Number.isFinite(capacity) || capacity <= 0) {
      setManualFeedback("Informe uma capacidade valida para salvar o evento.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setManualFeedback("Informe um preco valido para salvar o evento.");
      return;
    }

    const payload = {
      source: manualForm.source,
      externalId: manualForm.externalId || undefined,
      title: manualForm.title,
      description: manualForm.description || undefined,
      about: manualForm.about || undefined,
      imageUrl: manualForm.imageUrl || undefined,
      venueName: manualForm.venueName,
      address: manualForm.address || undefined,
      city: manualForm.city || undefined,
      date: manualForm.date,
      time: manualForm.time,
      capacity,
      price,
      currency: manualForm.currency || "BRL",
      seatingMode: manualForm.seatingMode,
      category: manualForm.category || undefined,
      genre: manualForm.genre || undefined,
    };

    if (isEditMode) {
      updateMutation.mutate(payload);
      return;
    }

    createMutation.mutate(payload);
  }

  if (isEditMode && isEditingEventLoading) {
    return <LoadingState />;
  }

  if (isEditMode && (editingEventError || !editingEvent)) {
    return (
      <EmptyState
        title="Rascunho nao encontrado"
        description="Volte para seus eventos e escolha outro rascunho para editar."
        action={
          <Link className="button button-primary" to={routes.organizerDashboard}>
            Voltar
          </Link>
        }
      />
    );
  }

  if (isEditMode && editingEvent?.status !== "draft") {
    return (
      <EmptyState
        title="Evento ja publicado"
        description="Apenas eventos em rascunho podem ser editados."
        action={
          <Link className="button button-primary" to={routes.organizerDashboard}>
            Voltar
          </Link>
        }
      />
    );
  }

  return (
    <section className="app-screen organizer-form-screen">
      <header className="lime-page-header organizer-hero">
        <h1>{isEditMode ? "Editar rascunho" : "Criar evento"}</h1>
        <p>
          {isEditMode
            ? "Ajuste os dados antes de publicar seu evento."
            : "Busque na Ticketmaster ou crie manualmente quando o catalogo nao resolver."}
        </p>
      </header>

      <div className="form-layout">
        <section className="panel catalog-panel organizer-card">
          <div className="organizer-card-heading">
            <span className="panel-icon">
              <Search size={20} aria-hidden="true" />
            </span>
            <div>
              <span className="app-pill app-pill-pink">API externa</span>
              <h2>Buscar no catalogo</h2>
            </div>
          </div>
          <form className="stacked-form" onSubmit={handleCatalogSearch}>
            <Input
              label="Nome do evento"
              name="keyword"
              placeholder="Ex.: Coldplay, teatro, festival"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
            <Button disabled={searchMutation.isPending}>
              <Search size={18} aria-hidden="true" />
              {searchMutation.isPending ? "Buscando..." : "Buscar na Ticketmaster"}
            </Button>
          </form>

          {catalogFeedback ? <p className="form-feedback">{catalogFeedback}</p> : null}

          {catalogResults.length ? (
            <div className="catalog-result-list">
              {catalogResults.map((event) => (
                <article className="catalog-result-card" key={event.externalId}>
                  {event.imageUrl ? <img src={event.imageUrl} alt="" /> : null}
                  <div>
                    <strong>{event.title}</strong>
                    <span>{event.venueName ?? "Local a definir"}</span>
                    <span>
                      {event.startsAt ? formatDateTime(event.startsAt) : "Data a definir"}
                    </span>
                    <span>
                      {formatCurrency(event.minPrice ?? 0, event.currency ?? "BRL")}
                    </span>
                  </div>
                  <button
                    className="icon-text-button"
                    type="button"
                    onClick={() => handleCatalogImport(event)}
                  >
                    Importar
                  </button>
                </article>
              ))}
            </div>
          ) : null}
        </section>

        <section className="panel manual-event-panel organizer-card" ref={manualPanelRef}>
          <div className="organizer-card-heading">
            <span className="panel-icon">
              <ImagePlus size={20} aria-hidden="true" />
            </span>
            <div>
              <span className="app-pill">Rascunho</span>
              <h2>{isEditMode ? "Editar dados" : "Criar manualmente"}</h2>
            </div>
          </div>
          <form className="stacked-form organizer-manual-form" onSubmit={handleManualSubmit}>
            <Input
              label="Titulo"
              name="title"
              placeholder="Nome do evento"
              required
              value={manualForm.title}
              onChange={(event) => updateManualField("title", event.target.value)}
            />
            <Input
              label="Descricao curta"
              name="description"
              placeholder="Resumo para cards"
              value={manualForm.description}
              onChange={(event) => updateManualField("description", event.target.value)}
            />
            <Input
              label="Sobre"
              name="about"
              placeholder="Descricao maior do evento"
              value={manualForm.about}
              onChange={(event) => updateManualField("about", event.target.value)}
            />
            <Input
              label="Imagem"
              name="imageUrl"
              placeholder="https://..."
              value={manualForm.imageUrl}
              onChange={(event) => updateManualField("imageUrl", event.target.value)}
            />
            <Input
              label="Local"
              name="venueName"
              placeholder="Nome do local"
              required
              value={manualForm.venueName}
              onChange={(event) => updateManualField("venueName", event.target.value)}
            />
            <Input
              label="Endereco"
              name="address"
              placeholder="Rua, numero"
              value={manualForm.address}
              onChange={(event) => updateManualField("address", event.target.value)}
            />
            <Input
              label="Cidade"
              name="city"
              placeholder="Sao Paulo"
              value={manualForm.city}
              onChange={(event) => updateManualField("city", event.target.value)}
            />
            <Input
              label="Categoria"
              name="category"
              placeholder="Shows, Teatro, Art"
              value={manualForm.category}
              onChange={(event) => updateManualField("category", event.target.value)}
            />
            <Input
              label="Genero"
              name="genre"
              placeholder="Rock, Pop, Theatre"
              value={manualForm.genre}
              onChange={(event) => updateManualField("genre", event.target.value)}
            />
            <fieldset className="organizer-seating-picker">
              <legend>Tipo de ingresso</legend>
              <div className="organizer-seating-options">
                <label
                  className={`organizer-seating-option ${
                    manualForm.seatingMode === "seat-map" ? "organizer-seating-option-active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="seatingMode"
                    value="seat-map"
                    checked={manualForm.seatingMode === "seat-map"}
                    onChange={() => updateManualField("seatingMode", "seat-map")}
                  />
                  <strong>Assentos marcados</strong>
                  <span>O comprador escolhe cadeiras no mapa.</span>
                </label>
                <label
                  className={`organizer-seating-option ${
                    manualForm.seatingMode === "general-admission"
                      ? "organizer-seating-option-active"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="seatingMode"
                    value="general-admission"
                    checked={manualForm.seatingMode === "general-admission"}
                    onChange={() => updateManualField("seatingMode", "general-admission")}
                  />
                  <strong>Entrada geral</strong>
                  <span>O comprador escolhe a quantidade.</span>
                </label>
              </div>
            </fieldset>
            <div className="inline-form-grid">
              <span>
                <CalendarDays size={16} aria-hidden="true" />
                Data e horario
              </span>
              <span>
                <MapPin size={16} aria-hidden="true" />
                Localizacao
              </span>
            </div>
            <Input
              label="Data"
              name="date"
              type="date"
              required
              value={manualForm.date}
              onChange={(event) => updateManualField("date", event.target.value)}
            />
            <Input
              label="Horario"
              name="time"
              type="time"
              required
              value={manualForm.time}
              onChange={(event) => updateManualField("time", event.target.value)}
            />
            <Input
              label="Capacidade"
              name="capacity"
              type="number"
              min="1"
              placeholder="Ex.: 100"
              required
              value={manualForm.capacity}
              onChange={(event) => updateManualField("capacity", event.target.value)}
            />
            <Input
              label="Preco"
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={manualForm.price}
              onChange={(event) => updateManualField("price", event.target.value)}
            />
            <Button disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending
                ? "Salvando..."
                : isEditMode
                  ? "Salvar alteracoes"
                  : "Salvar rascunho"}
            </Button>
          </form>
        </section>
      </div>

      {manualFeedback ? <p className="form-feedback">{manualFeedback}</p> : null}
    </section>
  );
}

function getDateTimeFields(startsAt?: string) {
  if (!startsAt) {
    return { date: "", time: "" };
  }

  const [date = "", rawTime = ""] = startsAt.split("T");

  return {
    date,
    time: rawTime.slice(0, 5),
  };
}

function toManualEventForm(event: Event): ManualEventFormValues {
  const { date, time } = getDateTimeFields(event.startsAt);

  return {
    source: event.externalSource ?? "manual",
    externalId: event.externalId ?? "",
    title: event.title,
    description: event.description ?? "",
    about: event.about ?? "",
    imageUrl: event.imageUrl ?? "",
    venueName: event.venueName,
    address: event.address ?? "",
    city: event.city ?? "",
    category: event.category ?? "",
    genre: event.genre ?? "",
    date,
    time,
    capacity: String(event.capacity),
    price: String(event.price),
    currency: event.currency,
    seatingMode: event.seatingMode,
  };
}
