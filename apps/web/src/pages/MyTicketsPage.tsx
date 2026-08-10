import { CalendarDays, MapPin, QrCode, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { ticketDetailsPath } from "@/shared/constants/routes";

export function MyTicketsPage() {
  return (
    <section className="app-screen my-tickets-screen">
      <header className="lime-page-header">
        <span className="eyebrow">Minha area</span>
        <h1>Meus ingressos</h1>
        <p>Acesse o QR, codigo manual e link compartilhavel.</p>
      </header>

      <div className="ticket-list">
        <Link className="ticket-wallet-card" to={ticketDetailsPath("tck_demo")}>
          <div className="ticket-wallet-art">
            <Ticket size={26} aria-hidden="true" />
          </div>
          <div>
            <span className="app-pill">Ativo</span>
            <h2>Neon Brush</h2>
            <p>
              <CalendarDays size={14} aria-hidden="true" />
              02 nov. 2026, 21:00
            </p>
            <p>
              <MapPin size={14} aria-hidden="true" />
              Novotel Music City
            </p>
          </div>
          <QrCode size={44} aria-hidden="true" />
        </Link>

        <article className="ticket-wallet-card ticket-wallet-card-muted">
          <div className="ticket-wallet-art ticket-wallet-art-blue">
            <Ticket size={26} aria-hidden="true" />
          </div>
          <div>
            <span className="app-pill app-pill-blue">Compartilhado</span>
            <h2>Glass House</h2>
            <p>
              <CalendarDays size={14} aria-hidden="true" />
              12 dez. 2026, 19:30
            </p>
            <p>
              <MapPin size={14} aria-hidden="true" />
              Teatro Luz
            </p>
          </div>
          <QrCode size={44} aria-hidden="true" />
        </article>
      </div>
    </section>
  );
}
