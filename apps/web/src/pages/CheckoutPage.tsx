import { ArrowLeft, CalendarDays, Check, CreditCard, MapPin, ShieldCheck, Sofa } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/Button";
import { routes } from "@/shared/constants/routes";

const seats = ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "C4"];

export function CheckoutPage() {
  return (
    <section className="app-screen checkout-screen">
      <header className="compact-header">
        <Link className="round-action" to={routes.events} aria-label="Voltar">
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <strong>Pagamento</strong>
        <span />
      </header>

      <div className="payment-hero">
        <span className="app-pill app-pill-blue">1 ingresso</span>
        <strong>R$ 120,00</strong>
      </div>

      <div className="checkout-flow">
        <section className="seat-map" aria-label="Mapa de assentos">
          <div className="screen">Palco</div>
          <div className="seat-grid">
            {seats.map((seat, index) => {
              const sold = index === 2 || index === 7;
              const selected = index === 5;

              return (
                <button
                  className={`seat ${sold ? "seat-sold" : ""} ${selected ? "seat-selected" : ""}`}
                  disabled={sold}
                  key={seat}
                  type="button"
                  aria-label={`Assento ${seat}`}
                >
                  <Sofa size={18} aria-hidden="true" />
                  <span>{seat}</span>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="summary-panel payment-card">
          <h2>Resumo</h2>
          <div className="payment-summary-line">
            <CalendarDays size={17} aria-hidden="true" />
            <span>02 nov. 2026, 21:00</span>
          </div>
          <div className="payment-summary-line">
            <MapPin size={17} aria-hidden="true" />
            <span>Novotel Music City</span>
          </div>
          <div className="payment-summary-line">
            <Sofa size={17} aria-hidden="true" />
            <span>Assento B2</span>
          </div>
        </aside>

        <section className="payment-methods" aria-labelledby="payment-title">
          <h2 id="payment-title">Forma de pagamento</h2>
          <button type="button">
            <CreditCard size={18} aria-hidden="true" />
            <span>Cartao de teste aprovado</span>
            <Check size={18} aria-hidden="true" />
          </button>
          <button type="button">
            <ShieldCheck size={18} aria-hidden="true" />
            <span>Simular recusa</span>
          </button>
          <Button>
            <CreditCard size={18} aria-hidden="true" />
            Simular pagamento aprovado
          </Button>
        </section>
      </div>
    </section>
  );
}
