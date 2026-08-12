import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ImagePlus, MapPin, Search } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventManagementService } from "@/features/event-management/services/eventManagementService";
import type { TicketmasterCatalogItem } from "@/features/event-management/types";
import { ApiError } from "@/shared/api/http-client";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { routes } from "@/shared/constants/routes";
import { formatCurrency, formatDateTime } from "@/shared/lib/formatters";

export function OrganizerEventFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [catalogFeedback, setCatalogFeedback] = useState<string | null>(null);
  const [manualFeedback, setManualFeedback] = useState<string | null>(null);
  const [catalogResults, setCatalogResults] = useState<TicketmasterCatalogItem[]>([]);

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

  const importMutation = useMutation({
    mutationFn: (event: TicketmasterCatalogItem) =>
      eventManagementService.importTicketmasterEvent(event.externalId, {
        capacity: 100,
        price: event.minPrice ?? 0,
        currency: event.currency ?? "BRL",
        seatingMode: "seat-map",
        publish: false,
      }),
    onMutate: () => {
      setCatalogFeedback(null);
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["organizer", "events"] });
      setCatalogFeedback(
        response.alreadyImported
          ? "Evento ja estava importado como rascunho."
          : "Evento importado como rascunho.",
      );
      navigate(routes.organizerDashboard);
    },
    onError: (error) => {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        setCatalogFeedback("Sessao expirada. Entre novamente como organizador para importar.");
        navigate(routes.login);
        return;
      }

      setCatalogFeedback(
        error instanceof Error ? error.message : "Nao foi possivel importar o evento.",
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

  function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setManualFeedback(null);

    const formData = new FormData(event.currentTarget);
    createMutation.mutate({
      source: "manual",
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      about: String(formData.get("about") ?? ""),
      imageUrl: String(formData.get("imageUrl") ?? "") || undefined,
      venueName: String(formData.get("venueName") ?? ""),
      address: String(formData.get("address") ?? ""),
      city: String(formData.get("city") ?? ""),
      date: String(formData.get("date") ?? ""),
      time: String(formData.get("time") ?? ""),
      capacity: Number(formData.get("capacity") ?? 100),
      price: Number(formData.get("price") ?? 0),
      currency: "BRL",
      seatingMode: "seat-map",
      category: String(formData.get("category") ?? ""),
    });
  }

  return (
    <section className="app-screen organizer-form-screen">
      <header className="lime-page-header organizer-hero">
        <h1>Criar evento</h1>
        <p>Busque na Ticketmaster ou crie manualmente quando o catalogo nao resolver.</p>
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
              {catalogResults.map((event) => {
                const isImportingThisEvent =
                  importMutation.isPending &&
                  importMutation.variables?.externalId === event.externalId;

                return (
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
                      aria-busy={isImportingThisEvent}
                      disabled={importMutation.isPending}
                      onClick={() => importMutation.mutate(event)}
                    >
                      {isImportingThisEvent ? "Importando..." : "Importar"}
                    </button>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>

        <section className="panel manual-event-panel organizer-card">
          <div className="organizer-card-heading">
            <span className="panel-icon">
              <ImagePlus size={20} aria-hidden="true" />
            </span>
            <div>
              <span className="app-pill">Rascunho</span>
              <h2>Criar manualmente</h2>
            </div>
          </div>
          <form className="stacked-form organizer-manual-form" onSubmit={handleManualSubmit}>
            <Input label="Titulo" name="title" placeholder="Nome do evento" required />
            <Input label="Descricao curta" name="description" placeholder="Resumo para cards" />
            <Input label="Sobre" name="about" placeholder="Descricao maior do evento" />
            <Input label="Imagem" name="imageUrl" placeholder="https://..." />
            <Input label="Local" name="venueName" placeholder="Nome do local" required />
            <Input label="Endereco" name="address" placeholder="Rua, numero" />
            <Input label="Cidade" name="city" placeholder="Sao Paulo" />
            <Input label="Categoria" name="category" placeholder="Shows, Teatro, Art" />
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
            <Input label="Data" name="date" type="date" required />
            <Input label="Horario" name="time" type="time" required />
            <Input label="Capacidade" name="capacity" type="number" min="1" defaultValue={100} />
            <Input label="Preco" name="price" type="number" min="0" step="0.01" required />
            <Button disabled={createMutation.isPending}>
              {createMutation.isPending ? "Salvando..." : "Salvar rascunho"}
            </Button>
          </form>
        </section>
      </div>

      {manualFeedback ? <p className="form-feedback">{manualFeedback}</p> : null}
    </section>
  );
}
