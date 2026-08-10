import { ArrowLeft, Barcode, Copy, MapPin, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/Button";
import { routes } from "@/shared/constants/routes";

export function TicketDetailsPage() {
  return (
    <section className="app-screen ticket-detail-screen">
      <header className="compact-header lime-compact-header">
        <Link className="round-action" to={routes.myTickets} aria-label="Voltar">
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <strong>Meu ingresso</strong>
        <span />
      </header>

      <div className="ticket-pass">
        <div className="ticket-pass-hero">
          <span className="app-pill app-pill-blue">1 ingresso</span>
          <h1>Neon Brush</h1>
          <strong>R$ 120,00</strong>
        </div>

        <div className="ticket-pass-body">
          <p>
            <MapPin size={15} aria-hidden="true" />
            Novotel Music City
          </p>
          <div className="qr-panel">
            <QrCode size={160} aria-label="QR Code do ingresso" />
            <strong>ELITE-TCK-DEMO-2026</strong>
          </div>
          <div className="barcode-strip" aria-hidden="true">
            <Barcode size={220} />
          </div>
        </div>
      </div>

      <Button variant="secondary">
        <Copy size={18} aria-hidden="true" />
        Copiar link compartilhavel
      </Button>
    </section>
  );
}
