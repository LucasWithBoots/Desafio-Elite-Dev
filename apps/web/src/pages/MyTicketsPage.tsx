import { CalendarDays, MapPin, QrCode, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { useMyTickets } from "@/features/tickets/hooks/useMyTickets";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { routes, ticketDetailsPath } from "@/shared/constants/routes";
import { formatDateTime } from "@/shared/lib/formatters";

export function MyTicketsPage() {
  const { data: tickets, isLoading, error } = useMyTickets();

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <EmptyState
        title="Entre para ver seus ingressos"
        description="Use o perfil de cliente para acessar a carteira de ingressos."
        action={
          <Link className="button button-primary" to={routes.login}>
            Entrar
          </Link>
        }
      />
    );
  }

  if (!tickets?.length) {
    return (
      <EmptyState
        title="Nenhum ingresso ainda"
        description="Quando uma compra for aprovada, o ingresso aparece aqui."
      />
    );
  }

  return (
    <section className="app-screen my-tickets-screen">
      <header className="lime-page-header">
        <span className="eyebrow">Minha area</span>
        <h1>Meus ingressos</h1>
        <p>Acesse o QR, codigo manual e link compartilhavel.</p>
      </header>

      <div className="ticket-list">
        {tickets.map((ticket) => (
          <Link
            className={`ticket-wallet-card ${ticket.status !== "active" ? "ticket-wallet-card-muted" : ""}`}
            key={ticket.id}
            to={ticketDetailsPath(ticket.id)}
          >
            <div className="ticket-wallet-art">
              <Ticket size={26} aria-hidden="true" />
            </div>
            <div className="ticket-wallet-content">
              <span className="app-pill">{getStatusLabel(ticket.status)}</span>
              <h2>{ticket.event.title}</h2>
              <p>
                <CalendarDays size={14} aria-hidden="true" />
                {formatDateTime(ticket.event.startsAt)}
              </p>
              <p>
                <MapPin size={14} aria-hidden="true" />
                {ticket.event.venueName}
              </p>
            </div>
            <QrCode className="ticket-wallet-qr" size={34} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function getStatusLabel(status: string) {
  const labels = {
    active: "Ativo",
    used: "Utilizado",
    cancelled: "Cancelado",
  } as const;

  return labels[status as keyof typeof labels] ?? status;
}
