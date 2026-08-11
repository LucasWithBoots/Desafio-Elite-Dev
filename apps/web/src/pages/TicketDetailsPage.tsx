import { ArrowLeft, CalendarDays, Clock, Copy, MapPin, QrCode } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTicket } from "@/features/tickets/hooks/useTicket";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { routes } from "@/shared/constants/routes";
import { formatCurrency } from "@/shared/lib/formatters";

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

  const isTicketUsed = ticket.status === "used";

  return (
    <section className="app-screen ticket-detail-screen">
      <header className="compact-header lime-compact-header">
        <Link className="round-action" to={routes.myTickets} aria-label="Voltar">
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <strong>Tickets</strong>
        <span />
      </header>

      <div className="ticket-pass">
        <div className="ticket-pass-cover">
          {ticket.event.imageUrl ? (
            <img src={ticket.event.imageUrl} alt="" />
          ) : (
            <div className="ticket-pass-cover-fallback" aria-hidden="true">
              <QrCode size={54} />
            </div>
          )}
          <span className={`ticket-status-pill ticket-status-${ticket.status}`}>
            {getStatusLabel(ticket.status)}
          </span>
          <div className="ticket-pass-cover-copy">
            <h1>{ticket.event.title}</h1>
            <p>
              <MapPin size={14} aria-hidden="true" />
              {ticket.event.venueName}
            </p>
          </div>
        </div>

        <div className="ticket-pass-body">
          <div className="ticket-info-grid" aria-label="Informacoes do ingresso">
            <TicketInfoItem label="Data" value={formatTicketDate(ticket.event.startsAt)} icon={CalendarDays} />
            <TicketInfoItem label="Horario" value={formatTicketTime(ticket.event.startsAt)} icon={Clock} />
            <TicketInfoItem
              label="Valor"
              value={formatCurrency(ticket.event.price, ticket.event.currency)}
            />
            <TicketInfoItem label="Setor" value="Principal" />
            <TicketInfoItem label="Fila" value={ticket.seat?.row ?? "-"} />
            <TicketInfoItem label="Assento" value={ticket.seat?.number ? String(ticket.seat.number) : "Livre"} />
          </div>

          <div className={`ticket-qr-section${isTicketUsed ? " ticket-qr-section-used" : ""}`}>
            <div className="ticket-qr-code">
              <QRCodeSVG
                value={ticket.qrPayload}
                size={176}
                bgColor="#ffffff"
                fgColor="#111111"
                level="M"
                aria-label="QR Code do ingresso"
              />
            </div>
            {isTicketUsed ? (
              <strong className="ticket-used-message">Ingresso ja utilizado</strong>
            ) : (
              <div className="ticket-manual-code">
                <span>Codigo manual</span>
                <strong>{ticket.code}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {isTicketUsed ? null : (
        <Button variant="secondary" onClick={copyShareLink}>
          <Copy size={18} aria-hidden="true" />
          Copiar link compartilhavel
        </Button>
      )}
      {copyFeedback ? <p className="form-feedback">{copyFeedback}</p> : null}
    </section>
  );
}

interface TicketInfoItemProps {
  label: string;
  value: string;
  icon?: LucideIcon;
}

function TicketInfoItem({ label, value, icon: Icon }: TicketInfoItemProps) {
  return (
    <div className="ticket-info-item">
      <span>
        {Icon ? <Icon size={13} aria-hidden="true" /> : null}
        {label}
      </span>
      <strong>{value}</strong>
    </div>
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

function formatTicketDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function formatTicketTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
