import { ArrowLeft, CalendarDays, Copy, MapPin } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTicket } from "@/features/tickets/hooks/useTicket";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { routes } from "@/shared/constants/routes";
import { formatDateTime } from "@/shared/lib/formatters";

export function TicketDetailsPage() {
  const { ticketId } = useParams();
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const { data: ticket, isLoading, error } = useTicket(ticketId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !ticket) {
    return (
      <EmptyState
        title="Ingresso nao encontrado"
        description="Entre com o perfil correto ou abra um ingresso existente."
        action={
          <Link className="button button-primary" to={routes.myTickets}>
            Ver meus ingressos
          </Link>
        }
      />
    );
  }

  async function copyShareLink() {
    if (!ticket?.shareUrl) {
      return;
    }

    await navigator.clipboard.writeText(ticket.shareUrl);
    setCopyFeedback("Link copiado.");
  }

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
          <span className="app-pill app-pill-blue">
            {ticket.seat?.label ? `Assento ${ticket.seat.label}` : "Entrada geral"}
          </span>
          <h1>{ticket.event.title}</h1>
          <strong>{getStatusLabel(ticket.status)}</strong>
        </div>

        <div className="ticket-pass-body">
          <div className="ticket-pass-meta">
            <p>
              <MapPin size={15} aria-hidden="true" />
              {ticket.event.venueName}
            </p>
            <p>
              <CalendarDays size={15} aria-hidden="true" />
              {formatDateTime(ticket.event.startsAt)}
            </p>
          </div>

          <div className="qr-panel ticket-qr-panel">
            <QRCodeSVG
              value={ticket.qrPayload}
              size={152}
              bgColor="#ffffff"
              fgColor="#111111"
              level="M"
              aria-label="QR Code do ingresso"
            />
            <div className="ticket-manual-code">
              <span>Codigo manual</span>
              <strong>{ticket.code}</strong>
            </div>
          </div>

          <div className="barcode-strip" aria-hidden="true">
            <span />
          </div>
        </div>
      </div>

      <Button variant="secondary" onClick={copyShareLink}>
        <Copy size={18} aria-hidden="true" />
        Copiar link compartilhavel
      </Button>
      {copyFeedback ? <p className="form-feedback">{copyFeedback}</p> : null}
    </section>
  );
}

function getStatusLabel(status: string) {
  const labels = {
    active: "Ativo",
    used: "Utilizado",
    cancelled: "Cancelado",
  } as const;

  return labels[status as keyof typeof labels] ?? status;
}
