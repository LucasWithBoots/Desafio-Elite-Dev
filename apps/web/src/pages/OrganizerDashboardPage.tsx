import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, CalendarDays, Plus, Ticket, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { eventManagementService } from "@/features/event-management/services/eventManagementService";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { routes } from "@/shared/constants/routes";

export function OrganizerDashboardPage() {
  const queryClient = useQueryClient();
  const { data: events, isLoading, error } = useQuery({
    queryKey: ["organizer", "events"],
    queryFn: eventManagementService.listOrganizerEvents,
  });
  const publishMutation = useMutation({
    mutationFn: eventManagementService.publishEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organizer", "events"] }),
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <EmptyState
        title="Entre como organizador"
        description="Use o perfil de organizador para ver e gerenciar seus eventos."
        action={
          <Link className="button button-primary" to={routes.login}>
            Entrar
          </Link>
        }
      />
    );
  }

  const publishedEvents = events?.filter((event) => event.status === "published") ?? [];
  const soldTickets =
    events?.reduce(
      (total, event) => total + Math.max(event.capacity - event.availableTickets, 0),
      0,
    ) ?? 0;
  const occupancy =
    events?.length && events.reduce((total, event) => total + event.capacity, 0) > 0
      ? Math.round(
          (soldTickets /
            events.reduce((total, event) => total + event.capacity, 0)) *
            100,
        )
      : 0;

  return (
    <section className="app-screen organizer-screen">
      <header className="blue-page-header">
        <div>
          <span className="eyebrow">Organizador</span>
          <h1>Perfil do organizador</h1>
          <p>Veja seus eventos, acompanhe disponibilidade e crie novas publicacoes.</p>
        </div>
        <Link className="button button-primary" to={routes.organizerNewEvent}>
          <Plus size={18} aria-hidden="true" />
          Novo evento
        </Link>
      </header>

      <div className="metric-grid">
        <article className="metric-card">
          <CalendarDays size={20} aria-hidden="true" />
          <strong>{publishedEvents.length}</strong>
          <span>eventos publicados</span>
        </article>
        <article className="metric-card">
          <Ticket size={20} aria-hidden="true" />
          <strong>{soldTickets}</strong>
          <span>ingressos vendidos</span>
        </article>
        <article className="metric-card">
          <TrendingUp size={20} aria-hidden="true" />
          <strong>{occupancy}%</strong>
          <span>ocupacao media</span>
        </article>
      </div>

      <div className="organizer-event-list">
        {events?.map((event) => (
          <article className="organizer-event-row" key={event.id}>
            <div>
              <span className="app-pill">{getStatusLabel(event.status)}</span>
              <strong>{event.title}</strong>
              <p>
                {event.availableTickets}/{event.capacity} lugares disponiveis
              </p>
            </div>
            {event.status === "draft" ? (
              <button
                className="icon-text-button"
                type="button"
                disabled={publishMutation.isPending}
                onClick={() => publishMutation.mutate(event.id)}
              >
                Publicar
              </button>
            ) : (
              <BadgeCheck size={22} aria-hidden="true" />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function getStatusLabel(status: string) {
  const labels = {
    draft: "Rascunho",
    published: "Publicado",
    "sold-out": "Esgotado",
    cancelled: "Cancelado",
    finished: "Finalizado",
  } as const;

  return labels[status as keyof typeof labels] ?? status;
}
