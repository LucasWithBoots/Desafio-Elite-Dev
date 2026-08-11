import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ImagePlus, MapPin, Search } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventManagementService } from "@/features/event-management/services/eventManagementService";
import type { TicketmasterCatalogItem } from "@/features/event-management/types";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { routes } from "@/shared/constants/routes";
import { formatCurrency, formatDateTime } from "@/shared/lib/formatters";

export function OrganizerEventFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [catalogResults, setCatalogResults] = useState<TicketmasterCatalogItem[]>([]);

  const searchMutation = useMutation({
    mutationFn: eventManagementService.searchTicketmasterEvents,
    onSuccess: (response) => {
      setCatalogResults(response.items);
      setFeedback(response.items.length ? null : "Nenhum evento encontrado na Ticketmaster.");
    },
    onError: (error) => {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel buscar no catalogo.");
    },
  });

  const createMutation = useMutation({
    mutationFn: eventManagementService.createEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organizer", "events"] });
      navigate(routes.organizerDashboard);
    },
    onError: (error) => {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel criar o evento.");
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
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["organizer", "events"] });
      setFeedback(
        response.alreadyImported
          ? "Evento ja estava importado como rascunho."
          : "Evento importado como rascunho.",
      );
      navigate(routes.organizerDashboard);
    },
    onError: (error) => {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel importar o evento.");
    },
  });

  function handleCatalogSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (keyword.trim()) {
      searchMutation.mutate(keyword.trim());
    }
  }

  function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
      <header className="blue-page-header">
        <span className="eyebrow">Organizador</span>
        <h1>Criar evento</h1>
        <p>Busque na Ticketmaster ou crie manualmente quando o catalogo nao resolver.</p>
      </header>

      <div className="form-layout">
        <section className="panel catalog-panel">
          <span className="panel-icon">
            <Search size={20} aria-hidden="true" />
          </span>
          <h2>Buscar no catalogo</h2>
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
                    disabled={importMutation.isPending}
                    onClick={() => importMutation.mutate(event)}
                  >
                    Importar
                  </button>
                </article>
              ))}
            </div>
          ) : null}
        </section>

        <section className="panel manual-event-panel">
          <span className="panel-icon">
            <ImagePlus size={20} aria-hidden="true" />
          </span>
          <h2>Criar manualmente</h2>
          <form className="stacked-form" onSubmit={handleManualSubmit}>
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

      {feedback ? <p className="form-feedback">{feedback}</p> : null}
    </section>
  );
}
