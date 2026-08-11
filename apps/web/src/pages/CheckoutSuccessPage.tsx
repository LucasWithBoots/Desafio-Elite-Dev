import { ArrowLeft, Ticket } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { routes } from "@/shared/constants/routes";

interface CheckoutSuccessState {
  ticketCount?: number;
}

export function CheckoutSuccessPage() {
  const location = useLocation();
  const ticketCount = getTicketCount(location.state);
  const message =
    ticketCount === 1
      ? "Seu ingresso foi emitido e ja esta disponivel na area de tickets."
      : "Seus ingressos foram emitidos e ja estao disponiveis na area de tickets.";

  return (
    <section className="app-screen checkout-success-screen" aria-labelledby="checkout-success-title">
      <div className="checkout-success-content">
        <div className="checkout-success-confetti" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>

        <div className="checkout-success-heart" aria-hidden="true">
          <span />
        </div>

        <div className="checkout-success-copy">
          <h1 id="checkout-success-title">Pagamento aprovado!</h1>
          <p>{message}</p>
        </div>
      </div>

      <div className="checkout-success-actions" aria-label="Acoes apos pagamento">
        <Link className="button button-secondary checkout-success-button" to={routes.events}>
          <ArrowLeft size={18} aria-hidden="true" />
          Home
        </Link>
        <Link className="button button-primary checkout-success-button" to={routes.myTickets}>
          <Ticket size={18} aria-hidden="true" />
          Ver tickets
        </Link>
      </div>
    </section>
  );
}

function getTicketCount(state: unknown) {
  const successState = state as CheckoutSuccessState | null;

  if (typeof successState?.ticketCount !== "number" || successState.ticketCount < 1) {
    return 1;
  }

  return successState.ticketCount;
}
