import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { routes } from "@/shared/constants/routes";

export function OrganizerDashboardPage() {
  return (
    <section className="stack">
      <div className="page-heading page-heading-row">
        <div>
          <span className="eyebrow">Organizador</span>
          <h1>Painel de eventos</h1>
          <p>Area para acompanhar eventos publicados, rascunhos, lotacao e vendas.</p>
        </div>
        <Link className="button button-primary" to={routes.organizerNewEvent}>
          <Plus size={18} aria-hidden="true" />
          Novo evento
        </Link>
      </div>

      <div className="table-like">
        <div className="table-row table-head">
          <span>Evento</span>
          <span>Status</span>
          <span>Disponibilidade</span>
        </div>
        <div className="table-row">
          <span>Rock Night Live</span>
          <span>Publicado</span>
          <span>84/120</span>
        </div>
        <div className="table-row">
          <span>Indie Session</span>
          <span>Publicado</span>
          <span>32/80</span>
        </div>
      </div>
    </section>
  );
}
