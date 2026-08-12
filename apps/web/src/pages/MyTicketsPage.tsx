import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMyTickets } from "@/features/tickets/hooks/useMyTickets";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { routes, ticketDetailsPath } from "@/shared/constants/routes";

type TicketTab = "active" | "used";

export function MyTicketsPage() {
  const [selectedTab, setSelectedTab] = useState<TicketTab>("active");
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

  const activeTickets = tickets.filter((ticket) => ticket.status === "active");
  const usedTickets = tickets.filter((ticket) => ticket.status !== "active");
  const visibleTickets = selectedTab === "active" ? activeTickets : usedTickets;

  return (
    <section className="app-screen my-tickets-screen">
      <header className="compact-header lime-compact-header my-tickets-header">
        <span />
        <strong>Tickets</strong>
        <span />
      </header>

      <div className="ticket-tabs" role="tablist" aria-label="Filtrar ingressos">
        <button
          className={`ticket-tab-button${selectedTab === "active" ? " ticket-tab-button-active" : ""}`}
          type="button"
          role="tab"
          aria-selected={selectedTab === "active"}
          onClick={() => setSelectedTab("active")}
        >
          Ativos
        </button>
        <button
          className={`ticket-tab-button${selectedTab === "used" ? " ticket-tab-button-active" : ""}`}
          type="button"
          role="tab"
          aria-selected={selectedTab === "used"}
          onClick={() => setSelectedTab("used")}
        >
          Usados
        </button>
      </div>

      {visibleTickets.length ? (
        <div className="ticket-list">
          {visibleTickets.map((ticket) => (
            <Link
              className={`ticket-wallet-card ticket-wallet-card-${ticket.status}`}
              key={ticket.id}
              to={ticketDetailsPath(ticket.id)}
            >
              <div className="ticket-wallet-cover">
                {ticket.event.imageUrl ? (
                  <img src={ticket.event.imageUrl} alt="" />
                ) : (
                  <Ticket size={28} aria-hidden="true" />
                )}
              </div>
              <div className="ticket-wallet-content">
                <h2>{ticket.event.title}</h2>
                <p>
                  <MapPin size={13} aria-hidden="true" />
                  {ticket.event.venueName}
                </p>
                <p>
                  <CalendarDays size={13} aria-hidden="true" />
                  {formatWalletDate(ticket.event.startsAt)}
                </p>
                <span className="ticket-count-pill">{getTicketCountLabel(1)}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="ticket-tab-empty">
          <strong>
            {selectedTab === "active"
              ? "Nenhum ticket ativo"
              : "Nenhum ticket usado"}
          </strong>
          <p>
            {selectedTab === "active"
              ? "Os ingressos aprovados aparecem aqui antes da entrada."
              : "Depois da validacao na portaria, o ticket vem para esta aba."}
          </p>
        </div>
      )}
    </section>
  );
}

function formatWalletDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getTicketCountLabel(count: number) {
  return `${count} ${count === 1 ? "ticket" : "tickets"}`;
}
