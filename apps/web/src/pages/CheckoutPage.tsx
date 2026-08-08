import { CreditCard, Sofa } from "lucide-react";
import { Button } from "@/shared/components/Button";

const seats = ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "C4"];

export function CheckoutPage() {
  return (
    <section className="stack">
      <div className="page-heading">
        <span className="eyebrow">Checkout</span>
        <h1>Escolha de assento e pagamento</h1>
        <p>Placeholder do fluxo critico: selecionar lugar, revisar compra e simular pagamento.</p>
      </div>

      <div className="checkout-layout">
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

        <aside className="summary-panel">
          <h2>Resumo</h2>
          <p>Evento: Rock Night Live</p>
          <p>Assento: B2</p>
          <p>Total: R$ 120,00</p>
          <Button>
            <CreditCard size={18} aria-hidden="true" />
            Simular pagamento aprovado
          </Button>
          <Button variant="secondary">Simular pagamento recusado</Button>
        </aside>
      </div>
    </section>
  );
}
