import { QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { ticketDetailsPath } from "@/shared/constants/routes";

export function MyTicketsPage() {
  return (
    <section className="stack">
      <div className="page-heading">
        <span className="eyebrow">Cliente</span>
        <h1>Meus ingressos</h1>
        <p>Area para listar ingressos comprados, abrir QR Code e copiar link compartilhavel.</p>
      </div>

      <article className="ticket-card">
        <div className="qr-placeholder" aria-hidden="true">
          <QrCode size={72} />
        </div>
        <div>
          <BadgeLike>Ativo</BadgeLike>
          <h2>Rock Night Live</h2>
          <p>12 set. 2026, 21:00 - Arena Centro - Assento B2</p>
          <Link className="button button-primary" to={ticketDetailsPath("tck_demo")}>
            Abrir ingresso
          </Link>
        </div>
      </article>
    </section>
  );
}

function BadgeLike({ children }: { children: string }) {
  return <span className="badge badge-success">{children}</span>;
}
