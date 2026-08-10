import { BadgeCheck, CalendarDays, Plus, Ticket, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { routes } from "@/shared/constants/routes";

export function OrganizerDashboardPage() {
  return (
    <section className="app-screen organizer-screen">
      <header className="blue-page-header">
        <div>
          <span className="eyebrow">Organizador</span>
          <h1>Painel de eventos</h1>
          <p>Acompanhe publicacoes, disponibilidade e validacoes.</p>
        </div>
        <Link className="button button-primary" to={routes.organizerNewEvent}>
          <Plus size={18} aria-hidden="true" />
          Novo evento
        </Link>
      </header>

      <div className="metric-grid">
        <article className="metric-card">
          <CalendarDays size={20} aria-hidden="true" />
          <strong>3</strong>
          <span>eventos publicados</span>
        </article>
        <article className="metric-card">
          <Ticket size={20} aria-hidden="true" />
          <strong>157</strong>
          <span>ingressos vendidos</span>
        </article>
        <article className="metric-card">
          <TrendingUp size={20} aria-hidden="true" />
          <strong>71%</strong>
          <span>ocupacao media</span>
        </article>
      </div>

      <div className="organizer-event-list">
        {["Neon Brush", "Glass House", "Dawn Ballet"].map((event, index) => (
          <article className="organizer-event-row" key={event}>
            <div>
              <span className="app-pill">{index === 0 ? "Hoje" : "Publicado"}</span>
              <strong>{event}</strong>
              <p>{index === 0 ? "84/120 lugares disponiveis" : "Vendas abertas"}</p>
            </div>
            <BadgeCheck size={22} aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  );
}
