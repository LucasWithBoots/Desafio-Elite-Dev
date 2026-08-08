import { Copy, QrCode } from "lucide-react";
import { Button } from "@/shared/components/Button";

export function TicketDetailsPage() {
  return (
    <section className="ticket-detail">
      <div className="page-heading">
        <span className="eyebrow">Ingresso</span>
        <h1>Rock Night Live</h1>
        <p>QR Code assinado, codigo manual e link compartilhavel ficam concentrados aqui.</p>
      </div>

      <div className="qr-panel">
        <QrCode size={180} aria-label="QR Code do ingresso" />
        <strong>ELITE-TCK-DEMO-2026</strong>
        <Button variant="secondary">
          <Copy size={18} aria-hidden="true" />
          Copiar link
        </Button>
      </div>
    </section>
  );
}
