import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CreditCard,
  MapPin,
  ShieldCheck,
  Sofa,
} from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { checkoutService } from "@/features/checkout/services/checkoutService";
import { useEvent } from "@/features/event-catalog/hooks/useEvent";
import { useEventSeats } from "@/features/event-catalog/hooks/useEventSeats";
import { EmptyState } from "@/shared/components/EmptyState";
import { LoadingState } from "@/shared/components/LoadingState";
import { eventDetailsPath, ticketDetailsPath } from "@/shared/constants/routes";
import { formatCurrency, formatDateTime } from "@/shared/lib/formatters";

export function CheckoutPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSeatId, setSelectedSeatId] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { data: event, isLoading: isEventLoading } = useEvent(eventId);
  const { data: seats = [], isLoading: isSeatsLoading } = useEventSeats(eventId);

  const availableSeats = useMemo(
    () => seats.filter((seat) => seat.status === "available"),
    [seats],
  );
  const selectedSeat =
    seats.find((seat) => seat.id === selectedSeatId) ?? availableSeats[0];
  const effectiveSeatId =
    event?.seatingMode === "seat-map" ? selectedSeat?.id : undefined;
  const total = event ? event.price * quantity : 0;

  const paymentMutation = useMutation({
    mutationFn: async (approved: boolean) => {
      if (!event) {
        throw new Error("Evento nao encontrado");
      }

      const reservation = await checkoutService.createReservation({
        eventId: event.id,
        seatId: effectiveSeatId,
        quantity,
      });

      return checkoutService.simulatePayment({
        reservationId: reservation.id,
        approved,
      });
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });

      if (result.ticket) {
        navigate(ticketDetailsPath(result.ticket.id));
        return;
      }

      setFeedback("Pagamento recusado. A reserva foi cancelada e o assento voltou a ficar disponivel.");
    },
    onError: (error) => {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel finalizar a compra.");
    },
  });

  if (isEventLoading || isSeatsLoading) {
    return <LoadingState />;
  }

  if (!event) {
    return (
      <EmptyState
        title="Evento nao encontrado"
        description="Volte para os eventos publicados e tente novamente."
      />
    );
  }

  const isSeatMap = event.seatingMode === "seat-map";
  const canPay = !paymentMutation.isPending && (!isSeatMap || Boolean(effectiveSeatId));

  return (
    <section className="app-screen checkout-screen">
      <header className="compact-header">
        <Link className="round-action" to={eventDetailsPath(event.id)} aria-label="Voltar">
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <strong>Pagamento</strong>
        <span />
      </header>

      <div className="payment-hero">
        <span className="app-pill app-pill-blue">
          {isSeatMap ? selectedSeat?.label ?? "Escolha um assento" : `${quantity} ingresso`}
        </span>
        <strong>{formatCurrency(total, event.currency)}</strong>
      </div>

      <div className="checkout-flow">
        <section className="seat-map" aria-label="Mapa de assentos">
          <div className="screen">{isSeatMap ? "Palco" : "Entrada geral"}</div>

          {isSeatMap ? (
            <div className="seat-grid seat-grid-dynamic">
              {seats.map((seat) => {
                const sold = seat.status === "sold" || seat.status === "reserved";
                const selected = seat.id === effectiveSeatId;

                return (
                  <button
                    className={`seat ${sold ? "seat-sold" : ""} ${selected ? "seat-selected" : ""}`}
                    disabled={sold || paymentMutation.isPending}
                    key={seat.id}
                    type="button"
                    aria-label={`Assento ${seat.label}`}
                    onClick={() => setSelectedSeatId(seat.id)}
                  >
                    <Sofa size={18} aria-hidden="true" />
                    <span>{seat.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="quantity-picker" aria-label="Quantidade de ingressos">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(current - 1, 1))}
                disabled={paymentMutation.isPending}
              >
                -
              </button>
              <strong>{quantity}</strong>
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => Math.min(current + 1, event.availableTickets))
                }
                disabled={paymentMutation.isPending || quantity >= event.availableTickets}
              >
                +
              </button>
            </div>
          )}
        </section>

        <aside className="summary-panel payment-card">
          <h2>Resumo</h2>
          <div className="payment-summary-line">
            <CalendarDays size={17} aria-hidden="true" />
            <span>{formatDateTime(event.startsAt)}</span>
          </div>
          <div className="payment-summary-line">
            <MapPin size={17} aria-hidden="true" />
            <span>{event.venueName}</span>
          </div>
          <div className="payment-summary-line">
            <Sofa size={17} aria-hidden="true" />
            <span>{isSeatMap ? selectedSeat?.label ?? "Sem assento disponivel" : `${quantity} ingresso(s)`}</span>
          </div>
        </aside>

        <section className="payment-methods" aria-labelledby="payment-title">
          <h2 id="payment-title">Forma de pagamento</h2>
          <button type="button" disabled>
            <CreditCard size={18} aria-hidden="true" />
            <span>Cartao de teste aprovado</span>
            <Check size={18} aria-hidden="true" />
          </button>
          <ButtonLike
            disabled={!canPay}
            onClick={() => paymentMutation.mutate(false)}
          >
            <ShieldCheck size={18} aria-hidden="true" />
            <span>Simular recusa</span>
          </ButtonLike>
          <ButtonLike
            className="button button-primary"
            disabled={!canPay}
            onClick={() => paymentMutation.mutate(true)}
          >
            <CreditCard size={18} aria-hidden="true" />
            {paymentMutation.isPending ? "Processando..." : "Simular pagamento aprovado"}
          </ButtonLike>
          {feedback ? <p className="form-feedback">{feedback}</p> : null}
        </section>
      </div>
    </section>
  );
}

interface ButtonLikeProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

function ButtonLike({ className = "", ...props }: ButtonLikeProps) {
  return <button className={className} type="button" {...props} />;
}
