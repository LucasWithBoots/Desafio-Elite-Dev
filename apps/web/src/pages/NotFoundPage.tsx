import { Link } from "react-router-dom";
import { routes } from "@/shared/constants/routes";

export function NotFoundPage() {
  return (
    <section className="empty-state">
      <h1>Pagina nao encontrada</h1>
      <p>Volte para a lista de eventos para continuar o fluxo principal.</p>
      <Link className="button button-primary" to={routes.events}>
        Ver eventos
      </Link>
    </section>
  );
}
